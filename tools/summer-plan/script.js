/* =========================================================
   夏の進捗管理 — アプリ本体
   保存先は localStorage のみ（外部送信なし）
   ========================================================= */

const KEY = 'summer-plan-v1';
const OLD_KEY = 'nishi-summer-v1';   /* 旧バージョンの保存先（起動時に引き継ぐ） */

/* ---------------- 日付ユーティリティ ---------------- */
const z2 = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${z2(d.getMonth() + 1)}-${z2(d.getDate())}`;
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
const diffDays = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
const todayStr = () => ymd(new Date());
const fmtMD = s => { const d = parseYmd(s); return `${d.getMonth() + 1}/${d.getDate()}`; };
const DOW = ['日', '月', '火', '水', '木', '金', '土'];
const fmtMDW = s => `${fmtMD(s)}(${DOW[parseYmd(s).getDay()]})`;

function defaultSummer() {
  const t = new Date();
  const yr = t.getMonth() >= 8 ? t.getFullYear() + 1 : t.getFullYear();
  return { start: `${yr}-07-21`, end: `${yr}-08-31`, exam: `${yr + 1}-02-21` };
}

/* ---------------- ストア ---------------- */
const DEFAULT_STATE = () => {
  const s = defaultSummer();
  return {
    settings: {
      name: '', school: '', start: s.start, end: s.end, exam: s.exam,
      goalHours: 10, targetTotal: 760,
      lastBackup: '',   /* 最後にJSONを書き出した日時（ISO文字列） */
    },
    /* days[日付] = { h:教科別時間, en:英語チェック, jp:国語チェック,
                      f:分野×教材チェック, rd:{w:語数,m:分}, memo:'' } */
    days: {},
    und: {},   /* und[分野ID] = 0〜3 の理解度（自己申告） */
    reps: {},  /* reps[分野ID] = { sel: 周回数, kako: 周回数 } */
    naishin: { five: [4, 4, 4, 4, 4], four: [4, 4, 4, 4], esat: 'A' },
  };
};

/* 旧キーに記録が残っていたら新キーへ引き継ぐ（記録を失わないため） */
function migrateOldKey() {
  try {
    if (localStorage.getItem(KEY)) return;
    const old = localStorage.getItem(OLD_KEY);
    if (!old) return;
    localStorage.setItem(KEY, old);
    if (localStorage.getItem(KEY) === old) localStorage.removeItem(OLD_KEY);
  } catch (e) { /* 保存できない環境では何もしない */ }
}
migrateOldKey();

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE();
    const parsed = JSON.parse(raw);
    const base = DEFAULT_STATE();
    return {
      settings: Object.assign(base.settings, parsed.settings || {}),
      days: parsed.days || {},
      und: parsed.und || {},
      reps: parsed.reps || {},
      naishin: Object.assign(base.naishin, parsed.naishin || {}),
    };
  } catch (e) {
    console.warn('保存データを読めませんでした', e);
    return DEFAULT_STATE();
  }
}

let saveTimer = null;
let storageBroken = false;   /* localStorage に書けない（プライベートモード等） */

function save(quiet) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      if (storageBroken) { storageBroken = false; renderBanner(); }
    } catch (e) {
      storageBroken = true;
      renderBanner();
      toast('保存できませんでした：' + e.message);
    }
  }, 120);
  if (!quiet) flashSaved();
}

/* 起動時に「本当に書けるか」を確かめる（プライベートモード・容量超過の検出） */
function checkStorage() {
  try {
    localStorage.setItem(KEY + '-probe', '1');
    localStorage.removeItem(KEY + '-probe');
    storageBroken = false;
  } catch (e) {
    storageBroken = true;
  }
  /* ブラウザに「このデータは勝手に消さないで」と申告する（対応ブラウザのみ） */
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persisted().then(p => { if (!p) navigator.storage.persist(); }).catch(() => {});
  }
}

/* ---------------- バックアップの管理 ---------------- */
function recordedDays() {
  return Object.keys(state.days).filter(dayActive).sort();
}
function daysSinceBackup() {
  if (!state.settings.lastBackup) return null;
  const t = new Date(state.settings.lastBackup).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}
function backupStatus() {
  const days = recordedDays().length;
  const since = daysSinceBackup();
  if (days === 0) return { level: 'none', days, since };
  if (since == null) return { level: days >= 3 ? 'never' : 'none', days, since };
  if (since >= 14) return { level: 'danger', days, since };
  if (since >= 7) return { level: 'warn', days, since };
  return { level: 'ok', days, since };
}
function markBackedUp() {
  state.settings.lastBackup = new Date().toISOString();
  save(true);
  renderBanner();
  renderDataStatus();
}

function renderBanner() {
  const host = document.getElementById('banner-wrap');
  if (!host) return;
  const st = backupStatus();
  let html = '';

  if (storageBroken) {
    html += `<div class="banner danger">
      <span class="bn-ico">!</span>
      <span class="bn-txt"><b>記録が保存できません。</b>
        プライベート（シークレット）ウィンドウで開いているか、ブラウザの保存容量がいっぱいです。
        このまま入力しても、閉じたときに消えます。</span></div>`;
  }
  if (st.level === 'never' || st.level === 'warn' || st.level === 'danger') {
    const cls = st.level === 'danger' ? 'danger' : 'warn';
    const msg = st.level === 'never'
      ? `${st.days}日ぶんの記録がありますが、<b>まだ一度もバックアップしていません。</b>`
      : `最後のバックアップから<b>${st.since}日</b>たっています（記録 ${st.days}日ぶん）。`;
    html += `<div class="banner ${cls}">
      <span class="bn-ico">${st.level === 'danger' ? '!' : '↓'}</span>
      <span class="bn-txt">${msg} ブラウザの記録は消えることがあります。</span>
      <button class="bn-btn" id="bn-export">今すぐ書き出す</button>
      <button class="bn-close" id="bn-close" title="今日は閉じる">×</button></div>`;
  }
  if (bannerDismissed === todayStr() && !storageBroken) html = '';

  host.innerHTML = html;
  const be = document.getElementById('bn-export');
  if (be) be.onclick = exportBackup;
  const bc = document.getElementById('bn-close');
  if (bc) bc.onclick = () => { bannerDismissed = todayStr(); renderBanner(); };
}
let bannerDismissed = '';

function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `summer-plan-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  markBackedUp();
  toast('書き出しました。クラウドやメールに保存しておいてください');
}

function toast(msg) {
  const box = document.getElementById('toast');
  box.textContent = msg;
  box.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => box.classList.remove('on'), 2200);
}
function flashSaved() {
  const box = document.getElementById('save-note');
  if (!box) return;
  box.textContent = '保存しました';
  clearTimeout(flashSaved._t);
  flashSaved._t = setTimeout(() => { box.textContent = ''; }, 1400);
}

/* ---------------- 期間・期の計算 ---------------- */
function summerDays() {
  const { start, end } = state.settings;
  const n = diffDays(start, end) + 1;
  if (n < 1) return [start];
  return Array.from({ length: n }, (_, i) => addDays(start, i));
}

function phaseRanges() {
  const days = summerDays();
  const total = days.length;
  const out = [];
  let idx = 0;
  PHASES.forEach((p, i) => {
    const len = i === PHASES.length - 1 ? total - idx : Math.max(1, Math.round(total * p.ratio));
    const s = Math.min(idx, total - 1);
    const e = Math.min(idx + len - 1, total - 1);
    out.push(Object.assign({}, p, { start: days[s], end: days[e], days: e - s + 1 }));
    idx = e + 1;
  });
  return out;
}

function phaseOf(dateStr) {
  const rs = phaseRanges();
  for (const r of rs) if (dateStr >= r.start && dateStr <= r.end) return r;
  return dateStr < rs[0].start ? rs[0] : rs[rs.length - 1];
}

function clampToSummer(d) {
  const { start, end } = state.settings;
  return d < start ? start : d > end ? end : d;
}

/* ---------------- 理解度・繰り返し回数 ---------------- */
const undOf = id => Number(state.und[id]) || 0;
function setUnd(id, v) {
  if (v <= 0) delete state.und[id]; else state.und[id] = v;
  save(true);
}
const repOf = (id, mat) => (state.reps[id] && Number(state.reps[id][mat])) || 0;
function setRep(id, mat, v) {
  v = Math.max(0, Math.min(99, v));
  if (!state.reps[id]) state.reps[id] = {};
  if (v <= 0) delete state.reps[id][mat]; else state.reps[id][mat] = v;
  if (!Object.keys(state.reps[id]).length) delete state.reps[id];
  save(true);
}
/* 教科ごとの理解度の内訳 [未,△,○,◎] */
function undDist(subjKey) {
  const d = [0, 0, 0, 0];
  fieldList(subjKey).forEach(f => d[undOf(f.id)]++);
  return d;
}
function allFields() {
  return Object.keys(FIELDS).reduce((a, k) => a.concat(fieldList(k)), []);
}
function totalReps() {
  return Object.keys(state.reps).reduce((a, id) =>
    a + REP_MATERIALS.reduce((b, m) => b + repOf(id, m.key), 0), 0);
}

/* ---------------- 記録アクセス ---------------- */
function dayRec(d) {
  if (!state.days[d]) state.days[d] = {};
  const r = state.days[d];
  r.h = r.h || {}; r.en = r.en || {}; r.jp = r.jp || {};
  r.f = r.f || {}; r.rd = r.rd || {}; r.memo = r.memo || '';
  return r;
}
const rawRec = d => state.days[d];

function dayHours(d) {
  const r = rawRec(d);
  if (!r || !r.h) return 0;
  return Object.values(r.h).reduce((a, b) => a + (Number(b) || 0), 0);
}
function countTrue(o) { return o ? Object.values(o).filter(Boolean).length : 0; }
function dayChecks(d) {
  const r = rawRec(d);
  if (!r) return 0;
  return countTrue(r.en) + countTrue(r.jp) + countTrue(r.f);
}
function dayActive(d) { return dayChecks(d) > 0 || dayHours(d) > 0; }

function totalHours() { return Object.keys(state.days).reduce((a, d) => a + dayHours(d), 0); }
function subjectTotals() {
  const t = {};
  SUBJECTS.forEach(s => t[s.key] = 0);
  Object.values(state.days).forEach(r => {
    if (!r.h) return;
    for (const k in r.h) if (k in t) t[k] += Number(r.h[k]) || 0;
  });
  return t;
}
function streak() {
  let n = 0, d = todayStr();
  if (!dayActive(d)) d = addDays(d, -1);
  while (dayActive(d)) { n++; d = addDays(d, -1); }
  return n;
}
/* wpm（1分あたりの語数）を持つ日を古い順に */
function speedSeries() {
  return Object.keys(state.days).sort()
    .map(d => {
      const rd = state.days[d].rd || {};
      const w = Number(rd.w), m = Number(rd.m);
      return (w > 0 && m > 0) ? { date: d, wpm: Math.round(w / m), w, m } : null;
    })
    .filter(Boolean);
}
/* 前回その項目をやった日（date より前） */
function lastDoneBefore(group, key, date) {
  const ds = Object.keys(state.days).filter(d => d < date && state.days[d][group] && state.days[d][group][key]).sort();
  return ds.length ? ds[ds.length - 1] : null;
}

const subjColor = slot => `var(--series-${slot})`;
const cssVar = name => getComputedStyle(document.body).getPropertyValue(name).trim();
const subjMeta = key => SUBJECTS.find(s => s.key === key);

/* ---------------- SVG ヘルパー ---------------- */
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) {
    const v = attrs[k];
    /* CSS変数は presentation attribute として解釈されない環境があるので style で当てる */
    if (typeof v === 'string' && v.indexOf('var(--') >= 0) e.style.setProperty(k, v);
    else e.setAttribute(k, v);
  }
  if (text != null) e.textContent = text;
  return e;
}
function topRoundPath(x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h));
  return `M${x},${y + h}V${y + r}a${r},${r} 0 0 1 ${r},${-r}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}V${y + h}Z`;
}
function rightRoundPath(x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w, h / 2));
  return `M${x},${y}h${w - r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 ${-r},${r}H${x}Z`;
}
const niceMax = (v, step) => v <= 0 ? step : Math.ceil(v / step) * step;
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------------- ツールチップ ---------------- */
const tip = document.createElement('div');
tip.className = 'tip';
document.body.appendChild(tip);
function showTip(html, ev) {
  tip.innerHTML = html;
  tip.classList.add('on');
  const pad = 14;
  let x = ev.clientX + pad, y = ev.clientY + pad;
  const r = tip.getBoundingClientRect();
  if (x + r.width > innerWidth - 8) x = ev.clientX - r.width - pad;
  if (y + r.height > innerHeight - 8) y = ev.clientY - r.height - pad;
  tip.style.left = x + 'px'; tip.style.top = Math.max(8, y) + 'px';
}
const hideTip = () => tip.classList.remove('on');
const tipRow = (color, name, val) =>
  `<div class="r"><i style="background:${color}"></i>${name}<span>${val}</span></div>`;

/* =========================================================
   今日の記録
   ========================================================= */
let currentDay = todayStr();

function setDay(d) {
  currentDay = d;
  document.getElementById('day-picker').value = d;
  renderToday();
}

function renderToday() {
  const d = currentDay;
  const ph = phaseOf(clampToSummer(d));
  document.getElementById('today-title').textContent = `${fmtMDW(d)} の記録`;
  document.getElementById('today-sub').textContent = `${ph.name} — ${ph.lead}`;

  renderEnRows();
  renderJpRows();
  ['ma', 'sc', 'so'].forEach(renderFieldGrid);
  renderTimeGrid();
  renderMemo();
  renderDaySummary();
}

/* ---- 英語 ---- */
function renderEnRows() {
  const rec = dayRec(currentDay);
  const host = document.getElementById('en-rows');
  host.innerHTML = '';
  EN_DAILY.forEach(item => {
    host.appendChild(checkRow({
      on: !!rec.en[item.key],
      when: item.when, name: item.name, note: item.note,
      onToggle: v => {
        if (v) rec.en[item.key] = true; else delete rec.en[item.key];
        afterCheck();
        renderWeekGrid();
      },
    }));
  });

  const w = document.getElementById('rd-words'), m = document.getElementById('rd-min');
  /* 目標スピードをラベルに出す */
  document.getElementById('lbl-words').textContent = `目標 1分 ${READ_SPEED.goal}語`;
  document.getElementById('rd-wpm-goal').textContent = `目標 ${READ_SPEED.goal}／標準 ${READ_SPEED.base}`;

  w.value = rec.rd.w != null ? rec.rd.w : '';
  m.value = rec.rd.m != null ? rec.rd.m : '';
  const sync = () => {
    const wv = parseFloat(w.value), mv = parseFloat(m.value);
    if (wv > 0) rec.rd.w = wv; else delete rec.rd.w;
    if (mv > 0) rec.rd.m = mv; else delete rec.rd.m;
    updateWpm();
    save();
    renderSpeedChart(); renderStats();
  };
  w.oninput = sync; m.oninput = sync;
  updateWpm();
}

function updateWpm() {
  const rec = dayRec(currentDay);
  const box = document.getElementById('rd-wpm');
  const hint = document.getElementById('rd-hint');
  const w = Number(rec.rd.w), m = Number(rec.rd.m);

  /* 語数を入れたら「何分で読めば目標か」を時間のラベルに出す */
  document.getElementById('lbl-min').textContent = w > 0
    ? `この語数なら ${(w / READ_SPEED.goal).toFixed(1)}分で目標`
    : '';

  if (!(w > 0 && m > 0)) {
    box.textContent = '—';
    box.className = 'wpm';
    hint.textContent = `入れておくと、ダッシュボードに速読スピードの推移が出ます（目標 1分${READ_SPEED.goal}語）。`;
    return;
  }
  const wpm = Math.round(w / m);
  box.innerHTML = `${wpm}<small>wpm</small>`;
  box.className = 'wpm ' + (wpm >= READ_SPEED.goal ? 'good' : wpm >= READ_SPEED.base ? 'mid' : 'low');
  hint.textContent = wpm >= READ_SPEED.goal
    ? `目標の${READ_SPEED.goal}wpmに到達。この速度を維持する。`
    : wpm >= READ_SPEED.base
      ? `入試標準ペース。目標の${READ_SPEED.goal}wpmまであと${READ_SPEED.goal - wpm}。`
      : `目安は1分${READ_SPEED.base}語。まずは同じ長文をもう一度、時間を計って読み直す。`;
}

/* ---- 国語 ---- */
function renderJpRows() {
  const rec = dayRec(currentDay);
  const host = document.getElementById('jp-rows');
  host.innerHTML = '';
  JP_DAILY.forEach(item => {
    let badge = null;
    if (item.every > 0) {
      const last = lastDoneBefore('jp', item.key, currentDay);
      const gap = last ? diffDays(last, currentDay) : null;
      if (rec.jp[item.key]) badge = { text: '今日やった', cls: 'ok' };
      else if (gap == null) badge = { text: 'まだ記録なし', cls: 'warn' };
      else if (gap >= item.every) badge = { text: `${gap}日空いた・今日やる日`, cls: 'warn' };
      else badge = { text: `前回 ${gap}日前`, cls: '' };
    }
    host.appendChild(checkRow({
      on: !!rec.jp[item.key],
      when: item.when, name: item.name, note: item.note, badge,
      freq: item.every === 1 ? '毎日' : item.every === 2 ? '2日ごと' : '',
      onToggle: v => {
        if (v) rec.jp[item.key] = true; else delete rec.jp[item.key];
        afterCheck();
        renderJpRows();   /* 「前回◯日前」バッジを他の行も含めて更新 */
        renderWeekGrid();
      },
    }));
  });
}

/* ---- チェック行の共通部品 ----
   押した瞬間に自分で見た目を更新する（呼び出し側の再描画に依存しない） */
function checkRow(o) {
  let on = !!o.on;
  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'chk-row';
  row.innerHTML = `
    <span class="chk-box"></span>
    <span class="chk-main">
      <span class="chk-title">
        ${o.when ? `<span class="chk-when">${o.when}</span>` : ''}${escapeHtml(o.name)}
        ${o.freq ? `<span class="chk-freq">${o.freq}</span>` : ''}
      </span>
      ${o.note ? `<span class="chk-note">${escapeHtml(o.note)}</span>` : ''}
    </span>
    ${o.badge ? `<span class="chk-badge ${o.badge.cls}">${escapeHtml(o.badge.text)}</span>` : ''}`;
  const box = row.querySelector('.chk-box');
  const paint = () => {
    row.classList.toggle('on', on);
    row.setAttribute('aria-pressed', String(on));
    box.textContent = on ? '✓' : '';
  };
  paint();
  row.onclick = () => { on = !on; paint(); o.onToggle(on); };
  return row;
}

function afterCheck() {
  save(true);
  renderDaySummary();
  renderHeaderChips();
}

/* ---- 数学・理科・社会（分野 × 教材） ---- */
function renderFieldGrid(subjKey) {
  const rec = dayRec(currentDay);
  const host = document.getElementById('grid-' + subjKey);
  host.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'fgrid';
  grid.style.setProperty('--cols', MATERIALS.length);

  /* 見出し行 */
  grid.appendChild(cellDiv('fg-corner', ''));
  MATERIALS.forEach(m => grid.appendChild(cellDiv('fg-head', m.name, m.full)));

  const fields = fieldList(subjKey);
  let seen = null;
  fields.forEach(f => {
    if (f.group && f.group !== seen) {
      seen = f.group;
      const g = cellDiv('fg-group', f.group);
      g.style.gridColumn = `1 / -1`;
      grid.appendChild(g);
    }
    grid.appendChild(cellDiv('fg-name', f.name));
    MATERIALS.forEach(m => {
      const id = `${f.id}-${m.key}`;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'fg-cell' + (rec.f[id] ? ' on' : '');
      b.title = `${f.name}：${m.full}`;
      b.setAttribute('aria-label', `${f.name} ${m.full}`);
      b.setAttribute('aria-pressed', String(!!rec.f[id]));
      b.textContent = rec.f[id] ? '✓' : '';
      b.onclick = () => {
        if (rec.f[id]) delete rec.f[id]; else rec.f[id] = true;
        b.classList.toggle('on', !!rec.f[id]);
        b.textContent = rec.f[id] ? '✓' : '';
        b.setAttribute('aria-pressed', String(!!rec.f[id]));
        afterCheck();
      };
      grid.appendChild(b);
    });
  });
  host.appendChild(grid);
}

function cellDiv(cls, text, title) {
  const d = document.createElement('div');
  d.className = cls;
  d.textContent = text;
  if (title) d.title = title;
  return d;
}

/* ---- 学習時間・メモ ---- */
function renderTimeGrid() {
  const rec = dayRec(currentDay);
  const grid = document.getElementById('time-grid');
  grid.innerHTML = '';
  SUBJECTS.forEach(s => {
    const cell = document.createElement('div');
    cell.className = 'time-cell';
    cell.innerHTML = `<label><i style="background:${subjColor(s.slot)}"></i>${s.name}</label>`;
    const inp = document.createElement('input');
    inp.type = 'number'; inp.min = '0'; inp.max = '24'; inp.step = '0.5'; inp.placeholder = '0';
    inp.value = rec.h[s.key] != null ? rec.h[s.key] : '';
    inp.oninput = () => {
      const v = parseFloat(inp.value);
      if (Number.isNaN(v) || v <= 0) delete rec.h[s.key]; else rec.h[s.key] = v;
      updateTimeTotal(); save(); renderStats(); renderHeaderChips();
    };
    cell.appendChild(inp);
    grid.appendChild(cell);
  });
  updateTimeTotal();
}

function updateTimeTotal() {
  const h = dayHours(currentDay);
  const goal = Number(state.settings.goalHours) || 10;
  const box = document.getElementById('time-total');
  const diff = h - goal;
  box.innerHTML = `この日の合計 <b>${h.toFixed(1)}</b> 時間　` +
    (h === 0 ? '<span style="color:var(--ink-muted)">未入力</span>'
      : diff >= 0 ? `<span style="color:var(--good-text)">目標達成（+${diff.toFixed(1)}h）</span>`
        : `<span style="color:var(--ink-2)">目標まで あと ${(-diff).toFixed(1)}h</span>`);
}

function renderMemo() {
  const rec = dayRec(currentDay);
  const memo = document.getElementById('day-memo');
  memo.value = rec.memo || '';
  memo.oninput = () => { rec.memo = memo.value; save(); };
}

/* ---- その日のまとめ ---- */
function renderDaySummary() {
  const rec = dayRec(currentDay);
  const host = document.getElementById('day-summary');
  const fCount = k => Object.keys(rec.f).filter(id => rec.f[id] && id.startsWith(k + '-')).length;
  const items = [
    { key: 'en', label: '英語', v: `${countTrue(rec.en)} / ${EN_DAILY.length}` },
    { key: 'jp', label: '国語', v: `${countTrue(rec.jp)} / ${JP_DAILY.length}` },
    { key: 'ma', label: '数学', v: `${fCount('ma')} 件` },
    { key: 'sc', label: '理科', v: `${fCount('sc')} 件` },
    { key: 'so', label: '社会', v: `${fCount('so')} 件` },
  ];
  host.innerHTML = items.map(it => {
    const s = subjMeta(it.key);
    const done = parseInt(it.v, 10) > 0;
    return `<span class="sum-chip ${done ? 'on' : ''}">
      <i style="background:${subjColor(s.slot)}"></i>${it.label}<b>${it.v}</b></span>`;
  }).join('') + `<span class="sum-chip total">合計 <b>${dayChecks(currentDay)}</b> チェック</span>`;
}

/* =========================================================
   チャート：速読スピードの推移
   ========================================================= */
function renderSpeedChart() {
  const host = document.getElementById('chart-speed');
  host.innerHTML = '';
  const data = speedSeries();
  if (!data.length) {
    host.innerHTML = '<p class="empty-chart">まだ記録がありません。「今日の記録」の英語で、復習した長文の<b>語数</b>と<b>かかった時間</b>を入れると、ここに推移が出ます。</p>';
    return;
  }
  const W = Math.max(host.clientWidth || 640, Math.min(data.length * 60 + 90, 1100));
  const H = 260, mL = 44, mR = 24, mT = 16, mB = 34;
  const iw = W - mL - mR, ih = H - mT - mB;
  const maxV = niceMax(Math.max(READ_SPEED.goal + 10, ...data.map(d => d.wpm)), 20);
  const x = i => data.length === 1 ? mL + iw / 2 : mL + (i / (data.length - 1)) * iw;
  const y = v => mT + ih - (v / maxV) * ih;

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': '速読スピードの推移' });
  for (let v = 0; v <= maxV; v += 40) {
    svg.appendChild(el('line', { x1: mL, x2: W - mR, y1: y(v), y2: y(v), stroke: 'var(--grid)', 'stroke-width': 1 }));
    svg.appendChild(el('text', { x: mL - 7, y: y(v) + 4, 'text-anchor': 'end', fill: 'var(--ink-muted)', 'font-size': 10 }, v));
  }
  [[READ_SPEED.base, `入試標準 ${READ_SPEED.base}wpm`], [READ_SPEED.goal, `目標 ${READ_SPEED.goal}wpm`]].forEach(([v, label]) => {
    svg.appendChild(el('line', {
      x1: mL, x2: W - mR, y1: y(v), y2: y(v),
      stroke: 'var(--axis)', 'stroke-width': 2, 'stroke-dasharray': '5 4',
    }));
    svg.appendChild(el('text', { x: W - mR, y: y(v) - 6, 'text-anchor': 'end', fill: 'var(--ink-muted)', 'font-size': 10 }, label));
  });

  const color = subjColor(subjMeta('en').slot);
  if (data.length > 1) {
    svg.appendChild(el('path', {
      d: data.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.wpm)}`).join(''),
      fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round',
    }));
  }
  data.forEach((p, i) => {
    svg.appendChild(el('circle', { cx: x(i), cy: y(p.wpm), r: 5, fill: color, stroke: 'var(--surface)', 'stroke-width': 2 }));
    const bandW = data.length === 1 ? iw : iw / (data.length - 1);
    const hit = el('rect', { x: x(i) - bandW / 2, y: mT, width: bandW, height: ih, fill: 'transparent' });
    hit.style.cursor = 'pointer';
    hit.addEventListener('mousemove', ev => showTip(
      `<b>${fmtMDW(p.date)}</b>${tipRow(cssVar(`--series-${subjMeta('en').slot}`), '速読スピード', p.wpm + ' wpm')}
       ${tipRow('transparent', '語数 / 時間', `${p.w}語 / ${p.m}分`)}`, ev));
    hit.addEventListener('mouseleave', hideTip);
    hit.addEventListener('click', () => { setDay(p.date); switchView('today'); });
    svg.appendChild(hit);
  });
  /* 直近の値だけ直接ラベル */
  const last = data[data.length - 1];
  svg.appendChild(el('text', {
    x: x(data.length - 1), y: y(last.wpm) - 12, 'text-anchor': data.length === 1 ? 'middle' : 'end',
    fill: 'var(--ink)', 'font-size': 12, 'font-weight': 700,
  }, last.wpm + ' wpm'));

  const everyN = Math.ceil(data.length / 8);
  data.forEach((p, i) => {
    if (i % everyN === 0 || i === data.length - 1) {
      svg.appendChild(el('text', { x: x(i), y: H - 12, 'text-anchor': 'middle', fill: 'var(--ink-muted)', 'font-size': 10 }, fmtMD(p.date)));
    }
  });
  svg.appendChild(el('line', { x1: mL, x2: W - mR, y1: y(0), y2: y(0), stroke: 'var(--axis)', 'stroke-width': 1 }));
  host.appendChild(svg);
}

/* =========================================================
   チャート：日ごとの学習時間（積み上げ棒）
   ========================================================= */
function renderDailyChart() {
  const host = document.getElementById('chart-daily');
  host.innerHTML = '';
  const days = summerDays();
  if (!days.some(d => dayHours(d) > 0)) {
    host.innerHTML = '<p class="empty-chart">学習時間の記録がまだありません。</p>';
    return;
  }
  const W = Math.max(host.clientWidth || 520, Math.min(days.length * 16 + 60, 1200));
  const H = 240, mL = 34, mR = 10, mT = 12, mB = 30;
  const iw = W - mL - mR, ih = H - mT - mB;
  const goal = Number(state.settings.goalHours) || 10;
  const maxV = niceMax(Math.max(goal, ...days.map(dayHours)), 2);
  const bw = Math.max(4, Math.min(26, iw / days.length - 3));
  const step = iw / days.length;
  const y = v => mT + ih - (v / maxV) * ih;

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': '日ごとの学習時間' });
  for (let v = 0; v <= maxV; v += 2) {
    svg.appendChild(el('line', { x1: mL, x2: W - mR, y1: y(v), y2: y(v), stroke: 'var(--grid)', 'stroke-width': 1 }));
    svg.appendChild(el('text', { x: mL - 7, y: y(v) + 4, 'text-anchor': 'end', fill: 'var(--ink-muted)', 'font-size': 10 }, v + 'h'));
  }
  svg.appendChild(el('line', { x1: mL, x2: W - mR, y1: y(goal), y2: y(goal), stroke: 'var(--axis)', 'stroke-width': 2, 'stroke-dasharray': '5 4' }));
  svg.appendChild(el('text', { x: W - mR, y: y(goal) - 5, 'text-anchor': 'end', fill: 'var(--ink-muted)', 'font-size': 10 }, `目標 ${goal}h`));

  const today = todayStr();
  days.forEach((d, i) => {
    const x = mL + i * step + (step - bw) / 2;
    const rec = rawRec(d);
    const tot = dayHours(d);
    if (tot > 0) {
      let acc = 0;
      const segs = SUBJECTS.filter(s => Number(rec.h[s.key]) > 0);
      segs.forEach((s, si) => {
        const v = Number(rec.h[s.key]);
        const y0 = y(acc + v), y1 = y(acc);
        const h = Math.max(1, y1 - y0 - (si === 0 ? 0 : 2));  /* セグメント間に2pxの隙間 */
        svg.appendChild(si === segs.length - 1
          ? el('path', { d: topRoundPath(x, y0, bw, h, 4), fill: subjColor(s.slot) })
          : el('rect', { x, y: y0, width: bw, height: h, fill: subjColor(s.slot) }));
        acc += v;
      });
    }
    const hit = el('rect', { x: mL + i * step, y: mT, width: step, height: ih, fill: 'transparent' });
    hit.style.cursor = 'pointer';
    hit.addEventListener('mousemove', ev => {
      const rows = SUBJECTS.filter(s => rec && rec.h && Number(rec.h[s.key]) > 0)
        .map(s => tipRow(cssVar(`--series-${s.slot}`), s.name, Number(rec.h[s.key]) + 'h')).join('');
      showTip(`<b>${fmtMDW(d)}</b>${rows || '<div class="r">記録なし</div>'}
        <div class="r" style="border-top:1px solid var(--grid);margin-top:4px;padding-top:4px">合計<span>${tot}h</span></div>`, ev);
    });
    hit.addEventListener('mouseleave', hideTip);
    hit.addEventListener('click', () => { setDay(d); switchView('today'); });
    svg.appendChild(hit);

    if (i % Math.ceil(days.length / 12) === 0 || d === today) {
      svg.appendChild(el('text', {
        x: mL + i * step + step / 2, y: H - 10, 'text-anchor': 'middle',
        fill: d === today ? 'var(--ink)' : 'var(--ink-muted)', 'font-size': 10,
        'font-weight': d === today ? 700 : 400,
      }, fmtMD(d)));
    }
  });
  svg.appendChild(el('line', { x1: mL, x2: W - mR, y1: y(0), y2: y(0), stroke: 'var(--axis)', 'stroke-width': 1 }));
  host.appendChild(svg);
}

/* =========================================================
   チャート：教科別の累計時間（横棒）
   ========================================================= */
function renderSubjectChart() {
  const host = document.getElementById('chart-subject');
  host.innerHTML = '';
  const tot = subjectTotals();
  const sum = Object.values(tot).reduce((a, b) => a + b, 0);
  if (sum <= 0) { host.innerHTML = '<p class="empty-chart">学習時間の記録がまだありません。</p>'; return; }

  const W = Math.max(host.clientWidth || 420, 300);
  const rowH = 34, mL = 52, mR = 54, mT = 6;
  const H = mT + SUBJECTS.length * rowH + 6;
  const maxV = Math.max(...Object.values(tot), 1);
  const iw = W - mL - mR;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': '教科別の累計学習時間' });

  SUBJECTS.forEach((s, i) => {
    const v = tot[s.key];
    const y0 = mT + i * rowH + 5, bh = rowH - 14;
    const w = Math.max(v > 0 ? 3 : 0, (v / maxV) * iw);
    svg.appendChild(el('text', { x: mL - 8, y: y0 + bh / 2 + 4, 'text-anchor': 'end', fill: 'var(--ink-2)', 'font-size': 12 }, s.name));
    svg.appendChild(el('rect', { x: mL, y: y0, width: iw, height: bh, fill: 'var(--surface-2)', rx: 4 }));
    if (v > 0) svg.appendChild(el('path', { d: rightRoundPath(mL, y0, w, bh, 4), fill: subjColor(s.slot) }));
    svg.appendChild(el('text', {
      x: mL + w + 8, y: y0 + bh / 2 + 4, fill: 'var(--ink-2)', 'font-size': 12, 'font-variant-numeric': 'tabular-nums',
    }, `${v.toFixed(1)}h`));

    const hit = el('rect', { x: 0, y: mT + i * rowH, width: W, height: rowH, fill: 'transparent' });
    hit.addEventListener('mousemove', ev => showTip(
      `<b>${s.name}</b>${tipRow(cssVar(`--series-${s.slot}`), '累計', v.toFixed(1) + 'h')}
       ${tipRow('transparent', '全体に占める割合', Math.round(v / sum * 100) + '%')}`, ev));
    hit.addEventListener('mouseleave', hideTip);
    svg.appendChild(hit);
  });
  host.appendChild(svg);
}

/* =========================================================
   直近7日の実施状況
   ========================================================= */
function renderWeekGrid() {
  const host = document.getElementById('week-grid');
  const days = Array.from({ length: 7 }, (_, i) => addDays(todayStr(), i - 6));
  const rows = [
    ...EN_DAILY.map(x => ({ group: 'en', key: x.key, name: '英語：' + x.name })),
    ...JP_DAILY.map(x => ({ group: 'jp', key: x.key, name: '国語：' + x.name })),
  ];
  const head = `<div class="wg-name"></div>` + days.map(d =>
    `<div class="wg-head ${d === todayStr() ? 'today' : ''}">${fmtMD(d)}<small>${DOW[parseYmd(d).getDay()]}</small></div>`).join('');
  const body = rows.map(r => {
    const cells = days.map(d => {
      const rec = rawRec(d);
      const on = rec && rec[r.group] && rec[r.group][r.key];
      return `<div class="wg-cell ${on ? 'on' : ''}" title="${fmtMDW(d)} ${escapeHtml(r.name)}">${on ? '✓' : ''}</div>`;
    }).join('');
    return `<div class="wg-name">${escapeHtml(r.name)}</div>${cells}`;
  }).join('');
  host.innerHTML = `<div class="wgrid">${head}${body}</div>`;
}

/* =========================================================
   分野 × 教材のカバー状況
   ========================================================= */
function fieldCounts() {
  const counts = {};
  summerDays().forEach(d => {
    const rec = rawRec(d);
    if (!rec || !rec.f) return;
    Object.keys(rec.f).forEach(id => { if (rec.f[id]) counts[id] = (counts[id] || 0) + 1; });
  });
  return counts;
}

let fpFilter = 'all';
const fpHeads = {};   /* 教科キー → 見出し要素（合計だけ差し替える） */

function sectionHeadHTML(sk) {
  const meta = FIELDS[sk];
  const fields = fieldList(sk);
  const done = undDist(sk)[3];
  const pct = fields.length ? Math.round(done / fields.length * 100) : 0;
  const reps = fields.reduce((a, f) => a + REP_MATERIALS.reduce((b, m) => b + repOf(f.id, m.key), 0), 0);
  /* スマホの縦画面でも1行に収まるよう、狭いときは .up-lbl を隠す */
  return `<h3><i class="dot" style="background:${subjColor(meta.slot)}"></i>${meta.label}
      <span class="sec-count">${fields.length}分野</span></h3>
    <div class="unit-progress">
      <span class="up-item">◎<span class="up-lbl"> できる</span> ${done}/${fields.length}</span>
      <span class="bar-mini"><i style="width:${pct}%"></i></span>
      <span class="up-item">${pct}%</span>
      <span class="up-item rep-total">↻<span class="up-lbl"> 繰り返し合計</span> ${reps}回</span>
    </div>`;
}
function refreshFpHead(sk) {
  if (fpHeads[sk]) fpHeads[sk].innerHTML = sectionHeadHTML(sk);
}

function renderLevelLegend(hostId) {
  const host = document.getElementById(hostId);
  if (!host) return;
  host.innerHTML = LEVELS.map(l =>
    `<span class="lv-key"><i class="lv-sw l${l.v}"></i><b>${l.label}</b> ${l.full}
      <small>${l.desc}</small></span>`).join('');
}

function renderFieldProgress() {
  renderLevelLegend('level-legend');

  const fhost = document.getElementById('fp-filter');
  const keys = ['all', ...Object.keys(FIELDS)];
  fhost.innerHTML = keys.map(k =>
    `<button class="ufilter ${fpFilter === k ? 'active' : ''}" data-k="${k}">${k === 'all' ? 'すべて' : FIELDS[k].label}</button>`).join('');
  fhost.querySelectorAll('.ufilter').forEach(b =>
    b.onclick = () => { fpFilter = b.dataset.k; renderFieldProgress(); });

  const counts = fieldCounts();
  const host = document.getElementById('field-prog');
  host.innerHTML = '';

  Object.keys(FIELDS).forEach(sk => {
    if (fpFilter !== 'all' && fpFilter !== sk) return;
    const fields = fieldList(sk);

    const sec = document.createElement('div');
    sec.className = 'cover-sec';
    const head = document.createElement('div');
    head.innerHTML = sectionHeadHTML(sk);
    fpHeads[sk] = head;
    sec.appendChild(head);

    let seen = null;
    fields.forEach(f => {
      if (f.group && f.group !== seen) {
        seen = f.group;
        const g = document.createElement('div');
        g.className = 'fp-group';
        g.textContent = f.group;
        sec.appendChild(g);
      }
      sec.appendChild(fieldProgressRow(f, counts));
    });
    host.appendChild(sec);
  });
}

function fieldProgressRow(f, counts) {
  const lv = undOf(f.id);
  const row = document.createElement('div');
  row.className = 'fp-row lv' + lv;

  /* 分野名 + その分野でやった記録 */
  const logs = MATERIALS.map(m => ({ m, n: counts[`${f.id}-${m.key}`] || 0 })).filter(x => x.n > 0);
  const name = document.createElement('div');
  name.className = 'fp-name';
  name.innerHTML = `<span class="fp-title">${escapeHtml(f.name)}</span>` +
    (logs.length
      ? `<span class="fp-log">${logs.map(x => `${x.m.name} ${x.n}日`).join('・')}</span>`
      : `<span class="fp-log none">まだ記録なし</span>`);
  row.appendChild(name);

  /* 理解度 */
  const lvBox = document.createElement('div');
  lvBox.className = 'fp-levels';
  lvBox.setAttribute('role', 'group');
  lvBox.setAttribute('aria-label', `${f.name} の理解度`);
  LEVELS.forEach(l => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lv-btn l' + l.v + (lv === l.v ? ' on' : '');
    b.textContent = l.label;
    b.title = `${l.full} — ${l.desc}`;
    b.setAttribute('aria-pressed', String(lv === l.v));
    b.onclick = () => {
      setUnd(f.id, l.v);
      lvBox.querySelectorAll('.lv-btn').forEach((x, idx) => {
        x.classList.toggle('on', idx === l.v);
        x.setAttribute('aria-pressed', String(idx === l.v));
      });
      row.className = 'fp-row lv' + l.v;
      refreshFpHead(f.id.split('-')[0]);
      renderStats(); renderUnderstandChart();
    };
    lvBox.appendChild(b);
  });
  row.appendChild(lvBox);

  /* 繰り返し回数 */
  const repBox = document.createElement('div');
  repBox.className = 'fp-reps';
  REP_MATERIALS.forEach(m => {
    const n = repOf(f.id, m.key);
    const wrap = document.createElement('div');
    wrap.className = 'rep' + (n > 0 ? ' on' : '');
    wrap.innerHTML = `<span class="rep-name">${m.name}</span>`;
    const stepper = document.createElement('div');
    stepper.className = 'stepper';
    const minus = document.createElement('button');
    minus.type = 'button'; minus.className = 'st-btn'; minus.textContent = '−';
    minus.title = `${m.full} の回数を1減らす`;
    minus.setAttribute('aria-label', `${f.name} ${m.full} の回数を減らす`);
    const val = document.createElement('span');
    val.className = 'st-val';
    val.textContent = n ? `${n}周` : '−';
    const plus = document.createElement('button');
    plus.type = 'button'; plus.className = 'st-btn'; plus.textContent = '＋';
    plus.title = `${m.full} の回数を1増やす`;
    plus.setAttribute('aria-label', `${f.name} ${m.full} の回数を増やす`);
    const bump = d => () => {
      setRep(f.id, m.key, repOf(f.id, m.key) + d);
      const nv = repOf(f.id, m.key);
      val.textContent = nv ? `${nv}周` : '−';
      wrap.classList.toggle('on', nv > 0);
      refreshFpHead(f.id.split('-')[0]);
      renderStats();
    };
    minus.onclick = bump(-1);
    plus.onclick = bump(1);
    stepper.appendChild(minus); stepper.appendChild(val); stepper.appendChild(plus);
    wrap.appendChild(stepper);
    repBox.appendChild(wrap);
  });
  row.appendChild(repBox);
  return row;
}

/* =========================================================
   チャート：教科別の理解度（積み上げ横棒）
   ========================================================= */
function renderUnderstandChart() {
  renderLevelLegend('level-legend-dash');
  const host = document.getElementById('chart-understand');
  host.innerHTML = '';
  const subs = Object.keys(FIELDS);
  const W = Math.max(host.clientWidth || 520, 320);
  const rowH = 46, mL = 46, mR = 16, mT = 8;
  const H = mT + subs.length * rowH + 6;
  const iw = W - mL - mR;
  const maxN = Math.max(...subs.map(sk => fieldList(sk).length));
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': '教科別の理解度の分布' });
  const ramp = ['var(--surface-2)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-4)'];

  subs.forEach((sk, i) => {
    const meta = FIELDS[sk];
    const dist = undDist(sk);
    const total = dist.reduce((a, b) => a + b, 0);
    const y0 = mT + i * rowH + 8, bh = rowH - 24;
    const scale = (iw - 4) * (total / maxN);

    svg.appendChild(el('text', { x: 0, y: y0 + bh / 2 + 4, fill: 'var(--ink-2)', 'font-size': 12.5 }, meta.label));

    let acc = 0;
    dist.forEach((n, li) => {
      if (n <= 0) { acc += n; return; }
      const x0 = mL + (acc / total) * scale;
      const w = Math.max(2, (n / total) * scale - 2);   /* セグメント間に2pxの隙間 */
      const isLast = dist.slice(li + 1).every(v => v === 0);
      svg.appendChild(isLast
        ? el('path', { d: rightRoundPath(x0, y0, w + 2, bh, 4), fill: ramp[li] })
        : el('rect', { x: x0, y: y0, width: w, height: bh, fill: ramp[li] }));
      if (w > 22) {
        svg.appendChild(el('text', {
          x: x0 + w / 2, y: y0 + bh / 2 + 4, 'text-anchor': 'middle',
          fill: li >= 2 ? '#fff' : 'var(--ink)', 'font-size': 11.5, 'font-weight': 700,
        }, n));
      }
      acc += n;
    });

    svg.appendChild(el('text', {
      x: mL, y: y0 + bh + 14, fill: 'var(--ink-muted)', 'font-size': 11,
    }, `◎ ${dist[3]} / ${total}分野　未着手 ${dist[0]}`));

    const hit = el('rect', { x: 0, y: mT + i * rowH, width: W, height: rowH, fill: 'transparent' });
    hit.addEventListener('mousemove', ev => showTip(
      `<b>${meta.label}</b>` + LEVELS.map(l =>
        tipRow(l.v === 0 ? cssVar('--surface-2') : cssVar(`--seq-${l.v + 1}`), `${l.label} ${l.full}`, dist[l.v] + '分野')).join(''), ev));
    hit.addEventListener('mouseleave', hideTip);
    hit.addEventListener('click', () => { fpFilter = sk; renderFieldProgress(); switchView('fields'); });
    hit.style.cursor = 'pointer';
    svg.appendChild(hit);
  });
  host.appendChild(svg);
}

/* =========================================================
   ダッシュボード
   ========================================================= */
function renderSchoolName() {
  const el2 = document.getElementById('hd-school');
  if (!el2) return;
  const s = (state.settings.school || '').trim();
  el2.textContent = s || '希望校';
  el2.classList.toggle('placeholder', !s);
}

function renderHeaderChips() {
  const host = document.getElementById('hd-chips');
  const t = todayStr(), st = state.settings;
  const leftSummer = Math.max(0, diffDays(t, st.end) + (t <= st.end ? 1 : 0));
  const leftExam = Math.max(0, diffDays(t, st.exam));
  const ph = phaseOf(clampToSummer(t));
  host.innerHTML = `
    <span class="hd-chip">夏休み残り <b>${leftSummer}</b>日</span>
    <span class="hd-chip ${leftExam <= 100 ? 'alert' : ''}">入試まで <b>${leftExam}</b>日</span>
    <span class="hd-chip">いまは <b>${ph.name}</b></span>`;
}

function renderStats() {
  const host = document.getElementById('stat-row');
  const t = todayStr(), st = state.settings;
  const days = summerDays();
  const passed = Math.min(days.length, Math.max(0, diffDays(st.start, t) + 1));
  const th = totalHours();
  const avg = passed > 0 ? th / passed : 0;
  const goalTotal = passed * (Number(st.goalHours) || 10);

  const fields = allFields();
  const fTotal = fields.length;
  const fDone = fields.filter(f => undOf(f.id) >= 3).length;
  const fUntouched = fields.filter(f => undOf(f.id) === 0).length;

  const sp = speedSeries();
  const lastSp = sp.length ? sp[sp.length - 1] : null;
  const prevSp = sp.length > 1 ? sp[sp.length - 2] : null;
  const spDelta = lastSp && prevSp ? lastSp.wpm - prevSp.wpm : null;

  const pct = (a, b) => b > 0 ? Math.min(100, Math.round(a / b * 100)) : 0;
  host.innerHTML = `
    <div class="stat"><div class="k">今日のチェック</div>
      <div class="v">${dayChecks(t)}<small>件</small></div>
      <div class="m">${fmtMDW(t)}・${dayHours(t).toFixed(1)}時間</div></div>

    <div class="stat"><div class="k">連続記録</div>
      <div class="v">${streak()}<small>日</small></div>
      <div class="m">途切れさせないことが最優先</div></div>

    <div class="stat"><div class="k">速読スピード</div>
      <div class="v">${lastSp ? lastSp.wpm : '—'}<small>wpm</small></div>
      <div class="m">${lastSp
        ? (spDelta == null ? `目標 ${READ_SPEED.goal}wpm`
          : spDelta >= 0 ? `<span style="color:var(--good-text)">前回より +${spDelta}</span>／目標 ${READ_SPEED.goal}`
            : `前回より ${spDelta}／目標 ${READ_SPEED.goal}`)
        : '英語の語数と時間を入れると出ます'}</div>
      <div class="bar-mini"><i style="width:${lastSp ? pct(lastSp.wpm, READ_SPEED.goal) : 0}%"></i></div></div>

    <div class="stat"><div class="k">理解度「◎ できる」</div>
      <div class="v">${pct(fDone, fTotal)}<small>%</small></div>
      <div class="m">${fDone} / ${fTotal} 分野　${fUntouched > 0
        ? `<span style="color:var(--critical)">未着手 ${fUntouched}</span>` : '未着手なし'}</div>
      <div class="bar-mini"><i style="width:${pct(fDone, fTotal)}%"></i></div></div>

    <div class="stat"><div class="k">繰り返し回数</div>
      <div class="v">${totalReps()}<small>周</small></div>
      <div class="m">必勝セレクト＋過去問の合計</div></div>

    <div class="stat"><div class="k">累計学習時間</div>
      <div class="v">${th.toFixed(1)}<small>時間</small></div>
      <div class="m">1日あたり平均 ${avg.toFixed(1)}時間</div>
      <div class="bar-mini"><i style="width:${pct(th, goalTotal)}%"></i></div></div>`;
}

/* =========================================================
   工程表
   ========================================================= */
function renderPlan() {
  const host = document.getElementById('phase-cards');
  const t = todayStr();
  host.innerHTML = phaseRanges().map(p => {
    const now = t >= p.start && t <= p.end;
    return `
    <div class="phase ${p.id} ${now ? 'now' : ''}">
      <h3>${p.name}${now ? '<span class="badge-now">いまここ</span>' : ''}</h3>
      <div class="range">${fmtMDW(p.start)} 〜 ${fmtMDW(p.end)}（${p.days}日間）</div>
      <p class="lead">${p.lead}</p>
      <div class="goal"><b>この期のゴール：</b>${p.goal}</div>
      <ul>${p.points.map(x => `<li>${x}</li>`).join('')}</ul>
      <div class="sec-title" style="margin:14px 0 4px">この期の重点</div>
      <div class="focus-rows">${p.focus.map(f =>
        `<div class="focus-row"><span class="fr-subj">${f.subj}</span><span>${f.text}</span></div>`).join('')}</div>
    </div>`;
  }).join('');

  renderCalendar();
}

function renderCalendar() {
  const host = document.getElementById('calendar');
  const days = summerDays();
  const months = [];
  days.forEach(d => {
    const key = d.slice(0, 7);
    let m = months.find(x => x.key === key);
    if (!m) { m = { key, days: [] }; months.push(m); }
    m.days.push(d);
  });
  const lvl = c => c <= 0 ? 0 : c <= 3 ? 1 : c <= 7 ? 2 : c <= 12 ? 3 : 4;
  const t = todayStr();

  host.innerHTML = months.map(m => {
    const first = parseYmd(m.days[0]).getDay();
    const cells = [];
    for (let i = 0; i < first; i++) cells.push('<div class="cal-cell void"></div>');
    m.days.forEach(d => {
      const c = dayChecks(d);
      cells.push(`<div class="cal-cell l${lvl(c)} ${d === t ? 'today' : ''}" data-d="${d}"
        title="${fmtMDW(d)} ${c}チェック／${dayHours(d)}時間">${parseYmd(d).getDate()}</div>`);
    });
    const [yy, mm] = m.key.split('-');
    return `<div class="month"><h4>${Number(yy)}年 ${Number(mm)}月</h4>
      <div class="cal-grid">${DOW.map(x => `<div class="dow">${x}</div>`).join('')}${cells.join('')}</div></div>`;
  }).join('');

  host.querySelectorAll('.cal-cell[data-d]').forEach(c => {
    c.onclick = () => { setDay(c.dataset.d); switchView('today'); };
  });
}

/* =========================================================
   合格ライン逆算
   ========================================================= */
const FIVE = ['国語', '数学', '英語', '理科', '社会'];
const FOUR = ['音楽', '美術', '保健体育', '技術・家庭'];

function calcNeed() {
  const n = state.naishin;
  const five = n.five.reduce((a, b) => a + Number(b || 0), 0);
  const four = n.four.reduce((a, b) => a + Number(b || 0), 0);
  const kansan = five + four * 2;                       /* 65点満点 */
  const report = kansan / 65 * 300;                     /* 調査書点 300 */
  const esat = ESAT_SCORES[n.esat] != null ? ESAT_SCORES[n.esat] : 20;
  const target = Number(state.settings.targetTotal) || 0;
  const needAcademic = target - report - esat;          /* 700点満点での必要点 */
  const needRaw = needAcademic / 700 * 500;             /* 5教科素点（500点満点） */
  return {
    five, four, kansan, esat, target,
    report: Math.round(report * 10) / 10,
    academic: Math.round(needAcademic * 10) / 10,
    total: Math.max(0, Math.round(needRaw)),
    perSubject: Math.max(0, Math.round(needRaw / 5)),
  };
}

function renderCalc() {
  const n = state.naishin;
  const build = (host, names, arr, x2) => {
    host.innerHTML = '';
    names.forEach((nm, i) => {
      const c = document.createElement('div');
      c.className = 'n-cell' + (x2 ? ' x2' : '');
      c.innerHTML = `<label>${nm}</label>`;
      const sel = document.createElement('select');
      [1, 2, 3, 4, 5].forEach(v => {
        const o = document.createElement('option');
        o.value = v; o.textContent = v;
        if (Number(arr[i]) === v) o.selected = true;
        sel.appendChild(o);
      });
      sel.onchange = () => { arr[i] = Number(sel.value); save(true); drawCalcResult(); };
      c.appendChild(sel);
      host.appendChild(c);
    });
  };
  build(document.getElementById('naishin-five'), FIVE, n.five, false);
  build(document.getElementById('naishin-four'), FOUR, n.four, true);

  const esatSel = document.getElementById('esat');
  esatSel.value = n.esat;
  esatSel.onchange = () => { n.esat = esatSel.value; save(true); drawCalcResult(); };

  const tt = document.getElementById('target-total');
  tt.value = state.settings.targetTotal;
  tt.oninput = () => { state.settings.targetTotal = Number(tt.value) || 0; save(true); drawCalcResult(); };
  drawCalcResult();
}

function drawCalcResult() {
  const r = calcNeed();
  const over = r.total > 500;
  document.getElementById('calc-result').innerHTML = `
    <div class="res-box">
      <div class="res-line"><span>5教科の評定合計</span><b>${r.five} / 25</b></div>
      <div class="res-line"><span>実技4教科の評定合計 ×2</span><b>${r.four * 2} / 40</b></div>
      <div class="res-line"><span>換算内申</span><b>${r.kansan} / 65</b></div>
      <div class="res-line res-big"><span>調査書点（300点満点）</span><b>${r.report}</b></div>
    </div>
    <div class="res-box">
      <div class="res-line"><span>目標とする総合得点</span><b>${r.target} / 1020</b></div>
      <div class="res-line"><span>調査書点</span><b>− ${r.report}</b></div>
      <div class="res-line"><span>ESAT-J（${state.naishin.esat}）</span><b>− ${r.esat}</b></div>
      <div class="res-line res-big"><span>当日の学力検査で必要な点（700点満点）</span><b>${Math.max(0, r.academic)}</b></div>
    </div>
    <div class="res-box">
      <div class="res-line res-big"><span>5教科の素点で必要な合計</span><b>${r.total} / 500</b></div>
      <div class="res-note">${over
        ? '⚠️ 現在の内申では、この目標総合得点は当日満点でも届きません。内申を上げるか、目標を見直してください。'
        : `1教科あたりの平均 <b>${r.perSubject}点</b>。自校作成の国数英は平均点が下がるので、共通問題の<b>理科・社会で90点前後</b>を取り、その分を国数英に振り分けるのが現実的な組み立てです。`}</div>
      <div class="need-list">
        ${[['国語', -8], ['数学', -8], ['英語', -8], ['理科', 12], ['社会', 12]].map(([nm, adj]) => {
          const v = Math.max(0, Math.min(100, r.perSubject + adj));
          return `<div class="need-cell"><div class="s">${nm}</div><div class="p">${v}</div></div>`;
        }).join('')}
      </div>
      <div class="res-note" style="font-size:12px;color:var(--ink-muted)">
        上は「理社で稼ぐ」前提の配分例です（理社 +12点、国数英 −8点）。自分の得意・不得意に合わせて読み替えてください。
      </div>
    </div>`;
}

/* =========================================================
   設定
   ========================================================= */
function renderSettings() {
  const s = state.settings;
  const bind = (id, key, isNum) => {
    const e2 = document.getElementById(id);
    e2.value = s[key];
    e2.onchange = () => { s[key] = isNum ? Number(e2.value) : e2.value; save(true); renderAll(); toast('設定を更新しました'); };
  };
  bind('set-name', 'name'); bind('set-school', 'school');
  bind('set-start', 'start'); bind('set-end', 'end');
  bind('set-exam', 'exam'); bind('set-goal', 'goalHours', true);

  document.getElementById('btn-export').onclick = exportBackup;
  const file = document.getElementById('file-import');
  document.getElementById('btn-import').onclick = () => file.click();
  file.onchange = () => {
    const f = file.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const obj = JSON.parse(rd.result);
        if (!obj || typeof obj !== 'object' || !obj.days) throw new Error('このアプリの書き出しファイルではないようです');
        const now = recordedDays().length;
        const inc = Object.keys(obj.days).length;
        if (!confirm(`いま入っている記録（${now}日ぶん）を、読み込んだデータ（${inc}日ぶん）で置き換えます。\n`
          + '元に戻せません。よろしいですか？')) { file.value = ''; return; }
        localStorage.setItem(KEY, JSON.stringify(obj));
        state = load();
        renderAll();
        toast('読み込みました');
      } catch (e) { toast('読み込めませんでした：' + e.message); }
      file.value = '';
    };
    rd.readAsText(f);
  };
  document.getElementById('btn-reset').onclick = () => {
    const n = recordedDays().length;
    if (!confirm(`${n}日ぶんの学習記録・理解度・繰り返し回数をすべて削除します。\n`
      + '元に戻せません。先に「JSONで書き出す」でバックアップを取りましたか？')) return;
    if (!confirm('本当に削除してよろしいですか？')) return;
    localStorage.removeItem(KEY);
    state = DEFAULT_STATE();
    renderAll();
    toast('削除しました');
  };

  renderDataStatus();
  document.getElementById('install-hint').innerHTML = installHintHTML();
}

/* データの状態（設定タブ） */
function renderDataStatus() {
  const host = document.getElementById('data-status');
  if (!host) return;
  const days = recordedDays();
  const st = backupStatus();
  const fmtDT = iso => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${z2(d.getHours())}:${z2(d.getMinutes())}`;
  };
  const bk = !state.settings.lastBackup
    ? '<b class="bad">まだ一度もしていません</b>'
    : `${fmtDT(state.settings.lastBackup)}` +
      (st.since >= 7 ? ` <b class="bad">（${st.since}日前）</b>` : `（${st.since === 0 ? '今日' : st.since + '日前'}）`);

  host.innerHTML = `
    <div class="res-line"><span>記録している日数</span><b>${days.length}日</b></div>
    ${days.length ? `<div class="res-line"><span>期間</span><b>${fmtMD(days[0])} 〜 ${fmtMD(days[days.length - 1])}</b></div>` : ''}
    <div class="res-line"><span>理解度を入れた分野</span><b>${allFields().filter(f => undOf(f.id) > 0).length} / ${allFields().length}</b></div>
    <div class="res-line"><span>最後のバックアップ</span><b>${bk}</b></div>`;
}

function installHintHTML() {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) return 'ホーム画面のアプリとして起動しています。この端末の記録はこのアプリの中にあります。';
  if (location.protocol === 'file:') {
    return 'いまファイルを直接開いています。スマホで使うには、公開したURLから開いてください。';
  }
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  return ios
    ? 'Safariの共有ボタン（□に↑）→「ホーム画面に追加」で、1タップで開けるアプリになります。'
    : 'ブラウザのメニュー →「アプリをインストール」または「ホーム画面に追加」で、1タップで開けるアプリになります。';
}

/* =========================================================
   ビュー切り替え・初期化
   ========================================================= */
function switchView(name) {
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'dash') {
    renderHeaderChips(); renderStats(); renderUnderstandChart();
    renderSpeedChart(); renderDailyChart(); renderSubjectChart(); renderWeekGrid();
  }
  if (name === 'today') renderToday();
  if (name === 'fields') renderFieldProgress();
  if (name === 'plan') renderPlan();
}

function renderAll() {
  renderBanner();
  renderSchoolName();
  renderHeaderChips();
  renderToday();
  renderStats();
  renderUnderstandChart();
  renderSpeedChart();
  renderDailyChart();
  renderSubjectChart();
  renderWeekGrid();
  renderFieldProgress();
  renderPlan();
  renderCalc();
  renderSettings();
}

function init() {
  checkStorage();

  document.getElementById('tabs').addEventListener('click', ev => {
    const b = ev.target.closest('.tab');
    if (b) switchView(b.dataset.view);
  });

  const picker = document.getElementById('day-picker');
  picker.value = currentDay;
  picker.onchange = () => setDay(picker.value);
  document.getElementById('day-prev').onclick = () => setDay(addDays(currentDay, -1));
  document.getElementById('day-next').onclick = () => setDay(addDays(currentDay, 1));
  document.getElementById('day-today').onclick = () => setDay(todayStr());

  renderAll();

  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      renderUnderstandChart(); renderSpeedChart(); renderDailyChart(); renderSubjectChart();
    }, 160);
  });
}

init();
