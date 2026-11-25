# Lỗi nội dung `src/legato-content.js` (từ gói e2e, đọc kỹ 50 level, chưa sửa gì)

Mức: N = nặng (sai kỹ thuật hoặc không làm được), V = vừa (mâu thuẫn, dễ hiểu nhầm), n = nhẹ (mơ hồ, chữ).
Lưu ý chung: tôi không phải thầy dạy violin; các mục "N" nên có người biết đàn xác nhận trước khi sửa.

## A. Sai kỹ thuật hoặc không làm được
- N M32 (step 3 và fix `cross_gap`): "Nâng khuỷu tay" khi đi Rê (ngón 3) sang La buông. Sang dây CAO hơn thì HẠ khuỷu (đúng như M16, M33, M35). Sai chiều.
- N M33 (tip 2, mistakes 2, selfCheck 2): "nốt trên dây Mi gần nhau hơn, thu bàn tay gọn" và "khoảng cách ngón y hệt dây La → lệch cao". Dây dài như nhau, cùng thế ngón thì khoảng cách y hệt trên mọi dây; chính step 2 của M33 viết "cùng thế ngón như trên dây La". Tự mâu thuẫn và sai.
- N M43 (step 2, tip 1, feel): "Đặt ngón 2 lên dây La TRƯỚC khi vĩ sang" trong khi nốt trước cũng là ngón 2 (dây Rê) đang rung. Chỉ có một ngón 2. Tip 1 của chính M43 lại nói "nhấc ngón 2 dây Rê rồi đặt ngón 2 dây La".
- N M22 (step 2, tip 2, selfCheck 1, mistakes 1): "đặt ngón mới xuống TRƯỚC lúc đảo vĩ". Mi → Fa thăng cùng dây Rê: đặt ngón 2 là nốt đổi ngay, vĩ còn đang kéo, nên nốt đổi sớm hơn đổi vĩ và app sẽ chấm `timing_early`. Đúng ra: "chuẩn bị (ngón hờ trên dây) rồi đặt đúng lúc". Mistakes 1 ("đặt đúng lúc đảo vĩ → có tiếng trượt") vô lý. M41 step 3 ("chuẩn bị trước") và M47 cần chữ phân biệt chuẩn bị ngón KHÁC dây (hợp lệ, như M27, M30, M46) với cùng dây.
- N M20 (mistakes 1): "Nhấc ngón 1 khi đặt ngón 2 → tiếng trống ngắn, Si tắt sớm". Cùng dây thì ngón cao nhất quyết định cao độ; nhấc ngón 1 không tạo khoảng trống. Lý do đúng: mất khung tay, cao độ kém ổn định.
- V M21 (tip 2): "giữ ngón trên dây rất nhẹ, chỉ cần chạm vừa đủ, đừng ép" dễ hiểu sai: ngón bấm phải ép dây xuống cần (nhẹ nhưng chắc), chỉ hài âm mới chạm hờ.
- V M31 vs M44: M31 (step 1, tip 1) bảo đặt ngón 1 nằm ngang qua cả hai dây; mistakes 2 và fix `cross_noise` của chính M31 lại coi "ngón đè cả hai dây" là lỗi; M44 selfCheck cũng bảo "không đè cả hai dây". Cần một cách nói thống nhất cho quãng 5. Selfcheck M31 nói "lăn", step 1 nói "nằm ngang".
- V M15 (step 2): "giữ sức nặng bằng nhau ở cả hai dây La và Mi, chỉ chỉnh bằng tốc độ vĩ" ngược M10, M13, M27, M33, M44 (giảm lực khi sang Mi). M48 (tip 2) "đừng thay đổi lực khi sang dây" cũng ngược.
- V M10: mistakes 2 "Hạ khuỷu quá sớm, từ phách 2 → La tắt" mâu thuẫn fix `cross_gap` cùng level "Bắt đầu hạ nhẹ ngay sau phách 2". M9 nói "ngay trước phách 3", M13 nói "nửa sau nốt La". Chọn một mốc.
- V M40: step 2 và fix `vib_freeze` "đặt xuống là rung ngay, không chờ ổn định" mâu thuẫn fix `pitch_arrive` cùng level "đặt ngón dứt khoát đúng chỗ RỒI hãy rung". Rung khi chưa đúng cao độ chính là lỗi `pitch_arrive`. Lặp ở M43, M46, M47, M48, M50 (đều "đặt ngón là rung").
- V M5, M6: "phách đổi nằm ở gốc vĩ / ngọn vĩ". Vĩ luân phiên nên hai điểm đổi của một nhát nằm hai đầu khác nhau. Nên viết "dùng nửa dưới vĩ (đổi ở gốc và ở giữa)" hoặc "nửa trên". Tương tự selfCheck "điểm đổi vĩ thực sự nằm ở gốc".
- V M1, M16 (và các level zone "Giữa vĩ" có nhát 4 phách): M1 step 2 "mỗi phách đi 1/4 chiều dài vĩ" tức trọn vĩ, nhưng step 1 và selfCheck nói "đặt vĩ ở giữa vĩ", M16 "vĩ vẫn ở giữa vĩ cả bốn phách". Mâu thuẫn; chữ "vĩ" dùng cho cả cây vĩ lẫn nhát vĩ ("đặt vĩ ở giữa vĩ").
- V M25 (tip 3): "dùng ít vĩ hơn khi nhịp nhanh" mâu thuẫn selfCheck và zone "Trọn vĩ".
- V M3 (step 3) và M4 (step 4): "giảm tốc độ vĩ trước điểm đổi" mâu thuẫn M1, M2, M7 ("giữ tốc độ đều tới sát điểm đổi"). M3 tip 1 "điểm tiếp xúc gần cần đàn hơn cho dây Sol" và M2 tip 1 "dây La gần ngựa đàn hơn dây Rê": gây tranh cãi, nên bỏ hoặc nói rõ.
- V M18 (tip 2): "mỗi chuyển dây đều rơi vào 'và'" sai: ở bài này nốt đổi đúng trên phách (Rê phách 1, La phách 2). Tip 1 ("nhịp nhanh bạn đỡ phải nhấc vĩ vì lông vĩ không còn thời gian rời dây") lủng củng.
- V M14: `fixes` có KHOÁ `cross_gap` hai lần (bản trên bị bản dưới ghi đè, hai câu gần như lặp). Xoá một bản.
- V M39: goal "bốn lần đổi liền nhau" nhưng bài 8 vĩ (step 4 "8 vĩ liền").
- V M35 (step 4) "ba chỗ chuyển mỗi vòng": thực tế bốn (Rê-La, La-Mi, Mi-La, La-Rê sang vòng sau). Step 1 "Bốn nốt mỗi phách" nên là "mỗi nốt một phách".
- V M50 (step 2): các "cặp" tập riêng "Rê với Si" và "Sol với Mi" là cùng dây, không phải chuyển dây; thiếu cặp chuyển xuống Si (La) → Sol (Rê) trùng đổi vĩ.
- n M17 (feel) "bàn phím đàn hạc": đàn hạc không có bàn phím. M17 tip 3 phủ định kép khó hiểu ("đừng để lực không đổi").
- n M34 (feel) "Fa thăng và La cùng một bậc" (là quãng 3 thứ); step 1 "ngón 2 nhấc khi sang La" không bắt buộc (khác dây).
- n M37: tip 2 "Gác nhẹ ngón 3 gần ngón 4 để truyền đà rung" vô nghĩa (ngón 3 chính là ngón rung); step 1 "ngón 2 và 4 treo phía trên làm điểm tựa" mơ hồ; mistakes 1 coi rung cổ tay là lỗi (gây tranh cãi).
- n M7: "Cánh tay đi một đường thẳng" (vĩ mới đi thẳng, cánh tay vẽ cung); "đầu vĩ" mơ hồ (ngọn vĩ hay đầu nhát).
- n M14, M50: lẫn "cầu đàn" và "ngựa đàn"; "vĩ lướt trên cầu đàn" (M50 feel) không đúng.
- n M26 "kêu bậy" khẩu ngữ. M32 goal "từ Sol (Rê) sang La" khó hiểu.
- n M41 step 4 "vì bàn tay phải thu lại": đọc thành "tay phải". Đúng là tay trái; viết "bàn tay trái phải thu lại".

## B. Hứa app đo điều micro không đo được
- V M7 (step 4): "sụt dB phải nhỏ ở cả đổi vĩ ngọn lẫn gốc" ngụ ý phiếu tách gốc/ngọn. Phiếu chỉ có trung vị sụt chung. Sửa: "sụt dB phải nhỏ; tự kiểm xem hai đầu vĩ đều gọn".
- V M8 (mistakes 1): "đo ra là sụt ở nửa số điểm đổi" ngụ ý app biết chiều vĩ xuống/lên. Không biết.
- V M42 (tip 3): "Nếu một nốt đo ra hẹp" nhưng phiếu báo độ rộng TRUNG VỊ cả lượt (SPEC §4); kiểm xem số đo thô có độ rộng theo nốt không, nếu không thì sửa chữ.
- n M28 (step 4): "tiếng tạp có nghĩa là ngón nhấc không đúng lúc" quy một nguyên nhân; app chỉ biết "to nhưng không có cao độ".
- n M9 (steps, tips): khuyên cho vĩ chạm hai dây một thoáng và "nốt Rê còn ngân khi La đã lên" có thể bị bộ chấm tính là "cao độ khác" hoặc tiếng tạp (cross O/N). Nên thử trên tín hiệu thật xem có phạt oan không. (Hiện cùng ý lặp ở M12, M28, M30, M43, M50.)
- Ổn (đã nói tự kiểm): các mục "vùng vĩ", "khuỷu tay", "vai" nằm trong `selfCheck`; trang level ghi "Tự kiểm (micro không đo được)" và "Vùng vĩ: ... (tự kiểm)". Không thấy chỗ nào hứa đo vùng vĩ trực tiếp ngoài hai chỗ ở mục B.

## C. Đã kiểm đúng
- Quãng tám/quãng 4/quãng 5/quãng 3 thứ dùng để so với dây buông ở M19, M20, M23, M27, M30, M46; âm giai M32, M33; chiều khuỷu tay ở M11, M16, M35, M45, M10, M13; "rung xuống dưới nốt" (M36, M50) khớp quy ước của app.
