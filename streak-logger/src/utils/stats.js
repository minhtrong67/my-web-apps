import { translate } from '../i18n'
import { PERIOD_ORDER, dateKey, getPeriodOfDay, getWeekStart, getWeekdayLong, getWeekdayShort } from './date'

/** Các mức thống kê: ngày, tuần, tháng, năm. */
export const RANGES = ['day', 'week', 'month', 'year']

const pad = (n) => String(n).padStart(2, '0')

/**
 * Tính khoảng thời gian cần thống kê.
 * `offset` = 0 là hiện tại, -1 là kỳ trước, -2 là hai kỳ trước...
 */
export function getRange(key, now, offset = 0) {
  const base = new Date(now)
  base.setHours(0, 0, 0, 0)
  let start
  let end
  let label

  if (key === 'day') {
    start = new Date(base)
    start.setDate(start.getDate() + offset)
    end = new Date(start)
    label = `${getWeekdayLong(start.getDay())}, ${pad(start.getDate())}/${pad(start.getMonth() + 1)}/${start.getFullYear()}`
  } else if (key === 'week') {
    start = getWeekStart(base)
    start.setDate(start.getDate() + offset * 7)
    end = new Date(start)
    end.setDate(end.getDate() + 6)
    label = `${pad(start.getDate())}/${pad(start.getMonth() + 1)} - ${pad(end.getDate())}/${pad(end.getMonth() + 1)}/${end.getFullYear()}`
  } else if (key === 'year') {
    start = new Date(base.getFullYear() + offset, 0, 1)
    end = new Date(base.getFullYear() + offset, 11, 31)
    label = translate('date.year', { year: start.getFullYear() })
  } else {
    start = new Date(base.getFullYear(), base.getMonth() + offset, 1)
    end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    label = translate('date.month', { month: start.getMonth() + 1, year: start.getFullYear() })
  }

  return { key, start, end, startKey: dateKey(start), endKey: dateKey(end), label }
}

/** Lọc các nhật ký nằm trong khoảng [startKey, endKey] (so sánh chuỗi YYYY-MM-DD là đủ chính xác). */
export function filterPostsInRange(posts, range) {
  return posts.filter((p) => p.post_date >= range.startKey && p.post_date <= range.endKey)
}

/**
 * Gom số mục vào các cột của biểu đồ cột dọc theo mức thống kê:
 * ngày = 24 giờ, tuần = 7 thứ, tháng = từng ngày trong tháng, năm = 12 tháng.
 */
export function buildSeries(posts, range) {
  if (range.key === 'day') {
    const counts = new Array(24).fill(0)
    posts.forEach((p) => {
      const h = parseInt(String(p.post_time).slice(0, 2), 10)
      if (h >= 0 && h < 24) counts[h] += 1
    })
    return counts.map((count, h) => ({ label: translate('date.hourShort', { hour: h }), count }))
  }

  if (range.key === 'week') {
    const byDate = new Map()
    posts.forEach((p) => byDate.set(p.post_date, (byDate.get(p.post_date) || 0) + 1))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(range.start)
      d.setDate(d.getDate() + i)
      return { label: getWeekdayShort(d.getDay()), count: byDate.get(dateKey(d)) || 0 }
    })
  }

  if (range.key === 'year') {
    const counts = new Array(12).fill(0)
    posts.forEach((p) => {
      counts[Number(p.post_date.slice(5, 7)) - 1] += 1
    })
    return counts.map((count, i) => ({ label: translate('date.monthShort', { month: i + 1 }), count }))
  }

  const days = range.end.getDate()
  const counts = new Array(days).fill(0)
  posts.forEach((p) => {
    counts[Number(p.post_date.slice(8, 10)) - 1] += 1
  })
  return counts.map((count, i) => ({ label: String(i + 1), count }))
}

/** Số mục theo từng buổi trong ngày (sáng, trưa, chiều, tối). */
export function buildPeriodCounts(posts) {
  const map = { morning: 0, noon: 0, afternoon: 0, evening: 0 }
  posts.forEach((p) => {
    map[getPeriodOfDay(p.post_time)] += 1
  })
  return PERIOD_ORDER.map((key) => ({ key, name: translate(`streakPost.period.${key}`), count: map[key] }))
}

/** Các chỉ số tổng hợp của một tập nhật ký. */
export function buildMetrics(posts, periodCounts) {
  const total = posts.length
  const activeDays = new Set(posts.map((p) => p.post_date)).size
  const average = activeDays ? Math.round((total / activeDays) * 10) / 10 : 0
  const withData = periodCounts.filter((p) => p.count > 0)
  const busiest = withData.length ? [...withData].sort((a, b) => b.count - a.count)[0] : null
  return { total, activeDays, average, busiest }
}

/** Bảng màu cố định cho các miếng của biểu đồ tròn theo thời gian (lặp lại nếu nhiều hơn 12 miếng). */
export const SLICE_COLORS = [
  '#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#6366F1',
  '#14B8A6', '#F97316', '#8B5CF6', '#22C55E', '#EF4444', '#06B6D4',
]

/** Thêm phần trăm (làm tròn 1 chữ số thập phân) cho danh sách {count}. */
function withShare(items) {
  const total = items.reduce((sum, item) => sum + item.count, 0)
  return items.map((item) => ({ ...item, percent: total ? Math.round((item.count / total) * 1000) / 10 : 0 }))
}

/**
 * Dữ liệu biểu đồ tròn "theo thời gian": mỗi cột có số mục > 0 của `buildSeries` thành một miếng,
 * có tên đầy đủ (Ngày 5, Tháng 7, Thứ Hai...) để dùng làm nhãn.
 */
export function buildTimeSlices(series, range) {
  const slices = []
  series.forEach((s, i) => {
    if (!s.count) return
    let name = s.label
    if (range.key === 'month') name = translate('stats.dayN', { n: i + 1 })
    else if (range.key === 'year') name = translate('stats.monthN', { n: i + 1 })
    else if (range.key === 'week') {
      const d = new Date(range.start)
      d.setDate(d.getDate() + i)
      name = getWeekdayLong(d.getDay())
    }
    slices.push({ key: `t${i}`, name, count: s.count, color: SLICE_COLORS[slices.length % SLICE_COLORS.length] })
  })
  return withShare(slices)
}

/** Dữ liệu biểu đồ tròn "theo buổi trong ngày" (chỉ các buổi có mục), màu theo từng buổi. */
export function buildPeriodSlices(periodCounts, periodColors) {
  return withShare(periodCounts.filter((p) => p.count > 0).map((p) => ({ key: p.key, name: p.name, count: p.count, color: periodColors[p.key] })))
}
