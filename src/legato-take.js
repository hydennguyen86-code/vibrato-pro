/* Vibrato Pro · phần Độ mượt: màn Lượt tập (#/lg-take/:id) + Phiếu chấm (#/lg-result/:id). [gói take]
 * Hợp đồng: docs/SPEC-LEGATO.md §4–§10. Chỉ đọc số liệu từ VE.legato (report, level); không tự chấm lại, không tự đặt ngưỡng.
 * Đăng ký qua window.VP_EXT (SPEC §9). Class mới: tiền tố lgt-. */
(function () {
  'use strict';

  const GROUP_VI = { bow: 'Đổi vĩ', pitch: 'Cao độ', join: 'Nối nốt', cross: 'Chuyển dây', vib: 'Vibrato', timing: 'Nhịp' };
  const KIND_VI = { bow: 'đổi vĩ', note: 'đổi nốt', cross: 'chuyển dây' };
  const WIN = 6;              // giây hiển thị trên đồ thị màn tập
  const RING = 1024;          // > 6 s / 12 ms
  let metroPref = true;       // "Kêu" (true) / "Chỉ nháy" (false), nhớ trong phiên trình duyệt

  (window.VP_EXT = window.VP_EXT || []).push(function (ui) {
    const VE = ui.VE, esc = ui.esc, $ = ui.$, $$ = ui.$$, f0 = ui.f0, f1 = ui.f1, clamp = ui.clamp, safe = ui.safe, I = ui.I;
    const LG = () => VE && VE.legato;
    const latSec = () => safe(() => LG().TH.take.latencyMs / 1000, 0.06);

    /* ---------- tiện ích chung ---------- */
    function readColors() {
      const cs = getComputedStyle(document.documentElement), g = (n, d) => cs.getPropertyValue(n).trim() || d;
      return { vol: g('--lgt-vol', 'rgba(94,176,255,.35)'), volLine: g('--lgt-vol-line', '#5eb0ff'), pitch: g('--g-line', '#ffc247'),
        band: g('--g-band', 'rgba(110,210,120,.22)'), bandLine: g('--g-bandline', 'rgba(140,230,150,.75)'), zero: g('--g-zero', 'rgba(255,255,255,.55)'),
        grid: g('--g-grid', 'rgba(255,255,255,.1)'), text: g('--text', '#fff'), muted: g('--muted', '#bbb'), bowMk: g('--lgt-bow', 'rgba(255,255,255,.45)'),
        crossMk: g('--lgt-cross', '#ffb43a'), bad: g('--bad', '#ffa186'), segBad: g('--lgt-segbad', 'rgba(255,120,90,.16)'), gold: g('--gold', '#ffb43a'),
        track: g('--lgt-track', 'rgba(128,128,128,.22)'), pill: g('--g-bg', 'rgba(0,0,0,.35)') };
    }
    function fitCanvas(cv, ctx) {
      const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return [w, h];
    }
    const stringLabel = (s) => {
      if (!s) return '';
      const name = (safe(() => LG().STRING_VI[s.string], null)) || s.string || '';
      return s.finger === 0 ? 'Dây ' + name + ' · buông' : 'Dây ' + name + (s.finger != null ? ' · ngón ' + s.finger : '');
    };
    const segAt = (pl, tm) => { // seg đang phải kéo tại thời điểm nhạc tm (giây)
      if (!pl || !pl.segs.length) return null;
      if (tm < 0) return pl.segs[0];
      for (let i = 0; i < pl.segs.length; i++) if (tm < pl.segs[i].t1) return pl.segs[i];
      return pl.segs[pl.segs.length - 1];
    };
    const bowAt = (pl, tm) => {
      if (!pl || !pl.bows.length) return null;
      if (tm < 0) return pl.bows[0];
      for (let i = 0; i < pl.bows.length; i++) if (tm < pl.bows[i].t1) return pl.bows[i];
      return pl.bows[pl.bows.length - 1];
    };
    function notFound(title) {
      ui.view.innerHTML = ui.topbar(title, '#/legato') +
        `<div class="card empty lgt-empty"><b>Không tìm thấy level</b><p class="muted">Level này không có trong phần Độ mượt.</p><a class="btn btn-gold btn-sm" href="#/legato">Về danh sách</a></div>`;
    }

    /* ---------- đồ thị 2 dải: âm lượng (trên) + cao độ so với nốt mục tiêu (dưới) ---------- */
    // d: { n, T(k), D(k), C(k) (NaN = không có cao độ), t0, t1, tol, dbLo, dbHi, marks:[{t, kind:'bow'|'cross', bad, label}], segBad:[{t0,t1}], legend, compact }
    function drawLanes(ctx, W, H, col, d) {
      ctx.clearRect(0, 0, W, H);
      const x0 = 30, x1 = W - 6, pw = x1 - x0;
      const top0 = d.compact ? 16 : 30, gap = 18;
      const laneH = H - top0 - gap - 6;
      const vA = top0, vB = top0 + Math.round(laneH * (d.compact ? 0.42 : 0.5)), pA = vB + gap, pB = H - 6;
      const X = (t) => x0 + (t - d.t0) / (d.t1 - d.t0) * pw;
      const R = Math.max(100, d.tol * 2.6);
      const YV = (db) => vB - (clamp(db, d.dbLo, d.dbHi) - d.dbLo) / (d.dbHi - d.dbLo) * (vB - vA);
      const YP = (c) => pA + (R - clamp(c, -R, R)) / (2 * R) * (pB - pA);
      ctx.font = '600 11px -apple-system, system-ui, sans-serif'; ctx.textBaseline = 'middle';
      // nền: nốt lệch
      ctx.fillStyle = col.segBad;
      (d.segBad || []).forEach((s) => { const a = Math.max(x0, X(s.t0)), b = Math.min(x1, X(s.t1)); if (b > a) ctx.fillRect(a, pA, b - a, pB - pA); });
      // khung hai dải
      ctx.strokeStyle = col.grid; ctx.lineWidth = 1; ctx.setLineDash([]);
      ctx.strokeRect(x0 + 0.5, vA + 0.5, pw - 1, vB - vA); ctx.strokeRect(x0 + 0.5, pA + 0.5, pw - 1, pB - pA - 1);
      // dải ± ngưỡng cao độ + vạch 0
      ctx.fillStyle = col.band; ctx.fillRect(x0, YP(d.tol), pw, YP(-d.tol) - YP(d.tol));
      ctx.strokeStyle = col.zero; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, YP(0)); ctx.lineTo(x1, YP(0)); ctx.stroke();
      // nhãn trục
      ctx.fillStyle = col.muted; ctx.textAlign = 'right';
      ctx.fillText('0', x0 - 4, YP(0)); ctx.fillText('+' + Math.round(d.tol), x0 - 4, YP(d.tol) - 5); ctx.fillText('−' + Math.round(d.tol), x0 - 4, YP(-d.tol) + 5);
      ctx.fillText('dB', x0 - 4, vA + 7);
      ctx.textAlign = 'left'; ctx.fillStyle = col.text;
      ctx.fillText('Âm lượng', x0 + 6, vA + 9);
      ctx.fillText('Cao độ so với nốt (vạch 0 = đúng nốt)', x0 + 6, pA + 9);
      if (d.legend) {
        ctx.fillStyle = col.muted; ctx.textAlign = 'right';
        const lx = x1 - 2, ly = 9;
        ctx.fillText('chuyển dây / đổi nốt', lx, ly);
        const w1 = ctx.measureText('chuyển dây / đổi nốt').width;
        ctx.strokeStyle = col.crossMk; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(lx - w1 - 6, ly - 6); ctx.lineTo(lx - w1 - 6, ly + 6); ctx.stroke();
        const lx2 = lx - w1 - 16;
        ctx.fillText('đổi vĩ', lx2, ly);
        const w2 = ctx.measureText('đổi vĩ').width;
        ctx.strokeStyle = col.bowMk; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(lx2 - w2 - 6, ly - 6); ctx.lineTo(lx2 - w2 - 6, ly + 6); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, pw, H); ctx.clip();
      // âm lượng: vùng tô
      if (d.n > 1) {
        ctx.beginPath(); let open = false, lastX = 0;
        for (let k = 0; k < d.n; k++) {
          const t = d.T(k); if (t < d.t0 - 0.05 || t > d.t1 + 0.05) continue;
          const x = X(t), y = YV(d.D(k));
          if (!open) { ctx.moveTo(x, vB); ctx.lineTo(x, y); open = true; } else ctx.lineTo(x, y);
          lastX = x;
        }
        if (open) {
          ctx.lineTo(lastX, vB); ctx.closePath(); ctx.fillStyle = col.vol; ctx.fill();
          ctx.beginPath(); open = false;
          for (let k = 0; k < d.n; k++) { const t = d.T(k); if (t < d.t0 - 0.05 || t > d.t1 + 0.05) continue; const x = X(t), y = YV(d.D(k)); if (!open) { ctx.moveTo(x, y); open = true; } else ctx.lineTo(x, y); }
          ctx.strokeStyle = col.volLine; ctx.lineWidth = 1.5; ctx.stroke();
        }
      }
      // cao độ: đường, ngắt khi không có cao độ
      ctx.save(); ctx.beginPath(); ctx.rect(x0, pA, pw, pB - pA); ctx.clip();
      ctx.strokeStyle = col.pitch; ctx.lineWidth = d.compact ? 1.6 : 2.2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath(); let open = false, lastT = -1e9;
      for (let k = 0; k < d.n; k++) {
        const t = d.T(k), c = d.C(k);
        if (t < d.t0 - 0.05 || t > d.t1 + 0.05) continue;
        if (c !== c) { open = false; continue; }
        const x = X(t), y = YP(c);
        if (!open || t - lastT > 0.06) { ctx.moveTo(x, y); open = true; } else ctx.lineTo(x, y);
        lastT = t;
      }
      ctx.stroke(); ctx.restore();
      // vạch điểm đổi
      const rows = [-1e9, -1e9, -1e9];
      (d.marks || []).forEach((m) => {
        const x = X(m.t); if (x < x0 - 1 || x > x1 + 1) return;
        const isBow = m.kind === 'bow';
        ctx.strokeStyle = m.bad ? col.bad : (isBow ? col.bowMk : col.crossMk);
        ctx.globalAlpha = m.bad ? 1 : (m.faint ? 0.45 : 0.9);
        ctx.lineWidth = m.bad ? 2.6 : (isBow ? 1.2 : 1.6);
        ctx.setLineDash(isBow ? [3, 3] : []);
        ctx.beginPath(); ctx.moveTo(x, vA + 1); ctx.lineTo(x, pB); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
        if (m.bad && m.label) {
          ctx.font = '700 11px -apple-system, system-ui, sans-serif';
          const tw = ctx.measureText(m.label).width + 8;
          let lx = clamp(x - tw / 2, x0 + 1, x1 - tw - 1), r = rows.findIndex((e) => lx > e + 3);
          if (r < 0) return;
          rows[r] = lx + tw;
          const ly = vA + 26 + r * 15;
          ctx.fillStyle = col.pill; ctx.fillRect(lx, ly - 7, tw, 14);
          ctx.fillStyle = col.bad; ctx.textAlign = 'left'; ctx.fillText(m.label, lx + 4, ly);
          ctx.font = '600 11px -apple-system, system-ui, sans-serif';
        }
      });
      ctx.restore();
    }

    /* ---------- thanh dẫn hướng vĩ ---------- */
    function drawBowGuide(ctx, W, H, col, pl, bow, tm, active) {
      ctx.clearRect(0, 0, W, H);
      if (!bow) return;
      const x0 = 14, x1 = W - 14, pw = x1 - x0, cy = H / 2 + 2;
      const up = bow.dir === 'up', len = bow.b1 - bow.b0 || 1;
      const XF = (fr) => x0 + (up ? 1 - fr : fr) * pw;
      // rãnh
      ctx.fillStyle = col.track; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x0 - 8, cy - 9, pw + 16, 18, 9); else ctx.rect(x0 - 8, cy - 9, pw + 16, 18);
      ctx.fill();
      // phách
      ctx.strokeStyle = col.muted; ctx.lineWidth = 2;
      for (let b = 0; b <= len + 1e-9; b++) { const x = XF(b / len); ctx.beginPath(); ctx.moveTo(x, cy - 13); ctx.lineTo(x, cy + 13); ctx.stroke(); }
      // điểm chuyển dây / đổi nốt trong vĩ này
      pl.bounds.forEach((bd) => {
        if (bd.kind === 'bow' || bd.beat <= bow.b0 + 1e-9 || bd.beat >= bow.b1 - 1e-9) return;
        const x = XF((bd.beat - bow.b0) / len);
        ctx.fillStyle = col.crossMk; ctx.beginPath(); ctx.moveTo(x, cy - 15); ctx.lineTo(x + 6, cy - 9); ctx.lineTo(x, cy - 3); ctx.lineTo(x - 6, cy - 9); ctx.closePath(); ctx.fill();
        ctx.fillRect(x - 1, cy - 3, 2, 14);
      });
      // phần vĩ đã đi
      const fr = clamp((tm - bow.t0) / (bow.t1 - bow.t0), 0, 1);
      const cx = XF(active ? fr : 0);
      ctx.fillStyle = col.gold; ctx.globalAlpha = 0.35;
      const a = Math.min(XF(0), cx), b = Math.max(XF(0), cx);
      ctx.fillRect(a, cy - 5, b - a, 10); ctx.globalAlpha = 1;
      // con trỏ
      ctx.fillStyle = col.gold; ctx.strokeStyle = col.text; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 6.2832); ctx.fill(); ctx.stroke();
      // mũi tên hướng
      ctx.fillStyle = col.text; const ax = clamp(cx + (up ? -15 : 15), 8, W - 8);
      ctx.beginPath(); ctx.moveTo(ax + (up ? -6 : 6), cy); ctx.lineTo(ax, cy - 5); ctx.lineTo(ax, cy + 5); ctx.closePath(); ctx.fill();
    }

    /* ================= MÀN LƯỢT TẬP ================= */
    function screenTake(arg) {
      const id = Number(arg);
      const lv = safe(() => LG().level(id), null);
      if (!lv) { notFound('Tập · Độ mượt'); return; }
      const pl = LG().plan(lv), crit = lv.criteria || LG().criteriaOf(lv);
      const tol = (crit.pitch && crit.pitch.tolCents) || 40;
      const totalBeats = Math.round(pl.totalBeats);
      const qs = new URLSearchParams(location.search);
      const pats = safe(() => LG().DEMO_PATTERNS, []) || [];
      let demoPat = pats.some((p) => p.id === qs.get('pattern')) ? qs.get('pattern') : 'smooth';
      const demoSpeed = clamp(Number(qs.get('speed')) || 1, 1, 16);
      const pat1 = (lv.pattern || []);

      ui.view.innerHTML = `
        ${ui.topbar('Tập · M' + lv.id, '#/lg-level/' + lv.id)}
        <div class="fitstack lgt-stack">
          <div class="card lgt-ex">
            <div class="lgt-now">
              <div class="lgt-cur"><div class="lgt-note num" id="lgtNote">—</div><div class="lgt-str" id="lgtStr"></div></div>
              <div class="lgt-next"><small>Tiếp</small><b class="num" id="lgtNext">—</b><span id="lgtNextStr"></span></div>
            </div>
            <div class="lgt-strip" id="lgtStrip" aria-label="Các nốt của một vòng bài">${pat1.map((p, i) => `<span class="lgt-pn" data-i="${i}">${esc(p.note)}<small>${esc(p.finger === 0 ? 'buông' : 'ngón ' + p.finger)}</small></span>`).join('<i class="lgt-arr" aria-hidden="true">›</i>')}</div>
          </div>
          <div class="lgt-guide">
            <div class="lgt-gh"><b id="lgtDir">Kéo xuống</b><span>Vùng vĩ: ${esc(lv.bowZone || 'Giữa vĩ')} <i>(tự kiểm)</i></span></div>
            <canvas id="lgtBow" class="lgt-bowcv" aria-label="Thanh dẫn hướng vĩ"></canvas>
          </div>
          <div class="lgt-graph"><canvas id="lgtCv" aria-label="Đồ thị âm lượng và cao độ 6 giây gần nhất"></canvas></div>
          <div class="lgt-status">
            <div class="lgt-sh"><span id="lgtState" aria-live="polite">Sẵn sàng</span><span class="num muted" id="lgtHeard"></span></div>
            <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="Tiến độ lượt tập"><i id="lgtProg" style="width:0%"></i></div>
          </div>
          <div class="lgt-metro">
            <div class="lgt-seg" role="group" aria-label="Metronome">
              <button type="button" id="lgtMOn" aria-pressed="${metroPref}">${I.speaker}Kêu</button>
              <button type="button" id="lgtMOff" aria-pressed="${!metroPref}">Chỉ nháy</button>
            </div>
            <div class="lgt-dots" id="lgtDots" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
          </div>
          <p class="lgt-hint">Đeo tai nghe hoặc chọn Chỉ nháy nếu tiếng metronome lọt vào micro.</p>
          ${ui.DEMO ? `<label class="lgt-demo"><span>Mẫu giả lập <i>chế độ thử</i></span><select id="lgtPat">${pats.map((p) => `<option value="${esc(p.id)}"${p.id === demoPat ? ' selected' : ''}>${esc(p.label)}</option>`).join('')}</select></label>` : ''}
          <div id="lgtErr"></div>
          <button class="btn btn-gold bigbtn lgt-go" id="lgtGo">${I.play}<span>Bắt đầu</span></button>
          <div class="lgt-count" id="lgtCount" aria-live="assertive" hidden></div>
        </div>`;

      const col0 = { c: readColors() };
      const cv = $('#lgtCv'), ctx = cv.getContext('2d'), bcv = $('#lgtBow'), bctx = bcv.getContext('2d');
      const elNote = $('#lgtNote'), elStr = $('#lgtStr'), elNext = $('#lgtNext'), elNextStr = $('#lgtNextStr'), elDir = $('#lgtDir');
      const elState = $('#lgtState'), elHeard = $('#lgtHeard'), elProg = $('#lgtProg'), elCount = $('#lgtCount'), elGo = $('#lgtGo');
      const dots = $$('#lgtDots i'), pns = $$('#lgtStrip .lgt-pn');
      const rT = new Float32Array(RING), rD = new Float32Array(RING), rC = new Float32Array(RING);
      let rHead = 0, rN = 0;
      let session = null, gone = false, raf = 0, lastF = null, lastFWall = 0, startWall = 0, logged = false;
      let shownSeg = -2, shownBow = -2, shownPat = -2, dotT = 0, dbMax = -30;
      const lat = latSec();
      const marks = [];
      pl.bows.forEach((b) => { if (b.i > 0) marks.push({ t: b.t0 + lat, kind: 'bow' }); });
      pl.bounds.forEach((b) => { if (b.kind !== 'bow') marks.push({ t: b.t + lat, kind: 'cross' }); });
      const speed = ui.DEMO ? demoSpeed : 1;

      const running = () => !!session && session.state !== 'idle' && session.state !== 'done';
      function setGo() {
        const r = running();
        elGo.innerHTML = r ? `${I.stop}<span>Dừng</span>` : `${I.play}<span>Bắt đầu</span>`;
        elGo.setAttribute('aria-label', r ? 'Dừng lượt tập' : 'Bắt đầu lượt tập');
        $('#lgtMOn').disabled = r; $('#lgtMOff').disabled = r;
        const sel = $('#lgtPat'); if (sel) sel.disabled = r;
      }
      function showSeg(i) {
        if (i === shownSeg) return; shownSeg = i;
        const s = pl.segs[i], n = pl.segs[i + 1];
        elNote.textContent = s ? s.note : '—'; elStr.textContent = stringLabel(s);
        if (n) {
          elNext.textContent = n.note;
          const bd = pl.bounds[i];
          elNextStr.textContent = bd ? (bd.kind === 'bow' ? 'đổi vĩ' : KIND_VI[bd.kind] + (bd.bowChange ? ' + đổi vĩ' : '')) : '';
        } else { elNext.textContent = '—'; elNextStr.textContent = 'hết bài'; }
        const p = s ? s.pat : -1;
        if (p !== shownPat) { shownPat = p; pns.forEach((e, k) => e.classList.toggle('on', k === p)); }
      }
      function setState(txt) { if (elState.textContent !== txt) elState.textContent = txt; }
      function resetIdle() {
        lastF = null; rN = 0; rHead = 0; shownSeg = -2; shownBow = -2;
        elCount.hidden = true; elProg.style.width = '0%'; elHeard.textContent = '';
        dots.forEach((d) => d.classList.remove('on'));
        setState('Sẵn sàng'); showSeg(0); setGo();
      }

      function onFrame(f) {
        lastF = f; lastFWall = performance.now();
        rT[rHead] = f.t; rD[rHead] = f.db; rC[rHead] = f.centsFromTarget == null ? NaN : f.centsFromTarget;
        rHead = (rHead + 1) % RING; if (rN < RING) rN++;
        if (f.voiced && f.db > dbMax) dbMax = f.db;
      }
      function onBeat(b) {
        dotT = performance.now();
        dots.forEach((d, k) => d.classList.toggle('on', k === b.inBar));
        if (b.countIn) { elCount.hidden = false; elCount.textContent = String(b.left); }
        else {
          elCount.hidden = true;
          setState('Đang chấm · phách ' + (b.index + 1) + '/' + totalBeats);
        }
      }
      function onState(x) {
        if (x.state === 'countin') setState('Đếm vào…');
        else if (x.state === 'analyzing') { setState('Đang phân tích…'); elCount.hidden = true; }
        else if (x.state === 'starting') setState('Đang mở micro…');
        setGo();
      }
      function onDone(r) {
        if (gone) return;
        const wallSec = (Date.now() - startWall) / 1000;
        WL_release();
        if (r && r.code === 'ABORTED') {
          if (!logged && wallSec > 3) { logged = true; safe(() => VE.store.logPractice(wallSec)); }
          detach(); session = null; resetIdle(); ui.toast('Đã dừng. Lượt này không được chấm.');
          return;
        }
        if (!logged) { logged = true; safe(() => VE.store.logPractice((r && r.durationSec) || pl.totalSec)); }
        detach(); session = null;
        ui.go('#/lg-result/' + lv.id);
      }
      let wlOn = false;
      const WL_release = () => { if (wlOn) { wlOn = false; safe(() => ui.WL.release()); } };
      function detach() {
        if (!session) return;
        session.off('frame', onFrame); session.off('beat', onBeat); session.off('state', onState); session.off('done', onDone);
      }

      function loop() {
        raf = requestAnimationFrame(loop);
        const col = col0.c;
        // thời gian nhạc ước tính: khung mới nhất + nội suy ngắn
        const act = running() && lastF;
        let tm = act ? lastF.t + Math.min(0.06, (performance.now() - lastFWall) / 1000) * speed : (running() ? -pl.countInSec : 0);
        // nốt hiện tại
        if (lastF && lastF.seg != null) showSeg(lastF.seg); else if (lastF && lastF.phase === 'play' && lastF.progress >= 1) showSeg(pl.segs.length - 1);
        if (lastF) {
          elProg.style.width = (clamp(lastF.progress || 0, 0, 1) * 100).toFixed(1) + '%';
          const h = lastF.voiced && lastF.noteName ? 'nghe: ' + lastF.noteName : (running() && lastF.phase === 'play' ? 'chưa nghe tiếng' : '');
          if (elHeard.textContent !== h) elHeard.textContent = h;
        }
        if (dotT && performance.now() - dotT > 160) { dots.forEach((d) => d.classList.remove('on')); dotT = 0; }
        // thanh vĩ
        const bow = bowAt(pl, tm);
        if (bow && bow.i !== shownBow) { shownBow = bow.i; elDir.textContent = bow.dir === 'up' ? '← Đẩy lên' : 'Kéo xuống →'; }
        const [bw, bh] = fitCanvas(bcv, bctx);
        drawBowGuide(bctx, bw, bh, col, pl, bow, tm, !!act && tm >= 0);
        // đồ thị
        const [W, H] = fitCanvas(cv, ctx);
        const tEnd = Math.max(WIN * 0.85, (lastF ? lastF.t : 0) + 0.3), tStart = tEnd - WIN;
        const start = (rHead - rN + RING) % RING;
        const hi = Math.max(-20, dbMax + 4);
        drawLanes(ctx, W, H, col, { n: rN, T: (k) => rT[(start + k) % RING], D: (k) => rD[(start + k) % RING], C: (k) => rC[(start + k) % RING],
          t0: tStart, t1: tEnd, tol, dbLo: hi - 60, dbHi: hi, marks, legend: true, compact: H < 150 });
      }

      async function start() {
        if (running() || gone) return;
        $('#lgtErr').innerHTML = '';
        resetIdle(); dbMax = -30; logged = false;
        const sel = $('#lgtPat'); if (sel) demoPat = sel.value;
        let s;
        try { s = LG().createSession(lv, { demo: ui.DEMO, pattern: demoPat, speed: demoSpeed, metronome: metroPref }); }
        catch (e) { $('#lgtErr').innerHTML = ui.micErrorHTML(e && e.code); return; }
        session = s;
        s.on('frame', onFrame); s.on('beat', onBeat); s.on('state', onState); s.on('done', onDone);
        startWall = Date.now(); wlOn = true; ui.WL.acquire();
        setGo();
        try {
          await s.start(); // ngay trong thao tác chạm (iOS)
          if (gone) safe(() => s.stop());
        } catch (e) {
          if (session === s) { detach(); session = null; }
          WL_release(); resetIdle();
          if (!gone) $('#lgtErr').innerHTML = ui.micErrorHTML(e && e.code);
        }
        setGo();
      }
      elGo.addEventListener('click', () => {
        if (running()) { safe(() => session.stop()); return; }
        start();
      });
      const setMetro = (on) => { if (running()) return; metroPref = on; $('#lgtMOn').setAttribute('aria-pressed', on); $('#lgtMOff').setAttribute('aria-pressed', !on); };
      $('#lgtMOn').addEventListener('click', () => setMetro(true));
      $('#lgtMOff').addEventListener('click', () => setMetro(false));
      const sel = $('#lgtPat'); if (sel) sel.addEventListener('change', () => { demoPat = sel.value; });
      const onResize = () => { col0.c = readColors(); };
      window.addEventListener('resize', onResize);

      resetIdle();
      raf = requestAnimationFrame(loop);

      return function cleanup() {
        gone = true;
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        if (session) {
          const s = session;
          if (!logged && startWall && (Date.now() - startWall) / 1000 > 3) { logged = true; safe(() => VE.store.logPractice((Date.now() - startWall) / 1000)); }
          detach(); session = null;
          safe(() => s.stop()); // 'done' ABORTED không tới được onDone nữa: không điều hướng
        }
        WL_release();
      };
    }

    /* ================= PHIẾU CHẤM ================= */
    const ICON_OK = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#2fa14a"/><path d="M13 25l7 7 15-16" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const ICON_BAD = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="rgba(255,150,100,.16)" stroke="#ff9a74" stroke-width="3"/><path d="M16 16l16 16M32 16L16 32" stroke="#ff9a74" stroke-width="5" stroke-linecap="round"/></svg>';

    function evLabel(ev) {
      const b = ev.bad || [];
      const has = (s) => b.some((c) => c.indexOf(s) >= 0);
      if (has('_gap') && ev.gapMs != null) return 'hở ' + f0(ev.gapMs) + ' ms';
      if (has('_noise') && ev.noiseMs != null) return 'tạp ' + f0(ev.noiseMs) + ' ms';
      if (has('vib_freeze') && ev.vibFreezeMs != null) return 'đơ ' + f0(ev.vibFreezeMs) + ' ms';
      if (has('_dip') && ev.dipDb != null) return 'sụt ' + f1(ev.dipDb) + ' dB';
      if (has('_slow') && ev.transMs != null) return 'chuyển ' + f0(ev.transMs) + ' ms';
      if (has('_missing')) return 'không nghe ra';
      if (has('timing') && ev.timingMs != null) return 'lệch ' + f0(ev.timingMs) + ' ms';
      if (has('pitch') && ev.arriveCents != null) return 'tới lệch ' + f0(ev.arriveCents);
      return 'chưa mượt';
    }
    const evKind = (ev) => (KIND_VI[ev.kind] || ev.kind) + (ev.bowChange && ev.kind !== 'bow' ? ' + đổi vĩ' : '');
    const dash = (v, d) => (v == null || (typeof v === 'number' && isNaN(v)) ? '—' : (d ? f1(v) : f0(v)));

    function copyText(r, lv) {
      const L = [];
      L.push('Vibrato Pro · Độ mượt · M' + lv.id + ' ' + lv.title);
      L.push('Thời điểm: ' + ui.dateLabel(Date.now()) + (r.demo ? ' · giả lập: ' + (r.pattern || '') : '') + ' · ' + (r.pass ? 'ĐẠT' : 'CHƯA ĐẠT') + ' · ' + r.nOk + '/' + r.nChecks + (r.code ? ' · ' + r.code : ''));
      const raw = r.raw || {};
      L.push('raw: ' + Object.keys(raw).filter((k) => k !== 'vib').map((k) => k + '=' + raw[k]).join(' '));
      if (raw.vib) L.push('raw.vib: ' + Object.keys(raw.vib).map((k) => k + '=' + raw.vib[k]).join(' '));
      (r.order || []).forEach((k) => { const c = r.checks[k]; if (c) L.push(c.label + ': ' + c.text + ' (' + c.target + ') ' + (c.ok ? 'ĐẠT' : 'CHƯA' + (c.fail ? ' [' + c.fail + ']' : '')) + ' · ' + (c.detail || '')); });
      L.push(['i', 'beat', 't', 'kind', 'bowChange', 'from', 'to', 'found', 'dipDb', 'gapMs', 'transMs', 'noiseMs', 'otherMs', 'timingMs', 'arriveCents', 'vibFreezeMs', 'bad'].join('\t'));
      (r.events || []).forEach((e) => L.push([e.i, e.beat, e.t, e.kind, e.bowChange ? 1 : 0, e.from, e.to, e.found ? 1 : 0, e.dipDb, e.gapMs, e.transMs, e.noiseMs, e.otherMs, e.timingMs, e.arriveCents, e.vibFreezeMs, (e.bad || []).join(',')].map((v) => (v == null ? '' : v)).join('\t')));
      L.push('segments: ' + (r.segments || []).map((s) => s.note + ' ' + (s.cents == null ? '—' : s.cents) + 'c' + (s.ok === false ? '✕' : '') + ' even' + (s.evenDb == null ? '—' : s.evenDb) + (s.vib ? ' vib ' + s.vib.rate + 'Hz/' + s.vib.width + 'c/' + s.vib.regularity + '%' : '')).join(' | '));
      return L.join('\n');
    }

    function screenResult(arg) {
      const id = Number(arg);
      const lv = safe(() => LG().level(id), null);
      if (!lv) { notFound('Phiếu chấm'); return; }
      const r0 = safe(() => LG().lastReport(id), null);
      const r = r0 && r0.code !== 'ABORTED' ? r0 : null;
      if (!r) {
        ui.view.innerHTML = ui.topbar('Phiếu chấm · M' + lv.id, '#/lg-level/' + lv.id) +
          `<div class="card empty lgt-empty"><b>Chưa có lượt tập nào trong phiên này</b><p class="muted">Phiếu chấm chỉ giữ tới khi tải lại trang. Kéo một lượt để xem phiếu.</p><a class="btn btn-gold btn-sm" href="#/lg-take/${lv.id}">${I.play}Tập ngay</a></div>`;
        return;
      }
      const next = safe(() => LG().level(lv.id + 1), null);
      const g = r.gate || null;
      const hasChecks = (r.order || []).length > 0;
      const rawCode = r.code && r.code !== 'WRONG_NOTE' ? r.code : null;

      // phiếu theo nhóm
      const groups = [];
      (r.order || []).forEach((k) => {
        const c = r.checks[k]; if (!c) return;
        let grp = groups[groups.length - 1];
        if (!grp || grp.id !== c.group) { grp = { id: c.group, items: [] }; groups.push(grp); }
        grp.items.push(c);
      });
      const checkHTML = (c) => `
        <div class="lgt-ck ${c.ok ? 'ok' : 'bad'}">
          <div class="lgt-ckh"><span class="lgt-ckl">${esc(c.label)}</span>${ui.stHTML(c.ok ? 'ok' : 'bad')}</div>
          <div class="lgt-ckv num">${esc(c.text)}</div>
          <div class="lgt-ckt">Ngưỡng: ${esc(c.target)}</div>
          ${c.detail ? `<div class="lgt-ckd">${esc(c.detail)}</div>` : ''}
          ${!c.ok && c.tip ? `<div class="lgt-tip">${I.bulb}<div><b>${esc(c.tip.title)}</b><p>${esc(c.tip.fix)}</p></div></div>` : ''}
        </div>`;
      const sheet = groups.map((grp) => `
        <section class="card lgt-grp${grp.id === 'cross' ? ' lgt-focus' : ''}" data-group="${esc(grp.id)}">
          <h3 class="lgt-grph">${esc(GROUP_VI[grp.id] || grp.id)}${grp.id === 'cross' ? '<span class="lgt-badge">Trọng tâm</span>' : ''}</h3>
          ${grp.items.map(checkHTML).join('')}
        </section>`).join('');

      const evRows = (r.events || []).map((e) => `<tr class="${e.ok === false ? 'bad' : ''}"><td>${esc(e.beat + 1)}</td><td>${e.ok === false ? '✕ ' : ''}${esc(evKind(e))}</td><td>${dash(e.dipDb, 1)}</td><td>${dash(e.gapMs)}</td><td>${dash(e.transMs)}</td><td>${dash(e.noiseMs)}</td><td>${dash(e.timingMs)}</td><td>${dash(e.vibFreezeMs)}</td></tr>`).join('');
      const raw = r.raw || {};
      const rawKV = [['Mức đàn', raw.refDb != null ? f1(raw.refDb) + ' dB' : '—'], ['Mức nền', raw.noiseDb != null ? f1(raw.noiseDb) + ' dB' : '—'], ['SNR', raw.snrDb != null ? f1(raw.snrDb) + ' dB' : '—'],
        ['Có tiếng', raw.voicedPct != null ? f0(raw.voicedPct) + '%' : '—'], ['Trễ bù', raw.latencyMs != null ? f0(raw.latencyMs) + ' ms' : '—'], ['Số khung', raw.frames != null ? f0(raw.frames) : '—']];
      if (raw.vib) rawKV.push(['Vibrato', f1(raw.vib.rate) + ' Hz · ' + f0(raw.vib.width) + ' cents · đều ' + f0(raw.vib.regularity) + '% · có rung ' + f0(raw.vib.activePct) + '%']);

      ui.view.innerHTML = `
        ${ui.topbar('Phiếu chấm · M' + lv.id, '#/lg-level/' + lv.id)}
        <div class="lgt-hero ${r.pass ? 'pass' : 'fail'}">
          ${r.pass ? ICON_OK : ICON_BAD}
          <div><h2>${r.pass ? 'Đạt rồi!' : hasChecks ? 'Chưa đạt' : 'Chưa chấm được'}</h2>
          <p class="num">${hasChecks ? `${r.nOk}/${r.nChecks} chỉ số đạt` : 'Lượt này không được tính'}${r.demo ? ' · <i>giả lập</i>' : ''}</p>
          <p class="lgt-lvname">M${lv.id} · ${esc(lv.title)}</p></div>
        </div>
        <div class="stack lgt-res">
          ${r.message ? `<div class="card err lgt-msg" role="alert"><b>${rawCode === 'NO_SOUND' ? 'Không nghe thấy tiếng đàn' : rawCode === 'TOO_SHORT' ? 'Chưa đủ bài để chấm' : 'Nốt chưa đúng bài'}</b><span>${esc(r.message)}</span></div>` : ''}
          ${(r.warnings || []).map((w) => `<div class="card note lgt-warn">${I.warn}<div><b>Lưu ý</b><p>${esc(w.message)}</p></div></div>`).join('')}
          ${g && hasChecks ? `<div class="card lgt-gate"><b class="num">${!r.pass && g.levelPassed ? 'Level đã qua từ trước · ' : ''}Lần đạt ${g.passCount}/${g.neededPasses || 1}${(g.neededDays || 1) > 1 ? ` · Ngày ${g.dayCount}/${g.neededDays}` : ''}</b>
            <div class="pdots" aria-hidden="true">${Array.from({ length: g.neededPasses || 1 }, (_, i) => `<i class="${i < g.passCount ? 'on' : ''}">${i < g.passCount ? '✓' : ''}</i>`).join('')}</div></div>` : ''}
          ${g && g.justPassed ? `<div class="card banner crit"><span class="st ok" style="padding:4px">${I.check}</span><div><b>Bạn đã qua M${lv.id}.</b><p class="muted">${next ? `M${next.id} là level tiếp theo.` : 'Bạn đã hoàn thành cả 50 level Độ mượt.'}${lv.id > 1 ? ' Các level Độ mượt trước đó cũng được tính là đã qua.' : ''}</p></div></div>` : ''}
          ${hasChecks ? `<h2 class="sec-title">Phiếu chấm</h2>${sheet}` : ''}
          ${r.trace && r.trace.length && r.plan ? `<div class="card lgt-full"><div class="lgt-fullh"><b>Cả lượt</b><span class="muted">vạch đậm: điểm đổi chưa mượt · nền đỏ: nốt lệch</span></div><div class="lgt-fullcv"><canvas id="lgtFull" aria-label="Đồ thị âm lượng và cao độ của cả lượt"></canvas></div></div>` : ''}
          <details class="card lgt-raw"><summary>Số đo thô</summary>
            <p class="lgt-rawnote">Ngưỡng chưa được kiểm trên tiếng đàn thật. Nếu thấy chấm chưa hợp lý, chép số đo này gửi lại.</p>
            <div class="lgt-kv">${rawKV.map((x) => `<div><span>${esc(x[0])}</span><b class="num">${esc(x[1])}</b></div>`).join('')}</div>
            ${evRows ? `<div class="lgt-tblw"><table class="lgt-tbl num"><thead><tr><th>Phách</th><th>Loại</th><th>Sụt<br>dB</th><th>Hở<br>ms</th><th>Chuyển<br>ms</th><th>Tạp<br>ms</th><th>Lệch<br>ms</th><th>Đơ<br>ms</th></tr></thead><tbody>${evRows}</tbody></table></div>` : '<p class="muted">Không có điểm đổi nào được đo.</p>'}
            <button class="btn btn-ghost btn-sm" type="button" id="lgtCopy">Chép số đo</button>
            <textarea class="lgt-copyta" id="lgtCopyTa" readonly hidden aria-label="Số đo để chép"></textarea>
          </details>
          <div class="card note lgt-limit">${I.warn}<div><b>App không đo được gì</b><p>Vùng vĩ (gốc, giữa, ngọn) và tư thế khuỷu tay, cổ tay: bạn tự kiểm. Đổi vĩ càng mượt càng khó nghe ra, nên app chỉ đo chỗ sụt tiếng quanh phách, không biết chính xác lúc bạn đảo vĩ.</p></div></div>
          <div id="lgtCoach"></div>
          <div class="btnrow"><a class="btn btn-blue btn-sm" href="#/lg-take/${lv.id}">${I.retry}Tập lại</a><a class="btn btn-ghost btn-sm" href="#/lg-level/${lv.id}">Xem hướng dẫn</a></div>
          ${r.pass && next ? `<a class="btn btn-gold" href="#/lg-level/${next.id}">Level tiếp theo · M${next.id} ›</a>` : ''}
          <a class="btn btn-ghost btn-sm" href="#/legato">Về danh sách</a>
        </div>`;

      // đồ thị cả lượt (tĩnh)
      const fcv = $('#lgtFull');
      let drawFull = null;
      if (fcv) {
        const fctx = fcv.getContext('2d'), pl = r.plan, tr = r.trace;
        const lat = (raw.latencyMs != null ? raw.latencyMs : latSec() * 1000) / 1000;
        const n = tr.length, T = new Float32Array(n), D = new Float32Array(n), C = new Float32Array(n);
        let si = 0;
        for (let k = 0; k < n; k++) {
          const f = tr[k]; T[k] = f.t; D[k] = f.db;
          const tm = f.t - lat;
          while (si < pl.segs.length - 1 && tm >= pl.segs[si].t1) si++;
          const s = tm >= 0 && tm < pl.totalSec ? pl.segs[si] : null;
          C[k] = s && f.c != null ? f.c - s.midi * 100 : NaN;
        }
        const evByI = {}; (r.events || []).forEach((e) => { evByI[e.i] = e; });
        const marks = [];
        pl.bounds.forEach((b) => {
          const e = evByI[b.i];
          const bad = !!(e && e.ok === false);
          marks.push({ t: b.t + lat, kind: b.kind === 'bow' ? 'bow' : 'cross', bad, faint: !bad, label: bad ? evLabel(e) : '' });
        });
        const segBad = (r.segments || []).filter((s) => s.ok === false).map((s) => ({ t0: s.t0 + lat, t1: s.t1 + lat }));
        const tolF = (r.criteria && r.criteria.pitch && r.criteria.pitch.tolCents) || 40;
        const hi = Math.max(-20, (raw.refDb != null ? raw.refDb : -20) + 8), lo = Math.min(hi - 30, (raw.noiseDb != null ? raw.noiseDb : hi - 60) - 4);
        drawFull = () => {
          const [W, H] = fitCanvas(fcv, fctx);
          drawLanes(fctx, W, H, readColors(), { n, T: (k) => T[k], D: (k) => D[k], C: (k) => C[k], t0: -0.2, t1: pl.totalSec + lat + 0.35, tol: tolF, dbLo: lo, dbHi: hi, marks, segBad, legend: true, compact: false });
        };
        drawFull();
        requestAnimationFrame(() => drawFull && drawFull());
        window.addEventListener('resize', drawFull);
      }

      // chép số đo
      const txt = copyText(r, lv);
      $('#lgtCopy').addEventListener('click', () => {
        const ta = $('#lgtCopyTa');
        const fallback = () => { ta.hidden = false; ta.value = txt; ta.focus(); ta.select(); safe(() => ta.setSelectionRange(0, txt.length)); ui.toast('Đã chọn sẵn số đo: bấm Sao chép để chép.'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => ui.toast('Đã chép số đo.'), fallback);
        else fallback();
      });

      // HLV AI: chỉ khi máy chủ có cờ legato
      const ctl = { gone: false }, cache = {};
      ui.serverHealth().then((h) => {
        if (ctl.gone) return;
        if (ui.coachActive(h) && h.legato && hasChecks) ui.coachRun($('#lgtCoach'), () => ui.VE.legato.coach.ask(r), ctl, cache);
      });
      return function cleanup() { ctl.gone = true; if (drawFull) window.removeEventListener('resize', drawFull); drawFull = null; };
    }

    ui.registerRoute('lg-take', screenTake, { tab: 'legato', fit: true });
    ui.registerRoute('lg-result', screenResult, { tab: 'legato' });
  });
})();
