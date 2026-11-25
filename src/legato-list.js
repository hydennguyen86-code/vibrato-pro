/* Vibrato Pro — phần Độ mượt: tab, thẻ ở Lộ trình, màn Danh sách (#/legato) và Chi tiết level (#/lg-level/:id). [gói list]
 * Đăng ký qua window.VP_EXT (docs/SPEC-LEGATO.md §9). Class mới có tiền tố lgl-. Chỉ đọc VE.legato, không tự tính chỉ số. */
(function () {
  'use strict';
  (window.VP_EXT = window.VP_EXT || []).push(function (ui) {
    const VE = ui.VE, I = ui.I, esc = ui.esc, f0 = ui.f0, f1 = ui.f1, safe = ui.safe;
    const LG = () => VE.legato;
    const stageSafe = () => safe(() => LG().stages(), []) || [];
    const levelsSafe = () => safe(() => LG().levels(), []) || [];
    const total = () => levelsSafe().length || 50;
    const strVi = s => safe(() => LG().STRING_VI[s], null) || s;
    const tipTitle = code => safe(() => LG().TIPS[code].title, code);
    const ytUrl = q => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
    const num = v => (v == null || isNaN(v)) ? '' : f1(v).replace(/,0$/, '');

    // icon tab: hai nhịp lượn nối liền như dấu luyến
    const TAB_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 15c2-9.500 5.500-9.500 9.500-2s7.500 7.500 9.500-2"/><circle cx="3" cy="18.500" r="1.200" fill="currentColor"/><circle cx="21" cy="18.500" r="1.200" fill="currentColor"/></svg>';
    ui.registerTab({ id: 'legato', href: '#/legato', label: 'Độ mượt', icon: TAB_ICON, order: 2 });

    /* ---------- thẻ ở trang Lộ trình ---------- */
    ui.registerHomeCard(function () {
      try {
        const n = LG().store.passedCount(), tot = total(), cur = LG().store.currentLevel();
        const lv = LG().level(cur);
        const pct = Math.round(n / tot * 100);
        return `<div class="card lgl-home">
          <h2 class="lgl-h2">Độ mượt</h2>
          <p class="muted" style="font-size:15px">Đổi vĩ liền tiếng, chuyển dây không hở, vibrato không đơ</p>
          <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${n}"><i style="width:${pct}%"></i></div>
          <div class="row between"><span class="num" style="font-weight:700">Đã qua ${n}/${tot}</span>${lv ? `<span class="muted" style="font-size:14px;text-align:right">M${lv.id} · ${esc(lv.title)}</span>` : ''}</div>
          <a class="btn btn-blue btn-sm" style="margin-top:12px" href="#/lg-level/${cur}">${I.play}Tập tiếp M${cur}</a>
          <p style="margin-top:6px;text-align:center"><a class="gold" href="#/legato" style="font-weight:700;font-size:15px;display:inline-block;padding:8px">Xem cả ${tot} level ›</a></p>
        </div>`;
      } catch (e) { return ''; }
    });

    /* ---------- #/legato: danh sách + tiến độ ---------- */
    const openStages = {}; // nhớ vòng đã mở trong phiên
    ui.registerRoute('legato', function () {
      const S = LG().store;
      const tot = total(), done = S.passedCount(), cur = S.currentLevel(), curLv = LG().level(cur);
      const stagesHTML = stageSafe().map(st => {
        const lvs = levelsSafe().filter(l => l.stage === st.id);
        const passed = lvs.filter(l => S.status(l.id) === 'passed').length;
        const hasCur = cur >= st.range[0] && cur <= st.range[1];
        const open = openStages[st.id] != null ? openStages[st.id] : hasCur;
        const state = passed === lvs.length && lvs.length ? 'done' : hasCur ? 'cur' : 'open';
        const ic = state === 'done' ? `<span class="st-ic st-done">${I.check}</span>` : state === 'cur' ? `<span class="st-ic st-cur">${I.play}</span>` : `<span class="st-ic st-open">${st.id}</span>`;
        const rows = lvs.map(l => {
          const stt = S.status(l.id), b = S.best(l.id);
          const stTxt = stt === 'passed' ? `<span class="st ok">${I.check}Đã qua</span>` : stt === 'current' ? '<span class="lgl-now">Đang tới</span>' : '';
          const bestTxt = b ? `tốt nhất ${b.nOk}/${b.nChecks} chỉ số` : '';
          return `<a class="lgl-row ${stt}" href="#/lg-level/${l.id}" aria-label="M${l.id} ${esc(l.title)}${stt === 'passed' ? ', đã qua' : stt === 'current' ? ', đang tới' : ''}">
            <b class="lgl-id num">M${l.id}</b>
            <span class="lgl-rt"><span class="lgl-title">${esc(l.title)}</span>
              <span class="lgl-meta"><span class="lgl-kind">${esc(l.kindLabel)}</span><span class="num">${l.bpm} BPM</span>${bestTxt ? `<span class="num">${bestTxt}</span>` : ''}</span></span>
            <span class="lgl-stt">${stTxt}</span></a>`;
        }).join('');
        return `<div class="stage card ${open ? 'open' : ''}" data-stage="${st.id}" style="padding:4px 6px"><button class="stage-h" aria-expanded="${open}">${ic}<span class="t"><b class="num">${st.id}</b>${esc(st.name)}${st.focus === 'cross' ? ' <span class="lgl-focus">Trọng tâm</span>' : ''}<small class="num">${esc(st.short)} · đã qua ${passed}/${lvs.length}</small></span>${I.chev}</button><div class="lgl-list">${rows}</div></div>`;
      }).join('<div style="height:8px"></div>');

      const fc = S.failCounts(14);
      const top = Object.keys(fc).sort((a, b) => fc[b] - fc[a]).slice(0, 3);
      const failsHTML = top.length ? `<div><h2 class="sec-title">Lỗi hay lặp lại (14 ngày)</h2><div class="card">${top.map(c => `<div class="srow"><span>${esc(tipTitle(c))}</span><b class="num">${fc[c]} lần</b></div>`).join('')}</div></div>` : '';

      const takes = S.takes(30).slice(0, 10);
      const takesHTML = takes.length ? takes.map(t => {
        const first = !t.pass && t.fails && t.fails[0] ? `<small class="lgl-why">${esc(tipTitle(t.fails[0]))}</small>` : '';
        const note = t.code && !(t.fails && t.fails.length) ? `<small class="lgl-why">${esc(safe(() => LG().CODE_MSG[t.code].split('.')[0], ''))}</small>` : '';
        return `<div class="card take"><span class="st ${t.pass ? 'ok' : 'bad'}" style="margin:0">${t.pass ? I.check + 'Đạt' : I.cross + 'Chưa'}</span><div class="d">M${t.levelId}<small>${esc(ui.dateLabel(t.ts))}</small>${first || note}</div><div class="m num">${t.nOk}/${t.nChecks} chỉ số</div></div>`;
      }).join('') : `<div class="card empty">Chưa có lượt tập nào. Thử ngay <a class="gold" href="#/lg-level/1" style="font-weight:700">M1</a>.</div>`;

      ui.view.innerHTML = `
        ${ui.topbar('Độ mượt')}
        <div class="card lgl-head">
          <p style="font-size:16px">Phần này tập cho tiếng đàn liền mạch: đổi vĩ không hở, đổi nốt không khựng, và trọng tâm là <b>chuyển dây mượt</b>, kể cả khi đang vibrato.</p>
          <div class="lvl-big num" style="margin-top:10px">Đã qua ${done} <small>/ ${tot}</small></div>
          <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${done}"><i style="width:${Math.round(done / tot * 100)}%"></i></div>
        </div>
        ${curLv ? `<div class="card today"><h2>Tập tiếp</h2><div class="big num">M${curLv.id}</div><p class="muted" style="margin:-6px 0 12px">${esc(curLv.title)}</p>
          <a class="btn btn-blue" href="#/lg-level/${curLv.id}">${I.play}Tập tiếp M${curLv.id}</a></div>` : ''}
        <h2 class="sec-title">Lộ trình 6 vòng</h2>
        ${stagesHTML}
        <div class="stack" style="margin-top:14px">
          ${failsHTML}
          <div><h2 class="sec-title">Lượt tập gần đây</h2>${takesHTML}</div>
        </div>
        <p class="faintline">Cách tính qua level theo mục Tốc độ qua level trong <a class="gold" href="#/settings" style="font-weight:700">Cài đặt</a></p>`;
      ui.$$('.stage-h', ui.view).forEach(b => b.addEventListener('click', () => {
        const st = b.parentElement, o = st.classList.toggle('open'); b.setAttribute('aria-expanded', o); openStages[st.dataset.stage] = o;
      }));
    }, { tab: 'legato' });

    /* ---------- #/lg-level/:id ---------- */
    // Dãy ô nốt của MỘT vòng pattern, nhóm theo vĩ (dấu luyến phủ các ô cùng vĩ)
    function patternHTML(lv) {
      const pl = LG().plan(lv);
      const cycle = lv.pattern.reduce((s, p) => s + p.beats, 0);
      const segs = pl.segs.filter(s => s.b0 < cycle - 1e-9);
      if (!segs.length) return '';
      const kinds = {};
      const groups = [];
      segs.forEach((s, k) => {
        let g = groups[groups.length - 1];
        const prev = segs[k - 1], bd = prev ? pl.bounds[prev.i] : null; // điểm đổi nằm giữa prev và s
        if (!g || (bd && bd.bowChange)) { g = { cells: [], gapBefore: bd && bd.bowChange ? bd : null }; groups.push(g); }
        g.cells.push({ s, bd: g.cells.length ? bd : null });
      });
      const sym = bd => {
        if (!bd) return '';
        if (bd.kind === 'cross') { kinds.cross = 1; return '<span class="lgl-sym cross" aria-hidden="true">⇄</span>'; }
        if (bd.kind === 'note') { kinds.note = 1; return '<span class="lgl-sym note" aria-hidden="true">→</span>'; }
        return '';
      };
      let anyBow = false;
      const html = groups.map((g, gi) => {
        const bowMark = gi > 0 ? (anyBow = true, `<span class="lgl-bowmark" aria-hidden="true"><i></i></span>${g.gapBefore && g.gapBefore.kind === 'cross' ? (kinds.cross = 1, '<span class="lgl-sym cross" aria-hidden="true">⇄</span>') : g.gapBefore && g.gapBefore.kind === 'note' ? (kinds.note = 1, '<span class="lgl-sym note" aria-hidden="true">→</span>') : ''}`) : '';
        const cells = g.cells.map(c => {
          const s = c.s, fin = s.finger ? 'ngón ' + s.finger : 'buông';
          return (c.bd ? sym(c.bd) : '') + `<div class="lgl-cell" style="flex:${s.b1 - s.b0} 1 ${(s.b1 - s.b0) * 14 + 36}px"><b class="num">${esc(s.note)}</b><span>${esc(strVi(s.string))} · ${esc(fin)}</span><em class="num">${f0(s.b1 - s.b0)} phách</em></div>`;
        }).join('');
        return `${bowMark}<div class="lgl-slur"><div class="lgl-arc"></div><div class="lgl-cells">${cells}</div></div>`;
      }).join('');
      const legend = [`<span><i class="lgl-lg arc"></i>cùng một vĩ (luyến)</span>`];
      if (anyBow) legend.push('<span><i class="lgl-lg bow"></i>đổi vĩ</span>');
      if (kinds.cross) legend.push('<span><b class="lgl-lgs">⇄</b>chuyển dây</span>');
      if (kinds.note) legend.push('<span><b class="lgl-lgs">→</b>đổi nốt</span>');
      return `<div class="lgl-pat" tabindex="0" role="group" aria-label="Một vòng của bài tập">${html}</div>
        <div class="lgl-legend">${legend.join('')}</div>
        <p class="muted num" style="font-size:14px;margin-top:8px">Lặp lại ${lv.reps} lần · khoảng ${f0(pl.totalSec)} giây mỗi lượt</p>`;
    }

    // "App chấm gì": chỉ nêu chỉ số áp dụng với level này
    function gradeHTML(lv) {
      const c = lv.criteria || {}, pl = LG().plan(lv), b = pl.bounds || [];
      const on = k => c[k] !== false && c[k] != null;
      const hasBow = b.some(x => x.bowChange && x.kind === 'bow'), hasNote = b.some(x => x.kind === 'note'), hasCross = b.some(x => x.kind === 'cross');
      const out = [];
      if (hasBow && on('bow')) out.push(`Liền tiếng khi đổi vĩ: sụt ≤ ${num(c.bow.maxDipDb)} dB, hở ≤ ${num(c.bow.maxGapMs)} ms`);
      if (hasCross && on('cross')) out.push(`Chuyển dây: chuyển ≤ ${num(c.cross.maxTransMs)} ms, hở ≤ ${num(c.cross.maxGapMs)} ms, tiếng tạp ≤ ${num(c.cross.maxNoiseMs)} ms`);
      if (hasNote && on('join')) out.push(`Nối nốt cùng dây: chuyển ≤ ${num(c.join.maxTransMs)} ms, hở ≤ ${num(c.join.maxGapMs)} ms, tiếng tạp ≤ ${num(c.join.maxNoiseMs)} ms`);
      if (on('pitch')) out.push(`Đúng nốt: lệch ≤ ${num(c.pitch.tolCents)} cents`);
      if (on('even')) out.push(`Đều tiếng trong từng nốt: chênh ≤ ${num(c.even.maxRangeDb)} dB`);
      if (lv.vibrato && on('vib')) {
        const v = c.vib;
        out.push(`Vibrato: ${num(v.rate[0])}–${num(v.rate[1])} Hz, rộng ${num(v.width[0])}–${num(v.width[1])} cents, độ đều ≥ ${num(v.regularityMin)}%${v.center ? ', rung xuống dưới nốt' : ''}`);
        out.push(`Vibrato không đơ sau điểm đổi: đơ ≤ ${num(v.maxFreezeMs)} ms, có rung ≥ ${num(v.minActivePct)}% thời gian`);
      }
      if (on('timing') && b.length >= 2) out.push(`Đúng nhịp: lệch ≤ ${num(c.timing.maxMs)} ms so với phách`);
      return out.map(x => `<li>${esc(x)}</li>`).join('');
    }

    ui.registerRoute('lg-level', function (arg) {
      const lv = safe(() => LG().level(arg), null);
      if (!lv) { ui.view.innerHTML = ui.topbar('Không có level', '#/legato') + '<div class="card empty">Không tìm thấy level này.<p style="margin-top:12px"><a class="btn btn-ghost btn-sm" href="#/legato">Về danh sách Độ mượt</a></p></div>'; return; }
      const S = LG().store, gate = safe(() => S.gate(lv.id), null), n = total();
      const gateTxt = gate ? `Qua level: đạt ${gate.neededPasses || 1} lần${(gate.neededDays || 1) > 1 ? `, rải trên ${gate.neededDays} ngày khác nhau` : ''} · Đang có ${gate.passCount}/${gate.neededPasses || 1} lần${(gate.neededDays || 1) > 1 ? ` · ${gate.dayCount}/${gate.neededDays} ngày` : ''}${gate.levelPassed ? ' · Đã qua level này' : ''}` : '';
      const list = (title, icon, arr) => (arr && arr.length) ? `<div class="card note">${icon}<div><b>${title}</b><ul>${arr.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></div>` : '';
      const vids = (lv.videos || []).map(v => `<a class="card yt" href="${esc(v.url)}" target="_blank" rel="noopener"><div class="yt-th">${I.yt}${v.minutes ? `<span class="dur num">${esc(v.minutes)} phút</span>` : ''}</div><div><b>${esc(v.title)}</b><span>${v.channel ? esc(v.channel) + ' · ' : ''}Xem trên YouTube</span>${v.note ? `<span style="display:block;margin-top:2px">${esc(v.note)}</span>` : ''}</div></a>`).join('');
      const yt = lv.youtube || { title: 'Tìm video', query: 'violin legato' };
      const searchCard = `<a class="card yt" href="${ytUrl(yt.query)}" target="_blank" rel="noopener"><div class="yt-th">${I.yt}</div><div><b>${esc(yt.title)}</b><span>Tìm thêm trên YouTube</span></div></a>`;
      const prev = lv.id > 1 ? `<a class="gold" href="#/lg-level/${lv.id - 1}" style="font-weight:700;padding:10px 4px">‹ M${lv.id - 1}</a>` : '<span></span>';
      const next = lv.id < n ? `<a class="gold" href="#/lg-level/${lv.id + 1}" style="font-weight:700;padding:10px 4px">M${lv.id + 1} ›</a>` : '<span></span>';
      const selfItems = (lv.selfCheck || []).map(x => `<li>${esc(x)}</li>`).join('') + (lv.bowZone ? `<li>Vùng vĩ: ${esc(lv.bowZone)}</li>` : '');
      ui.view.innerHTML = `
        ${ui.topbar('Độ mượt · M' + lv.id, '#/legato')}
        <div class="hero-title"><h2>${esc(lv.title)}</h2>${lv.goal ? `<p>${esc(lv.goal)}</p>` : ''}</div>
        <div class="stack" style="margin-top:12px">
          <div class="tags"><span class="chip">${esc(lv.kindLabel)}</span><span class="chip num">${lv.bpm} BPM</span><span class="chip num">${lv.beatsPerBow} phách mỗi vĩ</span><span class="chip">Vùng vĩ: ${esc(lv.bowZone)} (tự kiểm)</span></div>
          <div><h2 class="sec-title">Bài tập</h2><div class="card">${patternHTML(lv)}</div></div>
          <div><h2 class="sec-title">Cách tập</h2><div class="card"><ol class="steps">${(lv.steps || []).map(s => `<li><span>${esc(s)}</span></li>`).join('')}</ol></div></div>
          ${list('Mẹo', I.bulb, lv.tips)}
          ${list('Lỗi hay gặp', I.warn, lv.mistakes)}
          ${lv.feel ? `<div class="card lgl-feel"><b>Cảm giác đúng</b><p>${esc(lv.feel)}</p></div>` : ''}
          ${selfItems ? `<div class="card crit"><b>Tự kiểm (micro không đo được)</b><ul>${selfItems}</ul></div>` : ''}
          <div><h2 class="sec-title">Video tham khảo</h2><div class="stack">${vids}${searchCard}</div></div>
          <div class="card crit"><b>App chấm gì ở level này</b><ul>${gradeHTML(lv)}</ul>
            <p class="muted num" style="margin-top:8px;font-size:14px">${esc(gateTxt)}</p>
            <p style="margin-top:8px;font-size:14px;font-weight:600">Micro không biết vĩ đang ở gốc hay ngọn: vùng vĩ là phần bạn tự kiểm.</p></div>
          <div class="row between">${prev}${next}</div>
        </div>
        <div class="cta"><a class="btn btn-blue" href="#/lg-take/${lv.id}">${I.play}Bắt đầu tập</a></div>`;
    }, { tab: 'legato' });
  });
})();
