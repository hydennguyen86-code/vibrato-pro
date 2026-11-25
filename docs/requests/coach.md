# Yêu cầu từ gói `coach`

## Payload HLV Độ mượt nên có level kế tiếp (tuỳ chọn, không gấp)
- Muốn đổi: `coachPayload` trong `src/legato-engine.js` thêm `legato.next = { id, title }` khi lượt vừa đạt và còn level sau (hoặc khi `gate.justPassed`).
- Vì sao: system prompt Độ mượt dặn "chỉ nhắc level đang xét" (đúng DISPATCH). Khi học viên vừa qua M9, dòng "Bước tiếp:" chỉ được nói về M9, không gợi ý được M10 một cách có căn cứ.
- Đề xuất: nếu có `legato.next`, Worker thêm dòng `LEVEL KẾ TIẾP (được gợi ý khi đã qua): M10 – <tên>` và nới quy tắc tương ứng.
- Tạm thời: Worker không gợi ý level khác; prompt dặn khi đạt thì nêu chỉ số sát ngưỡng nhất để giữ.
