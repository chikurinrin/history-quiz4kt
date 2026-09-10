/* ============================================================
   中3国語 2学期中間テスト対策（詩・短歌・敬語）
   ============================================================ */

const STORAGE_KEY = 'kokugo_chukan_progress_v1';

const UNIT_COLOR = { shi: 'var(--u-shi)', tanka: 'var(--u-tanka)', keigo: 'var(--u-keigo)' };

const state = {
  progress: loadProgress(),   // { [qid]: 'ok' | 'ng' | 'un' }
  queue: [],                  // 出題中の問題配列
  idx: 0,
  badge: '',
  session: {},                // このセッションの結果 { [qid]: 'ok'|'ng'|'un' }
  answered: false,
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

function renderQuestion() {
  const q = state.queue[state.idx];
  state.answered = false;

  $('quiz-badge').textContent = state.badge;
  $('quiz-count').textContent = `${state.idx + 1} / ${state.queue.length} 問`;
  $('quiz-prog-fill').style.width = ((state.idx) / state.queue.length) * 100 + '%';

  const typeTag = q.type === 'input' ? '<span class="q-type-tag">記述</span>' : '<span class="q-type-tag">選択</span>';
  let body;
  if (q.type === 'choice') {
    const opts = shuffle(q.c.map((text, i) => ({ text, correct: i === 0 })));
    state._opts = opts;
    body = `<div class="choices">${opts.map((o, i) =>
      `<button class="choice" data-i="${i}"><span class="ch-mark">${i + 1}</span><span>${esc(o.text)}</span></button>`
    ).join('')}</div>`;
  } else {
    body = `<div class="input-row">
      <input type="text" id="ans-input" autocomplete="off" autocapitalize="off" placeholder="答えを入力">
      <button id="ans-submit">答える</button>
    </div>
    <div class="input-hint">ひらがな・漢字どちらでもかまいません。「わからない」ときは空欄のまま「答える」を押してください。</div>`;
  }

  $('quiz-area').innerHTML = `<div class="q-card">
    <div class="q-sub">${esc(subOf(q.sub).name)}${typeTag}</div>
    <div class="q-text">${esc(q.q)}</div>
    ${exBlock(PRE_EXAMPLES[q.id], '例文')}
    <div id="q-body">${body}</div>
    <div id="q-judge"></div>
  </div>`;

  if (q.type === 'choice') {
    document.querySelectorAll('.choice').forEach((b) => {
      b.onclick = () => answerChoice(parseInt(b.dataset.i, 10));
    });
  } else {
    const inp = $('ans-input');
    inp.focus();
    inp.onkeydown = (e) => { if (e.key === 'Enter') answerInput(); };
    $('ans-submit').onclick = answerInput;
  }
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

  record(q, correct ? 'ok' : 'ng');
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

  record(q, correct ? 'ok' : 'ng');
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
      <div class="judge-head">${correct ? '○　正解' : '×　まちがい'}</div>
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
