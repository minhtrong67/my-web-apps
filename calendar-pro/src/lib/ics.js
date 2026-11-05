import { lunarToSolar } from './lunar'
import { getNextOccurrence } from './dateUtils'
import { isRuleHoliday, ruleDate } from './holidayRules'

/**
 * Xuất lịch iCalendar (.ics) để thêm ngày lễ / sự kiện vào Google Calendar, Apple Calendar, Outlook...
 * - Sự kiện dương lịch: 1 VEVENT cả ngày + RRULE lặp hằng năm.
 * - Sự kiện âm lịch hoặc theo quy tắc (Phục sinh, thứ N của tháng): lịch chuẩn không lặp được theo các kiểu này → sinh sẵn các lần diễn ra trong YEARS_AHEAD năm tới.
 */
const YEARS_AHEAD = 10

const pad = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
const stamp = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`

/** Escape giá trị TEXT theo RFC 5545 */
export function escapeText(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Gập dòng dài hơn 75 byte (RFC 5545), tính theo byte UTF-8 để không cắt giữa ký tự tiếng Việt */
export function foldLine(line) {
  const enc = new TextEncoder()
  if (enc.encode(line).length <= 75) return line
  const parts = []
  let cur = ''
  let curBytes = 0
  let limit = 75
  for (const ch of line) {
    const b = enc.encode(ch).length
    if (curBytes + b > limit) {
      parts.push(cur)
      cur = ch
      curBytes = b
      limit = 74 // dòng nối tiếp bắt đầu bằng 1 khoảng trắng
    } else {
      cur += ch
      curBytes += b
    }
  }
  parts.push(cur)
  return parts.join('\r\n ')
}

/** Các ngày dương lịch (00:00) mà một sự kiện lặp hằng năm diễn ra, từ năm hiện tại trở đi */
export function lunarOccurrences(item, from = new Date(), years = YEARS_AHEAD) {
  const out = []
  for (let ly = from.getFullYear() - 1; ly <= from.getFullYear() + years; ly++) {
    const [d, m, y] = lunarToSolar(item.day, item.month, ly, 0)
    if (!d) continue
    const date = new Date(y, m - 1, d - (item.isEve ? 1 : 0))
    if (date >= new Date(from.getFullYear(), from.getMonth(), from.getDate())) out.push(date)
  }
  return out
}

/** Các ngày diễn ra của sự kiện theo quy tắc (Phục sinh, thứ N của tháng) từ năm hiện tại trở đi */
export function ruleOccurrences(item, from = new Date(), years = YEARS_AHEAD) {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const out = []
  for (let y = from.getFullYear(); y <= from.getFullYear() + years; y++) {
    const d = ruleDate(item, y)
    if (d >= today) out.push(d)
  }
  return out
}

/**
 * @param {Array<{id:string,name:string,description?:string,type:'solar'|'lunar'|'easter'|'nth-weekday',day?:number,month?:number,weekday?:number,nth?:number,isEve?:boolean}>} items
 * @returns {string} nội dung file .ics (CRLF)
 */
export function buildIcs(items, now = new Date()) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Calendar Pro//VI//', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Calendar Pro']
  const dtstamp = stamp(now)
  const event = (uid, item, date, rrule) => {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
    lines.push('BEGIN:VEVENT', `UID:${uid}@calendar-pro`, `DTSTAMP:${dtstamp}`, `DTSTART;VALUE=DATE:${ymd(date)}`, `DTEND;VALUE=DATE:${ymd(next)}`)
    if (rrule) lines.push(`RRULE:${rrule}`)
    lines.push(`SUMMARY:${escapeText(item.name)}`)
    if (item.description) lines.push(`DESCRIPTION:${escapeText(item.description)}`)
    lines.push('TRANSP:TRANSPARENT', 'END:VEVENT')
  }
  for (const item of items) {
    if (isRuleHoliday(item)) {
      ruleOccurrences(item, now).forEach((date) => event(`${item.id}-${ymd(date)}`, item, date))
    } else if (item.type === 'solar') {
      // Lần diễn ra kế tiếp làm mốc bắt đầu, lặp hằng năm (29/2 chỉ rơi vào năm nhuận — thư viện lịch tự bỏ qua năm không có)
      const start = getNextOccurrence(item, now)
      if (start) event(item.id, item, start, 'FREQ=YEARLY')
    } else {
      lunarOccurrences(item, now).forEach((date) => event(`${item.id}-${ymd(date)}`, item, date))
    }
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

/** Tải một chuỗi văn bản về máy dưới dạng file */
export function downloadText(filename, text, mime = 'text/calendar;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
