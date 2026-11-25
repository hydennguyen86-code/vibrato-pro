# Vibrato Pro · phần "Độ mượt" — SPEC (nguồn sự thật cho mọi agent)

Phần mới trong cùng app: tập **đổi vĩ liền tiếng, đổi nốt legato, và TRỌNG TÂM là chuyển dây mượt (kể cả khi đang vibrato)**.
Mỗi lượt tập ra một **phiếu chấm** như phần vibrato: từng chỉ số có số đo, đạt/chưa, lý do; trượt chỉ số nào hiện đúng mẹo sửa chỉ số đó.
Yêu cầu gốc: `docs/BRIEF.md`. Hợp đồng app cũ: `SPEC.md`, `CLAUDE.md`. File này chỉ nói phần mới.

Sản phẩm cuối vẫn là MỘT file `dist/index.html`. Giao diện tiếng Việt có dấu, giọng văn như app hiện tại.
Trong app, level Độ mượt viết là **M1…M50** (để khỏi lẫn với L1…L100 của vibrato).

## 1. Cây file và chủ sở hữu (một file, một chủ)

| File | Chủ | Nội dung |
|---|---|---|
| `docs/SPEC-LEGATO.md`, `docs/DISPATCH.md`, `SPEC.md` | **Fable** | hợp đồng, bảng phát việc |
| `src/legato-engine.js` | **Fable** | `VE.legato`: ngưỡng, kế hoạch lượt tập, bộ chấm, tín hiệu giả lập, tiến độ, phiên tập, payload HLV AI |
| `src/legato-levels.js` | **Fable** | `LEGATO_STAGES` (6 vòng), `LEGATO_LEVELS` (khung 50 level: bài, bpm, bậc khó) |
| `src/engine.js`, `src/ui.js`, `src/ui.css`, `src/index.template.html`, `src/levels.js`, `src/hand.js` | **Fable** (lõi cũ) | worker KHÔNG sửa |
| `build.py`, `build_cloudflare.py` | **Fable** | |
| `tests/legato-engine.test.mjs`, `tests/legato-store.test.mjs`, `tests/legato-levels.test.mjs`, `tests/hold.test.mjs`, test cũ | **Fable** | |
| `src/legato-take.js`, `src/legato-take.css` | **Opus-A** (gói `take`) | màn Lượt tập (`#/lg-take/:id`) + màn Phiếu chấm (`#/lg-result/:id`) |
| `src/legato-content.js` | **Sonnet-A** (gói `content`) | `LEGATO_CONTENT`: chữ hướng dẫn của 50 level |
| `src/legato-videos.js`, `docs/reference/legato-videos-sources.md` | **Sonnet-B** (gói `videos`) | `LEGATO_VIDEOS`: video tham khảo có thật |
| `src/legato-list.js`, `src/legato-list.css`, `CLAUDE.md` | **Sonnet-C** (gói `list`) | màn Danh sách/tiến độ (`#/legato`), màn Chi tiết level (`#/lg-level/:id`), tab, thẻ ở trang Lộ trình, cập nhật ghi chú dự án |
| `deploy/_worker.js`, `tests/worker_legato.test.mjs` | **Opus-B** (gói `coach`) | Worker hiểu `kind:'legato'` |
| `docs/e2e-legato.md`, `docs/screenshots/legato-*.png` | **Sonnet-E2E** (đợt 2) | chạy thử toàn bộ, không sửa code |

Không ai đụng `deploy/coach-relay/`. Worker cần đổi file lõi thì viết `docs/requests/<tên-gói>.md` (muốn đổi gì, vì sao, đề xuất cụ thể) và làm tạm trong file của mình; không tự sửa.

Thứ tự nạp trong trang (do `build.py`, mỗi file một thẻ `<script>`):
`levels.js` → `legato-levels.js` → `legato-content.js` → `legato-videos.js` → `engine.js`+`hand.js` → `legato-engine.js` → `legato-list.js` → `legato-take.js` → `ui.js`.
CSS: `ui.css` → `legato-list.css` → `legato-take.css`. File của worker chưa có thì build bỏ qua, app vẫn chạy với nội dung dự phòng.

## 2. Cấu trúc 50 level (6 vòng)

| Vòng | Tên | Level | Loại | Ghi chú |
|---|---|---|---|---|
| 1 | Đổi vĩ liền tiếng | M1–8 | `bow` | dây buông; giữa vĩ → gốc → ngọn → trọn vĩ → mỗi phách |
| 2 | **Chuyển dây trên dây buông** | M9–18 | `cross` | tay trái nghỉ; luyến trong một vĩ → đúng lúc đổi vĩ → bập bênh → 3–4 dây |
| 3 | Đổi nốt legato trên một dây | M19–25 | `note` | ngón 1–4, lên/xuống, đúng lúc đổi vĩ |
| 4 | **Chuyển dây có bấm ngón** | M26–35 | `cross` | ngón ↔ dây buông, quãng 5/6, âm giai qua dây, hợp âm rải |
| 5 | Vibrato xuyên đổi vĩ, đổi nốt | M36–42 | `bow`/`note` + vibrato | mỗi nốt ≥ 1 s để đo được vibrato |
| 6 | **Vibrato xuyên chuyển dây · Cantabile** | M43–50 | `cross` + vibrato | cả hai nốt đều bấm ngón; câu hát 2–3 dây |

Chuyển dây: 28/50 level, bắt đầu từ M9. Level cuối mỗi vòng là bài kiểm tra (bậc khó cao hơn). So với bản Gemini: bỏ các level chỉ khác nhau ở vùng vĩ (micro không đo được vùng vĩ), dồn chỗ cho chuyển dây.
Danh sách cụ thể: `src/legato-levels.js`. `tests/legato-levels.test.mjs` kiểm: đủ 50, đúng vòng, nốt khớp dây/ngón ở thế 1, lượt tập dài 8–20 s, level vibrato không dùng dây buông và nốt ≥ 0,9 s, mẫu "mượt" tự đạt, mẫu lỗi trọng tâm trượt đúng chỉ số.

## 3. Schema level

### 3.1 Khung — `src/legato-levels.js` (Fable)
```js
window.LEGATO_STAGES = [{ id: 2, name: 'Chuyển dây trên dây buông', range: [9, 18], short: 'M9–18', focus: 'bow'|'cross'|'note'|'vib' }, …]
window.LEGATO_LEVELS = [{
  id: 9, stage: 2,
  kind: 'bow' | 'note' | 'cross',      // loại bài: đổi vĩ / đổi nốt cùng dây / chuyển dây
  vibrato: false,                       // true = chấm thêm vibrato (loại "có vibrato")
  title: 'Rê sang La trong một vĩ (luyến)',
  bpm: 60, beatsPerBow: 4, beatsPerBar: 4, reps: 4,
  pattern: [ { note: 'D4', string: 'D', finger: 0, beats: 2 }, { note: 'A4', string: 'A', finger: 0, beats: 2 } ],  // một vòng; lượt tập = pattern × reps
  bowZone: 'Giữa vĩ',                   // TỰ KIỂM: micro không biết vĩ đang ở gốc hay ngọn
  tier: 1 | 2 | 3,                      // bậc khó → bộ ngưỡng VE.legato.TIERS[tier]
  criteria: { cross: { maxGapMs: 40 }, timing: false },   // tuỳ chọn: ghi đè từng số; false = tắt hẳn chỉ số đó
  demo: { vibRate: 5.5, vibWidth: 36 } | null,            // vibrato của tín hiệu giả lập
  videoGroup: 'bow'|'note'|'cross'|'vib'|'vibcross'|'cantabile'
}, …]
```
Điểm đổi (boundary) suy ra từ pattern: hai nốt liền nhau khác dây và khác cao độ = `cross`; cùng dây khác cao độ = `note`; cùng nốt nhưng rơi vào bội số của `beatsPerBow` = `bow`. Nốt dài hơn một vĩ bị cắt tại điểm đổi vĩ.

### 3.2 Nội dung — `src/legato-content.js` (Sonnet-A)
```js
window.LEGATO_CONTENT = {
  9: {
    goal: 'Một câu mục tiêu.',
    steps: ['…'],            // Cách tập, 3–5 bước, theo thứ tự làm
    tips: ['…'],             // Mẹo, 2–3 ý
    mistakes: ['…'],         // Lỗi hay gặp, 1–3 ý
    feel: '…',               // "Cảm giác đúng là gì": 1–2 câu tả cảm giác cơ thể/âm thanh khi làm đúng
    selfCheck: ['…'],        // 1–3 điều micro KHÔNG đo được, người tập tự kiểm (vùng vĩ, khuỷu tay, vai…)
    fixes: { cross_gap: '…' },   // tuỳ chọn: câu sửa riêng của level, ghi đè VE.legato.TIPS[mã].fix. Mã phải có trong TIPS.
    youtube: { title: '…', query: '…' }   // tuỳ chọn: link tìm kiếm dự phòng riêng của level
  }, …
}
```
### 3.3 Video — `src/legato-videos.js` (Sonnet-B)
```js
window.LEGATO_VIDEOS = {
  groups: {                         // theo videoGroup; mỗi nhóm 1–3 video, tốt nhất trước
    bow: [ { url: 'https://www.youtube.com/watch?v=<ID 11 ký tự>', title: '…', channel: '…', lang: 'en'|'vi', minutes: 8, note: 'xem từ phút 2:10' } ],
    note: [], cross: [], vib: [], vibcross: [], cantabile: []
  },
  byLevel: { 16: [ { url, title, channel } ] },     // tuỳ chọn: video riêng cho một level
  queries: { bow: { title: 'Tìm thêm: đổi vĩ mượt', query: 'violin smooth bow change' }, … }   // link tìm kiếm dự phòng cho từng nhóm
}
```
`url` phải là URL **thấy tận mắt trong kết quả WebSearch/WebFetch**, khuôn `https://www.youtube.com/watch?v=…` hoặc `https://youtu.be/…`. Không có thì để mảng rỗng: level vẫn luôn có link tìm kiếm.

### 3.4 Level đã gộp — `VE.legato.levels()` / `VE.legato.level(id)` (UI chỉ đọc cái này)
Mọi trường ở 3.1, cộng: `goal, steps[], tips[], mistakes[], feel, selfCheck[], fixes{}` (lấy từ content, thiếu thì dùng bản dự phòng theo `kind`), `pattern[i].midi`,
`videos: [{url,title,channel,…}]` (0–3 video cụ thể: `byLevel` trước, rồi `groups`), `youtube: {title, query}` (LUÔN có; link = `https://www.youtube.com/results?search_query=` + `encodeURIComponent(query)`),
`kindLabel` ('Chuyển dây + vibrato'…), `criteria` (đã gộp tier, là bộ ngưỡng có hiệu lực).

## 4. Phiếu chấm: định nghĩa từng chỉ số

Tín hiệu vào: mỗi 12 ms một **khung** `{t, db, c}`: `db` = RMS (dB) trên cửa sổ ~22 ms; `c` = cao độ YIN của `engine.js` tính bằng cents tuyệt đối (midi × 100), `null` khi không có cao độ rõ (lặng, tiếng tạp). `t` = giây tính từ phách đầu của phần chấm.
Lưới phách do app tạo (metronome), dịch đi `TH.take.latencyMs` (60 ms) để bù trễ micro.
Chấm SAU khi kéo xong cả lượt (không chấm từng khoảnh khắc). "Điểm đổi" = chỗ đổi vĩ / đổi nốt / chuyển dây theo bài.

Quy tắc chung cho chỉ số đếm theo sự kiện: chỉ số ĐẠT khi số sự kiện hỏng ≤ `floor(n × 0,2)` (`TH.take.allowBadFrac`). Phiếu luôn ghi "k/n".
Mức âm lượng tham chiếu tại một điểm đổi = mức nhỏ hơn trong hai trung vị dB ở 200–650 ms trước và sau điểm đó. "Hở" = khung tụt quá 12 dB so với tham chiếu (`TH.gapDropDb`).

| id | Nhãn | Áp dụng khi | Cách tính | Số chính · đơn vị | Ngưỡng tier 1 / 2 / 3 | Mã trượt |
|---|---|---|---|---|---|---|
| `bow` | Liền tiếng khi đổi vĩ | có điểm đổi vĩ trên cùng một nốt | trong ±220 ms quanh phách: **sụt** = tham chiếu − đáy dB (đáy phải kéo dài ≥ 2 khung); **hở** = cụm khung "hở" dài nhất (ms; bắc cầu qua ≤ 4 khung vì tiếng metronome có thể rơi đúng chỗ hở). Điểm đổi hỏng nếu hở > max hoặc sụt > max | trung vị độ sụt · dB | sụt ≤ 10 / 8 / 6 dB · hở ≤ 50 / 35 / 25 ms | `bow_gap`, `bow_dip` |
| `even` | Đều tiếng trong từng nốt | luôn | trong mỗi nốt (bỏ 180 ms hai đầu): phân vị 90 − phân vị 10 của dB. Nốt hỏng nếu > max | trung vị · dB | ≤ 8 / 7 / 6 dB | `even_range` |
| `pitch` | Đúng nốt | luôn | mỗi nốt: trung vị cents (bỏ 120 ms đầu, 80 ms cuối) − nốt mục tiêu. Level vibrato: nốt mục tiêu chỉ cần nằm trong vùng rung [trung vị, phân vị 90]. Thêm **cao độ lúc vừa tới** (50–280 ms sau khi nốt mới lên tiếng) với ngưỡng riêng. Nốt lệch > 2 × ngưỡng không được tha theo luật k/n | trung vị độ lệch · cents | ≤ 40 / 30 / 25 cents · lúc vừa tới ≤ 55 / 45 / 35 | `pitch_off`, `pitch_arrive` |
| `join` | Nối nốt (cùng dây) | có điểm đổi nốt cùng dây | như `cross` | trung vị thời gian chuyển · ms | chuyển ≤ 110/90/75 · hở ≤ 50/35/25 · tạp ≤ 80/70/60 ms · sụt ≤ 10/8/6 dB | `join_gap`, `join_noise`, `join_slow`, `join_dip`, `join_missing` |
| `cross` | **Chuyển dây** | có điểm chuyển dây | Quanh phách (±45% nốt ngắn hơn, tối đa ±450 ms) phân loại từng khung theo cao độ THỰC kéo ở hai bên: F = còn ở nốt cũ, T = đã ở nốt mới, S = hở (tụt > 12 dB), N = **to nhưng không có cao độ** (rít, quệt dây thừa), O = cao độ khác. "Rời" = khung F cuối (chuỗi ≥ 2), "tới" = khung đầu của chuỗi T ≥ 3 khung sau đó. **Thời gian chuyển** = các khung ở giữa; trong đó **hở** = số khung S, **tiếng tạp** = số khung N; **sụt** = tham chiếu − đáy dB quanh đoạn chuyển. Chuyển dây trùng lúc đổi vĩ được dùng ngưỡng sụt/hở rộng hơn của `bow`. Không tìm thấy chuỗi T → "không nghe ra chỗ chuyển" | trung vị thời gian chuyển · ms | chuyển ≤ 150/120/100 · hở ≤ 60/45/35 · tạp ≤ 90/75/65 ms · sụt ≤ 10/8/7 dB | `cross_gap`, `cross_noise`, `cross_slow`, `cross_dip`, `cross_missing` |
| `vibRate` | Vibrato · tốc độ | `vibrato:true` | `analyzeTrack` của engine.js trên từng nốt ≥ 0,9 s; lấy trung vị các nốt | Hz | 3,5–7,5 / 4–7,5 / 4,5–7,5 | `vib_rate_low`, `vib_rate_high`, `vib_none` |
| `vibWidth` | Vibrato · độ rộng | như trên | trung vị đỉnh–đáy | cents | 15–80 / 18–70 / 20–65 | `vib_width_narrow`, `vib_width_wide`, `vib_none` |
| `vibReg` | Vibrato · độ đều | như trên | công thức regularity của engine.js | % | ≥ 60 / 68 / 75 | `vib_reg` |
| `vibCenter` | Vibrato · tâm cao độ | `criteria.vib.center` (chỉ tier 3) | đỉnh dao động so với nốt mục tiêu, cùng luật dưới/trên/thấp cả nốt của app | cents | rung xuống dưới nốt | `vib_center_above`, `vib_center_flat` |
| `vibCont` | Vibrato không đơ | như trên | "đang rung" tại một khung = phân vị 90 − 10 của cao độ (đã trừ trung vị của nốt) trong cửa sổ ~0,15 s quanh nó ≥ 45% độ rộng tối thiểu. **Đơ** sau mỗi điểm đổi = đoạn không rung dài nhất trong [−150 ms, +900 ms]. Thêm **% thời gian có rung** của cả lượt | trung vị đoạn đơ · ms | đơ ≤ 300 / 240 / 180 ms · rung ≥ 70 / 78 / 85% | `vib_freeze`, `vib_patchy` |
| `timing` | Đúng nhịp | có ≥ 2 điểm đổi nghe ra được | sai lệch = thời điểm đổi (giữa "rời" và "tới"; với đổi vĩ là đáy dB nếu sụt ≥ 3 dB) − phách | trung vị \|sai lệch\| · ms | ≤ 180 / 140 / 110 ms | `timing_late`, `timing_early`, `timing_uneven` |

Lượt ĐẠT = hợp lệ và mọi chỉ số áp dụng đều đạt. Chỉ số không áp dụng thì không có trong phiếu.

**Sàn đo (không phải lỗi của người kéo):** chuyển nốt tức thời vẫn đo ra 12–36 ms "thời gian chuyển" vì cửa sổ YIN nằm vắt qua hai nốt; khoảng hở ngắn hơn ~25 ms chỉ hiện thành "sụt"; độ phân giải thời gian 12 ms. Ngưỡng đã tính tới các sàn này.

**Không đo được, nói thẳng trong app (không giả vờ):**
- Vĩ đang ở gốc, giữa hay ngọn; khuỷu tay, cổ tay: `bowZone` và `selfCheck` là tự kiểm.
- Đổi vĩ càng mượt càng không nghe ra: `bow` chỉ đo chỗ sụt quanh phách, không biết chính xác lúc đảo vĩ; đổi vĩ không sụt thì không có số "đúng nhịp".
- Chuyển dây giữa hai dây buông cùng… cao độ, hay quệt dây thừa quá khẽ (không phá cao độ): không thấy.
- Tiếng metronome từ loa điện thoại lọt micro (≤ ~40 ms mỗi phách) có thể che một khoảng hở rất ngắn hoặc cộng vài chục ms vào "tiếng tạp". Màn Lượt tập có nút "metronome chỉ nháy" (`metronome:false`) và khuyên đeo tai nghe khi cần đo kỹ.
- Trễ micro mỗi máy mỗi khác: "đúng nhịp" bù cố định 60 ms, phiếu in thêm độ lệch trung bình (sớm/trễ) để chỉnh `TH.take.latencyMs`.
- **Mọi ngưỡng chưa kiểm trên tiếng đàn thật.** Tất cả nằm ở `VE.legato.TH` và `VE.legato.TIERS` đầu file `src/legato-engine.js`. Phiếu chấm phải hiện được số đo thô (`report.raw`, `report.events`) để người dùng gửi lại.

Mẹo sửa cho từng mã trượt: `VE.legato.TIPS[mã] = { title, fix }` (28 mã). Phiếu chấm đã gắn sẵn vào `check.tip`.

## 5. API — `window.VE.legato` (`src/legato-engine.js`)

```js
VE.legato.TH, .TIERS, .TIPS, .CHECKS            // ngưỡng · bậc khó · mẹo theo mã · [{id, label, group}] theo thứ tự hiển thị
VE.legato.CODE_MSG                               // { NO_SOUND, TOO_SHORT, WRONG_NOTE, ABORTED, NOISY } → câu tiếng Việt
VE.legato.DEMO_PATTERNS                          // [{ id, label, fails:[id chỉ số] }] : smooth, bowgap, crossgap, crossnoise, wrongnote, vibfreeze, uneven, late, silent
VE.legato.STRING_VI                              // { G:'Sol', D:'Rê', A:'La', E:'Mi' }
VE.legato.stages() -> LEGATO_STAGES;  VE.legato.levels() -> [level đã gộp];  VE.legato.level(id) -> level|null
VE.legato.plan(level) -> {
  bpm, beatSec, beatsPerBow, beatsPerBar, countInBeats, countInSec, totalBeats, totalSec, vibrato,
  segs:   [{ i, note, midi, string, finger, b0, b1, t0, t1, bow, dir:'down'|'up', pat }],     // một nốt trong một vĩ
  bounds: [{ i, beat, t, kind:'bow'|'note'|'cross', bowChange, from, to }],                    // điểm đổi giữa segs[i] và segs[i+1]
  bows:   [{ i, b0, b1, t0, t1, dir }] }
VE.legato.criteriaOf(level) -> tiêu chí có hiệu lực
```
### 5.1 Phiên tập (chỉ trong trình duyệt)
```js
const s = VE.legato.createSession(level, { demo?: bool, pattern?: 'smooth'|…, speed?: 1..16 (chỉ demo), metronome?: bool (false = chỉ nháy, không kêu) })
// demo tự bật khi URL có ?demo=1. Trong demo không dùng micro; tín hiệu giả lập đi qua đúng bộ cắt khung và bộ chấm.
s.plan, s.criteria, s.demo, s.state
await s.start()            // phải gọi trong thao tác chạm. Lỗi: reject Error .code = 'INSECURE'|'DENIED'|'NO_MIC'|'UNSUPPORTED' (dùng VP_UI.micErrorHTML(code))
s.stop()                   // dừng giữa chừng → 'done' với code 'ABORTED' (không ghi lượt)
s.on('state', ({ state, plan }) => …)   // 'starting' → 'countin' → 'playing' → 'analyzing' → 'done'   (lỗi micro: về 'idle')
s.on('beat',  b => …)     // b = { index (âm khi đếm vào: -4…-1; 0 = phách đầu), countIn: bool, left: số phách đếm vào còn lại, inBar: 0…3, bow: chỉ số vĩ|null }
s.on('frame', f => …)     // ~80 lần/giây. f = { t, phase:'countin'|'play', db, voiced, cents, noteName,
                           //   seg: chỉ số nốt đang phải kéo|null, target: 'A4'|null, centsFromTarget, bowDir:'down'|'up'|null, progress: 0..1 }
s.on('done',  report => …) // xem 5.2. Phiên tự ghi tiến độ; UI KHÔNG gọi recordTake. UI vẫn gọi VE.store.logPractice(giây) như màn Đo cũ.
s.off(evt, cb)
VE.legato.lastReport(levelId?) -> report của lượt ĐÃ CHẤM gần nhất trong phiên trình duyệt này (lượt ABORTED không ghi đè) | null   // màn Phiếu chấm đọc từ đây
```
Một lượt = đếm vào 1 ô nhịp (4 phách) + `plan.totalSec` (8–20 s) + 0,35 s đuôi. Trong lúc chấm phiên tự chạy `VE.metronome` (UI không gọi `VE.metronome.start` trong lúc phiên đang chạy).
Không có drone trong phần này (drone lọt micro làm sai phép đo liền tiếng).

### 5.2 Phiếu chấm (`report`)
```js
{
  valid: bool, code: null|'NO_SOUND'|'TOO_SHORT'|'WRONG_NOTE'|'ABORTED', message: string|null,
  warnings: [{ code:'NOISY', message }],
  pass: bool, levelId, durationSec, nOk, nChecks,
  order: ['bow','even','pitch','cross', …],            // các chỉ số ÁP DỤNG cho lượt này, theo thứ tự hiển thị
  checks: { cross: {
      id, label, group:'bow'|'pitch'|'join'|'cross'|'vib'|'timing',
      ok: bool, value: number|null, unit: 'ms'|'dB'|'cents'|'Hz'|'%',
      text: 'chuyển 24 ms',                             // số chính đã định dạng tiếng Việt
      target: 'chuyển ≤ 150 ms · hở ≤ 60 ms · tạp ≤ 90 ms',
      detail: 'Tệ nhất: hở 108 ms, tiếng tạp 12 ms, sụt 24,1 dB · 7/7 lần chuyển dây chưa mượt',
      bad, n, allowed,                                   // với chỉ số đếm theo sự kiện
      worst, worstGapMs, worstNoiseMs, worstDipDb, …     // số thô phụ (tuỳ chỉ số)
      fail: 'cross_gap'|null, tip: { code, title, fix }|null   // chỉ có khi ok === false
  }, … },
  fails: ['cross_gap', …], tips: [{ check, code, title, fix }],
  events:   [{ i, kind, bowChange, beat, t, from, to, found, dipDb, gapMs, transMs, noiseMs, otherMs, timingMs, arriveCents, vibFreezeMs, bad:[mã], ok }],
  segments: [{ i, note, string, finger, t0, t1, cents, arriveCents, ok, evenDb, vib:{rate,width,regularity,center}|null }],
  raw: { frames, hopMs, latencyMs, refDb, noiseDb, snrDb, voicedPct, vib?:{rate,width,regularity,activePct,notesMeasured,notes} },
  criteria,                                              // bộ ngưỡng đã dùng
  // phiên thêm vào:
  demo: bool, pattern: string|null, plan, gate,          // gate như VE.store.gate
  trace: [{ t, db, c }]                                  // toàn bộ khung, để vẽ lại đồ thị; không lưu localStorage
}
```
Mã lỗi cả lượt: `NO_SOUND` (có tiếng < 12% thời gian), `TOO_SHORT` (< 40%), `ABORTED` (bấm dừng): không có chỉ số, không ghi lượt. `WRONG_NOTE` (quá nửa số nốt lệch > 80 cents): vẫn có đủ chỉ số, `pass=false`, có ghi lượt.

### 5.3 Tiến độ — `VE.legato.store` (khoá localStorage `vibratoPro.legato.v1`)
```js
.recordTake(levelId, report) -> gate     // phiên tự gọi
.gate(id) -> { passCount, dayCount, neededPasses, neededDays, levelPassed, justPassed }
.status(id) -> 'passed'|'current'|'open'      // mọi level đều mở
.currentLevel() -> số;  .passedCount() -> số
.takes(days) -> [{ ts, levelId, pass, code, nOk, nChecks, fails:[mã], vals:{ [id chỉ số]: { v, ok } }, durationSec }]   // mới nhất trước
.best(levelId) -> take|null;  .failCounts(days=14) -> { mã: số lần }
.reset()
```
Luật: dùng chung `VE.settings.passMode` (fast 1 lần · standard 3 lần · thorough 3 lần/2 ngày). Qua M-N → mọi M < N tính là đã qua. KHÔNG cascade sang 100 level vibrato và ngược lại. Đổi passMode sang dễ hơn thì level đủ số lần được tính qua ngay (tính lúc đọc). Thời gian tập và chuỗi ngày dùng chung `VE.store.logPractice`.

### 5.4 HLV AI
```js
VE.legato.coach.ask(report, level?) -> Promise<{ text, provider, model, ms }>   // lỗi .code như VE.coach.ask
VE.legato.coach.payload(report, level?) -> body gửi POST /api/coach
```
Body: `{ kind:'legato', provider, level:{id,title,goal,kind,bpm,tips,mistakes}, legato:{ pass, code, nOk, nChecks, lines:[chuỗi "Nhãn: số (ngưỡng …) — ĐẠT/CHƯA. chi tiết"], fails:[{code,title}], gate, repeated:[{code,title,count}], passed, total, next:{id,title}|null (level kế tiếp, chỉ khi lượt đạt) } }`.
Chỉ gọi khi `VE.server.health()` trả `legato: true` (Worker mới, gói `coach`). Máy chủ không có cờ này → `AI_DOWN`; UI ẩn thẻ HLV. Không đổi hợp đồng `kind:'take'|'week'`.

### 5.5 Lõi thuần — `VE.legato.core` (Node test, e2e)
`plan, criteriaOf, frameOf, extract(signal, sr, {t0Sec,minHz,thrDb,a4}), analyzeTake(frames, plan, crit, {latencyMs,thrDb,fixes,levelId}), demoSignal(plan, pattern, opts), simulate(level, pattern, opts) -> report, noteToMidi`.

## 6. Máy trạng thái một lượt tập (UI)
```
idle ──[chạm Bắt đầu]──> starting (xin micro) ──> countin (4 phách, đếm 4-3-2-1) ──> playing (totalSec) ──> analyzing ──> done → #/lg-result/:id
  ▲                         │ lỗi micro → idle + thẻ lỗi                  │ chạm Dừng → done(ABORTED) → ở lại màn Lượt tập
  └─────────────────────────┴──────────────────────────────────────────────┘
```
Rời màn hình giữa chừng: gọi `s.stop()` trong hàm dọn dẹp và không điều hướng.

## 7. Tín hiệu giả lập (`?demo=1`)
`createSession(level, { demo:true, pattern })`. Các mẫu (`DEMO_PATTERNS`): `smooth` (đạt), `bowgap` (hụt tiếng 110 ms lúc đổi vĩ), `crossgap` (hở 130 ms lúc chuyển dây/đổi nốt), `crossnoise` (150 ms tiếng tạp không cao độ), `wrongnote` (nốt thứ hai của pattern thấp 100 cents), `vibfreeze` (tắt rung 0,55 s sau mỗi điểm đổi), `uneven` (mỗi nốt đuối 15 dB), `late` (trễ 260 ms), `silent`.
Mọi mẫu có nhiễu nền và tiếng metronome lọt micro. `speed` (1–16) tua nhanh cho e2e. Mẫu lỗi rơi vào chỉ số nào tuỳ bài: `bowgap` ở level mà mọi điểm đổi vĩ đều trùng chuyển dây sẽ trượt `cross`; `vibfreeze` ở level không vibrato thì vẫn đạt.
Màn Lượt tập ở chế độ demo phải có bộ chọn mẫu; URL nhận thêm `&pattern=<id>` và `&speed=<n>`.

## 8. Route và điều hướng
| Route | Chủ | Tab sáng | Ghi chú |
|---|---|---|---|
| `#/legato` | Sonnet-C | `legato` | tổng quan tiến độ + 6 vòng + 50 ô level |
| `#/lg-level/:id` | Sonnet-C | `legato` | hướng dẫn, mẹo, lỗi hay gặp, cảm giác đúng, tự kiểm, video, tiêu chí; nút "Bắt đầu tập" → `#/lg-take/:id` |
| `#/lg-take/:id` | Opus-A | `legato`, `fit:true` | lượt tập; xong → `#/lg-result/:id` |
| `#/lg-result/:id` | Opus-A | `legato` | phiếu chấm; nút Tập lại → `#/lg-take/:id`, Hướng dẫn → `#/lg-level/:id`, Level tiếp → `#/lg-level/:id+1`, Danh sách → `#/legato` |
Tab mới "Độ mượt" (id `legato`, `order: 2`, sau tab "Đo") và thẻ "Độ mượt" ở trang Lộ trình: Sonnet-C đăng ký. id không hợp lệ → hiện thẻ "Không tìm thấy level" có nút về `#/legato`.

## 9. Điểm mở rộng của `ui.js` (worker không sửa `ui.js`)
File màn hình là một IIFE, nạp TRƯỚC `ui.js`, đăng ký như sau:
```js
(function () {
  'use strict';
  (window.VP_EXT = window.VP_EXT || []).push(function (ui) {
    ui.registerRoute('lg-take', function (arg) { ui.view.innerHTML = …; return function cleanup() {…}; }, { tab: 'legato', fit: true });
  });
})();
```
`ui` (= `window.VP_UI`):
- `registerRoute(name, fn(arg) -> cleanup|void, { tab, fit })`: `name` khớp `/^[a-z][a-z0-9-]*$/`; route lõi trùng tên luôn thắng. `fit:true` = màn hình không cuộn, ẩn thanh tab (như màn Đo). Hàm dọn dẹp được gọi khi rời route.
- `registerTab({ id, href, label, icon (chuỗi SVG 24×24, stroke currentColor), order })`, `registerHomeCard(fn() -> chuỗi HTML)`.
- `go(hash)`, `rerender()`.
- Tiện ích dùng chung: `VE, DEMO (bool), view (phần tử #view), I (bộ icon SVG: back, play, stop, check, cross, bulb, warn, retry, metro, yt, chev, minus, plus, speaker, flame…), WL (wake lock: acquire()/release()), $, $$, esc, f0, f1 (số → chuỗi dấu phẩy), clamp, safe, toast(msg), topbar(title, backHref, rightHTML), stHTML('ok'|'bad'|'na'), micErrorHTML(code), dateLabel(ts), fmtTime(sec), serverHealth(), coachActive(h), coachRun(host, ask, ctl, cache), COACH_ERR`.

## 10. Quy ước giao diện
- Dùng lại class và biến màu của `src/ui.css` (`.card`, `.btn .btn-gold .btn-blue .btn-ghost .btn-sm`, `.chip`, `.tags`, `.sec-title`, `.steps`, `.note`, `.crit`, `.yt`, `.bar`, `.st.ok/.bad`, `.tile`, `.mgrid`, `.cta`, `.fitstack`, `.metro`, `.dots`, `.num`, `.muted`, `.gold`…). Class mới phải có tiền tố: **`lgt-`** (gói take), **`lgl-`** (gói list). Không ghi đè class cũ, không dùng selector thẻ trần.
- Mobile-first 390 px, không cuộn ngang, tôn trọng safe-area; desktop căn giữa như app. Dark mặc định, light theo `data-theme` (chỉ dùng biến màu).
- Không dùng riêng màu để phân biệt đạt/chưa: luôn kèm ✓/✕ và chữ "Đạt"/"Chưa". Số dùng `tabular-nums`, số thập phân dấu phẩy.
- Màn Lượt tập: điện thoại đặt trên giá nhạc cách ~1 m → tên nốt mục tiêu ≥ 64 px, số đếm vào ≥ 96 px, thanh dẫn hướng vĩ rõ; phải vừa 390×664 không cuộn.
- Mọi chuỗi động vào DOM qua `esc()` hoặc `textContent`. Link ngoài: `target="_blank" rel="noopener"`.
- Không ảnh ngoài, không CDN, không font ngoài. `AudioContext` chỉ mở sau thao tác chạm (đã do engine lo, miễn là gọi `s.start()` trong handler của nút).
- Nói thẳng hai giới hạn trong app: vùng vĩ là tự kiểm; đổi vĩ càng mượt càng khó nghe ra nên app đo chỗ sụt quanh phách.

## 11. Test và build
```bash
for t in tests/*.test.mjs; do node $t | tail -1; done; python3 tests/server_test.py | tail -1   # tests/legato-levels.test.mjs chạy ~1 phút
node tests/legato-levels.test.mjs --quick      # chỉ kiểm schema + nội dung + video (vài giây)
python3 build.py                               # → dist/index.html
python3 build_cloudflare.py && node -e "import('./cloudflare/vibrato/_worker.js').then(m=>console.log(Object.keys(m)))"   # phải in [ 'default' ]
```
- `tests/legato-engine.test.mjs`: tín hiệu tổng hợp có nhiễu + tiếng metronome lọt micro; mẫu mượt đạt, mỗi mẫu lỗi trượt ĐÚNG chỉ số của nó; SNR 14–20 dB, metronome to gấp 2,5, trễ micro 20–120 ms.
- `tests/legato-store.test.mjs`: tiến độ riêng, passMode chung, không cascade chéo.
- `tests/legato-levels.test.mjs`: schema 50 level + nội dung/video của worker + giả lập từng level.
- `tests/hold.test.mjs`: luật đổi cung của phần vibrato (SPEC.md §13).
- UI: Playwright Python + Chrome `/usr/bin/google-chrome`, mở `dist/index.html?demo=1` qua `python3 -m http.server <cổng riêng> -d dist`, chụp 390×844 và 1280×800, không lỗi console (404 của `/api/health` trên máy chủ tĩnh là bình thường), `document.documentElement.scrollWidth <= innerWidth`.
