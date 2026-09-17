export interface RoomOneQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number | number[];
  isMulti?: boolean;
}

export interface RoomOneGameplayData {
  hasTimer: boolean;
  timerDuration: number;
  quizzes: RoomOneQuizQuestion[];
  historyText: string;
  clueText: string;
  isFinalRound?: boolean;
}

export const ROOM_ONE_REQUIRED_CLUE_IDS = [
  'exhibit-coupon',
  'exhibit-world-1911-1917',
  'exhibit-versailles-1919',
  'exhibit-lenin-theses-1920',
  'exhibit-tours-1920',
  'exhibit-guangzhou-1925-1927',
] as const;

export const ROOM_ONE_FINAL_ARCHIVE_IMAGE_ID = 'exhibit-convergence-1930';
export const ROOM_ONE_FINAL_EXHIBIT_ID = 'room-one-final-archive';

export const ROOM_ONE_GAMEPLAY: Record<string, RoomOneGameplayData> = {
  'exhibit-coupon': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Nguyễn Tất Thành rời Tổ quốc tìm đường cứu nước vào thời gian nào?',
        options: ['Ngày 5/6/1911', 'Ngày 3/2/1930', 'Ngày 2/9/1945', 'Ngày 19/5/1890'],
        correctIndex: 0,
      },
      {
        question: 'Sự kiện Nguyễn Tất Thành ra đi từ Bến Nhà Rồng có ý nghĩa gì?',
        options: [
          'Mở đầu công cuộc xây dựng đất nước sau chiến tranh',
          'Đánh dấu sự thành lập một tổ chức chính trị mới',
          'Là điểm khởi đầu của hành trình tìm đường cứu nước',
          'Kết thúc các phong trào cứu nước đương thời',
        ],
        correctIndex: 2,
      },
    ],
    historyText: 'NGƯỜI RA ĐI — Bến Nhà Rồng – 05/06/1911. Ngày 5/6/1911, từ Bến Nhà Rồng, người thanh niên Nguyễn Tất Thành rời Tổ quốc trên tàu Amiral Latouche-Tréville. Trong bối cảnh các phong trào cứu nước đương thời chưa tìm được con đường giải phóng dân tộc phù hợp, Nguyễn Tất Thành quyết định ra nước ngoài để tìm hiểu thế giới và tìm một con đường mới cho dân tộc Việt Nam. Ý nghĩa: Đây là điểm khởi đầu của hành trình tìm đường cứu nước.',
    clueText: 'BẾN NHÀ RỒNG · 1911 · RA ĐI',
  },
  'exhibit-world-1911-1917': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Trong giai đoạn 1911–1917, trải nghiệm thực tiễn giúp Nguyễn Tất Thành nhận ra điều gì?',
        options: [
          'Sự áp bức chỉ tồn tại tại Việt Nam',
          'Nhân dân thuộc địa ở nhiều nơi đều chịu áp bức và bóc lột',
          'Người lao động tại các nước tư bản đều có cuộc sống sung túc',
          'Các nước thuộc địa không có điểm chung với nhau',
        ],
        correctIndex: 1,
      },
      {
        question: 'Cuối năm 1917, Nguyễn Tất Thành trở lại Pháp và bước sang giai đoạn nào?',
        options: [
          'Ngừng tìm hiểu tình hình thế giới để trở về Việt Nam',
          'Chỉ tiếp tục làm việc trên các tàu biển',
          'Từ quan sát, trải nghiệm sang tham gia tích cực hơn vào hoạt động chính trị',
          'Rời châu Âu để định cư lâu dài tại Hoa Kỳ',
        ],
        correctIndex: 2,
      },
    ],
    historyText: 'NHÌN RA THẾ GIỚI — 1911–1917. Sau khi rời Bến Nhà Rồng năm 1911, Nguyễn Tất Thành bắt đầu hành trình quan sát và tìm hiểu thế giới. Trên đường sang Pháp, Người đi qua Singapore, Colombo, Port Said rồi đến Marseille. Năm 1912, Người tiếp tục qua Tây Ban Nha, Bồ Đào Nha và nhiều vùng thuộc địa ở châu Phi. Cuối năm 1912, Người đến Hoa Kỳ; khoảng cuối năm 1913, Người sang Anh và sống, lao động tại đây đến khoảng năm 1917. Cuối năm 1917, Người trở lại Pháp, chuyển từ chủ yếu quan sát và trải nghiệm thực tế sang tham gia ngày càng tích cực vào các hoạt động chính trị. Ý nghĩa: Sáu năm đi qua nhiều quốc gia và châu lục giúp Người nhận ra sự áp bức không chỉ tồn tại ở Việt Nam, từng bước phân biệt nhân dân lao động với các lực lượng thực dân và nhận thức sự gần gũi giữa các dân tộc bị áp bức.',
    clueText: 'PHÁP · CHÂU PHI · HOA KỲ · ANH · LAO ĐỘNG · QUAN SÁT',
  },
  'exhibit-versailles-1919': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Nội dung chính của 8 điểm trong “Yêu sách của nhân dân An Nam” là gì?',
        options: [
          'Yêu cầu giành độc lập hoàn toàn ngay lập tức',
          'Đòi các quyền tự do, dân chủ và bình đẳng cơ bản cho người Việt Nam',
          'Đề nghị Pháp mở rộng hoạt động thương mại tại Việt Nam',
          'Yêu cầu thành lập một liên minh quân sự mới',
        ],
        correctIndex: 1,
      },
      {
        question: 'Việc các cường quốc không đáp ứng bản yêu sách giúp Nguyễn Ái Quốc nhận thức rõ điều gì?',
        options: [
          'Các dân tộc thuộc địa có thể hoàn toàn trông chờ vào lời hứa của các cường quốc',
          'Chỉ cần tiếp tục gửi thêm yêu sách là có thể giành độc lập',
          'Muốn giải phóng dân tộc phải tìm con đường hiệu quả hơn, không phụ thuộc vào sự ban phát của các nước đế quốc',
          'Hoạt động chính trị tại diễn đàn quốc tế không có bất kỳ ý nghĩa nào',
        ],
        correctIndex: 2,
      },
    ],
    historyText: 'TIẾNG NÓI CỦA MỘT DÂN TỘC — Paris, 18/06/1919. Nguyễn Ái Quốc gửi Yêu sách của nhân dân An Nam gồm 8 điểm tới Hội nghị Versailles, đòi các quyền tự do, dân chủ và bình đẳng cơ bản cho người Việt Nam. Các yêu cầu không được đáp ứng, giúp Người nhận thức rõ rằng các dân tộc thuộc địa không thể chỉ trông chờ vào sự ban phát của các cường quốc và cần tìm một con đường giải phóng hiệu quả hơn.',
    clueText: 'VERSAILLES 1919 · NGUYỄN ÁI QUỐC · 8 ĐIỂM YÊU SÁCH · TỰ DO · DÂN CHỦ · BÌNH ĐẲNG',
  },
  'exhibit-lenin-theses-1920': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Luận cương của V.I. Lênin mà Nguyễn Ái Quốc đọc tháng 7/1920 đề cập trực tiếp đến vấn đề nào?',
        options: [
          'Vấn đề dân tộc và thuộc địa',
          'Cải cách hệ thống giáo dục tại Pháp',
          'Phát triển thương mại giữa các nước châu Âu',
          'Tổ chức lại Hội nghị Versailles',
        ],
        correctIndex: 0,
      },
      {
        question: 'Sau khi tiếp cận Luận cương của Lênin, Nguyễn Ái Quốc xác định phương hướng nào cho sự nghiệp giải phóng dân tộc?',
        options: [
          'Tiếp tục trông chờ sự giúp đỡ của các cường quốc đế quốc',
          'Đi theo con đường cách mạng vô sản, gắn với lực lượng cách mạng của quần chúng',
          'Chỉ đấu tranh bằng cách gửi yêu sách tới các hội nghị quốc tế',
          'Tách cuộc đấu tranh của Việt Nam khỏi phong trào cách mạng thế giới',
        ],
        correctIndex: 1,
      },
    ],
    historyText: 'ÁNH SÁNG CỦA CON ĐƯỜNG — Paris, tháng 7/1920. Nguyễn Ái Quốc đọc Sơ thảo lần thứ nhất những luận cương về vấn đề dân tộc và vấn đề thuộc địa của V.I. Lênin. Luận cương giúp Người xác định con đường cách mạng vô sản là phương hướng cơ bản để giải phóng dân tộc Việt Nam, đánh dấu bước ngoặt quyết định về tư tưởng sau gần một thập kỷ tìm tòi và khảo nghiệm thực tiễn.',
    clueText: 'LUẬN CƯƠNG LÊNIN · DÂN TỘC & THUỘC ĐỊA · 1920 · CÁCH MẠNG VÔ SẢN',
  },
  'exhibit-tours-1920': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Tại Đại hội Tours tháng 12/1920, Nguyễn Ái Quốc đã đưa ra lựa chọn nào?',
        options: [
          'Phản đối việc gia nhập Quốc tế Cộng sản',
          'Bỏ phiếu tán thành gia nhập Quốc tế III',
          'Rời Đảng Xã hội Pháp để trở về Việt Nam ngay lập tức',
          'Tiếp tục chỉ gửi yêu sách tới các cường quốc',
        ],
        correctIndex: 1,
      },
      {
        question: 'Sự lựa chọn tại Đại hội Tours đánh dấu bước chuyển biến nào của Nguyễn Ái Quốc?',
        options: [
          'Từ một người yêu nước đang tìm đường trở thành một người cộng sản',
          'Từ hoạt động chính trị chuyển hoàn toàn sang hoạt động thương mại',
          'Từ ủng hộ cách mạng vô sản chuyển sang dựa vào các nước đế quốc',
          'Từ đấu tranh quốc tế chuyển sang từ bỏ mục tiêu giải phóng dân tộc',
        ],
        correctIndex: 0,
      },
    ],
    historyText: 'SỰ LỰA CHỌN LỊCH SỬ — Tours, Pháp, tháng 12/1920. Nguyễn Ái Quốc tham dự Đại hội lần thứ XVIII của Đảng Xã hội Pháp, bỏ phiếu tán thành gia nhập Quốc tế Cộng sản và trở thành một trong những thành viên tham gia sáng lập Đảng Cộng sản Pháp. Sự kiện đánh dấu bước chuyển từ một người yêu nước đang tìm kiếm con đường cứu nước thành một người cộng sản, chính thức lựa chọn con đường cách mạng vô sản để giải phóng dân tộc.',
    clueText: 'ĐẠI HỘI TOURS · QUỐC TẾ III · ĐẢNG CỘNG SẢN PHÁP · CÁCH MẠNG VÔ SẢN · LỰA CHỌN',
  },
  'exhibit-guangzhou-1925-1927': {
    hasTimer: false,
    timerDuration: 0,
    quizzes: [
      {
        question: 'Tháng 6/1925 tại Quảng Châu, Nguyễn Ái Quốc thành lập tổ chức nào?',
        options: ['Hội Việt Nam Cách mạng Thanh niên', 'Đảng Xã hội Pháp', 'Quốc tế Cộng sản', 'Đảng Cộng sản Pháp'],
        correctIndex: 0,
      },
      {
        question: 'Các hoạt động của Nguyễn Ái Quốc tại Quảng Châu nhằm chuẩn bị những mặt nào cho cách mạng Việt Nam?',
        options: [
          'Chỉ chuẩn bị nguồn tài chính và vũ khí',
          'Tư tưởng, chính trị, cán bộ và tổ chức',
          'Chỉ tập trung vào hoạt động ngoại giao',
          'Chỉ nghiên cứu tình hình kinh tế Trung Quốc',
        ],
        correctIndex: 1,
      },
    ],
    historyText: 'CHUẨN BỊ CHO CÁCH MẠNG — Quảng Châu, Trung Quốc, 1925–1927. Nguyễn Ái Quốc thành lập Hội Việt Nam Cách mạng Thanh niên, tổ chức các lớp huấn luyện chính trị, đào tạo cán bộ và truyền bá chủ nghĩa Mác – Lênin vào Việt Nam. Các bài giảng được tập hợp và xuất bản thành Đường Kách Mệnh năm 1927, góp phần chuẩn bị về tư tưởng, chính trị, cán bộ và tổ chức cho cách mạng Việt Nam.',
    clueText: 'QUẢNG CHÂU · HỘI VIỆT NAM CÁCH MẠNG THANH NIÊN · HUẤN LUYỆN CÁN BỘ · ĐƯỜNG KÁCH MỆNH · CHUẨN BỊ TỔ CHỨC',
  },
  [ROOM_ONE_FINAL_EXHIBIT_ID]: {
    hasTimer: false,
    timerDuration: 0,
    isFinalRound: true,
    quizzes: [
      {
        question: 'Kết quả có ý nghĩa quyết định của hành trình tìm đường cứu nước từ năm 1911 đến đầu năm 1930 là gì?',
        options: [
          'Nguyễn Ái Quốc trở về nước ngay sau khi rời Bến Nhà Rồng',
          'Các phong trào yêu nước chấm dứt hoàn toàn',
          'Đảng Cộng sản Việt Nam ra đời đầu năm 1930',
          'Việt Nam giành được độc lập ngay trong năm 1930',
        ],
        correctIndex: 2,
      },
      {
        question: 'Vai trò của Nguyễn Ái Quốc tại Hội nghị hợp nhất các tổ chức cộng sản đầu năm 1930 là gì?',
        options: [
          'Triệu tập và chủ trì hội nghị, thống nhất các tổ chức cộng sản để thành lập Đảng Cộng sản Việt Nam',
          'Chỉ quan sát hội nghị mà không tham gia vào nội dung thảo luận',
          'Lãnh đạo cuộc tổng khởi nghĩa giành chính quyền ngay tại Hồng Kông',
          'Ký hiệp định chấm dứt chiến tranh với thực dân Pháp',
        ],
        correctIndex: 0,
      },
    ],
    historyText: 'HỘI TỤ - Hồng Kông, đầu năm 1930. Từ những trải nghiệm thực tiễn, hoạt động quốc tế, việc tiếp cận chủ nghĩa Mác - Lênin và quá trình chuẩn bị lực lượng, Nguyễn Ái Quốc đã triệu tập hội nghị hợp nhất các tổ chức cộng sản. Sự kiện này dẫn tới sự ra đời của Đảng Cộng sản Việt Nam.',
    clueText: 'Vòng cuối đã hoàn thành',
  },
};
