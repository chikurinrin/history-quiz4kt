'use strict';

const GRADUATE_AT = 3;            // ○が何回連続で「卒業」か
const INTERVAL_DAYS = [1, 3];     // 1回目の○→翌日、2回目の○→3日後、3回目の○で卒業
const DAY_MS = 86400000;
const INDEX_KEY = 'yt-drill:index';
const dataKey = id => `yt-drill:${id}`;

let player = null;                // YouTube プレーヤー
let apiReady = false;
let pendingVideoId = null;        // API 準備前に読み込まれた動画
let state = null;                 // 画面に表示中の動画の記録 { videoId, marks: [...] }
let currentVideoId = null;        // プレーヤーに実際に載っている動画（復習中は state と異なることがある）
let segTimer = null;              // 区間再生の監視タイマー
let lastMarkId = null;            // 「答えの位置を直す」の設定先（直前に記録・再生した問題）
let lastBoundary = null;          // 学習モードで最後に○/✕を押した位置＝次の問題の開始。シークしたら無効

// mark = { id, start, dur, qEnd, memo, streak, due }
//   qEnd: 問題が終わり答えが始まる位置（秒・絶対値）。null なら区間を通しで再生
//   due:  次に出題してよい日時（ms）。0 なら今すぐ出題対象

let session = null;               // 1問ずつ○×をつける { queue: [{v, id}], pos, phase }
let auto = null;                  // 止まらずに流す連続再生 { queue: [{v, id}], pos }

const $ = id => document.getElementById(id);
const fmt = s => {
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
const mdDate = ts => { const d = new Date(ts); return `${d.getMonth() + 1}/${d.getDate()}`; };

const segEnd = m => m.start + m.dur;
const isDone = m => m.streak >= GRADUATE_AT;
const isDue = m => (m.due || 0) <= Date.now();
const hasQA = m => m.qEnd && m.qEnd > m.start + 0.5 && m.qEnd < segEnd(m);

/* ============ 保存・読み込み ============ */

const states = {};   // videoId → state。複数動画をまたぐ復習で他の動画の記録も読み書きするため

function getState(videoId) {
  if (state && state.videoId === videoId) return state;
  if (!states[videoId]) states[videoId] = load(videoId);
  return states[videoId];
}

function saveState(st) {
  localStorage.setItem(dataKey(st.videoId), JSON.stringify(st));
  const idx = loadIndex().filter(v => v.id !== st.videoId);
  idx.unshift({ id: st.videoId, n: st.marks.length, at: Date.now(), title: st.title || '' });
  // 「すべての動画からまとめて出題」はこの一覧が対象なので、多めに残す
  localStorage.setItem(INDEX_KEY, JSON.stringify(idx.slice(0, 50)));
}

// プレーヤーから動画タイトルを拾って保存する（履歴の表示用。通信は発生しない）
function captureTitle() {
  if (!player || !player.getVideoData || !currentVideoId) return;
  const d = player.getVideoData();
  if (!d || !d.title) return;
  const st = getState(currentVideoId);
  if (st.title === d.title) return;
  st.title = d.title;
  saveState(st);
  renderHistory();
  if (state && state.videoId === currentVideoId) $('video-title-label').textContent = st.title;
}

const save = () => { if (state) saveState(state); };

function loadIndex() {
  try { return JSON.parse(localStorage.getItem(INDEX_KEY)) || []; }
  catch { return []; }
}

function load(videoId) {
  try {
    const raw = localStorage.getItem(dataKey(videoId));
    if (raw) return JSON.parse(raw);
  } catch { /* 壊れていたら作り直す */ }
  return { videoId, marks: [] };
}

/* ============ 動画の読み込み ============ */

// URL・短縮URL・埋め込みURL・生のIDのいずれからでも動画IDを取り出す
function parseVideoId(input) {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function loadVideo(videoId) {
  state = getState(videoId);
  states[videoId] = state;
  lastMarkId = null;
  lastBoundary = null;
  $('player-card').classList.remove('hidden');
  $('list-card').classList.remove('hidden');
  $('loader').classList.add('hidden');   // 読み込み欄は畳んで、プレーヤーを最上部に
  $('video-title-label').textContent = state.title || videoId;

  if (!apiReady) { pendingVideoId = videoId; return; }

  if (player) { currentVideoId = videoId; player.loadVideoById(videoId); }
  else createPlayer(videoId, 0);
  render();
  renderScopeList();
}

// controls は後から変更できないので、切り替えるときはプレーヤーを作り直す
function createPlayer(videoId, startAt) {
  if (player) { player.destroy(); player = null; }

  // destroy は iframe ごと消すので <div id="player"> を作り直す（カバーは残す）
  const box = document.querySelector('.player-box');
  const old = $('player');
  if (old) old.remove();
  const div = document.createElement('div');
  div.id = 'player';
  box.insertBefore(div, box.firstChild);

  currentVideoId = videoId;
  player = new YT.Player('player', {
    videoId,
    playerVars: {
      rel: 0,
      modestbranding: 1,
      playsinline: 1,            // スマホで全画面プレーヤーに奪われると区間制御ができなくなる
      origin: location.origin,   // 省略するとYouTubeがエラー153（設定エラー）を返す
      controls: $('show-controls').checked ? 1 : 0,
      disablekb: 1,
      start: Math.floor(startAt || 0),
    },
    events: { onError: onPlayerError, onStateChange: updateCover },
  });
}

// 再生中だけ映像を見せる。止まっている間はカバーで隠し、
// YouTubeのタイトル・「後で見る」・共有・関連動画を見えなくする
function updateCover() {
  captureTitle();
  applyRate();
  const cover = $('player-cover');
  // YouTubeの操作バーを出す設定のときは、覆うと操作できなくなるのでカバーしない
  if ($('show-controls').checked) { cover.classList.add('hidden'); return; }

  const PLAYING = 1, BUFFERING = 3;
  const st = (player && player.getPlayerState) ? player.getPlayerState() : -1;
  const visible = st === PLAYING || st === BUFFERING;
  cover.classList.toggle('hidden', visible);
  if (visible) return;

  if (auto) cover.textContent = '次の問題へ…';
  else if (session && session.phase === 'answer') cover.textContent = '思い出せたら「▶ 答えを見る」を押してください';
  else if (session) cover.textContent = '答えを確認したら ○ か ✕ を選んでください';
  else cover.textContent = '▶ 再生 を押してください';
}

function toggleControls() {
  localStorage.setItem('yt-drill:controls', $('show-controls').checked ? '1' : '0');
  $('player-cover').classList.toggle('hidden', $('show-controls').checked);
  if (!player || !state) return;
  stopSegment();
  createPlayer(currentVideoId || state.videoId, player.getCurrentTime());
}

const YT_ERRORS = {
  2: '動画IDが正しくありません。',
  5: 'この動画はブラウザで再生できません。',
  100: '動画が見つかりません（削除・非公開の可能性）。',
  101: 'この動画は埋め込み再生が許可されていません。',
  150: 'この動画は埋め込み再生が許可されていません。',
  153: 'ページの配信元をYouTubeが確認できませんでした。ローカルサーバー（http://localhost:8080/）経由で開いてください。',
};

function onPlayerError(e) {
  alert(`再生エラー（コード ${e.data}）\n${YT_ERRORS[e.data] || '不明なエラーです。'}`);
}

function onYouTubeIframeAPIReady() {
  apiReady = true;
  if (pendingVideoId) { const v = pendingVideoId; pendingVideoId = null; loadVideo(v); }
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

/* ============ 区間再生 ============ */

function stopSegment() {
  if (segTimer) { clearInterval(segTimer); segTimer = null; }
}

// 指定動画の from〜to 秒だけ再生し、終わったら onEnd を呼ぶ。
// 別の動画の区間なら、その動画に切り替えてから再生する
function playClip(videoId, from, to, onEnd) {
  stopSegment();
  lastBoundary = null;   // 再生位置が飛ぶので、○/✕の区切りは無効になる
  if (videoId !== currentVideoId) {
    currentVideoId = videoId;
    player.loadVideoById({ videoId, startSeconds: from });
  } else {
    player.seekTo(from, true);
  }
  player.playVideo();

  // シーク・切替の直後は currentTime が移動前の値を返すことがあるので、
  // 一度 区間内に入った（armed）のを確認してから終端判定する
  let armed = false;
  const giveUpAt = Date.now() + (to - from + 12) * 1000;

  segTimer = setInterval(() => {
    const t = player.getCurrentTime();
    if (!armed) {
      if (t >= from - 0.6 && t < to - 0.2) armed = true;
      else if (Date.now() > giveUpAt) { stopSegment(); onEnd && onEnd(); }
      return;
    }
    if (t >= to) {
      stopSegment();
      player.pauseVideo();
      onEnd && onEnd();
    }
  }, 150);
}

function playSegment(mark, videoId, onEnd) {
  playClip(videoId || state.videoId, mark.start, segEnd(mark), onEnd);
}

// 復習を終えたら、画面表示中の動画に戻しておく（別の動画の区間を流した後のため）
function restoreVideo() {
  if (player && state && currentVideoId !== state.videoId) {
    currentVideoId = state.videoId;
    player.cueVideoById(state.videoId);
  }
}

/* ============ 学習モード ============ */

// 答えが出るたびに○か✕を押す。押した位置が「問題と問題の区切り」になるので、
// ✕のときは前回押した位置〜今回押した位置がそのまま1問の区間になる（頭出しの推測が不要）
function pressBoundary() {
  if (!player || !player.getCurrentTime) return null;
  const now = player.getCurrentTime();
  const prev = lastBoundary;
  lastBoundary = now;
  return { now, prev };
}

function flash(btn, text, restore) {
  btn.textContent = text;
  setTimeout(() => { btn.textContent = restore; }, 1200);
}

const recMode = () => document.querySelector('input[name=rec-mode]:checked').value;

// 記録方式の切り替え。boundary=全問○×（区切りベース） / simple=✕だけ（◯秒前ベース）
function applyRecMode() {
  const simple = recMode() === 'simple';
  $('ok-btn').classList.toggle('hidden', simple);
  $('hint-boundary').classList.toggle('hidden', simple);
  $('hint-simple').classList.toggle('hidden', !simple);
  $('pre-label').textContent = simple ? '問題は答えの' : '押し忘れたときは';
  localStorage.setItem('yt-drill:mode', recMode());
  lastBoundary = null;
}

function okMark() {
  if (recMode() === 'simple') return;
  const p = pressBoundary();
  if (!p) return;
  flash($('ok-btn'), `✓ 次は ${fmt(p.now)} から`, '○ 解けた');
}

function addMark() {
  const p = pressBoundary();
  if (!p) return;
  const pre = Number($('set-pre').value) || 7;
  const lag = Math.max(0, Number($('set-lag').value) || 0);
  const ansLen = Number($('set-ans').value) || 8;

  const qEnd = Math.max(0, p.now - lag);   // 答えの始まり（押した位置の少し前）
  // 全問○×方式: 前回の押下位置を問題の開始に。
  // ✕だけ方式、または区切りが無い・近すぎ・離れすぎ（押し忘れ）のときは qEnd の pre 秒前
  const usable = recMode() === 'boundary'
    && p.prev != null && qEnd - p.prev >= 1.5 && qEnd - p.prev <= 120;
  const start = usable ? p.prev : Math.max(0, qEnd - pre);

  const mark = {
    id: Date.now(),
    start,
    dur: Math.max(3, qEnd + ansLen - start),   // 区間の終わり＝答えの始まり＋流す秒数
    qEnd,
    memo: '',
    streak: 0,
    due: 0,
  };
  state.marks.push(mark);
  state.marks.sort((a, b) => a.start - b.start);
  lastMarkId = mark.id;
  save();
  render();

  flash($('mark-btn'), `✓ ${fmt(start)}〜${fmt(qEnd + ansLen)} を記録`, '✕ 解けなかった');
}

// 再生中の現在位置を「ここから答え」として直前の記録に設定する。
// 復習では問題部分だけ再生して止まり、「答えを見る」で続きが流れるようになる
function setAnswerPoint() {
  if (!player || !state) return;
  const mark = state.marks.find(m => m.id === lastMarkId);
  if (!mark) { alert('先に「✕ 間違えた」で問題を記録してください。'); return; }

  const t = player.getCurrentTime();
  if (t <= mark.start + 0.5) { alert('答えの位置は、問題の開始より後にしてください。'); return; }

  mark.qEnd = t;
  if (t >= segEnd(mark) - 1) mark.dur = Math.ceil(t - mark.start + 8);  // 答えが区間の外なら延長
  save();
  render();

  const btn = $('ans-btn');
  btn.textContent = `✓ ${fmt(t)} から答えとして設定しました`;
  setTimeout(() => { btn.textContent = '◆ 答えの位置を直す（直前の記録を再生中の現在地に）'; }, 1200);
}

/* ============ 出題対象の選定 ============ */

const shuffle = arr => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* --- 出題範囲（動画の選択） --- */

const SCOPE_KEY = 'yt-drill:scope';

// 選択候補: 記録のある全動画（表示中の動画は先頭に）。タグは各動画の記録から読む
function scopeCandidates() {
  const ids = [state.videoId, ...loadIndex().map(v => v.id).filter(id => id !== state.videoId)];
  return ids.map(id => {
    const st = getState(id);
    return { id, title: st.title || '', n: st.marks.length, tags: st.tags || [] };
  });
}

// タグをカンマ区切りで編集する（例: 理科, 中2）
function editTags(videoId) {
  const st = getState(videoId);
  const input = prompt('この動画のタグ（カンマ区切り。例: 理科, 社会）', (st.tags || []).join(', '));
  if (input === null) return;
  st.tags = [...new Set(input.split(/[,、\s]+/).map(s => s.trim()).filter(Boolean))];
  saveState(st);
  renderScopeList();
}

function loadScope() {
  try { return JSON.parse(localStorage.getItem(SCOPE_KEY)) || []; }
  catch { return []; }
}

// 選択された動画ID。保存済みの選択を候補と突き合わせ、空なら表示中の動画のみ
function selectedVideoIds() {
  const cand = scopeCandidates().map(c => c.id);
  const sel = loadScope().filter(id => cand.includes(id));
  return sel.length ? sel : [state.videoId];
}

function renderScopeList() {
  if (!state) return;
  const cands = scopeCandidates();
  const selected = selectedVideoIds();

  // タグの一括選択ボタン
  const tagBox = $('scope-tags');
  tagBox.innerHTML = '';
  const allTags = [...new Set(cands.flatMap(c => c.tags))];
  if (allTags.length) {
    const lbl = document.createElement('span');
    lbl.className = 'scope-tags-label';
    lbl.textContent = 'タグで選択:';
    tagBox.appendChild(lbl);
    allTags.forEach(tag => {
      const b = document.createElement('button');
      b.className = 'tag-btn';
      b.textContent = tag;
      b.onclick = () => {
        const ids = cands.filter(c => c.tags.includes(tag)).map(c => c.id);
        localStorage.setItem(SCOPE_KEY, JSON.stringify(ids));
        renderScopeList();
        updateDueInfo();
      };
      tagBox.appendChild(b);
    });
  }

  const box = $('scope-list');
  box.innerHTML = '';
  cands.forEach(c => {
    const label = document.createElement('label');
    label.className = 'scope-item';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = c.id;
    cb.checked = selected.includes(c.id);
    cb.onchange = () => {
      const ids = [...box.querySelectorAll('input:checked')].map(i => i.value);
      localStorage.setItem(SCOPE_KEY, JSON.stringify(ids));
      updateDueInfo();
    };
    const span = document.createElement('span');
    span.className = 'scope-name';
    span.textContent = `${c.title || c.id}（${c.n}問）${c.id === state.videoId ? ' ←表示中' : ''}`;

    label.appendChild(cb);
    label.appendChild(span);
    c.tags.forEach(t => {
      const badge = document.createElement('span');
      badge.className = 'tag-badge';
      badge.textContent = t;
      label.appendChild(badge);
    });

    const edit = document.createElement('button');
    edit.className = 'icon-btn tag-edit';
    edit.textContent = '🏷';
    edit.title = 'タグを編集';
    edit.onclick = e => { e.preventDefault(); editTags(c.id); };
    label.appendChild(edit);

    box.appendChild(label);
  });
  updateScopeSummary();
}

function updateScopeSummary() {
  const sel = selectedVideoIds();
  $('scope-summary').textContent =
    (sel.length === 1 && sel[0] === state.videoId)
      ? '出題範囲: この動画のみ'
      : `出題範囲: ${sel.length} 本の動画`;
}

// { v: videoId, m: mark } の一覧。選択された動画から集める
function collectMarks() {
  const out = [];
  selectedVideoIds().forEach(v => getState(v).marks.forEach(m => out.push({ v, m })));
  return out;
}

// 復習: 期限が来ていて未卒業のものだけ（チェックで全問に切替）
function reviewTargets() {
  const all = $('include-done').checked;
  return collectMarks().filter(({ m }) => all || (!isDone(m) && isDue(m)));
}

// 連続再生: 聞き流し用なので期限は無視し、未卒業の全問（チェックで卒業も含む）
function autoTargets() {
  const all = $('include-done').checked;
  return collectMarks().filter(({ m }) => all || !isDone(m));
}

function updateDueInfo() {
  if (!state) return;
  const nVids = selectedVideoIds().length;
  const suffix = nVids > 1 ? `（${nVids}本の動画）` : '';
  const pend = collectMarks().map(p => p.m).filter(m => !isDone(m));
  const due = pend.filter(isDue).length;
  const el = $('due-info');
  if (!pend.length) el.textContent = '復習する問題はありません（未記録、または全問卒業です）。';
  else if (due) el.textContent = `📌 今日の復習: ${due} 問${suffix}`;
  else el.textContent = `今日の復習はありません。次回は ${mdDate(Math.min(...pend.map(m => m.due || 0)))} です。`;
  updateScopeSummary();
}

/* ============ 復習モード（1問ずつ○×） ============ */

// 復習画面に出す一行。別の動画の問題なら【動画タイトル】を頭に付ける
function memoLabel(v, m) {
  const prefix = (state && v !== state.videoId)
    ? `【${getState(v).title || v}】 ` : '';
  return prefix + (m.memo || '');
}

function currentItem(sess) {
  if (!sess) return null;
  const q = sess.queue[sess.pos];
  const m = getState(q.v).marks.find(x => x.id === q.id);
  return m ? { v: q.v, m } : null;
}

function startReview() {
  const picks = reviewTargets();
  if (!picks.length) {
    alert('今日復習する問題はありません。\n「期限前・卒業済みの問題も含める」にチェックを入れると全問から出題できます。');
    return;
  }
  auto = null;
  session = { queue: shuffle(picks).map(p => ({ v: p.v, id: p.m.id })), pos: 0, phase: 'q' };
  $('review-idle').classList.add('hidden');
  $('review-result').classList.add('hidden');
  $('playall-run').classList.add('hidden');
  $('review-run').classList.remove('hidden');
  playCurrent();
}

function playCurrent() {
  const it = currentItem(session);
  if (!it) return;
  const { v, m } = it;
  session.phase = 'q';
  $('rv-ans').classList.add('hidden');
  $('review-count').textContent = `${session.pos + 1} / ${session.queue.length}`;
  $('review-memo').textContent = memoLabel(v, m);

  if (hasQA(m)) {
    // 問題部分だけ再生して止まる。答えは「答えを見る」で
    playClip(v, m.start, m.qEnd, () => {
      if (!session) return;
      session.phase = 'answer';
      $('rv-ans').classList.remove('hidden');
      updateCover();
    });
  } else {
    playClip(v, m.start, segEnd(m), () => {
      if (!session) return;
      session.phase = 'grade';
      updateCover();
    });
  }
}

function revealAnswer() {
  const it = currentItem(session);
  if (!it || session.phase !== 'answer') return;
  $('rv-ans').classList.add('hidden');
  session.phase = 'a';
  playClip(it.v, it.m.qEnd, segEnd(it.m), () => {
    if (!session) return;
    session.phase = 'grade';
    updateCover();
  });
}

function grade(ok) {
  const it = currentItem(session);
  if (!it) return;
  const m = it.m;

  if (ok) {
    m.streak++;
    // 忘却曲線: ○のたびに次回を先送り（翌日→3日後）、3回目で卒業
    if (m.streak < GRADUATE_AT) m.due = Date.now() + INTERVAL_DAYS[m.streak - 1] * DAY_MS;
  } else {
    m.streak = 0;
    m.due = 0;
  }
  saveState(getState(it.v));
  render();

  $('rv-ans').classList.add('hidden');
  session.pos++;
  if (session.pos >= session.queue.length) finishReview();
  else playCurrent();
}

function finishReview() {
  stopSegment();
  if (player) player.pauseVideo();

  const vids = [...new Set(session.queue.map(q => q.v))];
  let remain = 0;
  vids.forEach(v => getState(v).marks.forEach(m => { if (!isDone(m)) remain++; }));

  $('review-run').classList.add('hidden');
  $('review-result').classList.remove('hidden');
  $('result-title').textContent = remain === 0 ? '全問卒業！🎉' : 'おつかれさま！';
  $('result-body').textContent = remain === 0
    ? 'すべての問題を3回連続で正解しました。'
    : `復習中の問題は残り ${remain} 問。○をつけた問題は明日以降にまた出題されます。`;
  session = null;
  restoreVideo();
  updateDueInfo();
}

function quitReview() {
  stopSegment();
  if ((session || auto) && player) player.pauseVideo();  // 何も流していなければ止めない
  session = null;
  auto = null;
  $('review-run').classList.add('hidden');
  $('review-result').classList.add('hidden');
  $('playall-run').classList.add('hidden');
  $('review-idle').classList.remove('hidden');
  restoreVideo();
  updateDueInfo();
}

/* ============ 連続再生 ============ */

function startPlayAll() {
  const picks = autoTargets();
  if (!picks.length) {
    alert('再生する問題がありません。学習モードで記録するか、「期限前・卒業済みの問題も含める」にチェックを入れてください。');
    return;
  }
  session = null;
  auto = { queue: shuffle(picks).map(p => ({ v: p.v, id: p.m.id })), pos: 0 };
  $('review-idle').classList.add('hidden');
  $('review-result').classList.add('hidden');
  $('review-run').classList.add('hidden');
  $('playall-run').classList.remove('hidden');
  playAuto();
}

function playAuto() {
  if (!auto) return;
  const it = currentItem(auto);
  if (!it) { stepAuto(1); return; }

  $('pa-count').textContent = `${auto.pos + 1} / ${auto.queue.length}`;
  $('pa-memo').textContent = memoLabel(it.v, it.m);

  // 区間（問題＋答え）を再生し終わったら、待たずに次の問題へ
  playSegment(it.m, it.v, () => { if (auto) stepAuto(1); });
}

function stepAuto(dir) {
  if (!auto) return;
  auto.pos += dir;

  if (auto.pos >= auto.queue.length) {
    if (!$('loop-all').checked) { finishPlayAll(); return; }
    auto.queue = shuffle(auto.queue);   // 2周目からは並び順を変える
    auto.pos = 0;
  }
  if (auto.pos < 0) auto.pos = auto.queue.length - 1;

  playAuto();
}

function finishPlayAll() {
  stopSegment();
  if (player) player.pauseVideo();
  auto = null;
  $('playall-run').classList.add('hidden');
  $('review-result').classList.remove('hidden');
  $('result-title').textContent = '連続再生おわり';
  $('result-body').textContent = '記録した問題をひととおり流しました。';
  restoreVideo();
}

/* ============ 描画 ============ */

function render() {
  if (!state) return;
  const total = state.marks.length;
  const done = state.marks.filter(isDone).length;

  $('stat-total').textContent = total;
  $('stat-remain').textContent = total - done;
  $('stat-done').textContent = done;
  $('list-count').textContent = total;
  $('list-empty').classList.toggle('hidden', total > 0);

  const list = $('mark-list');
  list.innerHTML = '';
  state.marks.forEach((m, i) => {
    const row = document.createElement('div');
    row.className = 'mark-row' + (isDone(m) ? ' done' : '');

    const dots = Array.from({ length: GRADUATE_AT },
      (_, k) => `<div class="dot${k < m.streak ? ' on' : ''}"></div>`).join('');
    const dueLbl = isDone(m) ? '卒業' : (isDue(m) ? '復習待ち' : `次回 ${mdDate(m.due)}`);

    row.innerHTML = `
      <button class="icon-btn" data-act="play" title="この区間を再生">▶</button>
      <span class="mark-time">${fmt(m.start)}</span>
      <span class="nudge-group">
        <button class="icon-btn nudge" data-act="early" title="開始を1秒早く（区間の終わりは変えない）">−1s</button>
        <button class="icon-btn nudge" data-act="late" title="開始を1秒遅く（区間の終わりは変えない）">+1s</button>
      </span>
      ${hasQA(m) ? `<button class="mark-qa" data-act="qa" title="問題→答えの二段階再生（答え ${fmt(m.qEnd)}〜）。クリックで通し再生に戻す">Q/A</button>` : ''}
      <input class="mark-memo" placeholder="メモ（例：応仁の乱）">
      <span class="mark-dur">${m.dur}秒</span>
      <span class="mark-due">${dueLbl}</span>
      <div class="streak" title="連続正解 ${m.streak}/${GRADUATE_AT}">${dots}</div>
      <button class="icon-btn" data-act="del" title="削除">🗑</button>`;

    // メモはHTMLに埋め込まず値として渡す（記号が入っても壊れない）
    row.querySelector('.mark-memo').value = m.memo;
    row.querySelector('[data-act=play]').onclick = () => {
      lastMarkId = m.id;   // 「◆ 答えの位置を直す」の対象を、いま再生した問題にする
      playSegment(m);
    };

    // 開始位置の微調整。区間の終わり（=答えの終わり）は動かさないよう dur で吸収する
    const nudge = delta => {
      const end = segEnd(m);
      let ns = Math.max(0, m.start + delta);
      if (hasQA(m)) ns = Math.min(ns, m.qEnd - 1);   // 問題部分が消えない範囲まで
      ns = Math.min(ns, end - 3);
      m.dur = end - ns;
      m.start = ns;
      save();
      render();
      lastMarkId = m.id;   // 続けて「答えの位置を直す」も使えるように
    };
    row.querySelector('[data-act=early]').onclick = () => nudge(-1);
    row.querySelector('[data-act=late]').onclick = () => nudge(1);

    const qa = row.querySelector('[data-act=qa]');
    if (qa) qa.onclick = () => {
      if (!confirm('この問題を「通し再生」に戻しますか？（答えの位置の記録を消します）')) return;
      m.qEnd = null;
      save();
      render();
    };
    row.querySelector('[data-act=del]').onclick = () => {
      state.marks.splice(i, 1);
      save();
      render();
    };
    row.querySelector('.mark-memo').onchange = e => {
      m.memo = e.target.value;
      save();
    };
    list.appendChild(row);
  });

  updateDueInfo();
}

function renderHistory() {
  const idx = loadIndex();
  $('history-wrap').classList.toggle('hidden', idx.length === 0);
  const box = $('history-list');
  box.innerHTML = '';
  idx.slice(0, 10).forEach(v => {   // 表示は10件まで（出題対象は全件）
    const b = document.createElement('button');
    b.className = 'history-item';
    b.innerHTML = `<span class="hist-title"></span> <span>（${v.n}問）</span>`;
    b.querySelector('.hist-title').textContent = v.title || v.id;   // タイトルはHTMLに埋め込まない
    b.title = v.id;
    b.onclick = () => { $('url-input').value = v.id; loadVideo(v.id); };
    box.appendChild(b);
  });
}

/* ============ イベント ============ */

$('load-btn').onclick = () => {
  const id = parseVideoId($('url-input').value);
  if (!id) {
    $('load-hint').textContent = '⚠ YouTubeのURLまたは11文字の動画IDを入力してください。';
    return;
  }
  $('load-hint').textContent = '例: https://www.youtube.com/watch?v=XXXXXXXXXXX';
  loadVideo(id);
};
$('url-input').onkeydown = e => { if (e.key === 'Enter') $('load-btn').click(); };

$('change-video').onclick = () => {
  $('loader').classList.remove('hidden');
  $('loader').scrollIntoView({ behavior: 'smooth' });
  $('url-input').focus();
};

$('ok-btn').onclick = okMark;
$('mark-btn').onclick = addMark;
$('ans-btn').onclick = setAnswerPoint;
document.querySelectorAll('input[name=rec-mode]')
  .forEach(r => { r.onchange = applyRecMode; });

/* --- 再生速度 --- */
function applyRate() {
  if (!player || !player.setPlaybackRate) return;
  const rate = Number($('speed-sel').value) || 1;
  if (player.getPlaybackRate && player.getPlaybackRate() !== rate) player.setPlaybackRate(rate);
}
$('speed-sel').onchange = () => {
  localStorage.setItem('yt-drill:rate', $('speed-sel').value);
  applyRate();
};

/* --- 自前の再生コントロール --- */
const seekBy = sec => {
  if (!player || !player.getCurrentTime) return;
  stopSegment();
  lastBoundary = null;   // シークしたら○/✕の区切りは無効
  player.seekTo(Math.max(0, player.getCurrentTime() + sec), true);
};
$('tp-back').onclick = () => seekBy(-10);
$('tp-fwd').onclick = () => seekBy(10);
$('tp-play').onclick = () => {
  if (!player || !player.getPlayerState) return;
  if (player.getPlayerState() === 1) player.pauseVideo();   // 1 = 再生中
  else player.playVideo();
};
$('show-controls').onchange = toggleControls;

setInterval(() => {
  if (!player || !player.getCurrentTime) return;
  $('tp-time').textContent = fmt(player.getCurrentTime());
  $('tp-play').textContent = player.getPlayerState() === 1 ? '⏸ 一時停止' : '▶ 再生';
}, 300);

$('tab-study').onclick = () => {
  quitReview();
  $('tab-study').classList.add('active');
  $('tab-review').classList.remove('active');
  $('study-pane').classList.remove('hidden');
  $('review-pane').classList.add('hidden');
};
$('tab-review').onclick = () => {
  stopSegment();
  $('tab-review').classList.add('active');
  $('tab-study').classList.remove('active');
  $('review-pane').classList.remove('hidden');
  $('study-pane').classList.add('hidden');
  renderScopeList();
  updateDueInfo();
};

$('review-start').onclick = startReview;
$('playall-start').onclick = startPlayAll;
$('pa-prev').onclick = () => stepAuto(-1);
$('pa-next').onclick = () => stepAuto(1);
$('pa-replay').onclick = playAuto;
$('pa-stop').onclick = quitReview;
$('rv-ans').onclick = revealAnswer;
$('rv-ok').onclick = () => grade(true);
$('rv-ng').onclick = () => grade(false);
$('rv-replay').onclick = playCurrent;
$('rv-quit').onclick = quitReview;
$('result-again').onclick = startReview;
$('result-close').onclick = quitReview;
$('include-done').onchange = updateDueInfo;

$('scope-all').onclick = () => {
  localStorage.setItem(SCOPE_KEY, JSON.stringify(scopeCandidates().map(c => c.id)));
  renderScopeList();
  updateDueInfo();
};
$('scope-one').onclick = () => {
  localStorage.setItem(SCOPE_KEY, JSON.stringify([state.videoId]));
  renderScopeList();
  updateDueInfo();
};

$('export-btn').onclick = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `yt-drill-${state.videoId}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
};

$('import-btn').onclick = () => $('import-file').click();
$('import-file').onchange = async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data || !/^[\w-]{11}$/.test(data.videoId || '') || !Array.isArray(data.marks)) {
      throw new Error('形式が違います');
    }
    const st = getState(data.videoId);
    let added = 0, updated = 0;
    data.marks.forEach(im => {
      if (!im || typeof im.start !== 'number') return;
      // 外部ファイル由来の値は型を強制する（画面に流し込むため、文字列の混入を許さない）
      const clean = {
        id: Number(im.id) || Date.now() + Math.floor(Math.random() * 1000),
        start: im.start,
        dur: Math.max(3, Number(im.dur) || 15),
        qEnd: typeof im.qEnd === 'number' ? im.qEnd : null,
        memo: typeof im.memo === 'string' ? im.memo : '',
        streak: Math.max(0, Math.floor(Number(im.streak) || 0)),
        due: Number(im.due) || 0,
      };
      const cur = st.marks.find(m => m.id === clean.id);
      if (cur) { Object.assign(cur, clean); updated++; }
      else { st.marks.push(clean); added++; }
    });
    st.marks.sort((a, b) => a.start - b.start);
    if (typeof data.title === 'string' && !st.title) st.title = data.title;
    if (Array.isArray(data.tags) && !(st.tags || []).length) {
      st.tags = data.tags.filter(t => typeof t === 'string').slice(0, 20);
    }
    saveState(st);
    if (state && state.videoId === data.videoId) render();
    renderHistory();
    alert(`読み込みました。\n動画: ${st.title || data.videoId}\n追加 ${added} 問 / 更新 ${updated} 問`);
  } catch (err) {
    alert('読み込めませんでした。このツールで書き出したJSONファイルを選んでください。');
  }
};

$('clear-btn').onclick = () => {
  if (!confirm('この動画の記録をすべて消します。よろしいですか？')) return;
  state.marks = [];
  save();
  render();
};

// メモ入力中にショートカットが暴発しないようにする
document.addEventListener('keydown', e => {
  if (e.target.matches('input, textarea')) return;
  const k = e.key.toLowerCase();

  if (auto) {
    if (k === 'n' || e.key === 'ArrowRight') { e.preventDefault(); stepAuto(1); }
    if (k === 'p' || e.key === 'ArrowLeft') { e.preventDefault(); stepAuto(-1); }
    if (k === 'r') { e.preventDefault(); playAuto(); }
  } else if (session) {
    if (k === 'o') { e.preventDefault(); grade(true); }
    if (k === 'x') { e.preventDefault(); grade(false); }
    if (k === 'r') { e.preventDefault(); playCurrent(); }
    if (k === 'a') { e.preventDefault(); revealAnswer(); }
  } else if (state && !$('study-pane').classList.contains('hidden')) {
    if (k === 'o') { e.preventDefault(); okMark(); }
    if (k === 'x') { e.preventDefault(); addMark(); }
    if (k === 'a') { e.preventDefault(); setAnswerPoint(); }
  }
});

/* ============ 起動 ============ */

// file:// で直接開くとYouTubeが配信元を確認できず、エラー153で再生できない
if (location.protocol === 'file:') {
  $('load-hint').innerHTML =
    '⚠ このページを<b>ファイルから直接開いています</b>。YouTubeが再生を拒否（エラー153）します。' +
    '<br>serve.ps1 を起動し、<b>http://localhost:8080/tools/yt-drill/</b> から開いてください。';
  $('load-btn').disabled = true;
}

$('show-controls').checked = localStorage.getItem('yt-drill:controls') === '1';
$('player-cover').classList.toggle('hidden', $('show-controls').checked);
$('speed-sel').value = localStorage.getItem('yt-drill:rate') || '1';

// 記録方式を復元（既定は全問○×方式）
const savedMode = localStorage.getItem('yt-drill:mode');
if (savedMode === 'simple') document.querySelector('input[name=rec-mode][value=simple]').checked = true;
applyRecMode();

renderHistory();
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(tag);
