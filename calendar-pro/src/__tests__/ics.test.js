import { describe, it, expect } from 'vitest'
import { buildIcs, escapeText, foldLine } from '../lib/ics'

const NOW = new Date(2026, 10, 3, 9, 0)

describe('ICS', () => {
  it('escape ký tự đặc biệt', () => {
    expect(escapeText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne')
  })
  it('gập dòng > 75 byte mà không cắt giữa ký tự UTF-8', () => {
    const folded = foldLine('SUMMARY:' + 'Đ'.repeat(60))
    const enc = new TextEncoder()
    for (const line of folded.split('\r\n')) expect(enc.encode(line).length).toBeLessThanOrEqual(75)
    expect(folded.replace(/\r\n /g, '')).toBe('SUMMARY:' + 'Đ'.repeat(60))
  })
  it('sự kiện dương lịch: 1 VEVENT cả ngày + lặp hằng năm', () => {
    const ics = buildIcs([{ id: 'xmas', name: 'Giáng Sinh', type: 'solar', day: 25, month: 12 }], NOW)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('DTSTART;VALUE=DATE:20261225')
    expect(ics).toContain('DTEND;VALUE=DATE:20261226')
    expect(ics).toContain('RRULE:FREQ=YEARLY')
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(1)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
  })
  it('sự kiện âm lịch: sinh nhiều lần diễn ra, không dùng RRULE; Tết 2027 = 6/2/2027', () => {
    const ics = buildIcs([{ id: 'tet', name: 'Tết', type: 'lunar', day: 1, month: 1 }], NOW)
    expect(ics).toContain('DTSTART;VALUE=DATE:20270206')
    expect(ics).not.toContain('RRULE')
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBeGreaterThanOrEqual(10)
  })
  it('Giao thừa (isEve) rơi vào 5/2/2027', () => {
    const ics = buildIcs([{ id: 'gt', name: 'Giao thừa', type: 'lunar', day: 1, month: 1, isEve: true }], NOW)
    expect(ics).toContain('DTSTART;VALUE=DATE:20270205')
  })
})
