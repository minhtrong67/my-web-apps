/**
 * Ngày lễ không cố định theo "ngày/tháng" mà theo QUY TẮC của từng năm:
 *  - type 'easter'      : Lễ Phục sinh (Kitô giáo phương Tây) — Chủ nhật đầu tiên sau lần trăng tròn đầu tiên kể từ xuân phân
 *  - type 'nth-weekday' : thứ N của một tháng (VD Lễ Tạ ơn = Thứ Năm thứ 4 của tháng 11): { month, weekday (0 = CN … 6 = T7), nth }
 */

/** Chủ nhật Phục sinh của năm dương lịch `year` (thuật toán Meeus/Jones/Butcher cho lịch Gregory) */
export function easterSunday(year) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

/** Ngày thứ `nth` (1–5) có thứ `weekday` (0 = Chủ nhật … 6 = Thứ bảy) của tháng `month` (1–12) năm `year` */
export function nthWeekday(year, month, weekday, nth) {
  const offset = (weekday - new Date(year, month - 1, 1).getDay() + 7) % 7
  return new Date(year, month - 1, 1 + offset + (nth - 1) * 7)
}

/** Ngày dương lịch (00:00) của ngày lễ theo quy tắc trong một năm; null nếu không phải loại theo quy tắc */
export function ruleDate(holiday, year) {
  if (holiday.type === 'easter') return easterSunday(year)
  if (holiday.type === 'nth-weekday') return nthWeekday(year, holiday.month, holiday.weekday, holiday.nth)
  return null
}

export const isRuleHoliday = (holiday) => holiday.type === 'easter' || holiday.type === 'nth-weekday'
