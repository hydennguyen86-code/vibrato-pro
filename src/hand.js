/* Vibrato Pro — camera nhìn tay (Opus). THỬ NGHIỆM: chỉ tham khảo, không dùng để qua level.
 * API: SPEC.md §8.2. Phần lõi VE._handCore thuần, test được bằng Node.
 *
 * Ý tưởng đo:
 *  - Dùng MediaPipe HandLandmarker (21 điểm khớp) trên camera trước.
 *  - Biết tần số rung f (từ micro, hoặc tự ước lượng từ tay), đo biên độ dao động ở đúng tần số f
 *    bằng phép "lock-in" (chiếu tín hiệu lên sin/cos tần số f) — chịu được khung hình không đều.
 *  - Nguồn rung: so biên độ cổ tay (điểm 0) với biên độ đốt ngón (trung bình điểm 5,9,13,17).
 *      cánh tay → cổ tay đi theo đốt ngón (tỉ lệ ≈ 1); cổ tay → cổ tay gần đứng yên (tỉ lệ nhỏ);
 *      ngón → đốt ngón gần như không động, chỉ góc khớp đầu ngón dao động.
 *  - Khớp đầu ngón: góc tại khớp DIP (điểm 7/11/15/19) dao động bao nhiêu độ (đỉnh-đỉnh).
 *  - Đồng bộ: tần số dao động của tay so với tần số cao độ micro đo.
 *  Các ngưỡng là ước lượng ban đầu, cần chỉnh theo dữ liệu thật.
 */
(function (root) {
  'use strict';

  const CONNECTIONS = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];
  // [đốt gốc MCP, PIP, DIP, đầu ngón] cho ngón 1..4 (trỏ, giữa, áp út, út)
  const FINGERS = [[5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]];
  const KNUCKLES = [5, 9, 13, 17];

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const median = (a) => { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

  // Khử xu hướng bậc 2 theo thời gian (bỏ trôi chậm, ví dụ tay cung di chuyển)
  function detrend(ts, xs) {
    const n = xs.length;
    if (n < 3) return xs.slice();
    const t0 = ts[0], T = ts[n - 1] - t0 || 1;
    let S = [0, 0, 0, 0, 0], R = [0, 0, 0];
    for (let i = 0; i < n; i++) {
      const u = (2 * (ts[i] - t0)) / T - 1, u2 = u * u;
      S[0] += 1; S[1] += u; S[2] += u2; S[3] += u2 * u; S[4] += u2 * u2;
      R[0] += xs[i]; R[1] += xs[i] * u; R[2] += xs[i] * u2;
    }
    const M = [[S[0], S[1], S[2]], [S[1], S[2], S[3]], [S[2], S[3], S[4]]];
    const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D = det(M);
    let c = [R[0] / n, 0, 0];
    if (Math.abs(D) > 1e-12) c = [0, 1, 2].map((k) => det(M.map((row, i) => row.map((v, j) => (j === k ? R[i] : v)))) / D);
    return xs.map((x, i) => { const u = (2 * (ts[i] - t0)) / T - 1; return x - (c[0] + c[1] * u + c[2] * u * u); });
  }
  // Biên độ (nửa đỉnh-đỉnh) của thành phần tần số f, lấy mẫu không đều, có cửa sổ Hann (giảm rò phổ)
  function lockIn(ts, xs, f) {
    const n = ts.length;
    if (n < 4) return 0;
    const t0 = ts[0], T = ts[n - 1] - t0;
    if (T <= 0) return 0;
    let re = 0, im = 0, norm = 0;
    for (let i = 0; i < n; i++) {
      const dt = i === 0 ? (ts[1] - ts[0]) / 2 : i === n - 1 ? (ts[n - 1] - ts[n - 2]) / 2 : (ts[i + 1] - ts[i - 1]) / 2;
      const hw = 0.5 - 0.5 * Math.cos((2 * Math.PI * (ts[i] - t0)) / T);
      const w = 2 * Math.PI * f * ts[i];
      re += xs[i] * hw * Math.cos(w) * dt; im -= xs[i] * hw * Math.sin(w) * dt; norm += hw * dt;
    }
    return norm > 0 ? (2 * Math.hypot(re, im)) / norm : 0;
  }
  // Biên độ của chuyển động 2D (x,y) ở tần số f
  function amp2(ts, pts, f) {
    const x = detrend(ts, pts.map((p) => p.x)), y = detrend(ts, pts.map((p) => p.y));
    return Math.hypot(lockIn(ts, x, f), lockIn(ts, y, f));
  }
  // Ước lượng tần số rung của tay: quét 0,8–9 Hz, lấy đỉnh nổi rõ
  function estimateRate(ts, pts) {
    const x = detrend(ts, pts.map((p) => p.x)), y = detrend(ts, pts.map((p) => p.y));
    let best = 0, bestF = null;
    const pw = [];
    for (let f = 0.8; f <= 9.001; f += 0.05) {
      const p = lockIn(ts, x, f) ** 2 + lockIn(ts, y, f) ** 2;
      pw.push(p);
      if (p > best) { best = p; bestF = f; }
    }
    const med = median(pw);
    return best > 6 * med && best > 0 ? +bestF.toFixed(2) : null;
  }
  // Góc gập CÓ DẤU tại b trong mặt phẳng ảnh (độ). Có dấu để dao động quanh vị trí thẳng không bị "chỉnh lưu"
  // thành tần số gấp đôi.
  function angleAt(a, b, c) {
    const v1x = b.x - a.x, v1y = b.y - a.y, v2x = c.x - b.x, v2y = c.y - b.y;
    return (Math.atan2(v1x * v2y - v1y * v2x, v1x * v2x + v1y * v2y) * 180) / Math.PI;
  }

  // frames: [{t, lm:[{x,y,z}×21] toạ độ đẳng hướng (pixel), wl?:[{x,y,z}×21] toạ độ thế giới (m)}]
  // audioRate: Hz từ micro hoặc null
  function analyzeHand(frames, audioRate) {
    const out = { tracking: false, fps: 0, note: 'Chưa thấy bàn tay', source: null, sourceLabel: '—',
      wristRatio: null, knuckleAmp: null, dipDeg: null, dipLabel: '—', dipOk: null, activeFinger: null,
      handRate: null, syncLabel: '—', syncOk: null };
    if (frames.length < 2) return out;
    const tEnd = frames[frames.length - 1].t;
    const win = clamp(3 / Math.max(audioRate || 2, 1), 2, 4);
    const fr = frames.filter((f) => f.t >= tEnd - win);
    const span = fr.length > 1 ? fr[fr.length - 1].t - fr[0].t : 0;
    out.fps = span > 0 ? Math.round((fr.length - 1) / span) : 0;
    // chưa đủ một cửa sổ phân tích → chưa kết luận
    if (fr.length < 15 || span < win * 0.9) { out.note = fr.length ? 'Đang thu thập…' : 'Chưa thấy bàn tay'; return out; }
    if (out.fps < 10) { out.note = 'Khung hình quá chậm (' + out.fps + '/s)'; return out; }
    out.tracking = true; out.note = null;

    const ts = fr.map((f) => f.t);
    const scale = median(fr.map((f) => Math.hypot(f.lm[9].x - f.lm[0].x, f.lm[9].y - f.lm[0].y))) || 1;
    const norm = (p) => ({ x: p.x / scale, y: p.y / scale });
    const wrist = fr.map((f) => norm(f.lm[0]));
    const knuck = fr.map((f) => norm(KNUCKLES.reduce((s, k) => ({ x: s.x + f.lm[k].x / 4, y: s.y + f.lm[k].y / 4 }), { x: 0, y: 0 })));

    const handRate = estimateRate(ts, knuck);
    out.handRate = handRate;
    const f = audioRate && audioRate >= 0.8 && audioRate <= 9 ? audioRate : handRate;
    if (!f) { out.note = 'Cần rung để đo'; return out; }

    const aK = amp2(ts, knuck, f), aW = amp2(ts, wrist, f);
    out.knuckleAmp = +aK.toFixed(4);
    out.wristRatio = aK > 0 ? +(aW / aK).toFixed(2) : null;

    // góc khớp đầu ngón (mặt phẳng ảnh, có dấu). Nhiễu điểm khớp tự tạo dao động giả, nên đo thêm
    // "nền nhiễu" = trung vị biên độ ở các tần số khác f (tránh f và 2f), chỉ kết luận khi tín hiệu ≥ 3× nền.
    let best = null;
    FINGERS.forEach((fg, i) => {
      const ang = detrend(ts, fr.map((x) => angleAt(x.lm[fg[1]], x.lm[fg[2]], x.lm[fg[3]])));
      const a = 2 * lockIn(ts, ang, f); // đỉnh-đỉnh
      const nz = [];
      for (let g = 1; g <= 9.001; g += 0.25) if (Math.abs(g - f) > 0.6 && Math.abs(g - 2 * f) > 0.6) nz.push(2 * lockIn(ts, ang, g));
      const noise = median(nz) || 0;
      const snr = noise > 0 ? a / noise : 99;
      if (!best || snr > best.snr) best = { a, noise, snr, finger: i + 1 };
    });
    out.dipDeg = +best.a.toFixed(1);
    out.dipNoise = +best.noise.toFixed(1);
    const clear = best.snr >= 3 && best.a >= 4;
    out.activeFinger = clear ? best.finger : null;
    if (clear && best.a >= 8) { out.dipLabel = 'Đang lăn'; out.dipOk = true; }
    else if (clear) { out.dipLabel = 'Lăn ít'; out.dipOk = null; }
    else if (best.noise > 1e-6 && 3 * best.noise <= 6 && aK >= 0.012) { out.dipLabel = 'Khoá cứng?'; out.dipOk = false; } // đủ nhạy mà không thấy lăn
    else { out.dipLabel = 'Chưa rõ'; out.dipOk = null; } // camera quá nhiễu để kết luận
    const bestDip = clear ? best.a : 0;

    // nguồn rung
    if (aK < 0.012) {
      if (bestDip >= 4) { out.source = 'finger'; out.sourceLabel = 'Ngón'; }
      else { out.source = null; out.sourceLabel = '—'; out.note = 'Chuyển động tay quá nhỏ để nhận ra'; }
    } else {
      const r = aW / aK;
      if (r >= 0.7) { out.source = 'arm'; out.sourceLabel = 'Cánh tay'; }
      else if (r <= 0.4) { out.source = 'wrist'; out.sourceLabel = 'Cổ tay'; }
      else { out.source = 'mixed'; out.sourceLabel = 'Kết hợp'; }
    }

    // đồng bộ với micro
    if (audioRate && handRate) {
      const ok = Math.abs(handRate - audioRate) <= Math.max(0.35, 0.08 * audioRate);
      out.syncOk = ok; out.syncLabel = ok ? 'Khớp nhịp' : 'Lệch nhịp';
    } else if (audioRate && !handRate) {
      out.syncOk = null; out.syncLabel = '—';
      if (!out.note) out.note = 'Tay chưa thấy dao động rõ';
    }
    return out;
  }

  // Chọn tay đang rung trong nhiều tay: năng lượng dao động đốt ngón lớn nhất ở dải 2–9 Hz
  function pickActive(tracks) {
    let best = -1, idx = null;
    tracks.forEach((tr, i) => {
      const fr = tr.slice(-45);
      if (fr.length < 12) return;
      const ts = fr.map((f) => f.t);
      const sc = median(fr.map((f) => Math.hypot(f.lm[9].x - f.lm[0].x, f.lm[9].y - f.lm[0].y))) || 1;
      const k = fr.map((f) => ({ x: f.lm[9].x / sc, y: f.lm[9].y / sc }));
      const x = detrend(ts, k.map((p) => p.x)), y = detrend(ts, k.map((p) => p.y));
      let e = 0;
      for (let f = 2; f <= 9; f += 0.25) e += lockIn(ts, x, f) ** 2 + lockIn(ts, y, f) ** 2;
      if (e > best) { best = e; idx = i; }
    });
    return idx;
  }

  const core = { analyzeHand, lockIn, detrend, estimateRate, angleAt, pickActive, CONNECTIONS };
  root.VE = root.VE || {};
  root.VE._handCore = core;
  root.VE.HAND_CONNECTIONS = CONNECTIONS;
  if (typeof root.document === 'undefined') return; // Node test

  // ───────────────────────── Phần trình duyệt ─────────────────────────
  const BASE = '/vendor/mediapipe';
  const isDemo = () => { try { return /[?&]demo=1\b/.test(root.location.search); } catch (e) { return false; } };
  const L = { landmarks: new Set(), metrics: new Set() };
  const emit = (k, v) => L[k].forEach((cb) => { try { cb(v); } catch (e) { console.error(e); } });
  let landmarker = null, stream = null, video = null, running = false, loopId = 0, lastVT = -1;
  let tracks = [[], []], lastWrist = [null, null], audioRate = null, metricsTimer = null, demoT0 = 0, demoPh = 0;

  async function available() {
    if (isDemo()) return true;
    if (root.location.protocol === 'file:') return false;
    try {
      const r = await fetch(BASE + '/hand_landmarker.task', { method: 'HEAD', cache: 'no-store' });
      return r.ok;
    } catch (e) { return false; }
  }

  async function loadModel() {
    if (landmarker) return landmarker;
    let vision;
    try { vision = await import(BASE + '/vision_bundle.mjs'); } catch (e) { const er = new Error('Không tải được thư viện nhìn tay'); er.code = 'MODEL'; throw er; }
    const fileset = await vision.FilesetResolver.forVisionTasks(BASE + '/wasm');
    const opts = (delegate) => ({ baseOptions: { modelAssetPath: BASE + '/hand_landmarker.task', delegate },
      runningMode: 'VIDEO', numHands: 2, minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5 });
    try { landmarker = await vision.HandLandmarker.createFromOptions(fileset, opts('GPU')); }
    catch (e) {
      try { landmarker = await vision.HandLandmarker.createFromOptions(fileset, opts('CPU')); }
      catch (e2) { const er = new Error('Không khởi động được model nhìn tay'); er.code = 'MODEL'; throw er; }
    }
    return landmarker;
  }

  // Ghép tay giữa các khung theo vị trí cổ tay gần nhất (tối đa 2 tay)
  function assign(hands) {
    const out = [null, null];
    const used = new Set();
    hands.forEach((h) => {
      let bi = -1, bd = Infinity;
      for (let i = 0; i < 2; i++) {
        if (used.has(i)) continue;
        const w = lastWrist[i];
        const d = w ? Math.hypot(w.x - h.lm[0].x, w.y - h.lm[0].y) : 1e6 + i;
        if (d < bd) { bd = d; bi = i; }
      }
      if (bi >= 0) { used.add(bi); out[bi] = h; }
    });
    return out;
  }

  function onHands(t, hands, vw, vh, rawForDraw) {
    const slots = assign(hands);
    for (let i = 0; i < 2; i++) {
      if (slots[i]) { tracks[i].push({ t, lm: slots[i].lm, wl: slots[i].wl }); lastWrist[i] = slots[i].lm[0]; }
      else if (tracks[i].length && t - tracks[i][tracks[i].length - 1].t > 0.5) { tracks[i] = []; lastWrist[i] = null; }
      while (tracks[i].length && tracks[i][0].t < t - 5) tracks[i].shift();
    }
    const act = pickActive(tracks);
    const activeHand = act != null ? slots[act] : null;
    const activeIdx = activeHand ? hands.indexOf(activeHand) : (hands.length === 1 ? 0 : null);
    emit('landmarks', { hands: rawForDraw, active: activeIdx, vw, vh });
  }

  function computeMetrics() {
    const act = pickActive(tracks);
    const tr = act != null ? tracks[act] : (tracks[0].length >= tracks[1].length ? tracks[0] : tracks[1]);
    const m = analyzeHand(tr, audioRate);
    if (!tracks[0].length && !tracks[1].length) { m.tracking = false; m.note = 'Chưa thấy bàn tay — đưa tay trái vào khung'; }
    emit('metrics', m);
  }

  function loop() {
    if (!running) return;
    const now = performance.now();
    if (video && video.readyState >= 2 && video.currentTime !== lastVT && landmarker) {
      lastVT = video.currentTime;
      const vw = video.videoWidth, vh = video.videoHeight;
      let res = null;
      try { res = landmarker.detectForVideo(video, now); } catch (e) { /* bỏ khung lỗi */ }
      if (res) {
        const t = now / 1000;
        const hands = (res.landmarks || []).map((lm, i) => ({
          lm: lm.map((p) => ({ x: p.x * vw, y: p.y * vh, z: p.z * vw })),
          wl: res.worldLandmarks && res.worldLandmarks[i] ? res.worldLandmarks[i].map((p) => ({ x: p.x, y: p.y, z: p.z })) : null,
        }));
        onHands(t, hands, vw, vh, (res.landmarks || []).map((lm) => lm.map((p) => ({ x: p.x, y: p.y }))));
      }
    }
    if (video && video.requestVideoFrameCallback) loopId = video.requestVideoFrameCallback(loop);
    else loopId = requestAnimationFrame(loop);
  }

  // Chế độ demo: bàn tay tổng hợp rung kiểu cánh tay + khớp đầu ngón 2 lăn
  const TEMPLATE = [[.50, .80], [.42, .74], [.37, .66], [.34, .58], [.31, .52], [.44, .56], [.43, .45], [.43, .38], [.43, .32],
    [.50, .55], [.50, .43], [.50, .35], [.50, .29], [.56, .56], [.57, .45], [.57, .38], [.57, .33], [.62, .59], [.64, .50], [.65, .45], [.65, .40]];
  const vw0 = 640, vh0 = 480;
  function demoLoop() {
    if (!running) return;
    const t = performance.now() / 1000;
    const f = audioRate || 5;
    demoPh += 2 * Math.PI * f * Math.min(0.1, t - demoT0); demoT0 = t; // cộng dồn pha: đổi tần số không làm giật
    const ph = demoPh;
    const dx = 0.018 * Math.sin(ph), wristShare = 0.85, roll = 0.5 + 0.5 * Math.sin(ph);
    const pts = TEMPLATE.map(([x, y], i) => {
      let px = x + dx * (i === 0 ? wristShare : 1), py = y;
      if (i === 12) { // đầu ngón giữa lăn quanh khớp DIP (điểm 11) ±9°
        const a = (9 * Math.PI / 180) * Math.sin(ph), cx = TEMPLATE[11][0] + dx, cy = TEMPLATE[11][1];
        const ox = (px - cx) * (vw0 / vh0), oy = py - cy;
        px = cx + ((ox * Math.cos(a) - oy * Math.sin(a)) * vh0) / vw0; py = cy + ox * Math.sin(a) + oy * Math.cos(a);
      }
      return { x: px, y: py };
    });
    const vw = 640, vh = 480;
    onHands(t, [{ lm: pts.map((p) => ({ x: p.x * vw, y: p.y * vh, z: 0 })), wl: null }], vw, vh, [pts]);
    loopId = requestAnimationFrame(demoLoop);
  }

  async function start(videoEl) {
    if (running) stop();
    tracks = [[], []]; lastWrist = [null, null]; lastVT = -1;
    if (isDemo()) {
      running = true; demoT0 = performance.now() / 1000; demoLoop();
      metricsTimer = setInterval(computeMetrics, 500);
      return;
    }
    if (root.location.protocol === 'file:') { const e = new Error('Cần máy chủ'); e.code = 'NO_SERVER'; throw e; }
    if (!root.isSecureContext) { const e = new Error('Cần https'); e.code = 'INSECURE'; throw e; }
    if (!(await available())) { const e = new Error('Thiếu model'); e.code = 'NO_SERVER'; throw e; }
    const md = root.navigator.mediaDevices;
    if (!md || !md.getUserMedia) { const e = new Error('Không có camera'); e.code = 'NO_CAMERA'; throw e; }
    try {
      stream = await md.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } }, audio: false });
    } catch (err) {
      const e = new Error('Không mở được camera');
      e.code = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError') ? 'DENIED' : 'NO_CAMERA';
      throw e;
    }
    video = videoEl;
    video.setAttribute('playsinline', ''); video.muted = true; video.srcObject = stream;
    try { await video.play(); } catch (e) { /* iOS đôi khi cần chạm lần nữa */ }
    try { await loadModel(); } catch (e) { stop(); throw e; }
    running = true;
    loop();
    metricsTimer = setInterval(computeMetrics, 500);
  }

  function stop() {
    running = false;
    if (metricsTimer) clearInterval(metricsTimer);
    metricsTimer = null;
    try { if (video && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(loopId); } catch (e) {}
    cancelAnimationFrame(loopId);
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    if (video) { try { video.srcObject = null; } catch (e) {} video = null; }
    tracks = [[], []];
  }

  root.VE.hand = {
    available, start, stop,
    setAudioRate(hz) { audioRate = hz && hz > 0 ? hz : null; },
    on(k, cb) { L[k] && L[k].add(cb); return this; },
    off(k, cb) { L[k] && L[k].delete(cb); return this; },
    get running() { return running; },
  };
})(typeof window !== 'undefined' ? window : globalThis);
