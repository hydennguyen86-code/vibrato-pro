/* Vibrato Pro — phần Độ mượt: KHUNG của 50 level (cấu trúc bài + bậc khó). [Fable] Schema: docs/SPEC-LEGATO.md §3.
 * Chữ hướng dẫn (goal, steps, tips, mistakes, feel…) nằm ở src/legato-content.js; video ở src/legato-videos.js.
 * Trọng tâm: CHUYỂN DÂY có từ vòng 2 và chiếm 28/50 level (vòng 2, 4, 6). */
(function (root) {
  'use strict';

  root.LEGATO_STAGES = [
    { id: 1, name: 'Đổi vĩ liền tiếng', range: [1, 8], short: 'M1–8', focus: 'bow' },
    { id: 2, name: 'Chuyển dây trên dây buông', range: [9, 18], short: 'M9–18', focus: 'cross' },
    { id: 3, name: 'Đổi nốt legato trên một dây', range: [19, 25], short: 'M19–25', focus: 'note' },
    { id: 4, name: 'Chuyển dây có bấm ngón', range: [26, 35], short: 'M26–35', focus: 'cross' },
    { id: 5, name: 'Vibrato xuyên đổi vĩ, đổi nốt', range: [36, 42], short: 'M36–42', focus: 'vib' },
    { id: 6, name: 'Vibrato xuyên chuyển dây · Cantabile', range: [43, 50], short: 'M43–50', focus: 'cross' },
  ];

  // 'D4/D0/2' = nốt D4, dây Rê, ngón 0 (buông), 2 phách
  const P = (s) => s.trim().split(/\s+/).map((x) => { const a = x.split('/'); return { note: a[0], string: a[1][0], finger: +a[1][1], beats: +a[2] }; });
  const out = [];
  // o: { title, bpm, bow (số phách mỗi vĩ), reps, pat, tier, zone, vib, crit }
  function add(id, stage, kind, o) {
    out.push({
      id, stage, kind, vibrato: !!o.vib, title: o.title,
      bpm: o.bpm || 60, beatsPerBow: o.bow || 4, beatsPerBar: 4, reps: o.reps || 4, pattern: P(o.pat),
      bowZone: o.zone || 'Giữa vĩ', tier: o.tier || 1, criteria: o.crit || {},
      demo: o.vib ? { vibRate: 5.5, vibWidth: 36 } : null,
      videoGroup: o.group || (o.vib ? (kind === 'cross' ? 'vibcross' : 'vib') : kind),
    });
  }

  // ── Vòng 1: đổi vĩ liền tiếng trên dây buông
  add(1, 1, 'bow', { title: 'Đổi vĩ ở giữa vĩ, dây Rê buông', pat: 'D4/D0/4' });
  add(2, 1, 'bow', { title: 'Đổi vĩ ở giữa vĩ, dây La buông', pat: 'A4/A0/4' });
  add(3, 1, 'bow', { title: 'Dây Sol buông: giữ tiếng dày qua điểm đổi vĩ', bpm: 58, pat: 'G3/G0/4' });
  add(4, 1, 'bow', { title: 'Dây Mi buông: nhẹ và sáng', bpm: 62, pat: 'E5/E0/4' });
  add(5, 1, 'bow', { title: 'Đổi vĩ ở gốc vĩ, dây Rê', bow: 3, reps: 5, pat: 'D4/D0/3', zone: 'Gốc vĩ' });
  add(6, 1, 'bow', { title: 'Đổi vĩ ở ngọn vĩ, dây La', bow: 3, reps: 5, pat: 'A4/A0/3', zone: 'Ngọn vĩ' });
  add(7, 1, 'bow', { title: 'Trọn vĩ 2 phách, dây La', bpm: 72, bow: 2, reps: 8, pat: 'A4/A0/2', zone: 'Trọn vĩ' });
  add(8, 1, 'bow', { title: 'Kiểm tra vòng 1: đổi vĩ mỗi phách, dây Rê', bpm: 66, bow: 1, reps: 12, pat: 'D4/D0/1', tier: 2, zone: 'Nửa trên của vĩ' });

  // ── Vòng 2: chuyển dây trên dây buông (tay trái nghỉ, dồn hết chú ý vào tay phải)
  add(9, 2, 'cross', { title: 'Rê sang La trong một vĩ (luyến)', pat: 'D4/D0/2 A4/A0/2' });
  add(10, 2, 'cross', { title: 'La sang Mi trong một vĩ (luyến)', pat: 'A4/A0/2 E5/E0/2' });
  add(11, 2, 'cross', { title: 'Sol sang Rê trong một vĩ (luyến)', bpm: 58, pat: 'G3/G0/2 D4/D0/2' });
  add(12, 2, 'cross', { title: 'Chuyển dây đúng lúc đổi vĩ: Rê và La', bow: 2, pat: 'D4/D0/2 A4/A0/2' });
  add(13, 2, 'cross', { title: 'Chuyển dây đúng lúc đổi vĩ: La và Mi', bow: 2, pat: 'A4/A0/2 E5/E0/2' });
  add(14, 2, 'cross', { title: 'Bập bênh Rê–La mỗi phách, luyến 4 nốt', reps: 3, pat: 'D4/D0/1 A4/A0/1 D4/D0/1 A4/A0/1' });
  add(15, 2, 'cross', { title: 'Bập bênh La–Mi mỗi phách, luyến 4 nốt', reps: 3, pat: 'A4/A0/1 E5/E0/1 A4/A0/1 E5/E0/1' });
  add(16, 2, 'cross', { title: 'Ba dây: Sol–Rê–La–Rê trong một vĩ', reps: 3, pat: 'G3/G0/1 D4/D0/1 A4/A0/1 D4/D0/1' });
  add(17, 2, 'cross', { title: 'Bốn dây đi lên rồi đi xuống', reps: 2, pat: 'G3/G0/1 D4/D0/1 A4/A0/1 E5/E0/1 E5/E0/1 A4/A0/1 D4/D0/1 G3/G0/1', zone: 'Trọn vĩ' });
  add(18, 2, 'cross', { title: 'Kiểm tra vòng 2: bập bênh nhanh, mỗi vĩ 2 nốt', bpm: 80, bow: 2, reps: 6, pat: 'D4/D0/1 A4/A0/1', tier: 2 });

  // ── Vòng 3: đổi nốt legato trên một dây
  add(19, 3, 'note', { title: 'Rê buông lên Mi (ngón 1), luyến', pat: 'D4/D0/2 E4/D1/2' });
  add(20, 3, 'note', { title: 'Ngón 1 lên ngón 2 trên dây La', pat: 'B4/A1/2 C#5/A2/2' });
  add(21, 3, 'note', { title: 'Đi xuống: ngón 3, ngón 2, ngón 1 trên dây Rê', reps: 3, pat: 'G4/D3/2 F#4/D2/1 E4/D1/1' });
  add(22, 3, 'note', { title: 'Đổi nốt đúng lúc đổi vĩ', bow: 2, pat: 'E4/D1/2 F#4/D2/2' });
  add(23, 3, 'note', { title: 'Bốn nốt một vĩ: Rê–Mi–Fa#–Sol', reps: 3, pat: 'D4/D0/1 E4/D1/1 F#4/D2/1 G4/D3/1', zone: 'Trọn vĩ' });
  add(24, 3, 'note', { title: 'Ngón 3 và ngón 4 trên dây La', pat: 'D5/A3/2 E5/A4/2' });
  add(25, 3, 'note', { title: 'Kiểm tra vòng 3: năm nốt lên xuống trên dây Rê', bpm: 72, reps: 2, pat: 'D4/D0/1 E4/D1/1 F#4/D2/1 G4/D3/1 A4/D4/1 G4/D3/1 F#4/D2/1 E4/D1/1', tier: 2, zone: 'Trọn vĩ' });

  // ── Vòng 4: chuyển dây có bấm ngón (hai tay cùng đổi)
  add(26, 4, 'cross', { title: 'Ngón 1 dây Rê sang dây La buông', pat: 'E4/D1/2 A4/A0/2' });
  add(27, 4, 'cross', { title: 'Dây La buông sang ngón 1 dây Mi', pat: 'A4/A0/2 F#5/E1/2' });
  add(28, 4, 'cross', { title: 'Ngón 3 sang dây buông kế bên (Sol lên La)', pat: 'G4/D3/2 A4/A0/2' });
  add(29, 4, 'cross', { title: 'Ngón 3 sang dây buông, đúng lúc đổi vĩ', bow: 2, pat: 'G4/D3/2 A4/A0/2' });
  add(30, 4, 'cross', { title: 'Quãng 6: ngón 1 dây Rê và ngón 2 dây La', pat: 'E4/D1/2 C#5/A2/2' });
  add(31, 4, 'cross', { title: 'Cùng ngón 1 sang dây (quãng 5)', pat: 'E4/D1/2 B4/A1/2' });
  add(32, 4, 'cross', { title: 'Âm giai Rê trưởng một quãng tám, luyến 4', bpm: 66, reps: 2, pat: 'D4/D0/1 E4/D1/1 F#4/D2/1 G4/D3/1 A4/A0/1 B4/A1/1 C#5/A2/1 D5/A3/1', zone: 'Trọn vĩ' });
  add(33, 4, 'cross', { title: 'Âm giai La trưởng qua dây La và Mi', bpm: 66, reps: 2, pat: 'A4/A0/1 B4/A1/1 C#5/A2/1 D5/A3/1 E5/E0/1 F#5/E1/1 G#5/E2/1 A5/E3/1', tier: 2, zone: 'Trọn vĩ' });
  add(34, 4, 'cross', { title: 'Bập bênh có bấm: Fa# (dây Rê) và La buông', bpm: 66, reps: 3, pat: 'F#4/D2/1 A4/A0/1 F#4/D2/1 A4/A0/1', tier: 2 });
  add(35, 4, 'cross', { title: 'Kiểm tra vòng 4: hợp âm rải ba dây', bpm: 72, reps: 3, pat: 'D4/D0/1 A4/A0/1 F#5/E1/1 A4/A0/1', tier: 2 });

  // ── Vòng 5: vibrato không đơ khi đổi vĩ và đổi nốt (mỗi nốt dài ≥ 1 giây để đo được vibrato)
  add(36, 5, 'bow', { vib: 1, title: 'Vibrato không dừng khi đổi vĩ: ngón 2 dây La', pat: 'C#5/A2/4' });
  add(37, 5, 'bow', { vib: 1, title: 'Vibrato xuyên đổi vĩ: ngón 3 dây La', pat: 'D5/A3/4' });
  add(38, 5, 'bow', { vib: 1, title: 'Vibrato xuyên đổi vĩ: ngón 1 dây Rê', pat: 'E4/D1/4' });
  add(39, 5, 'bow', { vib: 1, title: 'Đổi vĩ mỗi 2 phách, vibrato vẫn chạy', bow: 2, reps: 8, pat: 'C#5/A2/2', zone: 'Trọn vĩ' });
  add(40, 5, 'note', { vib: 1, title: 'Nối vibrato qua hai nốt: ngón 1 lên ngón 2', pat: 'B4/A1/2 C#5/A2/2' });
  add(41, 5, 'note', { vib: 1, title: 'Nối vibrato đi xuống: ngón 3, 2, 1', bow: 2, reps: 2, pat: 'D5/A3/2 C#5/A2/2 B4/A1/2' });
  add(42, 5, 'note', { vib: 1, title: 'Kiểm tra vòng 5: vibrato qua đổi nốt và đổi vĩ', reps: 2, pat: 'B4/A1/2 C#5/A2/2 D5/A3/2 C#5/A2/2', tier: 2, zone: 'Trọn vĩ' });

  // ── Vòng 6: vibrato xuyên chuyển dây (cả hai nốt đều bấm ngón) và câu cantabile
  add(43, 6, 'cross', { vib: 1, title: 'Chuyển dây có vibrato: ngón 2 dây Rê sang ngón 2 dây La', pat: 'F#4/D2/2 C#5/A2/2', tier: 2 });
  add(44, 6, 'cross', { vib: 1, title: 'Chuyển dây có vibrato: ngón 1 dây La sang ngón 1 dây Mi', pat: 'B4/A1/2 F#5/E1/2', tier: 2 });
  add(45, 6, 'cross', { vib: 1, title: 'Chuyển dây có vibrato ở dây trầm: Sol và Rê', bpm: 58, pat: 'B3/G2/2 F#4/D2/2', tier: 2 });
  add(46, 6, 'cross', { vib: 1, title: 'Vừa chuyển dây vừa đổi ngón: ngón 3 dây Rê sang ngón 1 dây La', pat: 'G4/D3/2 B4/A1/2', tier: 2 });
  add(47, 6, 'cross', { vib: 1, title: 'Chuyển dây đúng lúc đổi vĩ, vibrato không dừng', bow: 2, pat: 'F#4/D2/2 B4/A1/2', tier: 2 });
  add(48, 6, 'cross', { vib: 1, title: 'Câu cantabile trên dây Rê và La', reps: 2, pat: 'F#4/D2/2 G4/D3/2 B4/A1/2 C#5/A2/2', tier: 2, zone: 'Trọn vĩ', group: 'cantabile' });
  add(49, 6, 'cross', { vib: 1, title: 'Câu cantabile trên dây La và Mi', reps: 2, pat: 'C#5/A2/2 D5/A3/2 F#5/E1/2 E5/A4/2', tier: 2, zone: 'Trọn vĩ', group: 'cantabile' });
  add(50, 6, 'cross', { vib: 1, title: 'Thử thách cuối: câu hát qua ba dây', reps: 1, pat: 'B3/G2/2 E4/D1/2 G4/D3/2 B4/A1/2 D5/A3/2 B4/A1/2 G4/D3/2 E4/D1/2', tier: 3, zone: 'Trọn vĩ', group: 'cantabile' });

  root.LEGATO_LEVELS = out;
})(typeof window !== 'undefined' ? window : globalThis);
