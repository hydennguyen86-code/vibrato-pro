# E2E phần Độ mượt (gói e2e, đợt 2)

Chạy: `python3 build.py`, máy chủ tĩnh cổng 8820, Playwright + Chrome, mọi URL có `?demo=1`. Không sửa mã. Script nháp: `scratchpad/e2e/`.

## Kết quả theo mục
| # | Mục | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | Test + build | ĐẠT (1 lỗi môi trường) | engine 48/48, hand đạt, hold 25/25, legato-engine 45/45, legato-levels đạt, legato-store đạt, levels đạt, store đạt, worker_legato 59/59. `server_test.py`: 1 lỗi "health: có model nhìn tay" vì sandbox thiếu `vendor/mediapipe/hand_landmarker.task` (không tải được từ web), không phải lỗi mã. `_worker.js` chỉ có `['default']`. dist/index.html 460.667 byte; cloudflare/vibrato 30,5 MB (có wasm); pages.zip 8.623.249 byte (8,2 MiB, < 10 MB). |
| 2 | Lối vào | ĐẠT | Lộ trình có thẻ "Độ mượt"; thanh tab 5 mục; `#/legato` có 6 vòng, 50 hàng; M1, M9, M14, M26, M32, M36, M43, M50 đủ Cách tập, Mẹo, Lỗi hay gặp, Cảm giác đúng, Tự kiểm (micro không đo được), Video, "App chấm gì". Video cụ thể: M1 3, M9/M14/M26/M32 3, M36 2, M43 3, M50 2; luôn có link "Tìm thêm". |
| 3 | Một lượt speed=1 (M18) | ĐẠT | Đếm 4-3-2-1, thanh vĩ đổi chiều (Kéo xuống / Đẩy lên), 2 đồ thị có dữ liệu, tự sang phiếu "Đạt rồi!" 4/4 sau 12,9 s. Ảnh `scratchpad/e2e/shots/s3-*.png`. |
| 4 | Ma trận mẫu lỗi | ĐẠT 16/16 | Bảng dưới. |
| 5 | Tiến độ | ĐẠT | Nhanh: M9 smooth qua, M1–8 "đã qua", `#/home` vẫn Level 1. Chuẩn: M10 hiện "Lần đạt 1/3" rồi 3/3 mới qua. L23 vibrato đạt ở demo: Độ mượt giữ nguyên 9, vibrato lên Level 24. "Đặt lại tiến độ" (xác nhận "Xoá toàn bộ…") đưa cả hai về 0. Tải lại: tiến độ còn. |
| 6 | Bền | ĐẠT | Dừng giữa lượt: ở màn tập, nút về "Bắt đầu", không ghi lượt. Bấm quay lại giữa lượt rồi vào tập lại: chạy bình thường tới "Đạt rồi!". `#/lg-result/9` sau tải lại: "Chưa có lượt tập nào trong phiên này". `#/lg-level/999`, `#/lg-take/abc`, `#/lg-result/999`: thẻ không tìm thấy. |
| 7 | Hồi quy vibrato | ĐẠT | `#/home`, `#/level/23`, `#/measure/23` (tới `#/result/23`), `#/progress`, `#/calibrate` (chạy xong), `#/settings`: không lỗi console, không tràn ngang. Màn Đo 390×664: scrollHeight 664 = innerHeight. |
| 8 | Giao diện | ĐẠT (có lỗi nhẹ) | 390×844 và 1280×800, tối và sáng: home, list, level, take (sẵn sàng, đếm vào, đang chấm), result đạt/trượt, số đo thô. scrollWidth <= innerWidth ở mọi màn; take 390×664 không cuộn dọc. Không lỗi console. Đã mở xem 6 ảnh, lỗi nhẹ ở `docs/requests/take.md`. |
| 9 | Nội dung | LỖI (nội dung) | Đọc đủ 50 level, xem `docs/requests/content.md` (5 lỗi nặng, nhiều lỗi vừa). Video: `mKrUa5YiY3g` và `SuRepN7XKpQ` mở được, tiêu đề khớp (mKrUa5YiY3g do trang chống bot nên chỉ đọc được metadata). `oicPusUO4_4`: bị giới hạn tốc độ, không kiểm được. |
| + | Luật đổi cung `#/measure/45` | KHÔNG KIỂM ĐƯỢC QUA GIAO DIỆN | Tín hiệu demo là một dao động liên tục, không có chế độ ngắt tiếng. L45 demo đạt sau 8 s, không bao giờ hiện "đồng hồ tạm dừng". Luật chỉ được kiểm bởi `tests/hold.test.mjs` (25/25). |

## Ma trận mẫu lỗi (speed=8)
| Level × mẫu | Kỳ vọng | Thực tế | Mẹo hiện ra | |
|---|---|---|---|---|
| M2 smooth | đạt | đạt 3/3 | không | ĐẠT |
| M2 bowgap | chỉ "Liền tiếng khi đổi vĩ" | chỉ chỉ số đó, sụt 32,6 dB | Hở tiếng lúc đổi vĩ | ĐẠT |
| M2 uneven | "Đều tiếng trong từng nốt" | chỉ chỉ số đó, 10,9 dB | Tiếng to nhỏ không đều trong một nốt | ĐẠT |
| M2 silent | báo không nghe thấy, không phiếu | "Không nghe thấy tiếng đàn", 0 chỉ số (hero "Chưa đạt", lỗi nhẹ) | không | ĐẠT |
| M9 smooth | đạt | 4/4 | không | ĐẠT |
| M9 crossgap | chỉ "Chuyển dây" | chuyển 108 ms | Hở tiếng lúc chuyển dây | ĐẠT |
| M9 crossnoise | chỉ "Chuyển dây" | chuyển 156 ms | Tiếng tạp lúc chuyển dây | ĐẠT |
| M9 wrongnote | chỉ "Đúng nốt" | lệch 50 cents | Nốt chưa đúng cao độ | ĐẠT |
| M9 late | chỉ "Đúng nhịp" | lệch 265 ms | Đổi trễ so với phách | ĐẠT |
| M19 crossgap | chỉ "Nối nốt (cùng dây)" | chuyển 108 ms | Hở tiếng khi đổi nốt | ĐẠT |
| M36 smooth | đạt | 7/7 | không | ĐẠT |
| M36 vibfreeze | chỉ "Vibrato không đơ" | đơ 492 ms | Vibrato bị đơ sau điểm đổi | ĐẠT |
| M43 smooth | đạt | 8/8 | không | ĐẠT |
| M43 crossgap | chỉ "Chuyển dây" | chuyển 108 ms | Hở tiếng lúc chuyển dây | ĐẠT |
| M43 vibfreeze | chỉ "Vibrato không đơ" | đơ 516 ms | Vibrato bị đơ sau điểm đổi | ĐẠT |
| M50 smooth | đạt | 10/10 | không | ĐẠT |
Mẹo chỉ hiện dưới chỉ số trượt; chỉ số đạt không có mẹo; "Số đo thô" mở được, có bảng theo phách (sụt, hở, chuyển, tạp, lệch nhịp, đơ).

## Lỗi (nặng / vừa / nhẹ)
- Nặng (nội dung, `docs/requests/content.md`): M32 nâng khuỷu sai chiều; M33 "khoảng cách ngón trên dây Mi khác dây La" sai; M43 "đặt ngón 2 lên dây La trước" không thể (cùng ngón 2); M22 "đặt ngón mới trước khi đảo vĩ" cùng dây sẽ bị chấm sớm; M20 "nhấc ngón 1 gây hở" sai.
- Vừa: nhiều mâu thuẫn nội dung (M10, M15, M31/M44, M40, M3/M4, M25, M18, M5/M6, M1/M16), M14 trùng khoá `cross_gap`, hứa phiếu tách gốc/ngọn (M7, M8, M42). Xem file requests.
- Nhẹ (giao diện, `docs/requests/take.md`): lượt silent hiện "Chưa đạt"/"Lần đạt 0/1"; phiếu trượt hiện "Lần đạt 1/1 ✓" khi level đã qua; tiêu đề cột bảng số đo thô bị cắt; chữ "Vùng vĩ" ở theme sáng hơi mờ.
- Môi trường: `server_test.py` thiếu model nhìn tay (không phải lỗi mã).

## Ảnh (`docs/screenshots/`)
legato-home-390-dark, legato-home-1280-dark, legato-list-390-dark, legato-list-390-light, legato-list-1280-light, legato-level-390-dark, legato-level-1280-light, legato-take-ready-390-dark, legato-take-ready-1280-light, legato-take-count-390-dark, legato-take-play-390-light, legato-take-play-1280-dark, legato-result-pass-390-dark, legato-result-fail-390-light, legato-result-fail-1280-dark, legato-result-raw-390-light (.png).
