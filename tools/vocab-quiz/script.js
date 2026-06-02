const PHRASES = [
  // 動詞句
  { en: "account for", ja: "〜を説明する／〜を占める", category: "動詞句" },
  { en: "amount to", ja: "〜に達する／〜に相当する", category: "動詞句" },
  { en: "apply to", ja: "〜に適用する／〜に当てはまる", category: "動詞句" },
  { en: "ask for", ja: "〜を求める", category: "動詞句" },
  { en: "be acquainted with", ja: "〜と知り合いである", category: "動詞句" },
  { en: "be anxious about", ja: "〜について心配している", category: "動詞句" },
  { en: "be at a loss", ja: "途方に暮れる", category: "動詞句" },
  { en: "be aware of", ja: "〜を知っている／〜に気づいている", category: "動詞句" },
  { en: "be concerned about", ja: "〜について心配している", category: "動詞句" },
  { en: "be equal to", ja: "〜に等しい／〜に匹敵する", category: "動詞句" },
  { en: "be familiar with", ja: "〜に精通している", category: "動詞句" },
  { en: "be free from(of)", ja: "〜がない／〜から解放されている", category: "動詞句" },
  { en: "be guilty of", ja: "〜の罪を犯している", category: "動詞句" },
  { en: "be in charge of", ja: "〜を担当している", category: "動詞句" },
  { en: "be known to", ja: "〜に知られている", category: "動詞句" },
  { en: "be likely to", ja: "〜しそうだ", category: "動詞句" },
  { en: "be sick of", ja: "〜にうんざりしている", category: "動詞句" },
  { en: "be sold out", ja: "売り切れている", category: "動詞句" },
  { en: "be subject to", ja: "〜を受けやすい／〜の対象である", category: "動詞句" },
  { en: "be well off", ja: "裕福である", category: "動詞句" },
  { en: "be willing to", ja: "喜んで〜する／〜する意志がある", category: "動詞句" },
  { en: "be worthy of", ja: "〜に値する", category: "動詞句" },
  { en: "break into", ja: "〜に押し入る／〜を始める", category: "動詞句" },
  { en: "break out", ja: "勃発する／脱出する", category: "動詞句" },
  { en: "bring about", ja: "〜を引き起こす", category: "動詞句" },
  { en: "bring down", ja: "〜を倒す／〜を下げる", category: "動詞句" },
  { en: "bring on", ja: "〜を引き起こす", category: "動詞句" },
  { en: "bring up", ja: "〜を育てる／〜を持ち出す", category: "動詞句" },
  { en: "call for", ja: "〜を必要とする／〜を求める", category: "動詞句" },
  { en: "call in", ja: "呼び寄せる／立ち寄る", category: "動詞句" },
  { en: "call off", ja: "〜を中止する", category: "動詞句" },
  { en: "call on", ja: "〜を訪問する／〜に呼びかける", category: "動詞句" },
  { en: "calm down", ja: "落ち着く", category: "動詞句" },
  { en: "carry on", ja: "続ける", category: "動詞句" },
  { en: "carry out", ja: "〜を実行する", category: "動詞句" },
  { en: "check out", ja: "〜を調べる／チェックアウトする", category: "動詞句" },
  { en: "check in", ja: "チェックインする", category: "動詞句" },
  { en: "clear away", ja: "〜を片付ける", category: "動詞句" },
  { en: "come about", ja: "起こる", category: "動詞句" },
  { en: "come across", ja: "〜に偶然出会う", category: "動詞句" },
  { en: "come down", ja: "下がる／降りる", category: "動詞句" },
  { en: "come up", ja: "浮かび上がる／出てくる", category: "動詞句" },
  { en: "cope with", ja: "〜に対処する", category: "動詞句" },
  { en: "count on", ja: "〜を頼りにする", category: "動詞句" },
  { en: "cut off", ja: "〜を切り離す／〜を遮断する", category: "動詞句" },
  { en: "deal with", ja: "〜を扱う／〜に対処する", category: "動詞句" },
  { en: "decide on", ja: "〜に決める", category: "動詞句" },
  { en: "do away with", ja: "〜を廃止する", category: "動詞句" },
  { en: "fall down(over)", ja: "倒れる", category: "動詞句" },
  { en: "fight over", ja: "〜をめぐって争う", category: "動詞句" },
  { en: "figure out", ja: "〜を理解する／〜を解決する", category: "動詞句" },
  { en: "find out", ja: "〜を発見する／〜を知る", category: "動詞句" },
  { en: "get along with", ja: "〜とうまくやる", category: "動詞句" },
  { en: "get away from", ja: "〜から離れる", category: "動詞句" },
  { en: "get in touch with", ja: "〜と連絡を取る", category: "動詞句" },
  { en: "get over", ja: "〜を克服する", category: "動詞句" },
  { en: "get used to", ja: "〜に慣れる", category: "動詞句" },
  { en: "give a ride", ja: "車に乗せてあげる", category: "動詞句" },
  { en: "go after", ja: "〜を追いかける", category: "動詞句" },
  { en: "go along with", ja: "〜に同意する", category: "動詞句" },
  { en: "go on", ja: "続く／起こる", category: "動詞句" },
  { en: "go over", ja: "〜を見直す", category: "動詞句" },
  { en: "go through", ja: "〜を経験する／〜を通り抜ける", category: "動詞句" },
  { en: "hand in", ja: "〜を提出する", category: "動詞句" },
  { en: "hand down", ja: "〜を伝える／〜を手渡す", category: "動詞句" },
  { en: "hand over", ja: "〜を引き渡す", category: "動詞句" },
  { en: "hand out", ja: "〜を配る", category: "動詞句" },
  { en: "have ~ in common", ja: "〜を共通して持つ", category: "動詞句" },
  { en: "have no idea", ja: "全くわからない", category: "動詞句" },
  { en: "have room for", ja: "〜の余地がある", category: "動詞句" },
  { en: "hold the line", ja: "電話を切らずに待つ", category: "動詞句" },
  { en: "keep off", ja: "〜に近づかない", category: "動詞句" },
  { en: "lay off", ja: "〜を解雇する", category: "動詞句" },
  { en: "leave for", ja: "〜に向けて出発する", category: "動詞句" },
  { en: "look after", ja: "〜の世話をする", category: "動詞句" },
  { en: "long for", ja: "〜を切望する", category: "動詞句" },
  { en: "look into", ja: "〜を調べる", category: "動詞句" },
  { en: "look over", ja: "〜をざっと見る", category: "動詞句" },
  { en: "look up to", ja: "〜を尊敬する", category: "動詞句" },
  { en: "lose one's way", ja: "道に迷う", category: "動詞句" },
  { en: "make an appointment", ja: "約束をする", category: "動詞句" },
  { en: "make a difference", ja: "違いをもたらす", category: "動詞句" },
  { en: "make do with", ja: "〜で間に合わせる", category: "動詞句" },
  { en: "make fun of", ja: "〜をからかう", category: "動詞句" },
  { en: "make it", ja: "成功する／間に合う", category: "動詞句" },
  { en: "make money", ja: "お金を稼ぐ", category: "動詞句" },
  { en: "make sure", ja: "確認する", category: "動詞句" },
  { en: "make up", ja: "〜を作り上げる／仲直りする", category: "動詞句" },
  { en: "move on", ja: "前進する", category: "動詞句" },
  { en: "pass away", ja: "亡くなる", category: "動詞句" },
  { en: "pass for", ja: "〜として通る", category: "動詞句" },
  { en: "pass on A to B", ja: "AをBに伝える", category: "動詞句" },
  { en: "pick out", ja: "〜を選ぶ", category: "動詞句" },
  { en: "pick up", ja: "〜を拾う／〜を迎えに行く", category: "動詞句" },
  { en: "provide A with B", ja: "AにBを提供する", category: "動詞句" },
  { en: "pull back", ja: "引き下がる", category: "動詞句" },
  { en: "pull over", ja: "車を端に寄せる", category: "動詞句" },
  { en: "put away", ja: "〜を片付ける", category: "動詞句" },
  { en: "put off", ja: "〜を延期する", category: "動詞句" },
  { en: "put out", ja: "〜を消す", category: "動詞句" },
  { en: "put on", ja: "〜を着る", category: "動詞句" },
  { en: "put in", ja: "〜を入れる", category: "動詞句" },
  { en: "put together", ja: "〜を組み立てる", category: "動詞句" },
  { en: "put up", ja: "〜を掲げる／〜を泊める", category: "動詞句" },
  { en: "put up with", ja: "〜を我慢する", category: "動詞句" },
  { en: "refrain from doing", ja: "〜することを控える", category: "動詞句" },
  { en: "refer to", ja: "〜を参照する／〜に言及する", category: "動詞句" },
  { en: "remind A of B", ja: "AにBを思い出させる", category: "動詞句" },
  { en: "report to", ja: "〜に報告する", category: "動詞句" },
  { en: "rule out", ja: "〜を除外する", category: "動詞句" },
  { en: "run away from", ja: "〜から逃げる", category: "動詞句" },
  { en: "save up", ja: "〜を貯蓄する", category: "動詞句" },
  { en: "send out", ja: "〜を送り出す", category: "動詞句" },
  { en: "settle down", ja: "落ち着く／定住する", category: "動詞句" },
  { en: "sound like", ja: "〜のように聞こえる", category: "動詞句" },
  { en: "sign up for", ja: "〜に登録する", category: "動詞句" },
  { en: "sit back", ja: "くつろぐ", category: "動詞句" },
  { en: "sit up", ja: "起き上がる／夜更かしする", category: "動詞句" },
  { en: "stand out", ja: "目立つ", category: "動詞句" },
  { en: "sum up", ja: "〜を要約する", category: "動詞句" },
  { en: "take advantage of", ja: "〜を利用する", category: "動詞句" },
  { en: "take after", ja: "〜に似ている", category: "動詞句" },
  { en: "take a look at", ja: "〜をちょっと見る", category: "動詞句" },
  { en: "take away", ja: "〜を取り除く", category: "動詞句" },
  { en: "take into account", ja: "〜を考慮する", category: "動詞句" },
  { en: "take over", ja: "〜を引き継ぐ", category: "動詞句" },
  { en: "take place", ja: "起こる", category: "動詞句" },
  { en: "take one's place", ja: "〜の代わりをする", category: "動詞句" },
  { en: "take up", ja: "〜を始める／〜を占める", category: "動詞句" },
  { en: "tell A from B", ja: "AとBを区別する", category: "動詞句" },
  { en: "think of", ja: "〜を考える／〜を思いつく", category: "動詞句" },
  { en: "turn away", ja: "〜を追い返す", category: "動詞句" },
  { en: "turn down", ja: "〜を断る／〜を下げる", category: "動詞句" },
  { en: "turn out", ja: "〜であると判明する", category: "動詞句" },
  { en: "turn over", ja: "〜をひっくり返す／〜を引き渡す", category: "動詞句" },
  { en: "turn up", ja: "現れる／〜を上げる", category: "動詞句" },
  { en: "use up", ja: "〜を使い果たす", category: "動詞句" },
  { en: "watch out for", ja: "〜に気をつける", category: "動詞句" },
  { en: "wear out", ja: "〜を使い古す／疲れ果てる", category: "動詞句" },
  { en: "work on", ja: "〜に取り組む", category: "動詞句" },
  // 副詞句・前置詞句
  { en: "above all", ja: "何より／とりわけ", category: "副詞句" },
  { en: "according to", ja: "〜によると", category: "副詞句" },
  { en: "after all", ja: "やはり／結局", category: "副詞句" },
  { en: "a lack of", ja: "〜の不足", category: "副詞句" },
  { en: "as a matter of fact", ja: "実のところ", category: "副詞句" },
  { en: "at all times", ja: "いつでも", category: "副詞句" },
  { en: "at any cost", ja: "いかなる犠牲を払っても", category: "副詞句" },
  { en: "at least", ja: "少なくとも", category: "副詞句" },
  { en: "at random", ja: "無作為に", category: "副詞句" },
  { en: "at the most", ja: "多くても", category: "副詞句" },
  { en: "at this time", ja: "現在", category: "副詞句" },
  { en: "at times", ja: "時々", category: "副詞句" },
  { en: "back and forth", ja: "行ったり来たり", category: "副詞句" },
  { en: "beyond one's reach", ja: "〜の手の届かないところに", category: "副詞句" },
  { en: "by degrees", ja: "徐々に", category: "副詞句" },
  { en: "by means of", ja: "〜によって", category: "副詞句" },
  { en: "by nature", ja: "生まれつき", category: "副詞句" },
  { en: "by no means", ja: "決して〜ない", category: "副詞句" },
  { en: "close to", ja: "〜の近くに", category: "副詞句" },
  { en: "due to", ja: "〜のために（原因）", category: "副詞句" },
  { en: "even if", ja: "たとえ〜でも", category: "副詞句" },
  { en: "for a change", ja: "気分転換に", category: "副詞句" },
  { en: "for free", ja: "無料で", category: "副詞句" },
  { en: "for good", ja: "永久に", category: "副詞句" },
  { en: "for the time being", ja: "当分の間", category: "副詞句" },
  { en: "in addition to", ja: "〜に加えて", category: "副詞句" },
  { en: "in advance", ja: "前もって", category: "副詞句" },
  { en: "in a row", ja: "連続して", category: "副詞句" },
  { en: "in general", ja: "一般的に", category: "副詞句" },
  { en: "in favor of", ja: "〜を支持して", category: "副詞句" },
  { en: "in order to", ja: "〜するために", category: "副詞句" },
  { en: "in person", ja: "直接／本人が", category: "副詞句" },
  { en: "in progress", ja: "進行中", category: "副詞句" },
  { en: "in public", ja: "公の場で", category: "副詞句" },
  { en: "in terms of", ja: "〜の観点から", category: "副詞句" },
  { en: "in the first place", ja: "そもそも", category: "副詞句" },
  { en: "in the long run", ja: "長い目で見れば", category: "副詞句" },
  { en: "in time", ja: "間に合って", category: "副詞句" },
  { en: "in search of", ja: "〜を探して", category: "副詞句" },
  { en: "in shape", ja: "体調が良い", category: "副詞句" },
  { en: "in short", ja: "要するに", category: "副詞句" },
  { en: "instead of", ja: "〜の代わりに", category: "副詞句" },
  { en: "in the middle of", ja: "〜の真っ最中に", category: "副詞句" },
  { en: "in turn", ja: "順番に／結果として", category: "副詞句" },
  { en: "no matter how", ja: "たとえどんなに〜でも", category: "副詞句" },
  { en: "now that", ja: "今や〜だから", category: "副詞句" },
  { en: "on behalf of", ja: "〜を代表して", category: "副詞句" },
  { en: "on board", ja: "搭乗して／賛同して", category: "副詞句" },
  { en: "on purpose", ja: "わざと", category: "副詞句" },
  { en: "on the contrary", ja: "それどころか", category: "副詞句" },
  { en: "on the other hand", ja: "一方", category: "副詞句" },
  { en: "out of control", ja: "制御できなくなって", category: "副詞句" },
  { en: "out of date", ja: "時代遅れで", category: "副詞句" },
  { en: "owing to", ja: "〜のために（原因）", category: "副詞句" },
  { en: "side by side", ja: "並んで", category: "副詞句" },
  { en: "sooner or later", ja: "遅かれ早かれ", category: "副詞句" },
  { en: "thanks to", ja: "〜のおかげで", category: "副詞句" },
  { en: "there is no doing", ja: "〜することはできない", category: "副詞句" },
  { en: "these days", ja: "最近", category: "副詞句" },
  { en: "to some extent", ja: "ある程度", category: "副詞句" },
  { en: "upside down", ja: "逆さまに", category: "副詞句" },
];

// ─── State ───────────────────────────────────────────────────────────────────
const STORAGE_KEY = "vocabQuizProgress";

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

let progress = loadProgress();
let currentMode = "flashcard";
let currentCategory = "all";
let currentList = [];
let currentIndex = 0;
let score = { correct: 0, total: 0 };
let quizChoices = [];
let isFlipped = false;
let typingAnswered = false;

function getFilteredList() {
  let list = currentCategory === "all" ? PHRASES : PHRASES.filter(p => p.category === currentCategory);
  return shuffle([...list]);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getStarCount(en) {
  const p = progress[en];
  if (!p) return 0;
  return p.stars || 0;
}

function setStarCount(en, stars) {
  if (!progress[en]) progress[en] = {};
  progress[en].stars = stars;
  saveProgress(progress);
}

function recordResult(en, correct) {
  if (!progress[en]) progress[en] = { correct: 0, wrong: 0, stars: 0 };
  if (correct) {
    progress[en].correct = (progress[en].correct || 0) + 1;
  } else {
    progress[en].wrong = (progress[en].wrong || 0) + 1;
  }
  saveProgress(progress);
}

// ─── Rendering ───────────────────────────────────────────────────────────────
function renderStars(en) {
  const count = getStarCount(en);
  return [1, 2, 3].map(i =>
    `<button class="star ${i <= count ? 'active' : ''}" data-en="${en}" data-star="${i}" title="${i}つ星">★</button>`
  ).join("");
}

function renderProgress() {
  const total = PHRASES.length;
  const learned = Object.values(progress).filter(p => (p.stars || 0) >= 2).length;
  const pct = Math.round((learned / total) * 100);
  document.getElementById("progress-bar").style.width = pct + "%";
  document.getElementById("progress-text").textContent = `${learned} / ${total} 習得済み`;
}

function renderScoreBoard() {
  const el = document.getElementById("score-board");
  if (score.total === 0) { el.textContent = ""; return; }
  const pct = Math.round((score.correct / score.total) * 100);
  el.textContent = `正解率: ${score.correct} / ${score.total}  (${pct}%)`;
}

// ─── Flashcard mode ───────────────────────────────────────────────────────────
function startFlashcard() {
  currentList = getFilteredList();
  currentIndex = 0;
  score = { correct: 0, total: 0 };
  renderScoreBoard();
  showFlashcard();
}

function showFlashcard() {
  if (currentIndex >= currentList.length) {
    showFinished();
    return;
  }
  isFlipped = false;
  const phrase = currentList[currentIndex];
  const container = document.getElementById("card-area");
  container.innerHTML = `
    <div class="counter">${currentIndex + 1} / ${currentList.length}</div>
    <div class="flashcard" id="flashcard" tabindex="0">
      <div class="card-inner" id="card-inner">
        <div class="card-front">
          <span class="category-tag">${phrase.category}</span>
          <div class="phrase-en">${phrase.en}</div>
          <div class="hint">クリックで日本語を表示</div>
        </div>
        <div class="card-back">
          <span class="category-tag">${phrase.category}</span>
          <div class="phrase-en">${phrase.en}</div>
          <div class="phrase-ja">${phrase.ja}</div>
          <div class="stars-row">${renderStars(phrase.en)}</div>
          <div class="flashcard-btns">
            <button class="btn btn-wrong" id="btn-wrong">✗ 覚えていない</button>
            <button class="btn btn-correct" id="btn-correct">✓ 覚えた！</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById("flashcard").addEventListener("click", flipCard);
  document.getElementById("flashcard").addEventListener("keydown", e => {
    if (e.key === " " || e.key === "Enter") flipCard();
    if (e.key === "ArrowRight" && isFlipped) nextFlashcard(true);
    if (e.key === "ArrowLeft" && isFlipped) nextFlashcard(false);
  });
  document.getElementById("flashcard").focus();
  bindStarButtons();
}

function flipCard() {
  if (isFlipped) return;
  isFlipped = true;
  document.getElementById("card-inner").classList.add("flipped");
  const phrase = currentList[currentIndex];
  document.getElementById("btn-correct").addEventListener("click", e => { e.stopPropagation(); nextFlashcard(true); });
  document.getElementById("btn-wrong").addEventListener("click", e => { e.stopPropagation(); nextFlashcard(false); });
}

function nextFlashcard(correct) {
  const phrase = currentList[currentIndex];
  recordResult(phrase.en, correct);
  score.total++;
  if (correct) score.correct++;
  renderScoreBoard();
  renderProgress();
  currentIndex++;
  showFlashcard();
}

// ─── 4択モード ─────────────────────────────────────────────────────────────────
function startChoice() {
  currentList = getFilteredList();
  currentIndex = 0;
  score = { correct: 0, total: 0 };
  renderScoreBoard();
  showChoice();
}

function showChoice() {
  if (currentIndex >= currentList.length) {
    showFinished();
    return;
  }
  const phrase = currentList[currentIndex];
  const others = PHRASES.filter(p => p.en !== phrase.en);
  const wrong = shuffle(others).slice(0, 3);
  quizChoices = shuffle([phrase, ...wrong]);

  const container = document.getElementById("card-area");
  container.innerHTML = `
    <div class="counter">${currentIndex + 1} / ${currentList.length}</div>
    <div class="choice-question">
      <span class="category-tag">${phrase.category}</span>
      <div class="phrase-en">${phrase.en}</div>
    </div>
    <div class="choice-options">
      ${quizChoices.map((c, i) => `
        <button class="choice-btn" data-index="${i}">${c.ja}</button>
      `).join("")}
    </div>
    <div id="choice-feedback" class="feedback"></div>
  `;
  container.querySelectorAll(".choice-btn").forEach(btn => {
    btn.addEventListener("click", () => handleChoice(parseInt(btn.dataset.index), phrase));
  });
}

function handleChoice(idx, phrase) {
  const chosen = quizChoices[idx];
  const correct = chosen.en === phrase.en;
  recordResult(phrase.en, correct);
  score.total++;
  if (correct) score.correct++;
  renderScoreBoard();

  const btns = document.querySelectorAll(".choice-btn");
  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (quizChoices[i].en === phrase.en) btn.classList.add("correct");
    else if (i === idx && !correct) btn.classList.add("wrong");
  });

  const fb = document.getElementById("choice-feedback");

  if (correct) {
    fb.innerHTML = `
      <span class="correct-text">正解！</span> ${phrase.en} = ${phrase.ja}
      <div class="stars-row">${renderStars(phrase.en)}</div>
      <div class="choice-action-btns">
        <button class="btn btn-next" id="btn-count-next">次へ →</button>
        <button class="btn btn-no-count" id="btn-no-count">カウントしない</button>
      </div>`;
    bindStarButtons();
    document.getElementById("btn-count-next").addEventListener("click", () => {
      currentIndex++;
      renderProgress();
      showChoice();
    });
    document.getElementById("btn-no-count").addEventListener("click", () => {
      score.correct--;
      score.total--;
      if (progress[phrase.en]) {
        progress[phrase.en].correct = Math.max(0, (progress[phrase.en].correct || 0) - 1);
        saveProgress(progress);
      }
      renderScoreBoard();
      currentIndex++;
      renderProgress();
      showChoice();
    });
  } else {
    fb.innerHTML = `<span class="wrong-text">不正解</span> 正解: ${phrase.ja}
       <div class="stars-row">${renderStars(phrase.en)}</div>`;
    bindStarButtons();
    setTimeout(() => {
      currentIndex++;
      renderProgress();
      showChoice();
    }, 1500);
  }
}

// ─── タイピングモード ────────────────────────────────────────────────────────────
function startTyping() {
  currentList = getFilteredList();
  currentIndex = 0;
  score = { correct: 0, total: 0 };
  renderScoreBoard();
  showTyping();
}

function showTyping() {
  if (currentIndex >= currentList.length) {
    showFinished();
    return;
  }
  typingAnswered = false;
  const phrase = currentList[currentIndex];
  const container = document.getElementById("card-area");
  container.innerHTML = `
    <div class="counter">${currentIndex + 1} / ${currentList.length}</div>
    <div class="typing-question">
      <span class="category-tag">${phrase.category}</span>
      <div class="phrase-ja-big">${phrase.ja}</div>
      <div class="typing-hint">↑ の日本語に対応する英熟語を入力してください</div>
    </div>
    <div class="typing-input-row">
      <input type="text" id="typing-input" placeholder="英熟語を入力..." autocomplete="off" spellcheck="false" />
      <button class="btn btn-primary" id="typing-submit">確認</button>
    </div>
    <div id="typing-feedback" class="feedback"></div>
    <button class="btn btn-skip" id="typing-skip">スキップ</button>
  `;
  const input = document.getElementById("typing-input");
  const submitBtn = document.getElementById("typing-submit");
  const skipBtn = document.getElementById("typing-skip");
  input.focus();
  submitBtn.addEventListener("click", () => checkTyping(phrase));
  skipBtn.addEventListener("click", () => {
    recordResult(phrase.en, false);
    score.total++;
    renderScoreBoard();
    currentIndex++;
    renderProgress();
    showTyping();
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      if (!typingAnswered) checkTyping(phrase);
      else { currentIndex++; renderProgress(); showTyping(); }
    }
  });
}

function normalize(str) {
  return str.toLowerCase()
    .replace(/[''']/g, "'")
    .replace(/[～〜]/g, "~")
    .replace(/\s+/g, " ")
    .trim();
}

function checkTyping(phrase) {
  if (typingAnswered) return;
  const input = document.getElementById("typing-input");
  const val = normalize(input.value);
  const answer = normalize(phrase.en);
  const correct = val === answer;
  typingAnswered = true;
  recordResult(phrase.en, correct);
  score.total++;
  if (correct) score.correct++;
  renderScoreBoard();

  input.disabled = true;
  document.getElementById("typing-submit").disabled = true;
  const fb = document.getElementById("typing-feedback");
  if (correct) {
    fb.innerHTML = `<span class="correct-text">正解！</span>
      <div class="stars-row">${renderStars(phrase.en)}</div>`;
  } else {
    fb.innerHTML = `<span class="wrong-text">不正解</span> 正解: <strong>${phrase.en}</strong>
      <div class="stars-row">${renderStars(phrase.en)}</div>`;
  }
  bindStarButtons();

  const nextBtn = document.createElement("button");
  nextBtn.className = "btn btn-next";
  nextBtn.textContent = "次へ →";
  nextBtn.addEventListener("click", () => { currentIndex++; renderProgress(); showTyping(); });
  fb.appendChild(nextBtn);
  nextBtn.focus();
}

// ─── 一覧モード ─────────────────────────────────────────────────────────────────
function showList() {
  const list = currentCategory === "all" ? PHRASES : PHRASES.filter(p => p.category === currentCategory);
  const container = document.getElementById("card-area");
  container.innerHTML = `
    <div class="list-header">
      <input type="text" id="list-search" placeholder="検索..." />
    </div>
    <table class="phrase-table">
      <thead><tr><th>英熟語</th><th>日本語</th><th>カテゴリ</th><th>習得度</th></tr></thead>
      <tbody id="phrase-tbody">
        ${list.map(p => `
          <tr>
            <td class="en-cell">${p.en}</td>
            <td class="ja-cell">${p.ja}</td>
            <td><span class="category-tag small">${p.category}</span></td>
            <td class="stars-cell">${renderStars(p.en)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
  bindStarButtons();
  document.getElementById("list-search").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll("#phrase-tbody tr").forEach(tr => {
      const text = tr.textContent.toLowerCase();
      tr.style.display = text.includes(q) ? "" : "none";
    });
  });
}

// ─── 完了画面 ──────────────────────────────────────────────────────────────────
function showFinished() {
  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  let msg = pct >= 90 ? "素晴らしい！" : pct >= 70 ? "よくできました！" : pct >= 50 ? "もう少しです！" : "もっと練習しましょう！";
  document.getElementById("card-area").innerHTML = `
    <div class="finished">
      <div class="finished-emoji">${pct >= 80 ? "🎉" : pct >= 60 ? "👍" : "💪"}</div>
      <h2>完了！</h2>
      <div class="finished-score">${score.correct} / ${score.total} 正解 (${pct}%)</div>
      <div class="finished-msg">${msg}</div>
      <button class="btn btn-primary" id="retry-btn">もう一度</button>
    </div>
  `;
  document.getElementById("retry-btn").addEventListener("click", startCurrentMode);
  renderProgress();
}

function startCurrentMode() {
  if (currentMode === "flashcard") startFlashcard();
  else if (currentMode === "choice") startChoice();
  else if (currentMode === "typing") startTyping();
  else if (currentMode === "list") showList();
}

// ─── Star buttons ─────────────────────────────────────────────────────────────
function bindStarButtons() {
  document.querySelectorAll(".star").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const en = btn.dataset.en;
      const star = parseInt(btn.dataset.star);
      const cur = getStarCount(en);
      setStarCount(en, cur === star ? star - 1 : star);
      renderProgress();
      document.querySelectorAll(`.star[data-en="${CSS.escape(en)}"]`).forEach(b => {
        b.classList.toggle("active", parseInt(b.dataset.star) <= getStarCount(en));
      });
    });
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderProgress();

  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.dataset.mode;
      score = { correct: 0, total: 0 };
      renderScoreBoard();
      startCurrentMode();
    });
  });

  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.cat;
      score = { correct: 0, total: 0 };
      renderScoreBoard();
      startCurrentMode();
    });
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("学習記録をリセットしますか？")) {
      progress = {};
      saveProgress(progress);
      renderProgress();
      startCurrentMode();
    }
  });

  startFlashcard();
});
