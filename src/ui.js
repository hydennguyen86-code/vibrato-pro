/* Vibrato Pro — UI layer (vanilla JS). Chỉ gọi engine qua window.VE (xem SPEC §3). */
(function () {
'use strict';

const VE = window.VE;
const LEVELS = window.LEVELS || [];
const STAGES = window.STAGES || [];
const DEMO = /[?&]demo=1/.test(location.search);
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const levelById = id => LEVELS.find(l => l.id === Number(id));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const f1 = v => (v == null || isNaN(v)) ? '—' : Number(v).toFixed(1).replace('.', ',');
const f0 = v => (v == null || isNaN(v)) ? '—' : String(Math.round(v));
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };
let toastT = 0;
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.getElementById('app').appendChild(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3800);
}

/* ---------- icons ---------- */
const I = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7.5L21 11"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-6h4v6"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h2.5l2-6 3.5 12 3-9 2 5 1.5-2H21"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5.6"/><circle cx="12" cy="12" r="2.2"/><circle cx="12" cy="12" r="8.4" stroke-width="3.2" stroke-linecap="butt" stroke-dasharray="3.1 3.3"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11"/></svg>',
  cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>',
  speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 010 6M18 6.5a8 8 0 010 11"/></svg>',
  flame: '<svg viewBox="0 0 24 24"><path d="M12 2c1 4 5 6 5 11a5 5 0 01-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z" fill="#ff8a1f"/><path d="M12 22a3 3 0 01-3-3c0-2 2-3 3-5 1 2 3 3 3 5a3 3 0 01-3 3z" fill="#ffd36b"/></svg>',
  bulb: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" fill="#ffc247"/><rect x="9" y="18" width="6" height="2.5" rx="1" fill="#b98a2a"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><path d="M12 3L2 20h20z" fill="#ff7a52"/><path d="M12 9v5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="17" r="1.4" fill="#fff"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  metro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8l-2-17h-4z"/><path d="M12 17l4-8"/></svg>',
  cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5A2.5 2.5 0 015.5 6h8A2.5 2.5 0 0116 8.5v7a2.5 2.5 0 01-2.5 2.5h-8A2.5 2.5 0 013 15.5z"/><path d="M16 10.5l5-3v9l-5-3"/></svg>',
  retry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 11-2.6-5.9"/><path d="M20 4v5h-5"/></svg>',
  yt: '<svg viewBox="0 0 44 32"><rect width="44" height="32" rx="9" fill="#e62117"/><path d="M18 9v14l12-7z" fill="#fff"/></svg>'
};
const logoSVG = '<svg class="logo" viewBox="0 0 48 48"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffc552"/><stop offset="1" stop-color="#e07800"/></linearGradient></defs><rect width="48" height="48" rx="14" fill="rgba(255,170,60,.16)" stroke="rgba(255,190,110,.4)"/><path d="M24 8c-5 0-7 3-6 6 .6 2-2 3-2 6 0 2 1.5 3 1 5-1 4 0 9 7 9s8-5 7-9c-.5-2 1-3 1-5 0-3-2.600-4-2-6 1-3-1-6-6-6z" fill="url(#lg)"/><path d="M24 4v7" stroke="#ffc552" stroke-width="2" stroke-linecap="round"/></svg>';

/* ---------- background ---------- */
const violinBG = '<svg viewBox="0 0 200 480" fill="none" stroke="var(--violin)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter:none">' +
  '<circle cx="100" cy="30" r="13"/><path d="M93 40v150M107 40v150"/><path d="M93 62h14M93 76h14"/>' +
  '<path d="M100 188C62 188 46 212 53 242c4 17 14 22 11 38-4 18-24 26-24 62 0 44 30 68 60 68s60-24 60-68c0-36-20-44-24-62-3-16 7-21 11-38 7-30-9-54-47-54z" fill="var(--violin)"/>' +
  '<path d="M82 252c-6 8-6 30 0 40M118 252c6 8 6 30 0 40" stroke-width="4"/>' +
  '<path d="M80 395h40" stroke-width="5"/><path d="M92 170v225M96 170v225M104 170v225M108 170v225" stroke-width="1.2"/></svg>';

/* ---------- wake lock ---------- */
const WL = { s: null, want: false,
  async acquire() { this.want = true; try { if (navigator.wakeLock && !this.s) { const l = await navigator.wakeLock.request('screen'); if (!this.want) { l.release(); return; } this.s = l; l.addEventListener('release', () => { if (this.s === l) this.s = null; }); } } catch (e) {} },
  release() { this.want = false; try { if (this.s) this.s.release(); } catch (e) {} this.s = null; } };
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && WL.want) WL.acquire(); });

/* ---------- điểm mở rộng: xem docs/SPEC-LEGATO.md §9 ---------- */
// File màn hình mới KHÔNG sửa ui.js: nạp trước ui.js và đẩy hàm vào window.VP_EXT; ui.js gọi hàm đó với VP_UI ngay trước lần route đầu.
const EXT = { routes: {}, tabs: [], home: [] };

/* ---------- state ---------- */
let cleanup = null;
let lastResult = null;       // { levelId, pass, metrics, durationSec, gate, self }
let sampleLevel = null;
const view = $('#view'), tabbar = $('#tabbar');

function applyTheme() {
  const th = safe(() => VE.settings.get().theme, 'dark') === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', th);
  const m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', th === 'light' ? '#fbf2e6' : '#0d0806');
}
function curLevelId() { return safe(() => VE.store.currentLevel(), 1) || 1; }

/* ---------- tab bar ---------- */
function renderTabs(active) {
  const tabs = [['home', '#/home', 'Lộ trình', I.home], ['measure', '#/measure/' + curLevelId(), 'Đo', I.mic],
    ['progress', '#/progress', 'Tiến độ', I.chart], ['settings', '#/settings', 'Cài đặt', I.gear]];
  // tab do phần mở rộng đăng ký (VP_UI.registerTab) — chèn theo order (0 = đầu, 2 = sau "Đo")
  EXT.tabs.slice().sort((a, b) => b.order - a.order).forEach(t => tabs.splice(clamp(t.order, 0, tabs.length), 0, [t.id, t.href, t.label, t.icon || I.mic]));
  tabbar.innerHTML = tabs.map(t => `<a href="${t[1]}" class="${active === t[0] ? 'on' : ''}" ${active === t[0] ? 'aria-current="page"' : ''}>${t[3]}<span>${t[2]}</span></a>`).join('');
}

/* ---------- router ---------- */
function route() {
  if (cleanup) { safe(cleanup); cleanup = null; }
  safe(() => VE.stopSample && VE.stopSample());
  const parts = (location.hash || '#/home').replace(/^#\/?/, '').split('/');
  const name = parts[0] || 'home', arg = parts[1];
  const map = { home: [screenHome, 'home'], level: [screenLevel, 'home'], measure: [screenMeasure, 'measure'],
    result: [screenResult, 'measure'], progress: [screenProgress, 'progress'], calibrate: [screenCalibrate, 'settings'], settings: [screenSettings, 'settings'] };
  const entry = map[name] || EXT.routes[name] || map.home; // route lõi luôn thắng route mở rộng trùng tên
  renderTabs(entry[1]);
  view.scrollTop = 0;
  const fit = name === 'measure' || entry[2] === true;
  view.classList.toggle('fit', fit); tabbar.hidden = fit; $('#app').classList.toggle('notab', fit);
  try { cleanup = entry[0](arg) || null; }
  catch (e) { console.error(e); view.innerHTML = `<div class="card err"><b>Có lỗi hiển thị</b>${esc(e.message)}<p style="margin-top:8px"><a class="btn btn-ghost btn-sm" href="#/home">Về Lộ trình</a></p></div>`; }
}
window.addEventListener('hashchange', route);

/* ---------- shared bits ---------- */
function topbar(title, backHref, right) {
  return `<div class="topbar">${backHref ? `<a class="iconbtn" href="${backHref}" aria-label="Quay lại">${I.back}</a>` : '<span style="width:48px"></span>'}<h1>${esc(title)}</h1>${right || '<span style="width:48px"></span>'}</div>`;
}
function stHTML(state) {
  if (state === 'ok') return `<span class="st ok">${I.check}Đạt</span>`;
  if (state === 'bad') return `<span class="st bad">${I.cross}Chưa</span>`;
  return '<span class="st na">—</span>';
}
function critRange(c, k) {
  if (!c) return '';
  if (k === 'rate') return `(${f1(c.rate[0])}–${f1(c.rate[1])} Hz)`;
  if (k === 'regularity') return `(≥${c.regularityMin}%)`;
  if (k === 'width') return `(${c.width[0]}–${c.width[1]} cents)`;
  return c.center ? '(dưới nốt)' : '';
}
function tilesHTML(crit, m) {
  const ck = (m && m.valid && m.checks) || {};
  const st = k => ck[k] ? (ck[k].ok ? 'ok' : 'bad') : 'na';
  const val = (v, unit, dec) => v == null ? '—' : (dec ? f1(v) : f0(v)) + (unit ? `<small>${unit}</small>` : '');
  const ok = m && m.valid;
  const tile = (cls, label, v, k, state) => `<div class="tile" role="group" aria-label="${label}"><div class="l">${label}</div><div class="v ${cls}">${v}</div><div class="sr2">${stHTML(state)}<span class="r">${critRange(crit, k)}</span></div></div>`;
  return tile('', 'Tốc độ', val(ok ? m.rate : null, 'Hz', 1), 'rate', st('rate')) +
    tile('', 'Độ đều', val(ok ? m.regularity : null, '%', 0), 'regularity', st('regularity')) +
    tile('', 'Độ rộng', val(ok ? m.width : null, 'cent', 0), 'width', st('width')) +
    tile('txt', 'Tâm cao độ', ok && m.centerLabel ? esc(m.centerLabel) : '—', 'center', st('center'));
}
function micErrorHTML(code) {
  const T = {
    INSECURE: ['Cần mở qua https', 'Trình duyệt chỉ cho dùng micro khi trang được mở bằng https://. Hãy mở app qua địa chỉ https (ví dụ GitHub Pages).'],
    DENIED: ['Chưa được phép dùng micro', 'Vào Cài đặt › Safari › Micro, chọn “Cho phép” cho trang này, rồi tải lại trang.'],
    NO_MIC: ['Không tìm thấy micro', 'Kiểm tra micro của thiết bị rồi thử lại.'],
    UNSUPPORTED: ['Trình duyệt không hỗ trợ thu âm', 'Hãy dùng Safari hoặc Chrome bản mới.']
  };
  const t = T[code] || ['Không mở được micro', 'Hãy thử tải lại trang và cho phép micro.'];
  return `<div class="card err" role="alert"><b>${t[0]}</b><span>${t[1]}</span></div>`;
}
function dateLabel(ts) {
  const d = new Date(ts < 1e12 ? ts * 1000 : ts);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ================= HOME ================= */
function screenHome() {
  const cur = curLevelId();
  const lv = levelById(cur) || LEVELS[LEVELS.length - 1] || { id: cur, title: '' };
  const streak = safe(() => VE.store.streak(), 0);
  const done = Math.max(0, Math.min(100, cur - 1));
  const stageHTML = STAGES.map(s => {
    const state = cur > s.range[1] ? 'done' : (cur >= s.range[0] ? 'cur' : 'open');
    const open = state === 'cur';
    const ic = state === 'done' ? `<span class="st-ic st-done">${I.check}</span>` : state === 'cur' ? `<span class="st-ic st-cur">${I.play}</span>` : `<span class="st-ic st-open">${s.id}</span>`;
    const lvs = LEVELS.filter(l => l.stage === s.id).map(l => {
      let stt = safe(() => VE.store.status(l.id), 'open'); if (stt === 'locked') stt = 'open';
      return `<a class="lv ${stt}" href="#/level/${l.id}" aria-label="Level ${l.id}${stt === 'passed' ? ' đã qua' : stt === 'current' ? ' hiện tại' : ''}">${l.id}${stt === 'passed' ? '<small>✓</small>' : ''}</a>`;
    }).join('');
    return `<div class="stage card ${open ? 'open' : ''}" style="padding:4px 6px"><button class="stage-h" aria-expanded="${open}">${ic}<span class="t"><b class="num">${s.id}</b>${esc(s.name)}<small>${esc(s.short)}</small></span>${I.chev}</button><div class="lv-grid">${lvs}</div></div>`;
  }).join('<div style="height:8px"></div>');
  view.innerHTML = `
    <div class="brand">${logoSVG}<div><h1>Vibrato Pro</h1><p>Tập đúng · Tiến bộ thật</p></div><a class="iconbtn" href="#/settings" aria-label="Cài đặt">${I.gear}</a></div>
    <div class="card">
      <div class="lvl-big num">Level ${cur} <small>/ 100</small></div>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${done}"><i style="width:${done}%"></i></div>
      <div class="row between"><span class="chip">${I.flame}Chuỗi ${streak} ngày</span><span class="muted num" style="font-size:14px">Đã qua ${done} level</span></div>
    </div>
    <div class="card today">
      <h2>Hôm nay tập</h2>
      <div class="big num">Level ${lv.id}</div>
      <p class="muted" style="margin:-6px 0 12px">${esc(lv.title || '')}</p>
      <a class="btn btn-gold" href="#/measure/${lv.id}">${I.play}Bắt đầu</a>
      <p style="margin-top:10px"><a class="gold" href="#/level/${lv.id}" style="font-weight:700;font-size:15px;display:inline-block;padding:8px">Xem hướng dẫn level ›</a></p>
    </div>
    ${EXT.home.map(fn => safe(() => fn(), '') || '').join('')}
    <h2 class="sec-title">Lộ trình 8 vòng</h2>
    ${stageHTML}`;
  $$('.stage-h', view).forEach(b => b.addEventListener('click', () => {
    const st = b.parentElement; const o = st.classList.toggle('open'); b.setAttribute('aria-expanded', o);
  }));
}

/* ================= ANIMATION (SPEC §5) ================= */
function createAnim(host, level) {
  const a = level.anim || { type: 'finger', rate: 3, width: 30 };
  const type = a.type || 'finger', rate = a.rate || 3, width = a.width || 30;
  const wf = clamp(width / 35, 0.45, 2);
  const ampPx = clamp(6 + width * 0.55, 10, 30);
  const skin = '#e3a977', skinD = '#c98a58';
  host.innerHTML = `<svg viewBox="0 0 320 180" role="img" aria-label="Hoạt hình minh hoạ động tác rung">
    <rect x="30" y="86" width="272" height="32" rx="5" fill="#3b2415"/>
    <rect x="30" y="86" width="272" height="3" fill="#5a3a22"/>
    <circle cx="22" cy="102" r="9" fill="none" stroke="#7b5a3a" stroke-width="3"/>
    <rect x="48" y="86" width="3" height="32" fill="#d9c7a0"/>
    <g stroke="#e8dcc0" stroke-width="1.2" opacity=".85"><line x1="30" y1="92" x2="302" y2="92"/><line x1="30" y1="99" x2="302" y2="99"/><line x1="30" y1="106" x2="302" y2="106"/><line x1="30" y1="113" x2="302" y2="113"/></g>
    <g id="g"><g id="arm"><line x1="318" y1="6" x2="238" y2="40" stroke="${skin}" stroke-width="17" stroke-linecap="round"/>
      <g id="wr"><ellipse cx="214" cy="48" rx="27" ry="14" transform="rotate(-18 214 48)" fill="${skin}"/>
        <g id="fi"><polyline points="196,50 170,66 150,95" fill="none" stroke="${skin}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="150" cy="95" r="6.5" fill="${skinD}"/></g></g></g></g>
    <rect x="16" y="126" width="288" height="50" rx="10" fill="rgba(0,0,0,.28)"/>
    <line id="base" x1="20" y1="136" x2="300" y2="136" style="stroke:var(--gold-text)" stroke-width="1.5" stroke-dasharray="5 4"/>
    <text x="296" y="133" font-size="9" font-weight="700" text-anchor="end" style="fill:var(--gold-text)">nốt chuẩn</text>
    <path id="tr" d="" fill="none" style="stroke:var(--g-line)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
    <circle id="dot" cx="300" cy="136" r="4.5" style="fill:var(--g-line)"/></svg>
    <div class="anim-cap num">${String(rate).replace('.', ',')} Hz · ${width} cents</div>`;
  const g = $('#g', host), arm = $('#arm', host), wr = $('#wr', host), fi = $('#fi', host), tr = $('#tr', host), dot = $('#dot', host), base = $('#base', host);
  const TAU = Math.PI * 2, span = 2.4;
  const env = t => type === 'swell' ? 0.15 + 0.85 * (0.5 - 0.5 * Math.cos(TAU * t / 6)) : 1;
  const shiftOff = t => {
    if (type !== 'shift') return 0;
    const u = ((t % 6) + 6) % 6, e = x => x * x * (3 - 2 * x);
    return u < 2.5 ? 0 : u < 3 ? e((u - 2.5) / .5) : u < 5.5 ? 1 : 1 - e((u - 5.5) / .5);
  };
  const dv = t => (1 - Math.cos(TAU * rate * t)) / 2 * env(t);
  let raf = 0, t0 = performance.now(), stopped = false;
  function frame(now) {
    if (stopped) return;
    const t = (now - t0) / 1000, d = dv(t), so = shiftOff(t);
    let tx = 0, a1 = 0, a2 = 0, a3 = 0;
    if (type === 'tap') a3 = 14 * d;                       // đầu ngón nhấc lên rồi chạm lại
    else if (type === 'polish') tx = 18 * wf * Math.sin(TAU * rate * t);
    else if (type === 'slide') tx = 30 * wf * Math.sin(TAU * rate * t);
    else if (type === 'arm') a1 = 3.4 * wf * d;
    else if (type === 'wrist') a2 = 7 * wf * d;
    else if (type === 'shift') { tx = 40 * so; a3 = -12 * wf * d; }
    else if (type === 'swell') a3 = -14 * wf * d;
    else a3 = -14 * wf * d;                                // finger
    g.setAttribute('transform', `translate(${tx.toFixed(2)} 0)`);
    arm.setAttribute('transform', `rotate(${a1.toFixed(2)} 318 6)`);
    wr.setAttribute('transform', `rotate(${a2.toFixed(2)} 238 40)`);
    fi.setAttribute('transform', `rotate(${a3.toFixed(2)} 150 95)`);
    const baseY = 136; let p = '';
    for (let i = 0; i <= 140; i++) {
      const x = 20 + i * 2, tt = t - (300 - x) / 280 * span;
      p += (i ? 'L' : 'M') + x + ' ' + (baseY + ampPx * dv(tt)).toFixed(1);
    }
    tr.setAttribute('d', p);
    dot.setAttribute('cy', (baseY + ampPx * d).toFixed(1));
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return () => { stopped = true; cancelAnimationFrame(raf); };
}

/* ================= LEVEL DETAIL ================= */
function ytLink(level) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(level.youtube.query); }
function screenLevel(arg) {
  const lv = levelById(arg);
  if (!lv) { view.innerHTML = topbar('Không có level', '#/home') + '<div class="card empty">Không tìm thấy level này.</div>'; return; }
  const status = safe(() => VE.store.status(lv.id), 'current');
  const gate = safe(() => VE.store.gate(lv.id), null);
  const self = lv.mode === 'self';
  const c = lv.criteria;
  const crit = self
    ? (lv.selfCheck || []).map(x => `<li>${esc(x)}</li>`).join('') + `<li>Tập tối thiểu ${lv.selfSeconds || 60} giây</li>`
    : c ? `<li>Tốc độ ${f1(c.rate[0])}–${f1(c.rate[1])} Hz</li><li>Độ đều ≥ ${c.regularityMin}%</li><li>Độ rộng ${c.width[0]}–${c.width[1]} cents</li>${c.center ? '<li>Rung xuống dưới nốt</li>' : ''}<li>Giữ đạt liên tục ${c.holdSec} giây</li>` : '';
  const tags = [lv.string && 'Dây ' + lv.string, lv.finger != null && lv.finger !== '' && 'Ngón ' + lv.finger, lv.noteName && 'Nốt ' + lv.noteName, lv.bpm && `${lv.bpm} BPM`].filter(Boolean);
  const yt = lv.youtube;
  view.innerHTML = `
    ${topbar('Level ' + lv.id, '#/home')}
    <div class="hero-title"><h2>${esc(lv.title)}</h2><p>${esc(lv.goal || '')}</p></div>
    <div class="stack" style="margin-top:12px">
      <div class="anim-box" id="animBox"></div>
      ${tags.length ? `<div class="tags">${tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>` : ''}
      <button class="btn btn-ghost" id="sampleBtn">${I.speaker}<span>Nghe âm mẫu</span></button>
      ${yt ? `<a class="card yt" href="${ytLink(lv)}" target="_blank" rel="noopener"><div class="yt-th">${I.yt}${yt.minutes ? `<span class="dur num">${yt.minutes} phút</span>` : ''}</div><div><b>${esc(yt.title)}</b><span>Xem trên YouTube</span></div></a>` : ''}
      <div><h2 class="sec-title">Cách tập</h2><div class="card"><ol class="steps">${(lv.steps || []).map(s => `<li><span>${esc(s)}</span></li>`).join('')}</ol></div></div>
      ${(lv.tips || []).length ? `<div class="card note">${I.bulb}<div><b>Mẹo</b><ul>${lv.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></div>` : ''}
      ${(lv.mistakes || []).length ? `<div class="card note">${I.warn}<div><b>Lỗi thường gặp</b><ul>${lv.mistakes.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></div>` : ''}
      <div class="card crit"><b>Tiêu chí đạt</b><ul>${crit}</ul>
        <p class="muted num" style="margin-top:8px;font-size:14px">${gate ? `Qua level: đạt ${gate.neededPasses || 1} lần${(gate.neededDays || 1) > 1 ? `, rải trên ${gate.neededDays} ngày khác nhau` : ''} · Đang có ${gate.passCount}/${gate.neededPasses || 1} lần${(gate.neededDays || 1) > 1 ? ` · ${gate.dayCount}/${gate.neededDays} ngày` : ''}` : ''}</p></div>
    </div>
    <div class="cta">
      <a class="btn ${self ? 'btn-gold' : 'btn-blue'}" href="#/measure/${lv.id}">${I.play}${self ? 'Bắt đầu tập' : 'Bắt đầu đo'}</a></div>`;
  const stopAnim = createAnim($('#animBox'), lv);
  const btn = $('#sampleBtn'); let playing = false;
  const setBtn = p => { playing = p; btn.querySelector('span').textContent = p ? 'Đang phát… (bấm để dừng)' : 'Nghe âm mẫu'; };
  btn.addEventListener('click', () => {
    if (playing) { safe(() => VE.stopSample()); setBtn(false); return; }
    setBtn(true);
    Promise.resolve(safe(() => VE.playSample(lv))).then(() => setBtn(false), () => setBtn(false));
  });
  return () => { stopAnim(); safe(() => VE.stopSample()); };
}

/* ================= PITCH GRAPH (SPEC §3.2) ================= */
function createGraph(canvas, level, opts) {
  const mini = !!(opts && opts.mini);
  const crit = level.criteria || { width: [20, 50], center: true };
  const w0 = crit.width[0], w1 = crit.width[1];
  const R = Math.max(50, w1 + 20), WIN = 4;
  const pts = []; let tNow = 0, col = null;
  const ctx = canvas.getContext('2d');
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement), g = n => cs.getPropertyValue(n).trim();
    col = { band: g('--g-band'), bandLine: g('--g-bandline'), grid: g('--g-grid'), line: g('--g-line'), zero: g('--g-zero'), pill: g('--g-bg'), text: g('--text'), muted: g('--muted') };
  };
  readColors();
  function resize() {
    const dpr = window.devicePixelRatio || 1, w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [w, h];
  }
  function push(f) {
    tNow = f.t;
    pts.push([f.t, f.voiced && f.centsFromRef != null && isFinite(f.centsFromRef) ? f.centsFromRef : null]);
    while (pts.length && pts[0][0] < tNow - WIN - 0.5) pts.shift();
  }
  function draw() {
    const [W, H] = resize();
    ctx.clearRect(0, 0, W, H);
    const x0 = mini ? 4 : 44, x1 = W - (mini ? 4 : 8), y0 = mini ? 3 : 10, y1 = H - (mini ? 3 : 10), ph = y1 - y0, pw = x1 - x0;
    const cTop = mini ? Math.max(15, w1 * 0.35) : R, cBot = mini ? -(w1 * 1.35) : -R;
    const Y = c => y0 + (cTop - c) / (cTop - cBot) * ph;
    const X = t => x0 + (t - (tNow - WIN)) / WIN * pw;
    // dải mục tiêu
    const hi = crit.center === false ? w1 / 2 : 0, lo = crit.center === false ? -w1 / 2 : -w1;
    ctx.fillStyle = col.band; ctx.fillRect(x0, Y(hi), pw, Y(lo) - Y(hi));
    ctx.strokeStyle = col.bandLine; ctx.lineWidth = 1.5; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x0, Y(lo)); ctx.lineTo(x1, Y(lo)); ctx.stroke();
    // độ rộng tối thiểu (nét đứt)
    ctx.setLineDash([6, 5]); ctx.lineWidth = 1.6;
    const dl = crit.center === false ? [-w0 / 2, w0 / 2] : [-w0];
    dl.forEach(c => { ctx.beginPath(); ctx.moveTo(x0, Y(c)); ctx.lineTo(x1, Y(c)); ctx.stroke(); });
    ctx.setLineDash([]);
    // vạch 0 = nốt chuẩn
    ctx.strokeStyle = col.zero; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x1, Y(0)); ctx.stroke();
    if (!mini) {
    // nhãn trục
    ctx.font = '600 12px -apple-system, system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = col.muted;
    const labels = [[R, '+' + R], [0, '0'], [lo, String(lo)], [-R, String(-R)]];
    if (crit.center !== false) labels.splice(3, 0, [-w0, String(-w0)]);
    const drawn = [];
    labels.forEach(([c, s]) => { const y = Y(c); if (drawn.every(v => Math.abs(v - y) > 13)) { ctx.fillText(s, x0 - 6, y); drawn.push(y); } });
    // nhãn Vùng mục tiêu
    ctx.font = '700 13px -apple-system, system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = col.text;
    // đặt nhãn phía trên vạch nốt chuẩn, góc phải — vùng này trống khi rung đúng nên sóng không đè lên
    const tw = ctx.measureText('Vùng mục tiêu ↓').width;
    const ly = Math.max(y0 + 11, Y(hi) - 13), lx = x0 + pw - tw - 16;
    ctx.fillStyle = col.pill; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(lx, ly - 10, tw + 12, 20, 6) : ctx.rect(lx, ly - 10, tw + 12, 20); ctx.fill();
    ctx.fillStyle = col.text; ctx.fillText('Vùng mục tiêu ↓', lx + 6, ly);
    ctx.font = '600 11px -apple-system, system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = col.muted;
    if (H >= 120) ctx.fillText('- - nét đứt: độ rộng tối thiểu ' + w0 + ' cents', x0 + 6, y1 - 6);
    }
    // đường cao độ
    ctx.strokeStyle = col.line; ctx.lineWidth = mini ? 2.4 : 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, pw, ph); ctx.clip();
    let open = false, lastT = 0;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const [t, c] = pts[i];
      if (c == null || (open && t - lastT > 0.2)) { if (c == null) { open = false; continue; } open = false; }
      const x = X(t), y = Y(clamp(c, cBot * 1.05, cTop * 1.05));
      if (!open) { ctx.moveTo(x, y); open = true; } else ctx.lineTo(x, y);
      lastT = t;
    }
    ctx.stroke(); ctx.restore();
  }
  return { push, draw, readColors, clear() { pts.length = 0; tNow = 0; } };
}

/* ================= MEASURE ================= */
function screenMeasure(arg) {
  const lv = levelById(arg) || levelById(curLevelId());
  if (!lv) { view.innerHTML = topbar('Đo Vibrato') + '<div class="card empty">Chưa có level.</div>'; return; }
  if (String(lv.id) !== String(arg)) { history.replaceState(null, '', '#/measure/' + lv.id); }
  return lv.mode === 'self' ? measureSelf(lv) : measureMic(lv);
}

function metroBlock(lv, state) {
  const target = lv.bpm && lv.cyclesPerBeat ? ` → ${f1(state.bpm / 60 * lv.cyclesPerBeat)} Hz` : '';
  return `<div class="metro">
      <button class="iconbtn" id="bpmMinus" aria-label="Giảm BPM">${I.minus}</button>
      <div class="bpm num"><div>BPM <span id="bpmVal">${state.bpm}</span></div><small id="bpmTarget">${esc(target.replace(' → ', 'Tốc độ rung '))}</small></div>
      <button class="iconbtn" id="bpmPlus" aria-label="Tăng BPM">${I.plus}</button>
      <button class="iconbtn ${state.on ? 'on' : ''}" id="metroToggle" aria-pressed="${state.on}" aria-label="Bật tắt metronome">${I.metro}</button>
    </div>
    <div class="dots" id="beatDots" aria-hidden="true"><i></i><i></i><i></i><i></i></div>`;
}
function bindMetro(lv, state, isActive) {
  const upd = () => {
    $('#bpmVal').textContent = state.bpm;
    $('#bpmTarget').textContent = lv.cyclesPerBeat ? `Tốc độ rung ${f1(state.bpm / 60 * lv.cyclesPerBeat)} Hz` : '';
    if (isActive()) safe(() => VE.metronome.setBpm(state.bpm));
  };
  $('#bpmMinus').addEventListener('click', () => { state.bpm = clamp(state.bpm - 2, 30, 200); upd(); });
  $('#bpmPlus').addEventListener('click', () => { state.bpm = clamp(state.bpm + 2, 30, 200); upd(); });
  const tg = $('#metroToggle');
  tg.addEventListener('click', () => {
    state.on = !state.on; tg.classList.toggle('on', state.on); tg.setAttribute('aria-pressed', state.on);
    if (isActive()) { if (state.on) startMetro(state); else safe(() => VE.metronome.stop()); }
  });
}
function startMetro(state) {
  safe(() => VE.metronome.start(state.bpm, i => {
    const d = $$('#beatDots i'); d.forEach((e, k) => e.classList.toggle('on', k === (i % 4)));
  }));
}

function measureMic(lv) {
  const crit = lv.criteria;
  const mstate = { bpm: lv.bpm || 60, on: !!lv.bpm };
  view.innerHTML = `
    ${topbar('Đo · Level ' + lv.id, '#/level/' + lv.id, `<button class="campill" id="camBtn" aria-pressed="false" aria-disabled="true" aria-label="Camera tay, thử nghiệm">${I.cam}<span><b>Camera tay</b><i>thử nghiệm</i></span></button>`)}
    <div class="fitstack">
      <div class="card notecard"><div class="note-name num" id="nName">—</div><div class="note-cents"><div class="c num" id="nCents">—<small>cents</small></div><div class="s" id="nStat">Chưa bắt đầu</div></div></div>
      ${metroBlock(lv, mstate)}
      <div class="graph"><canvas id="cv" aria-label="Đồ thị cao độ 4 giây gần nhất"></canvas></div>
      <div class="cam" id="camBox" hidden><div class="mirror"><video id="camVid" playsinline muted autoplay></video><canvas id="camOv"></canvas></div><canvas id="miniCv" class="mini" aria-label="Dải cao độ nhỏ"></canvas><span class="exp">Thử nghiệm — chỉ tham khảo</span></div>
      <div id="micErr"></div>
      <div class="mgrid" id="tiles">${tilesHTML(crit, null)}</div>
      <div class="chips" id="chips" hidden></div>
      <div class="hold"><div class="h"><span id="reason" aria-live="polite">Giữ đạt liên tục</span><span class="num" id="holdTxt">0.0 / ${crit ? crit.holdSec : 0} s</span></div>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i id="holdBar" style="width:0%"></i></div></div>
    </div>
    <div class="cta"><button class="btn btn-gold bigbtn" id="goBtn">${I.play}<span>Bắt đầu</span></button></div>`;
  const graph = createGraph($('#cv'), lv);
  const mini = createGraph($('#miniCv'), lv, { mini: true });
  let session = null, running = false, lastFrame = null, raf = 0, logged = false, startTs = 0, leaving = false;
  const setBtn = r => { $('#goBtn').innerHTML = r ? `${I.stop}<span>Dừng</span>` : `${I.play}<span>Bắt đầu</span>`; $('#goBtn').setAttribute('aria-label', r ? 'Dừng và xem kết quả' : 'Bắt đầu đo'); };
  bindMetro(lv, mstate, () => running);

  /* ---- camera tay (thử nghiệm, SPEC §9.1) ---- */
  let gone = false;
  const cam = { on: false, avail: false, busy: false, lm: null, lmCb: null, hmCb: null, why: 'Cần mở app qua máy chủ trên Mac để dùng camera.' };
  const camBtn = $('#camBtn');
  function camSetAvail(ok) { cam.avail = ok; camBtn.setAttribute('aria-disabled', ok ? 'false' : 'true'); camBtn.classList.toggle('dis', !ok); }
  camSetAvail(false);
  Promise.resolve(safe(() => VE.hand && VE.hand.available ? VE.hand.available() : false, false)).then(ok => { if (!gone) camSetAvail(!!ok); }, () => {});
  const CAM_ERR = { NO_SERVER: 'Cần mở app qua máy chủ trên Mac để dùng camera.', INSECURE: 'Camera chỉ chạy khi mở app qua https.', DENIED: 'Cho phép camera cho trang này trong Cài đặt Safari.', NO_CAMERA: 'Không tìm thấy camera.', MODEL: 'Thiếu file model nhìn tay trên máy chủ.' };
  function chipsHTML(m) {
    if (!m || !m.tracking) return `<div class="chip3 note">${esc((m && m.note) || 'Đang chờ camera…')}</div>`;
    const c = (label, val, ok) => `<div class="chip3"><span class="cl">${label}</span><b>${ok === true ? '✓ ' : ok === false ? '✕ ' : ''}${esc(val || '—')}</b></div>`;
    return c('Nguồn rung', m.sourceLabel, null) + c('Khớp đầu ngón', m.dipLabel, m.dipOk) + c('Đồng bộ', m.syncLabel, m.syncOk);
  }
  function drawOverlay() {
    const cv = $('#camOv'); if (!cv) return;
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const d = cam.lm; if (!d || !d.hands) return;
    const vw = d.vw || 640, vh = d.vh || 480, sc = Math.max(W / vw, H / vh), ox = (W - vw * sc) / 2, oy = (H - vh * sc) / 2;
    const conns = (window.VE && VE.HAND_CONNECTIONS) || [];
    const gold = getComputedStyle(document.documentElement).getPropertyValue('--g-line').trim() || '#ffc247';
    d.hands.forEach((h, i) => {
      const act = i === d.active, P = p => [ox + p.x * vw * sc, oy + p.y * vh * sc];
      ctx.globalAlpha = act ? 1 : 0.35; ctx.strokeStyle = act ? gold : '#ffffff'; ctx.fillStyle = act ? gold : '#ffffff';
      ctx.lineWidth = act ? 3.5 : 1.5; ctx.lineCap = 'round';
      ctx.beginPath(); conns.forEach(([a, b]) => { if (!h[a] || !h[b]) return; const A = P(h[a]), B = P(h[b]); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); }); ctx.stroke();
      h.forEach(p => { const q = P(p); ctx.beginPath(); ctx.arc(q[0], q[1], act ? 4.5 : 2.5, 0, 6.2832); ctx.fill(); });
    });
    ctx.globalAlpha = 1;
  }
  function camShow(on) {
    cam.on = on; camBtn.setAttribute('aria-pressed', on); camBtn.classList.toggle('on', on);
    $('.graph', view).hidden = on; $('#camBox').hidden = !on; $('#chips').hidden = !on;
    if (on) $('#chips').innerHTML = chipsHTML(null);
  }
  function camStop() {
    if (cam.lmCb) { safe(() => VE.hand.off('landmarks', cam.lmCb)); cam.lmCb = null; }
    if (cam.hmCb) { safe(() => VE.hand.off('metrics', cam.hmCb)); cam.hmCb = null; }
    safe(() => VE.hand && VE.hand.stop && VE.hand.stop());
    cam.lm = null; const v = $('#camVid'); if (v) safe(() => { v.srcObject = null; });
  }
  async function camToggle() {
    if (cam.busy) return;
    if (!cam.avail) { toast(cam.why); return; }
    if (cam.on) { camStop(); camShow(false); return; }
    cam.busy = true; camBtn.classList.add('busy');
    try {
      cam.lmCb = d => { cam.lm = d; }; cam.hmCb = m => { if (cam.on) { $('#chips').innerHTML = chipsHTML(m); if (m.tracking && m.source) cam.lastHand = { sourceLabel: m.sourceLabel, dipLabel: m.dipLabel, syncLabel: m.syncLabel }; } };
      VE.hand.on('landmarks', cam.lmCb); VE.hand.on('metrics', cam.hmCb);
      camShow(true);
      await VE.hand.start($('#camVid'));
    } catch (e) {
      camStop(); if (!gone) { camShow(false); toast(CAM_ERR[e && e.code] || 'Không mở được camera.'); }
    }
    cam.busy = false; camBtn.classList.remove('busy');
  }
  camBtn.addEventListener('click', camToggle);

  function loop() {
    const f = lastFrame;
    if (f && f.voiced && f.noteName) {
      $('#nName').textContent = f.noteName;
      const c = f.centsFromNote;
      $('#nCents').innerHTML = (c == null ? '—' : (c >= 0 ? '+' : '−') + Math.abs(Math.round(c))) + '<small>cents</small>';
      const r = f.centsFromRef;
      const inBand = r != null && (crit ? (crit.center === false ? Math.abs(r) <= crit.width[1] / 2 : (r <= 6 && r >= -crit.width[1] - 6)) : true);
      $('#nStat').textContent = inBand ? '✓ Trong vùng' : '✕ Ngoài vùng';
    } else if (running) { $('#nName').textContent = '—'; $('#nCents').innerHTML = '—<small>cents</small>'; $('#nStat').textContent = 'Chưa nghe thấy tiếng'; }
    if (!cam.on) graph.draw(); else { mini.draw(); drawOverlay(); }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  function onMetrics(m) {
    $('#tiles').innerHTML = tilesHTML(crit, m);
    safe(() => VE.hand && VE.hand.setAudioRate && VE.hand.setAudioRate(m.valid ? m.rate : null));
    const held = m.heldSec || 0, need = m.holdNeeded || (crit && crit.holdSec) || 1;
    $('#holdTxt').textContent = `${f1(held)} / ${f1(need)} s`;
    $('#holdBar').style.width = clamp(held / need * 100, 0, 100) + '%';
    const R = { NO_SIGNAL: 'Chưa nghe thấy tiếng', TOO_SHORT: 'Đang thu thập…', NO_CYCLES: 'Chưa thấy chu kỳ rung' };
    $('#reason').textContent = m.holdPaused ? 'Đổi cung: đồng hồ tạm dừng, rung lại ngay' : m.valid ? (m.allOk ? '✓ Đang đạt — giữ tiếp!' : 'Giữ đạt liên tục') : (R[m.reason] || 'Giữ đạt liên tục');
  }
  function leaveToResult(r) {
    if (leaving) return; leaving = true; WL.release();
    if (!logged) { logged = true; safe(() => VE.store.logPractice(r.durationSec || 0)); }
    lastResult = { levelId: lv.id, pass: !!r.pass, metrics: r.metrics, durationSec: r.durationSec, gate: r.gate, hand: cam.on && cam.lastHand ? cam.lastHand : null };
    location.hash = '#/result/' + lv.id;
  }
  async function start() {
    $('#micErr').innerHTML = '';
    graph.clear(); mini.clear(); lastFrame = null;
    try {
      session = VE.createSession(lv, { demo: DEMO });
      session.on('frame', f => { lastFrame = f; graph.push(f); mini.push(f); });
      session.on('metrics', onMetrics);
      session.on('done', leaveToResult);
      WL.acquire(); running = true; setBtn(true); startTs = Date.now();
      await session.start();
      if (mstate.on) startMetro(mstate);
    } catch (e) {
      running = false; setBtn(false); WL.release();
      safe(() => session && session.stop());
      session = null;
      $('#micErr').innerHTML = micErrorHTML(e && e.code);
    }
  }
  $('#goBtn').addEventListener('click', () => {
    if (running) { running = false; setBtn(false); WL.release(); safe(() => VE.metronome.stop()); safe(() => session.stop()); }
    else start();
  });
  return () => {
    gone = true; camStop();
    cancelAnimationFrame(raf); WL.release();
    safe(() => VE.metronome.stop());
    if (session) {
      if (!logged && startTs) { logged = true; safe(() => VE.store.logPractice((Date.now() - startTs) / 1000)); }
      leaving = true; // tránh điều hướng lại khi stop() bắn 'done'
      safe(() => session.stop());
      session = null;
    }
  };
}

function fmtTime(sec) { sec = Math.max(0, Math.round(sec)); return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); }

function measureSelf(lv) {
  const need = lv.selfSeconds || 60, checks = lv.selfCheck || [];
  const mstate = { bpm: lv.bpm || 60, on: !!lv.bpm };
  view.innerHTML = `
    ${topbar('Tự tập · Level ' + lv.id, '#/level/' + lv.id)}
    <div class="fitstack selfstack">
      <div class="card timer"><div class="s">Thời gian tập (tối thiểu ${fmtTime(need)})</div><div class="t num" id="tm">00:00</div>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i id="tbar" style="width:0%"></i></div></div>
      ${lv.bpm ? metroBlock(lv, mstate) : ''}
      <button class="btn btn-gold" id="goBtn">${I.play}<span>Bắt đầu tập</span></button>
      <div><div class="stack" style="margin-top:0" id="chk">${checks.map((c, i) => `<button class="check" data-i="${i}" role="checkbox" aria-checked="false"><span class="box">${I.check}</span><span>${esc(c)}</span></button>`).join('')}</div></div>
      <p class="msg" id="hint" aria-live="polite"></p>
      <button class="btn btn-blue" id="doneBtn" disabled>${I.check}Hoàn thành</button>
    </div>`;
  let elapsed = 0, running = false, last = 0, raf = 0, logged = false, finished = false;
  const ticked = new Set();
  if (lv.bpm) bindMetro(lv, mstate, () => running);
  function refresh() {
    $('#tm').textContent = fmtTime(elapsed);
    $('#tbar').style.width = clamp(elapsed / need * 100, 0, 100) + '%';
    const timeOk = elapsed >= need, chkOk = ticked.size >= checks.length;
    $('#doneBtn').disabled = !(timeOk && chkOk);
    $('#hint').textContent = !timeOk ? `Còn ${Math.ceil(need - elapsed)} giây tập nữa.` : !chkOk ? 'Tick đủ các ý tự kiểm tra để hoàn thành.' : '✓ Sẵn sàng — bấm Hoàn thành.';
  }
  function tick(now) {
    if (running) { elapsed += (now - last) / 1000; last = now; refresh(); }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  refresh();
  $('#goBtn').addEventListener('click', () => {
    running = !running; last = performance.now(); if (running) WL.acquire(); else WL.release();
    $('#goBtn').innerHTML = running ? `${I.stop}<span>Tạm dừng</span>` : `${I.play}<span>Tiếp tục tập</span>`;
    if (lv.bpm && mstate.on) { if (running) startMetro(mstate); else safe(() => VE.metronome.stop()); }
  });
  $$('.check', view).forEach(b => b.addEventListener('click', () => {
    const i = Number(b.dataset.i), on = !ticked.has(i);
    on ? ticked.add(i) : ticked.delete(i);
    b.classList.toggle('on', on); b.setAttribute('aria-checked', on); refresh();
  }));
  $('#doneBtn').addEventListener('click', () => {
    if (finished) return; finished = true; running = false; WL.release();
    const dur = Math.round(elapsed);
    const gate = safe(() => VE.store.recordTake(lv.id, { pass: true, durationSec: dur, mode: 'self' }), null);
    logged = true; safe(() => VE.store.logPractice(dur));
    lastResult = { levelId: lv.id, pass: true, self: true, metrics: null, durationSec: dur, gate };
    location.hash = '#/result/' + lv.id;
  });
  return () => {
    cancelAnimationFrame(raf); WL.release(); safe(() => VE.metronome.stop());
    if (!logged && elapsed > 1) safe(() => VE.store.logPractice(elapsed));
  };
}


/* ================= HLV AI (SPEC §8.1, §9.2) ================= */
const COACH_ERR = { NO_SERVER: 'Cần mở app qua máy chủ trên Mac', AI_DOWN: 'AI trên Mac chưa chạy (mở Ollama)', TIMEOUT: 'AI trả lời quá lâu, thử lại', AI_ERROR: 'AI gặp lỗi, thử lại', AUTH: 'Sai hoặc thiếu mã HLV AI — nhập trong Cài đặt' };
function serverHealth() {
  return Promise.resolve().then(() => VE.server && VE.server.health ? VE.server.health() : null).then(h => h || { ok: false, hand: false, coach: { active: null } }, () => ({ ok: false, hand: false, coach: { active: null } }));
}
const coachActive = h => !!(h && h.ok && h.coach && h.coach.active);
// Lý do cụ thể từ máy chủ (vd. "Claude lỗi 403 · permission_error: …") — chỉ hiện khi khác câu chung
const coachDetail = e => { const m = e && e.message ? String(e.message) : ''; return m && m !== (COACH_ERR[e.code] || '') && e.code !== 'AUTH' ? 'Chi tiết: ' + m.slice(0, 220) : ''; };
// ask: () => Promise<{text, provider, model, ms}>; ctl: { gone } ; cache: optional object to remember the answer
function coachRun(host, ask, ctl, cache) {
  const t0 = Date.now();
  host.innerHTML = `<div class="card coach" aria-live="polite"><div class="coach-h">${I.bulb}<b>HLV AI</b></div><div class="coach-body"><span class="spin" aria-hidden="true"></span><span class="cl">HLV đang xem số liệu…</span></div></div>`;
  const lbl = $('.cl', host);
  const tick = setInterval(() => { if (ctl.gone || !lbl.isConnected) { clearInterval(tick); return; } lbl.textContent = `HLV đang xem số liệu… ${Math.floor((Date.now() - t0) / 1000)} s`; }, 1000);
  Promise.resolve().then(ask).then(res => {
    clearInterval(tick); if (ctl.gone) return;
    if (cache) cache.res = res;
    coachShow(host, res, () => coachRun(host, ask, ctl, cache));
  }, e => {
    clearInterval(tick); if (ctl.gone) return;
    const msg = COACH_ERR[e && e.code] || COACH_ERR.AI_ERROR;
    host.innerHTML = `<div class="card coach err"><div class="coach-h">${I.warn}<b>HLV AI</b></div><p class="coach-err"></p><button class="btn btn-ghost btn-sm" type="button">${I.retry}Thử lại</button></div>`;
    $('.coach-err', host).textContent = msg;
    const det = coachDetail(e);
    if (det) { const d = document.createElement('p'); d.className = 'coach-meta'; d.textContent = det; $('.coach-err', host).after(d); }
    if (e && e.code === 'AUTH') {
      const a = document.createElement('a'); a.className = 'btn btn-gold btn-sm'; a.href = '#/settings'; a.style.marginBottom = '8px'; a.textContent = 'Mở Cài đặt';
      host.querySelector('button').before(a);
    }
    $('button', host).addEventListener('click', () => coachRun(host, ask, ctl, cache));
  });
}
function coachShow(host, res, rerun) {
  host.innerHTML = `<div class="card coach"><div class="coach-h">${I.bulb}<b>HLV AI</b></div><p class="coach-text"></p><div class="coach-meta"></div><button class="btn btn-ghost btn-sm" type="button">${I.retry}Hỏi lại</button></div>`;
  $('.coach-text', host).textContent = String(res.text == null ? '' : res.text);
  $('.coach-meta', host).textContent = [res.provider, res.model, res.ms != null ? f1(res.ms / 1000) + ' s' : null].filter(Boolean).join(' · ');
  $('button', host).addEventListener('click', rerun);
}

/* ================= RESULT ================= */
const TROPHY = '<svg viewBox="0 0 150 150"><defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#e08a00"/></linearGradient></defs>' +
  '<path d="M42 30c-14 0-20 8-18 20 2 12 12 20 24 22M108 30c14 0 20 8 18 20-2 12-12 20-24 22" fill="none" stroke="#e8a52a" stroke-width="7" stroke-linecap="round"/>' +
  '<path d="M42 22h66v30c0 22-14 36-33 36S42 74 42 52z" fill="url(#tg)"/><rect x="68" y="86" width="14" height="22" fill="#d98a10"/><rect x="50" y="108" width="50" height="12" rx="5" fill="url(#tg)"/>' +
  '<circle cx="104" cy="104" r="22" fill="#2fa14a" stroke="#fff" stroke-width="4"/><path d="M93 104l8 8 14-16" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const MISS = '<svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="52" fill="rgba(255,150,100,.14)" stroke="#ff9a74" stroke-width="5"/><path d="M52 52l46 46M98 52L52 98" stroke="#ff9a74" stroke-width="9" stroke-linecap="round"/></svg>';

function hintFor(m) {
  if (!m || !m.valid || !m.checks) return 'Chưa thu đủ tín hiệu. Hãy giữ nốt rõ, kéo cung đều và rung liên tục rồi thử lại.';
  const k = m.checks;
  if (k.rate && !k.rate.ok) return k.rate.value < k.rate.min ? `Tốc độ rung còn chậm (${f1(k.rate.value)} Hz). Bật metronome và đếm đủ số rung mỗi phách, tăng nhẹ từng chút.` : `Tốc độ rung hơi nhanh (${f1(k.rate.value)} Hz). Thả lỏng cánh tay, rung chậm lại theo metronome.`;
  if (k.regularity && !k.regularity.ok) return 'Rung chưa đều. Giảm tốc độ một chút, tập đều từng nhịp rồi mới tăng dần.';
  if (k.width && !k.width.ok) return k.width.value < k.width.min ? `Độ rộng còn hẹp (${f0(k.width.value)} cents). Cho ngón lăn nhiều hơn về phía cuộn đàn.` : `Độ rộng quá lớn (${f0(k.width.value)} cents). Thu nhỏ biên độ, rung nhẹ và gọn hơn.`;
  if (k.center && !k.center.ok) return m.center === 'above' ? 'Đang rung lên trên nốt. Để nốt chuẩn là điểm cao nhất, chỉ rung xuống phía dưới.' : 'Cả nốt đang thấp hơn nốt chuẩn. Kiểm tra lại vị trí ngón rồi rung xuống từ nốt đúng.';
  return 'Gần đạt rồi — giữ ổn định lâu hơn một chút.';
}

function screenResult(arg) {
  const lv = levelById(arg);
  const r = lastResult && lastResult.levelId === Number(arg) ? lastResult : null;
  if (!lv) { location.hash = '#/home'; return; }
  const gate = (r && r.gate) || safe(() => VE.store.gate(lv.id), null);
  const pass = r ? r.pass : false;
  const next = levelById(lv.id + 1);
  const needP = (gate && gate.neededPasses) || 1, needD = (gate && gate.neededDays) || 1;
  const dots = Array.from({ length: needP }, (_, i) => i).map(i => `<i class="${gate && i < gate.passCount ? 'on' : ''}">${gate && i < gate.passCount ? '✓' : ''}</i>`).join('');
  const tiles = r && r.metrics ? `<div class="mgrid">${tilesHTML(lv.criteria, r.metrics)}</div>` : '';
  const hint = r && r.self ? 'Tốt lắm! Mỗi ngày tập đều sẽ giúp bạn qua level nhanh hơn.' : (pass ? 'Tiếp tục duy trì nhịp đều, bạn sẽ lên level cao hơn!' : hintFor(r && r.metrics));
  view.innerHTML = `
    ${topbar('Kết quả', '#/level/' + lv.id)}
    <div class="res-hero ${pass ? '' : 'fail'}">${pass ? TROPHY : MISS}<h1>${r ? (pass ? 'Đạt rồi!' : 'Chưa đạt') : 'Chưa có lần đo'}</h1>
      <p>${r ? (pass ? esc(lv.title) : 'Chưa sao, thử lại nhé!') : 'Hãy đo level này để xem kết quả.'}</p></div>
    <div class="stack" style="margin-top:12px">
      ${tiles}
      ${gate ? `<div class="card" style="text-align:center"><b class="num">Lần đạt ${gate.passCount}/${needP}${needD > 1 ? ` · Ngày ${gate.dayCount}/${needD}` : ''}</b><div class="pdots" aria-hidden="true">${dots}</div></div>` : ''}
      ${gate && gate.justPassed ? `<div class="card banner crit"><span class="st ok" style="padding:4px">${I.check}</span><div><b>Chúc mừng! Bạn đã qua Level ${lv.id}.</b><p class="muted">${next ? `Level ${next.id} là level tiếp theo của bạn.` : 'Bạn đã hoàn thành toàn bộ lộ trình!'}${lv.id > 1 ? ' Các level trước đó cũng được tính là đã qua.' : ''}</p></div></div>` : ''}
      ${r ? `<div class="card note">${pass ? I.bulb : I.warn}<div><b>${pass ? 'Gợi ý' : 'Cách sửa'}</b><p>${esc(hint)}</p></div></div>` : ''}
      <div class="btnrow"><a class="btn btn-blue btn-sm" href="#/measure/${lv.id}">${I.retry}Thử lại</a><a class="btn btn-purple btn-sm" href="#/level/${lv.id}">${I.home}Về level</a></div>
      ${gate && gate.justPassed && next ? `<a class="btn btn-gold" href="#/level/${next.id}">Sang Level ${next.id} ›</a>` : ''}
    </div>`;
  const ctl = { gone: false };
  if (r && !r.self) {
    const host = document.createElement('div'); host.id = 'coachHost';
    const anchor = $('.btnrow', view); anchor.parentNode.insertBefore(host, anchor);
    serverHealth().then(h => {
      if (ctl.gone) return;
      if (coachActive(h)) coachRun(host, () => VE.coach.ask({ kind: 'take', levelId: lv.id, take: r }), ctl);
      else host.innerHTML = '<p class="faintline">HLV AI cần máy chủ trên Mac.</p>';
    });
  }
  return () => { ctl.gone = true; };
}

/* ================= PROGRESS ================= */
let progDays = 7;
function screenProgress() {
  function render() {
    const daily = safe(() => VE.store.daily(progDays), []) || [];
    const heat = safe(() => VE.store.heat(7), []) || [];
    const takes = (safe(() => VE.store.takes(progDays), []) || []).slice(0, 15);
    const hasData = daily.some(d => d.rate != null || d.width != null);
    view.innerHTML = `
      ${topbar('Tiến độ')}
      <div class="seg" role="group" aria-label="Khoảng thời gian">${[7, 30, 90].map(d => `<button data-d="${d}" aria-pressed="${d === progDays}">${d} ngày</button>`).join('')}</div>
      <div class="stack" style="margin-top:12px">
        <div class="card chart"><div class="legend"><span><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" fill="#ffb43a"/></svg>Tốc độ (Hz)</span><span><svg viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" fill="#5eb0ff"/></svg>Độ rộng (cents)</span></div>
          ${chartSVG(daily)}${hasData ? '' : '<p class="empty">Chưa có dữ liệu — hãy đo vài lần để thấy biểu đồ nhé.</p>'}</div>
        <div class="card"><div class="setting-h">Lịch tập luyện (phút)</div>${heatHTML(heat)}</div>
        <div id="weekBox"><button class="btn btn-ghost" id="weekBtn" disabled>${I.bulb}Nhận xét tuần của HLV AI</button><p class="faintline" id="weekNote"></p><div id="weekHost"></div></div>
        <div><h2 class="sec-title">Lần đo gần đây</h2>${takes.length ? takes.map(takeRow).join('') : '<div class="card empty">Chưa có lần đo nào.</div>'}</div>
      </div>`;
    $$('.seg button', view).forEach(b => b.addEventListener('click', () => { progDays = Number(b.dataset.d); render(); }));
    const host = $('#weekHost'), btn = $('#weekBtn');
    const ask = () => VE.coach.ask({ kind: 'week' });
    if (weekCache.res) coachShow(host, weekCache.res, () => coachRun(host, ask, ctl, weekCache));
    serverHealth().then(h => {
      if (ctl.gone || !btn.isConnected) return;
      if (coachActive(h)) { btn.disabled = false; btn.addEventListener('click', () => coachRun(host, ask, ctl, weekCache)); }
      else $('#weekNote').textContent = h.ok ? COACH_ERR.AI_DOWN + '.' : COACH_ERR.NO_SERVER + ' để dùng HLV AI.';
    });
  }
  const ctl = { gone: false };
  render();
  return () => { ctl.gone = true; };
}
const weekCache = {};
function chartSVG(daily) {
  const W = 340, H = 210, L = 38, Rr = 302, T = 14, B = 172, n = daily.length;
  const maxR = Math.max(0, ...daily.map(d => d.rate || 0)), maxW = Math.max(0, ...daily.map(d => d.width || 0));
  const hzMax = Math.max(6, Math.ceil(maxR) + 1), cMax = Math.max(60, Math.ceil(maxW / 20) * 20 + 20);
  const X = i => n <= 1 ? (L + Rr) / 2 : L + i / (n - 1) * (Rr - L), Y = (v, mx) => B - v / mx * (B - T);
  let g = '';
  for (let k = 0; k <= 4; k++) {
    const y = T + k * (B - T) / 4;
    g += `<line x1="${L}" x2="${Rr}" y1="${y}" y2="${y}" stroke="var(--g-grid)"/>` +
      `<text x="${L - 6}" y="${y + 4}" text-anchor="end" font-size="11" font-weight="700" fill="#e09a20">${(hzMax * (1 - k / 4)).toFixed(hzMax % 4 ? 1 : 0).replace('.', ',')}</text>` +
      `<text x="${Rr + 6}" y="${y + 4}" font-size="11" font-weight="700" fill="var(--blue)">${Math.round(cMax * (1 - k / 4))}</text>`;
  }
  const step = n <= 7 ? 1 : n <= 30 ? 5 : 15;
  daily.forEach((d, i) => { if ((n - 1 - i) % step === 0) g += `<text x="${X(i)}" y="${B + 18}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--muted)">${esc(n <= 7 ? d.label : (d.dayKey || '').slice(8) + '/' + (d.dayKey || '').slice(5, 7))}</text>`; });
  const line = (key, mx, color, shape) => {
    let path = '', open = false, marks = '';
    daily.forEach((d, i) => {
      const v = d[key]; if (v == null) { open = false; return; }
      const x = X(i), y = Y(v, mx);
      path += (open ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); open = true;
      if (n <= 30) marks += shape === 'c' ? `<circle cx="${x}" cy="${y}" r="4" fill="${color}"/>` : `<rect x="${x - 3.6}" y="${y - 3.6}" width="7.2" height="7.2" fill="${color}"/>`;
    });
    return `<path d="${path}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>${marks}`;
  };
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ tốc độ và độ rộng vibrato theo ngày">${g}${line('width', cMax, '#5eb0ff', 's')}${line('rate', hzMax, '#ffb43a', 'c')}</svg>`;
}
function heatHTML(heat) {
  const cls = m => !m ? '' : m < 5 ? 'l1' : m < 15 ? 'l2' : 'l3';
  const rows = [['sang', 'Sáng'], ['chieu', 'Chiều'], ['toi', 'Tối']];
  if (!heat.length) heat = Array.from({ length: 7 }, () => ({ label: '', sang: 0, chieu: 0, toi: 0 }));
  return `<div class="heat"><span></span>${heat.map(d => `<span class="hd">${esc(d.label)}</span>`).join('')}` +
    rows.map(([k, nm]) => `<span>${nm}</span>` + heat.map(d => { const m = d[k] || 0; return `<span class="c num ${cls(m)}" aria-label="${nm} ${Math.round(m)} phút">${m ? Math.round(m) : ''}</span>`; }).join('')).join('') + '</div>' +
    '<div class="hlegend">0<i></i>1–4<i class="l1"></i>5–14<i class="l2"></i>15+<i class="l3"></i>phút</div>';
}
function takeRow(t) {
  const m = t.rate != null ? `${f1(t.rate)} Hz · ${f0(t.regularity)}%` : `Tự tập · ${f0(t.durationSec)} giây`;
  return `<div class="card take"><span class="st ${t.pass ? 'ok' : 'bad'}" style="margin:0">${t.pass ? I.check + 'Đạt' : I.cross + 'Chưa'}</span><div class="d">Level ${t.levelId}<small>${dateLabel(t.ts)}</small></div><div class="m num">${m}</div></div>`;
}

/* ================= CALIBRATE ================= */
function screenCalibrate() {
  const last = safe(() => VE.store.lastCalibration(), null);
  const C = 2 * Math.PI * 88;
  view.innerHTML = `
    ${topbar('Hiệu chuẩn', '#/settings')}
    <div class="stack">
      <div class="card" style="text-align:center">
        <p>Bấm bắt đầu, <b>im lặng 1 giây</b> để đo tiếng ồn phòng, rồi kéo dây <b>A buông</b> đều trong 5 giây.</p>
        <div class="ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" fill="none" stroke="var(--line)" stroke-width="10"/><circle id="rg" cx="100" cy="100" r="88" fill="none" stroke="var(--gold)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
          <div class="mid"><div><b class="num" id="liveHz">— Hz</b><br><span id="calSt">Sẵn sàng</span></div></div></div>
        <div id="calErr"></div>
        <button class="btn btn-gold" id="calBtn">${I.mic}Bắt đầu hiệu chuẩn</button>
      </div>
      <div id="calRes"></div>
    </div>`;
  let busy = false, gone = false;
  function show(res, old) {
    if (!res) { $('#calRes').innerHTML = '<div class="card empty">Chưa có kết quả hiệu chuẩn.</div>'; return; }
    const ok = res.ok;
    $('#calRes').innerHTML = `<div class="card"><div class="row between" style="margin-bottom:10px"><b>${old ? 'Lần hiệu chuẩn trước' : 'Kết quả'}</b><span class="st ${ok ? 'ok' : 'bad'}">${ok ? I.check + 'Đạt' : I.cross + 'Chưa'}</span></div>
      <div class="kv"><div class="tile"><div class="l">Tần số</div><div class="v num">${f1(res.hz)}<small>Hz</small></div><div class="r">${esc(res.noteName || '')} ${res.centsFromNote != null ? (res.centsFromNote >= 0 ? '+' : '−') + Math.abs(Math.round(res.centsFromNote)) + ' cents' : ''}</div></div>
      <div class="tile"><div class="l">Độ ổn định</div><div class="v num">${f0(res.stabilityPct)}<small>%</small></div></div>
      <div class="tile span2"><div class="l">Mức ồn nền</div><div class="v num">${res.noiseDb == null ? '—' : f0(res.noiseDb)}<small>dB</small></div></div></div>
      ${res.message ? `<p class="muted" style="margin-top:10px">${esc(res.message)}</p>` : ''}</div>`;
  }
  show(last, true);
  $('#calBtn').addEventListener('click', async () => {
    if (busy) return; busy = true; $('#calBtn').disabled = true; $('#calErr').innerHTML = ''; $('#calSt').textContent = 'Đang nghe…';
    try {
      const res = await VE.calibrate({ seconds: 5, demo: DEMO, onProgress: (frac, hz, phase) => {
        if (gone) return;
        $('#rg').setAttribute('stroke-dashoffset', String(C * (1 - clamp(frac, 0, 1))));
        $('#liveHz').textContent = hz ? f1(hz) + ' Hz' : '— Hz';
        $('#calSt').textContent = phase === 'quiet' ? 'Im lặng… đang đo tiếng ồn' : 'Kéo dây A buông';
      } });
      if (gone) return;
      safe(() => VE.store.saveCalibration(res));
      $('#calSt').textContent = res.ok ? '✓ Xong' : '✕ Chưa tốt'; show(res, false);
    } catch (e) { if (!gone) { $('#calErr').innerHTML = micErrorHTML(e && e.code); $('#calSt').textContent = 'Lỗi'; } }
    if (!gone) { busy = false; $('#calBtn').disabled = false; }
  });
  return () => { gone = true; };
}

/* ================= SETTINGS ================= */
function screenSettings() {
  const s = safe(() => VE.settings.get(), { a4: 440, instrument: 'violin', sensitivity: 0.7, theme: 'dark' });
  const opts = (key, list) => `<div class="opts" role="group">${list.map(([v, t]) => `<button class="opt" data-k="${key}" data-v="${v}" aria-pressed="${String(s[key]) === String(v)}">${t}</button>`).join('')}</div>`;
  view.innerHTML = `
    ${topbar('Cài đặt')}
    <div class="stack">
      <div class="card"><div class="setting-h">Chuẩn A4</div>${opts('a4', [[440, '440 Hz'], [442, '442 Hz']])}</div>
      <div class="card"><div class="setting-h">Nhạc cụ</div>${opts('instrument', [['violin', 'Violin'], ['viola', 'Viola']])}</div>
      <div class="card"><div class="row between"><div class="setting-h" style="margin:0">Độ nhạy micro</div><b class="num" id="senV">${Math.round(s.sensitivity * 100)}%</b></div>
        <input type="range" id="sen" min="0" max="100" value="${Math.round(s.sensitivity * 100)}" aria-label="Độ nhạy micro"></div>
      <div class="card"><div class="setting-h">Tốc độ qua level</div><div class="prov" role="radiogroup" aria-label="Tốc độ qua level">${(VE.PASS_MODES || [{ id: 'fast', label: 'Nhanh', desc: 'Đạt 1 lần là qua' }, { id: 'standard', label: 'Chuẩn', desc: 'Đạt 3 lần' }, { id: 'thorough', label: 'Kỹ', desc: 'Đạt 3 lần trên 2 ngày khác nhau' }]).map(m => `<button class="prow" role="radio" data-pm="${m.id}" aria-checked="${(s.passMode || 'fast') === m.id}"><span class="rd"></span><span class="pt"><b>${esc(m.label)}</b><small>${esc(m.desc)}</small></span></button>`).join('')}</div></div>
      <div class="card"><div class="setting-h">Giao diện</div>${opts('theme', [['dark', 'Tối'], ['light', 'Sáng']])}</div>
      <div class="card" id="aiCard"><div class="setting-h">HLV AI &amp; máy chủ</div><p class="faintline" style="margin:0">Đang kiểm tra máy chủ…</p></div>
      <a class="btn btn-ghost" href="#/calibrate">${I.mic}Hiệu chuẩn micro</a>
      <button class="btn btn-ghost danger" id="reset">Đặt lại tiến độ</button>
      <div class="card about">${logoSVG}<div><b>Vibrato Pro</b><div class="muted" style="font-size:14px">Phiên bản 1.0.0</div></div></div>
    </div>`;
  $$('.opt', view).forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.k; let v = b.dataset.v; if (k === 'a4') v = Number(v);
    safe(() => VE.settings.set({ [k]: v }));
    $$(`.opt[data-k="${k}"]`, view).forEach(o => o.setAttribute('aria-pressed', o === b));
    if (k === 'theme') applyTheme();
  }));
  $$('[data-pm]', view).forEach(b => b.addEventListener('click', () => {
    safe(() => VE.settings.set({ passMode: b.dataset.pm }));
    $$('[data-pm]', view).forEach(o => o.setAttribute('aria-checked', o === b));
  }));
  $('#sen').addEventListener('input', e => { $('#senV').textContent = e.target.value + '%'; safe(() => VE.settings.set({ sensitivity: Number(e.target.value) / 100 })); });
  $('#reset').addEventListener('click', () => {
    if (confirm('Xoá toàn bộ tiến độ luyện tập? Việc này không hoàn tác được.')) { safe(() => VE.store.reset()); safe(() => VE.legato && VE.legato.store.reset()); location.hash = '#/home'; route(); }
  });
  let gone = false;
  serverHealth().then(async h => {
    if (gone) return;
    const card = $('#aiCard'); if (!card) return;
    const handOk = h.ok && h.hand && !!(await Promise.resolve(safe(() => VE.hand && VE.hand.available ? VE.hand.available() : false, false)).catch(() => false));
    const co = (h && h.coach) || {}, ol = co.ollama || {}, cl = co.claude || {};
    const row = (k, ok, txt) => `<div class="srow"><span>${k}</span><span class="st ${ok === true ? 'ok' : ok === false ? 'bad' : 'na'}">${ok === true ? I.check : ok === false ? I.cross : ''}${esc(txt)}</span></div>`;
    const activeTxt = co.active ? (co.active === 'ollama' ? 'Ollama' : co.active === 'claude' ? 'Claude' : String(co.active)) + ' · ' + ((co.active === 'claude' ? cl.model : ol.model || cl.model) || '—') : 'Chưa có AI nào chạy';
    const cur = safe(() => VE.settings.get().coachProvider, 'auto') || 'auto';
    const curPass = String(safe(() => VE.settings.get().coachPass, '') || '');
    const noSrv = 'Cần mở app qua máy chủ trên Mac';
    const choices = [
      ['auto', 'Tự động', '', true],
      ['ollama', 'Ollama trên Mac', h.ok ? (ol.ok ? '' : 'Ollama chưa chạy — mở Ollama trên Mac') : noSrv, !!(h.ok && ol.ok)],
      ['claude', 'Claude API', h.ok ? (cl.configured ? '' : 'Chưa cấu hình — thêm API key vào config.json trên Mac') : noSrv, !!(h.ok && cl.configured)]
    ];
    card.innerHTML = `<div class="setting-h">HLV AI &amp; máy chủ</div>
      ${row('Máy chủ', !!h.ok, h.ok ? 'Đã kết nối' : 'Không có (app đang mở trực tiếp)')}
      ${row('Camera tay', h.ok ? handOk : null, !h.ok ? 'Cần máy chủ' : handOk ? 'Sẵn sàng' : 'Thiếu file model')}
      ${row('AI đang dùng', h.ok ? !!co.active : null, h.ok ? activeTxt : '—')}
      ${(h.auth === 'required' || curPass) ? `<div class="setting-h" style="margin:14px 0 6px;font-size:15px">Mã HLV AI</div>
        <div class="passrow"><input type="password" id="coachPass" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Nhập mã HLV AI" aria-label="Mã HLV AI" value="${esc(curPass)}"><button type="button" class="btn btn-ghost btn-sm" id="passToggle" aria-pressed="false">Hiện</button></div>
        <p class="faintline" style="text-align:left;margin:6px 0 0">Mã do anh đặt trên Cloudflare (COACH_PASSCODE).</p>` : ''}
      ${h.ok ? `<div style="margin-top:12px"><button type="button" class="btn btn-ghost btn-sm" id="coachTest">${I.bulb}Thử HLV AI</button><p class="faintline" id="coachTestOut" role="status" aria-live="polite" style="text-align:left;margin:8px 0 0"></p></div>` : ''}
      <div class="setting-h" style="margin:14px 0 6px;font-size:15px">Nguồn AI</div>
      <div class="prov" role="radiogroup" aria-label="Nguồn AI">${choices.map(([v, t, note, en]) => `<button class="prow" role="radio" data-v="${v}" aria-checked="${cur === v}" ${en ? '' : 'aria-disabled="true"'}><span class="rd"></span><span class="pt"><b>${t}</b>${note ? `<small>${note}</small>` : ''}</span></button>`).join('')}</div>`;
    const pi = $('#coachPass', card);
    if (pi) {
      const save = () => safe(() => VE.settings.set({ coachPass: pi.value.trim() }));
      pi.addEventListener('change', save); pi.addEventListener('blur', save);
      $('#passToggle', card).addEventListener('click', e => { const sh = pi.type === 'password'; pi.type = sh ? 'text' : 'password'; e.currentTarget.textContent = sh ? 'Ẩn' : 'Hiện'; e.currentTarget.setAttribute('aria-pressed', sh); });
    }
    const tb = $('#coachTest', card), to = $('#coachTestOut', card);
    if (tb) tb.addEventListener('click', () => {
      if (pi) safe(() => VE.settings.set({ coachPass: pi.value.trim() }));
      tb.disabled = true; to.className = 'faintline'; to.textContent = 'Đang hỏi HLV AI…';
      const t0 = Date.now();
      Promise.resolve().then(() => VE.coach.ask({ kind: 'week' })).then(res => {
        if (gone) return;
        to.className = 'faintline test-ok';
        to.textContent = '✓ HLV AI chạy tốt · ' + [res.provider, res.model, f1((res.ms != null ? res.ms : Date.now() - t0) / 1000) + ' s'].filter(Boolean).join(' · ');
      }, e => {
        if (gone) return;
        to.className = 'faintline test-bad';
        to.textContent = '✗ ' + (COACH_ERR[e && e.code] || COACH_ERR.AI_ERROR) + (coachDetail(e) ? ' — ' + coachDetail(e) : '');
      }).then(() => { tb.disabled = false; });
    });
    $$('.prow', card).forEach(b => b.addEventListener('click', () => {
      if (b.getAttribute('aria-disabled') === 'true') { const sm = $('small', b); if (sm) toast(sm.textContent); return; }
      safe(() => VE.settings.set({ coachProvider: b.dataset.v }));
      $$('.prow', card).forEach(o => o.setAttribute('aria-checked', o === b));
    }));
  });
  return () => { gone = true; };
}

/* ---------- điểm mở rộng: API cho các file màn hình khác (docs/SPEC-LEGATO.md §9) ---------- */
const UI = window.VP_UI = {
  VE, DEMO, view, I, WL, $, $$, esc, f0, f1, clamp, safe, toast,
  topbar, stHTML, micErrorHTML, dateLabel, fmtTime, serverHealth, coachActive, coachRun, COACH_ERR,
  // fn(arg) vẽ vào VP_UI.view, có thể trả hàm dọn dẹp. opts: { tab: id tab được tô sáng, fit: true = màn hình không cuộn, ẩn thanh tab }
  registerRoute(name, fn, opts) { if (typeof fn === 'function' && /^[a-z][a-z0-9-]*$/.test(name)) EXT.routes[name] = [fn, (opts && opts.tab) || 'home', !!(opts && opts.fit)]; },
  // t: { id, href, label, icon (chuỗi SVG), order }
  registerTab(t) { if (t && t.id && t.href && !EXT.tabs.some(x => x.id === t.id)) EXT.tabs.push({ id: t.id, href: t.href, label: t.label || t.id, icon: t.icon, order: t.order == null ? 2 : t.order }); },
  // fn() → chuỗi HTML, chèn vào trang Lộ trình ngay trên "Lộ trình 8 vòng"
  registerHomeCard(fn) { if (typeof fn === 'function') EXT.home.push(fn); },
  go(hash) { location.hash = hash; },
  rerender: route,
};
(window.VP_EXT || []).forEach(fn => { try { fn(UI); } catch (e) { console.error('VP_EXT', e); } });
window.VP_EXT = { push(fn) { try { fn(UI); } catch (e) { console.error('VP_EXT', e); } } }; // file nạp sau ui.js vẫn đăng ký được

/* ---------- boot ---------- */
$('#bg').innerHTML = violinBG;
applyTheme();
if (!location.hash) history.replaceState(null, '', '#/home');
route();
window.addEventListener('pagehide', () => { if (cleanup) safe(cleanup); });
})();
