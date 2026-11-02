/**
 * Nội dung chi tiết cho màn hình xem sự kiện (sheet toàn màn hình): ý nghĩa, phong tục / hoạt động, điều thú vị.
 * Khoá = id trong data/holidays.js. Ngày lễ nào chưa có mục ở đây thì dùng mô tả ngắn `desc` thay thế.
 *
 *  meaning: mảng đoạn văn (mỗi phần tử một đoạn)
 *  customs: danh sách phong tục, hoạt động thường làm
 *  fact:    (tuỳ chọn) một điều thú vị
 */
export const HOLIDAY_DETAILS = {
  'tet-duong': {
    meaning: [
      'Tết Dương lịch đánh dấu ngày đầu tiên của năm mới theo lịch Gregory – loại lịch được dùng phổ biến nhất trên thế giới. Với người Việt, đây là ngày nghỉ lễ chính thức và là cột mốc để nhìn lại một năm đã qua, đặt ra những mục tiêu mới.',
      'Dù không mang sắc thái đoàn viên đậm đà như Tết Nguyên Đán, Tết Dương lịch là dịp để bạn bè, đồng nghiệp gặp gỡ, đi chơi và đón chào năm mới trong không khí vui tươi, rộn ràng.'
    ],
    customs: [
      'Đếm ngược và xem pháo hoa đêm 31/12 tại các quảng trường, trung tâm thành phố',
      'Gửi lời chúc, thiệp và quà nhỏ cho người thân, bạn bè',
      'Tổng kết năm cũ, lập kế hoạch và đặt mục tiêu cho năm mới',
      'Tranh thủ kỳ nghỉ để du lịch, về quê hoặc nghỉ ngơi'
    ],
    fact: 'Lịch Gregory đang dùng được ban hành năm 1582 bởi Giáo hoàng Gregory XIII nhằm chỉnh lại sai lệch của lịch Julian.'
  },
  valentine: {
    meaning: [
      'Lễ Tình nhân (Valentine) diễn ra vào ngày 14/2, là dịp để những người yêu nhau bày tỏ tình cảm. Ngày lễ gắn với tên thánh Valentine – vị thánh được nhắc đến trong nhiều truyền thuyết về tình yêu và sự hy sinh – rồi dần lan rộng khắp thế giới.',
      'Ở Việt Nam, Valentine phổ biến mạnh trong giới trẻ. Không chỉ dành cho các cặp đôi, nhiều người còn nhân dịp này gửi lời yêu thương đến gia đình và bạn bè.'
    ],
    customs: [
      'Tặng hoa hồng, sô-cô-la, thiệp hoặc những món quà nhỏ có ý nghĩa',
      'Cùng nhau đi ăn tối, xem phim hay dạo phố',
      'Viết thư tay, nói lời yêu thương hoặc lời cảm ơn đến người mình quý mến'
    ]
  },
  'phu-nu-vn': {
    meaning: [
      'Ngày Quốc tế Phụ nữ 8/3 tôn vinh những đóng góp của phụ nữ trong gia đình và xã hội, đồng thời nhắc nhớ cuộc đấu tranh vì quyền bình đẳng, quyền bầu cử và điều kiện làm việc công bằng của phụ nữ trên toàn thế giới.',
      'Ngày lễ bắt nguồn từ các phong trào của nữ công nhân ở châu Âu và Bắc Mỹ đầu thế kỷ XX, và được Liên Hợp Quốc chính thức kỷ niệm từ năm 1975.'
    ],
    customs: [
      'Tặng hoa, quà và lời chúc cho mẹ, vợ, chị em, bạn bè và đồng nghiệp nữ',
      'Cả nhà cùng nấu bữa ăn hoặc đi chơi để dành trọn thời gian cho phụ nữ trong gia đình',
      'Cơ quan, trường học tổ chức gặp mặt, giao lưu và văn nghệ'
    ],
    fact: 'Năm 1975 được Liên Hợp Quốc chọn là Năm Quốc tế Phụ nữ – cũng là năm tổ chức này bắt đầu kỷ niệm ngày 8/3.'
  },
  'thanh-lap-doan': {
    meaning: [
      'Ngày 26/3/1931 được chọn làm ngày thành lập Đoàn Thanh niên Cộng sản Hồ Chí Minh – tổ chức chính trị – xã hội của thanh niên Việt Nam.',
      'Đây là dịp ôn lại truyền thống của các thế hệ thanh niên, đồng thời khơi dậy tinh thần xung kích, tình nguyện và khát vọng cống hiến của tuổi trẻ.'
    ],
    customs: [
      'Tháng Ba hằng năm là Tháng Thanh niên với nhiều hoạt động tình nguyện',
      'Lễ kỷ niệm, gặp mặt cựu cán bộ Đoàn, các chương trình văn nghệ, thể thao',
      'Các hoạt động cộng đồng như dọn vệ sinh, trồng cây, hiến máu tình nguyện'
    ]
  },
  'giai-phong': {
    meaning: [
      'Ngày 30/4/1975 đánh dấu thời khắc Chiến dịch Hồ Chí Minh toàn thắng, miền Nam được giải phóng và đất nước thống nhất sau nhiều năm chiến tranh kéo dài.',
      'Đây là ngày lễ lớn của dân tộc, gợi nhớ sự hy sinh của biết bao thế hệ và khát vọng hòa bình, thống nhất. Kết hợp với Quốc tế Lao động 1/5, người dân thường có kỳ nghỉ dài vào dịp này.'
    ],
    customs: [
      'Treo cờ Tổ quốc, tổ chức lễ kỷ niệm, diễu hành và bắn pháo hoa ở nhiều thành phố',
      'Viếng nghĩa trang liệt sĩ, tham quan các di tích lịch sử như Dinh Độc Lập, địa đạo Củ Chi',
      'Tận dụng kỳ nghỉ lễ để về quê hoặc đi du lịch cùng gia đình'
    ]
  },
  'quoc-te-lao-dong': {
    meaning: [
      'Ngày 1/5 tôn vinh người lao động trên toàn thế giới. Ngày lễ bắt nguồn từ cuộc đấu tranh của công nhân Mỹ năm 1886 đòi chế độ làm việc 8 giờ mỗi ngày, nổi bật là cuộc biểu tình ở Chicago.',
      'Tại Việt Nam, đây là ngày nghỉ lễ chính thức, nhắc mọi người về giá trị của lao động và quyền lợi chính đáng của người lao động.'
    ],
    customs: [
      'Nghỉ lễ, đoàn tụ gia đình hoặc đi du lịch',
      'Công đoàn các cơ quan, doanh nghiệp tổ chức gặp mặt, tuyên dương người lao động tiêu biểu',
      'Nhiều nơi tổ chức hội chợ, văn nghệ và hoạt động thể thao'
    ],
    fact: 'Khẩu hiệu "tám giờ làm việc, tám giờ nghỉ ngơi, tám giờ cho bản thân" là tinh thần cốt lõi của phong trào năm 1886.'
  },
  'chien-thang-dbp': {
    meaning: [
      'Ngày 7/5/1954, sau 56 ngày đêm chiến đấu, quân đội ta giành thắng lợi hoàn toàn trong Chiến dịch Điện Biên Phủ, mở đường cho Hiệp định Geneva năm 1954 về chấm dứt chiến tranh ở Đông Dương.',
      'Chiến thắng này được xem là mốc son chói lọi trong lịch sử dân tộc, có tiếng vang lớn đối với phong trào giải phóng dân tộc trên thế giới.'
    ],
    customs: [
      'Lễ kỷ niệm, dâng hương tại Nghĩa trang liệt sĩ đồi A1 và Khu di tích Điện Biên Phủ',
      'Tham quan Bảo tàng Chiến thắng Lịch sử Điện Biên Phủ, đồi A1, hầm Đờ Cát',
      'Chiếu phim, triển lãm, giao lưu với nhân chứng lịch sử'
    ]
  },
  'quoc-te-thieu-nhi': {
    meaning: [
      'Ngày 1/6 dành riêng cho trẻ em trên toàn thế giới, nhắc người lớn về trách nhiệm bảo vệ, chăm sóc và tạo điều kiện để trẻ được học tập, vui chơi và phát triển toàn diện.',
      'Ở Việt Nam, đây là dịp các em nhỏ được đón nhận nhiều quà tặng, hoạt động vui chơi và sự quan tâm của gia đình, nhà trường, xã hội.'
    ],
    customs: [
      'Tặng quà, đưa các bé đi công viên, rạp chiếu phim hoặc khu vui chơi',
      'Nhà trường, địa phương tổ chức hội diễn, trò chơi dân gian, phát quà cho thiếu nhi',
      'Các chương trình thiện nguyện hướng đến trẻ em có hoàn cảnh khó khăn'
    ]
  },
  'gia-dinh-vn': {
    meaning: [
      'Ngày Gia đình Việt Nam 28/6 được tổ chức từ năm 2001 nhằm tôn vinh những giá trị tốt đẹp của gia đình – nơi nuôi dưỡng nhân cách, gìn giữ truyền thống và là chỗ dựa tinh thần của mỗi người.',
      'Ngày này khuyến khích các thành viên dành nhiều thời gian hơn cho nhau, vun đắp tình cảm ông bà, cha mẹ, con cháu giữa nhịp sống hiện đại bận rộn.'
    ],
    customs: [
      'Cả nhà cùng nấu một bữa cơm, đi dã ngoại hoặc chơi trò chơi gia đình',
      'Gửi lời cảm ơn, ảnh kỷ niệm hay những món quà nhỏ đến ông bà, cha mẹ',
      'Các địa phương tổ chức hội thi, giao lưu về gia đình văn hóa, gia đình hạnh phúc'
    ]
  },
  'thuong-binh': {
    meaning: [
      'Ngày 27/7 là dịp cả nước tri ân những người đã hy sinh xương máu vì độc lập, tự do của Tổ quốc: các anh hùng liệt sĩ, thương binh, bệnh binh và gia đình có công với cách mạng.',
      'Ngày này được tổ chức từ năm 1947 và trở thành nét đẹp truyền thống "uống nước nhớ nguồn" của dân tộc Việt Nam.'
    ],
    customs: [
      'Dâng hương, đặt vòng hoa tại các nghĩa trang liệt sĩ, đài tưởng niệm',
      'Thăm hỏi, tặng quà các gia đình chính sách, thương binh, Mẹ Việt Nam anh hùng',
      'Các hoạt động đền ơn đáp nghĩa: xây nhà tình nghĩa, chăm sóc nghĩa trang'
    ]
  },
  'cach-mang-t8': {
    meaning: [
      'Cách mạng tháng Tám năm 1945 là cuộc tổng khởi nghĩa giành chính quyền trên phạm vi cả nước, mở ra kỷ nguyên độc lập, tự do cho dân tộc. Ngày 19/8/1945, nhân dân Hà Nội khởi nghĩa giành chính quyền thành công, tạo sức lan tỏa mạnh mẽ đến các địa phương.',
      'Ngày kỷ niệm nhắc thế hệ hôm nay về ý chí đoàn kết và tinh thần chủ động nắm bắt thời cơ của cha ông.'
    ],
    customs: [
      'Lễ kỷ niệm, chương trình nghệ thuật, triển lãm tư liệu lịch sử',
      'Thăm Nhà hát Lớn Hà Nội – nơi diễn ra cuộc mít-tinh lớn ngày 19/8/1945'
    ]
  },
  'quoc-khanh': {
    meaning: [
      'Ngày 2/9/1945, tại Quảng trường Ba Đình (Hà Nội), Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa. Từ đó, 2/9 trở thành ngày Quốc khánh của dân tộc.',
      'Đây là ngày lễ lớn nhất trong năm về mặt quốc gia, gợi nhắc giá trị độc lập, tự do và niềm tự hào dân tộc.'
    ],
    customs: [
      'Treo cờ Tổ quốc khắp phố phường, lễ chào cờ, mít-tinh và diễu hành',
      'Xem pháo hoa, chương trình nghệ thuật tại các thành phố lớn',
      'Cả gia đình tranh thủ kỳ nghỉ để du lịch, về quê'
    ],
    fact: 'Phần mở đầu Tuyên ngôn Độc lập năm 1945 có trích dẫn Tuyên ngôn Độc lập của Hoa Kỳ và Tuyên ngôn Nhân quyền và Dân quyền của Pháp.'
  },
  'phu-nu-vietnam': {
    meaning: [
      'Ngày 20/10 kỷ niệm ngày thành lập Hội Liên hiệp Phụ nữ Việt Nam (20/10/1930), tôn vinh vai trò và đóng góp của phụ nữ Việt Nam trong kháng chiến, xây dựng đất nước và chăm lo gia đình.',
      'Đây là dịp để mọi người bày tỏ lòng biết ơn và trân trọng những người phụ nữ quanh mình: mẹ, bà, vợ, con gái, đồng nghiệp.'
    ],
    customs: [
      'Tặng hoa, quà, thiệp chúc mừng; nấu hoặc đặt một bữa ăn đặc biệt',
      'Cơ quan, trường học tổ chức tiệc mừng, giao lưu, văn nghệ',
      'Hội Phụ nữ các cấp tổ chức hoạt động từ thiện, tuyên dương phụ nữ tiêu biểu'
    ]
  },
  'nha-giao': {
    meaning: [
      'Ngày Nhà giáo Việt Nam 20/11 là dịp học sinh, sinh viên và cả xã hội bày tỏ lòng biết ơn đối với thầy cô – những người truyền kiến thức và nuôi dưỡng nhân cách. Truyền thống "tôn sư trọng đạo" được đề cao trong ngày này.',
      'Ngày lễ được tổ chức chính thức dưới tên "Ngày Nhà giáo Việt Nam" từ năm 1982.'
    ],
    customs: [
      'Học sinh tặng hoa, thiệp, viết thư cảm ơn thầy cô',
      'Trường học tổ chức lễ kỷ niệm, văn nghệ, hội diễn và gặp mặt cựu giáo viên',
      'Cựu học sinh về thăm thầy cô cũ, ôn lại kỷ niệm'
    ],
    fact: 'Tục ngữ "Không thầy đố mày làm nên" là cách ông cha ta ngợi ca công lao của người thầy.'
  },
  qdnd: {
    meaning: [
      'Ngày 22/12/1944, tại khu rừng Trần Hưng Đạo (Cao Bằng), Đội Việt Nam Tuyên truyền Giải phóng quân – tiền thân của Quân đội Nhân dân Việt Nam – được thành lập với 34 chiến sĩ, do đồng chí Võ Nguyên Giáp chỉ huy.',
      'Ngày kỷ niệm là dịp tôn vinh truyền thống anh hùng của lực lượng vũ trang và tình quân dân gắn bó.'
    ],
    customs: [
      'Lễ kỷ niệm, gặp mặt cựu chiến binh, tuyên dương đơn vị và cá nhân tiêu biểu',
      'Ngày hội Quốc phòng toàn dân với nhiều hoạt động giao lưu',
      'Tham quan các bảo tàng quân sự, thăm hỏi gia đình chính sách'
    ]
  },
  halloween: {
    meaning: [
      'Halloween diễn ra vào đêm 31/10, trước Lễ Các Thánh (1/11) của Kitô giáo. Ngày lễ bắt nguồn từ Samhain – lễ hội cuối mùa thu của người Celt cổ, thời điểm được tin là ranh giới giữa người sống và người đã khuất trở nên mong manh.',
      'Ngày nay, Halloween là lễ hội hóa trang vui nhộn, nổi tiếng với đèn bí ngô, trang phục ma quái và trò "trick or treat". Ở Việt Nam, lễ hội được giới trẻ, các khu vui chơi và quán cà phê đón nhận nhiệt tình.'
    ],
    customs: [
      'Hóa trang thành phù thủy, ma cà rồng, bộ xương hay nhân vật yêu thích',
      'Khắc đèn bí ngô (jack-o\'-lantern) và trang trí nhà cửa với mạng nhện, dơi, hồn ma',
      'Trẻ em đi xin kẹo "trick or treat" – cho kẹo hay bị ghẹo',
      'Tổ chức tiệc hóa trang, xem phim kinh dị cùng bạn bè'
    ],
    fact: 'Đèn jack-o\'-lantern ban đầu được khắc từ củ cải ở Ireland; khi sang Mỹ, người ta chuyển sang dùng bí ngô vì dễ kiếm và dễ khắc hơn.'
  },
  'giang-sinh': {
    meaning: [
      'Giáng Sinh (Noel) là lễ mừng ngày Chúa Giêsu giáng sinh của Kitô giáo, diễn ra vào 25/12 hằng năm. Đêm 24/12 – đêm Vọng Giáng Sinh – là thời khắc linh thiêng với thánh lễ nửa đêm ở các nhà thờ.',
      'Tại Việt Nam, dù không phải ngày nghỉ lễ chính thức, Giáng Sinh đã trở thành dịp lễ hội chung: phố phường rực rỡ ánh đèn, mọi người cùng nhau tụ họp, tặng quà và chia sẻ yêu thương, bất kể tôn giáo.'
    ],
    customs: [
      'Dựng hang đá, trang trí cây thông Noel và treo đèn nhấp nháy',
      'Dự thánh lễ đêm Vọng, dạo phố ngắm trang trí nhà thờ vào đêm 24/12',
      'Tặng quà, gửi thiệp; trẻ em mong chờ quà từ ông già Noel',
      'Sum họp gia đình, bạn bè bên bữa tiệc với bánh khúc cây, gà nướng...'
    ],
    fact: 'Hình ảnh ông già Noel được lấy cảm hứng từ Thánh Nicholas – vị giám mục nổi tiếng với lòng hảo tâm và những món quà bí mật.'
  },
  'giao-thua': {
    meaning: [
      'Giao thừa là thời khắc chuyển giao giữa năm cũ và năm mới theo âm lịch – khoảnh khắc thiêng liêng nhất của Tết cổ truyền. Người Việt tin rằng đây là lúc trời đất giao hòa, vận hạn cũ đi qua và vận may mới bắt đầu.',
      'Cả gia đình thường quây quần bên nhau, thắp hương cúng tiễn thần cũ, đón thần mới, cầu mong một năm bình an, thuận lợi.'
    ],
    customs: [
      'Cúng giao thừa ngoài trời và trong nhà để tiễn quan cũ, đón quan mới',
      'Xem pháo hoa, đi chùa hái lộc, lễ đầu năm',
      'Chúc Tết người thân ngay phút chuyển giao, lì xì cho con trẻ',
      'Giữ lời nói nhẹ nhàng, tránh cãi vã để cả năm thuận hòa'
    ]
  },
  'tet-nguyen-dan': {
    meaning: [
      'Tết Nguyên Đán – mùng 1 tháng Giêng âm lịch – là lễ hội truyền thống lớn nhất của người Việt, đánh dấu khởi đầu của một năm mới và mùa xuân. "Nguyên" là khởi đầu, "Đán" là buổi sáng sớm: Nguyên Đán nghĩa là buổi sáng đầu tiên của năm.',
      'Tết là dịp đoàn viên, tưởng nhớ tổ tiên, thăm hỏi họ hàng, gác lại muộn phiền năm cũ và gửi gắm hy vọng vào một năm mới tốt đẹp hơn.'
    ],
    customs: [
      'Dọn dẹp nhà cửa, cắm hoa đào, hoa mai, cây quất; bày mâm ngũ quả',
      'Gói bánh chưng, bánh tét; nấu các món truyền thống ngày Tết',
      'Cúng tổ tiên, xông đất, mừng tuổi (lì xì), chúc Tết ông bà, cha mẹ, họ hàng',
      'Kiêng quét nhà, kiêng cãi vã trong những ngày đầu năm'
    ],
    fact: 'Bánh chưng tượng trưng cho đất, bánh giầy tượng trưng cho trời – gắn với truyền thuyết Lang Liêu thời Hùng Vương.'
  },
  'tet-nguyen-tieu': {
    meaning: [
      'Rằm tháng Giêng (Tết Nguyên Tiêu, còn gọi là Lễ Thượng Nguyên) là đêm trăng tròn đầu tiên của năm mới. Người Việt coi đây là ngày khép lại không khí Tết, đồng thời là ngày lễ Phật quan trọng để cầu bình an, tài lộc cho cả năm.',
      'Nhiều gia đình thắp hương, dâng hoa quả, xôi chè lên bàn thờ và đi chùa lễ đầu năm, cầu cho mọi việc hanh thông.'
    ],
    customs: [
      'Đi chùa lễ Phật, cầu an, xin lộc đầu năm',
      'Cúng rằm tại gia với hương hoa, trái cây, xôi chè',
      'Ăn chay hoặc làm việc thiện vào ngày rằm',
      'Ngắm trăng rằm đầu năm; nhiều nơi tổ chức hội xuân, thả đèn hoa đăng'
    ]
  },
  'han-thuc': {
    meaning: [
      'Tết Hàn Thực (mùng 3 tháng Ba âm lịch) có nguồn gốc từ Trung Hoa, gắn với tích Giới Tử Thôi, theo đó người dân kiêng lửa và ăn đồ nguội để tưởng nhớ ông. Khi vào Việt Nam, Tết được Việt hóa thành dịp làm bánh trôi, bánh chay và tưởng nhớ tổ tiên.',
      'Bánh trôi trắng ngần, nhân đường phèn bên trong, gợi sự tròn đầy và nghĩa tình vẹn nguyên; bánh chay thanh nhẹ, hợp với tiết xuân muộn.'
    ],
    customs: [
      'Làm bánh trôi, bánh chay để cúng gia tiên rồi cả nhà cùng thưởng thức',
      'Cúng tổ tiên, nhớ về cội nguồn',
      'Một số nơi vẫn giữ tục ăn đồ nguội trong ngày'
    ],
    fact: '"Hàn thực" nghĩa là "ăn đồ lạnh".'
  },
  'gio-to-hung-vuong': {
    meaning: [
      'Giỗ Tổ Hùng Vương (mùng 10 tháng Ba âm lịch) là ngày cả dân tộc hướng về cội nguồn, tưởng nhớ các Vua Hùng đã có công dựng nước Văn Lang – nhà nước đầu tiên của người Việt. Lễ hội chính được tổ chức tại Đền Hùng, Phú Thọ.',
      'Ngày này là ngày nghỉ lễ chính thức từ năm 2007; tín ngưỡng thờ cúng Hùng Vương ở Phú Thọ được UNESCO ghi danh là Di sản văn hóa phi vật thể đại diện của nhân loại năm 2012.'
    ],
    customs: [
      'Dâng hương tại Đền Hùng, dâng bánh chưng, bánh giầy',
      'Tham dự các hoạt động hội: hát xoan, rước kiệu, thi gói bánh chưng',
      'Nhiều địa phương, dòng họ và đền thờ cũng tổ chức giỗ Tổ riêng'
    ],
    fact: 'Ca dao: "Dù ai đi ngược về xuôi, nhớ ngày giỗ Tổ mùng mười tháng Ba."'
  },
  'phat-dan': {
    meaning: [
      'Lễ Phật Đản (rằm tháng Tư âm lịch) kỷ niệm ngày Đản sinh của Đức Phật Thích Ca Mâu Ni, người sáng lập Phật giáo. Đây là một trong những ngày lễ lớn nhất của cộng đồng Phật tử trên thế giới, mang thông điệp về từ bi, trí tuệ và hòa bình.',
      'Ở Việt Nam, Phật Đản còn là ngày hội văn hóa tâm linh, nơi mọi người đến chùa cầu nguyện, làm việc thiện và tìm sự an yên trong tâm hồn.'
    ],
    customs: [
      'Lễ tắm Phật – rưới nước thơm lên tượng Phật sơ sinh',
      'Đi chùa, nghe pháp thoại, rước kiệu Phật, thả đèn hoa đăng',
      'Ăn chay, phóng sinh, làm từ thiện, cúng dường',
      'Trang hoàng chùa chiền bằng hoa sen, đèn lồng, cờ Phật giáo'
    ]
  },
  'doan-ngo': {
    meaning: [
      'Tết Đoan Ngọ (mùng 5 tháng Năm âm lịch), còn gọi là Tết diệt sâu bọ, rơi vào giữa mùa hè khi khí hậu nóng ẩm, dễ phát sinh dịch bệnh. Người xưa tin rằng ăn đồ chua, cơm rượu nếp vào buổi sáng sẽ giúp "diệt sâu bọ" trong cơ thể.',
      'Đoan Ngọ cũng là dịp cúng tổ tiên bằng hoa quả đầu mùa, bày tỏ lòng biết ơn thiên nhiên đã ban mùa màng.'
    ],
    customs: [
      'Ăn cơm rượu (rượu nếp) và trái cây như mận, vải, dưa hấu vào sáng sớm',
      'Ăn bánh tro (bánh ú tro) – món đặc trưng của ngày Tết này',
      'Hái lá thuốc (ngải cứu, kinh giới...) đúng giờ Ngọ (khoảng 11–13 giờ) để phơi dùng dần',
      'Cúng tổ tiên bằng hoa quả mùa hè'
    ]
  },
  'vu-lan': {
    meaning: [
      'Lễ Vu Lan (rằm tháng Bảy âm lịch) là ngày lễ báo hiếu gắn với tích Mục Kiền Liên cứu mẹ trong kinh Phật. Đây là dịp thiêng liêng để mỗi người con tỏ lòng biết ơn công ơn sinh thành, dưỡng dục của cha mẹ, ông bà.',
      'Cùng ngày còn có lễ xá tội vong nhân: cúng chúng sinh cô hồn, thể hiện lòng nhân ái và tinh thần "thương người như thể thương thân".'
    ],
    customs: [
      'Đi chùa, nghe pháp thoại về chữ hiếu, tham dự lễ cài hoa hồng',
      'Cài hoa hồng lên áo: hồng đỏ cho người còn mẹ, hồng trắng cho người đã mất mẹ',
      'Cúng gia tiên, cúng chúng sinh, làm việc thiện, phóng sinh',
      'Về thăm, chăm sóc ông bà, cha mẹ'
    ]
  },
  'trung-thu': {
    meaning: [
      'Tết Trung Thu (rằm tháng Tám âm lịch) diễn ra khi trăng tròn và sáng nhất trong năm, giữa mùa thu. Ngày Tết có nguồn gốc từ tục cúng trăng, mừng mùa thu hoạch của người xưa, dần trở thành Tết của thiếu nhi với đèn lồng, bánh nướng, bánh dẻo.',
      'Đây cũng là Tết đoàn viên: người lớn dành thời gian cho con trẻ, cả nhà quây quần bên mâm cỗ trăng rằm, ngắm trăng và kể chuyện chú Cuội, chị Hằng.'
    ],
    customs: [
      'Phá cỗ trông trăng: bày bánh nướng, bánh dẻo, hoa quả, đèn ông sao',
      'Rước đèn ông sao, múa lân – sư – rồng, hát đồng dao',
      'Tặng bánh Trung Thu cho người thân, đối tác như một lời tri ân',
      'Kể chuyện chú Cuội, chị Hằng, thỏ ngọc cho trẻ nhỏ'
    ]
  },
  'ong-cong-ong-tao': {
    meaning: [
      'Ngày 23 tháng Chạp (tháng 12 âm lịch) là ngày tiễn Táo Quân – các vị thần cai quản bếp lửa mỗi gia đình – lên trời chầu Ngọc Hoàng, báo cáo mọi việc trong nhà suốt một năm qua. Đây cũng là dấu mốc báo hiệu Tết đã cận kề.',
      'Ngày này gửi gắm mong ước một năm mới bếp lửa luôn ấm, cơm no áo ấm, gia đạo bình an và may mắn.'
    ],
    customs: [
      'Cúng Ông Công, Ông Táo với xôi, chè, hoa quả, vàng mã và cá chép',
      'Thả cá chép ra sông, ao, hồ – cá chép được tin là phương tiện đưa Táo Quân lên trời',
      'Dọn dẹp bếp núc, nhà cửa để chuẩn bị đón Tết'
    ],
    fact: 'Trong tín ngưỡng dân gian, Táo Quân gồm hai ông và một bà.'
  }
}

export function getHolidayDetail(holiday) {
  return HOLIDAY_DETAILS[holiday.id] ?? { meaning: [holiday.desc], customs: [] }
}
