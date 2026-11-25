/* Vibrato Pro — engine (Opus). API: xem SPEC.md §3.
 * Phần lõi thuần (VE._core) không phụ thuộc trình duyệt để test bằng Node. */
(function (root) {
  'use strict';

  // ───────────────────────── Tiện ích ─────────────────────────
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);
  const median = (a) => {
    if (!a.length) return NaN;
    const s = a.slice().sort((x, y) => x - y);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const std = (a) => {
    if (a.length < 2) return 0;
    const m = mean(a);
    return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1));
  };
  const cv = (a) => {
    const m = mean(a);
    return a.length >= 2 && m > 0 ? std(a) / m : 0;
  };
  // "cents tuyệt đối" = midi*100, theo chuẩn A4
  const hzToAbsCents = (hz, a4) => 1200 * Math.log2(hz / a4) + 6900;
  const absCentsToHz = (c, a4) => a4 * Math.pow(2, (c - 6900) / 1200);
  const midiName = (m) => NOTE_NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

  // ───────────────────────── Dò cao độ: YIN ─────────────────────────
  // buf: Float32Array; dùng W mẫu cuối + tauMax. Trả {hz, aperiodicity} hoặc null.
  function yin(buf, sr, minHz, maxHz, W, threshold) {
    threshold = threshold || 0.12;
    const tauMin = Math.max(2, Math.floor(sr / maxHz));
    const tauMax = Math.min(Math.floor(sr / minHz), buf.length - (W || 0) - 1);
    if (!W) W = Math.min(1024, buf.length - tauMax - 1);
    if (tauMax <= tauMin || W < 64) return null;
    const start = buf.length - W - tauMax;
    const d = new Float32Array(tauMax + 1);
    for (let tau = 1; tau <= tauMax; tau++) {
      let s = 0;
      for (let j = 0; j < W; j++) {
        const diff = buf[start + j] - buf[start + j + tau];
        s += diff * diff;
      }
      d[tau] = s;
    }
    // cumulative mean normalized difference
    const cm = new Float32Array(tauMax + 1);
    cm[0] = 1;
    let run = 0;
    for (let tau = 1; tau <= tauMax; tau++) {
      run += d[tau];
      cm[tau] = run > 0 ? (d[tau] * tau) / run : 1;
    }
    let tauEst = -1;
    for (let tau = tauMin; tau <= tauMax; tau++) {
      if (cm[tau] < threshold) {
        while (tau + 1 <= tauMax && cm[tau + 1] < cm[tau]) tau++;
        tauEst = tau;
        break;
      }
    }
    if (tauEst < 0) {
      // không qua ngưỡng: lấy cực tiểu toàn cục nếu đủ tuần hoàn
      let best = tauMin;
      for (let tau = tauMin + 1; tau <= tauMax; tau++) if (cm[tau] < cm[best]) best = tau;
      if (cm[best] > 0.3) return null;
      tauEst = best;
    }
    // nội suy parabol
    let better = tauEst;
    if (tauEst > 1 && tauEst < tauMax) {
      const a = cm[tauEst - 1], b = cm[tauEst], c = cm[tauEst + 1];
      const den = a + c - 2 * b;
      if (den !== 0) better = tauEst + (a - c) / (2 * den);
    }
    return { hz: sr / better, aperiodicity: cm[tauEst] };
  }

  function rmsDb(buf, n) {
    n = Math.min(n || buf.length, buf.length);
    let s = 0;
    for (let i = buf.length - n; i < buf.length; i++) s += buf[i] * buf[i];
    return 10 * Math.log10(s / n + 1e-12);
  }

  // ───────────────────────── Phân tích vibrato ─────────────────────────
  // track: [{t, c}] với c = cents tuyệt đối (null nếu không có tiếng). Đã sắp theo t.
  // opts: { windowSec, noteJump }
  // Trả: { valid, reason, rate, regularity, width, peakOffset, refMidi, center, cycles, segStart }
  function analyzeTrack(track, opts) {
    opts = opts || {};
    const win = opts.windowSec || 3;
    const out = { valid: false, reason: 'NO_SIGNAL', rate: null, regularity: null, width: null,
      peakOffset: null, refMidi: null, center: null, cycles: 0 };
    if (!track.length) return out;
    const tEnd = track[track.length - 1].t;
    const pts = track.filter((p) => p.t >= tEnd - win);
    // đoạn có tiếng liên tục gần nhất (cho phép khoảng lặng <= 0.12 s)
    const seg = [];
    let i = pts.length - 1;
    while (i >= 0) {
      if (pts[i].c != null) { seg.push(pts[i]); i--; continue; }
      let j = i;
      while (j >= 0 && pts[j].c == null) j--;
      if (j < 0) break;
      // khoảng lặng dài hơn 0.12 s (kể cả lặng ở cuối = đã ngừng đàn) → dừng
      const gap = (seg.length ? seg[seg.length - 1].t : tEnd) - pts[j].t;
      if (gap > 0.12) break;
      i = j;
    }
    seg.reverse();
    if (seg.length < 8) return out;
    let dur = seg[seg.length - 1].t - seg[0].t;
    if (dur < 0.6) { out.reason = 'TOO_SHORT'; return out; }

    // lấy mẫu đều 100 Hz
    const fs = 100;
    const resample = (s) => {
      const n = Math.floor((s[s.length - 1].t - s[0].t) * fs) + 1;
      const t0 = s[0].t;
      const ys = new Float64Array(n);
      let k = 0;
      for (let i = 0; i < n; i++) {
        const t = t0 + i / fs;
        while (k < s.length - 2 && s[k + 1].t < t) k++;
        const a = s[k], b = s[k + 1] || a;
        const f = b.t > a.t ? (t - a.t) / (b.t - a.t) : 0;
        ys[i] = a.c + (b.c - a.c) * clamp(f, 0, 1);
      }
      return { ys, t0 };
    };
    let { ys, t0 } = resample(seg);

    // cắt tại lần đổi nốt gần nhất: so trung bình 0.3 s liền kề
    const jump = opts.noteJump || 90;
    const L = Math.round(0.3 * fs);
    if (ys.length > 2 * L) {
      const pre = new Float64Array(ys.length + 1);
      for (let i = 0; i < ys.length; i++) pre[i + 1] = pre[i] + ys[i];
      const avg = (a, b) => (pre[b] - pre[a]) / (b - a);
      let cut = 0;
      for (let i = ys.length - L; i >= L; i--) {
        if (Math.abs(avg(i, i + L) - avg(i - L, i)) > jump) { cut = i; break; }
      }
      if (cut > 0) { ys = ys.slice(cut); t0 += cut / fs; }
    }
    const n = ys.length;
    if (n < 0.6 * fs) { out.reason = 'TOO_SHORT'; return out; }

    // khử xu hướng bậc 2 (trôi cao độ chậm)
    const xs = new Float64Array(n);
    {
      // hồi quy đa thức bậc 2 trên u ∈ [-1,1]
      let S0 = 0, S1 = 0, S2 = 0, S3 = 0, S4 = 0, T0 = 0, T1 = 0, T2 = 0;
      for (let i = 0; i < n; i++) {
        const u = n > 1 ? (2 * i) / (n - 1) - 1 : 0;
        const u2 = u * u, y = ys[i];
        S0 += 1; S1 += u; S2 += u2; S3 += u2 * u; S4 += u2 * u2;
        T0 += y; T1 += y * u; T2 += y * u2;
      }
      // giải hệ 3x3 (Cramer)
      const M = [[S0, S1, S2], [S1, S2, S3], [S2, S3, S4]];
      const det3 = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
      const D = det3(M);
      let c0 = T0 / S0, c1 = 0, c2 = 0;
      if (Math.abs(D) > 1e-9) {
        const rep = (col) => M.map((r, i) => r.map((v, j) => (j === col ? [T0, T1, T2][i] : v)));
        c0 = det3(rep(0)) / D; c1 = det3(rep(1)) / D; c2 = det3(rep(2)) / D;
      }
      for (let i = 0; i < n; i++) {
        const u = n > 1 ? (2 * i) / (n - 1) - 1 : 0;
        xs[i] = ys[i] - (c0 + c1 * u + c2 * u * u);
      }
    }

    // biên độ thô để đặt ngưỡng trễ
    const sorted = Array.from(xs).sort((a, b) => a - b);
    const p05 = sorted[Math.floor(0.05 * (n - 1))], p95 = sorted[Math.floor(0.95 * (n - 1))];
    const roughAmp = (p95 - p05) / 2;
    if (roughAmp < 2) { out.reason = 'NO_CYCLES'; return out; }
    const h = Math.max(1.5, 0.25 * roughAmp);

    // tìm cực trị bằng giao cắt có trễ
    const ext = []; // {t, x, type:+1 đỉnh / -1 đáy}
    let state = 0, bestI = -1;
    for (let i = 0; i < n; i++) {
      const v = xs[i];
      if (state === 0) {
        if (v > h) { state = 1; bestI = i; } else if (v < -h) { state = -1; bestI = i; }
        continue;
      }
      if (state === 1) {
        if (v > xs[bestI]) bestI = i;
        if (v < -h) { ext.push(refine(bestI, 1)); state = -1; bestI = i; }
      } else {
        if (v < xs[bestI]) bestI = i;
        if (v > h) { ext.push(refine(bestI, -1)); state = 1; bestI = i; }
      }
    }
    function refine(i, type) {
      let off = 0, val = xs[i], absv = ys[i];
      if (i > 0 && i < n - 1) {
        const a = xs[i - 1], b = xs[i], c = xs[i + 1];
        const den = a + c - 2 * b;
        if (den !== 0) {
          off = clamp((a - c) / (2 * den), -0.5, 0.5);
          val = b - 0.25 * (a - c) * off;
          absv = ys[i] + (val - b);
        }
      }
      return { t: t0 + (i + off) / fs, x: val, abs: absv, type };
    }
    // bỏ cực trị đầu tiên nếu nằm sát mép (có thể bị cụt)
    if (ext.length && (ext[0].t - t0) * fs < 2) ext.shift();

    if (ext.length < 5) { out.reason = ext.length < 3 ? 'NO_CYCLES' : 'TOO_SHORT'; return out; }

    const peaks = ext.filter((e) => e.type === 1);
    const troughs = ext.filter((e) => e.type === -1);
    const periods = [];
    for (let i = 1; i < peaks.length; i++) periods.push(peaks[i].t - peaks[i - 1].t);
    for (let i = 1; i < troughs.length; i++) periods.push(troughs[i].t - troughs[i - 1].t);
    const amps = [];
    for (let i = 1; i < ext.length; i++) amps.push(Math.abs(ext[i].x - ext[i - 1].x));
    if (periods.length < 2) { out.reason = 'TOO_SHORT'; return out; }

    const rate = 1 / mean(periods);
    const width = median(amps);
    // Độ đều: 100 × (1 − √(CV chu kỳ² + CV biên độ²)). Sai lệch lớn ở bất kỳ mặt nào đều kéo điểm xuống.
    const regularity = clamp(100 * (1 - Math.hypot(cv(periods), cv(amps))), 0, 100);
    const peakAbs = median(peaks.map((p) => p.abs));
    const refMidi = Math.round(peakAbs / 100);
    const peakOffset = peakAbs - refMidi * 100;
    const aboveLimit = Math.max(8, 0.3 * width);
    const center = peakOffset > aboveLimit ? 'above' : peakOffset < -15 ? 'flat' : 'below';

    out.valid = rate >= 0.6 && rate <= 12;
    out.reason = out.valid ? null : 'NO_CYCLES';
    out.rate = rate;
    out.width = width;
    out.regularity = regularity;
    out.peakOffset = peakOffset;
    out.refMidi = refMidi;
    out.center = center;
    out.cycles = (ext.length - 1) / 2;
    return out;
  }

  const CENTER_LABEL = { below: 'Dưới nốt', above: 'Trên nốt', flat: 'Thấp cả nốt' };

  function evaluate(core, criteria) {
    const c = criteria || {};
    const r = c.rate || [0, 99], w = c.width || [0, 999];
    const v = core.valid;
    const checks = {
      rate: { value: core.rate, min: r[0], max: r[1], ok: v && core.rate >= r[0] && core.rate <= r[1] },
      regularity: { value: core.regularity, min: c.regularityMin || 0, ok: v && core.regularity >= (c.regularityMin || 0) },
      width: { value: core.width, min: w[0], max: w[1], ok: v && core.width >= w[0] && core.width <= w[1] },
      center: { value: core.center, ok: v && (!c.center || core.center === 'below') },
    };
    const allOk = checks.rate.ok && checks.regularity.ok && checks.width.ok && checks.center.ok;
    const nOk = ['rate', 'regularity', 'width', 'center'].filter((k) => checks[k].ok).length;
    return { checks, allOk, nOk };
  }

  // ───────────────────────── Đồng hồ "giữ đạt" (SPEC §13) ─────────────────────────
  // Đổi cung thường để hở tiếng một thoáng. Hở ngắn thì đồng hồ TẠM DỪNG chứ không về 0, rồi cho một khoảng để bắt lại vibrato.
  // Chống lỗ hổng: thời gian hở và thời gian bắt lại KHÔNG cộng vào held; mỗi lượt giữ chỉ được ân hạn maxGraces lần.
  const HOLD = {
    minGapSec: 0.1,     // lặng ngắn hơn mức này không coi là khoảng hở (analyzeTrack tự nối ≤ 0,12 s)
    gapMaxSec: 0.3,     // hở dài hơn mức này → về 0 như cũ
    recoverSec: 1.5,    // sau khoảng hở, có bấy nhiêu giây để các chỉ số đạt lại
    recoverCycles: 4,   // vibrato chậm: cho ít nhất 4 chu kỳ ở tốc độ thấp nhất của level
    maxGraces: 2,       // số khoảng hở được tha trong một lượt giữ
    noteChangeSec: 0.6, // luật cũ: TOO_SHORT khi đổi nốt (không hở tiếng) được chờ tối đa 0,6 s
  };
  // Khoảng lặng gần nhất trong track (dài ≥ minLen, có tiếng ở phía trước). Trả {start, end, len, ongoing} hoặc null.
  function lastGap(track, minLen) {
    let i = track.length - 1;
    if (i < 0) return null;
    const tEnd = track[i].t;
    while (i >= 0 && track[i].t >= tEnd - 3) {
      if (track[i].c != null) { i--; continue; }
      let j = i;
      while (j >= 0 && track[j].c == null) j--;
      if (j < 0) return null; // lặng từ đầu: chưa bắt đầu kéo
      const ongoing = i === track.length - 1;
      const end = ongoing ? tEnd : track[i + 1].t, start = track[j].t;
      if (end - start >= minLen) return { start, end, len: end - start, ongoing };
      i = j;
    }
    return null;
  }
  // makeHold(opts) → { update(t, dt, coreM, allOk, track) → held, held, paused, graces }
  function makeHold(opts) {
    const H = Object.assign({}, HOLD, opts || {});
    const recover = Math.max(H.recoverSec, H.rateLo > 0 ? H.recoverCycles / H.rateLo : 0);
    let held = 0, invalidRun = 0, grace = null, used = 0, lastOkT = -1e9;
    const reset = () => { held = 0; invalidRun = 0; grace = null; used = 0; };
    return {
      get held() { return held; }, get paused() { return !!grace; }, get graces() { return used; },
      update(t, dt, m, allOk, track) {
        const g = lastGap(track, H.minGapSec);
        const fresh = !!g && (g.ongoing ? t : g.end) > lastOkT + 1e-6; // khoảng hở xảy ra sau lần đạt gần nhất
        if (fresh && g.len > H.gapMaxSec) { reset(); return held; }      // hở dài: về 0 (kể cả khi đang ân hạn)
        if (allOk) { held += dt; invalidRun = 0; grace = null; lastOkT = t; return held; }
        if (held <= 0) { reset(); return held; }
        if (grace) {
          if (fresh && g.start > grace.gapStart + 0.01) { // lại hở lần nữa trong lúc đang bắt lại
            if (++used > H.maxGraces) { reset(); return held; }
            grace.gapStart = g.start; grace.left = recover;
          }
          if (!(g && g.ongoing)) grace.left -= dt;         // chỉ đếm khi đã có tiếng lại
          if (grace.left < -1e-9) reset();
          return held;
        }
        if (fresh) { // hở ngắn: tạm dừng đồng hồ, bắt đầu ân hạn
          if (used >= H.maxGraces) { reset(); return held; }
          used++; grace = { gapStart: g.start, left: recover };
          if (!g.ongoing) grace.left -= dt;
          return held;
        }
        if (!m.valid && m.reason === 'TOO_SHORT' && invalidRun + dt <= H.noteChangeSec) { invalidRun += dt; return held; } // đổi nốt, không hở
        reset(); return held;
      },
    };
  }

  const core = { yin, rmsDb, analyzeTrack, evaluate, hzToAbsCents, absCentsToHz, midiName, median, mean, std, HOLD, lastGap, makeHold };

  // Không có trình duyệt (Node test): chỉ xuất phần lõi
  const hasDOM = typeof root.document !== 'undefined' || typeof root.AudioContext !== 'undefined';

  // ───────────────────────── Lưu trữ ─────────────────────────
  const KEY = 'vibratoPro.v1';
  let mem = null;
  const blank = () => ({ settings: { a4: 440, instrument: 'violin', sensitivity: 0.7, theme: 'dark', coachProvider: 'auto', coachPass: '', passMode: 'fast' },
    takes: [], practice: [], gates: {}, calibration: null });
  function load() {
    if (mem) return mem;
    try {
      const raw = root.localStorage && root.localStorage.getItem(KEY);
      mem = raw ? Object.assign(blank(), JSON.parse(raw)) : blank();
      mem.settings = Object.assign(blank().settings, mem.settings || {});
    } catch (e) { mem = blank(); }
    return mem;
  }
  function save() {
    try { root.localStorage && root.localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* bộ nhớ đầy / chế độ riêng tư */ }
  }
  const pad = (x) => String(x).padStart(2, '0');
  const dayKey = (ts) => { const d = new Date(ts); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const dayLabel = (ts) => WD[new Date(ts).getDay()];
  // Tốc độ qua level (người dùng chọn trong Cài đặt)
  const PASS_MODES = [
    { id: 'fast', label: 'Nhanh', desc: 'Đạt 1 lần là qua', passes: 1, days: 1 },
    { id: 'standard', label: 'Chuẩn', desc: 'Đạt 3 lần', passes: 3, days: 1 },
    { id: 'thorough', label: 'Kỹ', desc: 'Đạt 3 lần trên 2 ngày khác nhau', passes: 3, days: 2 },
  ];
  const maxLevel = () => (root.LEVELS && root.LEVELS.length) || 100;
  const stageOf = (id) => (root.STAGES || []).find((s) => id >= s.range[0] && id <= s.range[1]) || null;

  const settings = {
    get: () => Object.assign({}, load().settings),
    set: (p) => { load(); Object.assign(mem.settings, p || {}); save(); if (p && 'coachProvider' in p) healthCache = null; if (p && 'passMode' in p) syncPassed(); },
  };

  // Mã lỗi gọn cho HLV AI: chỉ số nào trượt và trượt về phía nào
  function failCodes(ch) {
    if (!ch) return [];
    const f = [];
    if (ch.rate && !ch.rate.ok && ch.rate.value != null) f.push(ch.rate.value < ch.rate.min ? 'rate_low' : 'rate_high');
    if (ch.regularity && !ch.regularity.ok && ch.regularity.value != null) f.push('reg_low');
    if (ch.width && !ch.width.ok && ch.width.value != null) f.push(ch.width.value < ch.width.min ? 'width_narrow' : 'width_wide');
    if (ch.center && !ch.center.ok && ch.center.value) f.push('center_' + ch.center.value);
    return f;
  }

  const need = () => PASS_MODES.find((m) => m.id === settings.get().passMode) || PASS_MODES[0];
  const meets = (g) => { const n = need(); return g.passes.length >= n.passes && new Set(g.passes.map((p) => p.dayKey)).size >= n.days; };
  // Qua level N → mọi level trước N tính là đã qua
  function cascade(levelId, ts) {
    for (let k = 1; k < levelId; k++) {
      const gk = mem.gates[k] || (mem.gates[k] = { passes: [], passed: false });
      if (!gk.passed) { gk.passed = true; gk.passedAt = ts; gk.testedOut = true; }
    }
  }
  // Đổi sang chế độ dễ hơn: level nào đã đủ số lần thì tính là qua ngay
  function syncPassed() {
    load();
    let changed = false;
    Object.keys(mem.gates).map(Number).sort((a, b) => b - a).forEach((id) => {
      const g = mem.gates[id];
      if (g && !g.passed && meets(g)) { g.passed = true; g.passedAt = Date.now(); cascade(id, g.passedAt); changed = true; }
    });
    if (changed) save();
  }

  function gateOf(id) {
    const g = load().gates[id] || { passes: [], passed: false };
    const days = new Set(g.passes.map((p) => p.dayKey));
    const n = need();
    return { passCount: g.passes.length, dayCount: days.size, neededPasses: n.passes, neededDays: n.days,
      levelPassed: !!g.passed, justPassed: false };
  }

  const store = {
    recordTake(levelId, take) {
      load();
      const ts = Date.now();
      const m = (take && take.metrics) || {};
      mem.takes.unshift({ ts, levelId, pass: !!take.pass, mode: take.mode || 'measure',
        rate: m.rate != null ? +m.rate.toFixed(2) : null, width: m.width != null ? +m.width.toFixed(1) : null,
        regularity: m.regularity != null ? Math.round(m.regularity) : null, durationSec: Math.round(take.durationSec || 0),
        fails: failCodes(m.checks) });
      if (mem.takes.length > 3000) mem.takes.length = 3000;
      const g = mem.gates[levelId] || (mem.gates[levelId] = { passes: [], passed: false });
      let justPassed = false;
      if (take.pass && !g.passed) {
        g.passes.push({ ts, dayKey: dayKey(ts) });
        if (meets(g)) { g.passed = true; g.passedAt = ts; justPassed = true; cascade(levelId, ts); }
      }
      save();
      const out = gateOf(levelId);
      out.justPassed = justPassed;
      return out;
    },
    gate: gateOf,
    currentLevel() {
      const G = load().gates;
      for (let i = 1; i <= maxLevel(); i++) if (!(G[i] && G[i].passed)) return i;
      return maxLevel();
    },
    status(id) {
      const G = load().gates;
      if (G[id] && G[id].passed) return 'passed';
      return id === store.currentLevel() ? 'current' : 'open'; // mọi level đều mở
    },
    logPractice(seconds) {
      if (!(seconds > 0)) return;
      load(); mem.practice.push({ ts: Date.now(), seconds: Math.round(seconds) });
      if (mem.practice.length > 5000) mem.practice.splice(0, mem.practice.length - 5000);
      save();
    },
    streak() {
      load();
      const days = new Set(mem.practice.map((p) => dayKey(p.ts)).concat(mem.takes.map((t) => dayKey(t.ts))));
      let d = new Date(); d.setHours(12, 0, 0, 0);
      if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1);
      let n = 0;
      while (days.has(dayKey(d.getTime()))) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },
    takes(days) {
      const since = Date.now() - (days || 3650) * 864e5;
      return load().takes.filter((t) => t.ts >= since).map((t) => Object.assign({}, t));
    },
    daily(days) {
      load();
      days = days || 7;
      const out = [];
      const today = new Date(); today.setHours(12, 0, 0, 0);
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const k = dayKey(d.getTime());
        const tk = mem.takes.filter((t) => dayKey(t.ts) === k && t.rate != null);
        const mins = mem.practice.filter((p) => dayKey(p.ts) === k).reduce((s, p) => s + p.seconds, 0) / 60;
        out.push({ dayKey: k, label: days <= 7 ? dayLabel(d.getTime()) : (d.getDate() + '/' + (d.getMonth() + 1)),
          rate: tk.length ? +mean(tk.map((t) => t.rate)).toFixed(2) : null,
          width: tk.length ? +mean(tk.map((t) => t.width)).toFixed(1) : null,
          minutes: Math.round(mins) });
      }
      return out;
    },
    heat(days) {
      load();
      days = days || 7;
      const rows = store.daily(days).map((d) => ({ dayKey: d.dayKey, label: d.label, sang: 0, chieu: 0, toi: 0 }));
      const idx = Object.fromEntries(rows.map((r, i) => [r.dayKey, i]));
      mem.practice.forEach((p) => {
        const i = idx[dayKey(p.ts)];
        if (i == null) return;
        const hr = new Date(p.ts).getHours();
        const slot = hr < 12 ? 'sang' : hr < 18 ? 'chieu' : 'toi';
        rows[i][slot] += p.seconds / 60;
      });
      rows.forEach((r) => { r.sang = Math.round(r.sang); r.chieu = Math.round(r.chieu); r.toi = Math.round(r.toi); });
      return rows;
    },
    saveCalibration(obj) { load(); mem.calibration = Object.assign({ ts: Date.now() }, obj); save(); },
    lastCalibration() { const c = load().calibration; return c ? Object.assign({}, c) : null; },
    reset() { mem = blank(); save(); },
  };

  // ───────────────────────── Máy chủ & HLV AI (SPEC §8.1) ─────────────────────────
  let healthCache = null, healthAt = 0;
  const server = {
    async health(force) {
      const none = { ok: false, hand: false, auth: 'none', coach: { active: null, ollama: { ok: false, model: null }, claude: { configured: false, model: null } } };
      try {
        if (!root.fetch || (root.location && root.location.protocol === 'file:')) return none;
        if (!force && healthCache && Date.now() - healthAt < 10000) return healthCache;
        const ctl = root.AbortController ? new AbortController() : null;
        const tm = setTimeout(() => ctl && ctl.abort(), 3500);
        const pv = encodeURIComponent(settings.get().coachProvider || 'auto');
        const r = await root.fetch('/api/health?provider=' + pv, { cache: 'no-store', signal: ctl && ctl.signal });
        clearTimeout(tm);
        if (!r.ok) { healthCache = none; healthAt = Date.now() + 20000; return none; } // host tĩnh: nhớ 30 s, khỏi hỏi lại
        const j = await r.json();
        healthCache = Object.assign(none, j, { ok: true }); healthAt = Date.now();
        return healthCache;
      } catch (e) { return none; }
    },
  };

  const lv = (id) => (root.LEVELS || []).find((l) => l.id === id) || null;
  const r2 = (x, d) => (x == null || isNaN(x) ? null : +(+x).toFixed(d == null ? 1 : d));
  const coach = {
    // Số liệu gửi cho AI — gọn, chỉ những gì có thật trong máy
    summary(days) {
      days = days || 7;
      const cur = store.currentLevel();
      const L = lv(cur);
      const st = L && (root.STAGES || []).find((s) => s.id === L.stage);
      const takes = store.takes(days).filter((t) => t.mode !== 'self');
      const failCounts = {};
      takes.forEach((t) => (t.fails || []).forEach((f) => { failCounts[f] = (failCounts[f] || 0) + 1; }));
      const byLevel = {};
      takes.forEach((t) => { const b = byLevel[t.levelId] || (byLevel[t.levelId] = { takes: 0, passes: 0 }); b.takes++; if (t.pass) b.passes++; });
      const passedCount = (root.LEVELS || []).filter((l) => store.status(l.id) === 'passed').length;
      return {
        today: dayKey(Date.now()),
        currentLevel: L ? { id: L.id, title: L.title, stage: L.stage, stageName: st ? st.name : null, mode: L.mode, criteria: L.criteria || null, gate: store.gate(L.id) } : null,
        stageLevels: st ? (root.LEVELS || []).filter((l) => l.stage === st.id).map((l) => ({ id: l.id, title: l.title, status: store.status(l.id) })) : [],
        levelsPassed: passedCount,
        streakDays: store.streak(),
        daily: store.daily(days).map((d) => ({ day: d.dayKey, minutes: d.minutes, rate: d.rate, width: d.width })),
        recentTakes: takes.slice(0, 15).map((t) => ({ levelId: t.levelId, pass: t.pass, rate: t.rate, width: t.width, regularity: t.regularity,
          fails: t.fails || [], minutesAgo: Math.round((Date.now() - t.ts) / 60000) })),
        failCounts,
        byLevel,
      };
    },
    async ask(opts) {
      opts = opts || {};
      const h = await server.health(true);
      if (!h.ok) { const e = new Error('Cần máy chủ trên Mac'); e.code = 'NO_SERVER'; throw e; }
      if (!h.coach || !h.coach.active) { const e = new Error('AI chưa chạy'); e.code = 'AI_DOWN'; throw e; }
      const L = lv(opts.levelId || store.currentLevel());
      const take = opts.take ? {
        pass: !!opts.take.pass, durationSec: r2(opts.take.durationSec, 0),
        rate: r2(opts.take.metrics && opts.take.metrics.rate, 2), width: r2(opts.take.metrics && opts.take.metrics.width),
        regularity: r2(opts.take.metrics && opts.take.metrics.regularity, 0),
        center: opts.take.metrics ? opts.take.metrics.center : null,
        fails: failCodes(opts.take.metrics && opts.take.metrics.checks),
        gate: opts.take.gate || null,
        hand: opts.take.hand || null, // tham khảo từ camera, nếu có
      } : null;
      const body = {
        kind: opts.kind === 'week' ? 'week' : 'take',
        provider: settings.get().coachProvider || 'auto',
        level: L ? { id: L.id, title: L.title, goal: L.goal, mode: L.mode, criteria: L.criteria || null, tips: L.tips, mistakes: L.mistakes } : null,
        take,
        summary: coach.summary(opts.kind === 'week' ? 7 : 3),
      };
      const t0 = Date.now();
      const ctl = root.AbortController ? new AbortController() : null;
      const tm = setTimeout(() => ctl && ctl.abort(), 60000);
      let r;
      try {
        const hd = { 'Content-Type': 'application/json' };
        const pass = (settings.get().coachPass || '').trim();
        if (pass) hd['X-Vibrato-Pass'] = pass;
        r = await root.fetch('/api/coach', { method: 'POST', headers: hd, body: JSON.stringify(body), signal: ctl && ctl.signal });
      } catch (err) {
        clearTimeout(tm);
        const e = new Error(err && err.name === 'AbortError' ? 'AI trả lời quá lâu' : 'Mất kết nối máy chủ');
        e.code = err && err.name === 'AbortError' ? 'TIMEOUT' : 'NO_SERVER'; throw e;
      }
      clearTimeout(tm);
      let j = null;
      try { j = await r.json(); } catch (e) { /* trả về không phải JSON */ }
      if (!r.ok || !j || !j.text) {
        const e = new Error((j && j.error) || 'AI gặp lỗi');
        e.code = (j && j.code) || (r.status === 401 ? 'AUTH' : r.status === 503 ? 'AI_DOWN' : 'AI_ERROR'); throw e;
      }
      return { text: String(j.text), provider: j.provider || null, model: j.model || null, ms: Date.now() - t0 };
    },
  };

  if (!hasDOM) {
    root.VE = { PASS_MODES, _core: core, settings, store, server, coach, _dayKey: dayKey };
    return;
  }

  // ───────────────────────── Âm thanh ─────────────────────────
  let ctx = null;
  function audio() {
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) { const e = new Error('Trình duyệt không hỗ trợ Web Audio'); e.code = 'UNSUPPORTED'; throw e; }
    if (!ctx || ctx.state === 'closed') ctx = new AC({ latencyHint: 'interactive' });
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  const isDemoURL = () => { try { return /[?&]demo=1\b/.test(root.location.search); } catch (e) { return false; } };

  // Tiếng dây tổng hợp: sawtooth + lọc thông thấp + vài cộng hưởng thân đàn
  function stringVoice(ac, dest) {
    const osc = ac.createOscillator(); osc.type = 'sawtooth';
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3500; lp.Q.value = 0.7;
    const b1 = ac.createBiquadFilter(); b1.type = 'peaking'; b1.frequency.value = 280; b1.gain.value = 6; b1.Q.value = 2;
    const b2 = ac.createBiquadFilter(); b2.type = 'peaking'; b2.frequency.value = 2800; b2.gain.value = 5; b2.Q.value = 1.5;
    const g = ac.createGain(); g.gain.value = 0;
    osc.connect(lp); lp.connect(b1); b1.connect(b2); b2.connect(g); g.connect(dest);
    return { osc, gain: g };
  }
  // Gắn vibrato vào osc.detune: dao động từ 0 xuống -width (rung dưới nốt)
  function attachVibrato(ac, osc, rate, width, t0, opts) {
    opts = opts || {};
    const lfo = ac.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = rate;
    const depth = ac.createGain(); depth.gain.value = 0;
    lfo.connect(depth); depth.connect(osc.detune);
    const off = ac.createConstantSource ? ac.createConstantSource() : null;
    let offGain = null;
    if (off) { offGain = ac.createGain(); offGain.gain.value = 0; off.connect(offGain); offGain.connect(osc.detune); off.start(t0); }
    const fadeIn = opts.fadeIn || 0.4;
    depth.gain.setValueAtTime(0, t0);
    depth.gain.linearRampToValueAtTime(width / 2, t0 + fadeIn);
    if (offGain) { offGain.gain.setValueAtTime(0, t0); offGain.gain.linearRampToValueAtTime(-width / 2, t0 + fadeIn); }
    lfo.start(t0);
    let wob = null;
    if (opts.wobble) { // dao động chậm nhỏ để giống người thật
      wob = ac.createOscillator(); wob.frequency.value = 0.31;
      const wg = ac.createGain(); wg.gain.value = rate * 0.04; wob.connect(wg); wg.connect(lfo.frequency); wob.start(t0);
    }
    return { stop: (t) => { try { lfo.stop(t); off && off.stop(t); wob && wob.stop(t); } catch (e) {} } };
  }

  let sampleNodes = null;
  function playSample(level) {
    stopSample();
    const ac = audio();
    const s = settings.get();
    const demo = (level && level.demo) || { rate: 5.5, width: 30, midi: 69 };
    const t0 = ac.currentTime + 0.05, dur = 4;
    const v = stringVoice(ac, ac.destination);
    v.osc.frequency.value = absCentsToHz(demo.midi * 100, s.a4);
    const vib = attachVibrato(ac, v.osc, demo.rate, demo.width, t0 + 0.3, { fadeIn: 0.5 });
    v.gain.gain.setValueAtTime(0, t0);
    v.gain.gain.linearRampToValueAtTime(0.18, t0 + 0.15);
    v.gain.gain.setValueAtTime(0.18, t0 + dur - 0.35);
    v.gain.gain.linearRampToValueAtTime(0, t0 + dur);
    v.osc.start(t0); v.osc.stop(t0 + dur + 0.05); vib.stop(t0 + dur + 0.05);
    sampleNodes = { v, vib };
    return new Promise((res) => { v.osc.onended = () => { if (sampleNodes && sampleNodes.v === v) sampleNodes = null; res(); }; });
  }
  function stopSample() {
    if (!sampleNodes) return;
    try { const t = ctx.currentTime; sampleNodes.v.gain.gain.cancelScheduledValues(t); sampleNodes.v.gain.gain.setTargetAtTime(0, t, 0.03); sampleNodes.v.osc.stop(t + 0.15); sampleNodes.vib.stop(t + 0.15); } catch (e) {}
    sampleNodes = null;
  }

  // ───────────────────────── Metronome ─────────────────────────
  let noiseBuf = null, metroTap = null;
  const metronome = {
    running: false, bpm: 60, muted: false, accentEvery: 4, _t0: 0, _timer: null, _next: 0, _beat: 0, _cb: null, _timeouts: [],
    start(bpm, onBeat) {
      this.stop();
      const ac = audio();
      this.bpm = clamp(bpm || 60, 30, 240); this._cb = onBeat || null; this._beat = 0;
      this._next = ac.currentTime + 0.08; this.running = true;
      this._t0 = this._next; // thời điểm (AudioContext) của phách 0 — phần Độ mượt dùng để dựng lưới phách
      // Tiếng tích là nhiễu lọc dải ngắn (không có cao độ) để micro không nhận nhầm thành nốt nhạc
      if (!noiseBuf || noiseBuf.sampleRate !== ac.sampleRate) {
        noiseBuf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.015), ac.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
      }
      const tick = () => {
        while (this._next < ac.currentTime + 0.12) {
          const t = this._next, accent = this._beat % (this.accentEvery || 4) === 0, beat = this._beat;
          if (!this.muted) { // muted: vẫn giữ lưới phách và onBeat, chỉ không phát tiếng (Độ mượt: metronome chỉ nháy)
            const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
            src.buffer = noiseBuf; bp.type = 'bandpass'; bp.frequency.value = accent ? 3800 : 2600; bp.Q.value = 0.9;
            g.gain.value = accent ? 1.6 : 1.0;
            src.connect(bp); bp.connect(g); g.connect(ac.destination);
            if (metroTap) g.connect(metroTap); // chế độ demo: giả lập micro thu cả tiếng metronome
            src.start(t);
          }
          if (this._cb) {
            const delay = Math.max(0, (t - ac.currentTime) * 1000);
            const id = setTimeout(() => { if (this.running && this._cb) this._cb(beat); }, delay);
            this._timeouts.push(id); if (this._timeouts.length > 32) this._timeouts.shift();
          }
          this._next += 60 / this.bpm; this._beat++;
        }
      };
      tick();
      this._timer = setInterval(tick, 25);
    },
    setBpm(bpm) { this.bpm = clamp(bpm, 30, 240); },
    stop() {
      this.running = false;
      if (this._timer) clearInterval(this._timer);
      this._timer = null; this._timeouts.forEach(clearTimeout); this._timeouts = [];
    },
  };

  // ───────────────────────── Đầu vào: micro hoặc tín hiệu demo ─────────────────────────
  async function openInput(opts) {
    const ac = audio();
    const analyser = ac.createAnalyser();
    analyser.fftSize = 4096; analyser.smoothingTimeConstant = 0;
    const s = settings.get();
    if (opts.demo) {
      const d = opts.demoParams || { rate: 5.5, width: 30, midi: 73 };
      const v = stringVoice(ac, analyser);
      v.osc.frequency.value = absCentsToHz(d.midi * 100, s.a4);
      const t0 = ac.currentTime + 0.02;
      const vib = attachVibrato(ac, v.osc, d.rate, d.width, t0 + 0.2, { fadeIn: 0.6, wobble: true });
      v.gain.gain.setValueAtTime(0, t0);
      v.gain.gain.setValueAtTime(0.25, t0 + (d.delay || 0));
      // Chỉ ở chế độ demo: ?demo=1&gap=1 (hoặc gap=<giây>) tạo chỗ hở tiếng mỗi 4 giây, giả lập đổi cung, để thử luật giữ đạt (SPEC §13)
      let gap = 0;
      try { const m = /[?&]gap=([\d.]+)/.exec(root.location.search); if (m) gap = +m[1] === 1 ? 0.2 : clamp(+m[1] || 0, 0, 2); } catch (e) { /* không có location */ }
      if (gap > 0 && !d.delay) for (let k = 1; k <= 30; k++) { v.gain.gain.setValueAtTime(0, t0 + 4 * k); v.gain.gain.setValueAtTime(0.25, t0 + 4 * k + gap); }
      v.osc.start(t0);
      // im lặng ra loa để không cần nghe; vẫn phải nối tới destination cho một số trình duyệt chạy đồ thị
      const mute = ac.createGain(); mute.gain.value = 0; analyser.connect(mute); mute.connect(ac.destination);
      if (!opts.noMetroTap) metroTap = analyser;
      return { analyser, close: () => { if (metroTap === analyser) metroTap = null; try { vib.stop(0); v.osc.stop(); v.gain.disconnect(); mute.disconnect(); } catch (e) {} } };
    }
    // iOS Safari: giữ loa ngoài khi đang thu micro (để metronome không chuyển sang loa thoại)
    try { if (root.navigator.audioSession) root.navigator.audioSession.type = 'play-and-record'; } catch (e) {}
    if (!root.isSecureContext) { const e = new Error('Cần mở trang qua https để dùng micro'); e.code = 'INSECURE'; throw e; }
    const md = root.navigator && root.navigator.mediaDevices;
    if (!md || !md.getUserMedia) { const e = new Error('Trình duyệt không hỗ trợ micro'); e.code = 'UNSUPPORTED'; throw e; }
    let stream;
    try {
      stream = await md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } });
    } catch (err) {
      const e = new Error('Không mở được micro');
      e.code = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError') ? 'DENIED' : 'NO_MIC';
      throw e;
    }
    const src = ac.createMediaStreamSource(stream);
    const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 80;
    src.connect(hp); hp.connect(analyser);
    return { analyser, close: () => { try { stream.getTracks().forEach((t) => t.stop()); src.disconnect(); hp.disconnect(); } catch (e) {} } };
  }

  // Bộ lọc khung: loại cú nhảy ngắn (tiếng gõ metronome, tiếng cọ cung, lỗi quãng tám).
  // Khung lệch > 150 cents so với trung vị 0,3 s gần nhất bị bỏ (thành khoảng lặng ngắn),
  // trừ khi lệch kéo dài ≥ 70 ms — khi đó là đổi nốt thật và được chấp nhận.
  function makeFrameTracker() {
    let hist = [], pend = [];
    return function (hz, t) {
      if (hz == null) { pend = []; return null; }
      hist = hist.filter((h) => h.t >= t - 0.3);
      if (hist.length < 4) { hist.push({ t, hz }); return hz; }
      const m = median(hist.map((h) => h.hz));
      if (Math.abs(1200 * Math.log2(hz / m)) <= 150) { pend = []; hist.push({ t, hz }); return hz; }
      pend.push({ t, hz });
      if (pend[pend.length - 1].t - pend[0].t >= 0.07) { hist = pend.slice(); pend = []; return hz; }
      return null;
    };
  }

  function voicingThreshold(sens) { return -28 - clamp(sens, 0, 1) * 32; } // 0.7 → -50 dB

  // ───────────────────────── Phiên đo ─────────────────────────
  function createSession(level, opts) {
    opts = opts || {};
    const demo = !!(opts.demo || isDemoURL());
    const crit = (level && level.criteria) || { rate: [4.5, 7], regularityMin: 70, width: [15, 60], center: true, holdSec: 4 };
    const holdNeeded = crit.holdSec || 4;
    const windowSec = Math.max(3, Math.min(5, 3.5 / ((crit.rate && crit.rate[0]) || 1)));
    const noteJump = Math.max(90, ((crit.width && crit.width[1]) || 60) + 30);
    const L = { frame: new Set(), metrics: new Set(), done: new Set() };
    const emit = (k, v) => L[k].forEach((cb) => { try { cb(v); } catch (e) { console.error(e); } });
    let input = null, timer = null, startT = 0, track = [], lastMetricsT = 0, held = 0;
    let hold = makeHold({ rateLo: crit.rate && crit.rate[0] });
    let refMidi = null, best = null, finished = false, running = false;
    const tracker = makeFrameTracker();
    const st = settings.get();
    const minHz = st.instrument === 'viola' ? 120 : 180;
    const maxHz = 2600;
    const thr = voicingThreshold(st.sensitivity);
    let buf = null;

    function step() {
      const ac = ctx;
      const an = input.analyser;
      if (!buf) buf = new Float32Array(an.fftSize);
      an.getFloatTimeDomainData(buf);
      const t = ac.currentTime - startT;
      const W = Math.min(1024, Math.floor(ac.sampleRate * 0.022));
      const need = W + Math.floor(ac.sampleRate / minHz) + 2;
      const view = buf.length > need ? buf.subarray(buf.length - need) : buf;
      const db = rmsDb(view, W);
      let hz = null;
      if (db > thr) {
        const p = yin(view, ac.sampleRate, minHz, maxHz, W, 0.12);
        if (p && p.aperiodicity < 0.25) hz = p.hz;
      }
      hz = tracker(hz, t);
      const c = hz != null ? hzToAbsCents(hz, st.a4) : null;
      track.push({ t, c });
      while (track.length && track[0].t < t - 6) track.shift();
      let noteName = null, centsFromNote = null, centsFromRef = null, refName = null;
      if (c != null) {
        const nm = Math.round(c / 100);
        noteName = midiName(nm); centsFromNote = c - nm * 100;
        const r = refMidi != null && Math.abs(c - refMidi * 100) < 150 ? refMidi : nm;
        centsFromRef = c - r * 100; refName = midiName(r);
      }
      emit('frame', { t, voiced: c != null, hz, noteName, centsFromNote, centsFromRef, refNoteName: refName, db });

      if (t - lastMetricsT >= 0.25) {
        const dt = lastMetricsT ? t - lastMetricsT : 0;
        lastMetricsT = t;
        const coreM = analyzeTrack(track, { windowSec, noteJump });
        if (coreM.valid) refMidi = coreM.refMidi;
        const ev = evaluate(coreM, crit);
        held = hold.update(t, dt, coreM, ev.allOk, track); // hở ngắn lúc đổi cung: tạm dừng, không về 0 (SPEC §13)
        const m = {
          valid: coreM.valid, reason: coreM.reason, rate: coreM.rate, regularity: coreM.regularity, width: coreM.width,
          peakOffset: coreM.peakOffset, center: coreM.valid ? coreM.center : null,
          centerLabel: coreM.valid ? CENTER_LABEL[coreM.center] : '—',
          checks: ev.checks, allOk: ev.allOk, heldSec: Math.min(held, holdNeeded), holdNeeded, holdPaused: hold.paused,
        };
        if (coreM.valid && (!best || ev.nOk > best._n || (ev.nOk === best._n && ev.allOk))) best = Object.assign({ _n: ev.nOk }, m);
        emit('metrics', m);
        if (held >= holdNeeded && !finished) finish(true, m);
      }
    }

    function finish(pass, m) {
      if (finished) return;
      finished = true;
      const durationSec = ctx ? ctx.currentTime - startT : 0;
      const metrics = pass ? m : best ? Object.assign({}, best) : null;
      if (metrics) delete metrics._n;
      let gate = store.gate(level && level.id);
      if (level && level.id != null && (pass || durationSec >= 3)) {
        gate = store.recordTake(level.id, { pass, metrics, durationSec, mode: 'measure' });
        // thời gian tập do UI ghi (SPEC §3.4), không ghi ở đây để tránh nhân đôi
      }
      if (pass) stopInput();
      emit('done', { pass, metrics, durationSec, levelId: level && level.id, gate });
    }

    function stopInput() {
      running = false;
      if (timer) clearInterval(timer);
      timer = null;
      if (input) input.close();
      input = null;
    }

    return {
      on(k, cb) { L[k] && L[k].add(cb); return this; },
      off(k, cb) { L[k] && L[k].delete(cb); return this; },
      async start() {
        if (running) return;
        input = await openInput({ demo, demoParams: level && level.demo });
        startT = ctx.currentTime; track = []; held = 0; lastMetricsT = 0; best = null; finished = false; refMidi = null;
        hold = makeHold({ rateLo: crit.rate && crit.rate[0] });
        running = true;
        timer = setInterval(step, 12);
      },
      stop() {
        const was = running || !!input;
        stopInput();
        if (was && !finished) finish(false, null);
      },
      get running() { return running; },
    };
  }

  // ───────────────────────── Hiệu chuẩn ─────────────────────────
  async function calibrate(opts) {
    opts = opts || {};
    const seconds = opts.seconds || 5;
    const demo = !!(opts.demo || isDemoURL());
    const st = settings.get();
    // Pha 1 (QUIET giây): im lặng để đo ồn nền. Pha 2 (seconds): kéo dây La buông.
    const QUIET = 1.2;
    const input = await openInput({ demo, demoParams: { rate: 0.01, width: 0.01, midi: 69, delay: QUIET + 0.3 } });
    const ac = ctx, an = input.analyser;
    const buf = new Float32Array(an.fftSize);
    const minHz = st.instrument === 'viola' ? 120 : 180;
    const thr = voicingThreshold(st.sensitivity);
    const quietDbs = [], cents = [];
    let frames = 0;
    const t0 = ac.currentTime;
    const total = QUIET + seconds;
    return new Promise((resolve) => {
      const id = setInterval(() => {
        an.getFloatTimeDomainData(buf);
        const W = Math.min(1024, Math.floor(ac.sampleRate * 0.022));
        const need = W + Math.floor(ac.sampleRate / minHz) + 2;
        const view = buf.subarray(buf.length - need);
        const db = rmsDb(view, W);
        const el = ac.currentTime - t0;
        const quiet = el < QUIET;
        let hz = null;
        if (quiet) { if (el > 0.2) quietDbs.push(db); } // bỏ 0,2 s đầu (tiếng chạm màn hình)
        else {
          frames++;
          if (db > thr) { const p = yin(view, ac.sampleRate, minHz, 2600, W, 0.12); if (p && p.aperiodicity < 0.25) hz = p.hz; }
          if (hz && el > QUIET + 0.8) cents.push(hzToAbsCents(hz, st.a4));
        }
        // onProgress(tiến độ 0..1, Hz đang nghe, pha 'quiet' | 'play')
        if (opts.onProgress) { try { opts.onProgress(clamp(el / total, 0, 1), hz, quiet ? 'quiet' : 'play'); } catch (e) {} }
        if (el >= total) {
          clearInterval(id); input.close();
          const noiseDb = quietDbs.length ? Math.max(-90, Math.round(median(quietDbs))) : null;
          if (cents.length < frames * 0.3) {
            const r = { hz: null, noteName: null, centsFromNote: null, stabilityPct: 0, noiseDb, ok: false,
              message: 'Không nghe rõ tiếng đàn. Kéo dây La buông to và đều hơn, hoặc tăng độ nhạy micro.' };
            return resolve(r);
          }
          const mc = median(cents);
          const sd = std(cents.filter((c) => Math.abs(c - mc) < 50));
          const stabilityPct = Math.round(clamp(100 - 4 * sd, 0, 100));
          const nm = Math.round(mc / 100);
          const res = { hz: +absCentsToHz(mc, st.a4).toFixed(1), noteName: midiName(nm), centsFromNote: +(mc - nm * 100).toFixed(1),
            stabilityPct, noiseDb, ok: stabilityPct >= 80 && (noiseDb == null || noiseDb < -45) };
          res.message = res.ok ? 'Micro đo ổn định. Có thể tập.'
            : noiseDb != null && noiseDb >= -45 ? 'Phòng hơi ồn (đo trong lúc im lặng). Tìm chỗ yên tĩnh hơn để đo chính xác.'
              : 'Cao độ dao động nhiều. Kéo cung đều, giữ dây buông, thử lại.';
          store.saveCalibration(res);
          resolve(res);
        }
      }, 12);
    });
  }

  // _audio: cửa nội bộ cho các phần khác của app (src/legato-engine.js) dùng chung AudioContext, micro và tiếng dây tổng hợp.
  const _audio = { ctx: audio, openInput, voicingThreshold, stringVoice, isDemoURL };
  root.VE = Object.assign(root.VE || {}, { PASS_MODES, _core: core, _audio, _dayKey: dayKey, settings, store, server, coach, createSession, metronome, playSample, stopSample, calibrate });
})(typeof window !== 'undefined' ? window : globalThis);
