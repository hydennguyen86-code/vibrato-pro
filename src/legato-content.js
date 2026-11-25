/* Vibrato Pro — phần Độ mượt: chữ hướng dẫn của 50 level (goal, steps, tips, mistakes, feel, selfCheck, fixes). Schema: docs/SPEC-LEGATO.md §3.2.
 * Gói content (Sonnet) viết; Fable soát kỹ thuật và ghi lại bằng scratchpad/fable/fix-content.js sau e2e (25/11). */
(function (root) {
  'use strict';
  root.LEGATO_CONTENT = {
    "1": {
      "goal": "Đổi chiều vĩ trên dây Rê mà tai không nghe ra chỗ nối: tiếng dày như một nốt kéo dài.",
      "steps": [
        "Đặt vĩ lên dây Rê buông ở giữa cây vĩ, lông vĩ phẳng, vĩ vuông góc với dây. Kéo thử một nhát cho tiếng đứng yên rồi mới bật metronome.",
        "Mỗi nhát vĩ dài 4 phách ở nhịp 60. Chỉ dùng đoạn giữa của cây vĩ (khoảng một nửa chiều dài), chia đều cho 4 phách, không dồn tốc độ vào đầu nhát.",
        "Gần phách 4, để ngón trỏ và ngón cái phải làm việc trước: chúng đổi chiều, cánh tay đi theo sau một chút. Đừng dừng vĩ rồi mới quay lại.",
        "Bước cuối: bấm Bắt đầu, kéo 4 vĩ liền (xuống, lên, xuống, lên) và nhìn phiếu chấm xem chỗ nào sụt hoặc hở."
      ],
      "tips": [
        "Hình dung đổi vĩ như đổi chiều của chiếc xe đạp đang lăn: bánh không dừng, chỉ quay ngược.",
        "Giữ ngón cái phải hơi cong và mềm. Ngón cứng thẳng làm vĩ khựng đúng lúc đảo chiều.",
        "Nhìn lông vĩ chứ đừng chỉ nghe: điểm tiếp xúc nên đứng nguyên một chỗ giữa ngựa đàn và cần đàn suốt cả vĩ."
      ],
      "mistakes": [
        "Dừng vĩ một nhịp ở cuối vĩ để “chuẩn bị” → nghe tiếng ngắt, hở vài chục mili giây.",
        "Ấn thêm lực ngay sát điểm đổi → tiếng rít hoặc to đột ngột, rồi sụt xuống sau điểm đổi."
      ],
      "feel": "Tay phải nhẹ và tròn, sức nặng cánh tay đi liền từ vĩ này sang vĩ kia. Tai nghe một nốt dài có hơi thở chứ không nghe hai nốt dính nhau.",
      "selfCheck": [
        "Bạn kéo ở đoạn giữa cây vĩ, không trôi dần về gốc hay ngọn sau mỗi lần đổi.",
        "Vai phải thả lỏng, khuỷu tay không nhích lên khi sắp đổi vĩ."
      ],
      "fixes": {
        "bow_gap": "Ở level đầu này, hở tiếng gần như luôn do vĩ chậm lại quá sớm. Giữ tốc độ đều tới sát phách 4, để các ngón tay phải đảo chiều trước, rồi mới để cánh tay đi theo."
      }
    },
    "2": {
      "goal": "Đổi vĩ trên dây La buông liền tiếng, âm lượng sau điểm đổi bằng trước điểm đổi.",
      "steps": [
        "Chuyển vĩ sang dây La. Dây La mỏng hơn dây Rê nên cần ít sức nặng hơn và vĩ đi nhanh hơn một chút để tiếng đầy.",
        "Kéo thử một vĩ 4 phách ở nhịp 60, nghe xem phách 1 và phách 4 có to bằng nhau không. Nếu phách 4 yếu đi, vĩ đang chạy nhanh quá lúc cuối.",
        "Tập đổi vĩ nhỏ: chỉ cần bàn tay và ngón tay đảo chiều, vĩ chuyển động khoảng 2 cm quanh điểm đổi. Làm 3 lượt như vậy.",
        "Bật Bắt đầu và kéo 4 vĩ liền. Xem số sụt dB ở phiếu: mục tiêu là nhỏ hơn ngưỡng của level."
      ],
      "tips": [
        "Dây La mảnh hơn dây Rê: dùng ít sức nặng hơn một chút và giữ điểm tiếp xúc đứng yên để tiếng không mỏng.",
        "Nghĩ tới ngón trỏ như đang “đẩy” sức nặng xuống dây ngay lúc vĩ quay đầu."
      ],
      "mistakes": [
        "Nhả hết sức nặng ở điểm đổi cho đỡ rít → tiếng sụt mạnh rồi bật lại.",
        "Ép vĩ dày ở cuối vĩ rồi bỏ lơ ở đầu vĩ sau → phách 1 của vĩ mới nhỏ hơn phách 4 của vĩ cũ."
      ],
      "feel": "Lông vĩ như bám sát vào dây qua lúc đảo chiều. Bạn cảm thấy sức nặng cánh tay trôi qua điểm đổi, không bị ngắt.",
      "selfCheck": [
        "Vĩ nằm ở giữa vĩ, vuông góc dây La.",
        "Ngón trỏ không siết, ngón út vẫn cong và nhẹ trên gáy vĩ."
      ],
      "fixes": {
        "bow_gap": "Trên dây La hở tiếng thường do vĩ chậm lại ở cuối vĩ. Giữ tốc độ vĩ đều tới sát phách 4 và để ngón tay phải đảo chiều trước, cánh tay đi theo sau."
      }
    },
    "3": {
      "goal": "Đổi vĩ trên dây Sol buông mà tiếng trầm vẫn dày, không rỗng lúc đảo chiều.",
      "steps": [
        "Nâng khuỷu tay phải lên mức của dây Sol, cánh tay cao hơn mức dây Rê một chút. Cổ tay hơi gập xuống.",
        "Đặt vĩ giữa vĩ, kéo một vĩ 4 phách ở nhịp 58. Dây Sol dày nên phản hồi chậm: cho dây thời gian bắt đầu rung trước khi tăng tốc vĩ.",
        "Trước điểm đổi, giữ nguyên sức nặng và tốc độ vĩ tới sát phách, rồi quay chiều bằng các ngón tay.",
        "Bấm Bắt đầu, kéo 4 vĩ liền và nghe xem tiếng trầm có bị mỏng ở phách 1 sau mỗi lần đổi không."
      ],
      "tips": [
        "Dây Sol cần nhiều sức nặng hơn và vĩ đi chậm hơn một chút so với dây La.",
        "Để trọng lượng cánh tay chìm xuống dây qua ngón trỏ, đừng ép bằng cơ vai.",
        "Nếu nghe tiếng “gầm” ở đầu vĩ, giảm bớt lực và để dây tự rung."
      ],
      "mistakes": [
        "Vĩ đổi hướng quá vội → dây Sol chưa kịp rung nên tiếng bị trống đúng điểm đổi.",
        "Khuỷu tay thấp như khi kéo dây Rê → cổ tay phải gập ngược, vĩ dễ trượt sang dây Rê."
      ],
      "feel": "Cánh tay như đang tựa vào dây, nặng nhưng thoải mái. Tiếng tròn, ấm và liền qua hai vĩ.",
      "selfCheck": [
        "Khuỷu tay cao hơn một chút so với dây Rê, vai không nhún.",
        "Vĩ ở giữa vĩ, không lệch sang dây Rê."
      ],
      "fixes": {
        "bow_gap": "Dây Sol cần thời gian rung, nên nếu bạn dừng vĩ thì tiếng tắt hẳn. Giữ vĩ chuyển động liên tục qua điểm đổi và để sức nặng cánh tay dính dây."
      }
    },
    "4": {
      "goal": "Đổi vĩ trên dây Mi buông nhẹ nhàng, tiếng sáng và liền qua điểm đổi, không rít.",
      "steps": [
        "Hạ khuỷu tay phải xuống mức dây Mi: cánh tay thấp, cổ tay hơi vồng lên một chút so với mức dây La.",
        "Đặt vĩ giữa vĩ, kéo một vĩ 4 phách ở nhịp 62. Dây Mi rất nhạy: dùng ít sức nặng hơn, vĩ nhanh hơn vừa đủ để tiếng không mỏng.",
        "Tập đảo chiều thật nhỏ quanh điểm đổi, chỉ dùng ngón tay phải, cánh tay gần như đứng yên.",
        "Bấm Bắt đầu và kéo 4 vĩ. Nếu phiếu báo tiếng sụt, giữ tốc độ vĩ đều tới sát điểm đổi và đổi chiều bằng ngón tay, đừng thêm lực."
      ],
      "tips": [
        "Trên dây Mi, quá nhiều lực chỉ làm tiếng rít. Thử cầm vĩ như cầm một con chim: chắc nhưng không bóp.",
        "Dây Mi sáng dễ lộ tiếng lạo xạo; giữ vĩ vuông góc dây, đừng nghiêng."
      ],
      "mistakes": [
        "Ép vĩ để tiếng to hơn → tiếng rít và tạp ngay điểm đổi.",
        "Đổi vĩ bằng cả cánh tay, vai nhún → vĩ trượt khỏi điểm tiếp xúc."
      ],
      "feel": "Tay phải nhẹ, gần như không có lực, nhưng tiếng vẫn đầy và đều từ đầu vĩ tới cuối vĩ.",
      "selfCheck": [
        "Khuỷu tay thấp hơn mức dây La và thả lỏng.",
        "Vĩ vuông góc dây, điểm tiếp xúc vẫn ổn định giữa ngựa đàn và cần đàn."
      ],
      "fixes": {
        "bow_gap": "Dây Mi nhạy nên chỉ cần vĩ khựng một thoáng là hở. Đổi chiều bằng ngón tay trước, giữ lực nhẹ đều và đừng nhấc vĩ khi đảo."
      }
    },
    "5": {
      "goal": "Đổi vĩ ở gốc vĩ trên dây Rê, nơi vĩ nặng nhất, mà tiếng vẫn liền như ở giữa vĩ.",
      "steps": [
        "Dùng nửa dưới của cây vĩ: mỗi nhát 3 phách ở nhịp 60, đi từ sát gốc vĩ (gần tay cầm) ra tới giữa vĩ rồi quay về. Cứ hai lần đổi thì một lần rơi ở gốc vĩ: đó là chỗ cần chăm nhất.",
        "Ở gốc vĩ trọng lượng của chính cây vĩ đã đè xuống. Nhấc bớt lực ngón trỏ, để ngón út giữ cân bằng.",
        "Tập đảo chiều thật nhỏ ở gốc vĩ khoảng 5 lần không có metronome, chỉ nghe sự liền tiếng.",
        "Bấm Bắt đầu, 5 vĩ liền. Ở phiếu, nếu sụt dB lớn, giảm lực ngón trỏ và để cánh tay đưa vĩ đi."
      ],
      "tips": [
        "Ở gốc vĩ, ngón út là điểm tựa: gập nhẹ để nâng đầu vĩ khỏi tụt xuống.",
        "Nghĩ đến chuyển động của cổ tay như đang vẽ một dấu chấm nhỏ ngay lúc đảo chiều, không giật."
      ],
      "mistakes": [
        "Ngón trỏ ép mạnh khi vĩ ở gốc → tiếng gắt và sụt ngay sau khi đảo chiều.",
        "Khuỷu tay mở rộng ra ngoài khi gần gốc vĩ → vĩ nghiêng, lông vĩ lệch."
      ],
      "feel": "Tay trượt nhẹ nhàng dù vĩ đang nặng. Cảm giác như cầm một vật có trọng lượng nhưng bạn dẫn nó chứ không bị nó kéo.",
      "selfCheck": [
        "Bạn chỉ dùng nửa dưới của vĩ, và lần đổi ở gốc thật sự sát gốc vĩ.",
        "Ngón út cong, ngón trỏ không siết chặt quanh gáy vĩ."
      ],
      "fixes": {
        "bow_gap": "Ở gốc vĩ, hở thường do vĩ nặng nên bạn dừng lại để đổi. Nhấc bớt lực ngón trỏ, để ngón út cân bằng và đảo chiều bằng cổ tay mềm."
      }
    },
    "6": {
      "goal": "Đổi vĩ ở ngọn vĩ trên dây La, nơi vĩ nhẹ nhất, mà tiếng không mỏng đi hay tắt.",
      "steps": [
        "Dùng nửa trên của cây vĩ: mỗi nhát 3 phách ở nhịp 60, đi từ giữa vĩ ra sát ngọn rồi quay về. Cứ hai lần đổi thì một lần rơi ở ngọn vĩ. Tay phải duỗi tự nhiên, không vươn vai.",
        "Ở ngọn vĩ cây vĩ nhẹ, nên thêm một chút sức nặng từ ngón trỏ, và xoay nhẹ cẳng tay vào trong để lông vĩ vẫn bám dây.",
        "Luyện đảo chiều nhỏ ở ngọn vĩ khoảng 5 lần, chỉ dùng ngón tay và cổ tay.",
        "Bấm Bắt đầu, 5 vĩ liền. Nếu hở tiếng, thêm chút sức nặng ngón trỏ ở ngọn vĩ và đừng dừng vĩ trước khi đảo."
      ],
      "tips": [
        "Tới ngọn vĩ, để khuỷu tay duỗi tự nhiên và cổ tay mềm, hơi hạ; đừng vươn vai ra trước.",
        "Nghĩ tới đầu vĩ như đang chạm xuống dây, không nhấc."
      ],
      "mistakes": [
        "Quên tăng sức nặng ở ngọn vĩ → tiếng mỏng rồi tắt trước điểm đổi.",
        "Vươn vai ra trước để tới ngọn vĩ → vai căng, vĩ lạng khỏi vị trí vuông góc."
      ],
      "feel": "Đầu vĩ như dính vào dây. Dù ở cuối vĩ, tiếng vẫn ấm và đều như lúc đầu.",
      "selfCheck": [
        "Bạn chỉ dùng nửa trên của vĩ, và lần đổi ở ngọn thật sự sát ngọn vĩ.",
        "Cánh tay duỗi thoải mái, vai không nhún."
      ],
      "fixes": {
        "bow_gap": "Ở ngọn vĩ, hở thường do đầu vĩ nhẹ và tuột khỏi dây. Thêm một chút sức nặng ngón trỏ, xoay nhẹ cẳng tay vào trong và đảo chiều gọn."
      }
    },
    "7": {
      "goal": "Dùng trọn chiều dài vĩ với 2 phách mỗi vĩ ở nhịp 72, đổi vĩ liên tục mà tiếng không gợn.",
      "steps": [
        "Bật metronome 72 và tập kéo trọn vĩ (từ gốc tới ngọn) trong 2 phách, trên dây La. Vĩ đi khá nhanh, giữ sức nặng cánh tay đều.",
        "Đếm “một, hai” theo vĩ: ngọn vĩ trùng phách đổi, gốc vĩ trùng phách đổi tiếp theo.",
        "Giữ tốc độ vĩ không đổi qua cả hai đầu. Đừng chậm lại ở gần đầu vĩ để chuẩn bị.",
        "Bấm Bắt đầu, 8 vĩ liền. Phiếu cho một số sụt chung cho mọi lần đổi. App không biết lần nào ở gốc, lần nào ở ngọn, nên bạn tự nghe xem đầu nào hay hụt."
      ],
      "tips": [
        "Vĩ đi nhanh thì lông vĩ cần ít sức nặng hơn so với khi kéo chậm: giảm lực một chút.",
        "Giữ vĩ đi thẳng, song song với ngựa đàn suốt nhát. Muốn vậy khuỷu tay phải mở dần ra khi vĩ đi về ngọn.",
        "Nghĩ tới gốc vĩ và ngọn vĩ như hai “bến” cần chuyển hướng gọn, không dừng."
      ],
      "mistakes": [
        "Chỉ kéo được nửa vĩ, bỏ phần ngọn → tiếng đều nhưng không dùng hết vĩ.",
        "Vĩ nghiêng dần ra khỏi vuông góc khi đi tới ngọn → lúc đổi chiều bị trượt sang dây bên cạnh."
      ],
      "feel": "Tay phải trôi như một chiếc con lắc dài. Âm thanh liền, bạn gần như không thấy ranh giới giữa các vĩ.",
      "selfCheck": [
        "Bạn dùng trọn vĩ, từ sát gốc tới sát ngọn, ở cả hai chiều.",
        "Vĩ luôn song song với ngựa đàn."
      ],
      "fixes": {
        "bow_gap": "Vĩ trọn 2 phách chạy nhanh nên chỉ cần dừng một thoáng ở đầu vĩ là hở. Đảo chiều ngay khi vĩ tới đầu, bằng ngón tay và cổ tay, không chờ cánh tay.",
        "bow_dip": "Với vĩ dài và nhanh, tiếng sụt thường do chậm vĩ ở hai đầu. Giữ tốc độ vĩ tới sát điểm đổi và dồn sức nặng nhẹ ở đầu vĩ thay vì nhả lực."
      }
    },
    "8": {
      "goal": "Đổi vĩ mỗi phách ở nhịp 66 trên dây Rê, âm lượng đều, không hở qua 12 lần đổi liên tiếp.",
      "steps": [
        "Dùng nửa trên của vĩ, nơi cân bằng nhất. Đặt vĩ cách ngọn khoảng một phần ba chiều dài vĩ.",
        "Bật metronome 66, đổi vĩ ở mỗi tiếng tích. Đoạn vĩ nhỏ, khoảng 5 đến 8 cm, dùng chủ yếu cổ tay và ngón tay.",
        "Ban đầu kéo mà chưa quá lo tiếng to nhỏ: chỉ cần đổi chiều gọn, liền mạch.",
        "Bấm Bắt đầu, 12 vĩ liền. Đây là bài kiểm tra vòng 1: ngưỡng chặt hơn, cần nghe đều cả 12 lần đổi."
      ],
      "tips": [
        "Cổ tay như bản lề gập mở nhỏ, ngón tay phải đóng vai lò xo.",
        "Ngón trỏ giữ sức nặng không đổi trong cả hai chiều, vì vậy vĩ lên và vĩ xuống nghe giống nhau.",
        "Nếu một chiều nghe to hơn, đó là chiều bạn dùng nhiều cánh tay hơn: bù lại bằng ngón tay."
      ],
      "mistakes": [
        "Kéo vĩ xuống mạnh hơn kéo vĩ lên → tiếng to nhỏ xen kẽ theo từng nhát. App không biết chiều vĩ, bạn tự nghe chiều nào yếu hơn.",
        "Đổi vĩ bằng khuỷu tay nhún → vĩ giật và hở tiếng."
      ],
      "feel": "Tay phải nhẹ và nhanh như lắc nhẹ bàn tay. Tai nghe một dải tiếng đều, có nhịp nhưng không có khe.",
      "selfCheck": [
        "Vĩ ở nửa trên của vĩ cả lượt, không lạc sang gốc.",
        "Vai và khuỷu tay gần như đứng yên, chỉ cổ tay và ngón tay làm việc."
      ],
      "fixes": {
        "bow_gap": "Đổi mỗi phách thì không có thời gian cho cánh tay. Thu nhỏ chuyển động: chỉ đổi bằng cổ tay và ngón tay, tập chậm ở nhịp 50 rồi mới tăng."
      }
    },
    "9": {
      "goal": "Rê sang La trong một vĩ mà tai không nghe ra chỗ chuyển: hai nốt nối nhau như một câu.",
      "steps": [
        "Tay trái nghỉ. Kéo vĩ giữa vĩ trên dây Rê, rồi chuyển sang dây La mà chưa cần kèm metronome. Hạ khuỷu tay phải nhẹ để vĩ nằm đúng mặt phẳng của dây La.",
        "Tập chậm cho tới khi bạn nghe được một khoảnh khắc ngắn lông vĩ chạm cả hai dây rồi mới sang hẳn dây La.",
        "Bật metronome 60. Mỗi vĩ gồm Rê hai phách rồi La hai phách, chuyển dây ngay ở phách 3. Đổi vĩ rơi vào lúc quay lại Rê.",
        "Bấm Bắt đầu, 4 vĩ liền. Soát ba số ở phiếu: hở tiếng, tiếng tạp, thời gian chuyển."
      ],
      "tips": [
        "Chuẩn bị bằng khuỷu tay trước phách 3 một chút, để lúc chuyển chỉ còn cổ tay và ngón tay làm phần cuối.",
        "Giữ tốc độ vĩ và sức nặng không đổi qua điểm chuyển. Thứ duy nhất đổi là góc của cánh tay.",
        "Nghe dây Rê tắt dần ở mép, chứ đừng cắt nó: nốt Rê còn ngân khi nốt La đã lên."
      ],
      "mistakes": [
        "Nhấc vĩ lên khỏi dây Rê rồi mới thả xuống dây La → hở tiếng, nghe rõ hai nốt rời nhau.",
        "Quật cả cánh tay sang dây La → vĩ đập, tiếng tạp và cộng thêm tiếng của dây Sol hoặc dây Mi."
      ],
      "feel": "Cánh tay hạ xuống như đang đi xuống một bậc thang thoải, nhẹ và không giật. Âm thanh nối từ Rê sang La như hát một quãng lên.",
      "selfCheck": [
        "Vĩ nằm ở giữa vĩ khi chuyển dây.",
        "Vai và cổ tay thả lỏng, không nhún lên lúc chuyển."
      ],
      "fixes": {
        "cross_gap": "Ở level đầu tiên về chuyển dây, hở tiếng nghĩa là vĩ rời dây Rê trước khi chạm dây La. Hạ khuỷu tay sớm, ngay trước phách 3, để lông vĩ chạm hai dây một thoáng rồi mới sang La.",
        "cross_noise": "Tiếng tạp là vĩ đập xuống dây La hoặc quệt dây Mi. Chuyển bằng chuyển động tròn nhỏ của cổ tay, không quật cánh tay, và giữ tốc độ vĩ đều khi chạm dây mới."
      }
    },
    "10": {
      "goal": "La sang Mi trong một vĩ, tiếng liền, dây Mi lên tiếng ngay mà không rít.",
      "steps": [
        "Thử riêng: kéo La buông, rồi hạ khuỷu tay xuống mức dây Mi và kéo tiếp. Làm chậm, chỉ nghe chỗ nối.",
        "Dây Mi nhạy hơn nhiều: sang dây Mi thì giảm lực một chút ngay lúc vĩ chạm dây, để tiếng không gắt.",
        "Bật metronome 60. Mỗi vĩ gồm La hai phách rồi Mi hai phách, chuyển dây ở phách 3. Đổi vĩ trùng lúc quay lại La.",
        "Bấm Bắt đầu, 4 vĩ liền. Nếu phiếu báo tiếng tạp, nghĩ lại về lực và góc vĩ lúc chạm dây Mi."
      ],
      "tips": [
        "Sang dây cao hơn, cánh tay hạ xuống từ từ trước phách chuyển, không hạ trong một nhịp.",
        "Giữ vĩ vuông góc dây Mi; vĩ nghiêng dễ tạo tiếng rít."
      ],
      "mistakes": [
        "Còn nguyên sức nặng của dây La khi sang dây Mi → tiếng gắt, đôi khi rít.",
        "Hạ khuỷu quá nhanh ngay từ đầu nốt La → vĩ chạm dây Mi khi La chưa hết, nghe lẫn hai dây."
      ],
      "feel": "Chuyển động như lướt nhẹ xuống mặt cong của ngựa đàn. La và Mi đứng cạnh nhau tự nhiên.",
      "selfCheck": [
        "Khuỷu tay ở đúng mức dây Mi sau khi chuyển.",
        "Cổ tay mềm, không gập cứng về phía ngón cái."
      ],
      "fixes": {
        "cross_gap": "Hở tiếng khi sang dây Mi thường do khuỷu tay hạ trễ nên vĩ phải nhấc. Hạ dần trong phách 2 để ngay trước phách 3 vĩ đã sát dây Mi, và luôn nghĩ tới việc “chạm” dây Mi trước khi “rời” dây La.",
        "cross_noise": "Sang dây Mi mà lạo xạo là còn lực của dây La. Giảm nhẹ sức nặng ngón trỏ đúng lúc chạm dây Mi và đừng nghiêng vĩ về phía cần đàn."
      }
    },
    "11": {
      "goal": "Sol sang Rê trong một vĩ ở nhịp 58, tiếng trầm dày không bị trống ở chỗ chuyển.",
      "steps": [
        "Nâng khuỷu tay lên mức dây Sol. Kéo thử Sol, rồi hạ khuỷu nhẹ sang Rê, nghe vĩ giữ được tiếng.",
        "Dây Sol nặng. Trước phách 3, hạ khuỷu tay dần về mức dây Rê thay vì thả rơi.",
        "Bật metronome 58. Mỗi vĩ gồm Sol hai phách rồi Rê hai phách, chuyển ở phách 3. Cánh tay đi xuống từ dây thấp tới dây cao nên nhẹ dần.",
        "Bấm Bắt đầu, 4 vĩ liền. Nghe xem Rê có lên tiếng ngay không hay bị trễ."
      ],
      "tips": [
        "Sang dây cao từ dây Sol thì cánh tay đi xuống một chút, cứ như thả trọng lượng dần.",
        "Giữ cổ tay hơi cao và mềm để vĩ không đập dây Rê.",
        "Đừng để vĩ trượt sang cần đàn trong lúc đổi: giữ điểm tiếp xúc cố định."
      ],
      "mistakes": [
        "Vĩ rời dây Sol bằng cú nhấc → nốt Rê lên trễ, nghe một khoảng trống nhỏ.",
        "Còn quá nhiều sức nặng kiểu dây Sol khi đã sang dây Rê → tiếng nặng nề, to hơn đoạn trước."
      ],
      "feel": "Sức nặng của cánh tay lăn từ dây trầm sang dây cao như nước chảy xuống bậc nhỏ. Tiếng chuyển từ dày sang sáng một cách tự nhiên.",
      "selfCheck": [
        "Khuỷu tay ở đúng mức dây Sol khi bắt đầu, và hạ xuống mức dây Rê sau chuyển.",
        "Vĩ vẫn ở giữa vĩ, không trôi về gốc."
      ],
      "fixes": {
        "cross_noise": "Tiếng tạp khi sang Rê từ dây Sol thường là vĩ đập hoặc quệt dây La. Chuyển bằng cổ tay mềm, hạ khuỷu từ từ và giảm lực nhẹ lúc chạm dây Rê.",
        "cross_gap": "Dây Sol nặng nên vĩ dễ bị nhấc khi chuyển. Giữ sức nặng cánh tay chìm vào dây tới sát điểm chuyển, hạ khuỷu từ sớm và để tay dẫn vĩ “lăn” sang dây Rê.",
        "cross_dip": "Khi sang Rê, tiếng nhẹ hẳn đi vì bạn nhả lực. Giữ nguyên sức nặng suốt đường chuyển rồi mới giảm theo ý."
      }
    },
    "12": {
      "goal": "Chuyển dây đúng lúc đổi vĩ giữa Rê và La, hai việc xảy ra cùng lúc mà tiếng vẫn liền.",
      "steps": [
        "Mỗi vĩ ở level này chỉ có một nốt (2 phách). Chuyển dây và đổi chiều vĩ rơi vào cùng một khoảnh khắc: đó là điểm khó.",
        "Tập riêng không metronome: kéo Rê vĩ xuống, đổi chiều và sang La bằng vĩ lên. Làm chậm, chú ý khuỷu tay đi trước, cổ tay đảo chiều sau.",
        "Bật metronome 60. Mỗi vĩ 2 phách: Rê, đổi vĩ rồi La, đổi vĩ rồi Rê, và cứ vậy.",
        "Bấm Bắt đầu, 4 vòng. Soát số hở tiếng: ở đây hở tiếng có thể do đổi vĩ hoặc do chuyển dây; ngưỡng của level đã nới cho việc đó."
      ],
      "tips": [
        "Để khuỷu tay dẫn: nó đến mặt phẳng dây mới trước, rồi vĩ mới đảo chiều.",
        "Giữ một dòng tốc độ vĩ liên tục. Đảo chiều là đảo chiều của tốc độ, không phải dừng."
      ],
      "mistakes": [
        "Làm hai việc cùng lúc bằng hai động tác tách rời → nghe một ngắt quãng ngắn ở chính phách.",
        "Đổi vĩ xong mới sang dây → vĩ đang chạy trên dây cũ thêm một nhịp, nốt mới vào trễ."
      ],
      "feel": "Chuyển động một mạch như chiếc quạt gió: cánh tay xoay nhẹ, vĩ đổi chiều và sang dây trong một đường cong liền.",
      "selfCheck": [
        "Khuỷu tay chuẩn bị trước phách, không giật ngay trên phách.",
        "Vĩ ở giữa vĩ mỗi lần đổi, không lệch về gốc hoặc ngọn."
      ],
      "fixes": {
        "cross_gap": "Khi chuyển dây trùng đổi vĩ, hở tiếng là điều dễ xảy ra. Đưa khuỷu tay tới mặt phẳng dây mới sớm hơn một chút, rồi để các ngón tay phải đảo chiều trên đường cong đó.",
        "cross_noise": "Tạp tiếng do vĩ đập xuống dây mới ngay lúc đảo chiều. Đảo chiều bằng ngón tay và cổ tay, không giật cánh tay, và giữ sức nặng mềm tới khi đã nằm trên dây mới."
      }
    },
    "13": {
      "goal": "Chuyển dây đúng lúc đổi vĩ giữa La và Mi, dây Mi sáng không bị gắt.",
      "steps": [
        "Mỗi vĩ 2 phách có một nốt: La rồi Mi, cứ xen kẽ. Mỗi lần đổi vĩ đều kèm chuyển dây.",
        "Tập chậm không metronome: vĩ xuống trên La, vĩ lên trên Mi. Hạ khuỷu tay xuống mức dây Mi trong khi vĩ đang đi hết nốt La.",
        "Lúc chạm dây Mi, giảm nhẹ lực rồi để tốc độ vĩ đi nuôi tiếng.",
        "Bấm Bắt đầu ở nhịp 60, 4 vòng. Nghe tiếng tạp: nếu có tiếng rít ngay sau điểm đổi, giảm lực."
      ],
      "tips": [
        "Sang Mi bằng vĩ lên và về La bằng vĩ xuống: hai chiều cảm giác khác nhau, nên tập riêng mỗi chiều vài lần.",
        "Cổ tay mềm như đang lau bảng, chỉ vẽ một cung nhỏ."
      ],
      "mistakes": [
        "Đổi vĩ xong mới bắt đầu hạ khuỷu → nốt Mi lên trễ và có đoạn đầu không cao độ.",
        "Gồng vai khi sang dây Mi → vĩ run, tiếng lạo xạo."
      ],
      "feel": "Nhẹ như một cái lướt: cánh tay hạ xuống mà tiếng nhẹ đi theo cách tự nhiên chứ không rơi.",
      "selfCheck": [
        "Khuỷu tay không giữ cứng; nó đi theo mức của từng dây.",
        "Vĩ vuông góc dây Mi, điểm tiếp xúc ổn định."
      ],
      "fixes": {
        "cross_gap": "Khi sang Mi trong lúc đổi vĩ, hở tiếng thường do khuỷu tay chưa tới nơi. Bắt đầu hạ khuỷu từ nửa sau của nốt La để lúc đổi vĩ vĩ đã gần mặt phẳng dây Mi.",
        "cross_noise": "Rít hoặc lạo xạo ở dây Mi nghĩa là lực quá lớn lúc chạm dây. Giảm sức nặng ngay lúc đảo chiều và để tốc độ vĩ nuôi tiếng."
      }
    },
    "14": {
      "goal": "Bập bênh Rê và La mỗi phách, bốn nốt luyến trong một vĩ, tiếng liền như một nốt trượt qua lại giữa hai dây.",
      "steps": [
        "Kéo thật chậm không metronome trước: Rê rồi La rồi Rê rồi La, trong một vĩ. Quan sát khuỷu tay đưa lên xuống nhẹ nhàng giữa hai mức dây.",
        "Mỗi lần chuyển, chỉ cần di chuyển bằng góc nhỏ của cẳng tay và cổ tay; vai và khuỷu tay chỉ lướt theo.",
        "Bật metronome 60, mỗi phách một nốt. Giữ tốc độ vĩ đều, vì bốn nốt chia chung một vĩ nên không được giật.",
        "Bấm Bắt đầu, 3 vòng. Xem phiếu: chuyển dây ba lần mỗi vĩ nên số sự kiện nhiều, một hai lần hở không sao."
      ],
      "tips": [
        "Hình dung đường đi của vĩ là chữ “V” nông: xuống sang La, lên về Rê, lướt trên hai mức.",
        "Dây La nhẹ hơn nên có thể kéo cổ tay hơi cao để nghe đều hơn.",
        "Tập riêng nửa vòng: chỉ Rê La, rồi dừng; sau đó ghép nửa còn lại."
      ],
      "mistakes": [
        "Cánh tay dao động nhiều hơn cần thiết → bập bênh quá lớn, vĩ chạm cả hai dây cùng lúc quá lâu.",
        "Chậm vĩ ở mỗi lần chuyển → tiếng đầy khi kéo trên dây, nhẹ đi khi sang dây."
      ],
      "feel": "Như tay đang đung đưa một chiếc võng. Mỗi nốt nối nốt kế bằng một chuyển động tròn, không có góc cạnh.",
      "selfCheck": [
        "Chuyển động chủ yếu ở cẳng tay và cổ tay, khuỷu tay chỉ lướt nhẹ.",
        "Mỗi nốt dài bằng nhau, bạn không vội ở cuối vĩ."
      ],
      "fixes": {
        "cross_gap": "Bập bênh nhanh dễ làm vĩ nhấc rời dây. Giảm biên độ: thu nhỏ chuyển động, để lông vĩ lướt xuống mặt cong của ngựa đàn, luôn chạm ít nhất một dây.",
        "cross_noise": "Tạp tiếng khi bập bênh Rê và La thường là vĩ quệt dây Sol hoặc Mi. Giữ chuyển động tròn nhỏ ở cổ tay, khuỷu tay chỉ lướt nhẹ.",
        "cross_slow": "Nốt mới lên trễ vì chuyển động còn lớn. Rút gọn đường đi: khuỷu tay dừng ở giữa hai mức dây, chỉ cổ tay và ngón tay làm phần còn lại."
      }
    },
    "15": {
      "goal": "Bập bênh La và Mi mỗi phách, bốn nốt luyến trong một vĩ, dây Mi không rít khi quay lại.",
      "steps": [
        "Kéo chậm: La rồi Mi rồi La rồi Mi, tất cả trong một vĩ. Chỉ nghe sự đều đặn, chưa cần metronome.",
        "Khi về lại La, đừng để nốt La nặng hơn nốt Mi quá nhiều: dây Mi cần ít sức nặng hơn dây La một chút, còn tốc độ vĩ giữ nguyên.",
        "Mở metronome 60, mỗi tiếng tích một nốt. Giữ cánh tay gần như một khối, cổ tay lướt giữa hai dây.",
        "Bấm Bắt đầu, 3 vòng. Nếu tiếng tạp nhiều ở chỗ về La, nghĩ đến góc vĩ."
      ],
      "tips": [
        "Dây La và Mi ở gần nhau; bạn chỉ cần xoay cổ tay vài độ, không cần khuỷu tay nhiều.",
        "Đổi sang dây Mi bằng đầu ngón trỏ lăn nhẹ, cảm giác như lăn viên bi qua mặt cong."
      ],
      "mistakes": [
        "Về La mà còn nghiêng vĩ như đang ở dây Mi → tiếng đục, vĩ chạm cả dây Mi.",
        "Siết ngón cái phải khi tốc độ chuyển tăng → cổ tay cứng, bập bênh giật."
      ],
      "feel": "Chuyển động tròn và gọn. Hai dây như hai bậc nhỏ của cùng một nốt dài.",
      "selfCheck": [
        "Cổ tay và ngón cái phải mềm suốt lượt tập.",
        "Vĩ không nhấc lên khỏi hai dây, chỉ lướt giữa chúng."
      ],
      "fixes": {
        "cross_noise": "Khi bập bênh La và Mi mà có tiếng tạp, vĩ có thể quệt dây Rê lúc quay về La. Giữ vĩ gần trục của hai dây này, chuyển động tròn nhỏ ở cổ tay và đừng đưa khuỷu xuống quá sâu.",
        "cross_gap": "Hở tiếng nghĩa là vĩ rời cả hai dây một thoáng. Thu nhỏ biên độ cánh tay, giữ sức nặng liên tục và để lông vĩ lăn qua điểm giữa hai dây."
      }
    },
    "16": {
      "goal": "Ba dây Sol, Rê, La, Rê trong một vĩ: hai chiều chuyển dây (lên và xuống) đều mượt như nhau.",
      "steps": [
        "Kéo chậm và chia phần: Sol sang Rê (lên dây), Rê sang La (lên), La về Rê (xuống). Nhìn cánh tay hạ rồi nâng nhẹ.",
        "Chuyển lên dây cao thì khuỷu tay hạ; chuyển về dây thấp thì khuỷu tay nâng. Đảm bảo hai chiều nhịp nhàng như nhau.",
        "Với metronome 60, mỗi nốt một phách, bốn phách một vĩ. Giữ sức nặng và tốc độ vĩ đều qua cả ba chỗ chuyển.",
        "Bấm Bắt đầu, 3 vòng. Chỗ nào có hở nhiều nhất? Thường là chuyển xuống, vì ta quen chuẩn bị chuyển lên."
      ],
      "tips": [
        "Chuyển xuống dây thấp thường khó hơn chuyển lên: nâng khuỷu sớm một chút, trước phách.",
        "Vĩ như đi trên một quả đồi nhỏ hình cung của ngựa đàn; hãy nghĩ đường cong đó chứ đừng nghĩ ba đường thẳng.",
        "Nghe cả nốt Sol: dây Sol cần sức nặng hơn dây La, điều chỉnh bằng cánh tay."
      ],
      "mistakes": [
        "Chuẩn bị tốt khi lên nhưng quên chuẩn bị khi xuống → nốt Rê cuối vĩ bị trễ hoặc tạp.",
        "Ba dây chuyển đều tay làm vĩ vẽ góc nhọn thay vì đường cong → tiếng gợn."
      ],
      "feel": "Cánh tay đi lên xuống như đang trượt trên một mặt dốc nhẹ. Cả ba nốt như một câu hát có dáng.",
      "selfCheck": [
        "Khuỷu tay thực sự đổi mức ở mỗi chỗ chuyển, không đứng im.",
        "Bạn kéo ở đoạn giữa cây vĩ suốt cả lượt."
      ],
      "fixes": {
        "cross_noise": "Tạp tiếng ở bài ba dây thường do chuyển xuống quá vội và quệt dây bên cạnh. Nâng khuỷu tay vừa đủ, giữ vĩ vuông góc dây và tốc độ vĩ đều.",
        "cross_gap": "Ở bài ba dây, hở thường nằm ở chiều xuống. Nâng khuỷu tay sớm một chút trước phách, để vĩ chạm dây thấp trước khi rời dây cao.",
        "cross_slow": "Nốt mới lên chậm vì bạn bắt đầu di chuyển cánh tay đúng phách. Chuyển sang chuẩn bị trước phách: cánh tay tới gần dây mới, còn lại là chuyển động nhỏ của cổ tay."
      }
    },
    "17": {
      "goal": "Bốn dây đi lên rồi đi xuống trong hai vĩ: từ Sol lên Mi, và từ Mi về Sol, không một chỗ nào bị gãy.",
      "steps": [
        "Hình dung đường đi: vĩ xuống đi Sol, Rê, La, Mi (khuỷu tay hạ từng bậc); vĩ lên đi Mi, La, Rê, Sol (khuỷu tay nâng từng bậc). Kéo từng chiều thật chậm.",
        "Hai nốt Mi liền nhau (phách 4 và 5) rơi đúng chỗ đổi vĩ. Chỗ này không phải chuyển dây, chỉ là đổi vĩ trên dây Mi.",
        "Chạy metronome 60, một nốt mỗi phách, trọn vĩ ở mỗi chiều. Giữ tốc độ vĩ không đổi.",
        "Bấm Bắt đầu, 2 vòng. Soát từng chỗ chuyển ở phiếu: đây là bài tập cuối của vòng này trước phần kiểm tra."
      ],
      "tips": [
        "Hãy để cánh tay làm “tay vịn” cho vĩ: nó đi lên xuống từng bậc, bạn không phải nghĩ nhiều.",
        "Dùng trọn vĩ nhưng chia đều: mỗi nốt một phần tư chiều dài vĩ.",
        "Dây Mi sáng và nhẹ, dây Sol nặng: đừng để lực của cánh tay không đổi khi đi hết bốn dây."
      ],
      "mistakes": [
        "Đi lên thì mượt nhưng về lại nhảy cóc → nghe tiếng giật ở chuyển xuống.",
        "Quên đổi vĩ ở nốt Mi lặp lại → đổi vĩ vụng, hở nhẹ."
      ],
      "feel": "Như đang chạy ngón tay trên dây đàn hạc: mỗi dây một bậc nhỏ nối liền với bậc sau.",
      "selfCheck": [
        "Khuỷu tay đổi mức đều đặn qua cả bốn dây.",
        "Vĩ ở trọn vĩ, từ gốc tới ngọn, không co về giữa."
      ],
      "fixes": {
        "cross_gap": "Với bốn dây, nhớ rằng mỗi chỗ chuyển đều cần lông vĩ chạm hai dây một thoáng. Chuẩn bị mức khuỷu tay trước phách mỗi lần, đừng chờ chạm phách mới hạ hoặc nâng.",
        "cross_noise": "Tạp tiếng khi đi xuống thường vì vĩ quệt dây bên cạnh. Nâng khuỷu tay vừa đủ, vĩ lướt trên mặt cong thay vì rơi xuống từng dây."
      }
    },
    "18": {
      "goal": "Kiểm tra vòng 2: bập bênh Rê và La nhanh ở nhịp 80, mỗi vĩ hai nốt, chuyển dây luân phiên giữa vĩ và đúng chỗ đổi vĩ.",
      "steps": [
        "Mỗi vĩ có hai nốt (một phách mỗi nốt). Chỗ chuyển giữa vĩ và chỗ chuyển đúng lúc đổi vĩ luân phiên nhau: tập riêng từng loại trước.",
        "Kéo chậm ở nhịp 60 cho thuộc, rồi tăng 70, rồi 80. Nhịp tăng thì biên độ chuyển động phải giảm tương ứng.",
        "Giữ cổ tay mềm, đổi chiều bằng ngón tay phải. Cánh tay chỉ làm một vòng cung rất nhỏ.",
        "Bấm Bắt đầu ở nhịp 80, 6 vòng. Ngưỡng ở bài kiểm tra chặt hơn: hở và tạp phải thấp ở cả hai loại chuyển."
      ],
      "tips": [
        "Ở nhịp nhanh không có thời gian nhấc vĩ: giữ lông vĩ luôn sát mặt dây, gần cả hai dây hơn bình thường.",
        "Đếm “một và hai và”: nốt đổi đúng trên phách, còn tiếng “và” là lúc khuỷu tay và cổ tay chuẩn bị cho dây kế tiếp."
      ],
      "mistakes": [
        "Chuyển động quá lớn ở nhịp nhanh → cánh tay trễ nhịp, nốt mới lên chậm.",
        "Căng ngón cái phải để theo kịp nhịp → vĩ khựng ở chính điểm đổi."
      ],
      "feel": "Cổ tay nhẹ như lò xo. Âm thanh chạy qua hai dây như một dải đều, không có chỗ nào nhô ra.",
      "selfCheck": [
        "Cánh tay gần như đứng yên, chỉ cẳng tay và cổ tay làm việc.",
        "Vĩ ở phần giữa vĩ, không bị trôi theo nhịp nhanh."
      ],
      "fixes": {
        "cross_noise": "Ở nhịp 80, tạp tiếng thường do quệt dây. Giữ cổ tay mềm, biên độ nhỏ và đừng gồng ngón cái khi tăng nhịp.",
        "cross_slow": "Ở nhịp 80, nốt mới lên chậm vì chuyển động còn to. Thu nhỏ đường đi của khuỷu tay, để cổ tay làm gần hết phần chuyển.",
        "cross_gap": "Hở tiếng ở nhịp nhanh nghĩa là vĩ nhấc khỏi dây. Giữ vĩ sát dây, giảm biên độ, và không đợi phách mới bắt đầu chuyển."
      }
    },
    "19": {
      "goal": "Đổi từ Rê buông lên Mi (ngón 1) trong một vĩ, tiếng liền và Mi đúng cao độ ngay lúc tới.",
      "steps": [
        "Đặt ngón 1 lên dây Rê, nốt Mi (E4), kiểm bằng cách so với dây Mi buông (cao hơn đúng một quãng tám) nếu cần. Nhấc ngón, kéo Rê buông, đặt ngón lại để quen khoảng cách.",
        "Kéo Rê buông hai phách, rồi đặt ngón 1 xuống dứt khoát để ra Mi hai phách tiếp theo. Vĩ không được khựng.",
        "Bật metronome 60. Mỗi vĩ gồm Rê hai phách rồi Mi hai phách, đổi nốt ở phách 3.",
        "Bấm Bắt đầu, 4 vĩ liền. Soát phiếu: hở tiếng khi đổi nốt, tiếng tạp, và Mi có đúng cao độ ngay từ lúc vừa tới."
      ],
      "tips": [
        "Đặt đầu ngón xuống bằng cú gõ nhẹ, không miết. Đầu ngón cong, khớp đầu ngón mềm.",
        "Nghĩ trước nốt Mi trong đầu một khoảnh khắc trước khi đặt ngón: tay trái đi theo tai.",
        "Tay phải cứ chạy như đang kéo một nốt dài, tay trái đổi bên dưới."
      ],
      "mistakes": [
        "Đặt ngón xuống chậm và trượt tìm nốt → nghe tiếng trượt, cao độ lúc vừa tới sai.",
        "Tay phải ngập ngừng đúng lúc tay trái đổi → hở tiếng, nghe thấy khựng."
      ],
      "feel": "Tay phải trôi đều, tay trái như chạm nhẹ vào dây rồi nốt Mi xuất hiện, không có cú hẫng nào.",
      "selfCheck": [
        "Ngón 1 đặt bằng đầu ngón, cong tròn, không đổ về phía cần đàn.",
        "Ngón cái trái thả lỏng, không bóp cần đàn."
      ],
      "fixes": {
        "join_gap": "Hở tiếng khi lên Mi nghĩa là vĩ chậm theo ngón tay. Tập kéo Rê buông dài và chỉ đếm trong đầu điểm đổi nốt, rồi mới thêm tay trái, vĩ không đổi tốc độ.",
        "pitch_arrive": "Mi vừa tới đã lệch là bạn đang trượt tìm nốt. Đặt ngón xuống thẳng vào vị trí đã nghĩ sẵn, kiểm bằng cách so với dây Mi buông (cách một quãng tám), và tập chậm đặt ngón không kèm vĩ."
      }
    },
    "20": {
      "goal": "Ngón 1 lên ngón 2 trên dây La (Si rồi Đô thăng), nốt đổi liền, hai nốt đúng cao độ.",
      "steps": [
        "Đặt ngón 1 trên dây La: nốt Si (B4). Rồi để ngón 1 nguyên, thả ngón 2 xuống thành Đô thăng (C#5), ngón 2 sát ngón 3 chưa bấm.",
        "Tập không vĩ: nhấc nhẹ ngón 2 và đặt lại. Kiểm Si bằng dây Mi buông (quãng 4 đúng, nghe trong và không gợn), rồi đo khoảng cách một cung lên tới Đô thăng.",
        "Bật metronome 60. Mỗi vĩ gồm Si hai phách rồi Đô thăng hai phách. Đổi nốt đúng ở phách 3.",
        "Bấm Bắt đầu, 4 vĩ liền. Nếu cao độ lúc vừa tới sai, chậm lại và đặt ngón chính xác trước."
      ],
      "tips": [
        "Giữ ngón 1 xuống khi ngón 2 đặt (vì ngón 1 nằm dưới): đây là “bàn tay hình khung”.",
        "Khoảng cách hai ngón là một cung (cách nhau cả cung): đừng để hai ngón dính khít nhau."
      ],
      "mistakes": [
        "Nhấc ngón 1 khi đặt ngón 2 → bàn tay mất khung, lúc quay về Si phải tìm lại chỗ nên cao độ kém ổn định.",
        "Ngón 2 đặt quá thấp (gần ngón 1) → Đô thăng bị thấp, đo ra lệch cents."
      ],
      "feel": "Hai ngón như đi hai bước nhỏ trên cần đàn. Tiếng đổi nốt nhẹ, không nghe thấy tiếng tay.",
      "selfCheck": [
        "Ngón 1 vẫn nằm trên dây trong khi ngón 2 đặt xuống.",
        "Cổ tay trái không ép về phía cần đàn."
      ],
      "fixes": {
        "join_slow": "Nghe trượt là ngón đặt hoặc nhấc chậm. Đặt ngón 2 xuống như một cú gõ ngắn và dứt khoát, nhấc gọn không miết dọc dây.",
        "pitch_off": "Đô thăng lệch thường do ngón 2 đặt sai chỗ. Kiểm bằng cách kéo cùng dây Mi buông bên cạnh (quãng 3 thứ, nghe êm), rồi nhớ khoảng cách một cung giữa ngón 1 và ngón 2."
      }
    },
    "21": {
      "goal": "Đi xuống ngón 3, 2, 1 trên dây Rê (Sol, Fa thăng, Mi) trong một vĩ, mỗi lần nhấc ngón là một bước liền.",
      "steps": [
        "Đặt cả ba ngón xuống dây Rê cùng lúc: Sol (ngón 3), Fa thăng (ngón 2), Mi (ngón 1). Kéo Sol rồi lần lượt nhấc từng ngón khi đi xuống.",
        "Đi xuống bằng cách nhấc ngón: nhấc ngón 3 ra Fa thăng, nhấc ngón 2 ra Mi. Đừng nhấc quá cao.",
        "Bật metronome 60. Sol hai phách, rồi Fa thăng một phách, rồi Mi một phách. Một vòng đủ bốn phách trong một vĩ.",
        "Bấm Bắt đầu, 3 vòng. Đây là chiều xuống nên chú ý áp lực vĩ không đổi lúc nhấc ngón."
      ],
      "tips": [
        "Khi nhấc ngón 3 thì ngón 2 và ngón 1 đã nằm sẵn trên dây; chỉ cần nhấc gọn.",
        "Ngón bấm chỉ cần đủ chắc để dây chạm cần đàn và tiếng trong. Ép mạnh hơn mức đó chỉ làm tay cứng."
      ],
      "mistakes": [
        "Nhấc ngón cao quá → ngón rơi xuống chậm khi quay lại, dễ lệch.",
        "Tay phải nhả lực mỗi lần nhấc ngón → tiếng sụt theo nhịp nhấc."
      ],
      "feel": "Mỗi lần nhấc ngón là một bước xuống nhỏ nhẹ. Tiếng đi xuống như thang cuốn mềm.",
      "selfCheck": [
        "Ngón nhấc rồi vẫn hờ trên dây, chỉ cách một chút.",
        "Khớp đầu ngón vẫn cong, ngón cái không bóp."
      ],
      "fixes": {
        "join_dip": "Tiếng sụt mỗi lần nhấc ngón nghĩa là tay phải nhả lực theo. Tách hai tay: giữ sức nặng vĩ và tốc độ không đổi, chỉ tay trái làm việc.",
        "join_noise": "Tạp tiếng khi nhấc ngón là ngón nhấc chạm dây bên cạnh hoặc nhấc không gọn. Nhấc thẳng lên, không kéo ngang, và giữ vĩ đều."
      }
    },
    "22": {
      "goal": "Đổi nốt đúng lúc đổi vĩ: Mi rồi Fa thăng trên dây Rê, hai việc cùng lúc mà tiếng liền.",
      "steps": [
        "Mỗi vĩ 2 phách chỉ có một nốt, nên đổi nốt luôn trùng đổi vĩ. Tập riêng: ngón 1 xuống Mi vĩ xuống, rồi ngón 2 đặt cho Fa thăng ngay lúc vĩ lên.",
        "Ngón 2 chờ sẵn sát trên dây, ngay trên chỗ của Fa thăng. Đúng lúc vĩ đảo chiều thì ngón rơi xuống. Cùng dây nên ngón chạm dây lúc nào là nốt đổi lúc đó: đặt sớm sẽ thành đổi nốt sớm hơn phách.",
        "Bật metronome 60. Mi hai phách (một vĩ), Fa thăng hai phách (vĩ kế tiếp).",
        "Bấm Bắt đầu, 4 vĩ liền. Soát hai thứ: hở tiếng khi đổi nốt và đổi vĩ, và cao độ Fa thăng lúc vừa tới."
      ],
      "tips": [
        "Chuẩn bị là đưa ngón tới sát dây từ trước. Còn đặt xuống thì đúng phách, cùng lúc với vĩ.",
        "Nếu phải lệch thì ngón tới trước một thoáng rất ngắn còn hơn tới sau: ngón trễ thì nhát vĩ mới kéo ra nốt cũ, nghe thành trượt."
      ],
      "mistakes": [
        "Ngón đặt sau khi vĩ đã đảo → đầu nhát vĩ mới còn là Mi rồi mới nhảy lên Fa thăng, nghe như trượt.",
        "Nhấc vĩ nhẹ để đỡ lo chuyện hai tay → hở tiếng rõ ngay phách."
      ],
      "feel": "Hai tay đổi cùng lúc nhưng nghe như một cử động. Âm thanh bước sang nốt mới không có khe.",
      "selfCheck": [
        "Ngón 2 đã chờ sát trên dây trước phách và rơi xuống đúng phách.",
        "Vĩ ở giữa vĩ mỗi lần đổi."
      ],
      "fixes": {
        "join_gap": "Đổi nốt trùng đổi vĩ dễ khựng. Ngón mới chờ sẵn sát dây, rơi xuống đúng lúc tay phải đảo chiều bằng ngón tay, tốc độ vĩ giữ ổn định.",
        "timing_late": "Đổi trễ nghĩa là bạn bắt đầu chuẩn bị đúng phách. Chuẩn bị ngón và khuỷu tay ngay trước phách, để đúng phách chỉ việc đổi."
      }
    },
    "23": {
      "goal": "Bốn nốt Rê, Mi, Fa thăng, Sol trong một vĩ, mỗi nốt một phách: bốn nốt sạch như bốn bậc thang.",
      "steps": [
        "Thế tay trái: ngón 1 ở Mi, ngón 2 ở Fa thăng, ngón 3 ở Sol (ngón 2 và 3 sát nhau). Kiểm Mi bằng dây Mi buông và Sol bằng dây Sol buông: mỗi cặp cách nhau đúng một quãng tám, nghe phải hòa vào nhau.",
        "Kéo Rê buông rồi đặt dần từng ngón, giữ ngón cũ xuống để cả bàn tay đứng yên khi đi lên.",
        "Đặt metronome 60, mỗi nốt một phách, dùng trọn vĩ cho cả bốn nốt. Chia đều chiều dài vĩ cho từng nốt.",
        "Bấm Bắt đầu, 3 vòng. Soát từng chỗ đổi nốt. Nếu một chỗ liên tục hở, tập riêng cặp nốt đó."
      ],
      "tips": [
        "Đặt ngón theo thứ tự rồi để chúng ở lại: bàn tay thành một khung ổn định.",
        "Mỗi lần đặt ngón là một lần gõ nhẹ, không tăng lực vĩ lúc đó.",
        "Nếu nốt thứ tư ngắn hơn, bạn đang chia vĩ chưa đều: để dành vĩ nhiều hơn cho phách 4."
      ],
      "mistakes": [
        "Dùng hết vĩ ở hai nốt đầu → hai nốt sau thiếu vĩ, tiếng nhỏ dần.",
        "Cuống ở nốt Sol (ngón 3) → cao độ thấp, đo ra lệch."
      ],
      "feel": "Mỗi nốt như một bậc thang thấp. Tay phải đi đều, bốn nốt cùng nặng như nhau.",
      "selfCheck": [
        "Ngón 1, 2, 3 ở yên trên dây khi đi lên, không nhấc.",
        "Vĩ dùng trọn vĩ, mỗi phách đúng một phần tư."
      ],
      "fixes": {
        "even_range": "Tiếng to nhỏ lệch trong một nốt là chia vĩ chưa đều. Dùng đúng một phần tư chiều dài vĩ cho mỗi phách và giữ sức nặng không đổi.",
        "join_slow": "Nghe trượt giữa các nốt: đặt ngón dứt khoát bằng đầu ngón, không kéo ngón dọc dây."
      }
    },
    "24": {
      "goal": "Ngón 3 và ngón 4 trên dây La (Rê và Mi), đổi liền, ngón 4 đúng cao độ.",
      "steps": [
        "Ngón 3 cho Rê (D5) và ngón 4 cho Mi (E5). Ngón 4 nhỏ và yếu nên hãy đặt cho cong và đứng bằng đầu ngón. Kiểm Mi với dây Mi buông.",
        "Tập không vĩ: đặt ngón 3, rồi đặt thêm ngón 4 trong khi ngón 3 ở yên, thả lỏng cổ tay.",
        "Bật metronome 60. Rê hai phách, rồi Mi hai phách trong một vĩ, đổi ở phách 3.",
        "Bấm Bắt đầu, 4 vĩ liền. Kiểm cao độ Mi và nghe xem tiếng có đều hai nốt không."
      ],
      "tips": [
        "Đưa khuỷu tay trái vào trong một chút (về phía dưới thân đàn) để ngón út vươn tới dễ hơn.",
        "Ngón 4 bấm bằng chóp ngón, đừng bằng phần mềm."
      ],
      "mistakes": [
        "Ngón 4 sụp xuống (khớp đầu ngón lõm) → Mi thấp và tiếng đục.",
        "Siết ngón cái để giữ ngón 4 → cả bàn tay căng, đổi nốt giật."
      ],
      "feel": "Ngón út gọn và khỏe như các ngón khác. Cú đổi nốt nhẹ, không có cố gắng lộ ra ngoài.",
      "selfCheck": [
        "Ngón 4 cong, đứng bằng đầu ngón.",
        "Cổ tay trái không chùng xuống về cần đàn."
      ],
      "fixes": {
        "pitch_off": "Mi bị lệch: kiểm với dây Mi buông, và tập đặt ngón 4 không vĩ nhiều lần. Ngón út ngắn nên có thể cần đưa khuỷu tay trái vào trong một chút cho đủ tầm.",
        "join_gap": "Hở tiếng ở nốt ngón 4 là tay phải ngập ngừng đợi ngón út tới. Tin vào tay trái, cứ kéo đều."
      }
    },
    "25": {
      "goal": "Kiểm tra vòng 3: năm nốt lên rồi xuống trên dây Rê ở nhịp 72, mọi chỗ đổi nốt đều liền và đúng cao độ.",
      "steps": [
        "Nốt: Rê, Mi, Fa thăng, Sol, La (ngón 4), rồi Sol, Fa thăng, Mi. Tám nốt chia hai vĩ: bốn nốt lên rồi bốn nốt xuống.",
        "Chỗ đổi vĩ rơi giữa Sol và La (lên) và giữa Mi và Rê (xuống), cùng lúc đổi nốt: đã tập ở M22.",
        "Tập chậm ở nhịp 54 để thuộc ngón tay, rồi tăng dần tới 72. Giữ bàn tay đứng yên như một khung.",
        "Bấm Bắt đầu, 2 vòng. Kiểm tra vòng nên ngưỡng chặt hơn: nhìn cả hở tiếng và cao độ."
      ],
      "tips": [
        "Chiều xuống, nhấc từng ngón nhẹ nhàng từ trên xuống: Sol, Fa thăng, Mi.",
        "Nghĩ tới câu nhạc đi lên rồi xuống như đường cong của một con sóng.",
        "Nhịp nhanh hơn thì vĩ cũng đi nhanh hơn: giảm chút sức nặng để tiếng không gắt, vẫn dùng trọn vĩ."
      ],
      "mistakes": [
        "Nhịp tăng nên các ngón nhấc cao → nốt lệch và tiếng gồ ghề.",
        "Mất đều âm lượng ở chỗ đổi vĩ vì bạn nghĩ nhiều về ngón → sụt dB ở phách 5."
      ],
      "feel": "Tay trái nhẹ như đang gõ phím, tay phải trải rộng. Cả đoạn nghe như một dòng nước.",
      "selfCheck": [
        "Ngón không nhấc cao hơn một khoảng nhỏ trên dây.",
        "Vĩ dùng trọn chiều dài ở mỗi chiều."
      ],
      "fixes": {
        "join_gap": "Ở đoạn nhanh, hở tiếng thường rơi vào điểm đổi vĩ trùng đổi nốt. Ngón mới chờ sẵn sát dây và rơi đúng phách, tay phải đổi chiều bằng ngón tay, đừng để vĩ khựng.",
        "pitch_arrive": "Vừa tới nốt đã lệch: bàn tay chưa ổn định. Tập chậm đúng thế tay, rồi tăng nhịp dần."
      }
    },
    "26": {
      "goal": "Ngón 1 dây Rê (Mi) sang La buông trong một vĩ, chuyển dây và đổi nốt cùng lúc mà tiếng liền.",
      "steps": [
        "Mỗi chỗ chuyển ở đây có hai việc: tay phải sang dây La, tay trái nhấc ngón 1. Tập riêng từng việc trước.",
        "Tay phải chuẩn bị mức dây La trước phách 3. Tay trái giữ ngón 1 tới sát lúc vĩ chạm dây La rồi mới nhấc.",
        "Bật metronome 60. Mi (ngón 1, dây Rê) hai phách, La buông hai phách, mỗi vĩ như vậy.",
        "Bấm Bắt đầu, 4 vĩ liền. Soát hở tiếng và tiếng tạp: nhấc ngón sớm có thể làm dây Rê kêu bậy."
      ],
      "tips": [
        "Đặt ngón 1 lại ngay khi về dây Rê, đúng chỗ nhớ sẵn trong đầu.",
        "Nhấc ngón 1 thật gọn như quạt một cánh nhỏ, đừng kéo sang bên.",
        "Khi sang dây La, nghe nốt Mi tắt rồi La lên, nên chuyển là nhẹ, không giật."
      ],
      "mistakes": [
        "Nhấc ngón 1 trước khi vĩ rời dây Rê → dây Rê rung thành nốt buông, nghe có tiếng lạ.",
        "Tay trái đổi nhanh nhưng tay phải trễ → nốt La lên chậm, hở tiếng."
      ],
      "feel": "Hai tay ăn khớp: tay phải rời dây khi tay trái vừa nhấc, giống một cú vẫy tay.",
      "selfCheck": [
        "Ngón 1 đặt bằng đầu ngón, không chạm dây La.",
        "Khuỷu tay phải chuẩn bị trước phách."
      ],
      "fixes": {
        "cross_gap": "Hở tiếng ở chuyển dây có ngón tay thường vì hai tay không cùng nhịp. Khuỷu tay phải tới mặt phẳng dây La trước phách, tay trái nhấc ngón đúng lúc lông vĩ chạm dây mới.",
        "cross_noise": "Tạp tiếng thường là ngón vừa nhấc làm dây Rê kêu buông, hoặc ngón chạm dây La. Nhấc ngón thẳng lên, và để vĩ sang dây La trước khi nhấc hẳn."
      }
    },
    "27": {
      "goal": "La buông sang Fa thăng (ngón 1 dây Mi), tiếng liền và Fa thăng đúng cao độ ngay lúc vừa tới.",
      "steps": [
        "Fa thăng cao (F#5) trên dây Mi, ngón 1. Kiểm bằng cách so với Fa thăng ngón 2 dây Rê, thấp hơn đúng một quãng tám: hai nốt phải hòa nhau.",
        "Đặt ngón 1 xuống dây Mi TRƯỚC khi vĩ sang dây Mi: ngón chờ sẵn trên dây khi vĩ còn ở dây La.",
        "Bật metronome 60. La buông hai phách, rồi Fa thăng hai phách. Chuyển dây ở phách 3.",
        "Bấm Bắt đầu, 4 vĩ liền. Soát cao độ lúc vừa tới: đây là chỗ hay hỏng nhất ở bài này."
      ],
      "tips": [
        "Đặt ngón sớm, vĩ tới sau: cao độ đã sẵn khi vĩ chạm dây.",
        "Dây Mi nhạy, nên khi sang dây Mi cần nhẹ lực để Fa thăng không gắt."
      ],
      "mistakes": [
        "Đặt ngón lúc vĩ đã tới → tiếng có đoạn đầu lệch rồi mới chỉnh.",
        "Quên sức nặng vĩ nhẹ hơn ở dây Mi → tiếng rít."
      ],
      "feel": "Ngón đã sẵn trên dây như một cái bàn chờ. Vĩ sang, nốt đúng ngay không cần tìm.",
      "selfCheck": [
        "Ngón 1 chạm dây Mi trước phách chuyển.",
        "Vai không nhún khi sang dây Mi."
      ],
      "fixes": {
        "cross_gap": "Hở tiếng khi sang dây Mi có ngón: khuỷu tay xuống mức dây Mi từ trước phách, ngón 1 đã chờ sẵn trên dây và vĩ chạm dây Mi trước khi rời dây La.",
        "pitch_arrive": "Fa thăng vừa tới đã lệch vì ngón đặt trễ. Đặt ngón 1 xuống dây Mi trước khi vĩ sang dây, nghĩ sẵn nốt trong đầu.",
        "cross_noise": "Tiếng tạp ở dây Mi thường do lực quá lớn lúc chạm dây. Giảm sức nặng ngay lúc sang dây Mi, giữ tốc độ vĩ đều."
      }
    },
    "28": {
      "goal": "Ngón 3 dây Rê (Sol) sang La buông, chuyển dây liền dù hai nốt cách nhau chỉ một cung.",
      "steps": [
        "Hai nốt gần nhau về cao độ (Sol rồi La) nhưng ở hai dây khác nhau. Tập riêng: kéo Sol bằng ngón 3 trên dây Rê, rồi nhấc ngón và sang dây La.",
        "Nhấc ngón 3 đúng lúc lông vĩ chạm dây La, không sớm hơn. Nhấc sớm thì dây Rê kêu buông.",
        "Bật metronome 60. Sol hai phách, La hai phách, chuyển dây ở phách 3.",
        "Bấm Bắt đầu, 4 vĩ liền. Nhìn phiếu: tiếng tạp có nghĩa là ngón nhấc không đúng lúc."
      ],
      "tips": [
        "Ngón 3 nhấc thẳng lên, không kéo sang phía dây La.",
        "Nghe nốt La buông tròn và đầy: đừng để nó nhỏ hơn nốt Sol."
      ],
      "mistakes": [
        "Nhấc ngón sớm trước khi vĩ rời dây Rê → Rê buông kêu lên một nhịp.",
        "Cẳng tay xoay quá nhiều khi chuyển → vĩ lệch khỏi điểm tiếp xúc."
      ],
      "feel": "Ngón nhấc và vĩ sang dây như cùng một nhịp thở. Không có khe nào giữa Sol và La.",
      "selfCheck": [
        "Ngón 3 nhấc thẳng, đầu ngón rời dây gọn.",
        "Vĩ không trôi khỏi điểm tiếp xúc khi sang dây La."
      ],
      "fixes": {
        "cross_noise": "Dây Rê kêu thêm khi bạn nhấc ngón sớm. Giữ ngón 3 cho tới khi lông vĩ đã chạm dây La, rồi mới nhấc gọn.",
        "cross_gap": "Hở tiếng khi sang La: chuẩn bị khuỷu tay trước phách và để lông vĩ chạm cả hai dây một thoáng trước khi nhấc ngón."
      }
    },
    "29": {
      "goal": "Ngón 3 sang dây buông ngay lúc đổi vĩ: Sol rồi La, chuyển dây, nhấc ngón và đổi vĩ cùng một khoảnh khắc.",
      "steps": [
        "Mỗi vĩ 2 phách có một nốt: Sol bằng vĩ xuống, rồi La bằng vĩ lên. Chuyển dây trùng đổi vĩ, nên ba việc xảy ra gần như đồng thời.",
        "Tập chậm: vĩ xuống hết Sol, trong khi ngón 3 còn ở trên dây. Khi vĩ sắp đảo, khuỷu tay tới mức dây La. Đảo chiều, nhấc ngón.",
        "Bật metronome 60. Hai phách một nốt, luân phiên Sol và La.",
        "Bấm Bắt đầu, 4 vòng. Nếu có hở nhỏ ở đổi vĩ, ngưỡng đã nới; nhưng tiếng tạp vẫn cần thấp."
      ],
      "tips": [
        "Sắp xếp trình tự: khuỷu tay, rồi đảo chiều, rồi nhấc ngón. Mỗi việc cách nhau một khoảnh khắc nhỏ.",
        "Đừng nhấc ngón 3 khi vĩ còn đang ở dây Rê."
      ],
      "mistakes": [
        "Làm cả ba việc đúng ngay phách → không việc nào gọn.",
        "Quên giữ tốc độ vĩ khi đảo chiều → tiếng La yếu hơn tiếng Sol."
      ],
      "feel": "Giống một cú xoay người nhỏ: tay phải và tay trái cùng quay nhưng không va vào nhau.",
      "selfCheck": [
        "Khuỷu tay phải tới mức dây La trước phách.",
        "Ngón 3 nhấc thẳng, nhẹ."
      ],
      "fixes": {
        "cross_gap": "Chuyển dây, nhấc ngón và đổi vĩ cùng lúc dễ hở. Để khuỷu tay đến trước, tay phải đảo chiều theo, và tay trái nhấc ngón sau cùng.",
        "cross_noise": "Tạp tiếng là ngón nhấc lệch hoặc vĩ đập. Nhấc ngón sau khi lông vĩ chạm dây La, đảo chiều bằng ngón tay phải."
      }
    },
    "30": {
      "goal": "Quãng 6: ngón 1 dây Rê (Mi) sang ngón 2 dây La (Đô thăng), hai ngón đổi dây mà tiếng liền.",
      "steps": [
        "Hai nốt Mi (ngón 1 dây Rê) và Đô thăng (ngón 2 dây La) cách nhau quãng 6. Đặt riêng từng nốt để chắc cao độ, nghe với dây buông.",
        "Chuẩn bị ngón 2 dây La trong khi vĩ vẫn ở dây Rê: ngón đã sẵn trước khi vĩ sang.",
        "Bật metronome 60. Mi hai phách, Đô thăng hai phách, chuyển dây ở phách 3.",
        "Bấm Bắt đầu, 4 vĩ liền. Nhìn cao độ lúc vừa tới và tiếng tạp ở chỗ chuyển."
      ],
      "tips": [
        "Chuyển cả bàn tay một khối: khuỷu tay trái có thể xoay nhẹ để ngón về đúng dây.",
        "Nghe quãng 6 trong đầu trước khi đặt ngón."
      ],
      "mistakes": [
        "Nhấc ngón 1 trước rồi mới tìm ngón 2 → có khoảng không cao độ ở giữa.",
        "Thân ngón chạm dây Rê khi ngón 2 đặt trên dây La → dây Rê bị đục."
      ],
      "feel": "Bàn tay xoay nhẹ như vặn một cái nắp lọ: sang dây mới mà cả bàn tay đã sẵn thế.",
      "selfCheck": [
        "Ngón 2 đặt bằng đầu ngón, không chạm dây Rê.",
        "Khuỷu tay phải chuẩn bị đúng mức dây La."
      ],
      "fixes": {
        "cross_noise": "Tiếng tạp ở quãng 6 thường do thân ngón 1 hoặc ngón 2 chạm dây bên cạnh. Đặt ngón bằng đầu ngón, khum bàn tay và chuyển vĩ gọn.",
        "pitch_arrive": "Đô thăng vừa tới đã lệch vì ngón 2 đặt trễ. Đặt ngón 2 xuống trước khi vĩ sang dây La, nghĩ sẵn cao độ.",
        "cross_gap": "Hở tiếng ở quãng 6: vĩ chờ ngón. Chuẩn bị khuỷu tay trước phách và để lông vĩ chạm hai dây một thoáng trước khi nhấc ngón."
      }
    },
    "31": {
      "goal": "Cùng ngón 1 sang dây (quãng 5): Mi dây Rê rồi Si dây La, bàn tay giữ hình khối và chuyển dây liền.",
      "steps": [
        "Quãng 5 đúng: Mi (ngón 1 dây Rê) và Si (ngón 1 dây La) nằm cùng một chỗ trên cần đàn. Đặt đầu ngón 1 vào khe giữa hai dây, hơi phẳng, để phần đệm ngón phủ được cả hai dây.",
        "Tập không vĩ: dồn sức ngón về dây Rê cho nốt Mi, rồi lăn sức sang dây La cho nốt Si mà không nhấc ngón. Sau đó kéo thử hai dây cùng lúc, nghe quãng 5 trong.",
        "Bật metronome 60. Mi hai phách, Si hai phách. Chuyển dây ở phách 3.",
        "Bấm Bắt đầu, 4 vĩ liền. Quãng 5 đúng thì nghe tròn: xem cả hai nốt có đạt cao độ không."
      ],
      "tips": [
        "Ngón phủ cả hai dây nhưng sức bấm dồn về dây đang kéo: lăn ngón chứ đừng nhấc lên đặt lại.",
        "Giữ hình bàn tay đứng yên, chỉ vĩ chuyển dây."
      ],
      "mistakes": [
        "Đổi vị trí ngón 1 giữa hai nốt → Si lệch cao độ.",
        "Ngón nằm lệch hẳn sang dây kia nên dây đang kéo không được bấm chắc → tiếng rè, đục."
      ],
      "feel": "Bàn tay đứng yên như một hình khối. Chỉ vĩ di chuyển và hai nốt đứng cạnh nhau chính xác.",
      "selfCheck": [
        "Ngón 1 phủ cả hai dây và lăn sức từ dây Rê sang dây La mà không nhấc khỏi cần đàn.",
        "Khuỷu tay trái ở vị trí ổn định, không đung đưa."
      ],
      "fixes": {
        "cross_gap": "Hở tiếng ở quãng 5: vĩ chờ cao độ. Giữ ngón 1 phủ cả hai dây, khuỷu tay phải tới mặt phẳng dây La trước phách và sang dây bằng cổ tay.",
        "pitch_off": "Quãng 5 nghe phô thì bàn tay chưa ổn. Kiểm bằng kéo hai dây buông Rê và La cạnh nhau: ngón 1 trên dây Rê ra Mi, ngón 1 trên dây La ra Si, nghe hòa với dây buông.",
        "cross_noise": "Tiếng tạp có thể do dây đang kéo chưa được bấm chắc. Lăn sức ngón 1 về hẳn dây đang kéo, giữ ngón sát cần đàn."
      }
    },
    "32": {
      "goal": "Âm giai Rê trưởng một quãng tám, luyến bốn nốt mỗi vĩ, chỗ chuyển từ Sol (ngón 3 dây Rê) sang La buông mượt như một bậc thang.",
      "steps": [
        "Âm giai: Rê, Mi, Fa thăng, Sol (dây Rê), rồi La buông, Si, Đô thăng, Rê (dây La). Bốn nốt mỗi vĩ.",
        "Tập từng dây riêng: bốn nốt dây Rê, rồi bốn nốt dây La. Rồi ghép chỗ chuyển giữa Sol (ngón 3) và La buông.",
        "Chuyển dây giữa hai vĩ trùng đổi vĩ. Đi lên (Sol sang La buông): hạ khuỷu tay từ sớm để lúc vĩ đảo chiều dây La đã sẵn. Quay về đầu âm giai (Rê cao về Rê buông): nâng khuỷu trở lại.",
        "Bật metronome 66, mỗi phách một nốt. Bấm Bắt đầu, 2 vòng. Soát từng nốt: âm giai là bài kiểm cao độ tốt nhất."
      ],
      "tips": [
        "Nhìn âm giai như hai nửa giống nhau: nửa dưới và nửa trên cùng khuôn nốt.",
        "Nghĩ đến chiều dài nốt như nhau: mỗi nốt dùng cùng chiều dài vĩ.",
        "Ở chỗ chuyển Sol sang La, nhấc ngón 3 đúng lúc vĩ chạm dây La."
      ],
      "mistakes": [
        "Bốn nốt đầu dùng hết vĩ, bốn nốt sau thiếu vĩ → tiếng không đều.",
        "Cao độ Si và Đô thăng thấp vì bàn tay rút ra → nghe phô."
      ],
      "feel": "Âm giai chạy như nước chảy, bậc nào cũng sạch. Chuyển dây là một bước nhỏ không đáng kể.",
      "selfCheck": [
        "Vĩ dùng trọn vĩ, bốn nốt chia đều.",
        "Bàn tay trái giữ thế ổn định ở cả hai dây."
      ],
      "fixes": {
        "cross_noise": "Tạp tiếng khi qua dây La trong âm giai thường do ngón 3 nhấc sớm làm dây Rê kêu. Giữ ngón 3 tới khi vĩ chạm dây La rồi mới nhấc.",
        "cross_gap": "Chuyển giữa Sol và La buông là chỗ dễ hở. Hạ khuỷu tay sớm, giữ ngón 3 tới khi vĩ chạm dây La rồi mới nhấc.",
        "pitch_off": "Cao độ lệch ở một nốt trong âm giai: tập riêng nốt đó với dây buông bên cạnh và đặt ngón lại nhiều lần trước khi ghép."
      }
    },
    "33": {
      "goal": "Âm giai La trưởng qua dây La và Mi, chuyển dây từ Rê (La) sang Mi buông trơn tru, dây Mi vẫn sáng không gắt.",
      "steps": [
        "Âm giai: La, Si, Đô thăng, Rê (dây La), rồi Mi buông, Fa thăng, Sol thăng, La (dây Mi). Bốn nốt mỗi vĩ.",
        "Tập riêng bốn nốt trên dây Mi: cùng thế ngón như trên dây La (ngón 2 và ngón 3 sát nhau). Kiểm La cao (ngón 3) bằng dây La buông, cách đúng một quãng tám.",
        "Chuyển từ Rê (ngón 3 dây La) sang Mi buông trùng đổi vĩ: hạ khuỷu sớm và giảm lực ngay lúc sang dây Mi.",
        "Bật metronome 66. Bấm Bắt đầu, 2 vòng. Bài này ở bậc khó 2: ngưỡng chặt hơn."
      ],
      "tips": [
        "Dây Mi nhạy: ít lực, tốc độ vĩ nhanh hơn một chút.",
        "Thế ngón trên dây Mi y như trên dây La: bàn tay giữ nguyên khung, chỉ khuỷu tay trái đưa ra ngoài một chút."
      ],
      "mistakes": [
        "Giữ lực vĩ nặng khi sang dây Mi → tiếng rít ở nốt Mi buông.",
        "Bàn tay đổi khung khi sang dây Mi → Sol thăng và La cao dễ lệch."
      ],
      "feel": "Âm giai bay lên nhẹ nhàng. Chỗ chuyển sang dây Mi như bước lên bậc sáng hơn mà không bị chói.",
      "selfCheck": [
        "Khuỷu tay phải hạ đúng mức dây Mi từ trước phách.",
        "Bàn tay trái giữ nguyên khung khi sang dây Mi."
      ],
      "fixes": {
        "cross_noise": "Rít hoặc lạo xạo khi sang Mi là lực quá lớn. Giảm sức nặng ngay lúc chạm dây Mi, giữ vĩ vuông góc dây.",
        "cross_gap": "Hở tiếng ở chuyển La sang Mi: hạ khuỷu tay sớm từ phách 4 và để lông vĩ chạm hai dây một thoáng."
      }
    },
    "34": {
      "goal": "Bập bênh có bấm: Fa thăng (ngón 2 dây Rê) và La buông, luyến bốn nốt, ngón và vĩ đổi nhịp nhàng.",
      "steps": [
        "Hai nốt: Fa thăng ngón 2 dây Rê và La buông. Mỗi lần sang La thì ngón 2 nhấc, mỗi lần về Rê thì ngón 2 đặt lại.",
        "Tập chậm: ngón 2 gõ nhẹ trên dây Rê. Giữ ngón gần dây khi vĩ ở dây La để đặt lại nhanh.",
        "Bật metronome 66, mỗi phách một nốt, bốn nốt một vĩ. Giữ tốc độ vĩ đều.",
        "Bấm Bắt đầu, 3 vòng. Bài ở bậc khó 2: ngưỡng chặt hơn, nhất là cao độ lúc vừa tới."
      ],
      "tips": [
        "Ngón 2 như quả lắc: hạ xuống, nhấc lên, nhưng luôn gần dây.",
        "Nghe La buông thật rõ: nó là chuẩn để kiểm Fa thăng."
      ],
      "mistakes": [
        "Nhấc ngón 2 quá cao → đặt lại chậm, Fa thăng lên trễ.",
        "Tay phải hạ biên độ khi tay trái nhanh → bập bênh nhỏ, vĩ chạm cả hai dây."
      ],
      "feel": "Hai tay nhảy một điệu nhỏ đều đặn. Fa thăng và La như hai nốt đứng cạnh nhau trên cùng một bậc.",
      "selfCheck": [
        "Ngón 2 nhấc rất thấp trên dây, không hơn 1 cm.",
        "Cổ tay phải mềm, không gồng."
      ],
      "fixes": {
        "cross_noise": "Tạp tiếng khi bập bênh có bấm: ngón 2 nhấc chạm dây bên cạnh hoặc dây Rê kêu buông. Nhấc ngón thẳng lên, giữ vĩ sát dây.",
        "pitch_arrive": "Fa thăng vừa tới đã lệch vì ngón đặt trễ hoặc tìm nốt. Giữ ngón gần dây, nghĩ sẵn nốt, đặt vào đúng chỗ ngay lần đầu.",
        "cross_gap": "Bập bênh có bấm dễ hở vì hai tay phối hợp chưa khớp. Thu nhỏ biên độ vĩ, giữ lông vĩ gần cả hai dây và nhấc ngón đúng lúc vĩ chạm dây La."
      }
    },
    "35": {
      "goal": "Kiểm tra vòng 4: hợp âm rải Rê, La, Fa thăng cao, La qua ba dây ở nhịp 72, mỗi chỗ chuyển đều mượt.",
      "steps": [
        "Mỗi nốt một phách: Rê buông (dây Rê), La buông (dây La), Fa thăng cao (ngón 1 dây Mi), rồi về La buông. Ba dây Rê, La, Mi.",
        "Tập chậm ở nhịp 54: mỗi nốt kéo ngắn, chú ý đường đi của khuỷu tay xuống rồi lên trở lại.",
        "Ngón 1 dây Mi phải sẵn trước khi vĩ sang dây Mi: đặt ngón sớm một chút.",
        "Bấm Bắt đầu ở nhịp 72, 3 vòng. Kiểm tra vòng: ngưỡng chặt, mỗi chỗ chuyển (bốn chỗ chuyển mỗi vòng, tính cả chỗ quay về Rê) cần mượt."
      ],
      "tips": [
        "Hợp âm rải: vĩ chạy theo đường cong trên ngựa đàn, đừng nghĩ ba đường thẳng.",
        "Nâng khuỷu về La sớm, từ nốt Fa thăng, đừng đợi phách.",
        "Giữ tốc độ vĩ liên tục, như đang kéo một nốt dài chạy qua các dây."
      ],
      "mistakes": [
        "Chuẩn bị tốt khi đi lên nhưng quên khi về La → nốt La cuối vĩ bị tạp hoặc trễ.",
        "Nhấc vĩ khỏi dây ở mỗi phách → tiếng rời rạc."
      ],
      "feel": "Vĩ lướt như đang khẽ gảy một chiếc đàn hạc. Ba dây nối liền thành một dòng.",
      "selfCheck": [
        "Khuỷu tay chuyển mức theo từng dây mà không giật.",
        "Ngón 1 dây Mi đặt trước, nhấc gọn."
      ],
      "fixes": {
        "cross_noise": "Tạp tiếng ở hợp âm rải thường do vĩ quệt dây thừa lúc đi xuống. Nâng khuỷu tay vừa đủ, chuyển bằng cổ tay và giữ tốc độ vĩ đều.",
        "cross_gap": "Hợp âm rải dễ hở ở chiều đi xuống. Nâng khuỷu tay sớm, ngay sau nốt Fa thăng, và để vĩ lướt chứ không nhấc.",
        "cross_slow": "Nốt mới lên chậm: đường đi cánh tay còn dài. Chuẩn bị mức dây trước phách và thu gọn chuyển động."
      }
    },
    "36": {
      "goal": "Vibrato ngón 2 dây La (Đô thăng) chạy liên tục qua mỗi lần đổi vĩ: sóng rung không dừng, không đơ.",
      "steps": [
        "Đặt ngón 2 trên dây La ra Đô thăng (C#5). Rung đều ở nhịp thoải mái của bạn, rung xuống dưới nốt như phần Vibrato của app: lăn về phía cuộn đàn rồi quay lại nốt.",
        "Kéo một vĩ 4 phách ở nhịp 60, vĩ giữa vĩ, vibrato chạy suốt. Chưa quan tâm đổi vĩ, chỉ giữ rung đều.",
        "Thêm đổi vĩ ở phách 4: tay phải đảo chiều nhỏ, tay trái không biết có chuyện gì. Nghĩ tay trái là con lắc không bao giờ dừng.",
        "Bấm Bắt đầu, 4 vĩ liền. Soát phần Vibrato đơ: sau mỗi điểm đổi vĩ, vibrato phải còn chạy."
      ],
      "tips": [
        "Chủ động rung rõ hơn một chút ngay trước điểm đổi vĩ; nó giữ đà cho sau điểm đổi.",
        "Đếm nhịp rung trong đầu, không nhìn tay phải.",
        "Đừng bóp ngón cái trái khi đổi vĩ: ngón cái là nơi mất vibrato đầu tiên."
      ],
      "mistakes": [
        "Dừng rung ở lúc đổi vĩ rồi mới rung lại → đo ra đoạn đơ dài, vibrato lúc có lúc không.",
        "Rung gấp hơn khi lo đổi vĩ → tốc độ vượt ngưỡng, độ rộng nhỏ lại."
      ],
      "feel": "Tay trái tự chạy như chiếc đồng hồ quả lắc, tay phải làm việc của nó. Âm thanh không có chỗ nào bị phẳng đi.",
      "selfCheck": [
        "Rung xuống dưới nốt, đỉnh của dao động là nốt đúng.",
        "Ngón cái trái không bóp, vai thả lỏng."
      ],
      "fixes": {
        "vib_freeze": "Vibrato đơ sau điểm đổi vĩ: tay trái dừng cùng tay phải. Rung rõ hơn ngay trước điểm đổi, và nghĩ “tay trái không bao giờ dừng” khi tay phải đảo chiều.",
        "bow_gap": "Hở tiếng ở đổi vĩ khi đang rung: giữ tốc độ vĩ đều tới sát điểm đổi, tay phải đảo chiều bằng ngón tay."
      }
    },
    "37": {
      "goal": "Vibrato ngón 3 dây La (Rê) chạy liên tục qua đổi vĩ, dù ngón 3 yếu hơn ngón 2 và dễ cứng.",
      "steps": [
        "Đặt ngón 3 trên dây La ra Rê (D5). Ngón 3 thường cứng hơn ngón 2: để ngón 2 và ngón 4 treo nhẹ phía trên làm điểm tựa cho bàn tay.",
        "Rung đều xuống dưới nốt khi kéo một vĩ 4 phách ở nhịp 60. Nghe đỉnh dao động chạm đúng Rê.",
        "Thêm đổi vĩ ở phách 4. Chuẩn bị tay phải bằng chuyển động thật nhỏ, giữ vĩ giữa vĩ.",
        "Bấm Bắt đầu, 4 vĩ. Nếu vibrato đơ sau điểm đổi, tăng độ rộng một chút ngay trước phách 4."
      ],
      "tips": [
        "Để ngón 3 mềm khớp đầu ngón: ngón thẳng cứng là nguyên nhân chính khiến vibrato đơ.",
        "Để ngón 2 đặt hờ cạnh ngón 3 làm chỗ dựa, cả bàn tay rung thành một khối."
      ],
      "mistakes": [
        "Giữ ngón 3 như cái chốt → rung chỉ bằng cổ tay, độ rộng nhỏ và không đều.",
        "Bàn tay kéo lệch về phía cần đàn khi lo đổi vĩ → vibrato mất dần."
      ],
      "feel": "Bàn tay đung đưa nhẹ nhàng, ngón 3 như một mỏm đảo nhỏ. Tiếng dao động liền qua cả điểm đổi vĩ.",
      "selfCheck": [
        "Khớp đầu ngón 3 mềm, đầu ngón cong.",
        "Ngón cái không ép lên cần đàn."
      ],
      "fixes": {
        "vib_freeze": "Ngón 3 dễ cứng đúng lúc đổi vĩ. Giữ khớp đầu ngón mềm, tăng độ rung nhẹ ngay trước điểm đổi và đặt mục tiêu: sóng rung không bao giờ phẳng.",
        "bow_gap": "Hở tiếng khi đổi vĩ trong lúc rung: tay phải đổi chiều bằng ngón tay phải, tay trái không dừng và không bóp."
      }
    },
    "38": {
      "goal": "Vibrato ngón 1 dây Rê (Mi) chạy liên tục qua đổi vĩ ở dây thấp, nơi vibrato hay rộng và chậm.",
      "steps": [
        "Đặt ngón 1 trên dây Rê ra Mi (E4). Ngón 1 thường là chỗ vibrato kẹt nhất vì tựa vào cần đàn: giữ gốc ngón trỏ hơi tách khỏi cần.",
        "Rung xuống dưới nốt khi kéo vĩ 4 phách ở nhịp 60. Dây Rê thấp nên vibrato rộng hơn một chút nghe ấm hơn.",
        "Thêm đổi vĩ ở phách 4. Tay phải giữ tốc độ vĩ đều qua điểm đổi, tay trái chạy tiếp.",
        "Bấm Bắt đầu, 4 vĩ liền. Xem cả độ rộng lẫn độ đều của vibrato trên phiếu, không chỉ chuyện đơ."
      ],
      "tips": [
        "Tách nhẹ gốc ngón trỏ khỏi cần đàn để cổ tay và ngón có chỗ đung đưa.",
        "Rung rộng và hơi chậm hơn ở dây thấp thì tiếng vang hơn."
      ],
      "mistakes": [
        "Tựa gốc ngón vào cần đàn → bàn tay không lắc được, vibrato nhỏ và đứt.",
        "Rung nhanh gấp để bù cho đổi vĩ → độ rộng hẹp, vượt ngưỡng tốc độ."
      ],
      "feel": "Tay trái nhẹ, như bàn tay đung đưa trong nước. Tiếng ấm và sống qua cả điểm đổi vĩ.",
      "selfCheck": [
        "Gốc ngón trỏ không dựa vào cần đàn.",
        "Rung xuống dưới nốt, không lên trên."
      ],
      "fixes": {
        "vib_freeze": "Vibrato đơ ở đổi vĩ trên dây Rê thường vì tay trái co lại. Thả gốc ngón khỏi cần đàn, rung rộng hơn một chút trước điểm đổi và để tay trái chạy liên tục.",
        "vib_width_narrow": "Rung hẹp ở dây Rê: tách gốc ngón khỏi cần đàn và cho khớp đầu ngón gập duỗi nhiều hơn, để cánh tay hoặc cổ tay tham gia."
      }
    },
    "39": {
      "goal": "Đổi vĩ mỗi 2 phách mà vibrato vẫn chạy: bảy lần đổi liền nhau, sóng rung không đứt lần nào.",
      "steps": [
        "Giữ nguyên thế ngón 2 dây La (Đô thăng). Tập riêng vĩ trọn 2 phách ở nhịp 60 không rung, chỉ để vĩ quen.",
        "Thêm vibrato nhưng chưa tính tới đổi vĩ: rung đều khi vĩ đi trọn 2 phách.",
        "Ghép: mỗi 2 phách đổi vĩ, vibrato không đổi. Đếm trong đầu “1 và 2 và”, rung theo đếm của riêng tay trái.",
        "Bấm Bắt đầu, 8 vĩ liền. Đây là level đổi vĩ dày nhất của vòng này: nhìn xem đoạn đơ có dài hơn ở level trước không."
      ],
      "tips": [
        "Tách hai nhịp: nhịp của tay phải theo metronome, nhịp của tay trái theo tay trái. Hai nhịp độc lập.",
        "Nếu vibrato tụt khi đổi vĩ, nhìn tay trái chứ đừng nhìn tay phải."
      ],
      "mistakes": [
        "Để nhịp đổi vĩ kéo vibrato giật theo → rung đứt từng khúc, độ đều thấp.",
        "Nhả hết sức khi đổi vĩ liên tục → vibrato tắt dần về cuối vĩ."
      ],
      "feel": "Hai tay như hai người cùng chơi với hai nhịp riêng. Đổi vĩ liên tục mà vibrato gần như không biết.",
      "selfCheck": [
        "Vĩ dùng trọn vĩ, từ gốc đến ngọn, mỗi chiều đúng 2 phách.",
        "Nhịp rung không phụ thuộc vào nhịp vĩ."
      ],
      "fixes": {
        "vib_freeze": "Đổi vĩ dày dễ làm vibrato dừng. Tách hai tay: tay trái rung theo nhịp riêng, tay phải đổi vĩ theo metronome, và đừng nhìn tay phải khi đổi.",
        "vib_patchy": "Vibrato lúc có lúc không qua 8 vĩ: giữ rung suốt chiều dài nốt, kể cả cuối vĩ. Nếu mệt, thả vai và nghỉ rồi tập lại."
      }
    },
    "40": {
      "goal": "Vibrato nối qua hai nốt: ngón 1 lên ngón 2 trên dây La (Si rồi Đô thăng), rung chạy liên tục qua chỗ đổi nốt.",
      "steps": [
        "Ngón 1 ra Si (B4), ngón 2 ra Đô thăng (C#5), dây La. Rung xuống dưới nốt ở cả hai nốt.",
        "Bước ngắn: rung nốt Si, rồi đặt ngón 2 thẳng vào đúng chỗ của Đô thăng và rung ngay từ nốt đó xuống dưới. Không dừng tay để chờ, cũng không trượt tìm nốt.",
        "Bật metronome 60. Si hai phách (rung), rồi Đô thăng hai phách (rung). Đổi nốt ở phách 3 trong cùng một vĩ.",
        "Bấm Bắt đầu, 4 vĩ liền. Soát đoạn đơ sau điểm đổi nốt và cao độ từng nốt."
      ],
      "tips": [
        "Đặt ngón mới xuống lúc tay còn đang rung: tay không dừng, chỉ đổi ngón.",
        "Đỉnh dao động phải rơi đúng nốt đích, nên vẫn nghe cao độ trong lúc rung.",
        "Giữ ngón 1 xuống khi ngón 2 đặt: nó là cái neo cho bàn tay."
      ],
      "mistakes": [
        "Dừng rung khi đổi ngón rồi mới rung lại → đo ra đoạn đơ dài hơn ngưỡng.",
        "Rung nốt mới bắt đầu từ lệch nốt rồi mới chỉnh → cao độ từng nốt sai."
      ],
      "feel": "Giống như hai ngón tay lần lượt đỡ một con sóng. Sóng không đổi, chỉ ngón thay nhau giữ.",
      "selfCheck": [
        "Rung xuống dưới nốt ở cả hai nốt.",
        "Ngón 1 vẫn nằm trên dây khi ngón 2 rung."
      ],
      "fixes": {
        "vib_freeze": "Vibrato đơ sau đổi nốt: đặt ngón xuống là rung ngay, không chờ ổn định. Giữ nhịp rung đều của cổ tay đi xuyên qua cú đổi ngón.",
        "pitch_arrive": "Nốt mới lệch: nghĩ sẵn nốt trong đầu, đặt ngón thẳng vào đúng chỗ rồi rung ngay từ đó xuống dưới. Rung ngay không có nghĩa là trượt tìm nốt."
      }
    },
    "41": {
      "goal": "Vibrato nối đi xuống: ngón 3, 2, 1 trên dây La (Rê, Đô thăng, Si), đổi nốt mỗi lần đổi vĩ mà sóng rung không đứt.",
      "steps": [
        "Ba nốt đi xuống: Rê (ngón 3), Đô thăng (ngón 2), Si (ngón 1). Mỗi nốt 2 phách và mỗi nốt một vĩ, nên đổi nốt trùng đổi vĩ.",
        "Đặt cả ba ngón xuống, kéo Rê rung, rồi nhấc ngón 3 ra Đô thăng, đang rung, nhấc ngón 2 ra Si.",
        "Bật metronome 60. Mỗi lần nhấc ngón trùng lúc đổi vĩ: ngón dưới đã bấm sẵn từ trước, ngón trên nhấc gọn đúng phách.",
        "Bấm Bắt đầu, 2 vòng. Chiều xuống khó hơn vì bàn tay trái phải thu lại, nên đo cẩn thận phần đơ."
      ],
      "tips": [
        "Nhấc ngón là tiếp tục rung bằng ngón dưới, chứ không dừng tay để nhấc ngón.",
        "Giữ cổ tay tự do để rung không phụ thuộc ngón nào đang đặt."
      ],
      "mistakes": [
        "Nhấc ngón rồi rung dưới ngón khác bằng cú giật → vibrato đứt ba bốn chu kỳ.",
        "Tay phải đổi vĩ chậm khi lo ngón → tiếng sụt cùng điểm đổi nốt."
      ],
      "feel": "Đi xuống như thả lỏng từng bậc, nhưng sóng rung không thay đổi, đều như hơi thở.",
      "selfCheck": [
        "Rung xuống dưới nốt ở cả ba nốt.",
        "Các ngón dưới vẫn hờ trên dây khi đang nhấc."
      ],
      "fixes": {
        "vib_freeze": "Đi xuống dễ mất rung vì tay thu lại. Giữ cổ tay mềm và chủ động rung rõ hơn một chút ở đúng lúc nhấc ngón.",
        "timing_late": "Đổi nốt trễ do ngón trên nhấc chậm. Ngón dưới bấm sẵn, ngón trên nhấc gọn đúng phách, cùng lúc đổi vĩ."
      }
    },
    "42": {
      "goal": "Kiểm tra vòng 5: Si, Đô thăng, Rê, Đô thăng trên dây La, vibrato không đơ qua cả đổi nốt lẫn đổi vĩ.",
      "steps": [
        "Thế tay: ngón 1 Si, ngón 2 Đô thăng, ngón 3 Rê. Bốn nốt, mỗi nốt 2 phách, hai nốt mỗi vĩ, nên đổi vĩ rơi vào giữa chuỗi.",
        "Tập riêng từng cặp: Si và Đô thăng (đã tập ở M40), Rê và Đô thăng (M41). Nghe sóng rung liền ở hai cặp.",
        "Ghép cả bốn nốt, giữ nhịp rung đều như đồng hồ, tập chậm ở nhịp 54 rồi lên 60.",
        "Bấm Bắt đầu ở nhịp 60, 2 vòng. Bài kiểm tra: ngưỡng đơ chặt hơn và cần tỷ lệ thời gian có rung cao."
      ],
      "tips": [
        "Hình dung một sợi chỉ rung xuyên qua cả bốn nốt: tay trái chỉ đổi chỗ đặt ngón.",
        "Nghỉ vai giữa các vòng: vai gồng làm vibrato chùng ở cuối bài.",
        "Phiếu báo độ rộng chung của cả lượt. Nếu số đó hẹp, rung rộng hơn một chút ở cả bài, bắt đầu từ nốt bạn thấy tay cứng nhất."
      ],
      "mistakes": [
        "Bài dài nên vibrato yếu dần về sau → tỷ lệ có rung thấp.",
        "Mỗi lần đổi nốt giảm tốc độ rung rồi mới tăng lại → nhịp rung gợn."
      ],
      "feel": "Tay trái tiếp tục đung đưa dù ngón thay đổi. Cả bài như một câu hát có rung.",
      "selfCheck": [
        "Vai thả lỏng trong suốt cả bài, đặc biệt ở vòng thứ hai.",
        "Rung xuống dưới nốt ở cả bốn nốt."
      ],
      "fixes": {
        "vib_freeze": "Đơ sau điểm đổi nốt hoặc đổi vĩ: giữ nhịp rung đều như con lắc, đặt ngón xuống là rung ngay.",
        "vib_patchy": "Rung lúc có lúc không: giữ suốt chiều dài nốt và nghĩ về cả bài như một hơi thở. Thả vai giữa các vòng."
      }
    },
    "43": {
      "goal": "Chuyển dây có vibrato: ngón 2 dây Rê (Fa thăng) sang ngón 2 dây La (Đô thăng), nốt mới rung ngay khi tới.",
      "steps": [
        "Cả hai nốt đều bấm ngón 2, nên bàn tay xoay nhẹ qua hai dây. Đặt riêng từng nốt, rung xuống dưới nốt để quen.",
        "Fa thăng và Đô thăng cách nhau quãng 5: cùng ngón 2, cùng một chỗ trên cần đàn. Đặt ngón 2 hơi phẳng để phủ cả hai dây, lúc chuyển chỉ lăn sức ngón sang dây La. Không nhấc ngón lên rồi đặt lại.",
        "Bật metronome 60. Fa thăng hai phách có rung, rồi Đô thăng hai phách có rung. Chuyển dây ở phách 3.",
        "Bấm Bắt đầu, 4 vĩ liền. Bài này cả hở tiếng, tiếng tạp và đơ sau chuyển dây đều được soát."
      ],
      "tips": [
        "Giữ nhịp rung xuyên qua chỗ chuyển: ngón 2 lăn từ dây Rê sang dây La trong lúc tay vẫn đung đưa.",
        "Khuỷu tay phải chuẩn bị trước phách để cổ tay không phải gánh toàn bộ chuyển động."
      ],
      "mistakes": [
        "Nhấc ngón 2 lên rồi mới đặt sang dây La → vibrato dừng, đoạn đơ sau chuyển dây dài.",
        "Ngón 2 chưa lăn hẳn sang dây La nên dây La không được bấm chắc → tiếng rè ở chỗ chuyển."
      ],
      "feel": "Hai tay làm hai việc khác nhau mà không va vào nhau: tay phải trượt sang dây, tay trái đung đưa không dừng.",
      "selfCheck": [
        "Ngón 2 phủ cả hai dây, sức bấm dồn về dây đang kéo.",
        "Mỗi nốt đều rung xuống dưới nốt, đỉnh dao động là cao độ đúng."
      ],
      "fixes": {
        "cross_gap": "Hở tiếng khi chuyển dây đang rung: để khuỷu tay tới mặt phẳng dây mới trước phách, lông vĩ chạm hai dây một thoáng rồi sang hẳn.",
        "cross_noise": "Tạp tiếng khi chuyển dây: dây mới chưa được bấm chắc hoặc vĩ đập. Lăn sức ngón 2 về hẳn dây mới và chuyển bằng chuyển động tròn nhỏ của cổ tay.",
        "vib_freeze": "Vibrato đơ sau chuyển dây: ngón đặt xuống nốt mới là rung ngay, không chờ ổn định. Nhịp rung đi xuyên qua phách chuyển."
      }
    },
    "44": {
      "goal": "Chuyển dây có vibrato lên tới dây Mi: ngón 1 dây La (Si) sang ngón 1 dây Mi (Fa thăng cao), rung liên tục.",
      "steps": [
        "Hai nốt: Si (ngón 1 dây La) và Fa thăng (ngón 1 dây Mi), cách nhau quãng 5. Bàn tay hầu như đứng yên, chỉ xoay nhẹ cổ tay.",
        "Rung xuống dưới nốt ở cả hai nốt. Ở dây Mi, rung gọn hơn một chút vì dây Mi nhạy.",
        "Bật metronome 60. Si hai phách, Fa thăng hai phách. Chuyển dây ở phách 3, vĩ giảm lực khi sang dây Mi.",
        "Bấm Bắt đầu, 4 vĩ liền. Chú ý độ rộng vibrato ở dây Mi: nếu quá rộng sẽ nghe phô."
      ],
      "tips": [
        "Giữ ngón 1 ở cùng một chỗ dọc cần đàn khi sang dây: lăn sức ngón sang dây Mi, không nhấc lên đặt lại.",
        "Sang dây Mi thì giảm lực ngón trỏ phải, tránh rít."
      ],
      "mistakes": [
        "Rung quá rộng ở dây Mi → nghe chênh phô.",
        "Dừng rung trong lúc chuyển dây → đoạn đơ dài."
      ],
      "feel": "Nhẹ và sáng: vibrato nhỏ gọn trên dây Mi như ánh sáng lăn tăn.",
      "selfCheck": [
        "Ngón 1 phủ cả hai dây, lăn sức sang dây Mi mà không nhấc.",
        "Khuỷu tay phải đi xuống mức dây Mi từ trước phách."
      ],
      "fixes": {
        "cross_gap": "Hở tiếng khi sang dây Mi lúc đang rung: khuỷu tay xuống mức dây Mi trước phách và vĩ chạm dây Mi trước khi rời dây La.",
        "cross_noise": "Rít hoặc tạp ở dây Mi: giảm sức nặng ngay lúc chạm dây Mi và giữ vĩ vuông góc, rung gọn hơn.",
        "vib_freeze": "Đơ sau chuyển sang dây Mi: giữ nhịp rung xuyên qua chỗ chuyển, đặt ngón xuống là rung nhỏ gọn ngay."
      }
    },
    "45": {
      "goal": "Chuyển dây có vibrato ở dây trầm: ngón 2 dây Sol (Si) sang ngón 2 dây Rê (Fa thăng) ở nhịp 58, tiếng ấm và rung liên tục.",
      "steps": [
        "Hai nốt: Si thấp (B3, ngón 2 dây Sol) và Fa thăng (F#4, ngón 2 dây Rê), cách nhau quãng 5. Đặt từng nốt, nghe hai nốt hòa nhau rồi mới kéo nối.",
        "Nâng khuỷu tay phải lên mức dây Sol, rồi hạ nhẹ khi sang dây Rê. Dây Sol cần sức nặng hơn.",
        "Rung xuống dưới nốt, rộng và hơi chậm hơn ở dây trầm. Bật metronome 58, mỗi nốt hai phách.",
        "Bấm Bắt đầu, 4 vĩ liền. Xem cao độ từng nốt và đoạn đơ sau khi sang dây Rê."
      ],
      "tips": [
        "Ở dây Sol, khuỷu tay trái phải đưa vào trong nhiều hơn nên vibrato dễ nặng nề: thả cổ tay.",
        "Sức nặng cánh tay chìm vào dây suốt đường chuyển, đừng nhả khi sang dây cao."
      ],
      "mistakes": [
        "Vibrato nặng và chậm ở dây Sol, không đổi khi sang dây Rê → độ đều thấp.",
        "Nâng khuỷu tay quá muộn khi về dây Sol (ở vòng sau) → Si bị trễ."
      ],
      "feel": "Dây Sol ấm áp, tay trái đung đưa mềm. Chuyển sang dây Rê là tiếng sáng hơn nhưng nhịp rung vẫn nguyên.",
      "selfCheck": [
        "Khuỷu tay phải đổi mức rõ giữa hai dây.",
        "Bàn tay trái không ôm cần đàn quá chặt."
      ],
      "fixes": {
        "cross_noise": "Tạp tiếng ở dây trầm thường do vĩ đập xuống dây Rê. Hạ khuỷu từ từ, giảm lực nhẹ lúc chạm dây mới và giữ tốc độ vĩ đều.",
        "cross_gap": "Dây Sol nặng nên vĩ dễ nhấc khi chuyển. Giữ sức nặng cánh tay chìm vào dây tới sát điểm chuyển, để khuỷu tay dẫn.",
        "vib_freeze": "Đơ sau khi sang dây Rê: thả cổ tay trái, đặt ngón xuống nốt mới là rung ngay."
      }
    },
    "46": {
      "goal": "Vừa chuyển dây vừa đổi ngón: ngón 3 dây Rê (Sol) sang ngón 1 dây La (Si), vibrato không dừng ở cả hai nốt.",
      "steps": [
        "Hai nốt: Sol (ngón 3 dây Rê) và Si (ngón 1 dây La). Hai nốt cách nhau một quãng 3, nhưng ở hai dây và hai ngón khác nhau.",
        "Ngón 1 dây La cần đặt xuống trước khi vĩ sang dây, khi ngón 3 còn đang rung: cao độ Si sẵn ngay.",
        "Bật metronome 60. Sol hai phách (rung), Si hai phách (rung). Chuyển dây ở phách 3.",
        "Bấm Bắt đầu, 4 vĩ. Hai việc ở tay trái (nhấc ngón 3, đặt ngón 1) cùng với chuyển dây ở tay phải: nếu hỏng, tập từng việc."
      ],
      "tips": [
        "Chuyển vai trò rung từ ngón này sang ngón kia bằng một nhịp liền.",
        "Nghĩ tới cú đổi là “ngón 1 đi xuống dây La và rung” chứ không phải ba việc riêng lẻ."
      ],
      "mistakes": [
        "Nhấc ngón 3 trước rồi mới tìm ngón 1 → có đoạn tiếng lỗ chỗ.",
        "Ngón 1 đặt lệch nên rung chạy quanh nốt sai → pitch lệch."
      ],
      "feel": "Bàn tay bước một bước nhỏ sang dây khác nhưng sóng rung vẫn chạy nguyên, không đổi nhịp.",
      "selfCheck": [
        "Ngón 1 chạm dây La bằng đầu ngón, ngón 3 nhấc thẳng.",
        "Cao độ Si kiểm bằng dây Mi buông (quãng 4 đúng)."
      ],
      "fixes": {
        "cross_noise": "Tạp tiếng khi vừa đổi dây vừa đổi ngón: ngón 3 nhấc chạm dây hoặc vĩ đập. Nhấc ngón thẳng lên và chuyển vĩ bằng chuyển động tròn nhỏ.",
        "pitch_arrive": "Si vừa tới đã lệch: ngón 1 đặt trễ. Đặt ngón 1 sớm, kiểm bằng dây Mi buông, rồi rung.",
        "vib_freeze": "Đơ sau khi đổi ngón và đổi dây: ngón mới đặt xuống là rung ngay, nhịp rung đều đi xuyên qua.",
        "cross_gap": "Hở tiếng ở chuyển dây có đổi ngón: chuẩn bị khuỷu tay và ngón mới trước phách, để lông vĩ chạm hai dây một thoáng."
      }
    },
    "47": {
      "goal": "Chuyển dây đúng lúc đổi vĩ mà vibrato không dừng: Fa thăng dây Rê sang Si dây La, mỗi nốt một vĩ.",
      "steps": [
        "Mỗi vĩ 2 phách có một nốt: Fa thăng (ngón 2 dây Rê) bằng vĩ xuống, rồi Si (ngón 1 dây La) bằng vĩ lên. Chuyển dây, đổi vĩ và đổi ngón cùng lúc.",
        "Tập chậm: ngón mới đặt TRƯỚC khoảnh khắc đảo vĩ, rung vẫn chạy. Khuỷu tay phải tới mức dây La trước phách.",
        "Bật metronome 60. Hai phách một nốt, luân phiên Fa thăng và Si.",
        "Bấm Bắt đầu, 4 vòng. Đây là đỉnh kỹ thuật của vòng 6: nhìn từng chỉ số, chấp nhận trượt vài lần."
      ],
      "tips": [
        "Chia nhiệm vụ rõ: khuỷu tay chuẩn bị, tay trái dẫn đường, vĩ đi sau.",
        "Đừng chờ ổn định ở nốt mới: đặt ngón là rung.",
        "Tập giảm nhịp xuống 48 nếu quá nhanh, rồi tăng dần."
      ],
      "mistakes": [
        "Ba việc cùng lúc nên đều làm vội → hở tiếng và đơ ngay phách.",
        "Dừng rung 1–2 chu kỳ rồi mới rung lại → đơ vượt ngưỡng."
      ],
      "feel": "Như một cú xoay người mượt mà: tay trái và tay phải cùng quay theo một vòng, vibrato vẫn chạy.",
      "selfCheck": [
        "Khuỷu tay phải tới mức dây La từ trước phách.",
        "Cả hai nốt rung xuống dưới nốt, không rung lên trên."
      ],
      "fixes": {
        "cross_noise": "Tạp tiếng ở chỗ trùng đổi vĩ và đổi ngón: đảo chiều bằng ngón tay phải, không giật cánh tay, và đặt ngón mới bằng đầu ngón.",
        "cross_gap": "Hở tiếng khi chuyển dây trùng đổi vĩ và đổi ngón: khuỷu tay tới trước, rồi vĩ đảo chiều trên đường cong sang dây La.",
        "vib_freeze": "Vibrato đơ ở chỗ chuyển dây trùng đổi vĩ: tay trái không được chờ tay phải. Đặt ngón mới, rung ngay, kệ vĩ đang đảo."
      }
    },
    "48": {
      "goal": "Câu cantabile trên dây Rê và La: bốn nốt luyến thành một câu hát có vibrato, chuyển dây giữa câu mà không lộ chỗ nối.",
      "steps": [
        "Bốn nốt: Fa thăng, Sol (dây Rê), Si, Đô thăng (dây La). Hai nốt mỗi vĩ. Chuyển dây từ Sol sang Si rơi trùng điểm đổi vĩ.",
        "Hát câu này trong đầu trước: lên bước nhỏ, vượt dây ở nốt thứ ba, kết ở nốt cao nhất. Phrase có dáng đi lên.",
        "Bật metronome 60. Rung đều, tăng nhẹ độ rộng khi lên cao của câu, kéo vĩ như đang hát một hơi.",
        "Bấm Bắt đầu, 2 vòng. Bài này vừa kiểm chuyển dây vừa kiểm đơ, đừng chỉ nhìn một chỉ số."
      ],
      "tips": [
        "Nghĩ câu nhạc như một câu nói: nốt kết là điểm đến, nốt đầu là lúc hít vào.",
        "Giữ tốc độ vĩ liên tục để nối câu. Sức nặng chỉ đổi rất ít theo dây, không nhả lúc sang dây.",
        "Để tay trái dẫn: ngón cho nốt tiếp theo nằm sẵn trước khi vĩ sang."
      ],
      "mistakes": [
        "Mỗi nốt kéo như một nốt rời → không thành câu, vibrato đứt ở đầu nốt.",
        "Chuyển dây ngập ngừng vì đang nghĩ về vibrato → hở tiếng ngay giữa câu."
      ],
      "feel": "Như đang hát: hơi thở liền, nốt này dẫn nốt sau. Chuyển dây là một dấu luyến mềm.",
      "selfCheck": [
        "Câu có hướng đi lên rõ ràng, nốt cuối là đỉnh.",
        "Vai và hàm thả lỏng, hơi thở đều."
      ],
      "fixes": {
        "cross_noise": "Tạp tiếng giữa câu: giữ sức nặng vĩ liên tục và chuyển dây bằng cử động tròn nhỏ của cổ tay, đừng đập xuống dây La.",
        "cross_gap": "Hở tiếng giữa câu: khuỷu tay chuẩn bị trước phách, giữ sức nặng liên tục sang dây mới và để vĩ lướt trên đường cong.",
        "vib_freeze": "Vibrato đơ giữa câu: để tay trái rung liền suốt câu như hát một hơi, đặt ngón mới là rung ngay."
      }
    },
    "49": {
      "goal": "Câu cantabile lên tới dây Mi: bốn nốt luyến qua dây La và dây Mi, đỉnh câu trên dây Mi sáng mà không gắt.",
      "steps": [
        "Bốn nốt: Đô thăng, Rê (dây La), Fa thăng cao (dây Mi), rồi Mi (ngón 4 dây La). Đi lên rồi quay về dây La: có hai chỗ chuyển dây trong một vòng.",
        "Chuyển lên dây Mi trùng đổi vĩ ở nốt Fa thăng cao; chuyển xuống về dây La ở nốt cuối bằng ngón 4. Tập hai chỗ chuyển riêng.",
        "Bật metronome 60. Rung đều, rung gọn ở dây Mi. Nhìn câu như một đường đi lên rồi lùi nhẹ.",
        "Bấm Bắt đầu, 2 vòng. Soát tiếng tạp ở dây Mi và cao độ của ngón 4."
      ],
      "tips": [
        "Dây Mi rung gọn: độ rộng hẹp lại, tốc độ nhỉnh hơn một chút.",
        "Ngón 4 đứng cong, rung bằng cả bàn tay chứ không chỉ khớp đầu ngón.",
        "Sau đỉnh câu, thả lực nhẹ nhàng như thở ra."
      ],
      "mistakes": [
        "Dồn lực lên đỉnh câu trên dây Mi → tiếng rít và gắt.",
        "Ngón 4 rung yếu nên nốt cuối tắt sớm → tỷ lệ có rung thấp."
      ],
      "feel": "Câu hát bay lên rồi hạ xuống nhẹ nhàng. Dây Mi sáng nhưng ấm, vibrato nhỏ mà sống.",
      "selfCheck": [
        "Ngón 4 cong tròn, đứng bằng đầu ngón.",
        "Khuỷu tay phải hạ tới mức dây Mi trước phách rồi nâng trở lại."
      ],
      "fixes": {
        "cross_gap": "Hở tiếng khi lên dây Mi trong câu: khuỷu tay xuống mức dây Mi từ trước phách, vĩ chạm dây Mi trước khi rời dây La.",
        "cross_noise": "Tạp tiếng ở đỉnh câu trên dây Mi: giảm lực ngón trỏ phải, giữ vĩ vuông góc và tốc độ vĩ đều.",
        "vib_freeze": "Đơ ở nốt cuối bằng ngón 4: nhờ cả bàn tay rung chứ không chỉ ngón út, và thả vai khi câu kết."
      }
    },
    "50": {
      "goal": "Thử thách cuối: câu hát qua ba dây Sol, Rê, La, đi lên rồi về, vibrato liên tục, đúng cao độ, chuyển dây liền trong một lượt.",
      "steps": [
        "Tám nốt: Si thấp (dây Sol), Mi, Sol (dây Rê), Si, Rê (dây La), rồi quay Si, Sol, Mi. Hai nốt mỗi vĩ, bốn vĩ cả bài, kéo MỘT lượt, không lặp.",
        "Tập riêng ba chỗ chuyển dây trước: Si thấp (dây Sol) sang Mi (dây Rê), Sol (dây Rê) sang Si (dây La), và chiều về Si (dây La) xuống Sol (dây Rê), chỗ này trùng đổi vĩ. Ghi nhớ ngón nào phải sẵn trước khi vĩ sang dây.",
        "Nghĩ câu có hơi thở: lên bằng bốn nốt đầu, đỉnh ở Rê, xuống bằng bốn nốt sau. Rung xuống dưới nốt, tăng độ rộng nhẹ ở đỉnh.",
        "Bật metronome 60, bấm Bắt đầu. Đây là bậc khó cao nhất: ngưỡng chặt nhất và cả tâm cao độ của vibrato được kiểm."
      ],
      "tips": [
        "Chuyển dây trước: khuỷu tay đi tới mặt phẳng dây mới từ sớm, đừng đợi phách.",
        "Đi qua ba dây nghĩa là sức nặng cánh tay đổi ở dây Sol và dây La: để cánh tay tự điều chỉnh.",
        "Nếu lỡ một chỗ, đừng dừng: kéo tiếp, nhìn phiếu sau rồi tập lại chỗ đó."
      ],
      "mistakes": [
        "Quá tập trung vào vibrato nên chuyển dây hở → mất điểm ở chỉ số chuyển dây.",
        "Vibrato lệch lên trên nốt khi căng → tâm cao độ vượt ngưỡng."
      ],
      "feel": "Như đang hát hết một hơi dài, qua ba cung giọng. Tay phải lướt qua ba dây theo đường cong của ngựa đàn, tay trái đung đưa không nghỉ.",
      "selfCheck": [
        "Vai, hàm và ngón cái thả lỏng suốt lượt.",
        "Khuỷu tay phải đổi mức mượt giữa ba dây, không giật."
      ],
      "fixes": {
        "cross_noise": "Tạp tiếng khi qua ba dây: giữ vĩ vuông góc, chuyển bằng cổ tay mềm và đừng quật cánh tay lúc sang dây mới.",
        "cross_gap": "Ở bài cuối, hở tiếng thường rơi vào chuyển dây trùng đổi vĩ. Khuỷu tay tới mặt phẳng dây mới trước phách, lông vĩ chạm hai dây một thoáng rồi sang hẳn.",
        "vib_center_above": "Vibrato rung lên trên nốt: lăn ngón về phía cuộn đàn rồi trở lại nốt, không lăn về phía ngựa đàn. Đỉnh của dao động là nốt đúng.",
        "vib_freeze": "Đơ sau chỗ đổi: nhịp rung chạy xuyên qua mọi chuyển dây và đổi nốt, đặt ngón xuống là rung ngay."
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
