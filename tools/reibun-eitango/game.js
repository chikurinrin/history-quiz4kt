// ごほうびゲーム（グラディウス風・横スクロールシューティング）
// tools/shooting-game を参考に、このアプリ用に作り直したもの。
// カプセルでパワーメーターを進め、好きなタイミングで発動する方式。
// script.js から RewardGame.init() → RewardGame.open() で呼び出す。

(function (global) {
  'use strict';

  var W = 800, H = 450;              // 内部の描画サイズ（表示はCSSで拡大縮小）
  var START_LIVES = 6;               // ライフの既定値（プレイ権から指定が無いときに使う）
  var GROUND = 34;                   // 上下の地形の高さ（当たり判定はなし・見た目だけ）

  var canvas, ctx, el = {}, hooks = {};
  var raf = null, inited = false;

  // ---- ゲーム状態 ----
  var state = 'title';               // title | playing | dead | clear | gameover
  var score = 0, hi = 0, lives = START_LIVES, stage = 1;
  var wordsKilled = 0, quizHits = 0;   // たおした単語の数・おだい正解数（結果画面に出す）
  var frame = 0, scroll = 0, msgTimer = 0, msgText = '';
  var player, bullets, enemies, eBullets, capsules, particles, stars, boss;

  // ---- 英単語の仕掛け ----
  // 単語エネミーは英語を掲げて飛んでくる。1発当てると日本語に変わり、もう1発で撃破。
  // ときどき「おだい（日本語）」が出て、合う単語の敵を倒すと大きなボーナス。
  var wordPool = [], wordIdx = 0;   // 出す単語（苦手な語を優先して script.js から受け取る）
  var quiz = null;                  // { meaning, answer, life }
  var floats = [];                  // 撃破時に浮かび上がる文字
  var JP_FONT = '"Hiragino Kaku Gothic ProN", "Yu Gothic UI", Meiryo, sans-serif';

  var POWERS = ['SPEED', 'MISSILE', 'DOUBLE', 'LASER', 'OPTION', 'SHIELD'];

  // ---- 入力 ----
  var keys = { up: false, down: false, left: false, right: false, fire: false, power: false };
  var powerLatch = false;            // 発動はキーを押した瞬間だけ効かせる
  var KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    Space: 'fire', KeyJ: 'fire',
    KeyZ: 'power', KeyK: 'power'
  };

  function onKeyDown(e) {
    if (!isOpen()) return;
    var k = KEYMAP[e.code];
    if (k) { keys[k] = true; e.preventDefault(); }
    if (e.code === 'Enter' && state !== 'playing') { e.preventDefault(); startGame(); }
  }
  function onKeyUp(e) {
    if (!isOpen()) return;
    var k = KEYMAP[e.code];
    if (k) { keys[k] = false; e.preventDefault(); }
  }
  function clearKeys() {
    for (var k in keys) keys[k] = false;
    powerLatch = false;
  }

  function isOpen() { return el.view && !el.view.classList.contains('hidden'); }

  // =====================================================
  // 準備
  // =====================================================
  function init(options) {
    if (inited) return;
    hooks = options || {};
    canvas = document.getElementById('rgCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    el.view = document.getElementById('gameView');
    el.score = document.getElementById('rgScore');
    el.hi = document.getElementById('rgHi');
    el.lives = document.getElementById('rgLives');
    el.stage = document.getElementById('rgStage');
    el.meter = document.getElementById('rgMeter');
    el.overlay = document.getElementById('rgOverlay');
    el.title = document.getElementById('rgTitle');
    el.message = document.getElementById('rgMessage');
    el.startBtn = document.getElementById('rgStartBtn');

    el.meter.innerHTML = POWERS.map(function (p) { return '<i>' + p + '</i>'; }).join('');
    el.cells = [].slice.call(el.meter.querySelectorAll('i'));

    hi = (hooks.getHi && hooks.getHi()) || 0;
    el.hi.textContent = hi;

    el.startBtn.addEventListener('click', startGame);

    // スマホ用ボタン
    [].slice.call(document.querySelectorAll('#gameView .rg-ctrl')).forEach(function (btn) {
      var k = btn.getAttribute('data-key');
      var on = function (e) { e.preventDefault(); keys[k] = true; };
      var off = function (e) { e.preventDefault(); keys[k] = false; };
      btn.addEventListener('touchstart', on, { passive: false });
      btn.addEventListener('touchend', off, { passive: false });
      btn.addEventListener('touchcancel', off, { passive: false });
      btn.addEventListener('mousedown', on);
      btn.addEventListener('mouseup', off);
      btn.addEventListener('mouseleave', off);
    });

    addEventListener('keydown', onKeyDown);
    addEventListener('keyup', onKeyUp);
    inited = true;
  }

  // 画面を開く（まだ始めない：STARTを押したらプレイ権を1回使う）
  // livesForNextPlay: 今回のプレイ権で遊べるライフ数（成績によって変わる）
  function open(livesForNextPlay) {
    state = 'title';
    lives = livesForNextPlay > 0 ? livesForNextPlay : START_LIVES;
    clearKeys();
    resetWorld();
    showOverlay('ごほうびゲーム',
      '今回のライフは <b>♥ ' + lives + '</b> です。<br>' +
      '矢印キー / WASD で移動、スペース で連射、Z でパワーアップ発動。<br>' +
      'カプセル <b>C</b> を取るとゲージが進みます。好きなところで発動してください。<br><br>' +
      '英語をかかげた敵は、<b>1発当てると日本語に変わり</b>、もう1発でたおせます。<br>' +
      '<b>おだい</b>が出たら、その意味に合う単語の敵をたおすと大ボーナス！<br>' +
      '<small>出てくる単語は、あなたが苦手な語・今日の復習の語から選ばれます。<br>' +
      'スマホは画面下のボタンで操作できます。</small>');
    drawFrame();
    loop();
  }

  function close() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    clearKeys();
    state = 'title';
  }

  function showOverlay(title, html) {
    el.title.textContent = title;
    el.message.innerHTML = html;
    el.overlay.classList.remove('hidden');
  }
  function hideOverlay() { el.overlay.classList.add('hidden'); }

  // =====================================================
  // 初期化
  // =====================================================
  function resetWorld() {
    bullets = []; enemies = []; eBullets = []; capsules = []; particles = [];
    floats = []; quiz = null;
    boss = null;
    frame = 0; scroll = 0; msgTimer = 0;
    loadWords();
    stars = [];
    for (var i = 0; i < 90; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * 2 + 0.4 });
    }
    resetPlayer();
    updateHud();
  }

  // やられた後もパワーは残す（子どもが遊びやすいように、グラディウスの完全リセットはしない）
  function resetPlayer() {
    player = {
      x: 110, y: H / 2, w: 32, h: 16,
      speed: 3.0, cool: 0, missileCool: 0,
      powerIndex: 0,
      speedUps: 0,
      weapon: 'normal',     // normal | double | laser
      hasMissile: false,
      options: [],
      shield: 0,
      inv: 120,
      trail: []
    };
  }

  function startGame() {
    // onStart はプレイ権を1回使い、そのぶんのライフ数を返す（権利がなければ false）
    var granted = hooks.onStart ? hooks.onStart() : START_LIVES;
    if (granted === false) return;
    lives = (typeof granted === 'number' && granted > 0) ? granted : START_LIVES;
    score = 0; stage = 1; wordsKilled = 0; quizHits = 0;
    resetWorld();
    hideOverlay();
    state = 'playing';
    clearKeys();
    setMessage('STAGE 1');
    loop();
  }

  function setMessage(text) { msgText = text; msgTimer = 110; }

  // =====================================================
  // 英単語の仕掛け
  // =====================================================
  // 出題する単語を受け取る（script.js が苦手な語を優先して渡してくれる）
  function loadWords() {
    var list = (hooks.getWords && hooks.getWords()) || [];
    wordPool = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].word && list[i].meaning) wordPool.push(list[i]);
    }
    // 並びをまぜて、毎回ちがう単語から出るようにする
    for (var j = wordPool.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var t = wordPool[j]; wordPool[j] = wordPool[k]; wordPool[k] = t;
    }
    wordIdx = 0;
  }

  function takeWord() {
    if (!wordPool.length) return null;
    var w = wordPool[wordIdx % wordPool.length];
    wordIdx++;
    return w;
  }

  // 撃破したときに浮かび上がる文字
  function addFloat(x, y, text, color) {
    floats.push({ x: x, y: y, text: text, color: color, life: 95 });
  }

  function updateFloats() {
    for (var i = floats.length - 1; i >= 0; i--) {
      var f = floats[i];
      f.y -= 0.45;
      f.life--;
      if (f.life <= 0) floats.splice(i, 1);
    }
  }

  // 「おだい」を出して、答えを含む3機の単語エネミーを送り出す
  function startWordQuiz() {
    if (wordPool.length < 4) return;
    var answer = takeWord();
    if (!answer) return;
    var picks = [answer];
    var guard = 0;
    while (picks.length < 3 && guard < 60) {
      guard++;
      var c = wordPool[Math.floor(Math.random() * wordPool.length)];
      if (picks.some(function (p) { return p.word === c.word; })) continue;
      picks.push(c);
    }
    quiz = { meaning: answer.meaning, answer: answer.word, life: 900 };

    // 上・中・下に散らして出す（どれを撃つか選べるように）
    var ys = shuffleArray([110, H / 2, H - 110]);
    shuffleArray(picks).forEach(function (p, i) {
      enemies.push(makeWordEnemy(p, W + 60 + i * 30, ys[i], true));
    });
    setMessage('おだい！');
  }

  function shuffleArray(a) {
    var b = a.slice();
    for (var i = b.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = b[i]; b[i] = b[j]; b[j] = t;
    }
    return b;
  }

  function makeWordEnemy(w, x, y, isQuiz) {
    ctx.font = 'bold 15px ' + JP_FONT;
    var width = Math.max(ctx.measureText(w.word).width, ctx.measureText(w.meaning).width);
    return {
      type: 'word', x: x, y: y, w: width + 24, h: 30, t: 0,
      vx: -1.6, baseY: y, hp: 2, score: 300,
      word: w.word, meaning: w.meaning, revealed: false, quiz: !!isQuiz
    };
  }

  function updateHud() {
    el.score.textContent = score;
    el.hi.textContent = hi;
    el.lives.textContent = lives;
    el.stage.textContent = stage;
    for (var i = 0; i < el.cells.length; i++) {
      el.cells[i].classList.toggle('on', i === player.powerIndex - 1);
    }
  }

  // =====================================================
  // メインループ
  // =====================================================
  function loop() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function step() {
      if (!isOpen()) { raf = null; return; }
      if (state === 'playing') update();
      drawFrame();
      raf = requestAnimationFrame(step);
    });
  }

  // =====================================================
  // 更新
  // =====================================================
  function update() {
    frame++;
    scroll += 1.8;
    if (msgTimer > 0) msgTimer--;

    updatePlayer();
    spawn();
    updateEnemies();
    updateBoss();
    updateBullets();
    updateCapsules();
    updateParticles();
    updateFloats();
    updateQuiz();
    collide();
    updateHud();
  }

  function updatePlayer() {
    var p = player;
    if (p.inv > 0) p.inv--;

    var sp = p.speed;
    if (keys.left) p.x -= sp;
    if (keys.right) p.x += sp;
    if (keys.up) p.y -= sp;
    if (keys.down) p.y += sp;
    p.x = Math.max(16, Math.min(W - 40, p.x));
    p.y = Math.max(GROUND + 12, Math.min(H - GROUND - 12, p.y));

    // オプションが後ろをついてくるように、通った跡を覚えておく
    p.trail.unshift({ x: p.x, y: p.y });
    if (p.trail.length > 120) p.trail.pop();
    for (var i = 0; i < p.options.length; i++) {
      var t = p.trail[Math.min((i + 1) * 16, p.trail.length - 1)];
      if (t) { p.options[i].x = t.x; p.options[i].y = t.y; }
    }

    // パワーアップの発動（押した瞬間だけ）
    if (keys.power && !powerLatch) { powerLatch = true; applyPower(); }
    if (!keys.power) powerLatch = false;

    // ショット
    if (p.cool > 0) p.cool--;
    if (keys.fire && p.cool <= 0) { shoot(); p.cool = p.weapon === 'laser' ? 12 : 8; }

    // ミサイル
    if (p.hasMissile) {
      if (p.missileCool > 0) p.missileCool--;
      if (keys.fire && p.missileCool <= 0) {
        p.missileCool = 34;
        bullets.push({ x: p.x + 10, y: p.y + 6, vx: 3.4, vy: 2.6, w: 8, h: 6, type: 'missile', dmg: 2 });
      }
    }
  }

  function shoot() {
    var p = player;
    var shots = [{ x: p.x + 22, y: p.y }];
    p.options.forEach(function (o) { shots.push({ x: o.x + 14, y: o.y }); });

    shots.forEach(function (s) {
      if (p.weapon === 'laser') {
        bullets.push({ x: s.x, y: s.y - 2, vx: 14, vy: 0, w: 56, h: 4, type: 'laser', dmg: 2, pierce: true });
      } else {
        bullets.push({ x: s.x, y: s.y, vx: 10, vy: 0, w: 14, h: 4, type: 'shot', dmg: 1 });
        if (p.weapon === 'double') {
          bullets.push({ x: s.x, y: s.y, vx: 7.5, vy: -7.5, w: 10, h: 4, type: 'shot', dmg: 1 });
        }
      }
    });
  }
  function applyPower() {
    var p = player;
    var lv = p.powerIndex;
    if (lv === 0) return;
    var name = POWERS[lv - 1];
    if (name === 'SPEED') {
      if (p.speedUps >= 4) return;
      p.speedUps++; p.speed += 0.7;
    } else if (name === 'MISSILE') {
      if (p.hasMissile) return;
      p.hasMissile = true;
    } else if (name === 'DOUBLE') {
      if (p.weapon === 'double') return;
      p.weapon = 'double';
    } else if (name === 'LASER') {
      if (p.weapon === 'laser') return;
      p.weapon = 'laser';
    } else if (name === 'OPTION') {
      if (p.options.length >= 2) return;
      p.options.push({ x: p.x, y: p.y });
    } else if (name === 'SHIELD') {
      p.shield = 4;
    }
    p.powerIndex = 0;
    setMessage(name + '!');
    burst(p.x, p.y, '#7dd3fc', 14);
  }

  // =====================================================
  // 敵の出現
  // =====================================================
  var BOSS_FRAME = 1800;   // このフレーム数（約30秒）で1面が終わってボスが出る

  function spawn() {
    if (boss) return;
    var f = frame % BOSS_FRAME;
    if (f === BOSS_FRAME - 1) { spawnBoss(); return; }
    if (f > BOSS_FRAME - 120) return;      // ボス前は少し静かにする

    var hard = 1 + (stage - 1) * 0.25;

    // 編隊（5機まとめて出て、全部倒すとカプセルが出る）
    if (f % 200 === 40) {
      var gid = 'g' + frame;
      var baseY = 90 + Math.random() * (H - 220);
      for (var i = 0; i < 5; i++) {
        enemies.push(makeEnemy('wave', W + 40 + i * 46, baseY, gid, hard));
      }
    }
    // 単機（まっすぐ）
    if (f % 90 === 0) {
      enemies.push(makeEnemy('straight', W + 30, GROUND + 30 + Math.random() * (H - GROUND * 2 - 60), null, hard));
    }
    // 撃ってくる敵
    if (f % 320 === 120) {
      enemies.push(makeEnemy('shooter', W + 30, 80 + Math.random() * (H - 200), null, hard));
    }
    // 単語エネミー（英語を掲げて飛んでくる。撃つと日本語になる）
    if (f % 150 === 70) {
      var w = takeWord();
      if (w) enemies.push(makeWordEnemy(w, W + 40, 90 + Math.random() * (H - 220), false));
    }
    // おだい（3機のうち、意味に合う単語を倒すとボーナス）
    if (f % 460 === 200 && !quiz) startWordQuiz();
  }

  // おだいの時間切れ／答えが画面外へ出たときの後始末
  function updateQuiz() {
    if (!quiz) return;
    quiz.life--;
    var alive = enemies.some(function (e) { return e.type === 'word' && e.quiz && e.word === quiz.answer; });
    if (quiz.life <= 0 || !alive) {
      addFloat(W / 2, 70, 'おだい：' + quiz.answer + ' ＝ ' + quiz.meaning, '#fbbf24');
      quiz = null;
      enemies.forEach(function (e) { if (e.type === 'word') e.quiz = false; });
    }
  }

  function makeEnemy(type, x, y, group, hard) {
    var e = {
      type: type, x: x, y: y, w: 28, h: 22, t: 0,
      group: group, baseY: y, hp: 1, score: 100, cool: 60
    };
    if (type === 'wave') { e.vx = -2.6 - hard * 0.2; e.score = 120; }
    else if (type === 'shooter') { e.vx = -1.5; e.hp = 3; e.w = 32; e.h = 26; e.score = 300; }
    else { e.vx = -3.2 - hard * 0.3; }
    return e;
  }

  function updateEnemies() {
    for (var i = enemies.length - 1; i >= 0; i--) {
      var e = enemies[i];
      e.t++;
      e.x += e.vx;
      if (e.type === 'wave') e.y = e.baseY + Math.sin(e.t / 18) * 48;
      if (e.type === 'word') e.y = e.baseY + Math.sin(e.t / 40) * 16;   // ゆっくり上下に揺れる
      if (e.type === 'shooter') {
        e.cool--;
        if (e.cool <= 0 && e.x < W - 20) {
          e.cool = 90;
          fireAtPlayer(e.x, e.y, 2.6);
        }
      }
      if (e.x < -60) enemies.splice(i, 1);
    }
  }

  function fireAtPlayer(x, y, sp) {
    var dx = player.x - x, dy = player.y - y;
    var d = Math.hypot(dx, dy) || 1;
    eBullets.push({ x: x, y: y, vx: dx / d * sp, vy: dy / d * sp, r: 5 });
  }

  // ---- ボス ----
  function spawnBoss() {
    boss = {
      x: W + 120, y: H / 2, w: 120, h: 130,
      hp: 60 + (stage - 1) * 25, maxHp: 60 + (stage - 1) * 25,
      t: 0, cool: 60, entering: true
    };
    // ボスのHPバーと「おだい」の帯が重ならないよう、出題は打ち切る
    quiz = null;
    enemies.forEach(function (e) { if (e.type === 'word') e.quiz = false; });
    setMessage('WARNING!!');
  }

  function updateBoss() {
    if (!boss) return;
    boss.t++;
    if (boss.entering) {
      boss.x -= 2.2;
      if (boss.x <= W - 190) boss.entering = false;
    } else {
      boss.y = H / 2 + Math.sin(boss.t / 60) * (H / 2 - boss.h / 2 - GROUND - 10);
      boss.cool--;
      if (boss.cool <= 0) {
        boss.cool = 46;
        for (var a = -2; a <= 2; a++) {
          var ang = Math.PI + a * 0.22;
          eBullets.push({ x: boss.x - 10, y: boss.y, vx: Math.cos(ang) * 3.2, vy: Math.sin(ang) * 3.2, r: 6 });
        }
        if (boss.t % 3 === 0) fireAtPlayer(boss.x - 10, boss.y, 3.4);
      }
    }
  }

  // =====================================================
  // 弾・カプセル・破片
  // =====================================================
  function updateBullets() {
    var i;
    for (i = bullets.length - 1; i >= 0; i--) {
      var b = bullets[i];
      b.x += b.vx; b.y += b.vy;
      if (b.type === 'missile') {
        if (b.y > H - GROUND - 8) { b.y = H - GROUND - 8; b.vy = 0; b.vx = 5; }
      }
      if (b.x > W + 60 || b.x < -60 || b.y < -40 || b.y > H + 40) bullets.splice(i, 1);
    }
    for (i = eBullets.length - 1; i >= 0; i--) {
      var eb = eBullets[i];
      eb.x += eb.vx; eb.y += eb.vy;
      if (eb.x < -30 || eb.x > W + 30 || eb.y < -30 || eb.y > H + 30) eBullets.splice(i, 1);
    }
  }

  function updateCapsules() {
    for (var i = capsules.length - 1; i >= 0; i--) {
      var c = capsules[i];
      c.x -= 1.6; c.t++;
      if (c.x < -30) capsules.splice(i, 1);
    }
  }

  function burst(x, y, color, n) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, s = Math.random() * 3.4 + 0.6;
      particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 26 + Math.random() * 16, color: color });
    }
  }

  function updateParticles() {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vx *= 0.94; p.vy *= 0.94; p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  // =====================================================
  // 当たり判定
  // =====================================================
  function hit(ax, ay, aw, ah, bx, by, bw, bh) {
    return Math.abs(ax - bx) < (aw + bw) / 2 && Math.abs(ay - by) < (ah + bh) / 2;
  }

  function collide() {
    var i, j;

    // 自機の弾 → 敵
    for (i = bullets.length - 1; i >= 0; i--) {
      var b = bullets[i];
      var used = false;
      for (j = enemies.length - 1; j >= 0; j--) {
        var e = enemies[j];
        if (!hit(b.x, b.y, b.w, b.h, e.x, e.y, e.w, e.h)) continue;
        e.hp -= b.dmg;
        // 単語エネミーは1発当たると英語が日本語に変わる（意味のヒントになる）
        if (e.type === 'word' && e.hp > 0 && !e.revealed) {
          e.revealed = true;
          burst(e.x, e.y, '#7dd3fc', 6);
        }
        if (!b.pierce) used = true;
        if (e.hp <= 0) killEnemy(j);
        if (used) break;
      }
      if (!used && boss && hit(b.x, b.y, b.w, b.h, boss.x, boss.y, boss.w, boss.h)) {
        boss.hp -= b.dmg;
        burst(b.x, b.y, '#fbbf24', 3);
        if (!b.pierce) used = true;
        if (boss.hp <= 0) killBoss();
      }
      if (used) bullets.splice(i, 1);
    }

    // カプセルを取る
    for (i = capsules.length - 1; i >= 0; i--) {
      var c = capsules[i];
      if (hit(player.x, player.y, player.w, player.h, c.x, c.y, 20, 20)) {
        capsules.splice(i, 1);
        player.powerIndex = Math.min(player.powerIndex + 1, POWERS.length);
        addScore(50);
      }
    }

    if (player.inv > 0) return;

    // 敵・敵弾 → 自機
    for (i = enemies.length - 1; i >= 0; i--) {
      if (hit(player.x, player.y, player.w, player.h, enemies[i].x, enemies[i].y, enemies[i].w, enemies[i].h)) {
        killEnemy(i); damagePlayer(); return;
      }
    }
    for (i = eBullets.length - 1; i >= 0; i--) {
      var eb = eBullets[i];
      if (hit(player.x, player.y, player.w, player.h, eb.x, eb.y, eb.r * 2, eb.r * 2)) {
        eBullets.splice(i, 1); damagePlayer(); return;
      }
    }
    if (boss && !boss.entering && hit(player.x, player.y, player.w, player.h, boss.x, boss.y, boss.w, boss.h)) {
      damagePlayer();
    }
  }

  function killEnemy(index) {
    var e = enemies[index];
    enemies.splice(index, 1);
    burst(e.x, e.y, '#f97316', 12);
    addScore(e.score);

    // 単語エネミー：倒すと「英語 ＝ 意味」が浮かび上がる
    if (e.type === 'word') {
      wordsKilled++;
      var isAnswer = quiz && e.quiz && e.word === quiz.answer;
      if (isAnswer) {
        quizHits++;
        addScore(2000);
        addFloat(e.x, e.y, 'せいかい！ ' + e.word + ' ＝ ' + e.meaning, '#4ade80');
        setMessage('せいかい！ +2000');
        capsules.push({ x: e.x, y: e.y, t: 0 });
        quiz = null;
        enemies.forEach(function (x) { if (x.type === 'word') x.quiz = false; });
      } else {
        addFloat(e.x, e.y, e.word + ' ＝ ' + e.meaning, e.quiz ? '#f87171' : '#7dd3fc');
        if (e.quiz) setMessage('ちがう単語！');
      }
      return;
    }

    // 編隊を全部倒すとカプセルが出る
    if (e.group) {
      var rest = enemies.some(function (x) { return x.group === e.group; });
      if (!rest) capsules.push({ x: e.x, y: e.y, t: 0 });
    } else if (Math.random() < 0.12) {
      capsules.push({ x: e.x, y: e.y, t: 0 });
    }
  }

  function killBoss() {
    burst(boss.x, boss.y, '#f43f5e', 60);
    addScore(5000);
    boss = null;
    stage++;
    frame = 0;
    setMessage('STAGE ' + stage);
    capsules.push({ x: W - 120, y: H / 2, t: 0 });
  }

  function damagePlayer() {
    if (player.shield > 0) {
      player.shield--;
      player.inv = 40;
      burst(player.x, player.y, '#38bdf8', 12);
      return;
    }
    burst(player.x, player.y, '#f43f5e', 26);
    lives--;
    if (lives <= 0) { gameOver(); return; }
    player.x = 110; player.y = H / 2; player.inv = 110;
    eBullets = [];
  }

  function addScore(n) {
    score += n;
    if (score > hi) { hi = score; if (hooks.setHi) hooks.setHi(hi); }
  }

  function gameOver() {
    state = 'gameover';
    clearKeys();
    if (hooks.onGameOver) hooks.onGameOver(score, stage);
    showOverlay('GAME OVER',
      'スコア <b>' + score + '</b>　ステージ <b>' + stage + '</b><br>' +
      'ハイスコア <b>' + hi + '</b><br>' +
      'たおした単語 <b>' + wordsKilled + '</b> 語　おだい正解 <b>' + quizHits + '</b> 回' +
      (hooks.footer ? '<br>' + hooks.footer() : ''));
  }

  // =====================================================
  // 描画
  // =====================================================
  function drawFrame() {
    ctx.fillStyle = '#050a18';
    ctx.fillRect(0, 0, W, H);

    // 星
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.x -= s.z * 1.4;
      if (s.x < 0) { s.x = W; s.y = Math.random() * H; }
      ctx.fillStyle = s.z > 1.6 ? '#cbd5e1' : '#475569';
      ctx.fillRect(s.x, s.y, s.z > 1.6 ? 2 : 1, s.z > 1.6 ? 2 : 1);
    }

    drawTerrain();

    // カプセル
    capsules.forEach(function (c) {
      var pulse = 0.5 + 0.5 * Math.sin(c.t / 6);
      ctx.fillStyle = 'rgba(56,189,248,' + (0.45 + pulse * 0.55) + ')';
      ctx.fillRect(c.x - 9, c.y - 9, 18, 18);
      ctx.fillStyle = '#082f49';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('C', c.x - 4, c.y + 5);
    });

    // 敵
    enemies.forEach(drawEnemy);
    if (boss) drawBoss();

    // 弾
    bullets.forEach(function (b) {
      if (b.type === 'laser') ctx.fillStyle = '#a78bfa';
      else if (b.type === 'missile') ctx.fillStyle = '#facc15';
      else ctx.fillStyle = '#fef08a';
      ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    });
    ctx.fillStyle = '#fb7185';
    eBullets.forEach(function (eb) {
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 破片
    particles.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, p.life / 40);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;

    if (state === 'playing' || state === 'dead') drawPlayer();

    // 撃破した単語の「英語 ＝ 意味」
    ctx.textAlign = 'center';
    floats.forEach(function (f) {
      ctx.globalAlpha = Math.min(1, f.life / 40);
      ctx.font = 'bold 16px ' + JP_FONT;
      ctx.fillStyle = 'rgba(2,6,23,.75)';
      var w = ctx.measureText(f.text).width;
      ctx.fillRect(f.x - w / 2 - 8, f.y - 15, w + 16, 22);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    });
    ctx.globalAlpha = 1;

    // おだい（画面上の帯）
    if (quiz) {
      ctx.font = 'bold 17px ' + JP_FONT;
      var text = 'おだい：「' + quiz.meaning + '」の単語をたおせ！';
      var tw = ctx.measureText(text).width;
      ctx.fillStyle = 'rgba(251,191,36,.92)';
      ctx.fillRect(W / 2 - tw / 2 - 14, 8, tw + 28, 28);
      ctx.fillStyle = '#422006';
      ctx.fillText(text, W / 2, 28);
      // 残り時間
      ctx.fillStyle = 'rgba(66,32,6,.35)';
      ctx.fillRect(W / 2 - tw / 2 - 14, 34, (tw + 28) * Math.max(0, quiz.life / 900), 3);
    }
    ctx.textAlign = 'left';

    // メッセージ
    if (msgTimer > 0) {
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 30px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(msgText, W / 2, H / 2 - 60);
      ctx.textAlign = 'left';
    }
  }

  function drawTerrain() {
    ctx.fillStyle = '#131c33';
    for (var x = 0; x < W + 40; x += 40) {
      var o = (x - (scroll % 40));
      var top = GROUND + Math.sin((x + scroll) / 90) * 10;
      var bot = GROUND + Math.cos((x + scroll) / 70) * 12;
      ctx.fillRect(o, 0, 40, top);
      ctx.fillRect(o, H - bot, 40, bot);
    }
    ctx.fillStyle = '#1e2b4d';
    ctx.fillRect(0, 0, W, 3);
    ctx.fillRect(0, H - 3, W, 3);
  }

  function drawPlayer() {
    var p = player;
    if (p.inv > 0 && Math.floor(frame / 4) % 2 === 0) return;   // 無敵中は点滅

    // オプション
    ctx.fillStyle = '#fbbf24';
    p.options.forEach(function (o) {
      ctx.beginPath(); ctx.arc(o.x, o.y, 7, 0, Math.PI * 2); ctx.fill();
    });

    // 本体
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(p.x + 22, p.y);
    ctx.lineTo(p.x - 12, p.y - 9);
    ctx.lineTo(p.x - 4, p.y);
    ctx.lineTo(p.x - 12, p.y + 9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(p.x - 10, p.y - 3, 14, 6);

    // 噴射
    ctx.fillStyle = frame % 6 < 3 ? '#f97316' : '#fbbf24';
    ctx.fillRect(p.x - 18, p.y - 2, 6, 4);

    // シールド
    if (p.shield > 0) {
      ctx.strokeStyle = 'rgba(56,189,248,.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x + 4, p.y, 26, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }
  }

  function drawEnemy(e) {
    if (e.type === 'word') {
      var label = e.revealed ? e.meaning : e.word;
      var isQ = quiz && e.quiz;
      ctx.font = 'bold 15px ' + JP_FONT;
      var tw = ctx.measureText(label).width;
      var w = tw + 24, h = 30;
      // 枠（おだい中の敵は金色、それ以外は青）
      ctx.fillStyle = e.revealed ? 'rgba(56,189,248,.22)' : 'rgba(15,23,42,.85)';
      ctx.fillRect(e.x - w / 2, e.y - h / 2, w, h);
      ctx.strokeStyle = isQ ? '#fbbf24' : (e.revealed ? '#38bdf8' : '#94a3b8');
      ctx.lineWidth = 2;
      ctx.strokeRect(e.x - w / 2, e.y - h / 2, w, h);
      // 文字
      ctx.fillStyle = e.revealed ? '#e0f2fe' : '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(label, e.x, e.y + 5);
      ctx.textAlign = 'left';
      return;
    }
    if (e.type === 'shooter') {
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h);
      ctx.fillStyle = '#f0abfc';
      ctx.fillRect(e.x - e.w / 2, e.y - 3, 8, 6);
    } else if (e.type === 'wave') {
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(e.x - 14, e.y);
      ctx.lineTo(e.x + 8, e.y - 11);
      ctx.lineTo(e.x + 14, e.y);
      ctx.lineTo(e.x + 8, e.y + 11);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(e.x - 4, e.y - 3, 8, 6);
    }
  }

  function drawBoss() {
    var b = boss;
    ctx.fillStyle = '#475569';
    ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    ctx.fillStyle = '#334155';
    ctx.fillRect(b.x - b.w / 2 - 14, b.y - 26, 16, 52);
    // コア
    var pulse = 0.5 + 0.5 * Math.sin(b.t / 8);
    ctx.fillStyle = 'rgba(248,113,113,' + (0.55 + pulse * 0.45) + ')';
    ctx.beginPath();
    ctx.arc(b.x - 18, b.y, 20, 0, Math.PI * 2);
    ctx.fill();
    // HPバー
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(W - 220, 12, 200, 8);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(W - 220, 12, 200 * Math.max(0, b.hp / b.maxHp), 8);
  }

  // 動作確認用に内部の様子を見られるようにしておく
  function inspect() {
    return {
      state: state, frame: frame, score: score, lives: lives, stage: stage,
      enemies: enemies ? enemies.length : 0,
      bullets: bullets ? bullets.length : 0,
      capsules: capsules ? capsules.length : 0,
      boss: !!boss,
      words: enemies ? enemies.filter(function (e) { return e.type === 'word'; }).length : 0,
      wordRevealed: enemies ? enemies.filter(function (e) { return e.type === 'word' && e.revealed; }).length : 0,
      wordSample: (function () {
        var e = enemies ? enemies.filter(function (x) { return x.type === 'word'; })[0] : null;
        return e ? { word: e.word, meaning: e.meaning, revealed: e.revealed, quiz: e.quiz } : null;
      })(),
      wordsKilled: wordsKilled, quizHits: quizHits,
      poolSize: wordPool.length,
      floats: floats ? floats.length : 0,
      lastFloat: floats && floats.length ? floats[floats.length - 1].text : '',
      quiz: quiz ? { meaning: quiz.meaning, answer: quiz.answer } : null,
      quizEnemies: enemies ? enemies.filter(function (e) { return e.type === 'word' && e.quiz; }).length : 0,
      quizAnswerOnField: !!(quiz && enemies.some(function (e) { return e.type === 'word' && e.quiz && e.word === quiz.answer; })),
      powerIndex: player ? player.powerIndex : 0,
      weapon: player ? player.weapon : '',
      options: player ? player.options.length : 0,
      keys: keys
    };
  }

  global.RewardGame = { init: init, open: open, close: close, inspect: inspect };
})(window);
