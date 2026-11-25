// Video tham khảo cho phần "Độ mượt". Mọi URL đều lấy nguyên văn từ kết quả WebSearch (xem docs/reference/legato-videos-sources.md).
// Chưa xác nhận oEmbed nên không ghi channel/minutes. Nhóm thiếu video xác thực để mảng rỗng: level vẫn có link tìm kiếm.
(function (root) { 'use strict';
  root.LEGATO_VIDEOS = {
    groups: {
      bow: [
        { url: 'https://www.youtube.com/watch?v=mKrUa5YiY3g', title: "Seamless BOW CHANGES on the VIOLIN: Do's and Don'ts", lang: 'en' },
        { url: 'https://www.youtube.com/watch?v=9C3hJUYA7JM', title: 'The Secret to Silent Bow Changes on the Violin', lang: 'en' },
        { url: 'https://www.youtube.com/watch?v=ocow6xU3_ak', title: '10 Tips for Smooth Bow Changes', lang: 'en' },
      ],
      note: [
        { url: 'https://www.youtube.com/watch?v=m822yzjqAp4', title: 'Left Hand Legato Mastery: Seamless finger action for Left Hand Smoothness', lang: 'en' },
        { url: 'https://www.youtube.com/watch?v=qanl9rFo4vM', title: 'The Keys to Legato Violin Playing', lang: 'en' },
      ],
      cross: [
        { url: 'https://www.youtube.com/watch?v=SuRepN7XKpQ', title: 'HOW TO GET SMOOTH STRING-CROSSINGS ON VIOLIN - Violin Tutorial by Kimberly Hope', channel: 'Kimberly Hope Music - Violinist', lang: 'en' },
        { url: 'https://www.youtube.com/watch?v=s-wWMfa701o', title: '5 Tips for Smooth Violin String Crossings', lang: 'en' },
        { url: 'https://www.youtube.com/watch?v=1mZfkGX8DJA', title: 'How to Cross Strings on the Violin', lang: 'en' },
      ],
      vib: [
        { url: 'https://www.youtube.com/watch?v=oicPusUO4_4', title: 'Violin Lesson - How to Develop a Continuous Vibrato', lang: 'en' },
        { url: 'https://www.youtube.com/watch?v=NvUvrQVRVmc', title: 'Consistent and Natural Vibrato on the Violin', lang: 'en' },
      ],
      // Không tìm được video nào dạy riêng "vibrato xuyên chuyển dây". Ghép hai nửa kỹ thuật: vibrato liên tục + chuyển dây mượt (ghi rõ ở note).
      vibcross: [
        { url: 'https://www.youtube.com/watch?v=oicPusUO4_4', title: 'Violin Lesson - How to Develop a Continuous Vibrato', lang: 'en', note: 'Nửa tay trái: giữ vibrato chạy liên tục từ nốt này sang nốt khác. Video không nói riêng về chuyển dây.' },
        { url: 'https://www.youtube.com/watch?v=SuRepN7XKpQ', title: 'HOW TO GET SMOOTH STRING-CROSSINGS ON VIOLIN - Violin Tutorial by Kimberly Hope', channel: 'Kimberly Hope Music - Violinist', lang: 'en', note: 'Nửa tay phải: chuyển dây không hở tiếng. Tập riêng từng nửa rồi mới ghép.' },
        { url: 'https://www.youtube.com/watch?v=-uyejWhyOf4', title: 'How to get DEEP CONNECTION between the notes [Violin technique]', lang: 'en', note: 'Nối tiếng giữa các nốt.' },
      ],
      cantabile: [
        { url: 'https://www.youtube.com/watch?v=3Jdmr4aur7A', title: 'How to Play with a Singing Tone on the Violin. 4: Phrasing and Articulation', lang: 'en' },
        { url: 'https://www.youtube.com/watch?v=2MOVKl_Zk80', title: 'How To Play Violin with a Singing Tone (INSTANTLY)', lang: 'en' },
      ],
    },
    byLevel: {},
    queries: {
      bow: { title: 'Tìm thêm: đổi vĩ mượt', query: 'violin smooth bow change tutorial' },
      note: { title: 'Tìm thêm: legato tay trái', query: 'violin left hand legato slurs finger changes lesson' },
      cross: { title: 'Tìm thêm: chuyển dây mượt', query: 'violin smooth string crossing tutorial' },
      vib: { title: 'Tìm thêm: vibrato liên tục', query: 'violin continuous vibrato through bow changes' },
      vibcross: { title: 'Tìm thêm: vibrato qua chuyển dây', query: 'violin continuous vibrato across string crossings' },
      cantabile: { title: 'Tìm thêm: kéo như hát', query: 'violin cantabile singing tone legato phrasing' },
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
