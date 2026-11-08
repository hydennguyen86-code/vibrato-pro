# Vibrato Pro — SPEC (nguồn sự thật cho mọi agent)

App web một trang tập vibrato violin/viola, 100 level, chạy trên iPhone (Safari) và desktop.
Bản giao cuối: **một file `dist/index.html` tự chứa** (CSS + JS inline, không CDN, không font ngoài, chạy offline).
Người dùng tự host (GitHub Pages / HTTPS) vì micro cần HTTPS.

Giao diện tiếng Việt có dấu. Thiết kế gốc: `design/mockup.png` (8 màn hình iPhone, tông hổ phách/gỗ trên nền tối).

## 1. Cây thư mục và chủ sở hữu

| File | Chủ | Nội dung |
|---|---|---|
| `SPEC.md` | Opus | file này |
| `src/engine.js` | **Opus** | `window.VE`: micro, dò cao độ, phân tích vibrato, chấm, metronome, âm mẫu, lưu tiến độ, hiệu chuẩn |
| `src/levels.js` | **Opus** | `window.STAGES`, `window.LEVELS` (100 level) |
| `src/index.template.html` | **Sonnet** | khung HTML, có 3 placeholder: `/*__CSS__*/`, `//__ENGINE__`, `//__LEVELS__`, `//__UI__` |
| `src/ui.css` | **Sonnet** | toàn bộ style |
| `src/ui.js` | **Sonnet** | router, render 7 màn hình, hoạt hình SVG, đồ thị canvas |
| `build.py` | Opus | ghép thành `dist/index.html` |
| `tests/*` | Opus (engine), Sonnet (ui e2e trong scratchpad) | |

Một file, một chủ. Không sửa file của người khác; cần đổi API thì ghi vào báo cáo.

Thứ tự script trong trang: levels.js → engine.js → ui.js. UI chỉ gọi engine qua API dưới đây.

## 2. Dữ liệu level (`src/levels.js`)

```js
window.STAGES = [ { id:1, name:'Không đàn', range:[1,10], short:'L1–10' }, ... ]  // 8 vòng
// 1 Không đàn (L1–10) · 2 Trên đàn, chưa kéo cung (L11–22) · 3 Metronome 60 + cung (L23–36)
// 4 Cung dài & đổi cung (L37–50) · 5 Tốc độ & độ rộng (L51–64) · 6 Liên tục qua nốt (L65–78)
// 7 Dây G/E & thế cao (L79–90) · 8 Biểu cảm (L91–100)

window.LEVELS = [ {
  id: 23, stage: 3,
  title: 'Giữ rung đều ở 3 Hz',          // hiển thị dưới "Level 23"
  goal: 'một câu mục tiêu',
  mode: 'self' | 'measure',               // self = chưa có tiếng (vòng 1–2): checklist + đếm giờ; measure = đo bằng micro
  bpm: 60, cyclesPerBeat: 3,              // metronome mặc định; tốc độ mục tiêu = bpm/60*cyclesPerBeat
  string: 'A', finger: 2, noteName: 'C#5', // gợi ý dây/ngón/nốt (có thể null ở vòng 1)
  steps: ['…','…'],                       // Cách tập (3–5)
  tips: ['…'],                            // Mẹo (2–3)
  mistakes: ['…'],                        // Lỗi thường gặp (1–3)
  criteria: {                              // chỉ có khi mode='measure'
    rate: [2.8, 3.2],                      // Hz
    regularityMin: 85,                     // %
    width: [20, 50],                       // cents, đỉnh-đến-đáy
    center: true,                          // true = phải rung xuống dưới nốt
    holdSec: 4                             // phải giữ đạt liên tục bấy nhiêu giây thì take tính là ĐẠT
  },
  selfCheck: ['…','…'],                   // chỉ khi mode='self': các ý phải tự xác nhận
  selfSeconds: 60,                         // chỉ khi mode='self': thời gian tập tối thiểu
  demo: { rate: 3, width: 35, midi: 73 },  // cho âm mẫu và hoạt hình
  anim: { type: 'tap'|'polish'|'slide'|'arm'|'wrist'|'finger'|'shift'|'swell', rate: 3, width: 35 },
  youtube: { title: 'Tiêu đề hiển thị', query: 'violin vibrato ...', minutes: 6 } // link = https://www.youtube.com/results?search_query=<encodeURIComponent(query)>
} , ... ]
```

## 3. Engine API (`window.VE`) — Opus

Mọi hàm không ném lỗi đồng bộ, trừ khi ghi rõ. `localStorage` luôn bọc try/catch bên trong engine.

### 3.1 Cài đặt
```js
VE.settings.get() -> { a4: 440|442, instrument: 'violin'|'viola', sensitivity: 0..1 (mặc định 0.7), theme: 'dark'|'light' }
VE.settings.set(partial)          // lưu ngay
```

### 3.2 Phiên đo (màn ĐO)
```js
const s = VE.createSession(level, { demo?: boolean })
// demo=true (hoặc URL có ?demo=1): không dùng micro; engine tự tạo tín hiệu vibrato giả qua đúng pipeline phân tích. Dùng để test UI.
await s.start()                    // xin micro. Lỗi: reject Error với .code = 'INSECURE' | 'DENIED' | 'NO_MIC' | 'UNSUPPORTED'
s.on('frame', f => …)              // ~60 lần/giây
//   f = { t: giây từ lúc start, voiced: bool, hz: number|null, noteName: 'A4'|null,
//         centsFromNote: number|null,   // lệch so với nốt bình quân gần nhất (cho ô "A4 +12 cents")
//         centsFromRef: number|null,    // lệch so với NỐT THAM CHIẾU của vibrato (refNoteName) — dùng làm trục Y đồ thị
//         refNoteName: 'A4'|null, db: number }
s.on('metrics', m => …)            // ~4 lần/giây, tính trên cửa sổ 3 giây gần nhất
//   m = { valid: bool, reason: null|'NO_SIGNAL'|'TOO_SHORT'|'NO_CYCLES',
//         rate: Hz|null, regularity: %|null, width: cents|null,
//         peakOffset: cents|null,       // đỉnh dao động so với nốt tham chiếu
//         center: 'below'|'above'|'flat'|null,   // below = đúng (rung xuống dưới nốt)
//         centerLabel: 'Dưới nốt'|'Trên nốt'|'Thấp cả nốt'|'—',
//         checks: { rate:{value,min,max,ok}, regularity:{value,min,ok}, width:{value,min,max,ok}, center:{value,ok} },
//         allOk: bool, heldSec: number, holdNeeded: number }
s.on('done', r => …)               // tự bắn khi heldSec >= holdNeeded (take ĐẠT), hoặc sau s.stop()
//   r = { pass: bool, metrics: <metrics tốt nhất của take>, durationSec, levelId, gate: <xem 3.4> }
s.stop()                            // dừng micro; bắn 'done' với pass=false nếu chưa đạt (nếu đã bắn rồi thì không bắn lại)
s.off(evt, cb)
```
**Đồ thị (màn ĐO):** trục Y là `centsFromRef`. Nốt tham chiếu ở 0. Vibrato đúng nằm trong **dải mục tiêu** từ `0` xuống `-criteria.width[1]`; vạch nét đứt ở `-criteria.width[0]` = độ rộng tối thiểu. Trục Y hiển thị ±(width[1]+20) cents, tối thiểu ±50.

### 3.3 Metronome & âm mẫu
```js
VE.metronome.start(bpm, onBeat?)   // onBeat(beatIndex) đúng nhịp (lập lịch bằng AudioContext)
VE.metronome.setBpm(bpm); VE.metronome.stop(); VE.metronome.running -> bool
VE.playSample(level) -> Promise    // phát ~4 giây tiếng dây tổng hợp với vibrato đúng level.demo
VE.stopSample()
```

### 3.4 Tiến độ & cửa qua level
Quy tắc qua level: **3 take ĐẠT, rải trên ít nhất 2 ngày khác nhau** (ngày theo giờ máy). Level tiếp theo mở khi level hiện tại qua.
```js
VE.store.recordTake(levelId, { pass, metrics?, durationSec, mode:'measure'|'self' }) -> gate
//   gate = { passCount, dayCount, neededPasses: 3, neededDays: 2, levelPassed: bool, justPassed: bool }
VE.store.gate(levelId) -> gate
VE.store.status(levelId) -> 'passed'|'current'|'locked'
//   'current' trả cho level hiện tại VÀ cho bài "Kiểm tra vòng" (level cuối) của vòng đang học — để thi vượt.
//   Qua bài kiểm tra cuối vòng → mọi level trước trong vòng đó tự tính là đã qua.
VE.store.currentLevel() -> number       // level thấp nhất chưa qua
VE.store.streak() -> number              // số ngày liên tiếp có tập (tính tới hôm nay hoặc hôm qua)
VE.store.logPractice(seconds)            // UI gọi khi rời màn đo/tự tập
VE.store.takes(days) -> [{ ts, levelId, pass, rate, width, regularity, durationSec }]   // mới nhất trước
VE.store.daily(days) -> [{ dayKey:'2026-11-07', label:'T7', rate|null, width|null, minutes }] // cũ→mới, đủ `days` phần tử
VE.store.heat(7) -> [{ dayKey, label, sang, chieu, toi }]  // phút tập theo buổi; sáng <12h, chiều <18h, tối còn lại
VE.store.reset()
```
`session` tự gọi `recordTake` khi bắn 'done' (mode measure). Mode self: UI gọi `recordTake(id, {pass:true, mode:'self', durationSec})` khi người dùng tick đủ checklist và đủ `selfSeconds`.

### 3.5 Hiệu chuẩn
```js
VE.calibrate({ seconds: 5, demo?: bool, onProgress?: (frac, liveHz, phase: "quiet"|"play") => void   // 1,2 s im lặng đo ồn, rồi `seconds` giây kéo dây })
  -> Promise<{ hz, noteName, centsFromNote, stabilityPct, noiseDb, ok: bool, message }>
VE.store.saveCalibration(obj); VE.store.lastCalibration() -> obj|null
```

## 4. Giao diện — Sonnet

Theo sát `design/mockup.png` về bố cục, màu, cảm giác. Điểm phải **sửa so với mockup**:
1. **Màn ĐO, chữ số rất to**: điện thoại đặt trên giá nhạc cách ~1 m. Tên nốt ≥ 72px, cents ≥ 36px, giá trị 4 ô chỉ số ≥ 44px (tabular-nums, đậm). Nhãn nhỏ được. Ô chỉ số không quá 2 cột.
2. **Đồ thị có dải mục tiêu thật**: vẽ theo `level.criteria` như mục 3.2, có chữ nhãn "Vùng mục tiêu", vạch 0 = nốt chuẩn, nét đứt độ rộng tối thiểu. Đường cao độ vẽ từ `frame.centsFromRef` cuộn ngang 4 giây. Khi `voiced=false` thì ngắt đường.

Các ràng buộc khác:
- Không ảnh chụp/ảnh ngoài. Thay ảnh đàn bằng gradient ấm + hình đàn violin vẽ SVG nguyên bản (nét vẽ đơn giản, mờ, làm nền).
- Không dùng chỉ màu xanh/đỏ để phân biệt đạt/trượt: luôn kèm icon (✓/✕) và chữ ("Đạt"/"Chưa").
- Font hệ thống (`-apple-system, "SF Pro", system-ui, "Segoe UI", Roboto`), số dùng `font-variant-numeric: tabular-nums`.
- Màu bằng biến trong `:root`; dark mặc định; light theo `VE.settings.theme` (đặt `data-theme` trên `<html>`).
- Mobile-first 390px; desktop thì căn giữa khung rộng tối đa 480px. Tôn trọng safe-area.
- Router hash: `#/home`, `#/level/:id`, `#/measure/:id`, `#/result/:id`, `#/progress`, `#/calibrate`, `#/settings`. Tab dưới: Lộ trình · Đo · Tiến độ · Cài đặt (Đo → level hiện tại). Hiệu chuẩn mở từ Cài đặt.
- Level `mode:'self'`: màn ĐO thay đồ thị/micro bằng: metronome + đồng hồ đếm `selfSeconds` + checklist `selfCheck` (phải tick hết) + nút "Hoàn thành" → `recordTake` → màn Kết quả.
- Màn Chi tiết level: khung hoạt hình 16:9 là **SVG động** theo `level.anim` (xem mục 5), nút "Nghe âm mẫu" (`VE.playSample`), thẻ YouTube (mở tab mới link tìm kiếm, thumbnail tự vẽ: nền tối + nút play đỏ + tiêu đề), Cách tập, Mẹo, Lỗi thường gặp, Tiêu chí đạt (từ criteria hoặc selfCheck), nút "Bắt đầu đo"/"Bắt đầu tập".
- Màn Kết quả: dùng `done` result + `gate`; "Đạt rồi!" hoặc "Chưa đạt"; 4 chỉ số so ngưỡng; "Lần đạt x/3 · Ngày y/2"; nếu trượt hiện 1 gợi ý sửa dựa vào check nào trượt (rate thấp/cao, regularity, width hẹp/rộng, center above/flat). Nút Thử lại / Về level. Nếu `gate.justPassed`: thông báo mở level tiếp.
- Màn Tiến độ: tab 7/30/90 ngày; biểu đồ đường 2 trục (Hz trái, cents phải) từ `VE.store.daily`; heatmap từ `VE.store.heat(7)`; danh sách `VE.store.takes`.
- Lỗi micro: hiện hướng dẫn tiếng Việt theo `.code` (INSECURE → "cần mở qua https"; DENIED → "cho phép micro trong Cài đặt Safari").
- Trang phải hoạt động khi chưa có dữ liệu (lần mở đầu).

## 5. Hoạt hình (`level.anim`)
SVG trong khung 16:9, vòng lặp theo `anim.rate` (chu kỳ/giây), biên độ tỉ lệ `anim.width`:
- `tap`: ngón tay gõ nhẹ lên mặt bàn/cần đàn.
- `polish`: bàn tay trượt dọc cần đàn như đánh bóng.
- `slide`: cả cánh tay trượt dọc cần đàn, đầu ngón nhẹ.
- `arm` / `wrist` / `finger`: ngón bấm cố định trên dây, khớp đầu ngón lăn về phía cuộn đàn; `arm` chuyển động từ khuỷu, `wrist` từ cổ tay, `finger` biên độ nhỏ ở ngón.
- `shift`: tay rung rồi chuyển sang ngón/nốt kế tiếp mà không ngắt.
- `swell`: biên độ rung tăng dần rồi giảm (biểu cảm).
Dưới bàn tay vẽ dải cao độ nhỏ: đường sin dao động TỪ vạch nốt XUỐNG dưới (minh hoạ rung dưới nốt), đồng bộ với chuyển động.

## 6. Build & test
- `python3 build.py` → `dist/index.html`.
- Engine test: `node tests/engine.test.mjs` (tín hiệu tổng hợp, kiểm sai số đo).
- UI test: Playwright Python, Chrome tại `/usr/bin/google-chrome`, mở `dist/index.html?demo=1` qua `python3 -m http.server`; chụp 390×844 dark/light mỗi màn hình.

---

# PHẦN 2 (v2): Camera nhìn tay + HLV AI + máy chủ trên Mac

Người dùng host app trên MacBook Pro của họ: `server/server.py` phục vụ `dist/index.html` ở `/`, thư viện MediaPipe ở `/vendor/mediapipe/…`, và API HLV AI ở `/api/*`. iPhone mở qua Tailscale (https). App vẫn phải chạy khi mở file trực tiếp hoặc host tĩnh: khi đó camera và HLV AI **tắt nhẹ nhàng** (hiện lý do), mọi thứ khác chạy bình thường.

## 7. File mới và chủ sở hữu

| File | Chủ | Nội dung |
|---|---|---|
| `src/hand.js` | **Opus** | `VE.hand`: camera trước, MediaPipe HandLandmarker, phân tích chuyển động tay. build.py chèn ngay sau engine.js (không cần placeholder mới) |
| `src/engine.js` (bổ sung) | **Opus** | `VE.server`, `VE.coach`, take lưu thêm `fails` |
| `server/*` | **Opus** | server.py, config.json, file .command khởi động, hướng dẫn |
| `src/ui.js`, `src/ui.css`, `src/index.template.html` | **Sonnet** | giao diện camera, thẻ HLV AI, mục HLV AI trong Cài đặt |

## 8. API mới

### 8.1 Máy chủ & HLV AI (`engine.js`)
```js
VE.server.health() -> Promise<{
  ok: bool,                               // false khi không có server (file://, host tĩnh) — không bao giờ reject
  hand: bool,                             // có đủ file model nhìn tay
  coach: { active: 'ollama'|'claude'|null, ollama: { ok, model }, claude: { configured, model } }
}>
VE.settings: thêm khoá coachProvider: 'auto'|'ollama'|'claude' (mặc định 'auto')
VE.coach.ask({ kind: 'take'|'week', levelId?, take? })   // take = object 'done' result của phiên đo (hoặc lastResult của màn Kết quả)
  -> Promise<{ text, provider, model, ms }>
  // lỗi: reject Error .code = 'NO_SERVER' | 'AI_DOWN' (không có AI nào chạy) | 'AI_ERROR' | 'TIMEOUT' (60 s)
VE.coach.summary(days=7) -> object   // số liệu gửi cho AI (để debug / hiện "AI đã xem gì")
```
`text` là văn bản thuần tiếng Việt, ≤ ~120 chữ, có thể có xuống dòng; dòng cuối bắt đầu bằng "Bước tiếp:". UI hiển thị nguyên văn (textContent, không innerHTML).

### 8.2 Camera nhìn tay (`hand.js`) — THỬ NGHIỆM, chỉ tham khảo, không ảnh hưởng qua level
```js
VE.hand.available() -> Promise<bool>         // server có file model không (không reject)
await VE.hand.start(videoEl)                  // mở camera trước vào <video playsinline muted>, tải model
  // lỗi .code: 'NO_SERVER' | 'INSECURE' | 'DENIED' | 'NO_CAMERA' | 'MODEL'
VE.hand.on('landmarks', d => …)   // mỗi khung đã xử lý (~15–30/s)
  // d = { hands: [[{x,y}×21], …] (toạ độ 0..1 theo khung GỐC chưa lật), active: index|null, vw, vh }
VE.hand.on('metrics', m => …)     // ~2 lần/giây
  // m = { tracking: bool, fps, note: string|null,          // note: lý do khi chưa đo được ("Chưa thấy bàn tay", "Đưa tay trái vào khung", "Cần rung để đo")
  //       source: 'arm'|'wrist'|'finger'|'mixed'|null, sourceLabel: 'Cánh tay'|'Cổ tay'|'Ngón'|'Kết hợp'|'—',
  //       dipDeg: number|null, dipLabel: 'Đang lăn'|'Lăn ít'|'Khoá cứng?'|'—', dipOk: bool|null,
  //       handRate: Hz|null, syncLabel: 'Khớp nhịp'|'Lệch nhịp'|'—', syncOk: bool|null }
VE.hand.setAudioRate(hz|null)      // UI chuyển m.rate từ phiên đo micro sang đây mỗi lần có metrics
VE.hand.stop()
VE.hand.off(evt, cb)
VE.HAND_CONNECTIONS -> [[a,b], …]  // các cặp điểm để vẽ khung xương tay
```
Video hiển thị kiểu gương (selfie): đặt `<video>` và `<canvas>` overlay trong cùng một khung có `transform: scaleX(-1)`; vẽ điểm theo toạ độ gốc (x*w, y*h). Tay `active` (tay đang rung) vẽ màu vàng đậm, tay khác mờ.

## 9. Giao diện v2 (Sonnet)
1. **Màn ĐO (mode measure):** nút gạt nhỏ "Camera tay · thử nghiệm" (biểu tượng camera) ở hàng metronome hoặc header.
   - Chỉ bật được khi `VE.hand.available()` = true; nếu không, gạt bị mờ và chạm vào hiện: "Cần mở app qua máy chủ trên Mac để dùng camera."
   - Khi bật: khung camera (tỉ lệ 4:3, video + overlay khung xương) THAY CHỖ đồ thị; vẽ thêm một dải cao độ mini (cao ~40px) chồng ở đáy khung camera, dùng cùng dữ liệu và dải mục tiêu như đồ thị (có thể tái dùng hàm vẽ đồ thị với chiều cao nhỏ).
   - Thêm một hàng 3 "chip" gọn dưới 4 ô chỉ số: Nguồn rung · Khớp đầu ngón · Đồng bộ (giá trị + ✓/✕/— ; chữ ≥ 15px). Khi `tracking=false` hiện `note`.
   - Nhãn nhỏ "Thử nghiệm — chỉ tham khảo".
   - **Vẫn phải vừa 390×664 không cuộn** (khi camera bật cũng vậy).
   - Camera có thể bật trước hoặc trong khi đo; tắt camera khi rời màn hoặc gạt tắt (gọi `VE.hand.stop()`). Mỗi lần có metrics micro → `VE.hand.setAudioRate(m.valid ? m.rate : null)`.
2. **Thẻ HLV AI trên màn Kết quả** (cả đạt và chưa đạt, mode measure): nếu `VE.server.health().coach.active` có giá trị → tự gọi `VE.coach.ask({kind:'take', levelId, take: lastResult})`, hiện "HLV đang xem số liệu…" (có thể mất 5–30 s với AI trên máy), rồi hiện nhận xét + dòng nhỏ "provider · model · x,y s". Có nút "Hỏi lại". Không có server/AI → thẻ không hiện (hoặc 1 dòng mờ "HLV AI cần máy chủ trên Mac").
3. **Màn Tiến độ:** nút "Nhận xét tuần của HLV AI" → `VE.coach.ask({kind:'week'})` → thẻ nhận xét như trên.
4. **Cài đặt:** mục "HLV AI & máy chủ": trạng thái máy chủ (đã kết nối / không), camera tay (sẵn sàng / thiếu model), AI đang dùng (tên model). Chọn nguồn AI: Tự động / Ollama trên Mac / Claude API (lựa chọn không dùng được thì mờ, kèm chú thích "Chưa cấu hình — thêm API key vào config.json trên Mac"). Lưu bằng `VE.settings.set({coachProvider})`.
5. Lỗi HLV hiển thị tiếng Việt: NO_SERVER "Cần mở app qua máy chủ trên Mac", AI_DOWN "AI trên Mac chưa chạy (mở Ollama)", TIMEOUT "AI trả lời quá lâu, thử lại", AI_ERROR "AI gặp lỗi, thử lại".

---

# PHẦN 3 (v3): Đăng lên Cloudflare Pages + Worker

Một project Pages (kéo thả từ dashboard) gồm: `index.html`, `vendor/mediapipe/…` (bundle + wasm), và `_worker.js` (Opus).
`_worker.js` xử lý `/api/health`, `/api/coach` (chỉ Claude API, key trong biến bí mật `ANTHROPIC_API_KEY`),
`/vendor/mediapipe/hand_landmarker.task` (lấy từ Google, cache), còn lại giao cho file tĩnh.

## 10. Mã HLV AI
- Biến bí mật tuỳ chọn `COACH_PASSCODE` trên Cloudflare. Nếu đặt, `/api/coach` yêu cầu header `X-Vibrato-Pass` đúng mã, sai → 401 `{code:'AUTH'}`.
- `/api/health` trả thêm `auth: 'required'|'none'`.
- `VE.settings` thêm khoá `coachPass` (chuỗi, mặc định ''). `VE.coach.ask` tự gửi header. Lỗi mới: `.code = 'AUTH'`.
- UI (Sonnet): mục "HLV AI & máy chủ" trong Cài đặt có ô nhập "Mã HLV AI" (type=password, nút hiện/ẩn, lưu bằng `VE.settings.set({coachPass})`), chỉ hiện khi `health.auth === 'required'` hoặc đã có mã. Thông báo lỗi AUTH: "Sai hoặc thiếu mã HLV AI — nhập trong Cài đặt".
- Máy chủ Mac (server.py) không đổi: `auth` = 'none'.

---

# PHẦN 4 (v4): Tập nhanh — mở khoá mọi level, chọn tốc độ qua level

## 11. Luật mới (Opus, engine.js)
- `VE.settings` thêm `passMode: 'fast'|'standard'|'thorough'` (mặc định 'fast').
  fast = 1 lần đạt · standard = 3 lần đạt (ngày nào cũng được) · thorough = 3 lần đạt trên 2 ngày khác nhau.
- `VE.store.gate(id)` trả `neededPasses`, `neededDays` theo passMode hiện tại. Đổi passMode sang dễ hơn thì level đã đủ số lần sẽ tính là qua ngay.
- **Mọi level đều mở.** `VE.store.status(id)` → `'passed'` | `'current'` (= `currentLevel()`, level thấp nhất chưa qua) | `'open'` (chưa qua, tập được). KHÔNG còn `'locked'`.
- **Qua level N → mọi level < N tự tính là đã qua** (thay cho "thi vượt vòng" cũ). `gate.justPassed` = true khi level vừa qua.
- `VE.PASS_MODES = [{id:'fast', label:'Nhanh', desc:'Đạt 1 lần là qua'}, {id:'standard', label:'Chuẩn', desc:'Đạt 3 lần'}, {id:'thorough', label:'Kỹ', desc:'Đạt 3 lần trên 2 ngày khác nhau'}]`.

## 12. Giao diện (Sonnet)
- Bỏ mọi trạng thái khoá: ô level, thẻ vòng (stage) ở trang chủ, nút "Bắt đầu đo/tập" ở trang chi tiết luôn bấm được. `'open'` = kiểu ô thường (không ổ khoá); `'current'` = nổi bật như hiện tại; `'passed'` = có dấu ✓. Thẻ vòng chưa tới cũng mở rộng được để chọn level.
- Bỏ kiểu "thi vượt" (cờ ⚑) và dòng "Bài kiểm tra vòng…" — không còn cần.
- Màn Kết quả: hiện "Lần đạt x/{neededPasses}"; chỉ hiện "· Ngày y/{neededDays}" khi neededDays > 1. Khi `gate.justPassed` và level > 1: thêm dòng "Các level trước đó cũng được tính là đã qua."
- Cài đặt: mục "Tốc độ qua level" (3 lựa chọn từ `VE.PASS_MODES`, hiện label + desc), lưu `VE.settings.set({passMode})`.
