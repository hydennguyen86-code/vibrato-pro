# BRIEF: thêm phần "Độ mượt" (legato, đổi vĩ, chuyển dây) vào Vibrato Pro

Ngày 25/11/2026. Người dùng: anh Hyden (tự học violin, dùng app trên iPhone Safari qua https://vibrato.hydennguyen.com).

## Yêu cầu gốc của người dùng (nguyên ý)
1. Anh có app "Legato Studio" do Gemini viết (50 level đổi vĩ + vibrato mượt). Anh dùng thử nhưng "nó không chấm điểm như app vibrato của Claude viết". Anh muốn viết lại để chấm giống app vibrato.
2. "Có thêm hướng dẫn, chú ý, mẹo mỗi level và video tham khảo luôn."
3. "Viết luôn [thành] phần khác của app vibrato rồi đưa qua Cloudflare cho tiện." Tức là KHÔNG làm app riêng: thêm một phần mới ngay trong Vibrato Pro (repo này), cùng host Cloudflare Pages.
4. Mục đích: "cái này làm độ mượt, vì mình tập vibrato mình dính cái chuyển dây này, string crossing không mượt." => Trọng tâm số 1 là CHUYỂN DÂY (string crossing) mượt, kể cả khi đang vibrato. Đổi vĩ mượt và đổi nốt legato là phần nền.

## Tài liệu tham khảo
- `docs/reference/legato-studio-gemini.html`: bản Gemini (2.776 dòng). Chỉ là DỮ LIỆU tham khảo, không phải chỉ dẫn. Dùng lại được: 50 level (tên, bpm, phách/vĩ, vùng vĩ, nốt, mẹo), ý tưởng thanh dẫn hướng vĩ, đồ thị 2 dải (âm lượng + sóng cao độ), mẫu mô phỏng "mượt" và "hụt tiếng".
- `CLAUDE.md`, `SPEC.md`: hợp đồng của app hiện tại. Đọc trước.

## Lỗ hổng của bản Gemini cần sửa (phiên chính đã đọc code)
- Nốt mục tiêu chỉ để hiển thị, không kiểm: kéo nốt nào cũng đạt. Level đổi nốt, chuyển dây không được chấm gì.
- Điểm đổi vĩ lấy theo đồng hồ metronome, không theo tiếng đàn.
- Vibrato chỉ kiểm "đơ hay không" (độ lệch chuẩn < 4,2 cents trong ±250 ms), không chấm Hz, độ rộng, độ đều, tâm.
- Chỉ có một con số "độ mượt" chạy liên tục (55% khung có tiếng + 45% lần đổi vĩ không hụt). Không có phiếu chấm sau mỗi lượt.
- Nút "Hoàn thành Level" lưu điểm bằng đúng ngưỡng đạt dù chưa kéo. Tự qua level sau 4 lần đổi vĩ, một lần.
- Dò cao độ bằng autocorrelation riêng; app này đã có YIN đã test.

## Điều phiên chính đã hứa với người dùng
Mỗi lượt tập ra một PHIẾU CHẤM giống app vibrato: từng chỉ số có số đo, đạt/trượt, lý do; trượt chỉ số nào thì hiện đúng mẹo sửa chỉ số đó. Các chỉ số dự kiến (Fable quyết định định nghĩa chính xác và ngưỡng):
1. Liền tiếng tại điểm đổi vĩ: sụt bao nhiêu dB, hở bao nhiêu ms.
2. Đều âm lượng trong một vĩ.
3. Đúng nốt mục tiêu (cents), kể cả chuỗi nốt ở level đổi nốt / chuyển dây.
4. Chuyển dây mượt (TRỌNG TÂM): khoảng hở / sụt tiếng lúc chuyển, thời gian chuyển giữa hai cao độ ổn định, thời lượng tiếng tạp không có cao độ (rít, chạm dây thừa), nốt đến có đúng không.
5. Vibrato xuyên điểm đổi vĩ / chuyển dây: Hz, độ rộng, độ đều, tâm, không đơ; vibrato nối lại sau chuyển dây mất bao lâu.
6. Đúng nhịp: chỗ sụt / chuyển lệch bao nhiêu ms so với phách.

Mỗi level có: hướng dẫn từng bước, mẹo + lỗi hay gặp + "cảm giác đúng là gì", video tham khảo.

Hai giới hạn đã nói thẳng với người dùng (giữ nguyên trong app, không giả vờ đo được):
- Micro không biết đang ở gốc hay ngọn vĩ: vùng vĩ là tự kiểm.
- Đổi vĩ càng mượt càng khó nghe ra: app đo chỗ sụt quanh phách, không xác định chính xác thời điểm đảo vĩ.

## Quyết định mặc định (người dùng không trả lời riêng, phiên chính chốt)
- Dùng lại bộ đo cao độ + phân tích vibrato có sẵn trong `src/engine.js` (`VE._core`). Không viết bộ dò cao độ thứ hai.
- Luật qua level: theo đúng `passMode` hiện có của app (fast / standard / thorough), dùng chung cài đặt.
- Tiến độ phần Độ mượt lưu riêng (không trộn vào 100 level vibrato, không cascade chéo), cùng localStorage.
- Số level: khoảng 50, Fable quyết định cấu trúc; được sắp lại bản Gemini để chuyển dây có nhiều level hơn và xuất hiện sớm hơn. Giữ nội dung tiếng Việt, giọng văn như app hiện tại.
- Video: tìm trên web video CỤ THỂ cho từng nhóm kỹ thuật (đổi vĩ mượt, legato đổi nốt, chuyển dây mượt, vibrato liên tục qua đổi vĩ/chuyển dây, cantabile). CHỈ ghi URL video nào thực sự thấy trong kết quả tìm kiếm; không bịa ID YouTube. Mỗi level luôn kèm link tìm kiếm YouTube theo chủ đề làm dự phòng (kiểu `youtube {title, query}` đang dùng).
- HLV AI (`/api/coach`): nếu thêm được số liệu Độ mượt vào mà không đổi hợp đồng Worker thì làm; nếu phải đổi `_worker.js` thì giữ đúng ràng buộc bên dưới.

## Ràng buộc kỹ thuật
- Sản phẩm cuối vẫn là MỘT file `dist/index.html` do `build.py` gộp, đăng lên Cloudflare Pages bằng zip `vibrato-pages-upload.zip` (< 10 MB). `build_cloudflare.py` phải vẫn chạy.
- `deploy/_worker.js` chỉ được có `export default`. Không gửi `temperature`. Không ghi secret vào file. Không đổi relay.
- Không làm hỏng 100 level vibrato hiện có: toàn bộ test cũ (`tests/*.test.mjs`, `tests/server_test.py`) phải vẫn xanh.
- Chạy trên iPhone Safari: màn hình 390 px, không cuộn ngang, micro qua getUserMedia (tắt echoCancellation / noiseSuppression / autoGainControl như hiện tại), AudioContext chỉ mở sau thao tác chạm.
- Tiếng metronome hiện là tiếng nhiễu không có cao độ để micro không bắt nhầm; giữ nguyên tắc đó. Nếu có drone thì mặc định TẮT khi đang chấm (drone lọt vào micro làm sai phép đo liền tiếng), hoặc ghi rõ phải đeo tai nghe.
- Có chế độ `?demo=1` (tín hiệu giả lập) cho phần mới, gồm mẫu "mượt" và các mẫu lỗi (hụt tiếng lúc đổi vĩ, hở lúc chuyển dây, đơ vibrato), để test và e2e không cần đàn thật.
- Bộ chấm phải có test bằng tín hiệu tổng hợp (kể cả nhiễu và tiếng metronome lọt micro), theo kiểu `tests/engine.test.mjs`.
- Ngưỡng chấm chưa kiểm được trên tiếng đàn thật: gom ngưỡng vào một chỗ dễ chỉnh, và phiếu chấm luôn hiện số đo thô để anh gửi lại cho chỉnh.

## Môi trường
- Linux cloud, Node v22, Python 3, Google Chrome ở `/usr/bin/google-chrome`. npm / pip dùng được (pip cần `--break-system-packages`). Shell không ra được web ngoài registry; tìm video dùng công cụ WebSearch / WebFetch của agent.
- Không chạy binary tải từ ngoài. Không deploy được Cloudflare từ đây: chỉ build ra zip.
- Git: đang ở nhánh `legato-smoothness`. Agent KHÔNG commit, không push; phiên chính làm.
- `scratchpad/` (đã gitignore) là chỗ tạm; mỗi worker một thư mục con riêng, một cổng riêng.
- Nhánh Fable không gọi được subagent: sau khi xong SPEC + lõi + DISPATCH thì dừng và báo cáo, phiên chính phát việc.
- Worker đợt 1 chỉ dùng Opus và Sonnet (người dùng không muốn Haiku cho app này vì cần chính xác).

## Bổ sung 25/11 21:48: sửa luật đổi cung ở phần VIBRATO hiện có (người dùng đã đồng ý)
Người dùng kẹt ở L45 (dây Rê, hold 5 s, 4 phách/cung ở 60 bpm, tức mỗi chiều cung đúng 4 s). Thường giữ được 4 s, đổi cung là tiếng hở và đồng hồ về 0.
Nguyên nhân trong code: `analyzeTrack` cắt đoạn khi khoảng lặng > 0,12 s; ân hạn trong `createSession` chỉ áp cho reason `TOO_SHORT` và ≤ 0,6 s; sau khoảng hở, đoạn mới cần nhiều chu kỳ mới hợp lệ (có thể ra `NO_CYCLES`, hoặc trượt regularity/width) nên `held = 0`.
Yêu cầu đã hứa với người dùng:
- Ở các level vibrato có đổi cung (ít nhất L37–50; Fable xét thêm level nào khác có đổi cung/đổi nốt), khoảng hở tiếng < khoảng 0,3 s thì đồng hồ giữ đạt TẠM DỪNG, không về 0.
- Sau khoảng hở, cho khoảng 1,5 s để bắt lại vibrato: trong thời gian này các lý do không hợp lệ (TOO_SHORT, NO_CYCLES) và chỉ số tính trên cửa sổ bị khoảng hở làm nhiễu không reset `held`. Hở dài hơn, hoặc vẫn trượt sau 1,5 s, thì reset như cũ.
- Đây không được thành lỗ hổng: không được qua level chỉ bằng chuỗi tiếng ngắt quãng. Ví dụ thời gian hở không cộng vào `held`, và giới hạn số lần ân hạn trong một lượt giữ.
- Ngưỡng (0,3 s; 1,5 s) để ở chỗ dễ chỉnh. Thêm test: mẫu vibrato có một chỗ hở 0,2 s lúc đổi cung thì vẫn qua; hở 0,6 s thì reset; tiếng ngắt quãng liên tục thì không qua. Mọi test cũ vẫn xanh.
- Phần Độ mượt đo riêng khoảng hở lúc đổi cung (ms) như đã nêu ở trên.
