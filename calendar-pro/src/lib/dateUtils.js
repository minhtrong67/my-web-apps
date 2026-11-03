import { lunarToSolar, solarToLunar } from './lunar'

/** Nhãn thứ trong tuần, thứ tự Thứ Hai -> Chủ Nhật (chuẩn lịch Việt Nam) */
export const WEEKDAYS_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
export const WEEKDAYS_SHORT_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
/** Tên đầy đủ, chỉ số theo Date.getDay() gốc (0 = Chủ nhật ... 6 = Thứ bảy) */
export const WEEKDAYS_FULL = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
export const WEEKDAYS_FULL_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
]
export const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/** Trả về nhãn thứ/tháng theo ngôn ngữ hiện tại ('vi' | 'en') */
export function weekdaysShort(lang) { return lang === 'en' ? WEEKDAYS_SHORT_EN : WEEKDAYS_SHORT }
export function monthNames(lang) { return lang === 'en' ? MONTH_NAMES_EN : MONTH_NAMES }

/** Chuyển chỉ số Date.getDay() (0=CN) sang chỉ số cột lưới Thứ Hai đứng đầu (0=T2...6=CN) */
export function mondayIndex(getDayValue) {
  return (getDayValue + 6) % 7
}

export function pad2(n) {
  return String(n).padStart(2, '0')
}

export function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function startOfDay(d) {
  const nd = new Date(d)
  nd.setHours(0, 0, 0, 0)
  return nd
}

export function addDays(d, n) {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + n)
  return nd
}

/** Ngày dương lịch (00:00) của một ngày âm lịch trong năm âm `lunarYear`; null nếu không tồn tại */
function lunarDateInYear(day, month, lunarYear) {
  const [sd, sm, sy] = lunarToSolar(day, month, lunarYear, 0)
  return sd ? new Date(sy, sm - 1, sd) : null
}

/**
 * Tìm lần diễn ra kế tiếp (kể từ hôm nay) của một ngày lễ / sự kiện, trả về Date.
 * - Dương lịch: lặp lại hằng năm cùng ngày/tháng.
 * - Âm lịch: quy đổi từng năm âm; ngày lễ có `isEve` (Giao thừa) là TỐI NGÀY TRƯỚC mùng 1 → trả về 23:59:59 của ngày đó
 *   (đồng hồ đếm ngược chạy đúng đến giao thừa, và ngày hiển thị là 29/30 tháng Chạp chứ không trùng với Tết).
 */
export function getNextOccurrence(holiday, from = new Date()) {
  const today = startOfDay(from)
  if (holiday.type === 'solar') {
    const year = today.getFullYear()
    let candidate = new Date(year, holiday.month - 1, holiday.day)
    if (startOfDay(candidate) < today) {
      candidate = new Date(year + 1, holiday.month - 1, holiday.day)
    }
    return candidate
  }
  // Âm lịch: năm âm ứng với năm dương y có thể là y-1, y hoặc y+1 → duyệt tăng dần, lấy ngày đầu tiên chưa qua
  const year = today.getFullYear()
  for (let ly = year - 1; ly <= year + 2; ly++) {
    const base = lunarDateInYear(holiday.day, holiday.month, ly)
    if (!base) continue
    if (holiday.isEve) {
      const eve = new Date(base.getFullYear(), base.getMonth(), base.getDate() - 1, 23, 59, 59)
      if (startOfDay(eve) >= today) return eve
    } else if (startOfDay(base) >= today) {
      return base
    }
  }
  return null
}

/** VD: "Thứ sáu, ngày 07 tháng 08 năm 2026" / "Friday, 07/08/2026" */
export function formatVNDate(d, lang = 'vi') {
  if (lang === 'en') {
    return `${WEEKDAYS_FULL_EN[d.getDay()]}, ${MONTH_NAMES_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }
  return `${WEEKDAYS_FULL[d.getDay()]}, ngày ${pad2(d.getDate())} tháng ${pad2(d.getMonth() + 1)} năm ${d.getFullYear()}`
}

/** VD: "07/08/2026" */
export function formatShortDate(d) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function diffParts(target, from = new Date()) {
  let ms = target.getTime() - startOfDay(from).getTime()
  if (ms < 0) ms = 0
  const days = Math.floor(ms / 86400000)
  const totalHoursMs = target.getTime() - from.getTime()
  const clamped = Math.max(0, totalHoursMs)
  const hours = Math.floor((clamped / 3600000) % 24)
  const minutes = Math.floor((clamped / 60000) % 60)
  const seconds = Math.floor((clamped / 1000) % 60)
  return { days, hours, minutes, seconds }
}

/** Lần kỷ niệm / tuổi của một sự kiện cá nhân (cần có `year` gốc) tại lần diễn ra `date`; 0 nếu không có năm gốc */
export function anniversaryNumber(event, date) {
  if (!event.year) return 0
  const y = event.type === 'lunar' ? getLunarInfo(date).lunarYear : date.getFullYear()
  return Math.max(0, y - event.year)
}

export function getLunarInfo(date) {
  const [ld, lm, ly, leap] = solarToLunar(date.getDate(), date.getMonth() + 1, date.getFullYear())
  return { lunarDay: ld, lunarMonth: lm, lunarYear: ly, isLeap: leap === 1 }
}
