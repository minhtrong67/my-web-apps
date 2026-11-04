import { getLunarInfo } from './dateUtils'
import { canChiYear, lunarToSolar } from './lunar'

/**
 * Tiến độ của năm hiện tại: dương lịch (1/1 → 1/1 năm sau) hoặc âm lịch (mùng 1 Tết → mùng 1 Tết năm sau).
 * Mọi giá trị đều suy ra từ thời điểm hiện tại nên khi qua năm mới, khoảng (range) tự chuyển sang năm kế tiếp và tiến độ về 0%.
 */
const DAY = 86400000

export function solarYearRange(now) {
  const y = now.getFullYear()
  return { kind: 'solar', label: String(y), start: new Date(y, 0, 1), end: new Date(y + 1, 0, 1) }
}

function tetOf(lunarYear) {
  const [d, m, y] = lunarToSolar(1, 1, lunarYear, 0)
  return new Date(y, m - 1, d)
}

export function lunarYearRange(now) {
  const ly = getLunarInfo(now).lunarYear // trước Tết thì vẫn thuộc năm âm lịch trước đó
  return { kind: 'lunar', label: canChiYear(ly), lunarYear: ly, start: tetOf(ly), end: tetOf(ly + 1) }
}

export function getRange(kind, now) {
  return kind === 'lunar' ? lunarYearRange(now) : solarYearRange(now)
}

/** Số liệu tiến độ tại thời điểm `now` */
export function progressOf(range, now) {
  const total = range.end - range.start
  const elapsed = Math.min(Math.max(now - range.start, 0), total)
  const totalDays = Math.round(total / DAY)
  const passedDays = Math.floor(elapsed / DAY)
  return {
    fraction: elapsed / total,
    totalDays,
    passedDays,
    leftDays: totalDays - passedDays - 1, // không tính hôm nay
    dayNumber: passedDays + 1, // hôm nay là ngày thứ mấy của năm
    weekNumber: Math.floor(passedDays / 7) + 1,
    totalWeeks: Math.ceil(totalDays / 7),
    perDay: 100 / totalDays
  }
}

/** Các tháng của khoảng năm: [{ label, start, end, leap }] — dương lịch theo tháng dương, âm lịch theo tháng âm (kể cả tháng nhuận) */
export function monthSegments(range) {
  if (range.kind === 'solar') {
    const y = range.start.getFullYear()
    return Array.from({ length: 12 }, (_, m) => ({ label: String(m + 1), start: new Date(y, m, 1), end: new Date(y, m + 1, 1), leap: false }))
  }
  const starts = []
  for (let d = new Date(range.start); d < range.end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const l = getLunarInfo(d)
    if (l.lunarDay === 1) starts.push({ date: new Date(d), label: String(l.lunarMonth), leap: l.isLeap })
  }
  return starts.map((s, i) => ({ label: s.label, leap: s.leap, start: s.date, end: starts[i + 1]?.date ?? range.end }))
}

/** Mức đầy (0–1) của một đoạn tại thời điểm `now` */
export function segmentFill(seg, now) {
  return Math.min(1, Math.max(0, (now - seg.start) / (seg.end - seg.start)))
}

/** Ngày đạt mức `fraction` của năm */
export function dateAtFraction(range, fraction) {
  return new Date(range.start.getTime() + (range.end - range.start) * fraction)
}
