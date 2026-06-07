// 英単語確認アプリ ロジック
// data.js が提供する: SENTENCES, WORDS, SETS, SET_SIZE
// 各単語: { key, word, meaning, sentEn, sentJa, sentId, setIndex }

// ---------- 永続化（学習記録） ----------
// progress = { en2ja: { [wordKey]: "correct"|"wrong"|"unsure" }, ja2en: {...} }
// ※「カウント対象外(skip)」は記録しない（その回だけ出題から外す）
const STORE_KEY = "eitango-progress-v1";

function loadProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(STORE_KEY));
    if (p && p.en2ja && p.ja2en) return p;
  } catch (e) { /* ignore */ }
  return { en2ja: {}, ja2en: {} };
}
function saveProgress() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) { /* ignore */ }
}
let progress = loadProgress();

function getStatus(dir, key) { return progress[dir][key]; }     // undefined = 未学習
function setStatus(dir, key, st) { progress[dir][key] = st; saveProgress(); }

// ---------- 状態 ----------
const state = {
  direction: "en2ja",
  scopeWords: [],     // グラフ集計の対象（セット or 全体）
  scopeLabel: "",     // 画面タイトル
  setIndex: null,     // セット由来なら番号、復習(全体)なら null
  queue: [],          // この回で出題する残りの単語
  current: null,      // 出題中の単語
  poolSize: 0,        // この回で習得すべき単語数（進捗バー用）
  session: { correct: 0, wrong: 0, unsure: 0, skip: 0 }, // この回の操作回数
  skipped: new Set(), // この回でカウント対象外にした key
  restart: null,      // 「もう一度」で同じ内容を再開する関数
};

// ---------- 要素参照 ----------
const $ = (id) => document.getElementById(id);
const screens = { home: $("screen-home"), quiz: $("screen-quiz"), result: $("screen-result") };

function showScreen(name) {
  for (const key in screens) screens[key].hidden = key !== name;
  $("home-btn").hidden = name === "home";
  window.scrollTo(0, 0);
}

// ---------- ユーティリティ ----------
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 任意の単語リストの状態集計（現在の向き基準）
function statsOf(words) {
  const dir = state.direction;
  const c = { correct: 0, wrong: 0, unsure: 0, unseen: 0, total: words.length };
  for (const w of words) {
    const st = getStatus(dir, w.key);
    if (st === "correct") c.correct++;
    else if (st === "wrong") c.wrong++;
    else if (st === "unsure") c.unsure++;
    else c.unseen++;
  }
  return c;
}
function wordsByStatus(words, types) {
  const dir = state.direction;
  return words.filter((w) => types.includes(getStatus(dir, w.key)));
}

// ---------- ホーム画面 ----------
function buildHome() {
  $("total-info").textContent = `全 ${WORDS.length} 語 / ${SETS.length} セット`;
  const list = $("set-list");
  list.innerHTML = "";

  SETS.forEach((set, i) => {
    const start = i * SET_SIZE + 1;
    const end = start + set.length - 1;
    const c = statsOf(set);
    const pct = Math.round((c.correct / c.total) * 100);

    const card = document.createElement("button");
    card.className = "set-btn";
    card.innerHTML = `
      <div class="set-head">
        <span class="set-num">セット ${i + 1}</span>
        <span class="set-master">${pct}% 習得</span>
      </div>
      <span class="set-range">${start} 〜 ${end} 語目 ・ ${set.length} 語</span>
      <div class="mini-bar">
        <span class="seg-correct" style="width:${(c.correct / c.total) * 100}%"></span>
        <span class="seg-wrong" style="width:${(c.wrong / c.total) * 100}%"></span>
        <span class="seg-unsure" style="width:${(c.unsure / c.total) * 100}%"></span>
      </div>
      <div class="mini-legend">
        <span class="t-correct">⭕${c.correct}</span>
        <span class="t-wrong">❌${c.wrong}</span>
        <span class="t-unsure">🤔${c.unsure}</span>
        <span class="t-unseen">・未${c.unseen}</span>
      </div>`;
    card.addEventListener("click", () => startNormal(i));
    list.appendChild(card);
  });

  // 全体の復習対象数
  const all = statsOf(WORDS);
  $("cnt-wrong").textContent = `(${all.wrong})`;
  $("cnt-wu").textContent = `(${all.wrong + all.unsure})`;
  $("rev-wrong").disabled = all.wrong === 0;
  $("rev-wrong-unsure").disabled = (all.wrong + all.unsure) === 0;
}

// 出題の向き切替
document.querySelectorAll("#dir-seg .seg-btn").forEach((b) => {
  b.addEventListener("click", () => {
    document.querySelectorAll("#dir-seg .seg-btn").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    state.direction = b.dataset.dir;
    buildHome();
  });
});

// ---------- セッション開始 ----------
// 共通の開始処理。pool=最初に出す単語、scopeWords=グラフ対象、label=タイトル
function startSession({ pool, scopeWords, setIndex, label, restart }) {
  state.scopeWords = scopeWords;
  state.scopeLabel = label;
  state.setIndex = setIndex;
  state.restart = restart;
  state.session = { correct: 0, wrong: 0, unsure: 0, skip: 0 };
  state.skipped = new Set();
  state.queue = shuffle(pool);
  state.poolSize = state.queue.length;
  if (state.queue.length === 0) { showResult(); return; }
  showScreen("quiz");
  nextQuestion();
}

// ① 通常学習：過去の実績にかかわらず全語を出題
function startNormal(i) {
  startSession({
    pool: SETS[i].slice(),
    scopeWords: SETS[i],
    setIndex: i,
    label: `セット ${i + 1}（通常学習）`,
    restart: () => startNormal(i),
  });
}

// ② 復習（間違い / 間違い＋自信なし）。scope: セット or 全体
function startReview(types, scopeWords, setIndex, scopeName) {
  const includeUnsure = types.includes("unsure");
  const label = `${scopeName}（${includeUnsure ? "間違い＋自信なし" : "間違いのみ"}）`;
  startSession({
    pool: wordsByStatus(scopeWords, types),
    scopeWords,
    setIndex,
    label,
    restart: () => startReview(types, scopeWords, setIndex, scopeName),
  });
}

// ---------- 出題 ----------
function nextQuestion() {
  if (state.queue.length === 0) { showResult(); return; }
  state.current = state.queue.shift();
  renderQuestion();
}

function renderQuestion() {
  const item = state.current;
  const cleared = state.session.correct + state.skipped.size;

  $("quiz-title").textContent = state.scopeLabel;
  $("quiz-count").textContent = `残り ${state.queue.length + 1} 語`;
  $("quiz-progress").style.width = `${state.poolSize ? (cleared / state.poolSize) * 100 : 0}%`;

  if (state.direction === "en2ja") {
    $("q-direction").textContent = "この英単語の意味は？";
    $("q-word").textContent = item.word;
    $("q-word").classList.add("is-en");
  } else {
    $("q-direction").textContent = "この意味の英単語は？";
    $("q-word").textContent = item.meaning;
    $("q-word").classList.remove("is-en");
  }

  // 表示リセット：判定ボタンは「答えを見る」まで出さない
  $("choices").hidden = true;
  $("choices").innerHTML = "";
  $("answer-box").hidden = true;
  $("pre-action").hidden = false;
  $("grade-action").hidden = true;
  $("hint-btn").disabled = false;

  renderLiveTally();
}

// ---------- 4択ヒント ----------
function showHint() {
  const item = state.current;
  const isEn2Ja = state.direction === "en2ja";
  const correct = isEn2Ja ? item.meaning : item.word;
  const field = isEn2Ja ? "meaning" : "word";

  const pool = shuffle(WORDS.filter((w) => w[field] !== correct));
  const seen = new Set([correct]);
  const distractors = [];
  for (const w of pool) {
    if (!seen.has(w[field])) { seen.add(w[field]); distractors.push(w[field]); }
    if (distractors.length === 3) break;
  }
  const options = shuffle([correct, ...distractors]);

  const box = $("choices");
  box.innerHTML = "";
  box.dataset.done = "";
  options.forEach((opt) => {
    const b = document.createElement("button");
    b.className = "choice";
    b.textContent = opt;
    b.addEventListener("click", () => {
      if (box.dataset.done) return;
      box.dataset.done = "1";
      Array.from(box.children).forEach((c) => {
        c.disabled = true;
        if (c.textContent === correct) c.classList.add("choice-correct");
        else if (c === b) c.classList.add("choice-wrong");
      });
    });
    box.appendChild(b);
  });
  box.hidden = false;
  $("hint-btn").disabled = true;
}

// ---------- 答え表示 ----------
function revealAnswer() {
  const item = state.current;
  const isEn2Ja = state.direction === "en2ja";
  $("a-meaning").innerHTML = isEn2Ja
    ? `<span class="amw">${item.word}</span> ＝ ${item.meaning}`
    : `${item.meaning} ＝ <span class="amw">${item.word}</span>`;
  $("a-sent-en").textContent = item.sentEn;
  $("a-sent-ja").textContent = item.sentJa;

  $("answer-box").hidden = false;
  $("pre-action").hidden = true;
  $("grade-action").hidden = false; // ← 判定ボタンは答えの画面でのみ表示
}

// ---------- 採点（マスタリーループ） ----------
function grade(result) {
  const w = state.current;
  const dir = state.direction;
  state.session[result]++;

  if (result === "skip") {
    state.skipped.add(w.key); // 記録せず、この回はもう出さない
  } else {
    setStatus(dir, w.key, result);
    // 不正解・自信がない → 正解できるまで繰り返すため末尾に戻す
    if (result === "wrong" || result === "unsure") state.queue.push(w);
  }
  nextQuestion();
}

function renderLiveTally() {
  const s = state.session;
  $("live-tally").innerHTML =
    `<span class="t-correct">⭕ ${s.correct}</span>` +
    `<span class="t-wrong">❌ ${s.wrong}</span>` +
    `<span class="t-unsure">🤔 ${s.unsure}</span>` +
    `<span class="t-skip">⏭ ${s.skip}</span>`;
}

// ---------- 結果 / 進捗グラフ ----------
function showResult() {
  const c = statsOf(state.scopeWords);
  $("result-title").textContent = `${state.scopeLabel} の進捗`;

  const rows = [
    { label: "正解", value: c.correct, cls: "bar-correct" },
    { label: "不正解", value: c.wrong, cls: "bar-wrong" },
    { label: "自信がない", value: c.unsure, cls: "bar-unsure" },
    { label: "未学習", value: c.unseen, cls: "bar-unseen" },
  ];
  const max = Math.max(1, ...rows.map((r) => r.value));

  const chart = $("chart");
  chart.innerHTML = "";
  rows.forEach((r) => {
    const pct = Math.round((r.value / c.total) * 100);
    const row = document.createElement("div");
    row.className = "chart-row";
    row.innerHTML = `
      <span class="chart-label">${r.label}</span>
      <div class="chart-bar-track">
        <div class="chart-bar ${r.cls}" style="width:${(r.value / max) * 100}%"></div>
      </div>
      <span class="chart-value">${r.value} 語 (${pct}%)</span>`;
    chart.appendChild(row);
  });

  $("legend").innerHTML =
    `<span>習得 ${c.correct} / ${c.total} 語</span>` +
    `<span>今回の対象外 ${state.skipped.size} 語</span>`;

  // 結果画面の復習ボタン（このセッションのスコープ対象）
  const scope = state.scopeWords;
  const scopeName = state.setIndex !== null ? `セット ${state.setIndex + 1}` : "全体";
  $("res-cnt-wrong").textContent = `(${c.wrong})`;
  $("res-cnt-wu").textContent = `(${c.wrong + c.unsure})`;
  $("res-rev-wrong").disabled = c.wrong === 0;
  $("res-rev-wu").disabled = (c.wrong + c.unsure) === 0;
  $("res-rev-wrong").onclick = () => startReview(["wrong"], scope, state.setIndex, scopeName);
  $("res-rev-wu").onclick = () => startReview(["wrong", "unsure"], scope, state.setIndex, scopeName);

  $("review-hint").textContent = (c.correct === c.total)
    ? "🎉 この範囲はすべて正解になりました！"
    : `この範囲の未習得：不正解 ${c.wrong} 語 / 自信がない ${c.unsure} 語 / 未学習 ${c.unseen} 語`;

  showScreen("result");
}

// ---------- イベント結線 ----------
$("hint-btn").addEventListener("click", showHint);
$("reveal-btn").addEventListener("click", revealAnswer);
document.querySelectorAll("#grade-action .grade").forEach((b) => {
  b.addEventListener("click", () => grade(b.dataset.grade));
});

$("home-btn").addEventListener("click", () => {
  if (confirm("ホームに戻ります。（これまでの判定は保存されています）")) {
    buildHome();
    showScreen("home");
  }
});
$("result-home").addEventListener("click", () => { buildHome(); showScreen("home"); });
$("retry-btn").addEventListener("click", () => { if (state.restart) state.restart(); });

// ホームの全体復習ボタン
$("rev-wrong").addEventListener("click", () => startReview(["wrong"], WORDS, null, "全体"));
$("rev-wrong-unsure").addEventListener("click", () => startReview(["wrong", "unsure"], WORDS, null, "全体"));

// 全記録リセット：まず確認ボタンを表示し、「はい」で実行
$("reset-all").addEventListener("click", () => {
  $("reset-confirm").hidden = false;
  $("reset-all").hidden = true;
});
$("reset-no").addEventListener("click", () => {
  $("reset-confirm").hidden = true;
  $("reset-all").hidden = false;
});
$("reset-yes").addEventListener("click", () => {
  progress = { en2ja: {}, ja2en: {} };
  saveProgress();
  $("reset-confirm").hidden = true;
  $("reset-all").hidden = false;
  buildHome();
});

// ---------- 起動 ----------
buildHome();
showScreen("home");
