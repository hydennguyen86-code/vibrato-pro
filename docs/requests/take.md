# Yêu cầu từ gói `take` gửi lõi (src/legato-engine.js)

## 1. `lastReport()` bị ghi đè bởi lượt ABORTED
- Hiện tại `finish(true)` gán `last = rep` cả khi bấm Dừng. Nếu người dùng vừa có phiếu thật, rồi bắt đầu lượt mới và bấm Dừng, `VE.legato.lastReport(id)` trả về report ABORTED và phiếu cũ mất.
- Đề xuất: chỉ gán `last = rep` khi `rep.code !== 'ABORTED'`.
- Tạm xoay xở: màn `#/lg-result/:id` coi report ABORTED như chưa có lượt (hiện thẻ "Chưa có lượt tập nào trong phiên này").

## 2. (Ghi chú, không bắt buộc) sự kiện `frame` không có cờ "đã hết bài"
- Sau phách cuối `frame.seg` = null. Màn tập đang tự giữ nốt cuối bằng `progress >= 1`. Không cần đổi.

## Từ gói e2e (nhẹ, không chặn)
- Lượt `silent` (M2): phiếu hiện hero "Chưa đạt" kèm "Lần đạt 0/1" và khối "Số đo thô"; lượt này chưa chấm được nên nên hiện "Chưa chấm được" thay vì "Chưa đạt", và ẩn "Lần đạt".
- Phiếu trượt hiện "Lần đạt 1/1 ✓" nếu level đã qua từ trước: dễ hiểu nhầm là lượt này đạt. Nên ghi "Level đã qua trước đó".
- Bảng số đo thô ở 390 px cuộn ngang bên trong khung (đúng ý), nhưng chữ tiêu đề cột "Chuyển ms" bị cắt và lệch hàng với các cột đầu; các cột Tạp/Lệch nhịp/Đơ phải cuộn mới thấy.
- Chữ "Vùng vĩ: Giữa vĩ (tự kiểm)" ở màn tập, theme sáng: màu xám nhạt, hơi mờ khi đặt xa 1 m.
