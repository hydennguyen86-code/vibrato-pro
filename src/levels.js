/* Vibrato Pro — 100 level (Opus). Schema: SPEC.md §2.
 * Hạt nhân chịu lực: khớp đầu ngón mềm + ngón cái không bóp + lăn VỀ PHÍA CUỘN ĐÀN (rung xuống dưới nốt).
 * Vòng 1–2 chưa có tiếng → tự kiểm (self). Từ vòng 3 có cung → đo bằng micro. */
(function (root) {
  'use strict';

  root.STAGES = [
    { id: 1, name: 'Không đàn', range: [1, 10], short: 'L1–10' },
    { id: 2, name: 'Trên đàn, chưa kéo cung', range: [11, 22], short: 'L11–22' },
    { id: 3, name: 'Metronome 60 + cung', range: [23, 36], short: 'L23–36' },
    { id: 4, name: 'Cung dài & đổi cung', range: [37, 50], short: 'L37–50' },
    { id: 5, name: 'Tốc độ & độ rộng', range: [51, 64], short: 'L51–64' },
    { id: 6, name: 'Liên tục qua nốt', range: [65, 78], short: 'L65–78' },
    { id: 7, name: 'Dây Sol/Mi & thế cao', range: [79, 90], short: 'L79–90' },
    { id: 8, name: 'Biểu cảm', range: [91, 100], short: 'L91–100' },
  ];

  // Nốt gợi ý ở thế 1 (violin)
  const N = {
    G: { 1: ['A3', 57], 2: ['B3', 59], 3: ['C4', 60], 4: ['D4', 62] },
    D: { 1: ['E4', 64], 2: ['F#4', 66], 3: ['G4', 67], 4: ['A4', 69] },
    A: { 1: ['B4', 71], 2: ['C#5', 73], 3: ['D5', 74], 4: ['E5', 76] },
    E: { 1: ['F#5', 78], 2: ['G#5', 80], 3: ['A5', 81], 4: ['B5', 83] },
  };
  const yt = (title, query) => ({ title, query });
  const out = [];

  // Level tự kiểm (chưa có tiếng)
  function self(id, stage, o) {
    out.push({
      id, stage, mode: 'self',
      title: o.title, goal: o.goal,
      bpm: o.bpm || 60, cyclesPerBeat: o.cpb || 1,
      string: o.string || null, finger: o.finger || null,
      noteName: o.string && o.finger ? N[o.string][o.finger][0] : null,
      steps: o.steps, tips: o.tips, mistakes: o.mistakes,
      selfCheck: o.check, selfSeconds: o.seconds || 60,
      demo: { rate: ((o.bpm || 60) / 60) * (o.cpb || 1), width: o.width || 40, midi: 73 },
      anim: { type: o.anim, rate: ((o.bpm || 60) / 60) * (o.cpb || 1), width: o.width || 40 },
      youtube: o.yt,
    });
  }

  // Level đo bằng micro
  function meas(id, stage, o) {
    const rateMid = (o.bpm / 60) * o.cpb;
    const tol = o.tol != null ? o.tol : Math.max(0.2, rateMid * 0.08);
    const rate = o.rate || [+(rateMid - tol).toFixed(2), +(rateMid + tol).toFixed(2)];
    const s = o.string || 'A', f = o.finger || 2;
    const note = o.note || N[s][f];
    const w = o.width || [25, 60];
    out.push({
      id, stage, mode: 'measure',
      title: o.title, goal: o.goal,
      bpm: o.bpm, cyclesPerBeat: o.cpb,
      string: s, finger: f, noteName: note[0],
      steps: o.steps, tips: o.tips, mistakes: o.mistakes,
      criteria: { rate, regularityMin: o.reg, width: w, center: true, holdSec: o.hold || 4 },
      demo: { rate: +((rate[0] + rate[1]) / 2).toFixed(2), width: Math.round((w[0] + w[1]) / 2), midi: note[1] },
      anim: { type: o.anim || 'arm', rate: +((rate[0] + rate[1]) / 2).toFixed(2), width: Math.round((w[0] + w[1]) / 2) },
      youtube: o.yt,
    });
  }

  // ───────────── Vòng 1: Không đàn (L1–10) ─────────────
  self(1, 1, {
    title: 'Ngón cái thả lỏng', goal: 'Nhận ra cảm giác ngón cái không bóp — gốc rễ của mọi vibrato.', anim: 'tap', seconds: 45,
    steps: ['Đặt tay trái lên đùi, lòng bàn tay úp.', 'Chạm đầu ngón cái vào cạnh ngón trỏ thật nhẹ, như cầm một chiếc lông chim.', 'Lắc nhẹ cổ tay: ngón cái phải lắc theo, không bám chặt.', 'Đếm 45 giây, thở đều.'],
    tips: ['Nếu thấy móng ngón cái trắng ra là đang bóp.', 'Hạ vai trước khi bắt đầu.'],
    mistakes: ['Gồng cả bàn tay để "giữ cho chắc".'],
    check: ['Ngón cái lắc tự do theo cổ tay', 'Vai không nhô lên', 'Không thấy móng tay trắng'],
    yt: yt('Thả lỏng ngón cái tay trái', 'violin left hand thumb tension release'),
  });
  self(2, 1, {
    title: 'Gõ ngón trên mặt bàn', goal: 'Tách chuyển động từng ngón, khớp đầu ngón mềm.', anim: 'tap', seconds: 60,
    steps: ['Cong tròn bàn tay trên mặt bàn như cầm quả cam.', 'Gõ lần lượt ngón 1-2-3-4, mỗi ngón 8 lần.', 'Sau mỗi lần gõ để khớp đầu ngón hơi lún xuống rồi bật lên.'],
    tips: ['Âm gõ nhỏ và đều là đúng; gõ mạnh là đang dùng lực cánh tay.', 'Ngón không gõ thì nằm yên, không vểnh.'],
    mistakes: ['Khớp đầu ngón cứng thẳng như que.', 'Các ngón khác co giật theo.'],
    check: ['4 ngón đều gõ được 8 lần', 'Khớp đầu ngón mềm, có lún', 'Ngón cái vẫn thả lỏng'],
    yt: yt('Bài gõ ngón tay trái violin', 'violin finger tapping exercise left hand'),
  });
  self(3, 1, {
    title: 'Gõ ngón theo metronome', goal: 'Đưa chuyển động ngón vào nhịp đều 60.', anim: 'tap', bpm: 60, cpb: 1, seconds: 60,
    steps: ['Bật metronome 60.', 'Mỗi tiếng tích gõ một ngón, đi 1-2-3-4-3-2-1.', 'Sau đó gõ 2 lần mỗi tích.'],
    tips: ['Nghe tiếng gõ trùng với tiếng tích là đạt.', 'Nhắm mắt để tập trung vào cảm giác.'],
    mistakes: ['Gõ nhanh dần, bỏ nhịp.'],
    check: ['Gõ trùng nhịp 1 lần/tích suốt 30 giây', 'Gõ được 2 lần/tích không vội', 'Không gồng vai'],
    yt: yt('Gõ ngón theo metronome', 'violin vibrato preparation finger tap metronome'),
  });
  self(4, 1, {
    title: 'Đánh bóng cẳng tay', goal: 'Cảm nhận chuyển động trượt từ khuỷu tay — hình dạng của vibrato cánh tay.', anim: 'polish', seconds: 60, width: 60,
    steps: ['Đặt đầu ngón 2 tay trái lên cẳng tay phải.', 'Trượt tới lui khoảng 5 cm như đánh bóng, chuyển động đến từ khuỷu.', 'Cổ tay giữ thẳng, ngón chỉ chạm nhẹ.'],
    tips: ['Tưởng tượng đang lau một vết bụi nhỏ.', 'Khuỷu tay là cái bản lề, bàn tay chỉ đi theo.'],
    mistakes: ['Ấn mạnh làm da cẳng tay kéo theo.'],
    check: ['Trượt đều, không giật', 'Chuyển động từ khuỷu, cổ tay không gập', 'Ngón chạm nhẹ'],
    yt: yt('Bài đánh bóng (polishing) chuẩn bị vibrato', 'violin vibrato polishing exercise'),
  });
  self(5, 1, {
    title: 'Đánh bóng theo nhịp', goal: 'Trượt đúng 2 lần mỗi phách ở nhịp 60.', anim: 'polish', bpm: 60, cpb: 2, seconds: 60, width: 50,
    steps: ['Bật metronome 60.', 'Mỗi phách trượt lên – xuống 2 lần trên mặt bàn.', 'Giảm biên độ dần từ 5 cm còn 2 cm mà vẫn đúng nhịp.'],
    tips: ['Đếm thầm "một-và-hai-và".', 'Biên độ nhỏ đi nhưng nhịp không đổi.'],
    mistakes: ['Khi thu nhỏ thì nhịp chạy nhanh lên.'],
    check: ['2 lần/phách đều trong 30 giây', 'Thu được biên độ còn 2 cm', 'Cổ tay và ngón cái thả lỏng'],
    yt: yt('Đánh bóng theo metronome', 'violin vibrato metronome polishing'),
  });
  self(6, 1, {
    title: 'Lắc chai nhỏ', goal: 'Học nhịp lắc thả lỏng bằng một vật nặng nhẹ.', anim: 'polish', bpm: 60, cpb: 2, seconds: 60, width: 50,
    steps: ['Cầm một chai nhỏ có ít hạt gạo hoặc viên thuốc bên trong.', 'Lắc theo hướng tới–lui như hướng cần đàn, 2 lần mỗi phách.', 'Lắng nghe tiếng hạt: đều và gọn là đúng.'],
    tips: ['Cầm chai bằng đầu ngón, không nắm cả bàn tay.', 'Âm thanh giúp tai kiểm tra độ đều.'],
    mistakes: ['Lắc vòng tròn thay vì tới–lui.'],
    check: ['Tiếng hạt đều theo nhịp', 'Cầm bằng đầu ngón', 'Lắc tới–lui một trục'],
    yt: yt('Bài lắc chai luyện vibrato', 'violin vibrato shaker bottle exercise'),
  });
  self(7, 1, {
    title: 'Gõ cửa bằng cổ tay', goal: 'Mở khoá chuyển động cổ tay — nền của vibrato cổ tay.', anim: 'wrist', bpm: 60, cpb: 2, seconds: 60, width: 45,
    steps: ['Giơ tay trái như cầm đàn, lòng bàn tay hướng về mặt.', 'Gập cổ tay ra sau rồi về như gõ cửa nhẹ, cẳng tay đứng yên.', 'Gõ 2 lần mỗi phách ở nhịp 60.'],
    tips: ['Cẳng tay đứng yên, chỉ bàn tay lắc.', 'Thả lỏng như vẫy nước khỏi tay.'],
    mistakes: ['Cả cánh tay lắc theo.'],
    check: ['Cẳng tay đứng yên', 'Cổ tay gập mềm 2 lần/phách', 'Ngón tay thả lỏng'],
    yt: yt('Bài gõ cửa (knocking) luyện vibrato cổ tay', 'violin wrist vibrato knocking exercise'),
  });
  self(8, 1, {
    title: 'Vẫy tay tạm biệt', goal: 'Phối hợp cổ tay với ngón đang chạm một điểm cố định.', anim: 'wrist', bpm: 60, cpb: 2, seconds: 60, width: 45,
    steps: ['Chạm đầu ngón 2 vào chóp mũi hoặc cằm (điểm cố định).', 'Vẫy bàn tay tới–lui quanh điểm chạm, đầu ngón không rời.', 'Khớp đầu ngón sẽ phải gập–duỗi theo: đó là cảm giác cần có.'],
    tips: ['Đầu ngón là trục, bàn tay là con lắc.', 'Đổi ngón 1, 3, 4 sau 15 giây.'],
    mistakes: ['Đầu ngón trượt khỏi điểm chạm.'],
    check: ['Đầu ngón đứng yên một điểm', 'Khớp đầu ngón gập–duỗi theo', 'Làm được với cả 4 ngón'],
    yt: yt('Bài vẫy tay quanh điểm cố định', 'violin vibrato waving exercise fixed finger'),
  });
  self(9, 1, {
    title: 'Lăn khớp đầu ngón', goal: 'Khớp đầu ngón mềm — hạt nhân chịu lực của vibrato.', anim: 'finger', bpm: 60, cpb: 2, seconds: 60, width: 30,
    steps: ['Đặt đầu ngón 2 lên đầu ngón cái của chính tay đó.', 'Lăn đầu ngón 2 tới–lui trên ngón cái: khớp đầu ngón gập rồi duỗi.', 'Lặp với ngón 1, 3, 4.'],
    tips: ['Ngón 4 thường cứng nhất, dành thêm thời gian.', 'Không cần nhanh, cần mềm.'],
    mistakes: ['Khớp đầu ngón khoá thẳng, chỉ cả ngón đẩy tới lui.'],
    check: ['Khớp đầu ngón gập–duỗi rõ ở 4 ngón', 'Ngón 4 làm được dù chậm', 'Không đau, không mỏi'],
    yt: yt('Luyện khớp đầu ngón mềm cho vibrato', 'violin vibrato finger joint flexibility exercise'),
  });
  self(10, 1, {
    title: 'Kiểm tra vòng 1', goal: '60 giây chuyển động đều trên không, sẵn sàng cầm đàn.', anim: 'wrist', bpm: 60, cpb: 2, seconds: 90, width: 40,
    steps: ['Metronome 60, gõ ngón 30 giây.', 'Đánh bóng cẳng tay 2 lần/phách 30 giây.', 'Vẫy tay quanh điểm cố định 30 giây.'],
    tips: ['Quay video 1 lần để tự xem ngón cái.', 'Nếu mỏi tay, nghỉ 1 phút rồi làm lại.'],
    mistakes: ['Vội vàng chuyển sang đàn khi chuyển động còn gồng.'],
    check: ['3 bài liên tục đúng nhịp', 'Ngón cái thả lỏng suốt 90 giây', 'Xem lại video thấy không gồng vai'],
    yt: yt('Tổng hợp bài tập vibrato không đàn', 'violin vibrato exercises without violin'),
  });

  // ───────────── Vòng 2: Trên đàn, chưa kéo cung (L11–22) ─────────────
  self(11, 2, {
    title: 'Tay trên vai đàn', goal: 'Đặt tay lên thân đàn, trượt nhẹ để quen vị trí.', anim: 'slide', seconds: 60, width: 60,
    steps: ['Kẹp đàn ở tư thế chơi, không cầm cung.', 'Đặt lòng bàn tay trái lên vai đàn (chỗ cần đàn nối thân).', 'Trượt tay lên xuống vai đàn 2–3 cm, ngón cái lướt dưới cần.'],
    tips: ['Đàn đứng vững nhờ cằm và vai, tay trái không đỡ đàn.', 'Ngón cái chỉ lướt, không ôm cần.'],
    mistakes: ['Tay trái gánh sức nặng của đàn.'],
    check: ['Đàn đứng vững khi tay trượt', 'Ngón cái lướt không ôm', 'Vai không nhô'],
    yt: yt('Tư thế tay trái chuẩn bị vibrato', 'violin left hand setup for vibrato'),
  });
  self(12, 2, {
    title: 'Đánh bóng dây đàn', goal: 'Trượt cả tay dọc cần đàn, ngón lướt trên dây.', anim: 'slide', seconds: 60, width: 60,
    steps: ['Đặt ngón 2 hờ trên dây La, không ấn xuống.', 'Trượt cả bàn tay từ thế 1 lên thế 3 rồi về, như đánh bóng dây.', 'Ngón cái trượt cùng, không kéo lại.'],
    tips: ['Nghe tiếng sột soạt nhẹ là đúng lực.', 'Chuyển động đến từ khuỷu tay.'],
    mistakes: ['Ấn dây xuống làm ngón kẹt lại.'],
    check: ['Trượt lên–xuống mượt 20 lần', 'Ngón cái đi cùng bàn tay', 'Không ấn dây'],
    yt: yt('Bài đánh bóng dây (polishing the string)', 'violin vibrato polishing the string exercise'),
  });
  self(13, 2, {
    title: 'Đánh bóng theo nhịp', goal: 'Trượt dây 1 lần mỗi phách rồi 2 lần mỗi phách.', anim: 'slide', bpm: 60, cpb: 2, seconds: 60, width: 50,
    steps: ['Metronome 60.', 'Mỗi phách trượt lên–xuống 1 lần, quãng thế 1 → thế 2.', 'Đạt rồi thì chuyển 2 lần mỗi phách.'],
    tips: ['Khi nhanh hơn thì thu ngắn quãng trượt.', 'Mắt nhìn ngón cái: phải mềm.'],
    mistakes: ['Nhanh lên thì gồng lên.'],
    check: ['1 lần/phách đều', '2 lần/phách đều', 'Ngón cái thả lỏng'],
    yt: yt('Đánh bóng dây theo metronome', 'violin vibrato slide exercise metronome'),
  });
  self(14, 2, {
    title: 'Thu nhỏ quãng trượt', goal: 'Từ trượt dài 5 cm thu còn 1 cm — tiến dần tới vibrato.', anim: 'slide', bpm: 60, cpb: 2, seconds: 60, width: 35,
    steps: ['Bắt đầu trượt 5 cm, 2 lần/phách.', 'Cứ 8 phách giảm một nửa quãng trượt.', 'Kết thúc ở quãng 1 cm, ngón vẫn lướt trên dây.'],
    tips: ['Phóng to rồi thu nhỏ: tìm lại cảm giác lớn khi bị cứng.', 'Nhịp không đổi khi quãng nhỏ lại.'],
    mistakes: ['Dừng hẳn khi quãng nhỏ.'],
    check: ['Thu từ 5 cm còn 1 cm liền mạch', 'Nhịp giữ đều', 'Không gồng'],
    yt: yt('Từ trượt dây sang vibrato', 'violin vibrato from sliding to vibrato'),
  });
  self(15, 2, {
    title: 'Lăn ngón 2 trên dây La', goal: 'Ngón đứng yên trên dây, khớp đầu ngón lăn về phía cuộn đàn.', anim: 'arm', bpm: 60, cpb: 1, string: 'A', finger: 2, seconds: 60, width: 40,
    steps: ['Ấn ngón 2 lên dây La (nốt Đô thăng) với lực vừa đủ.', 'Cánh tay đẩy bàn tay lùi về phía cuộn đàn, khớp đầu ngón duỗi ra.', 'Trở về vị trí nốt. Mỗi phách 1 lần.', 'Ngón không trượt khỏi điểm bấm.'],
    tips: ['Lăn về phía CUỘN đàn rồi trở về nốt — không lăn vượt lên phía ngựa đàn.', 'Đầu ngón như một bánh xe lăn tại chỗ.'],
    mistakes: ['Ngón trượt dọc dây thay vì lăn.', 'Lăn cả về phía ngựa đàn (rung trên nốt).'],
    check: ['Đầu ngón không rời điểm bấm', 'Chỉ lăn về phía cuộn đàn rồi về', 'Khớp đầu ngón duỗi–gập rõ'],
    yt: yt('Lăn ngón vibrato chậm trên dây', 'violin vibrato rolling finger slow exercise'),
  });
  self(16, 2, {
    title: 'Lăn ngón 3', goal: 'Lặp chuyển động lăn với ngón 3.', anim: 'arm', bpm: 60, cpb: 1, string: 'A', finger: 3, seconds: 60, width: 40,
    steps: ['Ngón 3 trên dây La (nốt Rê).', 'Lăn về phía cuộn đàn rồi về, mỗi phách 1 lần.', 'Giữ ngón 2 nhấc nhẹ, không đè.'],
    tips: ['Ngón 3 hay gồng vì gần ngón 4 — thả lỏng ngón 4.', 'Lực bấm nhẹ hơn bạn nghĩ.'],
    mistakes: ['Ngón 4 cứng vểnh lên.'],
    check: ['Đầu ngón đứng yên', 'Lăn về phía cuộn đàn', 'Ngón 4 thả lỏng'],
    yt: yt('Vibrato ngón 3 cho người mới', 'violin vibrato third finger beginner'),
  });
  self(17, 2, {
    title: 'Lăn ngón 1', goal: 'Ngón 1 có góc khó nhất — lăn mà không kéo ngón cái.', anim: 'arm', bpm: 60, cpb: 1, string: 'A', finger: 1, seconds: 60, width: 40,
    steps: ['Ngón 1 trên dây La (nốt Si).', 'Lăn về phía cuộn đàn rồi về, mỗi phách 1 lần.', 'Kiểm tra khe giữa ngón cái và ngón trỏ không bị kẹp.'],
    tips: ['Ngón 1 cần cổ tay thẳng, không gập vào cần đàn.', 'Có thể kê nhẹ cổ tay vào thân đàn lúc đầu.'],
    mistakes: ['Gốc ngón trỏ bám chặt cần đàn.'],
    check: ['Gốc ngón trỏ không ôm cần đàn', 'Lăn đều mỗi phách', 'Ngón cái lướt nhẹ'],
    yt: yt('Vibrato ngón 1 khó và cách sửa', 'violin first finger vibrato tips'),
  });
  self(18, 2, {
    title: 'Lăn ngón 4', goal: 'Ngón yếu nhất cũng lăn được với khớp đầu ngón cong.', anim: 'arm', bpm: 60, cpb: 1, string: 'A', finger: 4, seconds: 60, width: 35,
    steps: ['Ngón 4 trên dây La (nốt Mi).', 'Giữ khớp đầu ngón cong, lăn về phía cuộn đàn rồi về.', 'Có thể để ngón 3 chạm nhẹ dây cho đỡ.'],
    tips: ['Biên độ nhỏ hơn ngón khác là bình thường.', 'Giữ khuỷu tay xoay vào dưới đàn để ngón 4 với tới.'],
    mistakes: ['Khớp đầu ngón 4 gãy gập ngược.'],
    check: ['Khớp đầu ngón 4 không gãy ngược', 'Lăn được mỗi phách', 'Không đau'],
    yt: yt('Luyện vibrato ngón 4', 'violin fourth finger vibrato exercise'),
  });
  self(19, 2, {
    title: 'Ngón cái biết thở', goal: 'Kiểm tra ngón cái không bóp trong lúc lăn.', anim: 'arm', bpm: 60, cpb: 1, string: 'A', finger: 2, seconds: 60, width: 40,
    steps: ['Lăn ngón 2 mỗi phách như L15.', 'Trong lúc lăn, nhấc ngón cái khỏi cần đàn 1 phách rồi đặt lại.', 'Nếu đàn rung lắc hay ngón trượt: đang dựa vào ngón cái quá nhiều.'],
    tips: ['Ngón cái là điểm tựa phụ, không phải cái kẹp.', 'Làm cả với ngón 1, 3.'],
    mistakes: ['Nhấc ngón cái thì vibrato dừng.'],
    check: ['Nhấc ngón cái mà vẫn lăn được', 'Đặt lại không bóp', 'Làm được với ngón 1–3'],
    yt: yt('Ngón cái và vibrato thả lỏng', 'violin vibrato thumb tension'),
  });
  self(20, 2, {
    title: 'Ngủ – thức dậy', goal: 'Dựa cổ tay vào thân đàn ở thế 3, tìm chuyển động cổ tay.', anim: 'wrist', bpm: 60, cpb: 1, string: 'A', finger: 2, seconds: 60, width: 40,
    steps: ['Đưa tay lên thế 3, gốc bàn tay chạm nhẹ vai đàn.', 'Bàn tay ngả về phía cuộn đàn ("ngủ") rồi dựng lại ("thức").', 'Ngón 2 đứng yên trên dây, khớp đầu ngón lăn theo.'],
    tips: ['Ở thế 3, tay có điểm tựa nên dễ thả lỏng hơn.', 'Đây là cửa vào của vibrato cổ tay.'],
    mistakes: ['Ép gốc bàn tay vào thân đàn.'],
    check: ['Gốc bàn tay chạm nhẹ, không ép', 'Ngón đứng yên trên dây', 'Chuyển động mềm mỗi phách'],
    yt: yt('Bài "go to sleep, wake up" cho vibrato', 'violin vibrato third position wrist exercise'),
  });
  self(21, 2, {
    title: '2 lần mỗi phách, đủ 4 ngón', goal: 'Lăn 2 lần mỗi phách với từng ngón ở thế 1.', anim: 'arm', bpm: 60, cpb: 2, string: 'A', finger: 2, seconds: 90, width: 40,
    steps: ['Metronome 60.', 'Ngón 2: 2 lần/phách trong 8 phách.', 'Lần lượt ngón 3, 1, 4, mỗi ngón 8 phách.'],
    tips: ['Đổi ngón trong lúc nghỉ 1 phách.', 'Biên độ đều nhau giữa các ngón.'],
    mistakes: ['Ngón 4 chậm hơn nhịp.'],
    check: ['Cả 4 ngón đúng 2 lần/phách', 'Không trượt khỏi điểm bấm', 'Ngón cái thả lỏng'],
    yt: yt('Vibrato hai lần mỗi phách', 'violin vibrato two per beat exercise'),
  });
  self(22, 2, {
    title: 'Kiểm tra vòng 2', goal: 'Lăn vững cả 4 ngón trước khi thêm cung.', anim: 'arm', bpm: 60, cpb: 2, string: 'A', finger: 2, seconds: 120, width: 40,
    steps: ['Mỗi ngón 30 giây, 2 lần/phách ở nhịp 60.', 'Giữa chừng nhấc ngón cái 1 phách để kiểm tra.', 'Quay video 1 lượt và tự xem.'],
    tips: ['Video nên quay từ phía cuộn đàn nhìn xuống bàn tay.', 'Thấy gồng ở ngón nào thì quay lại level của ngón đó.'],
    mistakes: ['Qua vòng khi vẫn còn trượt ngón.'],
    check: ['4 ngón × 30 giây không trượt', 'Lăn về phía cuộn đàn, không vượt nốt', 'Video không thấy ngón cái bóp'],
    yt: yt('Kiểm tra vibrato trước khi kéo cung', 'violin vibrato checklist before bowing'),
  });

  // ───────────── Vòng 3: Metronome 60 + cung (L23–36) ─────────────
  const stepsBow = (n, extra) => [
    'Kéo cung dài, đều trên dây ' + n + ', nốt giữ 4 phách.',
    'Metronome ' + extra.bpm + '. Mỗi phách lăn đúng ' + extra.cpb + ' lần về phía cuộn đàn.',
    'Cung đi đều, không nhấn theo nhịp lăn.',
    'Bấm "Bắt đầu đo", giữ đạt ' + extra.hold + ' giây liên tục.',
  ];
  const v3 = [
    // id, finger, cpb, tolHz, width, reg, hold, title
    [23, 2, 1, 0.2, [30, 70], 55, 4, 'Lăn chậm 1 lần mỗi phách'],
    [24, 3, 1, 0.2, [30, 70], 55, 4, 'Ngón 3, 1 lần mỗi phách'],
    [25, 2, 2, 0.25, [25, 65], 58, 4, 'Ngón 2, 2 lần mỗi phách'],
    [26, 3, 2, 0.25, [25, 65], 58, 4, 'Ngón 3, 2 lần mỗi phách'],
    [27, 1, 2, 0.25, [25, 65], 58, 4, 'Ngón 1, 2 lần mỗi phách'],
    [28, 4, 2, 0.25, [20, 60], 55, 4, 'Ngón 4, 2 lần mỗi phách'],
    [29, 2, 3, 0.3, [25, 60], 60, 4, 'Giữ rung đều ở 3 Hz'],
    [30, 3, 3, 0.3, [25, 60], 62, 4, 'Ngón 3 ở 3 Hz'],
    [31, 1, 3, 0.3, [25, 60], 62, 4, 'Ngón 1 ở 3 Hz'],
    [32, 4, 3, 0.3, [20, 55], 60, 4, 'Ngón 4 ở 3 Hz'],
    [33, 2, 4, 0.35, [25, 60], 65, 5, 'Ngón 2 ở 4 Hz'],
    [34, 3, 4, 0.35, [25, 60], 65, 5, 'Ngón 3 ở 4 Hz'],
    [35, 1, 4, 0.35, [20, 60], 65, 5, 'Ngón 1 và 4 ở 4 Hz'],
    [36, 2, 4, 0.35, [25, 60], 70, 6, 'Kiểm tra vòng 3: 4 Hz'],
  ];
  const tips3 = {
    1: ['Chậm mà đều quan trọng hơn nhanh.', 'Thấy đường sóng chạm vạch trên rồi đi xuống là đúng hướng.'],
    2: ['Đếm "lăn-về, lăn-về" theo nhịp.', 'Biên độ rộng lúc này là bình thường.'],
    3: ['Ba lần mỗi phách: đếm "1-2-3" trong mỗi tích.', 'Nếu nhịp trôi, quay lại 2 lần/phách 1 phút.'],
    4: ['Bốn lần mỗi phách gần với vibrato thật.', 'Giữ cung chậm để có thời gian nghe.'],
  };
  v3.forEach(([id, f, cpb, tol, width, reg, hold, title]) => {
    const n = N.A[f][0];
    meas(id, 3, {
      title, goal: 'Rung ' + cpb + ' lần mỗi phách ở nhịp 60 với ngón ' + (id === 35 ? '1 và 4' : f) + ', có kéo cung.',
      bpm: 60, cpb, tol, string: 'A', finger: id === 35 ? 1 : f, width, reg, hold,
      steps: id === 35
        ? ['Nửa đầu cung: ngón 1 (nốt Si) 4 lần/phách.', 'Nửa sau cung: ngón 4 (nốt Mi) 4 lần/phách.', 'Đo từng ngón, mỗi ngón phải đạt riêng.', 'Bấm "Bắt đầu đo", giữ đạt ' + hold + ' giây.']
        : stepsBow('La, nốt ' + n, { bpm: 60, cpb, hold }),
      tips: tips3[cpb],
      mistakes: cpb === 1 ? ['Lăn cả về phía ngựa đàn → app báo "Trên nốt".'] : ['Cung bị nhấn theo nhịp lăn, tiếng phập phồng.', 'Ngón cái bóp lại khi tăng tốc.'],
      anim: 'arm',
      yt: id === 36 ? yt('Vibrato theo metronome 4 lần mỗi phách', 'violin vibrato metronome 4 per beat')
        : yt('Vibrato theo metronome cho người mới', 'violin vibrato metronome exercise beginner'),
    });
  });

  // ───────────── Vòng 4: Cung dài & đổi cung (L37–50) ─────────────
  const v4 = [
    // id, string, finger, bpm, cpb, width, reg, hold, title, step1, tip, mistake
    [37, 'A', 2, 60, 4, [25, 60], 70, 5, 'Rung qua đổi cung', 'Kéo cung xuống 4 phách, đổi cung lên 4 phách; vibrato không dừng lúc đổi.', 'Đổi cung bằng ngón tay phải mềm, tay trái không biết cung đổi.', 'Vibrato khựng lại đúng lúc đổi cung.'],
    [38, 'A', 3, 60, 4, [25, 60], 70, 5, 'Đổi cung, ngón 3', 'Như L37 với ngón 3 (nốt Rê).', 'Nghe chỗ đổi cung: không có lỗ hổng.', 'Tay trái gồng theo tay phải.'],
    [39, 'A', 1, 60, 4, [22, 60], 70, 5, 'Đổi cung, ngón 1', 'Như L37 với ngón 1 (nốt Si).', 'Giữ khe ngón cái–ngón trỏ mở.', 'Gốc ngón trỏ kẹp cần đàn khi đổi cung.'],
    [40, 'A', 4, 60, 4, [20, 55], 68, 5, 'Đổi cung, ngón 4', 'Như L37 với ngón 4 (nốt Mi).', 'Khuỷu tay xoay vào dưới đàn.', 'Ngón 4 dừng rung khi đổi cung.'],
    [41, 'A', 2, 60, 4, [25, 60], 72, 6, 'Cung dài 4 phách', 'Mỗi chiều cung kéo đủ 4 phách, tiếng đều từ gốc tới ngọn.', 'Chia cung: mỗi phách dùng 1/4 cung.', 'Hết cung trước phách 4, phải vội.'],
    [42, 'A', 2, 60, 4, [25, 60], 72, 8, 'Cung dài 8 phách', 'Mỗi chiều cung 8 phách — cung rất chậm, gần ngựa đàn hơn.', 'Cung chậm cần nhích gần ngựa đàn và đè nhẹ hơn.', 'Tiếng khàn vì cung chậm mà đè mạnh.'],
    [43, 'D', 2, 60, 4, [25, 60], 70, 5, 'Dây Rê, ngón 2', 'Ngón 2 dây Rê (nốt Fa thăng), cung dài 4 phách.', 'Dây Rê nặng hơn: khuỷu tay phải nâng lên chút.', 'Chạm sang dây La.'],
    [44, 'D', 3, 60, 4, [25, 60], 70, 5, 'Dây Rê, ngón 3', 'Ngón 3 dây Rê (nốt Sol).', 'Đầu ngón đứng giữa dây, không đè dây bên cạnh.', 'Ngón 3 lấn dây La làm tiếng rè.'],
    [45, 'D', 1, 60, 4, [22, 60], 70, 5, 'Dây Rê, ngón 1 và 4', 'Ngón 1 (Mi) rồi ngón 4 (La) trên dây Rê, đo từng ngón.', 'Ngón 4 dây Rê so tai với dây La buông.', 'Ngón 4 lệch cao độ so với dây La buông.'],
    [46, 'A', 2, 66, 4, [25, 55], 73, 6, 'Tăng lên 4,4 Hz', 'Metronome 66, 4 lần mỗi phách trên dây La.', 'Thu biên độ nhỏ lại một chút khi nhanh hơn.', 'Nhanh lên nhưng biên độ to → mất đều.'],
    [47, 'D', 2, 66, 4, [25, 55], 73, 6, '4,4 Hz trên dây Rê', 'Metronome 66, 4 lần mỗi phách trên dây Rê.', 'Giữ lực cung ổn định.', 'Dây Rê bị lẫn tiếng dây Sol.'],
    [48, 'A', 2, 66, 4, [18, 45], 73, 6, 'Rung khi đàn nhỏ', 'Cung nhẹ, xa ngựa đàn (piano); vibrato hẹp hơn.', 'Tiếng nhỏ thì vibrato cũng nhỏ lại.', 'Đàn nhỏ mà vibrato vẫn rộng → nghe lắc lư.'],
    [49, 'A', 2, 66, 4, [28, 60], 73, 6, 'Rung khi đàn to', 'Cung gần ngựa đàn, đè chắc (forte); vibrato rộng hơn.', 'Tiếng to cần vibrato rộng để không bị khô.', 'Gồng tay trái khi tay phải đè mạnh.'],
    [50, 'A', 2, 66, 4, [22, 55], 75, 8, 'Kiểm tra vòng 4', 'Cung dài 4 phách, đổi cung 2 lần, 4 lần mỗi phách ở nhịp 66.', 'Thở ra lúc đổi cung giúp tay thả lỏng.', 'Vibrato dừng lúc đổi cung.'],
  ];
  v4.forEach(([id, s, f, bpm, cpb, width, reg, hold, title, step1, tip, mistake]) => {
    meas(id, 4, {
      title, goal: 'Giữ vibrato ' + ((bpm / 60) * cpb).toFixed(1).replace('.', ',') + ' Hz liên tục khi cung thay đổi.',
      bpm, cpb, string: s, finger: f, width, reg, hold,
      steps: [step1, 'Metronome ' + bpm + ', ' + cpb + ' lần lăn mỗi phách.', 'Mắt nhìn đồ thị: sóng nằm trong dải mục tiêu cả lúc đổi cung.', 'Giữ đạt ' + hold + ' giây liên tục.'],
      tips: [tip, 'Nếu trượt nhiều, giảm metronome 6 nhịp, tập 2 phút rồi quay lại.'],
      mistakes: [mistake],
      anim: 'arm',
      yt: id <= 40 ? yt('Giữ vibrato khi đổi cung', 'violin continuous vibrato bow change')
        : id <= 45 ? yt('Vibrato với cung dài', 'violin vibrato long bows exercise')
          : yt('Vibrato và sắc thái to nhỏ', 'violin vibrato dynamics piano forte'),
    });
  });

  // ───────────── Vòng 5: Tốc độ & độ rộng (L51–64) ─────────────
  const v5 = [
    // id, finger, bpm, cpb, width, reg, hold, title, goal, tip, rateOverride
    [51, 2, 75, 4, [22, 50], 75, 6, '5 Hz, ngón 2', 'Lên 5 Hz — tốc độ vibrato chậm của người chơi thật.', 'Cổ tay mềm, ngón đi theo; đừng ép bằng ngón.'],
    [52, 3, 75, 4, [22, 50], 75, 6, '5 Hz, ngón 3', 'Ngón 3 ở 5 Hz.', 'Ngón 4 thả lỏng phía trên dây.'],
    [53, 1, 75, 4, [20, 50], 75, 6, '5 Hz, ngón 1 và 4', 'Hai ngón khó ở 5 Hz, đo từng ngón.', 'Ngón 4 có thể hẹp hơn 1 chút, vẫn trong dải.'],
    [54, 2, 66, 5, [20, 50], 76, 6, '5,5 Hz', '5 lần mỗi phách ở nhịp 66.', 'Đếm 5 khó — nghe đồ thị thay vì đếm.'],
    [55, 2, 90, 4, [20, 45], 76, 6, '6 Hz, ngón 2', 'Tốc độ vibrato phổ biến của nghệ sĩ.', 'Nhanh hơn = biên độ nhỏ hơn, không phải lực mạnh hơn.'],
    [56, 3, 90, 4, [20, 45], 76, 6, '6 Hz, ngón 3 và 1', 'Mở rộng 6 Hz sang ngón 3 và 1.', 'Nếu tay mỏi sau 1 phút: đang gồng.'],
    [57, 2, 66, 5, [12, 28], 76, 6, 'Rung hẹp ở 5,5 Hz', 'Vibrato hẹp, kín — cho đoạn nhạc nhẹ.', 'Chuyển động đến nhiều hơn từ khớp đầu ngón.', 'finger'],
    [58, 2, 90, 4, [12, 28], 76, 6, 'Rung hẹp ở 6 Hz', 'Hẹp và nhanh — vibrato sáng.', 'Giữ đều quan trọng hơn hẹp tuyệt đối.', 'finger'],
    [59, 2, 75, 4, [38, 65], 76, 6, 'Rung rộng ở 5 Hz', 'Vibrato rộng, ấm — cho nốt dài cao trào.', 'Rộng nhưng vẫn quay về đúng nốt ở đỉnh.'],
    [60, 2, 66, 5, [38, 65], 76, 6, 'Rung rộng ở 5,5 Hz', 'Rộng ở tốc độ vừa.', 'Rộng hơn cần cánh tay tham gia nhiều hơn.'],
    [61, 2, 75, 4, [18, 55], 72, 5, 'Chậm dần thành nhanh', 'Trong một nốt: bắt đầu 3 Hz, tăng dần tới 6 Hz; app chấm đoạn cuối.', 'Tăng tốc mượt như xe vào số, không nhảy cóc.', null, [5.0, 6.6]],
    [62, 2, 75, 4, [14, 40], 74, 5, 'Rộng dần thành hẹp', 'Một nốt: bắt đầu rộng, thu hẹp dần; app chấm đoạn cuối.', 'Tốc độ giữ nguyên khi thu hẹp.', null, [4.6, 5.6]],
    [63, 2, 80, 4, [18, 48], 78, 6, 'Bỏ metronome', 'Tốc độ tự nhiên của bạn trong khoảng 5,5–6,5 Hz, không cần metronome.', 'Tắt metronome, để tai và đồ thị dẫn đường.', null, [5.5, 6.5]],
    [64, 2, 80, 4, [20, 45], 80, 8, 'Kiểm tra vòng 5', '5,5–6,5 Hz, độ rộng 20–45 cents, đều ≥ 80.', 'Thả lỏng trước khi bấm đo: lắc tay 5 giây.', null, [5.5, 6.5]],
  ];
  v5.forEach(([id, f, bpm, cpb, width, reg, hold, title, goal, tip, animType, rate]) => {
    meas(id, 5, {
      title, goal, bpm, cpb, string: 'A', finger: f, width, reg, hold, rate: rate || undefined,
      steps: [rate && id !== 61 && id !== 62 ? 'Dây La, ngón ' + f + ', cung dài 4 phách.' : 'Dây La, ngón ' + f + ', metronome ' + bpm + ', ' + cpb + ' lần mỗi phách.',
        id === 61 ? 'Mỗi nốt 8 phách: 2 phách đầu chậm, tăng dần, 4 phách cuối nhanh.' : id === 62 ? 'Mỗi nốt 8 phách: rộng ở đầu, hẹp dần về cuối.' : 'Nhìn đồ thị: sóng phải lấp đầy dải mục tiêu nhưng không tràn ra.',
        'Giữ đạt ' + hold + ' giây liên tục.'],
      tips: [tip, 'Đồ thị lệch khỏi dải ở đâu thì sửa đúng chỗ đó: tràn dưới = quá rộng, không tới vạch nét đứt = quá hẹp.'],
      mistakes: width[1] <= 30 ? ['Hẹp quá thành run rẩy, mất đều.'] : width[0] >= 38 ? ['Rộng quá vượt lên trên nốt.'] : ['Nhanh lên thì gồng, độ đều tụt.'],
      anim: animType || 'arm',
      yt: width[1] <= 30 ? yt('Vibrato hẹp và nhanh', 'violin narrow fast vibrato exercise')
        : width[0] >= 38 ? yt('Vibrato rộng và ấm', 'violin wide vibrato warm sound')
          : yt('Tăng tốc độ vibrato', 'violin vibrato speed exercise metronome'),
    });
  });

  // ───────────── Vòng 6: Liên tục qua nốt (L65–78) ─────────────
  const v6 = [
    // id, string, finger(cuối), bpm, title, step1, tip
    [65, 'A', 2, 66, 'Ngón 1 sang 2', 'Một cung: Si (ngón 1) 2 phách → Đô thăng (ngón 2) 2 phách, rung liên tục.', 'Ngón 2 đặt xuống khi tay vẫn đang rung.'],
    [66, 'A', 3, 66, 'Ngón 2 sang 3', 'Đô thăng → Rê trong một cung, không dừng rung.', 'Rung "chuyền" từ ngón này sang ngón kia như chuyền bóng.'],
    [67, 'A', 4, 66, 'Ngón 3 sang 4', 'Rê → Mi trong một cung.', 'Ngón 4 khởi động rung ngay khi chạm dây.'],
    [68, 'A', 3, 66, 'Ba nốt 1-2-3', 'Si – Đô thăng – Rê, mỗi nốt 2 phách, một cung.', 'Khoảng trống giữa nốt là chỗ vibrato hay "chết".'],
    [69, 'A', 4, 66, 'Bốn nốt đi lên', 'Si – Đô thăng – Rê – Mi, mỗi nốt 2 phách.', 'Nghĩ về một dòng chảy, không phải 4 nốt rời.'],
    [70, 'A', 1, 66, 'Bốn nốt đi xuống', 'Mi – Rê – Đô thăng – Si, mỗi nốt 2 phách.', 'Đi xuống: nhấc ngón trên khi ngón dưới đã rung.'],
    [71, 'D', 4, 66, 'Nửa gam Rê trưởng', 'Rê – Mi – Fa thăng – Sol – La trên dây Rê, mỗi nốt 2 phách.', 'Dây buông Rê không rung được: bắt đầu rung từ Mi.'],
    [72, 'A', 2, 66, 'Đổi dây Rê sang La', 'Sol (dây Rê, ngón 3) → Đô thăng (dây La, ngón 2), rung liên tục qua chỗ đổi dây.', 'Khuỷu tay phải đổi góc cung sớm, tay trái giữ nhịp rung.'],
    [73, 'D', 3, 66, 'Đổi dây La sang Rê', 'Đô thăng (dây La) → Sol (dây Rê).', 'Đổi dây bằng khuỷu tay phải, không phải cổ tay.'],
    [74, 'A', 2, 72, 'Nốt 2 phách ở nhịp 72', 'Gam La trưởng trên dây La, mỗi nốt 2 phách ở nhịp 72.', 'Nốt ngắn hơn nhưng vẫn đủ 4–5 chu kỳ rung.'],
    [75, 'A', 2, 72, 'Nốt 1 phách', 'Gam La trưởng, mỗi nốt 1 phách ở nhịp 72.', 'Bắt đầu rung NGAY khi đặt ngón, không đợi.'],
    [76, 'D', 4, 66, 'Ngón 4 thay dây buông', 'La bằng ngón 4 dây Rê thay cho La buông, rung được.', 'Ngón 4 thay dây buông giúp câu nhạc liền mạch.'],
    [77, 'A', 2, 66, 'Đoạn nhạc chậm 8 nhịp', 'Chọn một giai điệu chậm quen thuộc (ví dụ "Ode to Joy"), chơi 8 ô nhịp, rung mọi nốt dài.', 'App chấm các nốt dài; nốt ngắn không cần rung.'],
    [78, 'A', 2, 66, 'Kiểm tra vòng 6', 'Gam La trưởng lên – xuống, mỗi nốt 2 phách, rung liên tục.', 'Thở chậm khi bắt đầu gam.'],
  ];
  v6.forEach(([id, s, f, bpm, title, step1, tip]) => {
    const hold = id === 78 ? 8 : 6;
    meas(id, 6, {
      title, goal: 'Vibrato không ngắt khi chuyển nốt hoặc chuyển dây.',
      bpm, cpb: bpm === 72 ? 4 : 5, string: s, finger: f,
      rate: [4.8, 6.6], width: [18, 50], reg: id === 78 ? 78 : id >= 74 ? 74 : 72, hold,
      steps: [step1, 'Metronome ' + bpm + '.', 'App chấm trên nốt đang ngân; lúc đổi nốt có 0,6 giây ân hạn.', 'Giữ đạt ' + hold + ' giây liên tục.'],
      tips: [tip, 'Nếu điểm tụt ở chỗ đổi nốt: tập riêng 2 nốt đó 1 phút.'],
      mistakes: ['Dừng rung một chút trước mỗi nốt mới.', 'Rung chỉ bắt đầu sau khi nốt đã kêu được nửa phách.'],
      anim: 'shift',
      yt: id <= 71 ? yt('Vibrato liên tục khi đổi ngón', 'violin continuous vibrato finger changes')
        : id <= 73 ? yt('Vibrato khi đổi dây', 'violin vibrato string crossing')
          : yt('Vibrato liên tục trong gam', 'violin continuous vibrato scale exercise'),
    });
  });

  // ───────────── Vòng 7: Dây Sol/Mi & thế cao (L79–90) ─────────────
  const v7 = [
    // id, string, finger, note override [name,midi], width, reg, hold, title, step1, tip, anim
    [79, 'G', 2, null, [20, 50], 76, 6, 'Dây Sol, ngón 2', 'Ngón 2 dây Sol (nốt Si), cung dài.', 'Dây Sol cần cung nặng hơn và khuỷu tay trái xoay vào nhiều hơn.'],
    [80, 'G', 3, null, [20, 50], 76, 6, 'Dây Sol, ngón 1–3–4', 'Lần lượt ngón 1, 3, 4 trên dây Sol, đo từng ngón.', 'Ngón 4 dây Sol là khó nhất: cho phép chậm hơn.'],
    [81, 'E', 2, null, [14, 40], 76, 6, 'Dây Mi, ngón 2', 'Ngón 2 dây Mi (nốt Sol thăng). Dây Mi dễ rít: cung xa ngựa đàn chút.', 'Dây Mi nghe rõ mọi lệch: biên độ nhỏ hơn dây khác.'],
    [82, 'E', 3, null, [14, 40], 76, 6, 'Dây Mi, ngón 1–3–4', 'Lần lượt ngón 1, 3, 4 trên dây Mi.', 'Vibrato nhỏ, nhanh hợp với dây Mi.'],
    [83, 'A', 2, ['E5', 76], [16, 42], 78, 6, 'Thế 3 dây La', 'Lên thế 3, ngón 2 dây La (nốt Mi). Gốc bàn tay chạm nhẹ vai đàn.', 'Ở thế 3 dùng thêm cổ tay sẽ dễ hơn.', 'wrist'],
    [84, 'D', 2, ['A4', 69], [16, 42], 78, 6, 'Thế 3 dây Rê', 'Thế 3, ngón 2 dây Rê (nốt La). So với dây La buông.', 'Nghe cộng hưởng với dây La buông khi đúng nốt.', 'wrist'],
    [85, 'E', 2, ['B5', 83], [14, 38], 78, 6, 'Thế 3 dây Mi', 'Thế 3, ngón 2 dây Mi (nốt Si).', 'Cung nhẹ, gần phím hơn để tránh rít.', 'wrist'],
    [86, 'A', 1, ['F#5', 78], [14, 38], 78, 6, 'Thế 5 dây La', 'Thế 5, ngón 1 dây La (nốt Fa thăng). Ngón cái trượt xuống dưới cần.', 'Dây ngắn hơn: cùng chuyển động cho cents lớn hơn, nên thu nhỏ biên độ.', 'wrist'],
    [87, 'E', 1, ['C#6', 85], [12, 36], 78, 6, 'Thế 5 dây Mi', 'Thế 5, ngón 1 dây Mi (nốt Đô thăng).', 'Cổ tay dẫn chuyển động, ngón rất mềm.', 'wrist'],
    [88, 'A', 2, ['E5', 76], [16, 45], 76, 6, 'Chuyển thế 1 → 3 giữ rung', 'Đô thăng (thế 1) trượt lên Mi (thế 3) bằng ngón 2, rung trước và sau khi chuyển.', 'Rung lại ngay khi tới nơi, không đợi ổn định.', 'shift'],
    [89, 'A', 1, ['F#5', 78], [14, 40], 76, 6, 'Chuyển thế 3 → 5', 'Rê (thế 3, ngón 1) trượt lên Fa thăng (thế 5).', 'Ngón cái đi trước một chút khi chuyển thế lên.', 'shift'],
    [90, 'G', 2, ['E4', 64], [16, 45], 80, 8, 'Kiểm tra vòng 7', 'Thế 3 dây Sol (nốt Mi) rồi thế 3 dây Mi (nốt Si), đo từng nốt.', 'Mỗi dây có "tính cách": Sol rộng ấm, Mi hẹp sáng.', 'wrist'],
  ];
  v7.forEach(([id, s, f, note, width, reg, hold, title, step1, tip, animType]) => {
    meas(id, 7, {
      title, goal: 'Vibrato ổn định trên dây thấp, dây cao và các thế cao.',
      bpm: 80, cpb: 4, rate: [5.0, 6.6], string: s, finger: f, note: note || undefined, width, reg, hold,
      steps: [step1, 'Rung tốc độ tự nhiên 5–6,5 Hz, không cần metronome.', 'Giữ đạt ' + hold + ' giây liên tục.'],
      tips: [tip, 'Nếu điểm "Tâm cao độ" báo "Thấp cả nốt": ngón đặt hơi thấp, chỉnh nốt trước khi rung.'],
      mistakes: s === 'E' ? ['Rung rộng như dây Sol làm dây Mi nghe chua.'] : s === 'G' ? ['Khuỷu tay trái không xoay vào, ngón với không tới.'] : ['Ép gốc bàn tay vào thân đàn ở thế cao.'],
      anim: animType || 'arm',
      yt: s === 'G' ? yt('Vibrato trên dây Sol', 'violin vibrato G string tips')
        : s === 'E' && id < 85 ? yt('Vibrato trên dây Mi', 'violin vibrato E string tips')
          : id >= 88 && id <= 89 ? yt('Giữ vibrato khi chuyển thế', 'violin vibrato while shifting')
            : yt('Vibrato ở thế 3 và thế 5', 'violin vibrato third position fifth position'),
    });
  });

  // ───────────── Vòng 8: Biểu cảm (L91–100) ─────────────
  const v8 = [
    // id, rate, width, reg, hold, title, goal, step1, tip, anim
    [91, [5.0, 6.6], [18, 48], 78, 4, 'Rung trễ', 'Nốt thẳng 1 phách rồi mới rung — tạo cảm giác "nở" ra.', 'Mỗi nốt 4 phách: phách 1 không rung, phách 2–4 rung đều. App chấm đoạn rung.', 'Chuyển từ thẳng sang rung phải êm, không giật.', 'swell'],
    [92, [5.0, 6.6], [18, 48], 78, 4, 'Rung tắt dần', 'Vibrato nhỏ dần ở cuối nốt dài — kết câu mềm mại.', 'Nốt 6 phách: rung đều 4 phách đầu, 2 phách cuối nhỏ dần rồi tắt. App chấm đoạn đầu.', 'Cung cũng nhẹ dần cùng vibrato.', 'swell'],
    [93, [5.0, 6.6], [25, 60], 78, 6, 'Rung theo crescendo', 'To dần thì vibrato rộng dần.', 'Nốt 8 phách: piano → forte, vibrato từ hẹp tới rộng.', 'Cung và vibrato cùng "thở ra".', 'swell'],
    [94, [5.0, 6.6], [14, 45], 78, 6, 'Rung theo diminuendo', 'Nhỏ dần thì vibrato hẹp dần.', 'Nốt 8 phách: forte → piano, vibrato từ rộng tới hẹp.', 'Tốc độ giữ nguyên, chỉ biên độ đổi.', 'swell'],
    [95, [6.0, 7.2], [12, 30], 80, 6, 'Vibrato sáng', 'Nhanh, hẹp — màu sáng, hồi hộp.', 'Dây Mi hoặc La, rung 6–7 Hz, biên độ nhỏ.', 'Chuyển động từ khớp đầu ngón và cổ tay, nhẹ như rung lá.', 'finger'],
    [96, [4.5, 5.6], [35, 62], 80, 6, 'Vibrato ấm', 'Chậm hơn, rộng — màu ấm, trầm lắng.', 'Dây Rê hoặc Sol, rung 4,5–5,5 Hz, biên độ rộng.', 'Rộng nhưng đỉnh sóng vẫn chạm đúng nốt.', 'arm'],
    [97, [5.0, 6.6], [18, 50], 80, 8, 'Legato không đứt', 'Một câu legato 4 nốt mỗi cung, vibrato không gãy.', 'Chọn 4 nốt liền bậc, 2 phách mỗi nốt, legato một cung.', 'Nghe như hát một hơi.', 'shift'],
    [98, [5.0, 6.6], [18, 50], 82, 8, 'Áp dụng: đoạn chậm', 'Đưa vibrato vào một bản chậm bạn thích (ví dụ Air của Bach).', 'Chơi 8–16 ô nhịp, rung mọi nốt từ 1 phách trở lên.', 'Chọn nốt cao trào để rung rộng nhất.', 'swell'],
    [99, [5.2, 6.8], [16, 45], 82, 8, 'Áp dụng: đoạn vừa', 'Vibrato trong tiết tấu vừa, nốt ngắn hơn.', 'Chọn đoạn nhạc tiết tấu vừa, rung nốt từ 1 phách.', 'Nốt ngắn: rung ngay từ đầu nốt.', 'shift'],
    [100, [5.0, 7.0], [20, 50], 85, 12, 'Tốt nghiệp', 'Vibrato của riêng bạn: đều, đúng hướng, có màu sắc.', 'Chơi một nốt dài 12 giây với vibrato đẹp nhất bạn có, rồi chơi lại bản nhạc ở L98.', 'Quay video gửi giáo viên hoặc người chơi giỏi để nghe nhận xét.', 'swell'],
  ];
  v8.forEach(([id, rate, width, reg, hold, title, goal, step1, tip, animType]) => {
    const s = id === 96 ? 'D' : id === 95 ? 'E' : 'A';
    meas(id, 8, {
      title, goal, bpm: 72, cpb: 5, rate, width, reg, hold, string: s, finger: 2,
      steps: [step1, 'Không bắt buộc metronome.', 'Giữ đạt ' + hold + ' giây liên tục.'],
      tips: [tip, 'Vibrato đẹp là vibrato phục vụ câu nhạc, không phải nhanh nhất.'],
      mistakes: id >= 98 ? ['Rung đều một kiểu cho mọi nốt — nghe máy móc.'] : ['Đổi màu vibrato đột ngột thay vì chuyển dần.'],
      anim: animType,
      yt: id <= 94 ? yt('Vibrato biểu cảm theo sắc thái', 'violin expressive vibrato dynamics')
        : id <= 96 ? yt('Các màu sắc vibrato', 'violin vibrato colors speed width')
          : yt('Áp dụng vibrato vào bản nhạc', 'violin vibrato in repertoire tips'),
    });
  });

  out.sort((a, b) => a.id - b.id);
  root.LEVELS = out;
})(typeof window !== 'undefined' ? window : globalThis);
