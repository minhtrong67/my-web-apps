import { describe, it, expect } from 'vitest'
import { HOLIDAYS, getHolidaysOnDate } from '../data/holidays'
import { getNextOccurrence, getLunarInfo, diffParts } from '../lib/dateUtils'

const byId = (id) => HOLIDAYS.find((h) => h.id === id)
const idsOn = (d) => getHolidaysOnDate(d, getLunarInfo(d)).map((h) => h.id)

describe('getNextOccurrence', () => {
  it('ngày dương lịch: chưa qua thì lấy năm nay, đã qua thì lấy năm sau', () => {
    expect(getNextOccurrence(byId('giang-sinh'), new Date(2026, 10, 3))).toEqual(new Date(2026, 11, 25))
    expect(getNextOccurrence(byId('giang-sinh'), new Date(2026, 11, 26))).toEqual(new Date(2027, 11, 25))
  })
  it('đúng ngày diễn ra vẫn tính là "hôm nay" (không nhảy sang năm sau)', () => {
    expect(getNextOccurrence(byId('halloween'), new Date(2026, 9, 31, 15, 0))).toEqual(new Date(2026, 9, 31))
  })
  it('âm lịch: Tết Nguyên Đán 2027 = 6/2/2027; sau Tết 2026 thì sang Tết 2027', () => {
    expect(getNextOccurrence(byId('tet-nguyen-dan'), new Date(2026, 10, 3))).toEqual(new Date(2027, 1, 6))
    expect(getNextOccurrence(byId('tet-nguyen-dan'), new Date(2026, 1, 18))).toEqual(new Date(2027, 1, 6))
    expect(getNextOccurrence(byId('tet-nguyen-dan'), new Date(2026, 1, 17))).toEqual(new Date(2026, 1, 17))
  })
  it('Trung thu 2026 = 25/9/2026', () => {
    expect(getNextOccurrence(byId('trung-thu'), new Date(2026, 5, 1))).toEqual(new Date(2026, 8, 25))
  })
  it('Giao thừa là tối ngày liền trước Tết (không trùng ngày với Tết)', () => {
    const eve = getNextOccurrence(byId('giao-thua'), new Date(2026, 10, 3))
    expect(eve.getFullYear()).toBe(2027)
    expect(eve.getMonth()).toBe(1)
    expect(eve.getDate()).toBe(5)
    expect(eve.getHours()).toBe(23)
  })
  it('đếm ngược Giao thừa về 0 ngày vào chính ngày đó, và tới 23:59:59', () => {
    const eve = getNextOccurrence(byId('giao-thua'), new Date(2027, 1, 5, 8, 0))
    expect(diffParts(eve, new Date(2027, 1, 5, 8, 0)).days).toBe(0)
    expect(diffParts(eve, new Date(2027, 1, 5, 23, 0)).minutes).toBe(59)
  })
  it('sau Giao thừa (sang mùng 1) thì chuyển sang năm sau', () => {
    const next = getNextOccurrence(byId('giao-thua'), new Date(2027, 1, 6, 0, 30))
    expect(next.getFullYear()).toBe(2028)
  })
})

describe('getHolidaysOnDate', () => {
  it('Giao thừa chỉ khớp ngày 5/2/2027; Tết khớp ngày 6/2/2027', () => {
    expect(idsOn(new Date(2027, 1, 5))).toContain('giao-thua')
    expect(idsOn(new Date(2027, 1, 5))).not.toContain('tet-nguyen-dan')
    expect(idsOn(new Date(2027, 1, 6))).toContain('tet-nguyen-dan')
    expect(idsOn(new Date(2027, 1, 6))).not.toContain('giao-thua')
  })
  it('ngày dương lịch', () => {
    expect(idsOn(new Date(2026, 9, 31))).toContain('halloween')
    expect(idsOn(new Date(2026, 11, 25))).toContain('giang-sinh')
  })
  it('mọi ngày lễ đều có icon và danh mục hợp lệ, id không trùng', () => {
    const ids = HOLIDAYS.map((h) => h.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const h of HOLIDAYS) expect(h.icon && h.category && h.name && h.desc).toBeTruthy()
  })
})

import { easterSunday, nthWeekday } from '../lib/holidayRules'
import { getHolidayTheme, HOLIDAY_THEMES } from '../data/holidayThemes'
import { HOLIDAY_DETAILS } from '../data/holidayDetails'
import { HOLIDAY_EN } from '../data/holidayI18n'
import { HOLIDAY_ICON_MAP } from '../lib/iconMap'
import { buildIcs } from '../lib/ics'

describe('Ngày lễ theo quy tắc', () => {
  it('Chủ nhật Phục sinh (lịch Gregory) 2024–2030', () => {
    const expected = { 2024: [3, 31], 2025: [4, 20], 2026: [4, 5], 2027: [3, 28], 2028: [4, 16], 2029: [4, 1], 2030: [4, 21] }
    for (const [y, [m, d]] of Object.entries(expected)) expect(easterSunday(Number(y))).toEqual(new Date(Number(y), m - 1, d))
  })
  it('Phục sinh luôn là Chủ nhật, nằm trong khoảng 22/3 – 25/4', () => {
    for (let y = 1990; y <= 2100; y++) {
      const d = easterSunday(y)
      expect(d.getDay()).toBe(0)
      expect(d >= new Date(y, 2, 22) && d <= new Date(y, 3, 25)).toBe(true)
    }
  })
  it('Lễ Tạ ơn = Thứ Năm thứ 4 của tháng 11 (2024–2027)', () => {
    expect(nthWeekday(2024, 11, 4, 4)).toEqual(new Date(2024, 10, 28))
    expect(nthWeekday(2025, 11, 4, 4)).toEqual(new Date(2025, 10, 27))
    expect(nthWeekday(2026, 11, 4, 4)).toEqual(new Date(2026, 10, 26))
    expect(nthWeekday(2027, 11, 4, 4)).toEqual(new Date(2027, 10, 25))
  })
  it('ngày kế tiếp: từ 4/11/2026 → Tạ ơn 26/11/2026 và Phục sinh 28/3/2027; đúng ngày thì vẫn là hôm nay', () => {
    expect(getNextOccurrence(byId('thanksgiving'), new Date(2026, 10, 4))).toEqual(new Date(2026, 10, 26))
    expect(getNextOccurrence(byId('thanksgiving'), new Date(2026, 10, 26, 20))).toEqual(new Date(2026, 10, 26))
    expect(getNextOccurrence(byId('thanksgiving'), new Date(2026, 10, 27))).toEqual(new Date(2027, 10, 25))
    expect(getNextOccurrence(byId('easter'), new Date(2026, 10, 4))).toEqual(new Date(2027, 2, 28))
    expect(getNextOccurrence(byId('easter'), new Date(2026, 3, 5))).toEqual(new Date(2026, 3, 5))
  })
  it('khớp đúng ngày trong lịch', () => {
    expect(idsOn(new Date(2026, 3, 5))).toContain('easter')
    expect(idsOn(new Date(2026, 3, 12))).not.toContain('easter')
    expect(idsOn(new Date(2026, 10, 26))).toContain('thanksgiving')
  })
  it('xuất .ics: sinh nhiều lần diễn ra, không dùng RRULE', () => {
    const ics = buildIcs([{ id: 'easter', name: 'Easter', type: 'easter' }], new Date(2026, 10, 4))
    expect(ics).toContain('DTSTART;VALUE=DATE:20270328')
    expect(ics).not.toContain('RRULE')
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBeGreaterThanOrEqual(10)
  })
})

describe('Mùng 1, 2, 3 Tết', () => {
  it('Tết 2027: mùng 1 = 6/2, mùng 2 = 7/2, mùng 3 = 8/2', () => {
    const from = new Date(2026, 10, 4)
    expect(getNextOccurrence(byId('tet-nguyen-dan'), from)).toEqual(new Date(2027, 1, 6))
    expect(getNextOccurrence(byId('mung-2-tet'), from)).toEqual(new Date(2027, 1, 7))
    expect(getNextOccurrence(byId('mung-3-tet'), from)).toEqual(new Date(2027, 1, 8))
  })
  it('mỗi ngày trong lịch chỉ khớp đúng một mùng', () => {
    expect(idsOn(new Date(2027, 1, 7))).toContain('mung-2-tet')
    expect(idsOn(new Date(2027, 1, 7))).not.toContain('tet-nguyen-dan')
    expect(idsOn(new Date(2027, 1, 8))).toContain('mung-3-tet')
  })
})

describe('Nền đặc biệt & nội dung', () => {
  it('có nền riêng: Thiếu nhi, Giỗ Tổ, Nhà giáo, Lao động, mùng 1-2-3 Tết', () => {
    for (const id of ['quoc-te-thieu-nhi', 'gio-to-hung-vuong', 'nha-giao', 'quoc-te-lao-dong', 'tet-nguyen-dan', 'mung-2-tet', 'mung-3-tet']) expect(getHolidayTheme(id)).toBeTruthy()
    expect(getHolidayTheme('mung-2-tet')).toBe(getHolidayTheme('tet-nguyen-dan'))
  })
  it('không có nền riêng: Vu Lan, Phật Đản, Phục sinh, Tạ ơn', () => {
    for (const id of ['vu-lan', 'phat-dan', 'easter', 'thanksgiving']) expect(getHolidayTheme(id)).toBeNull()
  })
  it('mỗi nền đều có đủ gradient và emoji trang trí', () => {
    for (const th of Object.values(HOLIDAY_THEMES)) {
      expect(th.bg).toMatch(/gradient/)
      expect(th.emojis.length).toBeGreaterThanOrEqual(3)
      expect(th.strong).toMatch(/^#/)
    }
  })
  it('mọi ngày lễ đều có nội dung chi tiết tiếng Việt, tiếng Anh và icon hợp lệ', () => {
    for (const h of HOLIDAYS) {
      expect(HOLIDAY_DETAILS[h.id]?.meaning?.length, `VI ${h.id}`).toBeGreaterThan(0)
      expect(HOLIDAY_EN[h.id]?.meaning?.length, `EN ${h.id}`).toBeGreaterThan(0)
      expect(HOLIDAY_EN[h.id]?.name, `EN name ${h.id}`).toBeTruthy()
      expect(HOLIDAY_ICON_MAP[h.icon], `icon ${h.id}`).toBeTruthy()
    }
  })
})
