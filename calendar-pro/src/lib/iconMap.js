/**
 * Bảng ánh xạ tên icon ngữ nghĩa (lưu trong data/holidays.js) sang tên ligature
 * của Material Symbols Outlined (Google Icons). Giữ nguyên khoá cũ trong dữ liệu
 * để không phải sửa data, chỉ đổi cách hiển thị.
 */
export const HOLIDAY_ICON_MAP = {
  Baby: 'child_care',
  CakeSlice: 'cake',
  Flag: 'flag',
  Flame: 'local_fire_department',
  Flower: 'local_florist',
  Flower2: 'local_florist',
  Ghost: 'skull',
  GraduationCap: 'school',
  HardHat: 'engineering',
  Heart: 'favorite',
  HeartHandshake: 'volunteer_activism',
  Home: 'home',
  Landmark: 'account_balance',
  Moon: 'bedtime',
  PartyPopper: 'celebration',
  Ribbon: 'military_tech',
  Shield: 'shield',
  Sparkles: 'auto_awesome',
  Sun: 'wb_sunny',
  TreePine: 'park'
}

export function holidayIconName(key) {
  return HOLIDAY_ICON_MAP[key] ?? 'celebration'
}
