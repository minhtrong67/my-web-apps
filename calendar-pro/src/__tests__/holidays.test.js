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
