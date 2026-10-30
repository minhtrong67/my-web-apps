/**
 * Danh sách các ngày lễ, ngày kỷ niệm nổi bật ở Việt Nam
 * type: 'solar' (theo dương lịch, lặp lại hàng năm cùng ngày/tháng)
 *       'lunar' (theo âm lịch, lặp lại hàng năm cùng ngày/tháng âm lịch)
 * category: 'quoc-le' | 'truyen-thong' | 'ky-niem' | 'quoc-te' | 'ton-giao'
 */
export const HOLIDAYS = [
  // ==== Dương lịch ====
  { id: 'tet-duong', name: 'Tết Dương lịch', type: 'solar', day: 1, month: 1, category: 'quoc-le', icon: 'PartyPopper', desc: 'Ngày đầu năm mới theo lịch dương, ngày nghỉ lễ chính thức.' },
  { id: 'valentine', name: 'Lễ Tình nhân (Valentine)', type: 'solar', day: 14, month: 2, category: 'quoc-te', icon: 'Heart', desc: 'Ngày lễ tình yêu được giới trẻ hưởng ứng rộng rãi.' },
  { id: 'phu-nu-vn', name: 'Quốc tế Phụ nữ', type: 'solar', day: 8, month: 3, category: 'quoc-te', icon: 'Flower2', desc: 'Tôn vinh phụ nữ trên toàn thế giới.' },
  { id: 'thanh-lap-doan', name: 'Thành lập Đoàn TNCS Hồ Chí Minh', type: 'solar', day: 26, month: 3, category: 'ky-niem', icon: 'Flag', desc: 'Kỷ niệm ngày thành lập Đoàn Thanh niên Cộng sản Hồ Chí Minh.' },
  { id: 'giai-phong', name: 'Giải phóng miền Nam, thống nhất đất nước', type: 'solar', day: 30, month: 4, category: 'quoc-le', icon: 'Flag', desc: 'Kỷ niệm ngày thống nhất đất nước, ngày nghỉ lễ chính thức.' },
  { id: 'quoc-te-lao-dong', name: 'Quốc tế Lao động', type: 'solar', day: 1, month: 5, category: 'quoc-le', icon: 'HardHat', desc: 'Ngày Quốc tế Lao động, ngày nghỉ lễ chính thức.' },
  { id: 'chien-thang-dbp', name: 'Chiến thắng Điện Biên Phủ', type: 'solar', day: 7, month: 5, category: 'ky-niem', icon: 'Landmark', desc: 'Kỷ niệm chiến thắng lịch sử Điện Biên Phủ năm 1954.' },
  { id: 'quoc-te-thieu-nhi', name: 'Quốc tế Thiếu nhi', type: 'solar', day: 1, month: 6, category: 'quoc-te', icon: 'Baby', desc: 'Ngày dành cho trẻ em trên toàn thế giới.' },
  { id: 'gia-dinh-vn', name: 'Ngày Gia đình Việt Nam', type: 'solar', day: 28, month: 6, category: 'ky-niem', icon: 'Home', desc: 'Tôn vinh giá trị mái ấm gia đình Việt.' },
  { id: 'thuong-binh', name: 'Ngày Thương binh Liệt sĩ', type: 'solar', day: 27, month: 7, category: 'ky-niem', icon: 'Ribbon', desc: 'Tri ân các anh hùng thương binh, liệt sĩ.' },
  { id: 'cach-mang-t8', name: 'Cách mạng tháng Tám', type: 'solar', day: 19, month: 8, category: 'ky-niem', icon: 'Flag', desc: 'Kỷ niệm thành công của Cách mạng tháng Tám năm 1945.' },
  { id: 'quoc-khanh', name: 'Quốc khánh nước CHXHCN Việt Nam', type: 'solar', day: 2, month: 9, category: 'quoc-le', icon: 'Flag', desc: 'Ngày Quốc khánh, ngày nghỉ lễ chính thức.' },
  { id: 'phu-nu-vietnam', name: 'Ngày Phụ nữ Việt Nam', type: 'solar', day: 20, month: 10, category: 'ky-niem', icon: 'Flower2', desc: 'Tôn vinh phụ nữ Việt Nam.' },
  { id: 'nha-giao', name: 'Ngày Nhà giáo Việt Nam', type: 'solar', day: 20, month: 11, category: 'ky-niem', icon: 'GraduationCap', desc: 'Tôn vinh các thầy cô giáo Việt Nam.' },
  { id: 'qdnd', name: 'Thành lập Quân đội Nhân dân Việt Nam', type: 'solar', day: 22, month: 12, category: 'ky-niem', icon: 'Shield', desc: 'Kỷ niệm ngày thành lập Quân đội Nhân dân Việt Nam.' },
  { id: 'giang-sinh', name: 'Lễ Giáng Sinh', type: 'solar', day: 25, month: 12, category: 'quoc-te', icon: 'TreePine', desc: 'Lễ hội mừng Chúa Giáng Sinh, phổ biến khắp Việt Nam.' },

  // ==== Âm lịch ====
  { id: 'giao-thua', name: 'Giao thừa', type: 'lunar', day: 1, month: 1, isEve: true, category: 'truyen-thong', icon: 'Sparkles', desc: 'Thời khắc chuyển giao giữa năm cũ và năm mới âm lịch.' },
  { id: 'tet-nguyen-dan', name: 'Tết Nguyên Đán', type: 'lunar', day: 1, month: 1, category: 'quoc-le', icon: 'PartyPopper', desc: 'Tết cổ truyền lớn nhất trong năm của người Việt.' },
  { id: 'tet-nguyen-tieu', name: 'Tết Nguyên Tiêu (Rằm tháng Giêng)', type: 'lunar', day: 15, month: 1, category: 'ton-giao', icon: 'Moon', desc: 'Rằm đầu tiên của năm mới, ngày lễ Phật quan trọng.' },
  { id: 'han-thuc', name: 'Tết Hàn Thực', type: 'lunar', day: 3, month: 3, category: 'truyen-thong', icon: 'CakeSlice', desc: 'Ngày Tết bánh trôi bánh chay truyền thống.' },
  { id: 'gio-to-hung-vuong', name: 'Giỗ Tổ Hùng Vương', type: 'lunar', day: 10, month: 3, category: 'quoc-le', icon: 'Landmark', desc: 'Tưởng nhớ công lao dựng nước của các Vua Hùng, ngày nghỉ lễ chính thức.' },
  { id: 'phat-dan', name: 'Lễ Phật Đản', type: 'lunar', day: 15, month: 4, category: 'ton-giao', icon: 'Flower', desc: 'Kỷ niệm ngày Đức Phật Thích Ca đản sinh.' },
  { id: 'doan-ngo', name: 'Tết Đoan Ngọ', type: 'lunar', day: 5, month: 5, category: 'truyen-thong', icon: 'Sun', desc: 'Tết diệt sâu bọ theo truyền thống dân gian.' },
  { id: 'vu-lan', name: 'Lễ Vu Lan báo hiếu', type: 'lunar', day: 15, month: 7, category: 'ton-giao', icon: 'HeartHandshake', desc: 'Ngày lễ báo hiếu cha mẹ, xá tội vong nhân.' },
  { id: 'trung-thu', name: 'Tết Trung Thu', type: 'lunar', day: 15, month: 8, category: 'truyen-thong', icon: 'Moon', desc: 'Tết đoàn viên, ngày hội của thiếu nhi với đèn lồng, bánh trung thu.' },
  { id: 'ong-cong-ong-tao', name: 'Tết Ông Công Ông Táo', type: 'lunar', day: 23, month: 12, category: 'truyen-thong', icon: 'Flame', desc: 'Ngày tiễn Táo Quân về trời báo cáo Ngọc Hoàng.' }
]

export const CATEGORY_LABEL = {
  'quoc-le': 'Quốc lễ',
  'truyen-thong': 'Truyền thống',
  'ky-niem': 'Kỷ niệm',
  'quoc-te': 'Quốc tế',
  'ton-giao': 'Tôn giáo'
}

/** Màu chấm nhận diện danh mục — là dấu hiệu duy nhất mang màu, phần còn lại giữ trung tính */
export const CATEGORY_DOT = {
  'quoc-le': 'bg-rose-500',
  'truyen-thong': 'bg-amber-500',
  'ky-niem': 'bg-sky-500',
  'quoc-te': 'bg-emerald-500',
  'ton-giao': 'bg-violet-500'
}

/** Danh sách ngày chay trong tháng âm lịch (Thập trai - 10 ngày chay/tháng) */
export const NGAY_CHAY_THAP_TRAI = [1, 8, 14, 15, 18, 23, 24, 28, 29, 30]
/** Nhị trai - 2 ngày chay phổ biến nhất: Mùng Một và Rằm */
export const NGAY_CHAY_NHI_TRAI = [1, 15]

/** Tìm các ngày lễ rơi vào một ngày dương lịch cụ thể (cần truyền kèm thông tin âm lịch của ngày đó) */
export function getHolidaysOnDate(date, lunarInfo) {
  return HOLIDAYS.filter((h) => {
    if (h.type === 'solar') return h.day === date.getDate() && h.month === date.getMonth() + 1
    return h.day === lunarInfo.lunarDay && h.month === lunarInfo.lunarMonth && !lunarInfo.isLeap
  })
}
