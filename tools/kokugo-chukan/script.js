/* ============================================================
   中3国語 2学期中間テスト対策（詩・短歌・敬語）
   ============================================================ */

const STORAGE_KEY = 'kokugo_chukan_progress_v1';
const SETTINGS_KEY = 'kokugo_chukan_settings_v1';

const UNIT_COLOR = { shi: 'var(--u-shi)', tanka: 'var(--u-tanka)', keigo: 'var(--u-keigo)' };

const state = {
  progress: loadProgress(),   // { [qid]: 'ok' | 'ng' | 'un' }
  queue: [],                  // 出題中の問題配列
  idx: 0,
  badge: '',
  session: {},                // このセッションの結果 { [qid]: 'ok'|'ng'|'un' }
  answered: false,
  hintUsed: false,            // その問題で4択のヒントを見たか
  settings: loadSettings(),
  hiddenCols: { sonkei: false, kenjo: false },
};

/* ── 保存 ───────────────────────────────── */
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch (e) { return {}; }
}
function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)); }
  catch (e) { /* 保存できない設定でも学習は続けられる */ }
}
function loadSettings() {
  const def = { quickChoice: false };
  try { return Object.assign(def, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')); }
  catch (e) { return def; }
}
function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)); }
  catch (e) { /* 保存できなくても動作に支障はない */ }
}

/* ── 小道具 ─────────────────────────────── */
const $ = (id) => document.getElementById(id);
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function subOf(id) { return SUBS.find((s) => s.id === id); }
function unitOfQ(q) { return subOf(q.sub).unit; }
function unitName(uid) { return UNITS.find((u) => u.id === uid).name; }
function questionsOfUnit(uid) { return QUESTIONS.filter((q) => unitOfQ(q) === uid); }

/* 例文のブロック。改行はそのまま改行として見せる */
function exBlock(text, label) {
  if (!text) return '';
  return `<div class="ex-box"><div class="ex-label">${esc(label)}</div><div class="ex-text">${esc(text)}</div></div>`;
}

/* 記述解答の表記ゆれをならす */
function normalize(s) {
  return String(s)
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .replace(/[、。，．・「」『』（）()〈〉《》【】\[\]!?！？…‥ー―—－\-~〜]/g, '')
    .toLowerCase();
}
function acceptSet(q) {
  const list = [q.a].concat(q.ok || []);
  const set = new Set();
  list.forEach((x) => {
    set.add(normalize(x));
    // 「まいる／うかがう」「ごらんになって（ごらんください）」のような併記も一つずつ受け付ける
    String(x).split(/[／\/]/).forEach((p) => { if (p.trim()) set.add(normalize(p)); });
    const m = String(x).match(/^(.+?)（(.+?)）$/);
    if (m) { set.add(normalize(m[1])); set.add(normalize(m[2])); }
  });
  set.delete('');
  return set;
}

/* ── 画面切り替え ───────────────────────── */
function show(name) {
  document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
  $('screen-' + name).classList.add('active');
  window.scrollTo(0, 0);
}

/* ── ヘッダーの集計 ─────────────────────── */
function tally(list) {
  const t = { ok: 0, ng: 0, un: 0, yet: 0 };
  list.forEach((q) => {
    const r = state.progress[q.id];
    if (r === 'ok') t.ok++;
    else if (r === 'ng') t.ng++;
    else if (r === 'un') t.un++;
    else t.yet++;
  });
  return t;
}
function renderHeader() {
  const t = tally(QUESTIONS);
  $('hstat-ok').textContent = t.ok;
  $('hstat-ng').textContent = t.ng;
  $('hstat-un').textContent = t.un;
}

/* ══════════════════════════════════════════
   ホーム
══════════════════════════════════════════ */
function renderHome() {
  renderHeader();
  $('opt-quick').checked = !!state.settings.quickChoice;

  const all = tally(QUESTIONS);
  $('overall-done').textContent = all.ok;
  $('overall-total').textContent = QUESTIONS.length;
  const pct = Math.round((all.ok / QUESTIONS.length) * 100);
  $('overall-pct').textContent = pct + '%';
  $('overall-bar').style.width = pct + '%';

  // 分野カード
  $('unit-grid').innerHTML = UNITS.map((u) => {
    const list = questionsOfUnit(u.id);
    const t = tally(list);
    const p = Math.round((t.ok / list.length) * 100);
    return `<button class="unit-card" data-unit="${u.id}" style="--uc:${UNIT_COLOR[u.id]}">
      <span class="uc-icon">${u.icon}</span>
      <span class="uc-body">
        <span class="uc-name">${esc(u.name)}</span>
        <span class="uc-desc">${esc(u.desc)}　<span style="opacity:.7">${esc(u.src)}</span></span>
        <span class="uc-track"><span class="uc-fill" style="width:${p}%"></span></span>
      </span>
      <span class="uc-num">${t.ok} / ${list.length}<br>${p}%</span>
    </button>`;
  }).join('');
  document.querySelectorAll('.unit-card').forEach((b) => {
    b.onclick = () => {
      const uid = b.dataset.unit;
      startQuiz(shuffle(questionsOfUnit(uid)), unitName(uid));
    };
  });

  // 小分類チップ
  $('sub-list').innerHTML = SUBS.map((s) => {
    const list = QUESTIONS.filter((q) => q.sub === s.id);
    const t = tally(list);
    return `<button class="sub-chip" data-sub="${s.id}" style="--uc:${UNIT_COLOR[s.unit]}">
      <span class="sc-dot"></span>${esc(s.name)}
      <span class="sc-num">全${list.length}問　マスター ${t.ok}問</span>
    </button>`;
  }).join('');
  document.querySelectorAll('.sub-chip').forEach((b) => {
    b.onclick = () => {
      const sid = b.dataset.sub;
      startQuiz(shuffle(QUESTIONS.filter((q) => q.sub === sid)), subOf(sid).name);
    };
  });

  // 分野別の成績グラフ
  $('stats-chart').innerHTML = UNITS.map((u) => {
    const list = questionsOfUnit(u.id);
    const t = tally(list);
    const w = (n) => (n / list.length) * 100;
    return `<div class="sc-row">
      <div class="sc-label"><b>${esc(u.name)}</b><span>正解 ${t.ok}／不正解 ${t.ng}／あいまい ${t.un}／未 ${t.yet}</span></div>
      <div class="sc-track">
        <div class="sc-seg sc-ok" style="width:${w(t.ok)}%"></div>
        <div class="sc-seg sc-un" style="width:${w(t.un)}%"></div>
        <div class="sc-seg sc-ng" style="width:${w(t.ng)}%"></div>
      </div>
    </div>`;
  }).join('') + `<div class="sc-legend">
      <span><i style="background:var(--correct)"></i>正解</span>
      <span><i style="background:var(--unsure)"></i>あいまい</span>
      <span><i style="background:var(--wrong)"></i>不正解</span>
      <span><i style="background:var(--surface2)"></i>未挑戦</span>
    </div>`;
}

/* ══════════════════════════════════════════
   出題
══════════════════════════════════════════ */
function startQuiz(list, badge) {
  if (!list.length) { alert('該当する問題がありません。'); return; }
  state.queue = list;
  state.idx = 0;
  state.badge = badge;
  state.session = {};
  show('quiz');
  renderQuestion();
}

/* 実力チェック：各分野からバランスよく、未挑戦・不正解を優先して出す */
function buildMock(total) {
  const per = Math.ceil(total / UNITS.length);
  let picked = [];
  UNITS.forEach((u) => {
    const list = questionsOfUnit(u.id);
    const weak = shuffle(list.filter((q) => state.progress[q.id] !== 'ok'));
    const done = shuffle(list.filter((q) => state.progress[q.id] === 'ok'));
    picked = picked.concat(weak.concat(done).slice(0, per));
  });
  return shuffle(picked).slice(0, total);
}

function weakList(includeUnsure) {
  return QUESTIONS.filter((q) => {
    const r = state.progress[q.id];
    return r === 'ng' || (includeUnsure && r === 'un');
  });
}

function answerTextOf(q) { return q.type === 'choice' ? q.c[0] : q.a; }

function renderQuestion() {
  const q = state.queue[state.idx];
  state.answered = false;
  state.hintUsed = false;
  state._opts = null;

  $('quiz-badge').textContent = state.badge;
  $('quiz-count').textContent = `${state.idx + 1} / ${state.queue.length} 問`;
  $('quiz-prog-fill').style.width = ((state.idx) / state.queue.length) * 100 + '%';

  // 「最初から4択を出す」設定のときだけ、選択問題は昔どおりすぐ選択肢を出す
  const quick = state.settings.quickChoice && q.type === 'choice';
  const typeTag = q.type === 'input' ? '<span class="q-type-tag">記述</span>' : '<span class="q-type-tag">用語</span>';

  let body = '';
  if (q.type === 'input') {
    body += `<div class="input-row">
      <input type="text" id="ans-input" autocomplete="off" autocapitalize="off" placeholder="答えを入力">
      <button id="ans-submit">答える</button>
    </div>
    <div class="input-hint">ひらがな・漢字どちらでもかまいません。</div>`;
  } else if (!quick) {
    body += `<div class="recall-note">まず自分で答えを思いうかべてから、下のボタンを押そう。</div>`;
  }
  if (!quick) {
    body += `<div class="recall-row">
      <button class="btn btn-outline hint-btn" id="btn-hint">💡 4択のヒントを見る</button>
      ${q.type === 'choice' ? `<button class="btn btn-outline" id="btn-reveal">答えを見る</button>` : ''}
    </div>`;
  }

  $('quiz-area').innerHTML = `<div class="q-card">
    <div class="q-sub">${esc(subOf(q.sub).name)}${typeTag}</div>
    <div class="q-text">${esc(q.q)}</div>
    ${exBlock(PRE_EXAMPLES[q.id], '例文')}
    <div id="q-body">${body}</div>
    <div id="q-choices"></div>
    <div id="q-judge"></div>
  </div>`;

  if (q.type === 'input') {
    const inp = $('ans-input');
    inp.focus();
    inp.onkeydown = (e) => { if (e.key === 'Enter') answerInput(); };
    $('ans-submit').onclick = answerInput;
  }
  if (quick) {
    renderChoices(q, false);
  } else {
    $('btn-hint').onclick = showHint;
    if (q.type === 'choice') $('btn-reveal').onclick = revealAnswer;
  }
}

/* 4択のヒントを出す。記述問題の選択肢は、同じ分野の答えから作る */
function showHint() {
  if (state.answered || state.hintUsed) return;
  state.hintUsed = true;
  $('btn-hint').disabled = true;
  $('btn-hint').textContent = '💡 ヒント表示中';
  renderChoices(state.queue[state.idx], true);
}

function renderChoices(q, isHint) {
  const texts = q.type === 'choice' ? q.c : buildHintOptions(q);
  const correctText = answerTextOf(q);
  const opts = shuffle(texts.map((t) => ({ text: t, correct: t === correctText })));
  state._opts = opts;

  $('q-choices').innerHTML =
    (isHint ? `<div class="hint-label">ヒント　この中に答えがあります（ヒントつきの正解は「あいまい」として記録します）</div>` : '') +
    `<div class="choices">${opts.map((o, i) =>
      `<button class="choice" data-i="${i}"><span class="ch-mark">${i + 1}</span><span>${esc(o.text)}</span></button>`
    ).join('')}</div>`;

  document.querySelectorAll('.choice').forEach((b) => {
    b.onclick = () => answerChoice(parseInt(b.dataset.i, 10));
  });
}

/* 記述問題のヒント用に、まぎらわしい選択肢を3つ選ぶ */
function buildHintOptions(q) {
  const ansText = answerTextOf(q);
  // 手で用意したまぎらわしい選択肢があれば、それを使う
  if (HINTS[q.id] && HINTS[q.id].length >= 3) {
    return [ansText].concat(HINTS[q.id].slice(0, 3));
  }
  const acc = acceptSet(q);
  const seen = new Set([normalize(ansText)]);
  const cands = [];

  QUESTIONS.forEach((x) => {
    if (x.id === q.id) return;
    // 同じ小分類 → 同じ分野 → それ以外、の順で優先する
    let rank;
    if (x.sub === q.sub) rank = 0;
    else if (unitOfQ(x) === unitOfQ(q)) rank = 1;
    else rank = 2;
    const t = answerTextOf(x);
    const n = normalize(t);
    if (!n || seen.has(n) || acc.has(n)) return;   // 答えと同じ意味のものは選択肢にしない
    seen.add(n);
    cands.push({ text: t, rank: rank, diff: Math.abs(t.length - ansText.length) });
  });

  cands.sort((a, b) => (a.rank - b.rank) || (a.diff - b.diff));
  const near = cands.slice(0, 8).map((c) => c.text);
  return [ansText].concat(shuffle(near).slice(0, 3));
}

/* 選択問題で「答えを見る」＝自己採点にする */
function revealAnswer() {
  if (state.answered) return;
  state.answered = true;
  const q = state.queue[state.idx];
  $('q-body').innerHTML = '';
  $('q-choices').innerHTML = '';
  showSelfJudge(q);
}

function showSelfJudge(q) {
  $('q-judge').innerHTML = `
    <div class="judge reveal">
      <div class="judge-head">答え</div>
      <div>答え：<span class="ans">${esc(answerTextOf(q))}</span></div>
      <div class="note">${esc(q.note || '')}</div>
      ${exBlock(EXAMPLES[q.id], '例文で確認')}
    </div>
    <div class="self-ask">自分の答えと合っていましたか？</div>
    <div class="self-btns">
      <button class="btn btn-primary" id="btn-know">○　わかっていた</button>
      <button class="btn btn-secondary" id="btn-unsure">△　あいまいだった</button>
      <button class="btn btn-outline" id="btn-notknow">×　わからなかった</button>
    </div>`;
  // ヒントを見たあとの「わかっていた」は、あいまいとして記録する
  $('btn-know').onclick = () => { record(q, state.hintUsed ? 'un' : 'ok'); nextQuestion(); };
  $('btn-unsure').onclick = () => { record(q, 'un'); nextQuestion(); };
  $('btn-notknow').onclick = () => { record(q, 'ng'); nextQuestion(); };
}

function answerChoice(i) {
  if (state.answered) return;
  state.answered = true;
  const q = state.queue[state.idx];
  const opts = state._opts;
  const correct = opts[i].correct;

  document.querySelectorAll('.choice').forEach((b, bi) => {
    b.disabled = true;
    if (opts[bi].correct) { b.classList.add('correct'); b.querySelector('.ch-mark').textContent = '○'; }
    else if (bi === i) { b.classList.add('wrong'); b.querySelector('.ch-mark').textContent = '×'; }
  });
  const hintBtn = $('btn-hint');
  if (hintBtn) hintBtn.disabled = true;

  // ヒントを見て当てた場合は「あいまい」として記録する
  record(q, correct ? (state.hintUsed ? 'un' : 'ok') : 'ng');
  showJudge(q, correct, opts.find((o) => o.correct).text, false);
}

function answerInput() {
  if (state.answered) return;
  state.answered = true;
  const q = state.queue[state.idx];
  const raw = $('ans-input').value;
  const correct = normalize(raw) !== '' && acceptSet(q).has(normalize(raw));

  $('ans-input').disabled = true;
  $('ans-submit').disabled = true;
  const hintBtn = $('btn-hint');
  if (hintBtn) hintBtn.disabled = true;
  document.querySelectorAll('.choice').forEach((b) => { b.disabled = true; });

  record(q, correct ? (state.hintUsed ? 'un' : 'ok') : 'ng');
  showJudge(q, correct, q.a, !correct);
}

function record(q, result) {
  state.progress[q.id] = result;
  state.session[q.id] = result;
  saveProgress();
  renderHeader();
}

function showJudge(q, correct, answerText, allowSelfOk) {
  const okAlt = (q.ok && q.ok.length > 1)
    ? `<div class="note">ほかに認められる答え：${esc(q.ok.slice(0, 6).join('／'))}</div>` : '';

  let btns = '';
  if (allowSelfOk) btns += `<button class="btn btn-outline" id="btn-self-ok">やっぱり合っていた（正解にする）</button>`;
  btns += `<button class="btn btn-secondary" id="btn-unsure">あいまいだった</button>`;

  $('q-judge').innerHTML = `
    <div class="judge ${correct ? 'ok' : 'ng'}">
      <div class="judge-head">${correct ? '○　正解' : '×　まちがい'}${correct && state.hintUsed ? '<span class="hint-flag">ヒントつき → あいまいとして記録</span>' : ''}</div>
      <div>答え：<span class="ans">${esc(answerText)}</span></div>
      ${q.type === 'input' ? okAlt : ''}
      <div class="note">${esc(q.note || '')}</div>
      ${exBlock(EXAMPLES[q.id], '例文で確認')}
    </div>
    <div class="self-btns">${btns}</div>
    <div class="next-row"><button class="btn btn-primary" id="btn-next">${state.idx + 1 < state.queue.length ? '次の問題へ →' : '結果を見る →'}</button></div>`;

  const selfOk = $('btn-self-ok');
  if (selfOk) selfOk.onclick = () => { record(q, 'ok'); nextQuestion(); };
  $('btn-unsure').onclick = () => { record(q, 'un'); nextQuestion(); };
  $('btn-next').onclick = nextQuestion;
  $('btn-next').focus();
}

function nextQuestion() {
  state.idx++;
  if (state.idx >= state.queue.length) renderResult();
  else renderQuestion();
}

/* ══════════════════════════════════════════
   結果
══════════════════════════════════════════ */
function renderResult() {
  const ids = state.queue.map((q) => q.id);
  let ok = 0, ng = 0, un = 0;
  ids.forEach((id) => {
    const r = state.session[id];
    if (r === 'ok') ok++; else if (r === 'ng') ng++; else if (r === 'un') un++;
  });
  const total = ids.length;
  const pct = total ? Math.round((ok / total) * 100) : 0;

  $('res-pct').textContent = pct;
  $('res-ok').textContent = ok;
  $('res-ng').textContent = ng;
  $('res-un').textContent = un;

  let msg, sub;
  if (pct === 100) { msg = '完璧！　この範囲は仕上がっています'; sub = '時間をおいてもう一度やると、さらに確実になります。'; }
  else if (pct >= 80) { msg = 'よくできています'; sub = 'まちがえた問題だけをもう一度やれば、ほぼ満点です。'; }
  else if (pct >= 60) { msg = 'あと一歩'; sub = '要点シートで確認してから、まちがえた問題をやり直しましょう。'; }
  else { msg = 'ここが伸びしろ'; sub = 'まず要点シートを読んでから、もう一度挑戦しましょう。'; }
  $('res-msg').textContent = msg;
  $('res-sub').textContent = sub;

  const review = state.queue.filter((q) => state.session[q.id] === 'ng' || state.session[q.id] === 'un');
  $('wrong-title').style.display = review.length ? '' : 'none';
  $('wrong-list').innerHTML = review.length
    ? review.map((q) => {
        const ans = q.type === 'choice' ? q.c[0] : q.a;
        const cls = state.session[q.id] === 'un' ? 'wrong-item un' : 'wrong-item';
        return `<div class="${cls}">
          <div class="wi-q">${esc(q.q)}</div>
          <div class="wi-a">答え：${esc(ans)}</div>
          <div class="wi-n">${esc(q.note || '')}</div>
          ${exBlock(EXAMPLES[q.id], '例文で確認')}
        </div>`;
      }).join('')
    : `<div class="empty-note">見直しが必要な問題はありません。</div>`;

  show('result');
  renderHome();
}

/* ══════════════════════════════════════════
   敬語動詞一覧表
══════════════════════════════════════════ */
function renderKeigoTable() {
  $('keigo-tbody').innerHTML = KEIGO_TABLE.map((r, i) => `
    <tr>
      <td class="cell" data-col="sonkei" data-i="${i}">${esc(r.sonkei)}</td>
      <td class="normal">${esc(r.normal)}</td>
      <td class="cell" data-col="kenjo" data-i="${i}">${esc(r.kenjo)}</td>
    </tr>`).join('');
  applyHiddenCols();

  document.querySelectorAll('#keigo-table th.col-head[data-col]').forEach((th) => {
    th.onclick = () => {
      const col = th.dataset.col;
      state.hiddenCols[col] = !state.hiddenCols[col];
      applyHiddenCols();
    };
  });
}
function applyHiddenCols() {
  ['sonkei', 'kenjo'].forEach((col) => {
    const hide = state.hiddenCols[col];
    const eye = $('eye-' + col);
    if (eye) eye.textContent = hide ? '🙈' : '👁';
    document.querySelectorAll(`#keigo-table td[data-col="${col}"]`).forEach((td) => {
      td.classList.remove('revealed');
      td.classList.toggle('hidden-cell', hide);
      td.onclick = hide ? () => { td.classList.remove('hidden-cell'); td.classList.add('revealed'); } : null;
    });
  });
}

/* ══════════════════════════════════════════
   要点シート
══════════════════════════════════════════ */
let sheetUnit = 'shi';
function renderSheet() {
  $('sheet-tabs').innerHTML = UNITS.map((u) =>
    `<button class="sheet-tab ${u.id === sheetUnit ? 'active' : ''}" data-u="${u.id}">${u.icon} ${esc(u.name)}</button>`
  ).join('');
  document.querySelectorAll('.sheet-tab').forEach((b) => {
    b.onclick = () => { sheetUnit = b.dataset.u; renderSheet(); };
  });

  $('sheet-body').innerHTML = SHEETS.filter((s) => s.unit === sheetUnit).map((s) => `
    <div class="sheet-block">
      <h3>${esc(s.title)}</h3>
      ${s.rows.map((r) => `<div class="sheet-row"><div class="sr-k">${r[0]}</div><div class="sr-v">${r[1]}</div></div>`).join('')}
    </div>`).join('');
}

/* ══════════════════════════════════════════
   起動
══════════════════════════════════════════ */
$('btn-mock').onclick = () => startQuiz(buildMock(30), '実力チェック（30問）');
$('btn-weak-ng').onclick = () => {
  const l = weakList(false);
  if (!l.length) { alert('まちがえた問題はありません。まず問題を解いてみましょう。'); return; }
  startQuiz(shuffle(l), `まちがえた問題（${l.length}問）`);
};
$('btn-weak-all').onclick = () => {
  const l = weakList(true);
  if (!l.length) { alert('まちがえた問題・あいまいな問題はありません。'); return; }
  startQuiz(shuffle(l), `弱点の復習（${l.length}問）`);
};
$('opt-quick').onchange = (e) => { state.settings.quickChoice = e.target.checked; saveSettings(); };
$('btn-table').onclick = () => { renderKeigoTable(); show('table'); };
$('btn-sheet').onclick = () => { renderSheet(); show('sheet'); };
$('btn-reset').onclick = () => {
  if (!confirm('これまでの学習記録をすべて消します。よろしいですか？')) return;
  state.progress = {};
  saveProgress();
  renderHome();
};

$('quiz-back-btn').onclick = () => { renderHome(); show('home'); };
$('table-back-btn').onclick = () => show('home');
$('sheet-back-btn').onclick = () => show('home');
$('table-quiz-btn').onclick = () =>
  startQuiz(shuffle(QUESTIONS.filter((q) => q.sub === 'keigo-doushi')), '敬語動詞一覧表');

$('res-home-btn').onclick = () => { renderHome(); show('home'); };
$('res-retry-ng').onclick = () => {
  const l = weakList(false);
  if (!l.length) { alert('まちがえた問題はありません。'); return; }
  startQuiz(shuffle(l), `まちがえた問題（${l.length}問）`);
};
$('res-retry-all').onclick = () => {
  const l = weakList(true);
  if (!l.length) { alert('復習が必要な問題はありません。'); return; }
  startQuiz(shuffle(l), `弱点の復習（${l.length}問）`);
};

/* キーボード操作：選択肢は 1〜4、答え合わせのあとは Enter で次へ */
document.addEventListener('keydown', (e) => {
  if (!$('screen-quiz').classList.contains('active')) return;
  if (!state.answered) {
    const n = parseInt(e.key, 10);
    const btns = document.querySelectorAll('.choice');
    if (btns.length && n >= 1 && n <= btns.length) { btns[n - 1].click(); }
  } else if (e.key === 'Enter') {
    // 記述の答えを Enter で送信したそのキー操作で、次の問題へ飛ばないようにする
    if (e.target && e.target.id === 'ans-input') return;
    // ボタンにフォーカスがあるときは、そのボタン本来の動作にまかせる
    if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
    const nx = $('btn-next');
    if (nx) { e.preventDefault(); nx.click(); }
  }
});

renderHome();
