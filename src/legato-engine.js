/* Vibrato Pro — phần "Độ mượt" (legato · đổi vĩ · chuyển dây). [Fable] Hợp đồng: docs/SPEC-LEGATO.md
 * window.VE.legato = { TH, TIERS, TIPS, CHECKS, DEMO_PATTERNS, core, levels, level, stages, store, createSession, lastReport, coach }
 * Phần lõi thuần (VE.legato.core) không phụ thuộc trình duyệt để test bằng Node.
 * Dùng lại bộ dò cao độ YIN và analyzeTrack của src/engine.js (VE._core). KHÔNG có bộ dò cao độ thứ hai. */
(function (root) {
  'use strict';
  const VE = root.VE || (root.VE = {});
  const C = VE._core;
  if (!C) { if (root.console) root.console.error('legato-engine: thiếu VE._core (engine.js phải nạp trước)'); return; }
  const { yin, rmsDb, analyzeTrack, hzToAbsCents, midiName, median } = C;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pct = (arr, p) => { // phân vị p (0..1), nội suy tuyến tính
    if (!arr.length) return NaN;
    const s = Array.prototype.slice.call(arr).sort((x, y) => x - y);
    const k = (s.length - 1) * p, lo = Math.floor(k), hi = Math.ceil(k);
    return s[lo] + (s[hi] - s[lo]) * (k - lo);
  };
  const r1 = (x) => (x == null || isNaN(x) ? null : Math.round(x * 10) / 10);
  const r0 = (x) => (x == null || isNaN(x) ? null : Math.round(x));
  const vn = (x, d) => (x == null || isNaN(x) ? '—' : (+x).toFixed(d == null ? 0 : d).replace('.', ','));
  const merge = (a, b) => { // gộp nông 2 tầng: {bow:{...}, cross:{...}}; giá trị false = tắt chỉ số
    const out = {};
    Object.keys(a || {}).forEach((k) => { out[k] = a[k] && typeof a[k] === 'object' && !Array.isArray(a[k]) ? Object.assign({}, a[k]) : a[k]; });
    Object.keys(b || {}).forEach((k) => {
      const v = b[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object') out[k] = Object.assign({}, out[k], v);
      else out[k] = v && typeof v === 'object' && !Array.isArray(v) ? Object.assign({}, v) : v;
    });
    return out;
  };

  // ═════════════════════════ NGƯỠNG — MỌI CON SỐ CHỈNH Ở ĐÂY ═════════════════════════
  // Chưa kiểm trên tiếng đàn thật. Phiếu chấm luôn in số đo thô (report.raw, report.events) để chỉnh lại.
  const TH = {
    frame: { hopSec: 0.012, winSec: 0.022, yinThreshold: 0.12, aperiodicityMax: 0.25, maxHz: 2600 },
    take: {
      countInBars: 1,        // số ô nhịp đếm vào trước khi chấm
      tailSec: 0.35,         // thu thêm sau phách cuối
      latencyMs: 60,         // bù trễ micro + nửa cửa sổ phân tích khi so với lưới phách
      minVoicedPct: 40,      // dưới mức này: TOO_SHORT (kéo ngắt quãng / chưa đủ bài)
      noSoundPct: 12,        // dưới mức này: NO_SOUND
      minSnrDb: 12,          // tiếng đàn phải to hơn nền ít nhất bấy nhiêu, nếu không: cảnh báo NOISY
      wrongNoteCents: 80,    // một nốt lệch quá mức này tính là "nốt khác"
      wrongNoteFrac: 0.5,    // quá nửa số nốt là "nốt khác" → WRONG_NOTE
      grossFactor: 2,        // nốt lệch quá 2 × ngưỡng thì không được tha theo allowBadFrac
      allowBadFrac: 0.2,     // mỗi chỉ số đếm theo sự kiện được trượt tối đa floor(n × 0.2) sự kiện
    },
    ref: { innerMs: 200, outerMs: 650 },   // vùng lấy mức âm lượng tham chiếu hai bên một điểm đổi
    gapDropDb: 12,                         // tụt quá mức này so với tham chiếu = "hở tiếng"
    bow: { searchMs: 220, detectDipDb: 3, bridgeFrames: 4 },// vùng tìm chỗ sụt quanh phách; sụt ≥ 3 dB mới coi là nghe ra điểm đổi vĩ
    even: { edgeMs: 180 },                 // bỏ hai đầu mỗi nốt khi đo độ đều
    pitch: { settleInMs: 120, settleOutMs: 80, arriveFromMs: 50, arriveToMs: 280, keepCents: 150 },
    trans: { searchFrac: 0.45, searchMaxMs: 450, bandCents: 60, minDeltaCents: 40, sustainFrames: 3, fromRunFrames: 2 },
    vib: { minSegSec: 0.9, onFrac: 0.45, onMinCents: 8, winCycles: 0.6, freezeBeforeMs: 150, freezeAfterMs: 900, centerAboveFrac: 0.3, centerAboveMin: 8, centerFlat: -15 },
    timing: { minEvents: 2 },
  };

  // Bậc khó: 1 = mới tập · 2 = vững · 3 = tinh. Level chọn tier, có thể ghi đè từng số trong level.criteria.
  const TIERS = {
    1: {
      bow: { maxDipDb: 10, maxGapMs: 50 },
      even: { maxRangeDb: 8 },
      pitch: { tolCents: 40, arriveTolCents: 55 },
      join: { maxTransMs: 110, maxGapMs: 50, maxNoiseMs: 80, maxDipDb: 10 },
      cross: { maxTransMs: 150, maxGapMs: 60, maxNoiseMs: 90, maxDipDb: 10 },
      vib: { rate: [3.5, 7.5], width: [15, 80], regularityMin: 60, center: false, maxFreezeMs: 300, minActivePct: 70 },
      timing: { maxMs: 180 },
    },
    2: {
      bow: { maxDipDb: 8, maxGapMs: 35 },
      even: { maxRangeDb: 7 },
      pitch: { tolCents: 30, arriveTolCents: 45 },
      join: { maxTransMs: 90, maxGapMs: 35, maxNoiseMs: 70, maxDipDb: 8 },
      cross: { maxTransMs: 120, maxGapMs: 45, maxNoiseMs: 75, maxDipDb: 8 },
      vib: { rate: [4, 7.5], width: [18, 70], regularityMin: 68, center: false, maxFreezeMs: 240, minActivePct: 78 },
      timing: { maxMs: 140 },
    },
    3: {
      bow: { maxDipDb: 6, maxGapMs: 25 },
      even: { maxRangeDb: 6 },
      pitch: { tolCents: 25, arriveTolCents: 35 },
      join: { maxTransMs: 75, maxGapMs: 25, maxNoiseMs: 60, maxDipDb: 6 },
      cross: { maxTransMs: 100, maxGapMs: 35, maxNoiseMs: 65, maxDipDb: 7 },
      vib: { rate: [4.5, 7.5], width: [20, 65], regularityMin: 75, center: true, maxFreezeMs: 180, minActivePct: 85 },
      timing: { maxMs: 110 },
    },
  };

  // Thứ tự và nhãn các chỉ số của phiếu chấm
  const CHECKS = [
    { id: 'bow', label: 'Liền tiếng khi đổi vĩ', group: 'bow' },
    { id: 'even', label: 'Đều tiếng trong từng nốt', group: 'bow' },
    { id: 'pitch', label: 'Đúng nốt', group: 'pitch' },
    { id: 'join', label: 'Nối nốt (cùng dây)', group: 'join' },
    { id: 'cross', label: 'Chuyển dây', group: 'cross' },
    { id: 'vibRate', label: 'Vibrato · tốc độ', group: 'vib' },
    { id: 'vibWidth', label: 'Vibrato · độ rộng', group: 'vib' },
    { id: 'vibReg', label: 'Vibrato · độ đều', group: 'vib' },
    { id: 'vibCenter', label: 'Vibrato · tâm cao độ', group: 'vib' },
    { id: 'vibCont', label: 'Vibrato không đơ', group: 'vib' },
    { id: 'timing', label: 'Đúng nhịp', group: 'timing' },
  ];

  // Mã trượt → tiêu đề + cách sửa. Level có thể ghi đè câu "fix" qua level.fixes[code].
  const TIPS = {
    bow_gap: { title: 'Hở tiếng lúc đổi vĩ', fix: 'Vĩ đang dừng hẳn rồi mới đi lại. Giữ lông vĩ dính dây, để các ngón tay phải đổi chiều trước, cánh tay theo sau. Tập thật chậm ở giữa vĩ, nghe tiếng nối nhau như một hơi thở.' },
    bow_dip: { title: 'Tiếng sụt lúc đổi vĩ', fix: 'Trước điểm đổi vĩ bạn đang nhả lực hoặc chậm vĩ quá sớm. Giữ nguyên sức nặng cánh tay tới sát điểm đổi, chỉ mềm cổ tay và các ngón. Thử đổi vĩ nhỏ ở giữa vĩ trước.' },
    even_range: { title: 'Tiếng to nhỏ không đều trong một nốt', fix: 'Chia đều chiều dài vĩ cho từng phách. Gần ngọn vĩ thêm chút sức nặng ngón trỏ, gần gốc vĩ để ngón út đỡ bớt. Giữ điểm tiếp xúc không trôi về phía cần đàn.' },
    pitch_off: { title: 'Nốt chưa đúng cao độ', fix: 'Dừng lại, kéo riêng nốt bị lệch thật dài và so với dây buông bên cạnh. Chỉnh xong mới ghép lại vào bài. Nếu là dây buông thì lên dây lại (xem mục Hiệu chuẩn).' },
    pitch_arrive: { title: 'Vừa tới nốt thì lệch, sau mới chỉnh', fix: 'Ngón tay trái tới trễ hoặc trượt tìm nốt. Đặt ngón xuống trước khi vĩ sang dây mới, nghĩ sẵn cao độ trong đầu trước khi chuyển.' },
    join_gap: { title: 'Hở tiếng khi đổi nốt', fix: 'Vĩ đang khựng theo ngón tay trái. Tay phải cứ kéo đều như đang kéo một nốt dài, tay trái đổi ngón bên dưới. Tập: kéo dây buông dài, trong đầu đếm chỗ đổi nốt, rồi mới thêm tay trái.' },
    join_slow: { title: 'Đổi nốt bị kéo dài, nghe trượt', fix: 'Ngón đặt xuống hoặc nhấc lên chậm. Đặt ngón dứt khoát như gõ nhẹ lên dây, nhấc ngón gọn, không miết dọc dây.' },
    join_noise: { title: 'Có tiếng tạp khi đổi nốt', fix: 'Ngón chưa bấm kín dây lúc vĩ đã kéo, hoặc ngón chạm dây bên cạnh. Bấm bằng đầu ngón, khum ngón, và giữ vĩ đều trong lúc đổi.' },
    join_dip: { title: 'Tiếng sụt khi đổi nốt', fix: 'Tay phải đang nhả lực mỗi lần tay trái đổi ngón. Tách hai tay: giữ sức nặng vĩ không đổi, chỉ tay trái làm việc.' },
    join_missing: { title: 'Không nghe ra chỗ đổi nốt', fix: 'Chỗ đổi nốt đến quá sớm, quá trễ so với phách, hoặc nốt trước đã tắt từ lâu. Nghe metronome, đổi nốt đúng phách và giữ tiếng liền tới sát lúc đổi.' },
    cross_gap: { title: 'Hở tiếng lúc chuyển dây', fix: 'Vĩ đang nhấc khỏi dây cũ rồi mới chạm dây mới. Hạ (hoặc nâng) khuỷu tay sớm, tới sát mặt phẳng dây mới TRƯỚC khi chuyển, để có một khoảnh khắc lông vĩ chạm cả hai dây. Tập chậm: nghe hai dây chồng nhau một thoáng rồi mới sang hẳn.' },
    cross_noise: { title: 'Tiếng tạp lúc chuyển dây', fix: 'Vĩ đập xuống dây mới hoặc quệt dây thứ ba. Chuyển dây bằng cử động tròn nhỏ của cổ tay và các ngón, không quật cả cánh tay. Giảm chút lực ngay lúc chạm dây mới, giữ tốc độ vĩ đều.' },
    cross_slow: { title: 'Chuyển dây chậm, nốt mới lên tiếng trễ', fix: 'Cánh tay chưa chuẩn bị nên đường đi sang dây mới quá dài. Trước phách chuyển một chút, đưa khuỷu tay tới gần mức của dây mới; lúc chuyển chỉ còn cổ tay làm phần cuối.' },
    cross_dip: { title: 'Tiếng sụt lúc chuyển dây', fix: 'Vĩ nhẹ đi khi sang dây. Giữ sức nặng cánh tay chìm vào dây suốt đường chuyển, tưởng tượng lông vĩ lăn trên một mặt cong chứ không nhảy qua khe.' },
    cross_missing: { title: 'Không nghe ra chỗ chuyển dây đúng lúc', fix: 'Chỗ chuyển dây lệch phách quá xa, hoặc dây cũ đã tắt từ trước. Nghe metronome, giữ dây cũ kêu tới sát phách rồi mới chuyển.' },
    vib_none: { title: 'Chưa thấy vibrato', fix: 'Level này chấm cả vibrato. Rung đều tay trái suốt nốt, rõ hơn một chút, rồi thử lại. Nếu chưa vững vibrato, quay lại phần Vibrato của app.' },
    vib_rate_low: { title: 'Vibrato chậm hơn ngưỡng', fix: 'Thu nhỏ biên độ một chút để rung nhanh hơn, giữ khớp đầu ngón mềm. Đừng gồng để ép nhanh.' },
    vib_rate_high: { title: 'Vibrato nhanh hơn ngưỡng', fix: 'Bạn đang rung gấp, thường do căng lúc lo đổi vĩ hay chuyển dây. Thả lỏng ngón cái, rung chậm lại và rộng hơn.' },
    vib_width_narrow: { title: 'Vibrato quá hẹp', fix: 'Để khớp đầu ngón gập duỗi nhiều hơn, cánh tay hoặc cổ tay tham gia. Rung hẹp thường là dấu hiệu tay trái co lại khi tay phải bận.' },
    vib_width_wide: { title: 'Vibrato quá rộng', fix: 'Thu nhỏ chuyển động, giữ đầu ngón bám một chỗ. Rộng quá sẽ nghe chênh phô.' },
    vib_reg: { title: 'Vibrato chưa đều', fix: 'Nhịp rung đang giật theo tay phải. Tập riêng: giữ vibrato đều như con lắc, tay phải đổi vĩ thật chậm, mắt nhìn tay trái.' },
    vib_center_above: { title: 'Vibrato rung lên trên nốt', fix: 'Lăn ngón về phía cuộn đàn rồi trở lại nốt, không lăn quá về phía ngựa đàn. Đỉnh của dao động phải là nốt đúng.' },
    vib_center_flat: { title: 'Cả dao động thấp hơn nốt', fix: 'Đặt ngón cao lên một chút cho đúng nốt trước, rồi mới rung xuống dưới.' },
    vib_freeze: { title: 'Vibrato bị đơ sau điểm đổi', fix: 'Tay trái dừng rung đúng lúc tay phải đổi vĩ hoặc chuyển dây. Chủ động rung rõ hơn ngay TRƯỚC điểm đổi và nghĩ "tay trái là con lắc không bao giờ dừng". Ở nốt mới, đặt ngón xuống là rung ngay, không chờ ổn định.' },
    vib_patchy: { title: 'Vibrato lúc có lúc không', fix: 'Giữ rung suốt chiều dài nốt, kể cả cuối vĩ. Thường vibrato tắt dần khi vĩ sắp hết: chia vĩ rộng rãi hơn để tay trái không bị cuống.' },
    timing_late: { title: 'Đổi trễ so với phách', fix: 'Chuẩn bị sớm hơn: ngón tay trái và khuỷu tay phải tới vị trí mới ngay trước phách, để đúng phách chỉ việc đổi.' },
    timing_early: { title: 'Đổi sớm hơn phách', fix: 'Bạn đang vội. Giữ nốt cũ đủ trường độ, đếm thành tiếng trong đầu và chỉ đổi đúng tiếng metronome.' },
    timing_uneven: { title: 'Chỗ đổi lúc sớm lúc trễ', fix: 'Đếm nhỏ thành tiếng "1 2 3 4" theo metronome và chia vĩ theo phách. Giảm BPM cho tới khi các điểm đổi rơi đều.' },
  };

  const CODE_MSG = {
    NO_SOUND: 'Không nghe thấy tiếng đàn. Kiểm tra micro, đưa máy lại gần đàn hơn hoặc tăng độ nhạy trong Cài đặt.',
    TOO_SHORT: 'Chưa đủ bài để chấm: tiếng đàn chỉ có trong một phần nhỏ của lượt tập. Kéo liền từ phách đầu tới phách cuối.',
    WRONG_NOTE: 'Bạn đang kéo nốt khác với bài. Xem lại dây và ngón của từng nốt ở phần hướng dẫn.',
    ABORTED: 'Lượt tập bị dừng giữa chừng nên chưa chấm.',
    NOISY: 'Phòng hơi ồn so với tiếng đàn: các chỗ hở tiếng có thể bị tiếng ồn che mất. Số đo lần này chỉ nên tham khảo.',
  };

  // ═════════════════════════ NỐT & KẾ HOẠCH LƯỢT TẬP ═════════════════════════
  const NOTE_IDX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function noteToMidi(name) {
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(String(name || '').trim());
    if (!m) return null;
    return NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12;
  }
  const STRING_VI = { G: 'Sol', D: 'Rê', A: 'La', E: 'Mi', C: 'Đô' };

  // plan(level): trải pattern × reps ra lưới phách; cắt nốt tại điểm đổi vĩ.
  // Trả { beatSec, beatsPerBar, countInBeats, countInSec, totalBeats, totalSec, segs[], bounds[], bows[] }
  //   seg  = { i, midi, note, string, finger, b0, b1, t0, t1, bow, pat }   (một nốt trong một vĩ)
  //   bound= { i, beat, t, kind:'bow'|'note'|'cross', bowChange, from, to } (giữa seg i và seg i+1)
  //   bow  = { i, b0, b1, t0, t1, dir:'down'|'up' }
  function plan(level) {
    const bpm = clamp(+level.bpm || 60, 30, 200);
    const beatSec = 60 / bpm;
    const bpb = Math.max(1, +level.beatsPerBow || 4);
    const beatsPerBar = Math.max(1, +level.beatsPerBar || 4);
    const reps = Math.max(1, +level.reps || 1);
    const pat = (level.pattern || []).map((p) => ({ note: p.note, midi: p.midi != null ? p.midi : noteToMidi(p.note), string: p.string || null, finger: p.finger != null ? p.finger : null, beats: +p.beats || 1 }));
    const segs = [];
    let b = 0;
    for (let r = 0; r < reps; r++) {
      pat.forEach((p, pi) => {
        let left = p.beats;
        while (left > 1e-9) { // cắt tại bội số của beatsPerBow
          const toBow = bpb - (b % bpb);
          const d = Math.min(left, toBow < 1e-9 ? bpb : toBow);
          segs.push({ midi: p.midi, note: p.note, string: p.string, finger: p.finger, b0: b, b1: b + d, pat: pi });
          b += d; left -= d;
        }
      });
    }
    // gộp các mảnh liền nhau cùng nốt, cùng dây, cùng vĩ (không có sự kiện nào ở giữa)
    const mg = [];
    segs.forEach((s) => {
      const p = mg[mg.length - 1];
      const sameBow = p && Math.floor(p.b0 / bpb + 1e-9) === Math.floor(s.b0 / bpb + 1e-9);
      if (p && sameBow && p.midi === s.midi && p.string === s.string) p.b1 = s.b1; else mg.push(Object.assign({}, s));
    });
    const startDown = level.startBow !== 'up';
    mg.forEach((s, i) => {
      s.i = i; s.t0 = s.b0 * beatSec; s.t1 = s.b1 * beatSec;
      const bi = Math.floor(s.b0 / bpb + 1e-9);
      s.bow = bi; s.dir = (bi % 2 === 0) === startDown ? 'down' : 'up';
    });
    const bounds = [];
    for (let i = 0; i + 1 < mg.length; i++) {
      const a = mg[i], c = mg[i + 1];
      const bowChange = a.bow !== c.bow;
      const kind = a.string !== c.string && a.midi !== c.midi ? 'cross' : a.midi !== c.midi ? 'note' : 'bow';
      bounds.push({ i, beat: a.b1, t: a.t1, kind, bowChange, from: a.note, to: c.note });
    }
    const totalBeats = b;
    const bows = [];
    for (let k = 0; k * bpb < totalBeats - 1e-9; k++) {
      const b0 = k * bpb, b1 = Math.min(totalBeats, b0 + bpb);
      bows.push({ i: k, b0, b1, t0: b0 * beatSec, t1: b1 * beatSec, dir: (k % 2 === 0) === startDown ? 'down' : 'up' });
    }
    const countInBeats = TH.take.countInBars * beatsPerBar;
    return { bpm, beatSec, beatsPerBow: bpb, beatsPerBar, countInBeats, countInSec: countInBeats * beatSec,
      totalBeats, totalSec: totalBeats * beatSec, segs: mg, bounds, bows, vibrato: !!level.vibrato };
  }

  // Tiêu chí có hiệu lực của một level = TIERS[tier] + level.criteria (ghi đè)
  function criteriaOf(level) {
    const base = TIERS[(level && level.tier) || 1] || TIERS[1];
    return merge(base, (level && level.criteria) || {});
  }

  // ═════════════════════════ KHUNG TÍN HIỆU ═════════════════════════
  // Một khung = mức âm lượng (dB RMS trên ~22 ms) + cao độ YIN (cents tuyệt đối, null nếu không có cao độ rõ).
  // view: các mẫu mới nhất, dài ≥ W + sr/minHz + 2.
  function frameOf(view, sr, o) {
    const W = Math.min(1024, Math.floor(sr * TH.frame.winSec));
    const db = rmsDb(view, W);
    let c = null;
    if (db > o.thrDb) {
      const p = yin(view, sr, o.minHz, TH.frame.maxHz, W, TH.frame.yinThreshold);
      if (p && p.aperiodicity < TH.frame.aperiodicityMax) c = hzToAbsCents(p.hz, o.a4 || 440);
    }
    return { db, c };
  }
  const needSamples = (sr, minHz) => Math.min(1024, Math.floor(sr * TH.frame.winSec)) + Math.floor(sr / minHz) + 2;
  const winHalfSec = (sr) => Math.min(1024, Math.floor(sr * TH.frame.winSec)) / sr / 2;

  // Cắt cả một tín hiệu thành khung trên lưới 12 ms. t của khung = tâm cửa sổ RMS, tính từ t0Sec.
  function extract(signal, sr, o) {
    o = Object.assign({ minHz: 180, thrDb: -50, a4: 440, t0Sec: 0 }, o || {});
    const need = needSamples(sr, o.minHz), half = winHalfSec(sr), hop = TH.frame.hopSec;
    const out = [];
    for (let n = 1; ; n++) {
      const end = Math.round(n * hop * sr);
      if (end > signal.length) break;
      if (end < need) continue;
      const f = frameOf(signal.subarray(end - need, end), sr, o);
      out.push({ t: n * hop - half - o.t0Sec, db: f.db, c: f.c });
    }
    return out;
  }

  // ═════════════════════════ BỘ CHẤM ═════════════════════════
  // frames: [{t, db, c}] — t tính bằng giây từ PHÁCH ĐẦU của phần chấm (khung đếm vào có t < 0).
  // plan: plan(level). crit: criteriaOf(level). opts: { latencyMs, thrDb, fixes, levelId }
  function analyzeTake(frames, pl, crit, opts) {
    opts = opts || {};
    crit = crit || TIERS[1];
    const lat = (opts.latencyMs != null ? opts.latencyMs : TH.take.latencyMs) / 1000;
    const thrDb = opts.thrDb != null ? opts.thrDb : -50;
    const n = frames.length;
    const T = new Float64Array(n), DB = new Float64Array(n), CC = new Float64Array(n);
    for (let i = 0; i < n; i++) { T[i] = frames[i].t - lat; DB[i] = frames[i].db; CC[i] = frames[i].c == null ? NaN : frames[i].c; }
    const lb = (t) => { let lo = 0, hi = n; while (lo < hi) { const m = (lo + hi) >> 1; if (T[m] < t) lo = m + 1; else hi = m; } return lo; };
    let hop = TH.frame.hopSec;
    if (n > 4) { const d = []; for (let i = 1; i < n; i++) d.push(T[i] - T[i - 1]); hop = clamp(median(d), 0.004, 0.05); }
    const hopMs = hop * 1000;
    const voiced = (i) => !isNaN(CC[i]);

    const rep = {
      valid: true, code: null, message: null, warnings: [], pass: false, levelId: opts.levelId != null ? opts.levelId : null,
      durationSec: r1(pl.totalSec), checks: {}, order: [], fails: [], tips: [], nOk: 0, nChecks: 0,
      events: [], segments: [], raw: {}, criteria: crit,
    };

    // ── tổng quan: mức nền, mức đàn, tỉ lệ có tiếng
    const iP0 = lb(0), iP1 = lb(pl.totalSec);
    const pre = []; for (let i = 0; i < lb(-0.05); i++) pre.push(DB[i]);
    const noiseDb = pre.length >= 8 ? median(pre) : null;
    const vdb = []; let nv = 0;
    for (let i = iP0; i < iP1; i++) if (voiced(i)) { nv++; vdb.push(DB[i]); }
    const nPlay = Math.max(1, iP1 - iP0);
    const voicedPct = 100 * nv / nPlay;
    const refDb = vdb.length ? median(vdb) : null;
    const snrDb = refDb != null && noiseDb != null ? refDb - noiseDb : null;
    rep.raw = { frames: n, hopMs: r1(hopMs), latencyMs: Math.round(lat * 1000), refDb: r1(refDb), noiseDb: r1(noiseDb), snrDb: r1(snrDb), voicedPct: r0(voicedPct) };
    if (iP1 - iP0 < 0.8 * pl.totalSec / hop * 0.5 || voicedPct < TH.take.minVoicedPct) {
      rep.valid = false;
      rep.code = voicedPct < TH.take.noSoundPct ? 'NO_SOUND' : 'TOO_SHORT';
      rep.message = CODE_MSG[rep.code];
      return rep;
    }
    if (snrDb != null && snrDb < TH.take.minSnrDb) rep.warnings.push({ code: 'NOISY', message: CODE_MSG.NOISY });

    // ── từng nốt: cao độ thực kéo
    const vibOn = !!pl.vibrato && crit.vib !== false && !!crit.vib;
    const segs = pl.segs.map((s) => {
      const dur = s.t1 - s.t0;
      const a = lb(s.t0 + Math.min(TH.pitch.settleInMs / 1000, 0.25 * dur)), b = lb(s.t1 - Math.min(TH.pitch.settleOutMs / 1000, 0.15 * dur));
      let cs = []; for (let i = a; i < b; i++) if (voiced(i)) cs.push(CC[i]);
      const o = { i: s.i, note: s.note, midi: s.midi, string: s.string, finger: s.finger, t0: s.t0, t1: s.t1, dur, med: null, top: null, err: null, arriveErr: null, ok: null, evenDb: null, vib: null };
      if (cs.length >= Math.max(3, 0.25 * (b - a))) {
        const m0 = median(cs);
        cs = cs.filter((c) => Math.abs(c - m0) <= TH.pitch.keepCents);
        o.med = median(cs); o.top = pct(cs, 0.9);
        const tg = s.midi * 100;
        // Có vibrato: nốt mục tiêu chỉ cần nằm trong vùng rung [trung vị, đỉnh]; ngoài vùng đó mới tính lệch.
        o.err = vibOn ? (tg < o.med ? o.med - tg : tg > o.top ? o.top - tg : 0) : o.med - tg;
      }
      return o;
    });

    // ── mức âm lượng tham chiếu hai bên một điểm đổi
    function localRef(tm, sa, sb) {
      const side = (lo, hi) => { const v = []; for (let i = lb(lo); i < lb(hi); i++) if (voiced(i)) v.push(DB[i]); return v.length >= 3 ? median(v) : null; };
      const inA = Math.min(TH.ref.innerMs / 1000, 0.4 * sa.dur), outA = Math.min(TH.ref.outerMs / 1000, 0.85 * sa.dur);
      const inB = Math.min(TH.ref.innerMs / 1000, 0.4 * sb.dur), outB = Math.min(TH.ref.outerMs / 1000, 0.85 * sb.dur);
      const p = side(tm - outA, tm - inA), q = side(tm + inB, tm + outB);
      if (p != null && q != null) return Math.min(p, q);
      return p != null ? p : q != null ? q : refDb;
    }
    const minPair = (a, b) => { // đáy của mức âm lượng, phải kéo dài ≥ 2 khung (một khung lẻ không tính)
      let m = Infinity, at = a;
      for (let i = Math.max(0, a); i < Math.min(n - 1, b); i++) { const v = Math.max(DB[i], DB[i + 1]); if (v < m) { m = v; at = i; } }
      return { min: m, at };
    };

    // ── từng điểm đổi (đổi vĩ / đổi nốt / chuyển dây)
    const arriveAt = {}; // seg index → thời điểm nốt mới thực sự lên tiếng
    const events = pl.bounds.map((bd) => {
      const sa = segs[bd.i], sb = segs[bd.i + 1];
      const ref = localRef(bd.t, sa, sb);
      const ev = { i: bd.i, kind: bd.kind, bowChange: bd.bowChange, beat: bd.beat, t: r1(bd.t * 10) / 10, from: bd.from, to: bd.to,
        found: true, dipDb: null, gapMs: 0, transMs: null, noiseMs: null, otherMs: null, timingMs: null, arriveCents: null, vibFreezeMs: null, bad: [], ok: true };
      ev.t = Math.round(bd.t * 1000) / 1000;
      if (bd.kind === 'bow') {
        const w = Math.min(TH.bow.searchMs / 1000, 0.4 * Math.min(sa.dur, sb.dur));
        const a = lb(bd.t - w), b = lb(bd.t + w);
        const mp = minPair(a, b);
        ev.dipDb = isFinite(mp.min) ? Math.max(0, ref - mp.min) : null;
        // cụm khung "hở" dài nhất; cho phép bị ngắt ≤ bridgeFrames khung (tiếng metronome rơi đúng vào chỗ hở), chỉ đếm khung hở
        let run = 0, best = 0, since = 99;
        for (let i = a; i < b; i++) {
          if (DB[i] < ref - TH.gapDropDb) { run = since <= TH.bow.bridgeFrames ? run + 1 : 1; since = 0; best = Math.max(best, run); } else since++;
        }
        ev.gapMs = best * hopMs;
        if (ev.dipDb != null && ev.dipDb >= TH.bow.detectDipDb) ev.timingMs = ((T[mp.at] + T[Math.min(n - 1, mp.at + 1)]) / 2 - bd.t) * 1000;
        return ev;
      }
      // đổi nốt / chuyển dây: tìm lúc rời nốt cũ và lúc nốt mới lên tiếng, theo cao độ THỰC kéo ở hai bên
      const fromC = sa.med, toC = sb.med;
      const delta = fromC != null && toC != null ? Math.abs(toC - fromC) : 0;
      if (delta < TH.trans.minDeltaCents) { ev.found = false; return ev; }
      const vibHalf = vibOn ? ((crit.vib.width && crit.vib.width[1]) || 60) / 2 : 0;
      const band = clamp(0.42 * delta, 25, TH.trans.bandCents + vibHalf);
      const w = Math.min(TH.trans.searchMaxMs / 1000, TH.trans.searchFrac * Math.min(sa.dur, sb.dur));
      const a = lb(bd.t - w), b = lb(bd.t + w);
      const cls = (i) => (DB[i] < ref - TH.gapDropDb ? 'S' : !voiced(i) ? 'N' : Math.abs(CC[i] - fromC) <= band ? 'F' : Math.abs(CC[i] - toC) <= band ? 'T' : 'O');
      const K = []; for (let i = a; i < b; i++) K.push(cls(i));
      let lastF = -1;
      for (let k = TH.trans.fromRunFrames - 1; k < K.length; k++) {
        let all = true; for (let q = 0; q < TH.trans.fromRunFrames; q++) if (K[k - q] !== 'F') { all = false; break; }
        if (all) lastF = k;
      }
      let iA = -1;
      for (let k = lastF + 1; k + TH.trans.sustainFrames <= K.length; k++) {
        let all = true; for (let q = 0; q < TH.trans.sustainFrames; q++) if (K[k + q] !== 'T') { all = false; break; }
        if (all) { iA = k; break; }
      }
      if (iA < 0) { ev.found = false; return ev; }
      let gap = 0, noise = 0;
      for (let k = lastF + 1; k < iA; k++) { if (K[k] === 'S') gap++; else if (K[k] === 'N') noise++; }
      const between = iA - lastF - 1;
      const tLeave = lastF >= 0 ? T[a + lastF] : T[a] - hop, tArr = T[a + iA];
      ev.transMs = between * hopMs; ev.gapMs = gap * hopMs; ev.noiseMs = noise * hopMs; ev.otherMs = (between - gap - noise) * hopMs;
      const mp = minPair(lb(tLeave - 0.06), lb(tArr + 0.06));
      ev.dipDb = isFinite(mp.min) ? Math.max(0, ref - mp.min) : null;
      ev.timingMs = ((tLeave + tArr) / 2 - bd.t) * 1000;
      arriveAt[bd.i + 1] = tArr;
      // cao độ lúc vừa tới nốt mới (trước khi kịp chỉnh)
      const av = []; for (let i = lb(tArr + TH.pitch.arriveFromMs / 1000); i < lb(Math.min(sb.t1, tArr + TH.pitch.arriveToMs / 1000)); i++) if (voiced(i)) av.push(CC[i]);
      if (av.length >= 4 && !vibOn) { ev.arriveCents = median(av) - pl.segs[bd.i + 1].midi * 100; sb.arriveErr = ev.arriveCents; }
      return ev;
    });

    // ── độ đều âm lượng trong từng nốt
    segs.forEach((s) => {
      const e = Math.min(TH.even.edgeMs / 1000, 0.25 * s.dur);
      const v = []; for (let i = lb(s.t0 + e); i < lb(s.t1 - e); i++) if (voiced(i)) v.push(DB[i]);
      if (v.length >= 8) s.evenDb = pct(v, 0.9) - pct(v, 0.1);
    });

    // ── vibrato theo từng nốt + độ liên tục sau điểm đổi
    let vibAgg = null;
    if (vibOn) {
      const vc = crit.vib, rLo = (vc.rate && vc.rate[0]) || 4, wLo = (vc.width && vc.width[0]) || 15;
      const Wv = clamp(TH.vib.winCycles / rLo, 0.1, 0.24);
      const onThr = Math.max(TH.vib.onMinCents, TH.vib.onFrac * wLo);
      // phần dư cao độ so với trung vị của chính nốt đó (NaN = không dùng được)
      const R = new Float64Array(n).fill(NaN);
      segs.forEach((s) => {
        if (s.med == null) return;
        const tS = arriveAt[s.i] != null ? arriveAt[s.i] : s.t0, nx = segs[s.i + 1];
        const tE = nx && arriveAt[nx.i] != null ? arriveAt[nx.i] : s.t1;
        const a = lb(tS), b = lb(tE);
        for (let i = a; i < b; i++) if (voiced(i) && Math.abs(CC[i] - s.med) <= TH.pitch.keepCents) R[i] = CC[i] - s.med;
        const v = { rate: null, width: null, regularity: null, center: null, peakOffset: null, valid: false };
        if (s.dur >= TH.vib.minSegSec) {
          const tr = []; for (let i = lb(tS + 0.02); i < lb(s.t1 - 0.04); i++) tr.push({ t: T[i], c: isNaN(R[i]) ? null : CC[i] });
          const m = analyzeTrack(tr, { windowSec: s.dur + 1, noteJump: 400 });
          if (m.valid) {
            const peakAbs = m.refMidi * 100 + m.peakOffset, off = peakAbs - s.midi * 100;
            v.valid = true; v.rate = m.rate; v.width = m.width; v.regularity = m.regularity; v.peakOffset = off;
            v.center = off > Math.max(TH.vib.centerAboveMin, TH.vib.centerAboveFrac * m.width) ? 'above' : off < TH.vib.centerFlat ? 'flat' : 'below';
          }
        }
        s.vib = v;
      });
      // "đang rung" tại khung i: phân vị 10–90 của phần dư trong cửa sổ Wv quanh nó đủ lớn. 1 = rung, 0 = đơ, -1 = không biết (thiếu khung)
      const ON = new Int8Array(n).fill(-1);
      let actN = 0, actTot = 0, j0 = iP0, j1 = iP0;
      for (let i = iP0; i < iP1; i++) {
        while (j0 < i && T[j0] < T[i] - Wv / 2) j0++;
        while (j1 < n - 1 && T[j1 + 1] <= T[i] + Wv / 2) j1++;
        const wv = []; for (let j = j0; j <= j1; j++) if (!isNaN(R[j])) wv.push(R[j]);
        if (wv.length < 5 || isNaN(R[i])) continue;
        ON[i] = pct(wv, 0.9) - pct(wv, 0.1) >= onThr ? 1 : 0;
        actTot++; if (ON[i]) actN++;
      }
      // sau mỗi điểm đổi: đoạn đơ dài nhất (không phụ thuộc việc khớp chính xác với lưới phách)
      events.forEach((ev) => {
        const bd = pl.bounds[ev.i], nx = segs[bd.i + 1];
        const a = lb(bd.t - TH.vib.freezeBeforeMs / 1000), b = lb(bd.t + Math.min(TH.vib.freezeAfterMs / 1000, nx.dur - 0.1));
        let run = 0, best = 0, known = 0, t0r = 0;
        for (let i = a; i < b; i++) {
          if (ON[i] < 0) continue;
          known++;
          if (ON[i] === 0) { if (!run) t0r = T[i]; run++; best = Math.max(best, T[i] - t0r + hop); } else run = 0;
        }
        ev.vibFreezeMs = known >= 8 ? best * 1000 : null;
      });
      const ok = segs.filter((s) => s.vib && s.vib.valid);
      const long = segs.filter((s) => s.dur >= TH.vib.minSegSec && s.med != null);
      vibAgg = { n: long.length, nValid: ok.length, activePct: actTot ? 100 * actN / actTot : 0,
        rate: ok.length ? median(ok.map((s) => s.vib.rate)) : null, width: ok.length ? median(ok.map((s) => s.vib.width)) : null,
        regularity: ok.length ? median(ok.map((s) => s.vib.regularity)) : null, segs: ok };
    }

    // ── dựng từng chỉ số
    const allow = (k) => Math.floor(k * TH.take.allowBadFrac + 1e-9);
    const fixOf = (code) => (opts.fixes && opts.fixes[code]) || (TIPS[code] && TIPS[code].fix) || '';
    function put(id, c) {
      const def = CHECKS.find((x) => x.id === id);
      c.id = id; c.label = def.label; c.group = def.group;
      if (c.ok === false) { c.tip = { code: c.fail, title: (TIPS[c.fail] && TIPS[c.fail].title) || def.label, fix: fixOf(c.fail) }; }
      else { c.fail = null; c.tip = null; }
      rep.checks[id] = c; rep.order.push(id);
    }
    const worstOf = (list, key) => list.reduce((m, e) => (e[key] != null && (m == null || e[key] > m) ? e[key] : m), null);

    // 1) Liền tiếng khi đổi vĩ (chỉ các điểm đổi vĩ trên cùng một nốt)
    const bowEv = events.filter((e) => e.kind === 'bow');
    if (bowEv.length && crit.bow) {
      const cb = crit.bow;
      bowEv.forEach((e) => { if (e.gapMs > cb.maxGapMs) e.bad.push('bow_gap'); else if (e.dipDb != null && e.dipDb > cb.maxDipDb) e.bad.push('bow_dip'); });
      const bad = bowEv.filter((e) => e.bad.length), dips = bowEv.map((e) => e.dipDb).filter((x) => x != null);
      const wDip = worstOf(bowEv, 'dipDb'), wGap = worstOf(bowEv, 'gapMs'), ok = bad.length <= allow(bowEv.length);
      put('bow', { ok, value: r1(median(dips)), unit: 'dB', text: `sụt ${vn(median(dips), 1)} dB`, target: `sụt ≤ ${cb.maxDipDb} dB · hở ≤ ${cb.maxGapMs} ms`,
        worst: r1(wDip), worstGapMs: r0(wGap), bad: bad.length, n: bowEv.length, allowed: allow(bowEv.length),
        detail: `Tệ nhất: sụt ${vn(wDip, 1)} dB, hở ${vn(wGap)} ms · ${bad.length}/${bowEv.length} lần đổi vĩ bị hụt`,
        fail: bad.some((e) => e.bad[0] === 'bow_gap') ? 'bow_gap' : 'bow_dip' });
    }
    // 2) Đều tiếng trong từng nốt
    const evenSegs = segs.filter((s) => s.evenDb != null);
    if (evenSegs.length && crit.even) {
      const mx = crit.even.maxRangeDb, bad = evenSegs.filter((s) => s.evenDb > mx), med = median(evenSegs.map((s) => s.evenDb));
      const w = evenSegs.reduce((m, s) => Math.max(m, s.evenDb), 0), al = allow(evenSegs.length);
      put('even', { ok: bad.length <= al, value: r1(med), unit: 'dB', text: `dao động ${vn(med, 1)} dB`, target: `≤ ${mx} dB`, worst: r1(w), bad: bad.length, n: evenSegs.length, allowed: al,
        detail: `Tệ nhất ${vn(w, 1)} dB · ${bad.length}/${evenSegs.length} nốt không đều`, fail: 'even_range' });
    }
    // 3) Đúng nốt (trung vị cả nốt + cao độ lúc vừa tới)
    const pSegs = segs.filter((s) => s.err != null);
    let wrongNote = false;
    if (pSegs.length && crit.pitch) {
      const tol = crit.pitch.tolCents, atol = crit.pitch.arriveTolCents || tol + 15;
      let offN = 0, arrN = 0;
      const gross = pSegs.filter((s) => Math.abs(s.err) > TH.take.grossFactor * tol).length;
      pSegs.forEach((s) => {
        const off = Math.abs(s.err) > tol, arr = !off && s.arriveErr != null && Math.abs(s.arriveErr) > atol;
        s.ok = !(off || arr); if (off) offN++; if (arr) arrN++;
      });
      const abs = pSegs.map((s) => Math.abs(s.err)), med = median(abs), bad = offN + arrN, al = allow(pSegs.length);
      const w = pSegs.reduce((m, s) => (m == null || Math.abs(s.err) > Math.abs(m.err) ? s : m), null);
      wrongNote = pSegs.filter((s) => Math.abs(s.err) > TH.take.wrongNoteCents).length > TH.take.wrongNoteFrac * pSegs.length;
      put('pitch', { ok: bad <= al && gross === 0, gross, value: r1(med), unit: 'cents', text: `lệch ${vn(med)} cents`, target: `≤ ${tol} cents`, worst: r1(w.err), worstNote: w.note, bad, n: pSegs.length, allowed: al,
        detail: `Lệch nhất: ${w.note} ${w.err > 0 ? '+' : ''}${vn(w.err)} cents · ${bad}/${pSegs.length} nốt lệch` + (arrN ? ` (${arrN} nốt lệch lúc vừa tới)` : ''),
        fail: offN ? 'pitch_off' : 'pitch_arrive' });
    }
    // 4–5) Nối nốt cùng dây · Chuyển dây
    [['join', 'note'], ['cross', 'cross']].forEach(([id, kind]) => {
      const evs = events.filter((e) => e.kind === kind), cc = crit[id];
      if (!evs.length || !cc) return;
      evs.forEach((e) => {
        if (!e.found) { e.bad.push(id + '_missing'); return; }
        // đổi nốt trùng lúc đổi vĩ: cho phép sụt/hở như một lần đổi vĩ
        const mg = e.bowChange && crit.bow ? Math.max(cc.maxGapMs, crit.bow.maxGapMs) : cc.maxGapMs;
        const md = e.bowChange && crit.bow ? Math.max(cc.maxDipDb, crit.bow.maxDipDb) : cc.maxDipDb;
        if (e.gapMs > mg) e.bad.push(id + '_gap');
        if (e.noiseMs > cc.maxNoiseMs) e.bad.push(id + '_noise');
        if (!e.bad.length && e.transMs > cc.maxTransMs) e.bad.push(id + '_slow');
        if (!e.bad.length && e.dipDb != null && e.dipDb > md) e.bad.push(id + '_dip');
      });
      const found = evs.filter((e) => e.found), bad = evs.filter((e) => e.bad.length), al = allow(evs.length);
      const med = found.length ? median(found.map((e) => e.transMs)) : null;
      const cnt = {}; bad.forEach((e) => { cnt[e.bad[0]] = (cnt[e.bad[0]] || 0) + 1; });
      const fail = Object.keys(cnt).sort((x, y) => cnt[y] - cnt[x])[0] || id + '_gap';
      const what = kind === 'cross' ? 'lần chuyển dây' : 'lần đổi nốt';
      put(id, { ok: bad.length <= al, value: r0(med), unit: 'ms', text: med == null ? '—' : `chuyển ${vn(med)} ms`,
        target: `chuyển ≤ ${cc.maxTransMs} ms · hở ≤ ${cc.maxGapMs} ms · tạp ≤ ${cc.maxNoiseMs} ms`,
        worst: r0(worstOf(found, 'transMs')), worstGapMs: r0(worstOf(found, 'gapMs')), worstNoiseMs: r0(worstOf(found, 'noiseMs')), worstDipDb: r1(worstOf(found, 'dipDb')),
        bad: bad.length, n: evs.length, allowed: al,
        detail: `Tệ nhất: hở ${vn(worstOf(found, 'gapMs'))} ms, tiếng tạp ${vn(worstOf(found, 'noiseMs'))} ms, sụt ${vn(worstOf(found, 'dipDb'), 1)} dB · ${bad.length}/${evs.length} ${what} chưa mượt`, fail });
    });
    // 6) Vibrato
    if (vibAgg) {
      const vc = crit.vib, none = vibAgg.nValid < Math.max(1, Math.ceil(vibAgg.n / 2));
      const rg = vc.rate || [0, 99], wd = vc.width || [0, 999];
      const na = (id, target) => put(id, { ok: false, value: null, unit: '', text: '—', target, detail: 'Chưa thấy chu kỳ rung rõ trong các nốt', fail: 'vib_none' });
      if (none) {
        na('vibRate', `${vn(rg[0], 1)}–${vn(rg[1], 1)} Hz`); na('vibWidth', `${wd[0]}–${wd[1]} cents`);
      } else {
        const R = vibAgg.rate, W = vibAgg.width, G = vibAgg.regularity;
        put('vibRate', { ok: R >= rg[0] && R <= rg[1], value: r1(R), unit: 'Hz', text: `${vn(R, 1)} Hz`, target: `${vn(rg[0], 1)}–${vn(rg[1], 1)} Hz`, detail: `Trung vị của ${vibAgg.nValid} nốt`, fail: R < rg[0] ? 'vib_rate_low' : 'vib_rate_high' });
        put('vibWidth', { ok: W >= wd[0] && W <= wd[1], value: r0(W), unit: 'cents', text: `${vn(W)} cents`, target: `${wd[0]}–${wd[1]} cents`, detail: 'Đỉnh đến đáy, trung vị các nốt', fail: W < wd[0] ? 'vib_width_narrow' : 'vib_width_wide' });
        put('vibReg', { ok: G >= (vc.regularityMin || 0), value: r0(G), unit: '%', text: `${vn(G)}%`, target: `≥ ${vc.regularityMin || 0}%`, detail: 'Đều về nhịp và biên độ', fail: 'vib_reg' });
        if (vc.center) {
          const off = vibAgg.segs.filter((s) => s.vib.center !== 'below'), al = allow(vibAgg.segs.length);
          const ab = off.filter((s) => s.vib.center === 'above').length;
          const po = median(vibAgg.segs.map((s) => s.vib.peakOffset));
          put('vibCenter', { ok: off.length <= al, value: r0(po), unit: 'cents', text: off.length <= al ? 'Dưới nốt' : ab >= off.length - ab ? 'Trên nốt' : 'Thấp cả nốt', target: 'rung xuống dưới nốt',
            bad: off.length, n: vibAgg.segs.length, allowed: al, detail: `Đỉnh dao động lệch ${po > 0 ? '+' : ''}${vn(po)} cents so với nốt · ${off.length}/${vibAgg.segs.length} nốt sai tâm`,
            fail: ab >= off.length - ab ? 'vib_center_above' : 'vib_center_flat' });
        }
      }
      const res = events.filter((e) => e.vibFreezeMs != null);
      res.forEach((e) => { if (e.vibFreezeMs > vc.maxFreezeMs) e.bad.push('vib_freeze'); });
      const badR = res.filter((e) => e.vibFreezeMs > vc.maxFreezeMs), al = allow(res.length);
      const medR = res.length ? median(res.map((e) => e.vibFreezeMs)) : null, wR = worstOf(res, 'vibFreezeMs');
      const freeze = badR.length > al, patchy = vibAgg.activePct < (vc.minActivePct || 0);
      put('vibCont', { ok: !freeze && !patchy, value: r0(medR != null ? medR : vibAgg.activePct), unit: medR != null ? 'ms' : '%', text: medR == null ? `rung ${vn(vibAgg.activePct)}% thời gian` : `đơ ${vn(medR)} ms`,
        target: `đơ ≤ ${vc.maxFreezeMs} ms sau điểm đổi · rung ≥ ${vc.minActivePct || 0}% thời gian`, worst: r0(wR), activePct: r0(vibAgg.activePct), bad: badR.length, n: res.length, allowed: al,
        detail: `Đơ lâu nhất ${vn(wR)} ms · ${badR.length}/${res.length} điểm đổi bị đơ · có rung ${vn(vibAgg.activePct)}% thời gian`, fail: freeze ? 'vib_freeze' : 'vib_patchy' });
      rep.raw.vib = { rate: r1(vibAgg.rate), width: r1(vibAgg.width), regularity: r0(vibAgg.regularity), activePct: r0(vibAgg.activePct), notesMeasured: vibAgg.nValid, notes: vibAgg.n };
    }
    // 7) Đúng nhịp (chỉ những điểm đổi nghe ra được)
    const tm = events.filter((e) => e.timingMs != null).map((e) => e.timingMs);
    if (crit.timing && tm.length >= TH.timing.minEvents) {
      const mx = crit.timing.maxMs, med = median(tm.map(Math.abs)), bias = median(tm), sp = pct(tm, 0.9) - pct(tm, 0.1);
      put('timing', { ok: med <= mx, value: r0(med), unit: 'ms', text: `lệch ${vn(med)} ms`, target: `≤ ${mx} ms`, bias: r0(bias), spread: r0(sp), n: tm.length,
        detail: `${bias >= 0 ? 'Trễ' : 'Sớm'} trung bình ${vn(Math.abs(bias))} ms · đo trên ${tm.length} điểm đổi nghe ra được`,
        fail: Math.abs(bias) >= 0.6 * med ? (bias > 0 ? 'timing_late' : 'timing_early') : 'timing_uneven' });
    }

    // ── tổng kết
    rep.order.forEach((id) => { const c = rep.checks[id]; rep.nChecks++; if (c.ok) rep.nOk++; else { rep.fails.push(c.fail); rep.tips.push(Object.assign({ check: id }, c.tip)); } });
    if (wrongNote) { rep.valid = false; rep.code = 'WRONG_NOTE'; rep.message = CODE_MSG.WRONG_NOTE; }
    rep.pass = rep.valid && rep.nChecks > 0 && rep.nOk === rep.nChecks;
    events.forEach((e) => { e.ok = !e.bad.length; ['dipDb'].forEach((k) => { e[k] = r1(e[k]); }); ['gapMs', 'transMs', 'noiseMs', 'otherMs', 'timingMs', 'arriveCents', 'vibFreezeMs'].forEach((k) => { e[k] = r0(e[k]); }); });
    rep.events = events;
    rep.segments = segs.map((s) => ({ i: s.i, note: s.note, string: s.string, finger: s.finger, t0: +s.t0.toFixed(3), t1: +s.t1.toFixed(3), cents: r1(s.err), arriveCents: r0(s.arriveErr), ok: s.ok, evenDb: r1(s.evenDb),
      vib: s.vib ? { rate: r1(s.vib.rate), width: r0(s.vib.width), regularity: r0(s.vib.regularity), center: s.vib.center} : null }));
    return rep;
  }

  // ═════════════════════════ TÍN HIỆU GIẢ LẬP (demo + test) ═════════════════════════
  const DEMO_PATTERNS = [
    { id: 'smooth', label: 'Mượt', fails: [] },
    { id: 'bowgap', label: 'Hụt tiếng lúc đổi vĩ', fails: ['bow'] },
    { id: 'crossgap', label: 'Hở lúc chuyển dây', fails: ['cross'] },
    { id: 'crossnoise', label: 'Tiếng tạp lúc chuyển dây', fails: ['cross'] },
    { id: 'wrongnote', label: 'Sai nốt', fails: ['pitch'] },
    { id: 'vibfreeze', label: 'Đơ vibrato sau điểm đổi', fails: ['vibCont'] },
    { id: 'uneven', label: 'Đuối tiếng trong từng nốt', fails: ['even'] },
    { id: 'late', label: 'Đổi trễ nhịp', fails: ['timing'] },
    { id: 'silent', label: 'Không có tiếng', fails: [] },
  ];
  // Trả { signal: Float32Array, sr, countInSec }. Tín hiệu bắt đầu từ phách đầu của ô đếm vào.
  // o: { sr=32000, snrDb=38, clicks=true, latencyMs=TH.take.latencyMs, seed, vibRate, vibWidth, harmonics=8, a4=440 }
  function demoSignal(pl, pattern, o) {
    o = Object.assign({ sr: 32000, snrDb: 38, clicks: true, latencyMs: TH.take.latencyMs, seed: 20261125, harmonics: 8, a4: 440 }, o || {});
    const sr = o.sr, lat = o.latencyMs / 1000 + (pattern === 'late' ? 0.26 : 0);
    const cin = pl.countInSec, total = cin + pl.totalSec + TH.take.tailSec + 0.3, n = Math.floor(total * sr);
    let seed = o.seed >>> 0;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const gauss = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
    const out = new Float32Array(n), gain = new Float32Array(n), burst = new Float32Array(n);
    const S = (t) => Math.round((cin + lat + t) * sr); // giây "nhạc" → chỉ số mẫu
    // bao âm lượng: có tiếng trong [0, totalSec], mép 30 ms
    const i0 = S(0), i1 = Math.min(n, S(pl.totalSec)), edge = Math.round(0.03 * sr);
    if (pattern !== 'silent') for (let i = i0; i < i1; i++) gain[i] = Math.min(1, (i - i0) / edge, (i1 - i) / edge);
    const notch = (tc, widthSec, depthDb) => { // khấc hình cosin
      const a = S(tc - widthSec / 2), b = S(tc + widthSec / 2), g = Math.pow(10, -depthDb / 20);
      for (let i = Math.max(0, a); i < Math.min(n, b); i++) { const x = (i - a) / (b - a); gain[i] *= 1 - (1 - g) * (0.5 - 0.5 * Math.cos(2 * Math.PI * x)); }
    };
    const hole = (ta, tb, floor) => { // khoảng hở: tụt hẳn, mép 8 ms
      const a = S(ta), b = S(tb), e = Math.round(0.008 * sr);
      for (let i = Math.max(0, a); i < Math.min(n, b); i++) { const k = Math.min(1, (i - a) / e, (b - i) / e); gain[i] *= 1 - (1 - floor) * k; }
    };
    const hasCross = pl.bounds.some((b) => b.kind === 'cross'), hasPureBow = pl.bounds.some((b) => b.kind === 'bow');
    const isX = (b) => (hasCross ? b.kind === 'cross' : b.kind === 'note');
    const isBow = (b) => (hasPureBow ? b.kind === 'bow' : b.bowChange);
    pl.bounds.forEach((b) => {
      if (b.bowChange) notch(b.t, 0.04, 2.5); // đổi vĩ khéo vẫn có một khấc rất nhỏ
      if (pattern === 'bowgap' && isBow(b)) hole(b.t - 0.055, b.t + 0.055, 0.02);
      if (pattern === 'crossgap' && isX(b)) hole(b.t - 0.065, b.t + 0.065, 0.015);
      if (pattern === 'crossnoise' && isX(b)) {
        const a = S(b.t - 0.075), c = S(b.t + 0.075), e = Math.round(0.006 * sr);
        for (let i = Math.max(0, a); i < Math.min(n, c); i++) { const k = Math.min(1, (i - a) / e, (c - i) / e); gain[i] *= 1 - k; burst[i] = k; }
      }
    });
    if (pattern === 'uneven') pl.segs.forEach((s) => { // mỗi nốt đuối dần 15 dB
      const a = S(s.t0), b = S(s.t1);
      for (let i = Math.max(0, a); i < Math.min(n, b); i++) gain[i] *= Math.pow(10, (-15 * (i - a) / (b - a)) / 20);
    });
    // vibrato: dao động từ nốt xuống dưới; 'vibfreeze' tắt rung 0,55 s sau mỗi điểm đổi
    const vibOn = !!pl.vibrato, vr = o.vibRate || 5.5, vw = o.vibWidth || 36;
    const freeze = pattern === 'vibfreeze' ? pl.bounds.map((b) => [b.t, b.t + 0.55]) : [];
    const wrongPat = pattern === 'wrongnote' ? (pl.segs.some((s) => s.pat === 1) ? 1 : 0) : -1;
    const H = o.harmonics, ph0 = []; for (let k = 0; k < H; k++) ph0.push(rnd() * 2 * Math.PI);
    let ph = 0, si = 0, vEnv = 1, lp = 0;
    const toneRms = 0.2 * Math.sqrt(Array.from({ length: H }, (_, k) => 1 / ((k + 1) * (k + 1))).reduce((a, b) => a + b, 0) / 2);
    for (let i = Math.max(0, i0 - 10); i < n; i++) {
      const g = gain[i], bz = burst[i];
      const t = i / sr - cin - lat;
      while (si + 1 < pl.segs.length && t >= pl.segs[si + 1].t0) si++;
      const sg = pl.segs[si];
      let cents = (sg.midi - 69) * 100 + (sg.pat === wrongPat ? -100 : 0);
      if (vibOn) {
        let fz = false; for (let q = 0; q < freeze.length; q++) if (t >= freeze[q][0] && t < freeze[q][1]) { fz = true; break; }
        vEnv += ((fz ? 0 : 1) - vEnv) * (1 / (0.03 * sr));
        cents += vEnv * (-vw / 2 + (vw / 2) * Math.sin(2 * Math.PI * vr * t));
      }
      const f = o.a4 * Math.pow(2, cents / 1200);
      ph += (2 * Math.PI * f) / sr; if (ph > 1e6) ph -= 2 * Math.PI * Math.floor(ph / (2 * Math.PI));
      let s = 0;
      if (g > 0) { for (let k = 1; k <= H; k++) if (f * k < sr / 2.2) s += Math.sin(k * ph + ph0[k - 1]) / k; s *= 0.2 * g; }
      if (bz > 0) { lp += 0.35 * (gauss() - lp); s += bz * lp * toneRms * 2.4; } // tiếng tạp: nhiễu, to ngang tiếng đàn
      out[i] = s;
    }
    const sigma = toneRms / Math.pow(10, o.snrDb / 20);
    for (let i = 0; i < n; i++) out[i] += sigma * gauss();
    if (o.clicks) { // tiếng metronome lọt micro: nhiễu ngắn 15 ms, không có cao độ
      const len = Math.floor(0.015 * sr);
      const clickLat = o.latencyMs / 1000;
      for (let k = 0; k < pl.countInBeats + pl.totalBeats + 1; k++) {
        const a = Math.round((k * pl.beatSec + clickLat) * sr), amp = (k % pl.beatsPerBar === 0 ? 0.45 : 0.3) * (o.clickGain != null ? o.clickGain : 1);
        let prev = 0;
        for (let j = 0; j < len && a + j < n; j++) { const w = gauss(), hf = w - prev; prev = w; out[a + j] += amp * 0.5 * hf * Math.pow(1 - j / len, 2); }
      }
    }
    return { signal: out, sr, countInSec: cin };
  }
  // Chạy trọn một mẫu giả lập qua bộ chấm (test, e2e, kiểm level)
  function simulate(level, pattern, o) {
    o = o || {};
    const pl = plan(level), crit = criteriaOf(level);
    const vr = level.demo && level.demo.vibRate, vw = level.demo && level.demo.vibWidth;
    const mid = (r, d) => (r ? (r[0] + r[1]) / 2 : d);
    const sig = demoSignal(pl, pattern || 'smooth', Object.assign({ vibRate: vr || (crit.vib ? clamp(mid(crit.vib.rate, 5.5), 4.5, 6) : 5.5), vibWidth: vw || (crit.vib ? clamp(mid(crit.vib.width, 36), 25, 45) : 36) }, o));
    const frames = extract(sig.signal, sig.sr, { t0Sec: sig.countInSec, minHz: o.minHz || 180, thrDb: o.thrDb != null ? o.thrDb : -50, a4: o.a4 || 440 });
    return analyzeTake(frames, pl, crit, { levelId: level.id, fixes: level.fixes, latencyMs: o.analysisLatencyMs });
  }

  const core = { TH, TIERS, plan, criteriaOf, frameOf, extract, analyzeTake, demoSignal, simulate, noteToMidi, needSamples, winHalfSec };

  // ═════════════════════════ LEVEL: gộp khung (legato-levels.js) + nội dung + video ═════════════════════════
  const KIND_VI = { bow: 'Đổi vĩ', note: 'Đổi nốt', cross: 'Chuyển dây' };
  const FALLBACK = {
    bow: { steps: ['Kéo nốt dài theo metronome, mỗi vĩ đủ số phách.', 'Tới điểm đổi vĩ: giữ lông vĩ dính dây, đổi chiều bằng các ngón tay và cổ tay.', 'Nghe tiếng nối nhau, không có khoảng lặng.'], tips: ['Cổ tay và các ngón tay phải mềm như lò xo.'], mistakes: ['Dừng vĩ rồi mới đổi chiều nên tiếng bị hụt.'], feel: 'Như một hơi thở dài, không nghe ra chỗ đổi vĩ.', q: 'violin smooth bow change tutorial' },
    note: { steps: ['Tay phải kéo đều như đang kéo một nốt dài.', 'Tay trái đổi ngón đúng phách, đặt và nhấc ngón gọn.', 'Giữ âm lượng phẳng qua chỗ đổi nốt.'], tips: ['Ngón đặt xuống dứt khoát nhưng nhẹ.'], mistakes: ['Vĩ khựng lại mỗi lần đổi ngón.'], feel: 'Các nốt nối vào nhau như hát liền một hơi.', q: 'violin legato left hand finger changes tutorial' },
    cross: { steps: ['Trước phách chuyển, đưa khuỷu tay phải tới gần mức của dây mới.', 'Lúc chuyển: lông vĩ lăn từ dây cũ sang dây mới, có một thoáng chạm cả hai dây.', 'Giữ tốc độ và sức nặng vĩ không đổi.'], tips: ['Chuyển dây bằng cử động tròn nhỏ của cổ tay, không quật cả cánh tay.'], mistakes: ['Nhấc vĩ khỏi dây cũ rồi mới chạm dây mới nên hở tiếng.', 'Đập vĩ xuống dây mới gây tiếng tạp.'], feel: 'Vĩ lăn trên một mặt cong; hai nốt dính vào nhau, không có tiếng "cạch".', q: 'violin smooth string crossing tutorial' },
  };
  let merged = null;
  function levels() {
    if (merged) return merged;
    const base = root.LEGATO_LEVELS || [], content = root.LEGATO_CONTENT || {}, vids = root.LEGATO_VIDEOS || {};
    merged = base.map((b) => {
      const c = content[b.id] || {}, fb = FALLBACK[b.kind] || FALLBACK.bow;
      const L = Object.assign({}, b);
      L.pattern = (b.pattern || []).map((p) => Object.assign({}, p, { midi: p.midi != null ? p.midi : noteToMidi(p.note) }));
      L.goal = c.goal || b.goal || '';
      L.steps = c.steps && c.steps.length ? c.steps : fb.steps;
      L.tips = c.tips && c.tips.length ? c.tips : fb.tips;
      L.mistakes = c.mistakes && c.mistakes.length ? c.mistakes : fb.mistakes;
      L.feel = c.feel || fb.feel;
      L.selfCheck = c.selfCheck || [];
      L.fixes = c.fixes || {};
      const group = b.videoGroup || (b.vibrato ? 'vib' : b.kind);
      const seen = {};
      L.videos = [].concat((vids.byLevel && vids.byLevel[b.id]) || [], (vids.groups && vids.groups[group]) || [])
        .filter((v) => v && /^https:\/\//.test(v.url || '') && !seen[v.url] && (seen[v.url] = 1)).slice(0, 3);
      const yt = c.youtube || (vids.queries && vids.queries[group]) || null;
      L.youtube = { title: (yt && yt.title) || 'Tìm video: ' + (KIND_VI[b.kind] || 'legato') + ' mượt trên violin', query: (yt && yt.query) || fb.q + (b.vibrato ? ' continuous vibrato' : '') };
      L.kindLabel = KIND_VI[b.kind] + (b.vibrato ? ' + vibrato' : '');
      L.criteria = criteriaOf(b); // tiêu chí có hiệu lực (đã gộp tier)
      return L;
    });
    return merged;
  }
  const levelById = (id) => levels().find((l) => l.id === Number(id)) || null;
  const stages = () => (root.LEGATO_STAGES || []).slice();

  // ═════════════════════════ TIẾN ĐỘ (riêng cho Độ mượt, dùng chung passMode) ═════════════════════════
  const KEY = 'vibratoPro.legato.v1';
  let mem = null;
  const blank = () => ({ takes: [], gates: {} });
  function load() {
    if (mem) return mem;
    try { const raw = root.localStorage && root.localStorage.getItem(KEY); mem = raw ? Object.assign(blank(), JSON.parse(raw)) : blank(); } catch (e) { mem = blank(); }
    if (!mem.gates || typeof mem.gates !== 'object') mem.gates = {};
    if (!Array.isArray(mem.takes)) mem.takes = [];
    return mem;
  }
  const save = () => { try { root.localStorage && root.localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* đầy bộ nhớ / riêng tư */ } };
  const pad = (x) => String(x).padStart(2, '0');
  const dayKey = VE._dayKey || ((ts) => { const d = new Date(ts); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); });
  const need = () => { const id = VE.settings ? VE.settings.get().passMode : 'fast'; const L = VE.PASS_MODES || []; return L.find((m) => m.id === id) || L[0] || { passes: 1, days: 1 }; };
  const meets = (g) => { const k = need(); return g.passes.length >= k.passes && new Set(g.passes.map((p) => p.dayKey)).size >= k.days; };
  const maxLevel = () => levels().length || 50;
  function cascade(id, ts) { // qua level N → mọi level Độ mượt trước N tính là đã qua (không đụng tới 100 level vibrato)
    for (let k = 1; k < id; k++) { const g = mem.gates[k] || (mem.gates[k] = { passes: [], passed: false }); if (!g.passed) { g.passed = true; g.passedAt = ts; g.testedOut = true; } }
  }
  function sync() { // passMode đổi sang dễ hơn → level đã đủ số lần đạt được tính qua ngay
    load(); let ch = false;
    Object.keys(mem.gates).map(Number).sort((a, b) => b - a).forEach((id) => {
      const g = mem.gates[id];
      if (g && !g.passed && g.passes && g.passes.length && meets(g)) { g.passed = true; g.passedAt = Date.now(); cascade(id, g.passedAt); ch = true; }
    });
    if (ch) save();
  }
  function gateOf(id) {
    sync();
    const g = mem.gates[id] || { passes: [], passed: false }, k = need();
    return { passCount: g.passes.length, dayCount: new Set(g.passes.map((p) => p.dayKey)).size, neededPasses: k.passes, neededDays: k.days, levelPassed: !!g.passed, justPassed: false };
  }
  const store = {
    // report: kết quả analyzeTake / sự kiện 'done' của phiên. Lượt không hợp lệ (NO_SOUND, TOO_SHORT, ABORTED) KHÔNG được ghi.
    recordTake(levelId, report) {
      load(); sync();
      const ts = Date.now(), r = report || {};
      const vals = {}; (r.order || []).forEach((id) => { const c = r.checks[id]; vals[id] = { v: c.value, ok: !!c.ok }; });
      mem.takes.unshift({ ts, levelId, pass: !!r.pass, code: r.code || null, nOk: r.nOk || 0, nChecks: r.nChecks || 0, fails: (r.fails || []).slice(0, 12), vals, durationSec: Math.round(r.durationSec || 0) });
      if (mem.takes.length > 2000) mem.takes.length = 2000;
      const g = mem.gates[levelId] || (mem.gates[levelId] = { passes: [], passed: false });
      let just = false;
      if (r.pass && !g.passed) { g.passes.push({ ts, dayKey: dayKey(ts) }); if (meets(g)) { g.passed = true; g.passedAt = ts; just = true; cascade(levelId, ts); } }
      save();
      const out = gateOf(levelId); out.justPassed = just; return out;
    },
    gate: gateOf,
    currentLevel() { sync(); for (let i = 1; i <= maxLevel(); i++) if (!(mem.gates[i] && mem.gates[i].passed)) return i; return maxLevel(); },
    status(id) { sync(); return mem.gates[id] && mem.gates[id].passed ? 'passed' : Number(id) === store.currentLevel() ? 'current' : 'open'; },
    passedCount() { sync(); let k = 0; for (let i = 1; i <= maxLevel(); i++) if (mem.gates[i] && mem.gates[i].passed) k++; return k; },
    takes(days) { const since = Date.now() - (days || 3650) * 864e5; return load().takes.filter((t) => t.ts >= since).map((t) => Object.assign({}, t)); },
    best(levelId) { // lượt tốt nhất của một level: nhiều chỉ số đạt nhất, mới nhất nếu bằng nhau
      const t = load().takes.filter((x) => x.levelId === Number(levelId));
      return t.length ? Object.assign({}, t.reduce((b, x) => (x.nChecks && x.nOk / x.nChecks > (b.nChecks ? b.nOk / b.nChecks : -1) ? x : b), t[0])) : null;
    },
    failCounts(days) { const c = {}; store.takes(days || 14).forEach((t) => (t.fails || []).forEach((f) => { c[f] = (c[f] || 0) + 1; })); return c; },
    reset() { mem = blank(); save(); },
  };

  // ═════════════════════════ HLV AI (tuỳ chọn; cần Worker hiểu kind:'legato') ═════════════════════════
  function coachPayload(report, level) {
    const L = level || levelById(report && report.levelId) || {};
    const lines = (report.order || []).map((id) => { const c = report.checks[id]; return `${c.label}: ${c.text} (ngưỡng ${c.target}) — ${c.ok ? 'ĐẠT' : 'CHƯA'}${c.detail ? '. ' + c.detail : ''}`; });
    const fc = store.failCounts(14);
    return {
      kind: 'legato', provider: VE.settings ? VE.settings.get().coachProvider || 'auto' : 'auto',
      level: { id: L.id, title: L.title, goal: L.goal, kind: L.kindLabel, bpm: L.bpm, tips: (L.tips || []).slice(0, 4), mistakes: (L.mistakes || []).slice(0, 4) },
      legato: { pass: !!report.pass, code: report.code || null, nOk: report.nOk, nChecks: report.nChecks, lines,
        fails: (report.tips || []).map((t) => ({ code: t.code, title: t.title })), gate: report.gate || null,
        repeated: Object.keys(fc).sort((a, b) => fc[b] - fc[a]).slice(0, 5).map((k) => ({ code: k, title: (TIPS[k] && TIPS[k].title) || k, count: fc[k] })),
        passed: store.passedCount(), total: maxLevel(),
        next: (() => { const nx = report.pass && L.id ? levelById(L.id + 1) : null; return nx ? { id: nx.id, title: nx.title } : null; })() },
    };
  }
  const coach = {
    payload: coachPayload,
    // → Promise<{ text, provider, model, ms }>; lỗi .code = NO_SERVER | AI_DOWN | AI_ERROR | TIMEOUT | AUTH (như VE.coach.ask)
    async ask(report, level) {
      const fail = (code, msg) => { const e = new Error(msg); e.code = code; return e; };
      const h = VE.server ? await VE.server.health(true) : { ok: false };
      if (!h.ok) throw fail('NO_SERVER', 'Cần máy chủ');
      if (!h.coach || !h.coach.active) throw fail('AI_DOWN', 'AI chưa chạy');
      if (!h.legato) throw fail('AI_DOWN', 'Máy chủ này chưa hỗ trợ nhận xét Độ mượt');
      const t0 = Date.now(), ctl = root.AbortController ? new AbortController() : null, tm = setTimeout(() => ctl && ctl.abort(), 60000);
      let r;
      try {
        const hd = { 'Content-Type': 'application/json' }, pass = ((VE.settings.get().coachPass) || '').trim();
        if (pass) hd['X-Vibrato-Pass'] = pass;
        r = await root.fetch('/api/coach', { method: 'POST', headers: hd, body: JSON.stringify(coachPayload(report, level)), signal: ctl && ctl.signal });
      } catch (err) { clearTimeout(tm); throw err && err.name === 'AbortError' ? fail('TIMEOUT', 'AI trả lời quá lâu') : fail('NO_SERVER', 'Mất kết nối máy chủ'); }
      clearTimeout(tm);
      let j = null; try { j = await r.json(); } catch (e) { /* không phải JSON */ }
      if (!r.ok || !j || !j.text) throw fail((j && j.code) || (r.status === 401 ? 'AUTH' : r.status === 503 ? 'AI_DOWN' : 'AI_ERROR'), (j && j.error) || 'AI gặp lỗi');
      return { text: String(j.text), provider: j.provider || null, model: j.model || null, ms: Date.now() - t0 };
    },
  };

  const LG = { TH, TIERS, TIPS, CHECKS, CODE_MSG, DEMO_PATTERNS, STRING_VI, core, plan, criteriaOf, levels, level: levelById, stages, store, coach,
    _resetCache() { merged = null; mem = null; } };
  VE.legato = LG;

  // ═════════════════════════ PHIÊN TẬP (chỉ trong trình duyệt) ═════════════════════════
  const A = VE._audio;
  if (!A || typeof root.document === 'undefined') return;

  let last = null;
  LG.lastReport = (levelId) => (last && (levelId == null || last.levelId === Number(levelId)) ? last : null);

  // Máy trạng thái: idle → starting → countin → playing → analyzing → done   (stop() ở bất kỳ đâu → done, code ABORTED)
  // opts: { demo, pattern='smooth', speed=1 (chỉ demo), metronome=true (false = chỉ nháy, không kêu) }
  function createSession(level, opts) {
    opts = opts || {};
    const demo = !!(opts.demo || A.isDemoURL());
    const speed = demo ? clamp(+opts.speed || 1, 1, 16) : 1;
    const pl = plan(level), crit = criteriaOf(level);
    const Ls = { state: new Set(), beat: new Set(), frame: new Set(), done: new Set() };
    const emit = (k, v) => Ls[k].forEach((cb) => { try { cb(v); } catch (e) { root.console && root.console.error(e); } });
    const st = VE.settings.get();
    const fo = { minHz: st.instrument === 'viola' ? 120 : 180, thrDb: A.voicingThreshold(st.sensitivity), a4: st.a4 || 440 };
    const hop = TH.frame.hopSec, lat = TH.take.latencyMs / 1000;
    let state = 'idle', input = null, timer = null, frames = [], clock = null, tPlay0 = 0, lastBeat = -1e9, nGrid = 0, sig = null, buf = null, finished = false, metroOn = false;
    const setState = (s) => { state = s; emit('state', { state: s, plan: pl }); };
    const M = VE.metronome;

    function pushFrame(t, f) {
      frames.push({ t, db: f.db, c: f.c });
      const tm = t - lat;
      let seg = null;
      if (tm >= 0 && tm < pl.totalSec) { for (let i = 0; i < pl.segs.length; i++) if (tm < pl.segs[i].t1) { seg = pl.segs[i]; break; } }
      emit('frame', { t, phase: t < 0 ? 'countin' : 'play', db: f.db, voiced: f.c != null, cents: f.c, noteName: f.c != null ? midiName(Math.round(f.c / 100)) : null,
        seg: seg ? seg.i : null, target: seg ? seg.note : null, centsFromTarget: seg && f.c != null ? f.c - seg.midi * 100 : null, bowDir: seg ? seg.dir : null,
        progress: clamp(tm / pl.totalSec, 0, 1) });
    }
    function step() {
      const now = clock(); // giây, tính từ phách đầu của ô đếm vào
      if (demo) {
        const need = needSamples(sig.sr, fo.minHz), half = winHalfSec(sig.sr);
        while ((nGrid + 1) * hop <= now) {
          nGrid++;
          const end = Math.round(nGrid * hop * sig.sr);
          if (end < need || end > sig.signal.length) continue;
          pushFrame(nGrid * hop - half - pl.countInSec, frameOf(sig.signal.subarray(end - need, end), sig.sr, fo));
        }
      } else {
        const ac = A.ctx(), an = input.analyser, sr = ac.sampleRate;
        if (!buf) buf = new Float32Array(an.fftSize);
        an.getFloatTimeDomainData(buf);
        const need = needSamples(sr, fo.minHz), half = winHalfSec(sr), hopS = Math.round(hop * sr);
        const maxBack = Math.max(0, Math.floor((buf.length - need) / hopS)); // bù khung khi timer bị trễ (iPhone)
        let k = Math.min(maxBack, Math.max(0, Math.round((now - nGrid * hop) / hop) - 1));
        if (now - nGrid * hop > (maxBack + 1.5) * hop) nGrid = Math.round(now / hop) - k - 1; // trễ quá lâu: bỏ đoạn mất
        for (; k >= 0; k--) {
          const end = buf.length - k * hopS;
          nGrid++;
          pushFrame(now - k * hop - half - pl.countInSec, frameOf(buf.subarray(end - need, end), sr, fo));
        }
      }
      const beat = Math.floor(now / pl.beatSec + 1e-6);
      if (beat !== lastBeat && beat >= 0 && beat < pl.countInBeats + pl.totalBeats) {
        lastBeat = beat;
        const pb = beat - pl.countInBeats;
        if (pb === 0 && state === 'countin') setState('playing');
        emit('beat', { index: pb, countIn: pb < 0, left: pb < 0 ? -pb : 0, inBar: ((beat % pl.beatsPerBar) + pl.beatsPerBar) % pl.beatsPerBar, bow: pb >= 0 ? Math.floor(pb / pl.beatsPerBow) : null });
      }
      if (now >= pl.countInSec + pl.totalSec + lat + TH.take.tailSec) finish(false);
    }
    function closeAll() {
      if (timer) clearInterval(timer); timer = null;
      if (input) { try { input.close(); } catch (e) {} } input = null;
      if (metroOn) { try { M.stop(); } catch (e) {} M.muted = false; M.accentEvery = 4; metroOn = false; }
    }
    function finish(aborted) {
      if (finished) return; finished = true;
      closeAll();
      let rep;
      if (aborted) {
        rep = { valid: false, code: 'ABORTED', message: CODE_MSG.ABORTED, warnings: [], pass: false, levelId: level.id, durationSec: 0, checks: {}, order: [], fails: [], tips: [], nOk: 0, nChecks: 0, events: [], segments: [], raw: {}, criteria: crit };
      } else {
        setState('analyzing');
        rep = analyzeTake(frames, pl, crit, { levelId: level.id, fixes: level.fixes, thrDb: fo.thrDb });
      }
      rep.levelId = level.id; rep.demo = demo; rep.pattern = demo ? (opts.pattern || 'smooth') : null; rep.plan = pl;
      rep.trace = frames; // [{t, db, c}] để màn Kết quả vẽ lại đồ thị; KHÔNG lưu vào localStorage
      // Chỉ ghi lượt đã chấm được: hợp lệ, hoặc WRONG_NOTE (vẫn có đủ số đo)
      rep.gate = rep.valid || rep.code === 'WRONG_NOTE' ? store.recordTake(level.id, rep) : store.gate(level.id);
      if (!aborted) last = rep; // lỡ bấm Dừng không làm mất phiếu chấm của lượt trước
      setState('done');
      emit('done', rep);
    }
    return {
      plan: pl, criteria: crit, demo,
      on(k, cb) { Ls[k] && Ls[k].add(cb); return this; },
      off(k, cb) { Ls[k] && Ls[k].delete(cb); return this; },
      get state() { return state; },
      // Lỗi: reject Error .code = INSECURE | DENIED | NO_MIC | UNSUPPORTED (như VE.createSession)
      async start() {
        if (state !== 'idle') return;
        setState('starting');
        frames = []; nGrid = 0; lastBeat = -1e9; finished = false;
        let ac = null;
        try { ac = A.ctx(); } catch (e) { if (!demo) { state = 'idle'; throw e; } }
        try {
          if (demo) {
            const mid = (r, d) => (r ? (r[0] + r[1]) / 2 : d);
            sig = demoSignal(pl, opts.pattern || 'smooth', { vibRate: (level.demo && level.demo.vibRate) || (crit.vib ? clamp(mid(crit.vib.rate, 5.5), 4.5, 6) : 5.5),
              vibWidth: (level.demo && level.demo.vibWidth) || (crit.vib ? clamp(mid(crit.vib.width, 36), 25, 45) : 36), clicks: opts.metronome !== false, a4: fo.a4 });
          } else {
            input = await A.openInput({ demo: false });
          }
        } catch (e) { state = 'idle'; emit('state', { state: 'idle', plan: pl }); throw e; }
        if (state !== 'starting') { closeAll(); return; } // đã bị stop() trong lúc chờ micro
        if (ac && speed === 1) {
          M.muted = opts.metronome === false; M.accentEvery = pl.beatsPerBar; M.start(pl.bpm); metroOn = true;
        }
        if (demo || !ac) { const p0 = root.performance.now() + 80; clock = () => ((root.performance.now() - p0) / 1000) * speed; }
        else { const t0 = M._t0; clock = () => ac.currentTime - t0; }
        tPlay0 = pl.countInSec;
        setState('countin');
        timer = setInterval(step, 12);
      },
      stop() { if (state === 'idle' || state === 'done') return; if (state === 'starting') { state = 'idle'; closeAll(); return; } finish(true); },
    };
  }
  LG.createSession = createSession;
})(typeof window !== 'undefined' ? window : globalThis);
