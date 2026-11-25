# Vibrato Pro: ghi chú dự án (đọc trước khi sửa)

App tập vibrato violin/viola của anh Hyden. Gồm 100 level, giao diện tiếng Việt, đo bằng micro, có camera nhìn tay (thử nghiệm) và HLV AI (Claude).
Ý tưởng lấy từ violaviolinlesson.com Premium. Cách làm với anh: Opus điều phối và viết lõi, Sonnet làm UI. Mọi việc tạo hay sửa file đều báo trước và chờ anh đồng ý.

## Đang chạy ở đâu
- Bản thật: https://vibrato.hydennguyen.com (bí danh của https://vibrato-ctj.pages.dev)
- Cloudflare Pages, project **vibrato**, nằm ở tài khoản **Hydennguyen86@gmail.com** (account id `64c47621040ef6c544e797165e90eefc`).
  - Secrets: `ANTHROPIC_API_KEY`, `COACH_PASSCODE`. Anh tự nhập. Không bao giờ ghi giá trị của chúng vào file.
  - Biến tuỳ chọn: `CLAUDE_MODEL` (mặc định `claude-haiku-5-5`), `ANTHROPIC_BASE_URL` (ghi đè đường relay).
- Tên miền hydennguyen.com nằm ở **tài khoản Cloudflare khác**, là Hydennguyen@gmail.com (không có số 86), account `4c7e69e1f3945f2f8bb88d83fe5e2f0e`.
  - Bản ghi DNS: `vibrato` CNAME → `vibrato-ctj.pages.dev`, để chế độ DNS only.
  - Không đụng tới 2 bản ghi của Substack (`www` và `@`).
- Worker **vibrato-coach** (cùng tài khoản 86), chạy ở https://vibrato-coach.hydennguyen86.workers.dev
  - Placement: Region → AWS us-east-1.
  - Lý do: Cloudflare phục vụ người dùng ở VN từ HKG, mà Anthropic chặn Hồng Kông (403). Vì vậy `_worker.js` gọi Claude qua relay này (`DEFAULT_BASE` có token trong đường dẫn).
  - Relay chỉ chuyển tiếp `/v1/messages` cùng header `x-api-key`, không lưu key. Gọi `GET /<token>/where` để xem nơi gọi ra ngoài (phải ra `IAD`).
  - Mã nguồn đọc được ở `deploy/coach-relay/worker.js`. Bản đang chạy là bản rút gọn một dòng, gõ tay vào editor của dashboard.
- Máy chủ Mac, tuỳ chọn: `server/server.py` dùng Ollama/Claude/mock, chạy qua Tailscale. Gói `pkg/` là bản v2, cũ hơn v4.

## Cấu trúc mã
- `SPEC.md`: hợp đồng chi tiết, Phần 1–4 (§10 Cloudflare + passcode, §11–12 chế độ qua level v4).
- `src/levels.js`: `STAGES` (8 vòng) và `LEVELS` (100 level).
  - L1–22 là mode `self` (tự đánh dấu), L23–100 là mode `measure`.
  - Tiêu chí của mỗi level: rate, regularityMin, width, center, holdSec. Kèm theo demo, anim, youtube {title, query}.
- `src/engine.js`: `window.VE` gồm settings, store, server, coach, createSession, metronome, calibrate, `PASS_MODES`, `_core`.
  - Đo cao độ bằng YIN (W=1024, setInterval 12 ms). Phân tích vibrato: resample 100 Hz, detrend bậc 2, cực trị có trễ.
  - Các chỉ số: rate = 1/chu kỳ TB; width = trung vị đỉnh–đáy (cents); regularity = 100·(1−hypot(CV chu kỳ, CV biên độ)); center (dưới/trên/phẳng).
  - Tiến độ v4: không khoá level. `passMode` có `fast` (đạt 1 lần, mặc định), `standard` (3 lần), `thorough` (3 lần / 2 ngày).
  - Qua level N thì `cascade` đánh dấu mọi level < N là đã qua. `status()` trả về `passed | current | open`.
  - Lưu bằng localStorage, ngay trên máy người dùng.
- `src/hand.js`: `VE.hand` dùng MediaPipe HandLandmarker (tasks-vision 1.2.2).
  - Lock-in với cửa sổ Hann, góc DIP có dấu, sàn nhiễu SNR≥3.
  - Model tải từ `/vendor/mediapipe/hand_landmarker.task`. Trên Cloudflare, `_worker.js` proxy file này từ Google.
- `src/ui.js`, `src/ui.css`, `src/index.template.html`: UI theo mockup GPT.
  - Router: `#/home`, `#/level/:id`, `#/measure/:id`, `#/result/:id`, `#/progress`, `#/calibrate`, `#/settings`.
  - Cài đặt có ô "Mã HLV AI" và nút **Thử HLV AI** (`#coachTest`). Khi lỗi, app hiện dòng "Chi tiết: …".
- `deploy/_worker.js`: Worker kiểu advanced mode của Pages.
  - Các route: `/api/health`, `/api/coach` (kiểm passcode ở header `X-Vibrato-Pass`, giới hạn 20 lần/phút/IP), `/vendor/mediapipe/hand_landmarker.task` (proxy); còn lại đi `env.ASSETS`.
  - **Chỉ được có `export default`.** Thêm named export là Cloudflare chết.
  - Gửi Claude `max_tokens: 2000`. **Không gửi `temperature`**: haiku-5-5 báo deprecated.
- `vendor/mediapipe/`: bundle + wasm lấy từ npm. File `hand_landmarker.task` ở đây chỉ dùng để thử trên máy local.

## Lệnh thường dùng
```bash
python3 build.py              # → dist/index.html (gộp CSS + JS vào 1 file)
python3 build_cloudflare.py   # → cloudflare/vibrato/ (index.html, _worker.js, vendor/ — không kèm model)
cd cloudflare/vibrato && rm -f ../vibrato-pages-upload.zip && zip -qr ../vibrato-pages-upload.zip .   # zip: file nằm ở gốc
for t in tests/*.test.mjs; do node $t | tail -1; done; python3 tests/server_test.py | tail -1
node -e "import('./cloudflare/vibrato/_worker.js').then(m=>console.log(Object.keys(m)))"   # phải in ['default']
```
- Mở thử: thêm `?demo=1` vào URL để dùng tín hiệu và bàn tay giả lập.
- Thử Worker trên máy: `npx wrangler pages dev cloudflare/vibrato --port 8991 --binding ANTHROPIC_API_KEY=… --binding COACH_PASSCODE=… --binding ANTHROPIC_BASE_URL=http://127.0.0.1:<fake>`

## Phần Độ mượt (legato)
- Phần thứ hai của app: 50 level (M1–M50, 6 vòng) tập đổi vĩ liền tiếng, đổi nốt legato và **chuyển dây mượt** (trọng tâm, kể cả khi đang vibrato). Hợp đồng đầy đủ: `docs/SPEC-LEGATO.md`.
- File: `src/legato-engine.js` (`VE.legato`: ngưỡng, kế hoạch lượt tập, bộ chấm, tiến độ, phiên tập, HLV AI), `src/legato-levels.js` (khung 50 level), `src/legato-content.js` (chữ hướng dẫn), `src/legato-videos.js` (video tham khảo), `src/legato-list.js/.css` (tab, thẻ ở Lộ trình, danh sách, chi tiết level), `src/legato-take.js/.css` (màn Lượt tập và Phiếu chấm).
- Route mới: `#/legato`, `#/lg-level/:id`, `#/lg-take/:id` (không cuộn, ẩn thanh tab), `#/lg-result/:id`. Tab "Độ mượt" nằm sau tab "Đo", nên thanh tab có 5 mục.
- Tiến độ lưu khoá riêng `vibratoPro.legato.v1`, dùng chung `passMode` với phần vibrato. Qua M-N thì mọi M trước N tính là đã qua; không cascade sang 100 level vibrato và ngược lại. "Đặt lại tiến độ" xoá cả hai.
- Ngưỡng nằm ở `VE.legato.TH` và `VE.legato.TIERS` (đầu `legato-engine.js`) và **CHƯA kiểm trên đàn thật**. Phiếu chấm có "Số đo thô" để chép gửi lại chỉnh ngưỡng.
- Micro không đo được vùng vĩ (tự kiểm) và đổi vĩ càng mượt càng khó nghe ra; app chỉ đo chỗ sụt tiếng quanh phách. Đừng viết chữ hứa app kiểm những thứ đó.
- Thử không cần đàn: `?demo=1&pattern=<smooth|bowgap|crossgap|crossnoise|wrongnote|vibfreeze|uneven|late|silent>&speed=<1..16>#/lg-take/9`.
- Điểm mở rộng của `ui.js`: file màn hình nạp trước `ui.js` và đăng ký qua `window.VP_EXT` (`registerRoute`, `registerTab`, `registerHomeCard`), tiện ích dùng chung ở `window.VP_UI`. Class mới có tiền tố `lgl-` (list), `lgt-` (take).
- Test mới: `tests/legato-engine.test.mjs`, `tests/legato-store.test.mjs`, `tests/legato-levels.test.mjs` (`--quick` chạy vài giây, đầy đủ khoảng 1 phút), `tests/hold.test.mjs`.
- Luật đổi cung mới của phần vibrato (SPEC.md §13, `VE._core.HOLD`): kiểm bằng `tests/hold.test.mjs`.

## Cách đưa bản mới lên
1. Dashboard tài khoản 86 → Workers & Pages → vibrato → **Create deployment** → Production.
2. Tải lên `vibrato-pages-upload.zip` (khoảng 8,5 MB; Chrome extension giới hạn 10 MB).
3. Bấm **Save and deploy**. Mỗi lần như vậy tốn 1/500 lượt build trong tháng.
4. Đổi secret thì phải đưa app lên lại mới có hiệu lực.
5. Kiểm tra sau khi lên: `/api/health`, rồi bấm nút Thử HLV AI. Kết quả đúng: "✓ HLV AI chạy tốt · claude · claude-haiku-5-5".

## Lưu ý đã gặp
- Bắt buộc sau mỗi lần build (không chỉ là lưu ý): kiểm tra `_worker.js` chỉ có `export default` bằng lệnh `node -e …` ở phần Lệnh thường dùng. Có named export là Worker sập.
- Lỗi 403 từ Claude là do Worker chạy ở HKG, cách sửa là relay. 400 "temperature deprecated" thì bỏ temperature. Claude trả về rỗng thì tăng max_tokens.
- Level 1 có ý "Không thấy móng tay trắng": nghĩa là ngón cái không bóp mạnh tới mức móng bị trắng.
- Tiếng click metronome là tiếng nhiễu (không có cao độ) để micro không bắt nhầm thành nốt.
