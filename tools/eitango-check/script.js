// 例文で覚える英単語
// data.js の WORD_LIST / SECTIONS を使い、カード・4択テスト・単語リスト・自動再生を提供する。
// 習熟は「向き（英→日 / 日→英）」ごとに別々に記録し、間隔反復で復習日を決める。
// 記録はすべて localStorage（端末内）に保存する。

(function () {
  'use strict';

  // =====================================================
  // 保存
  // =====================================================
  var LS_HISTORY  = 'reibun-eitango.history';
  var LS_DAILY    = 'reibun-eitango.daily';
  var LS_SETTINGS = 'reibun-eitango.settings';
  var LS_THEME    = 'reibun-eitango.theme';
  var LS_REWARD   = 'reibun-eitango.reward';   // ごほうびゲームのプレイ権・記録
  var LS_OLD      = 'reibun-eitango:v1';   // 旧バージョンの記録（覚えた／あいまいの2段階）

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var v = JSON.parse(raw);
      return (v && typeof v === 'object') ? v : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  var history  = readJSON(LS_HISTORY, {});
  var daily    = readJSON(LS_DAILY, {});
  var settings = readJSON(LS_SETTINGS, null) || {
    dir: 'r', sections: [0], pool: 'all', order: 'shuffle', count: 20,
    autoSpeak: false, autoSpeed: 3, autoVoice: 'word', autoLoop: false,
    hide: 'meaning', listSent: false
  };
  function saveSettings() { writeJSON(LS_SETTINGS, settings); }

  // ごほうびゲーム：4択テストの正解数に応じて、プレイ権（＝ライフ何機で遊べるか）がたまる。
  // 5問正解ごとにライフ1機。10問・20問・50問など、どの問題数でも同じ計算にする。
  var REWARD_PER_LIFE = 5;     // 何問正解でライフ1機か
  var REWARD_MAX_LIVES = 20;   // 1回のテストでもらえるライフの上限（「全部」で解いたとき用の歯止め）

  function livesFor(correct) {
    return Math.min(Math.floor(correct / REWARD_PER_LIFE), REWARD_MAX_LIVES);
  }
  var reward = readJSON(LS_REWARD, null) || { tickets: [], cleared: 0, hi: 0 };

  // tickets は「1回ぶんのライフ数」を並べた配列。古い形式（回数だけの数値）は ♥6 として取り込む。
  (function migrateTickets() {
    if (typeof reward.tickets === 'number') {
      var n = reward.tickets;
      reward.tickets = [];
      for (var i = 0; i < n; i++) reward.tickets.push(6);
      writeJSON(LS_REWARD, reward);
    }
    if (!Array.isArray(reward.tickets)) reward.tickets = [];
  })();

  function saveReward() { writeJSON(LS_REWARD, reward); }

  // ---- 管理者モード（動作確認用） ----
  // アプリの見出しを5回つづけて押すとパスワードを聞き、合っていればゲームを何回でも遊べる。
  // ブラウザの中だけで判定しているので、ソースを見れば分かってしまう。
  // 「子どもがうっかり押せない」程度の目隠しで、本格的な鍵ではない点に注意。
  var LS_ADMIN = 'reibun-eitango.admin';
  var ADMIN_PASSWORD = 'eitango-admin';   // 変えたいときはここを書き換える
  var ADMIN_LIVES = 6;                    // 管理者モードでプレイ権が無いときのライフ
  var adminMode = false;
  try { adminMode = localStorage.getItem(LS_ADMIN) === '1'; } catch (e) {}

  function setAdmin(on) {
    adminMode = !!on;
    try {
      if (adminMode) localStorage.setItem(LS_ADMIN, '1');
      else localStorage.removeItem(LS_ADMIN);
    } catch (e) {}
    renderAdmin();
    renderRewardButton();
  }

  function renderAdmin() {
    $('adminBadge').classList.toggle('hidden', !adminMode);
  }

  // 次に遊ぶときのライフ（良いプレイ権から先に使う）
  function nextLives() {
    if (!reward.tickets.length) return 0;
    return Math.max.apply(null, reward.tickets);
  }
  function ticketsLabel() {
    return reward.tickets.length
      ? 'あと ' + reward.tickets.length + ' 回・次は ♥' + nextLives()
      : 'あと 0 回';
  }

  var DAY = 24 * 60 * 60 * 1000;

  // ---- 旧バージョン（2段階）の記録を取り込む ----
  (function migrateOld() {
    var old = readJSON(LS_OLD, null);
    if (!old || !old.status || Object.keys(history).length) return;
    Object.keys(old.status).forEach(function (wordKey) {
      var st = old.status[wordKey];
      ['r', 'w'].forEach(function (d) {
        var k = wordKey + '|' + d;
        if (st === 'known') {
          history[k] = { correct: 1, unsure: 0, wrong: 0, last: 'correct', lastAt: Date.now(), streak: 1, due: Date.now() + DAY };
        } else if (st === 'weak') {
          history[k] = { correct: 0, unsure: 0, wrong: 1, last: 'wrong', lastAt: Date.now(), streak: 0, due: Date.now() };
        }
      });
    });
    if (old.ui) {
      if (Array.isArray(old.ui.sections) && old.ui.sections.length) settings.sections = old.ui.sections;
      if (old.ui.hide) settings.hide = old.ui.hide;
      if (typeof old.ui.listSent === 'boolean') settings.listSent = old.ui.listSent;
    }
    writeJSON(LS_HISTORY, history);
    saveSettings();
    try { localStorage.removeItem(LS_OLD); } catch (e) {}
  })();

  // ---- 日別ログ ----
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  // field: 'correct' | 'unsure' | 'wrong' | 'skip' | 'flash'
  function logDaily(field) {
    var k = todayKey();
    var rec = daily[k] || { correct: 0, unsure: 0, wrong: 0, skip: 0, flash: 0 };
    rec[field] = (rec[field] || 0) + 1;
    daily[k] = rec;
    writeJSON(LS_DAILY, daily);
  }
  // 目盛りの刻み幅を「きりのよい整数」で求める（1/2/5×10ⁿ、最小1）
  function niceStep(max, target) {
    var raw = max / target;
    var pow = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var n = raw / pow;
    var s = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return Math.max(1, s * pow);
  }

  // =====================================================
  // 習熟の判定（向きごと）
  // =====================================================
  var MASTER_HITS = 2;                     // 2回連続で正解したらマスター
  var SRS_DAYS = [1, 3, 7, 14, 30, 60];    // 間隔反復の日数

  function keyOf(word, dir) { return word.key + '|' + dir; }

  // 区分： 'correct' | 'unsure' | 'weak' | 'new'
  function statusOf(key) {
    var h = history[key];
    var lr = h ? h.last : null;
    return lr === 'wrong' ? 'weak' : lr === 'unsure' ? 'unsure' : lr === 'correct' ? 'correct' : 'new';
  }
  function isMastered(key) {
    var h = history[key];
    return !!h && h.last === 'correct' && (h.streak || 0) >= MASTER_HITS;
  }
  function isDue(key) {
    var h = history[key];
    if (!h) return false;
    if (h.due != null) return h.due <= Date.now();
    return h.last === 'wrong' || h.last === 'unsure';
  }

  // 間隔反復：連続正解が伸びるほど次回の復習を先に延ばす（忘れかけた頃に再出題）
  function scheduleNext(h, result) {
    if (result === 'correct') {
      h.streak = (h.streak || 0) + 1;
      h.due = Date.now() + SRS_DAYS[Math.min(h.streak - 1, SRS_DAYS.length - 1)] * DAY;
    } else if (result === 'unsure') {
      h.streak = 0;
      h.due = Date.now() + DAY;    // 明日もう一度
    } else {
      h.streak = 0;
      h.due = Date.now();          // すぐ復習対象に残す
    }
  }

  function recordResult(word, dir, result) {
    if (result !== 'skip') {
      var key = keyOf(word, dir);
      var h = history[key] || { correct: 0, unsure: 0, wrong: 0, last: null, streak: 0 };
      if (result === 'correct') h.correct = (h.correct || 0) + 1;
      else if (result === 'unsure') h.unsure = (h.unsure || 0) + 1;
      else h.wrong = (h.wrong || 0) + 1;
      h.last = result;
      h.lastAt = Date.now();
      scheduleNext(h, result);
      history[key] = h;
      writeJSON(LS_HISTORY, history);
    }
    logDaily(result);
  }

  // 一覧から手で区分を変える（もう一度押すと「未」に戻す）
  function setStatusManually(word, dir, result) {
    var key = keyOf(word, dir);
    if (result === null) { delete history[key]; }
    else {
      var h = history[key] || { correct: 0, unsure: 0, wrong: 0, last: null, streak: 0 };
      h.last = result;
      h.lastAt = Date.now();
      scheduleNext(h, result);
      history[key] = h;
    }
    writeJSON(LS_HISTORY, history);
  }

  // =====================================================
  // DOM
  // =====================================================
  var $ = function (id) { return document.getElementById(id); };

  // =====================================================
  // 画面（HTML）とプログラム（JS）の版ずれ対策
  // =====================================================
  // 古い index.html がキャッシュに残ったまま新しい script.js が動くと、
  // 参照する要素が見つからず途中で止まってしまう（例：テストに正解してもごほうびが出ない）。
  // 気づけないまま使い続けることになるので、版が違えば知らせて直せるようにする。
  var APP_VERSION = '2026-09-05';
  var noticeShown = false;

  function showUpdateNotice(reason) {
    if (noticeShown) return;
    noticeShown = true;
    var box = $('updateNotice');
    if (!box) { alert('古い画面が残っています。ページを読み込み直してください。\n' + (reason || '')); return; }
    var text = $('updateNoticeText');
    if (text) {
      text.textContent = '古い画面が残っているため、うまく動かない部分があります（' +
        (reason || '版のずれ') + '）。読み込み直してください。';
    }
    box.classList.remove('hidden');
  }

  // 保存した学習記録は消さずに、キャッシュと Service Worker だけ捨てて読み込み直す
  function hardReload() {
    var done = function () { location.replace(location.pathname + '?new=' + Date.now()); };
    var jobs = [];
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
        jobs.push(navigator.serviceWorker.getRegistrations().then(function (rs) {
          return Promise.all(rs.map(function (r) { return r.unregister(); }));
        }));
      }
      if (window.caches && caches.keys) {
        jobs.push(caches.keys().then(function (ks) {
          return Promise.all(ks.map(function (k) { return caches.delete(k); }));
        }));
      }
    } catch (e) {}
    if (!jobs.length) { done(); return; }
    Promise.all(jobs).then(done)['catch'](done);
  }

  function checkVersion() {
    var pageVersion = document.body.getAttribute('data-app-version');
    if (pageVersion !== APP_VERSION) {
      showUpdateNotice('画面は ' + (pageVersion || '不明') + '、プログラムは ' + APP_VERSION);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var session = { queue: [], index: 0, current: null, graded: false, dir: 'r' };
  var auto = { on: false, timer: null, token: 0 };
  var quizState = null;
  var listFilter = { q: '', status: 'all', dir: 'r' };
  var listLimit = 200;
  var historyDays = [];
  var HIST_DAYS = 182;

  // =====================================================
  // 音声
  // =====================================================
  var synth = window.speechSynthesis || null;
  function cleanForSpeech(text) {
    return String(text).replace(/[（(][^）)]*[）)]/g, ' ').replace(/[~～]/g, ' ').replace(/／/g, '、').trim();
  }
  function speak(text, lang) {
    if (!synth) return Promise.resolve();
    var body = cleanForSpeech(text);
    if (!body) return Promise.resolve();
    return new Promise(function (resolve) {
      // 音声が入っていない端末では onend/onerror が来ないことがある。
      // そのまま待つと自動再生が止まってしまうので、文の長さから見積もった上限で必ず先へ進める。
      var done = false;
      var finish = function () { if (!done) { done = true; clearTimeout(guard); resolve(); } };
      var guard = setTimeout(finish, Math.min(20000, 1500 + body.length * 120));
      var u = new SpeechSynthesisUtterance(body);
      u.lang = lang || 'en-US';
      u.onend = finish;
      u.onerror = finish;
      try { synth.speak(u); } catch (e) { finish(); }
    });
  }
  function speakNow(text, lang) {
    if (!synth) return;
    synth.cancel();
    speak(text, lang);
  }

  // =====================================================
  // 出題対象の組み立て
  // =====================================================
  function selectedSections() {
    var set = {};
    (settings.sections || []).forEach(function (i) { if (i >= 0 && i < SECTIONS.length) set[i] = true; });
    return set;
  }

  function poolWords(poolMode) {
    var sel = selectedSections();
    var dir = settings.dir;
    var mode = poolMode || settings.pool;
    var out = [];
    WORD_LIST.forEach(function (w) {
      if (!sel[w.section]) return;
      var key = keyOf(w, dir);
      var st = statusOf(key);
      var ok =
        mode === 'all' ? true :
        mode === 'due' ? isDue(key) :
        mode === 'weak' ? (st === 'weak' || st === 'unsure') :
        mode === 'weakonly' ? st === 'weak' :
        mode === 'unseen' ? st === 'new' :
        mode === 'mastered' ? isMastered(key) : true;
      if (ok) out.push(w);
    });
    return out;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function makeQueue(words) {
    var list = settings.order === 'seq' ? words.slice() : shuffle(words);
    var n = settings.count === 0 ? list.length : Math.min(settings.count, list.length);
    return list.slice(0, n);
  }

  // =====================================================
  // ダッシュボード
  // =====================================================
  function updateDashboard() {
    var totalC = 0, totalU = 0, totalW = 0;
    Object.keys(history).forEach(function (k) {
      var h = history[k];
      totalC += (h.correct || 0); totalU += (h.unsure || 0); totalW += (h.wrong || 0);
    });
    var answered = totalC + totalU + totalW;

    var weak = 0, unsure = 0, mastered = 0, due = 0, dueCur = 0;
    WORD_LIST.forEach(function (w) {
      ['r', 'w'].forEach(function (d) {
        var key = keyOf(w, d);
        var st = statusOf(key);
        if (st === 'weak') weak++;
        else if (st === 'unsure') unsure++;
        if (isMastered(key)) mastered++;
        if (isDue(key)) { due++; if (d === settings.dir) dueCur++; }
      });
    });

    $('statTotal').textContent = answered;
    $('statCorrect').textContent = totalC;
    $('statRate').textContent = answered ? Math.round(totalC / answered * 100) + '%' : '0%';
    $('statUnsure').textContent = unsure;
    $('statWeak').textContent = weak;
    $('statDue').textContent = due;

    var slots = WORD_LIST.length * 2;
    $('totalCount').textContent = '収録 ' + WORD_LIST.length + ' 語 × 2つの向き＝' + slots + ' 項目';
    $('goalFill').style.width = (mastered / slots * 100) + '%';
    $('goalText').textContent = 'マスター ' + mastered + ' / ' + slots +
      '（残り ' + (slots - mastered) + '）　※2回連続で正解するとマスター';

    var btn = $('dueBtn');
    if (dueCur > 0) {
      btn.textContent = '🔁 今日の復習を始める（' + (settings.dir === 'r' ? '英→日' : '日→英') + ' ' + dueCur + ' 語）';
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  }

  // =====================================================
  // セクション進捗パネル
  // =====================================================
  function renderGroupPanel() {
    var sel = selectedSections();
    var dir = settings.dir;
    var html = '<div class="grp-head"><span>チェックした範囲から出題します（' +
      (dir === 'r' ? '英→日' : '日→英') + 'の進捗）</span><span>' +
      '<button class="grp-all" data-act="all">全選択</button> ' +
      '<button class="grp-all" data-act="none">全解除</button></span></div>';

    SECTIONS.forEach(function (sec) {
      var mastered = 0, touched = 0;
      sec.words.forEach(function (w) {
        var key = keyOf(w, dir);
        if (isMastered(key)) mastered++;
        else if (history[key]) touched++;
      });
      var mPct = Math.round(mastered / sec.words.length * 100);
      var tPct = Math.round((mastered + touched) / sec.words.length * 100);
      html += '<label class="grp-row">' +
        '<input type="checkbox" class="grp-cb" data-si="' + sec.index + '"' + (sel[sec.index] ? ' checked' : '') + '>' +
        '<span class="grp-name">' + escapeHtml(sec.title) + '<small> ' + sec.range + '</small></span>' +
        '<span class="grp-bar"><i class="seg-t" style="width:' + tPct + '%"></i>' +
        '<i class="seg-m" style="width:' + mPct + '%"></i></span>' +
        '<span class="grp-num">' + mastered + '/' + sec.words.length + '</span>' +
        '</label>';
    });
    $('groupPanel').innerHTML = html;
  }

  function setSection(index, on) {
    var list = (settings.sections || []).filter(function (i) { return i !== index; });
    if (on) list.push(index);
    list.sort(function (a, b) { return a - b; });
    settings.sections = list;
    saveSettings();
  }

  // =====================================================
  // 画面切替
  // =====================================================
  var VIEWS = ['controls', 'quiz', 'testView', 'listView', 'gameView'];
  function showView(name) {
    VIEWS.forEach(function (v) { $(v).classList.toggle('hidden', v !== name); });
    $('dashboard').classList.toggle('hidden', name !== 'controls');
    // ゲーム中はスマホで画面いっぱいに使う（ヘッダーやフッターを隠す）
    document.body.classList.toggle('game-open', name === 'gameView');
    if (name !== 'quiz') stopAuto();
    if (name !== "gameView" && window.RewardGame) window.RewardGame.close();
    if (synth) synth.cancel();
    window.scrollTo(0, 0);
  }

  function goHome() {
    stopAuto();
    updateDashboard();
    renderGroupPanel();
    showView('controls');
  }

  // =====================================================
  // カード（フラッシュカード）
  // =====================================================
  function frontOf(w, dir) { return dir === 'r' ? w.word : w.meaning; }
  function backOf(w, dir)  { return dir === 'r' ? w.meaning : w.word; }

  function startSession(words, autoPlay) {
    if (!words.length) { alert('この条件に当てはまる単語がありません。範囲や出題範囲を見直してください。'); return; }
    session = { queue: makeQueue(words), index: 0, current: null, graded: false, dir: settings.dir };
    showView('quiz');
    // 自動再生は session.current が決まってから動かす（先に動かすと読み上げる語が無い）
    auto.on = !!autoPlay;
    updateAutoUi();
    showQuestion();
    if (autoPlay) autoTick();
  }

  function showQuestion() {
    var w = session.queue[session.index];
    session.current = w;
    session.graded = false;
    var dir = session.dir;

    $('qSection').textContent = SECTIONS[w.section].title;
    $('qDir').textContent = dir === 'r' ? '英→日' : '日→英';
    $('qProgress').textContent = (session.index + 1) + ' / ' + session.queue.length;
    $('qPrompt').textContent = dir === 'r'
      ? '意味を思い浮かべてから、答えを見ましょう。'
      : '英語でどう言うかを思い浮かべてから、答えを見ましょう。';
    $('qQuestion').textContent = frontOf(w, dir);

    $('answerArea').classList.remove('hidden');
    $('revealBox').classList.add('hidden');
    $('speakBtn').classList.toggle('hidden', dir !== 'r');

    if (!auto.on && settings.autoSpeak && dir === 'r') speakNow(w.word, 'en-US');
  }

  function revealAnswer() {
    var w = session.current, dir = session.dir;
    $('revealWord').textContent = backOf(w, dir);
    $('revealSentEn').textContent = w.sentEn;
    $('revealSentJa').textContent = w.sentJa;

    var others = $('revealOthers');
    if (w.otherExamples && w.otherExamples.length) {
      var extra = w.otherExamples.slice(0, 2).map(function (e) {
        return '<b>' + escapeHtml(e.en) + '</b>';
      }).join('<br>');
      others.innerHTML = 'ほかの例文：<br>' + extra;
      others.classList.remove('hidden');
    } else {
      others.classList.add('hidden');
    }

    $('answerArea').classList.add('hidden');
    $('revealBox').classList.remove('hidden');
  }

  function grade(result) {
    if (!session.current || session.graded) return;
    recordResult(session.current, session.dir, result);
    session.graded = true;
    updateDashboard();
    nextQuestion();
  }

  function nextQuestion() {
    session.index++;
    if (session.index >= session.queue.length) finishSession();
    else showQuestion();
  }

  function finishSession() {
    stopAuto();
    updateDashboard();
    renderGroupPanel();
    alert(session.queue.length + ' 語おつかれさまでした。ホームに戻ります。');
    showView('controls');
  }

  // ---- 自動再生（かけ流し） ----
  function updateAutoUi() {
    $('autoIndicator').classList.toggle('on', auto.on);
    $('autoControls').classList.toggle('on', auto.on);
  }

  function stopAuto() {
    auto.on = false;
    auto.token++;                 // 動いている途中の処理を無効にする
    clearTimeout(auto.timer);
    if (synth) synth.cancel();
    updateAutoUi();
  }

  function delay(ms) {
    return new Promise(function (resolve) { auto.timer = setTimeout(resolve, ms); });
  }

  // 自動再生は「速さ」の設定どおりに画面を進める（読み上げの完了待ちで止まらないように）。
  // 表を見せる →（速さ）→ 答えを見せる →（速さ）→ 次へ。読み上げは並行して流す。
  // 「単語＋意味＋例文」のときだけ、読み終わるまで少し待つ（上限つき）。
  function autoTick() {
    if (!auto.on || !session.current) return;
    var my = ++auto.token;
    var alive = function () { return auto.on && my === auto.token; };

    var w = session.current, dir = session.dir;
    var wait = settings.autoSpeed * 1000;
    var voice = settings.autoVoice;

    if (synth) synth.cancel();    // 前の語の読み上げが残っていたら止める
    if (voice !== 'off') {
      if (dir === 'r') speak(w.word, 'en-US');
      else speak(w.meaning, 'ja-JP');
    }

    delay(wait).then(function () {
      if (!alive()) return;
      revealAnswer();

      var chain = Promise.resolve();
      if (voice === 'full') {
        chain = (dir === 'r' ? speak(w.meaning, 'ja-JP') : speak(w.word, 'en-US'))
          .then(function () { return alive() ? speak(w.sentEn, 'en-US') : null; });
      } else if (voice === 'word' && dir === 'w') {
        speak(w.word, 'en-US');   // 日→英は答え（英語）を読む
      }

      // 読み上げが長引いても待ちすぎない
      return Promise.race([chain, delay(wait + 8000)]);
    }).then(function () {
      if (!alive()) return;
      return delay(wait);
    }).then(function () {
      if (!alive()) return;
      logDaily('flash');
      if (session.index >= session.queue.length - 1) {
        if (settings.autoLoop) { session.index = -1; }
        else {
          stopAuto(); updateDashboard();
          alert('自動再生が最後まで終わりました。');
          showView('controls');
          return;
        }
      }
      session.index++;
      showQuestion();
      autoTick();
    });
  }

  // =====================================================
  // 4択テスト
  // =====================================================
  function startTest(words) {
    if (!words.length) { alert('この条件に当てはまる単語がありません。'); return; }
    var queue = makeQueue(words);
    var dir = settings.dir;
    quizState = {
      dir: dir,
      source: words,
      questions: queue.map(function (w) {
        var answer = backOf(w, dir);
        var used = {}; used[answer] = true;
        var choices = [answer];
        var guard = 0;
        while (choices.length < 4 && guard < 800) {
          guard++;
          var c = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
          var t = backOf(c, dir);
          if (used[t]) continue;
          used[t] = true;
          choices.push(t);
        }
        return { word: w, answer: answer, choices: shuffle(choices) };
      }),
      index: 0, correct: 0, wrong: []
    };
    showView('testView');
    $('testResultArea').classList.add('hidden');
    $('testQuestionArea').classList.remove('hidden');
    renderTestQuestion();
  }

  function renderTestQuestion() {
    var q = quizState.questions[quizState.index];
    var dir = quizState.dir;
    $('tDir').textContent = dir === 'r' ? '英→日' : '日→英';
    $('tProgress').textContent = (quizState.index + 1) + ' / ' + quizState.questions.length;
    $('tScore').textContent = '正解 ' + quizState.correct;
    $('tBarFill').style.width = (quizState.index / quizState.questions.length * 100) + '%';
    $('tQuestion').textContent = frontOf(q.word, dir);
    $('tSpeakBtn').classList.toggle('hidden', dir !== 'r');
    $('tFeedback').classList.add('hidden');

    var box = $('tChoices');
    box.innerHTML = '';
    q.choices.forEach(function (text) {
      var b = document.createElement('button');
      b.className = 'choice';
      b.textContent = text;
      b.addEventListener('click', function () { answerTest(b, text); });
      box.appendChild(b);
    });

    if (settings.autoSpeak && dir === 'r') speakNow(q.word.word, 'en-US');
  }

  function answerTest(btn, text) {
    var q = quizState.questions[quizState.index];
    var ok = text === q.answer;
    var buttons = $('tChoices').children;
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
      if (buttons[i].textContent === q.answer) buttons[i].classList.add('correct');
    }
    if (!ok) btn.classList.add('wrong');

    if (ok) { quizState.correct++; recordResult(q.word, quizState.dir, 'correct'); }
    else { quizState.wrong.push(q.word); recordResult(q.word, quizState.dir, 'wrong'); }

    $('tScore').textContent = '正解 ' + quizState.correct;
    $('tFbTitle').textContent = ok ? '◯ 正解' : '✕ 不正解 － 正解は「' + q.answer + '」';
    $('tFbTitle').className = 'fb-title ' + (ok ? 'ok' : 'ng');
    $('tSentEn').textContent = q.word.sentEn;
    $('tSentJa').textContent = q.word.sentJa;
    $('tNextBtn').textContent = quizState.index >= quizState.questions.length - 1 ? '結果を見る' : '次の問題へ';
    $('tFeedback').classList.remove('hidden');
  }

  function showTestResult() {
    var total = quizState.questions.length;
    var pct = Math.round(quizState.correct / total * 100);
    $('testQuestionArea').classList.add('hidden');
    $('testResultArea').classList.remove('hidden');
    $('tResultScore').textContent = total + ' 問中 ' + quizState.correct + ' 問正解（' + pct + '％）';

    var box = $('tResultWrong');
    if (!quizState.wrong.length) {
      box.innerHTML = '<p class="list-note">間違いはありませんでした。</p>';
    } else {
      var html = '<p class="list-note">間違えた ' + quizState.wrong.length + ' 語（「苦手」として記録し、すぐ復習対象になります）：</p>';
      quizState.wrong.forEach(function (w) {
        html += '<div class="rw-item"><b>' + w.no + '. ' + escapeHtml(w.word) + '</b> － ' + escapeHtml(w.meaning) + '</div>';
      });
      box.innerHTML = html;
    }
    $('tRetryWrongBtn').classList.toggle('hidden', quizState.wrong.length === 0);
    // ごほうびの表示でつまずいても、ダッシュボードの更新までは必ず行う
    try { judgeReward(total, quizState.correct); }
    catch (e) { showUpdateNotice('ごほうびの処理でエラー: ' + e.message); }
    updateDashboard();
    renderGroupPanel();
  }

  // =====================================================
  // ごほうびゲーム
  // =====================================================
  // 50問に挑戦して25問以上正解できたら、プレイ権を1回あげる
  function judgeReward(total, correct) {
    var lives = livesFor(correct);

    // 先にプレイ権を記録する。表示でつまずいても、もらった権利が消えないようにするため。
    if (lives >= 1) {
      reward.tickets.push(lives);
      reward.cleared++;
      saveReward();
    }

    var banner = $('rewardBanner');
    var hint = $('rewardHint');
    // 画面が古いと、ここで参照する場所が無くて黙って止まってしまう。気づけるように知らせる。
    if (!banner || !hint || !$('rewardBannerText') || !$('rewardBtn')) {
      showUpdateNotice('ごほうびの表示部分が見つからない');
      return;
    }

    if (lives >= 1) {
      banner.classList.remove('hidden');
      hint.classList.add('hidden');
      // あと何問正解すればもう1機増えたかも見せる（次に頑張る目安になる）
      var toNext = REWARD_PER_LIFE - (correct % REWARD_PER_LIFE);
      var more = (lives < REWARD_MAX_LIVES && correct < total)
        ? '　あと ' + toNext + '問正解でもう1機でした。' : '';
      $('rewardBannerText').textContent =
        total + '問中 ' + correct + '問正解！　' + REWARD_PER_LIFE + '問ごとに1機で、ライフ ' +
        lives + ' 機であそべます。' + more +
        '（' + ticketsLabel() + '／これまでの達成 ' + reward.cleared + ' 回）';
    } else {
      banner.classList.add('hidden');
      hint.classList.remove('hidden');
      hint.textContent = 'あと ' + (REWARD_PER_LIFE - correct) + '問正解で、ライフ1機のごほうびでした。' +
        REWARD_PER_LIFE + '問正解するごとにライフが1機ふえます。';
    }
    renderRewardButton();
  }

  function renderRewardButton() {
    var btn = $('rewardBtn');
    if (adminMode) {
      btn.textContent = '🔧 ごほうびゲームであそぶ（管理者モード：何回でも）';
      btn.classList.add('ready');
      btn.disabled = false;
      return;
    }
    if (reward.tickets.length) {
      btn.textContent = '🎮 ごほうびゲームであそぶ（' + ticketsLabel() + '）';
      btn.classList.add('ready');
      btn.disabled = false;
    } else {
      btn.textContent = '🔒 ごほうびゲーム：4択テストで ' + REWARD_PER_LIFE +
        '問正解するごとに、ライフ1機ぶんあそべます';
      btn.classList.remove('ready');
      btn.disabled = true;
    }
  }

  // ゲームに出す単語。苦手・あいまい・今日の復習を先に、次に選んでいるセクションの語を渡す。
  // 遊びながら、いま覚えたい語に何度も目が触れるようにするため。
  function gameWordPool() {
    var dir = settings.dir;
    var sel = selectedSections();
    var weak = [], normal = [];
    WORD_LIST.forEach(function (w) {
      if (w.word.length > 13) return;               // 長すぎる熟語は的にしづらいので外す
      var key = keyOf(w, dir);
      var st = statusOf(key);
      if (st === 'weak' || st === 'unsure' || isDue(key)) weak.push(w);
      else if (sel[w.section]) normal.push(w);
    });
    var pool = weak.concat(normal);
    if (pool.length < 12) {
      pool = pool.concat(WORD_LIST.filter(function (w) { return w.word.length <= 13; }));
    }
    // 画面に収まるよう、意味は先頭の1つだけ・カッコの補足は落とす
    return pool.slice(0, 160).map(function (w) {
      return {
        word: w.word,
        meaning: w.meaning.split('／')[0].replace(/[（(][^）)]*[）)]/g, '').trim() || w.meaning
      };
    });
  }

  function openGame() {
    if (!adminMode && !reward.tickets.length) return;
    showView('gameView');
    $('rgTickets').textContent = adminMode ? '🔧 管理者モード' : ticketsLabel();
    window.RewardGame.open(adminMode ? (nextLives() || ADMIN_LIVES) : nextLives());
  }

  // START を押したときにプレイ権を1回使う。使うのはいちばん良いもの（ライフの多い順）。
  // 戻り値がそのまま今回のライフ数になる。
  function consumeTicket() {
    if (adminMode) {                       // 動作確認用：プレイ権を減らさない
      $('rgTickets').textContent = '🔧 管理者モード';
      return nextLives() || ADMIN_LIVES;
    }
    if (!reward.tickets.length) {
      alert('あそべる回数がありません。4択テストで ' + REWARD_PER_LIFE +
        '問正解するごとに、ライフ1機ぶんあそべます。');
      return false;
    }
    var lives = nextLives();
    reward.tickets.splice(reward.tickets.indexOf(lives), 1);
    saveReward();
    $('rgTickets').textContent = ticketsLabel();
    renderRewardButton();
    return lives;
  }

  // =====================================================
  // 単語リスト（赤シート）
  // =====================================================
  function openList() {
    listFilter.dir = settings.dir;
    listLimit = 200;
    syncChips('listDirGroup', 'data-dir', listFilter.dir);
    syncChips('listHideGroup', 'data-hide', settings.hide);
    syncChips('listStatusGroup', 'data-st', listFilter.status);
    $('listShowSent').checked = !!settings.listSent;
    $('listSearch').value = listFilter.q;
    showView('listView');
    renderList();
  }

  function listTargets() {
    var sel = selectedSections();
    var dir = listFilter.dir;
    var q = listFilter.q.trim().toLowerCase();
    return WORD_LIST.filter(function (w) {
      if (!sel[w.section]) return false;
      var key = keyOf(w, dir);
      if (listFilter.status === 'due') { if (!isDue(key)) return false; }
      else if (listFilter.status !== 'all' && statusOf(key) !== listFilter.status) return false;
      if (q) {
        var hay = (w.word + ' ' + w.meaning + ' ' + w.sentEn + ' ' + w.sentJa).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  function dueLabel(key) {
    var h = history[key];
    if (!h || h.due == null) return '';
    var diff = Math.ceil((h.due - Date.now()) / DAY);
    if (diff <= 0) return '復習日：今日';
    return '次の復習：' + diff + '日後';
  }

  function renderList() {
    var items = listTargets();
    var dir = listFilter.dir;
    var shown = items.slice(0, listLimit);
    $('listCount').textContent = items.length + ' 語' + (items.length > shown.length ? '（' + shown.length + ' 語表示中）' : '');
    $('listMore').classList.toggle('hidden', items.length <= shown.length);

    var box = $('listRows');
    box.innerHTML = '';
    var frag = document.createDocumentFragment();

    shown.forEach(function (w) {
      var key = keyOf(w, dir);
      var st = statusOf(key);
      var row = document.createElement('div');
      row.className = 'wrow' + (st !== 'new' ? ' ' + st : '');

      var no = document.createElement('div');
      no.className = 'w-no';
      no.textContent = w.no;

      var main = document.createElement('div');
      main.className = 'w-main';

      var wordEl = document.createElement('div');
      wordEl.className = 'w-word';
      var wordSpan = document.createElement('span');
      wordSpan.textContent = w.word;
      if (settings.hide === 'word') wordSpan.className = 'masked';
      wordEl.appendChild(wordSpan);

      var meanEl = document.createElement('div');
      meanEl.className = 'w-meaning';
      var meanSpan = document.createElement('span');
      meanSpan.textContent = w.meaning;
      if (settings.hide === 'meaning') meanSpan.className = 'masked';
      meanEl.appendChild(meanSpan);

      main.appendChild(wordEl);
      main.appendChild(meanEl);

      if (settings.listSent) {
        var sent = document.createElement('div');
        sent.className = 'w-sent';
        var b = document.createElement('b');
        b.textContent = w.sentEn;
        sent.appendChild(b);
        sent.appendChild(document.createTextNode(w.sentJa));
        main.appendChild(sent);
      }
      var dl = dueLabel(key);
      if (dl) {
        var due = document.createElement('div');
        due.className = 'w-due';
        due.textContent = dl + (isMastered(key) ? '　★マスター' : '');
        main.appendChild(due);
      }

      var marks = document.createElement('div');
      marks.className = 'w-marks';
      [['correct', '◯'], ['unsure', '△'], ['weak', '✕']].forEach(function (p) {
        var b2 = document.createElement('button');
        b2.className = 'mark-btn ' + p[0] + (st === p[0] ? ' on' : '');
        b2.textContent = p[1];
        b2.setAttribute('data-mark', p[0]);
        b2.addEventListener('click', function () {
          var cur = statusOf(key);
          var next = cur === p[0] ? null : (p[0] === 'weak' ? 'wrong' : p[0]);
          setStatusManually(w, dir, next);
          var ns = statusOf(key);
          row.className = 'wrow' + (ns !== 'new' ? ' ' + ns : '');
          var btns = marks.children;
          for (var i = 0; i < btns.length; i++) {
            btns[i].classList.toggle('on', btns[i].getAttribute('data-mark') === ns);
          }
          updateDashboard();
        });
        marks.appendChild(b2);
      });

      row.appendChild(no);
      row.appendChild(main);
      row.appendChild(marks);
      frag.appendChild(row);
    });
    box.appendChild(frag);
  }

  // =====================================================
  // 成績分析
  // =====================================================
  function statsFor(words, dir) {
    var mastered = 0, touched = 0, c = 0, u = 0, w = 0;
    words.forEach(function (word) {
      var key = keyOf(word, dir);
      if (isMastered(key)) mastered++;
      else if (history[key]) touched++;
      var h = history[key];
      if (h) { c += h.correct || 0; u += h.unsure || 0; w += h.wrong || 0; }
    });
    var answered = c + u + w;
    return { total: words.length, mastered: mastered, touched: touched, rate: answered ? Math.round(c / answered * 100) : null };
  }

  function statsCellHtml(label, st) {
    var mPct = st.total ? Math.round(st.mastered / st.total * 100) : 0;
    var tPct = st.total ? Math.round((st.mastered + st.touched) / st.total * 100) : 0;
    return '<div class="st-cell"><span class="st-mode">' + label + '</span>' +
      '<span class="grp-bar"><i class="seg-t" style="width:' + tPct + '%"></i>' +
      '<i class="seg-m" style="width:' + mPct + '%"></i></span>' +
      '<span class="st-num">' + st.mastered + '/' + st.total + '</span>' +
      '<span class="st-rate">' + (st.rate === null ? '—' : '正答 ' + st.rate + '%') + '</span></div>';
  }

  function openStats() {
    var html = '<div class="stats-h">全体</div>' +
      '<div class="st-row"><div class="st-label">すべて<small>' + WORD_LIST.length + '語</small></div><div class="st-cells">' +
      statsCellHtml('英→日', statsFor(WORD_LIST, 'r')) +
      statsCellHtml('日→英', statsFor(WORD_LIST, 'w')) + '</div></div>';

    html += '<div class="stats-h">セクション別</div>';
    SECTIONS.forEach(function (sec) {
      html += '<div class="st-row"><div class="st-label">' + escapeHtml(sec.title) +
        '<small>' + sec.range + '</small></div><div class="st-cells">' +
        statsCellHtml('英→日', statsFor(sec.words, 'r')) +
        statsCellHtml('日→英', statsFor(sec.words, 'w')) + '</div></div>';
    });
    $('statsBody').innerHTML = html;
    $('statsModal').classList.remove('hidden');
  }

  // =====================================================
  // 学習履歴
  // =====================================================
  function computeStreak() {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    var key = function (x) { return x.getFullYear() + '-' + pad2(x.getMonth() + 1) + '-' + pad2(x.getDate()); };
    // 今日まだ学習していなくても、昨日までの連続は途切れていないものとして数える
    if (!daily[key(d)]) d.setDate(d.getDate() - 1);
    var n = 0;
    while (daily[key(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function openHistory() {
    var keys = Object.keys(daily);
    var totalQ = 0;
    keys.forEach(function (k) {
      var r = daily[k];
      totalQ += (r.correct || 0) + (r.unsure || 0) + (r.wrong || 0) + (r.skip || 0);
    });
    var hs = function (num, label) {
      return '<div class="hs-item"><span class="hs-num">' + num + '</span><span class="hs-label">' + label + '</span></div>';
    };
    $('histSummary').innerHTML = hs(computeStreak() + '日', '連続学習') + hs(keys.length + '日', '学習日数') + hs(totalQ + '問', 'のべ解答');

    var today = new Date(); today.setHours(0, 0, 0, 0);
    historyDays = [];
    var maxSolved = 1;
    for (var i = HIST_DAYS - 1; i >= 0; i--) {
      var d = new Date(today); d.setDate(today.getDate() - i);
      var k = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
      var r = daily[k] || { correct: 0, unsure: 0, wrong: 0, skip: 0, flash: 0 };
      var solved = (r.correct || 0) + (r.unsure || 0) + (r.wrong || 0) + (r.skip || 0);
      if (solved > maxSolved) maxSolved = solved;
      historyDays.push({ date: d, r: r, solved: solved });
    }

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
      var title = (day.date.getMonth() + 1) + '/' + day.date.getDate() + ' 解答' + day.solved + (r.flash ? '・自動' + r.flash : '');
      barsHtml += '<div class="hist-bar" data-idx="' + idx + '" title="' + title + '">' +
        seg('seg-ok', r.correct) + seg('seg-un', r.unsure) + seg('seg-ng', r.wrong) + seg('seg-sk', r.skip) + '</div>';
      monthsHtml += '<div class="hist-month-cell">' + (day.date.getDate() === 1 ? (day.date.getMonth() + 1) + '月' : '') + '</div>';
    });
    $('histBars').innerHTML = barsHtml;
    $('histMonths').innerHTML = monthsHtml;
    $('histDetail').textContent = '棒をタップすると、その日の内訳が表示されます。';

    $('historyModal').classList.remove('hidden');
    var wrap = $('histChartWrap');
    setTimeout(function () { wrap.scrollLeft = wrap.scrollWidth; }, 0);
  }

  function showHistDetail(idx) {
    var day = historyDays[idx];
    if (!day) return;
    var r = day.r;
    var c = r.correct || 0, u = r.unsure || 0, w = r.wrong || 0, s = r.skip || 0, f = r.flash || 0;
    var wd = ['日', '月', '火', '水', '木', '金', '土'][day.date.getDay()];
    var head = (day.date.getMonth() + 1) + '月' + day.date.getDate() + '日（' + wd + '）：';
    var txt;
    if (c + u + w + s + f === 0) txt = head + '学習なし';
    else {
      txt = head + '解答 ' + (c + u + w + s) + '問（◯' + c + ' △' + u + ' ✕' + w + (s ? ' −' + s : '') + '）';
      if (f) txt += ' ／ 自動再生 ' + f + '枚';
    }
    $('histDetail').textContent = txt;
    var bars = $('histBars').children;
    for (var i = 0; i < bars.length; i++) bars[i].classList.remove('active');
    if (bars[idx]) bars[idx].classList.add('active');
  }

  // =====================================================
  // エクスポート／インポート
  // =====================================================
  function exportData() {
    var payload = {
      app: 'reibun-eitango',
      version: 2,
      exportedAt: new Date().toISOString(),
      history: readJSON(LS_HISTORY, {}),
      daily: readJSON(LS_DAILY, {}),
      settings: readJSON(LS_SETTINGS, {}),
      reward: readJSON(LS_REWARD, {})
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'reibun-eitango-backup-' + todayKey() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function importData(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var data;
      try { data = JSON.parse(reader.result); }
      catch (e) { alert('読み込めませんでした（JSON形式のバックアップファイルを選んでください）。'); return; }
      if (!data || typeof data !== 'object' || !(data.history || data.daily || data.settings)) {
        alert('このアプリのバックアップファイルではないようです。'); return;
      }
      if (!confirm('バックアップを取り込みます。\n現在のデータと統合し、同じ項目は取り込んだ内容で上書きします。よろしいですか？')) return;
      var h = readJSON(LS_HISTORY, {}); Object.assign(h, data.history || {}); writeJSON(LS_HISTORY, h);
      var d = readJSON(LS_DAILY, {});   Object.assign(d, data.daily || {});   writeJSON(LS_DAILY, d);
      if (data.settings) writeJSON(LS_SETTINGS, data.settings);
      if (data.reward) writeJSON(LS_REWARD, data.reward);
      alert('取り込みました。画面を更新します。');
      location.reload();
    };
    reader.readAsText(file);
  }

  // =====================================================
  // チップ（ボタン群）の共通処理
  // =====================================================
  function syncChips(groupId, attr, value) {
    var g = $(groupId);
    if (!g) return;
    var chips = g.querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.toggle('active', chips[i].getAttribute(attr) === String(value));
    }
  }
  function bindChips(groupId, attr, onPick) {
    $(groupId).addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      var v = chip.getAttribute(attr);
      syncChips(groupId, attr, v);
      onPick(v);
    });
  }

  // =====================================================
  // イベント
  // =====================================================
  bindChips('dirGroup', 'data-dir', function (v) {
    settings.dir = v; saveSettings();
    updateDashboard(); renderGroupPanel();
  });
  bindChips('poolGroup', 'data-pool', function (v) { settings.pool = v; saveSettings(); });
  bindChips('orderGroup', 'data-order', function (v) { settings.order = v; saveSettings(); });
  bindChips('countGroup', 'data-count', function (v) { settings.count = parseInt(v, 10); saveSettings(); });
  bindChips('autoSpeedGroup', 'data-sec', function (v) { settings.autoSpeed = parseInt(v, 10); saveSettings(); });
  bindChips('autoVoiceGroup', 'data-voice', function (v) { settings.autoVoice = v; saveSettings(); });

  $('autoSpeak').addEventListener('change', function (e) { settings.autoSpeak = e.target.checked; saveSettings(); });
  $('autoLoop').addEventListener('change', function (e) { settings.autoLoop = e.target.checked; saveSettings(); });

  $('groupPanel').addEventListener('change', function (e) {
    var cb = e.target.closest('.grp-cb');
    if (!cb) return;
    setSection(parseInt(cb.getAttribute('data-si'), 10), cb.checked);
  });
  $('groupPanel').addEventListener('click', function (e) {
    var btn = e.target.closest('.grp-all');
    if (!btn) return;
    e.preventDefault();
    settings.sections = btn.getAttribute('data-act') === 'all'
      ? SECTIONS.map(function (s) { return s.index; }) : [];
    saveSettings();
    renderGroupPanel();
  });

  $('startBtn').addEventListener('click', function () { startSession(poolWords(), false); });
  $('autoStartBtn').addEventListener('click', function () { startSession(poolWords(), true); });
  $('testStartBtn').addEventListener('click', function () { startTest(poolWords()); });
  $('openListBtn').addEventListener('click', openList);
  $('dueBtn').addEventListener('click', function () {
    settings.pool = 'due'; saveSettings();
    syncChips('poolGroup', 'data-pool', 'due');
    startSession(poolWords('due'), false);
  });

  $('quizHomeBtn').addEventListener('click', goHome);
  $('revealBtn').addEventListener('click', revealAnswer);
  $('speakBtn').addEventListener('click', function () { speakNow(session.current.word, 'en-US'); });
  $('speakAnswerBtn').addEventListener('click', function () { speakNow(session.current.word, 'en-US'); });
  $('stopBtn').addEventListener('click', function () { stopAuto(); revealAnswer(); });
  document.querySelector('.grade-actions').addEventListener('click', function (e) {
    var b = e.target.closest('.grade');
    if (b) grade(b.getAttribute('data-grade'));
  });

  $('testHomeBtn').addEventListener('click', goHome);
  $('tSpeakBtn').addEventListener('click', function () { speakNow(quizState.questions[quizState.index].word.word, 'en-US'); });
  $('tNextBtn').addEventListener('click', function () {
    if (quizState.index >= quizState.questions.length - 1) showTestResult();
    else { quizState.index++; renderTestQuestion(); }
  });
  $('tRetryBtn').addEventListener('click', function () { startTest(quizState.source); });
  $('tRetryWrongBtn').addEventListener('click', function () {
    if (quizState.wrong.length) startTest(quizState.wrong.slice());
  });

  $('listHomeBtn').addEventListener('click', goHome);
  $('listSearch').addEventListener('input', function (e) { listFilter.q = e.target.value; listLimit = 200; renderList(); });
  bindChips('listDirGroup', 'data-dir', function (v) { listFilter.dir = v; renderList(); });
  bindChips('listHideGroup', 'data-hide', function (v) { settings.hide = v; saveSettings(); renderList(); });
  bindChips('listStatusGroup', 'data-st', function (v) { listFilter.status = v; listLimit = 200; renderList(); });
  $('listShowSent').addEventListener('change', function (e) { settings.listSent = e.target.checked; saveSettings(); renderList(); });
  $('listMore').addEventListener('click', function () { listLimit += 200; renderList(); });
  $('listRows').addEventListener('click', function (e) {
    var m = e.target.closest('.masked');
    if (m) m.classList.remove('masked');
  });

  // 見出しを5回つづけて押すと、管理者モードの出入り口が開く
  (function bindAdminGate() {
    var title = document.querySelector('.app-header h1');
    if (!title) return;
    var taps = 0, timer = null;
    title.addEventListener('click', function () {
      taps++;
      clearTimeout(timer);
      timer = setTimeout(function () { taps = 0; }, 1500);
      if (taps < 5) return;
      taps = 0;
      if (adminMode) {
        if (confirm('管理者モードを終了しますか？')) setAdmin(false);
        return;
      }
      var input = prompt('管理者パスワードを入れてください（動作確認用）');
      if (input === null) return;
      if (input === ADMIN_PASSWORD) {
        setAdmin(true);
        alert('管理者モードにしました。ごほうびゲームを何回でもあそべます。');
      } else {
        alert('パスワードがちがいます。');
      }
    });
  })();

  $('adminOffBtn').addEventListener('click', function () { setAdmin(false); });
  if ($('updateReloadBtn')) $('updateReloadBtn').addEventListener('click', hardReload);

  $('rewardBtn').addEventListener('click', openGame);
  $('rewardPlayBtn').addEventListener('click', openGame);
  $('gameHomeBtn').addEventListener('click', goHome);

  $('openStatsBtn').addEventListener('click', openStats);
  $('statsClose').addEventListener('click', function () { $('statsModal').classList.add('hidden'); });
  $('openHistoryBtn').addEventListener('click', openHistory);
  $('histClose').addEventListener('click', function () { $('historyModal').classList.add('hidden'); });
  $('histBars').addEventListener('click', function (e) {
    var bar = e.target.closest('.hist-bar');
    if (bar) showHistDetail(parseInt(bar.getAttribute('data-idx'), 10));
  });

  $('exportBtn').addEventListener('click', exportData);
  $('importBtn').addEventListener('click', function () { $('importFile').click(); });
  $('importFile').addEventListener('change', function (e) {
    if (e.target.files && e.target.files[0]) importData(e.target.files[0]);
    e.target.value = '';
  });

  $('themeBtn').addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(LS_THEME, next); } catch (err) {}
  });

  $('resetBtn').addEventListener('click', function () {
    if (!confirm('成績・区分・学習履歴をすべて消します。よろしいですか？')) return;
    history = {}; daily = {};
    writeJSON(LS_HISTORY, history); writeJSON(LS_DAILY, daily);
    updateDashboard(); renderGroupPanel();
  });

  // キーボード操作（カード画面）
  document.addEventListener('keydown', function (e) {
    if ($('quiz').classList.contains('hidden')) return;
    if (auto.on) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if ($('revealBox').classList.contains('hidden')) revealAnswer();
    } else if (e.key === '1') grade('correct');
    else if (e.key === '2') grade('unsure');
    else if (e.key === '3') grade('wrong');
  });

  window.addEventListener('pagehide', stopAuto);

  // =====================================================
  // 起動
  // =====================================================
  syncChips('dirGroup', 'data-dir', settings.dir);
  syncChips('poolGroup', 'data-pool', settings.pool);
  syncChips('orderGroup', 'data-order', settings.order);
  syncChips('countGroup', 'data-count', settings.count);
  syncChips('autoSpeedGroup', 'data-sec', settings.autoSpeed);
  syncChips('autoVoiceGroup', 'data-voice', settings.autoVoice);
  $('autoSpeak').checked = !!settings.autoSpeak;
  $('autoLoop').checked = !!settings.autoLoop;

  renderGroupPanel();
  updateDashboard();
  checkVersion();
  renderAdmin();
  renderRewardButton();
  showView('controls');

  if (window.RewardGame) {
    window.RewardGame.init({
      onStart: consumeTicket,
      getWords: gameWordPool,
      getPad: function () { return settings.gamePad === true; },   // 既定は「なぞる操作」だけ
      setPad: function (on) { settings.gamePad = on; saveSettings(); },
      getHi: function () { return reward.hi || 0; },
      setHi: function (v) { reward.hi = v; saveReward(); },
      footer: function () { return adminMode ? '🔧 管理者モード：何回でもあそべます' : ticketsLabel(); }
    });
  }

  // 動作確認用に一部を公開する
  window.__app = {
    history: function () { return history; },
    daily: function () { return daily; },
    settings: function () { return settings; },
    poolWords: poolWords, keyOf: keyOf, statusOf: statusOf, isDue: isDue, isMastered: isMastered,
    session: function () { return session; }, quizState: function () { return quizState; },
    reward: function () { return reward; },
    gameWordPool: gameWordPool
  };
})();
