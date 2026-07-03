// =====================================================
// 都立高校入試 漢字マスター - メインロジック
// - 読み / 書き 両対応
// - 漢検レベル別出題・苦手復習・未出題
// - 自己採点（正解 / 不正解 / カウントしない）で履歴保存
// - 覚え方ヒント表示・音声読み上げ・問題追加
// すべてブラウザの localStorage に保存（バックエンドなし）
// =====================================================

(function () {
  'use strict';

  var LS_HISTORY = 'toritsu-kanji.history.v1'; // 各問題の成績 { id: {correct, wrong, lastResult} }
  var LS_CUSTOM  = 'toritsu-kanji.custom.v1';  // ユーザー追加問題の配列
  var LS_DAILY   = 'toritsu-kanji.daily.v1';   // 日別の学習量 { 'YYYY-MM-DD': {correct,wrong,skip,flash} }
  var GOAL_RATE  = 0.9;                        // 都立9割目標
  var MASTER_HITS = 2;                         // 連続正解でマスター扱いにする回数
  var QUESTIONS_PER_SESSION = 20;

  // ---- 一意なIDを語＋読みから生成（追加問題と重複しない安定キー） ----
  function makeId(q) {
    return q.word + '|' + q.reading;
  }

  // ---- データ読み込み（組み込み＋ユーザー追加） ----
  function loadAllQuestions() {
    var base = (window.KANJI_DATA || []).slice();
    var custom = readJSON(LS_CUSTOM, []);
    var all = base.concat(custom);
    all.forEach(function (q) { q.id = makeId(q); });
    return all;
  }

  // ---- localStorage ヘルパ ----
  function readJSON(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  var history = readJSON(LS_HISTORY, {});
  var daily = readJSON(LS_DAILY, {});
  var allQuestions = loadAllQuestions();

  // ---- 日別学習ログ ----
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function dateFromKey(key) {
    var p = key.split('-');
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  }
  // 目盛りの刻み幅を「きりのよい整数」で求める（1/2/5×10ⁿ、最小1）
  function niceStep(max, target) {
    var raw = max / target;
    var pow = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var n = raw / pow;
    var s = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return Math.max(1, s * pow);
  }
  // field: 'correct' | 'wrong' | 'skip' | 'flash'
  function logDaily(field) {
    var k = todayKey();
    var rec = daily[k] || { correct: 0, wrong: 0, skip: 0, flash: 0 };
    rec[field] = (rec[field] || 0) + 1;
    daily[k] = rec;
    writeJSON(LS_DAILY, daily);
  }

  // ---- 状態 ----
  var settings = { mode: 'reading', level: 'all', pool: 'all', autoSpeak: false, autoSpeed: 3, autoVoice: true };
  var session = { queue: [], index: 0, current: null, graded: false };
  var auto = { on: false, timer: null };

  // ---- DOM 参照 ----
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    controls: $('controls'), quiz: $('quiz'),
    qLevel: $('qLevel'), qMode: $('qMode'), qProgress: $('qProgress'),
    qPrompt: $('qPrompt'), qSentence: $('qSentence'),
    answerArea: $('answerArea'),
    revealBox: $('revealBox'), revealWord: $('revealWord'),
    revealReading: $('revealReading'), revealHint: $('revealHint'),
    kanjiRefs: $('kanjiRefs'),
    wordMeaning: $('wordMeaning'),
    dashboard: $('dashboard'),
    speakBtn: $('speakBtn'), revealBtn: $('revealBtn'),
    speakAnswerBtn: $('speakAnswerBtn'),
    statTotal: $('statTotal'), statCorrect: $('statCorrect'),
    statRate: $('statRate'), statWeak: $('statWeak'),
    goalFill: $('goalFill'), goalText: $('goalText'),
    totalCount: $('totalCount'),
    addModal: $('addModal'),
    addWord: $('addWord'), addReading: $('addReading'),
    addSentence: $('addSentence'), addLevel: $('addLevel'), addHint: $('addHint'),
    addError: $('addError')
  };

  // =====================================================
  // 統計 / ダッシュボード
  // =====================================================
  function isWeak(id) {
    var h = history[id];
    if (!h) return false;
    // 直近が不正解、または通算で間違いが正解を上回る＝苦手
    return h.lastResult === 'wrong' || (h.wrong || 0) > (h.correct || 0);
  }
  function isMastered(id) {
    var h = history[id];
    return h && h.lastResult === 'correct' && (h.correct || 0) >= MASTER_HITS;
  }

  function updateDashboard() {
    var totalCorrect = 0, totalWrong = 0, weak = 0, mastered = 0;
    Object.keys(history).forEach(function (id) {
      var h = history[id];
      totalCorrect += (h.correct || 0);
      totalWrong += (h.wrong || 0);
    });
    allQuestions.forEach(function (q) {
      if (isWeak(q.id)) weak++;
      if (isMastered(q.id)) mastered++;
    });

    var answered = totalCorrect + totalWrong;
    var rate = answered ? Math.round((totalCorrect / answered) * 100) : 0;

    el.totalCount.textContent = '収録 ' + allQuestions.length + ' 語（4〜2級）';
    el.statTotal.textContent = answered;
    el.statCorrect.textContent = totalCorrect;
    el.statRate.textContent = rate + '%';
    el.statWeak.textContent = weak;

    // 目標：全問の9割をマスターする
    var goalCount = Math.ceil(allQuestions.length * GOAL_RATE);
    var pct = Math.min(100, Math.round((mastered / goalCount) * 100));
    el.goalFill.style.width = pct + '%';
    if (mastered >= goalCount) {
      el.goalText.textContent = '🎉 都立9割水準を達成！（' + mastered + '語マスター）';
    } else {
      el.goalText.textContent = '都立9割まで あと ' + (goalCount - mastered) + ' 語マスター（' +
        mastered + ' / ' + goalCount + '）';
    }
  }

  // =====================================================
  // 出題キューの作成
  // =====================================================
  function buildQueue() {
    var pool = allQuestions.filter(function (q) {
      if (settings.level !== 'all' && q.level !== settings.level) return false;
      if (settings.pool === 'weak' && !isWeak(q.id)) return false;
      if (settings.pool === 'unseen' && history[q.id]) return false;
      return true;
    });

    // 苦手→未マスター→マスター済みの順で優先度を付け、各グループ内はシャッフル
    var weakG = [], freshG = [], doneG = [];
    pool.forEach(function (q) {
      if (isWeak(q.id)) weakG.push(q);
      else if (isMastered(q.id)) doneG.push(q);
      else freshG.push(q);
    });
    shuffle(weakG); shuffle(freshG); shuffle(doneG);
    var ordered = weakG.concat(freshG, doneG);
    return ordered.slice(0, QUESTIONS_PER_SESSION);
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // =====================================================
  // クイズ進行
  // =====================================================
  function startSession() {
    session.queue = buildQueue();
    session.index = 0;
    if (session.queue.length === 0) {
      alert('条件に合う問題がありません。範囲やレベルを変えてください。');
      return;
    }
    document.body.classList.add('quiz-active');
    el.controls.classList.add('hidden');
    el.quiz.classList.remove('hidden');
    showQuestion();
  }

  function showQuestion() {
    session.current = session.queue[session.index];
    session.graded = false;
    var q = session.current;

    el.qLevel.textContent = '漢検 ' + q.level;
    el.qMode.textContent = settings.mode === 'reading' ? '読み' : '書き';
    el.qProgress.textContent = (session.index + 1) + ' / ' + session.queue.length;

    if (settings.mode === 'reading') {
      el.qPrompt.textContent = '次の傍線部の読みをひらがなで答えなさい。';
      el.qSentence.innerHTML = renderSentence(q, 'reading');
    } else {
      el.qPrompt.textContent = '次の傍線部を漢字で書きなさい。（読み：' + q.reading + '）';
      el.qSentence.innerHTML = renderSentence(q, 'writing');
    }

    el.answerArea.classList.remove('hidden');
    el.revealBox.classList.add('hidden');

    // 自動再生中は問題文（読み以外の情報を明かさない）を読み上げない。
    // 通常モードで自動読み上げがオンのときのみ読み上げる。
    if (settings.autoSpeak && !auto.on) speak(readingText(q));
  }

  // 例文の { } 部分を、モードに応じて表示
  function renderSentence(q, mode) {
    var m = q.sentence.match(/\{([^}]*)\}/);
    var target = m ? m[1] : q.word;
    var replacement;
    if (mode === 'reading') {
      // 読み問題：漢字を見せて読みを問う
      replacement = '<span class="target">' + escapeHtml(target) + '</span>';
    } else {
      // 書き問題：空欄にして漢字を問う
      replacement = '<span class="blank">〔　　〕</span>';
    }
    return escapeHtml(q.sentence).replace(/\{[^}]*\}/, replacement);
  }

  // 対象語の各漢字の音読み・訓読みを参考表示（辞書にある字のみ）
  function renderKanjiRefs(word) {
    var dict = window.KANJI_READINGS || {};
    var seen = {};
    var html = '';
    for (var i = 0; i < word.length; i++) {
      var ch = word.charAt(i);
      var code = ch.charCodeAt(0);
      if (code < 0x4E00 || code > 0x9FFF) continue; // 漢字以外は除外
      if (seen[ch]) continue;                        // 同じ字は一度だけ
      seen[ch] = true;
      var info = dict[ch];
      if (!info) continue;
      var parts = [];
      if (info.on)  parts.push('<span class="kr-on">音: ' + escapeHtml(info.on) + '</span>');
      if (info.kun) parts.push('<span class="kr-kun">訓: ' + escapeHtml(info.kun) + '</span>');
      if (!parts.length) continue;
      html += '<span class="kanji-ref"><span class="kr-char">' + escapeHtml(ch) + '</span>' +
              parts.join('<span class="kr-sep">/</span>') + '</span>';
    }
    if (html) {
      el.kanjiRefs.innerHTML = html;
      el.kanjiRefs.classList.remove('hidden');
    } else {
      el.kanjiRefs.classList.add('hidden');
    }
  }

  function revealAnswer() {
    if (session.graded) return;
    var q = session.current;
    el.revealWord.textContent = q.word;
    el.revealReading.textContent = '（' + q.reading + '）';
    el.revealHint.textContent = q.hint || '';

    // 語（熟語）の意味を表示（辞書にあれば）
    var meaning = (window.WORD_MEANINGS || {})[q.word];
    if (meaning) {
      el.wordMeaning.textContent = meaning;
      el.wordMeaning.classList.remove('hidden');
    } else {
      el.wordMeaning.classList.add('hidden');
    }
    renderKanjiRefs(q.word);

    el.revealBox.classList.remove('hidden');
    // 答え表示時に読み上げ（自動再生中は音声設定オン時、通常は自動読み上げオン時）
    if (auto.on ? settings.autoVoice : settings.autoSpeak) speak(readingText(q));
  }

  function grade(result) {
    var q = session.current;
    if (result !== 'skip') {
      var h = history[q.id] || { correct: 0, wrong: 0, lastResult: null };
      if (result === 'correct') h.correct = (h.correct || 0) + 1;
      else h.wrong = (h.wrong || 0) + 1;
      h.lastResult = result;
      h.lastAt = Date.now();
      history[q.id] = h;
      writeJSON(LS_HISTORY, history);
    }
    logDaily(result); // 日別ログに記録（correct / wrong / skip）
    session.graded = true;
    updateDashboard();
    nextQuestion();
  }

  function nextQuestion() {
    session.index++;
    if (session.index >= session.queue.length) {
      finishSession();
    } else {
      showQuestion();
    }
  }

  function finishSession() {
    document.body.classList.remove('quiz-active');
    el.quiz.classList.add('hidden');
    el.controls.classList.remove('hidden');
    updateDashboard();
    var weak = allQuestions.filter(function (q) { return isWeak(q.id); }).length;
    var msg = 'このセッションはおしまいです。お疲れさまでした！';
    if (weak > 0) msg += '\n\n苦手が ' + weak + ' 語あります。「苦手のみ」で集中復習しましょう。';
    setTimeout(function () { alert(msg); }, 150);
  }

  // 学習を中断して設定画面（ホーム）に戻る
  function goHome() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    document.body.classList.remove('quiz-active');
    el.quiz.classList.add('hidden');
    el.controls.classList.remove('hidden');
    updateDashboard();
  }

  // =====================================================
  // 自動再生（フラッシュカード）モード
  //  問題を数秒表示 → 答えを数秒表示 → 次へ、を手を動かさず繰り返す。
  //  末尾まで来たら並べ替えて繰り返し（連続再生）。停止するまで続く。
  // =====================================================
  function startAuto() {
    session.queue = buildQueue();
    session.index = 0;
    if (session.queue.length === 0) {
      alert('条件に合う問題がありません。範囲やレベルを変えてください。');
      return;
    }
    auto.on = true;
    document.body.classList.add('auto-mode');
    document.body.classList.add('quiz-active');
    el.controls.classList.add('hidden');
    el.quiz.classList.remove('hidden');
    autoStep();
  }

  function autoStep() {
    if (!auto.on) return;
    var ms = settings.autoSpeed * 1000;
    showQuestion();                       // 問題を表示
    auto.timer = setTimeout(function () {
      if (!auto.on) return;
      revealAnswer();                     // 答え・意味・音訓を表示＋読み上げ
      logDaily('flash');                  // 自動再生（流し見）を日別ログに記録
      auto.timer = setTimeout(function () {
        if (!auto.on) return;
        session.index++;
        if (session.index >= session.queue.length) {
          // 最後まで来たら並べ替えて最初から（連続再生）
          session.queue = buildQueue();
          session.index = 0;
        }
        autoStep();
      }, ms);
    }, ms);
  }

  function stopAuto() {
    auto.on = false;
    if (auto.timer) { clearTimeout(auto.timer); auto.timer = null; }
    document.body.classList.remove('auto-mode');
    document.body.classList.remove('quiz-active');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    el.quiz.classList.add('hidden');
    el.controls.classList.remove('hidden');
    updateDashboard();
  }

  // =====================================================
  // 音声読み上げ（Web Speech API）
  // =====================================================
  function readingText(q) {
    // 例文の対象語を読みに置き換えた自然な文を読み上げる
    return q.sentence.replace(/\{[^}]*\}/, q.reading);
  }
  function speak(text) {
    if (!('speechSynthesis' in window)) {
      alert('お使いのブラウザは音声読み上げに対応していません。');
      return;
    }
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  // =====================================================
  // 問題追加
  // =====================================================
  function openAdd() {
    el.addError.classList.add('hidden');
    el.addModal.classList.remove('hidden');
    el.addWord.focus();
  }
  function closeAdd() { el.addModal.classList.add('hidden'); }

  function saveAdd() {
    var word = el.addWord.value.trim();
    var reading = el.addReading.value.trim();
    var sentence = el.addSentence.value.trim();
    var level = el.addLevel.value;
    var hint = el.addHint.value.trim();

    if (!word || !reading || !sentence) {
      return showAddError('語・読み・例文は必須です。');
    }
    if (sentence.indexOf('{') === -1 || sentence.indexOf('}') === -1) {
      return showAddError('例文は対象語を { } で囲んでください。例：状況を{把握}する。');
    }
    var newQ = { word: word, reading: reading, sentence: sentence, level: level, hint: hint };
    newQ.id = makeId(newQ);
    if (allQuestions.some(function (q) { return q.id === newQ.id; })) {
      return showAddError('同じ語＋読みの問題が既にあります。');
    }

    var custom = readJSON(LS_CUSTOM, []);
    custom.push({ word: word, reading: reading, sentence: sentence, level: level, hint: hint });
    writeJSON(LS_CUSTOM, custom);

    allQuestions.push(newQ);
    updateDashboard();
    el.addWord.value = el.addReading.value = el.addSentence.value = el.addHint.value = '';
    closeAdd();
  }
  function showAddError(msg) {
    el.addError.textContent = msg;
    el.addError.classList.remove('hidden');
  }

  // =====================================================
  // 学習履歴（日別の練習量）
  // =====================================================
  function computeStreak() {
    var d = new Date();
    function key(dt) { return dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate()); }
    if (!daily[key(d)]) d.setDate(d.getDate() - 1); // 今日未学習なら前日から数える
    var streak = 0;
    while (daily[key(d)]) { streak++; d.setDate(d.getDate() - 1); }
    return streak;
  }

  var HIST_DAYS = 183;          // 表示期間（約6か月）
  var historyDays = [];         // 各棒に対応する日データ

  function openHistory() {
    var keys = Object.keys(daily);
    var totalQ = 0;
    keys.forEach(function (k) {
      var r = daily[k];
      totalQ += (r.correct || 0) + (r.wrong || 0) + (r.skip || 0);
    });
    var hs = function (num, label) {
      return '<div class="hs-item"><span class="hs-num">' + num + '</span><span class="hs-label">' + label + '</span></div>';
    };
    $('histSummary').innerHTML =
      hs(computeStreak() + '日', '連続学習') +
      hs(keys.length + '日', '学習日数') +
      hs(totalQ + '問', 'のべ解答');

    // 直近 HIST_DAYS 日ぶんを集計（棒の高さ＝その日の解答数）
    var today = new Date(); today.setHours(0, 0, 0, 0);
    historyDays = [];
    var maxSolved = 1;
    for (var i = HIST_DAYS - 1; i >= 0; i--) {
      var d = new Date(today); d.setDate(today.getDate() - i);
      var key = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
      var r = daily[key] || { correct: 0, wrong: 0, skip: 0, flash: 0 };
      var solved = (r.correct || 0) + (r.wrong || 0) + (r.skip || 0);
      if (solved > maxSolved) maxSolved = solved;
      historyDays.push({ date: d, r: r, solved: solved });
    }

    // 縦軸（問数）の目盛りを決める
    var H = 120;
    var step = niceStep(maxSolved, 4);
    var ceilMax = Math.ceil(maxSolved / step) * step;
    var scale = H / ceilMax;

    var yHtml = '', gHtml = '';
    for (var t = 0; t <= ceilMax + 0.0001; t += step) {
      var off = Math.round(t * scale);
      yHtml += '<span class="yt" style="bottom:' + off + 'px">' + t + '</span>';
      gHtml += '<div class="gl" style="bottom:' + off + 'px"></div>';
    }
    $('histYAxis').innerHTML = yHtml;
    $('histGrid').innerHTML = gHtml;

    var seg = function (cls, v) {
      return v ? '<div class="' + cls + '" style="height:' + Math.max(1, Math.round(v * scale)) + 'px"></div>' : '';
    };
    var barsHtml = '', monthsHtml = '';
    historyDays.forEach(function (day, idx) {
      var r = day.r;
      var title = (day.date.getMonth() + 1) + '/' + day.date.getDate() +
                  ' 解答' + day.solved + (r.flash ? '・自動' + r.flash : '');
      barsHtml += '<div class="hist-bar" data-idx="' + idx + '" title="' + title + '">' +
                  seg('seg-ok', r.correct) + seg('seg-ng', r.wrong) + seg('seg-sk', r.skip) + '</div>';
      monthsHtml += '<div class="hist-month-cell">' +
                    (day.date.getDate() === 1 ? (day.date.getMonth() + 1) + '月' : '') + '</div>';
    });
    $('histBars').innerHTML = barsHtml;
    $('histMonths').innerHTML = monthsHtml;
    $('histDetail').textContent = '棒をタップすると、その日の内訳が表示されます。';

    $('historyModal').classList.remove('hidden');
    // 今日（右端）が見えるように自動スクロール
    var wrap = $('histChartWrap');
    setTimeout(function () { wrap.scrollLeft = wrap.scrollWidth; }, 0);
  }

  function showHistDetail(idx) {
    var day = historyDays[idx];
    if (!day) return;
    var r = day.r;
    var c = r.correct || 0, w = r.wrong || 0, s = r.skip || 0, f = r.flash || 0;
    var wd = ['日', '月', '火', '水', '木', '金', '土'][day.date.getDay()];
    var head = (day.date.getMonth() + 1) + '月' + day.date.getDate() + '日（' + wd + '）：';
    var txt;
    if (c + w + s + f === 0) {
      txt = head + '学習なし';
    } else {
      txt = head + '解答 ' + (c + w + s) + '問（◯' + c + ' ✕' + w + (s ? ' −' + s : '') + '）';
      if (f) txt += ' ／ 自動再生 ' + f + '枚';
    }
    $('histDetail').textContent = txt;
    var bars = $('histBars').children;
    for (var i = 0; i < bars.length; i++) bars[i].classList.remove('active');
    if (bars[idx]) bars[idx].classList.add('active');
  }

  function closeHistory() { $('historyModal').classList.add('hidden'); }

  // =====================================================
  // ユーティリティ
  // =====================================================
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // =====================================================
  // イベント配線
  // =====================================================
  function bindChipGroup(groupId, attr, onPick) {
    var group = $(groupId);
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('.chip');
      if (!btn) return;
      group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      btn.classList.add('active');
      onPick(btn.getAttribute(attr));
    });
  }

  bindChipGroup('modeGroup', 'data-mode', function (v) { settings.mode = v; });
  bindChipGroup('levelGroup', 'data-level', function (v) { settings.level = v; });
  bindChipGroup('poolGroup', 'data-pool', function (v) { settings.pool = v; });
  bindChipGroup('autoSpeedGroup', 'data-sec', function (v) { settings.autoSpeed = parseInt(v, 10) || 3; });
  bindChipGroup('autoVoiceGroup', 'data-voice', function (v) { settings.autoVoice = (v === 'on'); });

  $('autoSpeak').addEventListener('change', function (e) { settings.autoSpeak = e.target.checked; });
  $('startBtn').addEventListener('click', startSession);
  $('autoStartBtn').addEventListener('click', startAuto);
  $('homeBtn').addEventListener('click', function () { if (auto.on) stopAuto(); else goHome(); });
  el.revealBtn.addEventListener('click', revealAnswer);
  el.speakBtn.addEventListener('click', function () { speak(readingText(session.current)); });
  el.speakAnswerBtn.addEventListener('click', function () { speak(readingText(session.current)); });

  document.querySelector('.grade-actions').addEventListener('click', function (e) {
    var btn = e.target.closest('.grade');
    if (btn) grade(btn.getAttribute('data-grade'));
  });

  $('openAddBtn').addEventListener('click', openAdd);
  $('addCancel').addEventListener('click', closeAdd);
  $('addSave').addEventListener('click', saveAdd);
  el.addModal.addEventListener('click', function (e) {
    if (e.target === el.addModal) closeAdd();
  });

  $('openHistoryBtn').addEventListener('click', openHistory);
  $('histClose').addEventListener('click', closeHistory);
  $('historyModal').addEventListener('click', function (e) {
    if (e.target === $('historyModal')) closeHistory();
  });
  $('histBars').addEventListener('click', function (e) {
    var b = e.target.closest('.hist-bar');
    if (b) showHistDetail(parseInt(b.getAttribute('data-idx'), 10));
  });

  $('resetBtn').addEventListener('click', function () {
    if (confirm('学習履歴（成績・日別の練習量）をすべて消去します。よろしいですか？（追加した問題は残ります）')) {
      history = {};
      daily = {};
      writeJSON(LS_HISTORY, history);
      writeJSON(LS_DAILY, daily);
      updateDashboard();
    }
  });

  // 初期化
  updateDashboard();
})();
