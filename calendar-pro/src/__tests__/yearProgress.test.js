import { describe, it, expect } from 'vitest'
import { getRange, progressOf, monthSegments, segmentFill, solarYearRange } from '../lib/yearProgress'

describe('Tiến độ năm dương lịch', () => {
  it('0% đúng lúc 0h ngày 1/1', () => {
    const now = new Date(2026, 0, 1, 0, 0, 0)
    expect(progressOf(solarYearRange(now), now).fraction).toBe(0)
  })
  it('khoảng 84% vào ngày 3/11/2026 (ngày thứ 307/365)', () => {
    const now = new Date(2026, 10, 3, 9, 30)
    const p = progressOf(solarYearRange(now), now)
    expect(p.totalDays).toBe(365)
    expect(p.dayNumber).toBe(307)
    expect(p.fraction * 100).toBeCloseTo(83.94, 1) // 306 ngày + 9,5 giờ trên 365 ngày
    expect(p.leftDays).toBe(58)
  })
  it('năm nhuận có 366 ngày', () => {
    expect(progressOf(solarYearRange(new Date(2028, 5, 1)), new Date(2028, 5, 1)).totalDays).toBe(366)
  })
  it('1 giây trước giao thừa gần 100% nhưng chưa tới; sang năm mới thì về 0% của năm kế tiếp', () => {
    const before = new Date(2026, 11, 31, 23, 59, 59)
    const rBefore = solarYearRange(before)
    expect(rBefore.label).toBe('2026')
    expect(progressOf(rBefore, before).fraction).toBeLessThan(1)
    expect(progressOf(rBefore, before).fraction).toBeGreaterThan(0.99999)
    const after = new Date(2027, 0, 1, 0, 0, 0)
    const rAfter = solarYearRange(after)
    expect(rAfter.label).toBe('2027')
    expect(progressOf(rAfter, after).fraction).toBe(0)
  })
  it('12 tháng, mỗi tháng đầy/đang chạy/rỗng đúng', () => {
    const now = new Date(2026, 5, 16) // giữa tháng 6
    const segs = monthSegments(solarYearRange(now))
    expect(segs).toHaveLength(12)
    expect(segmentFill(segs[4], now)).toBe(1)
    expect(segmentFill(segs[5], now)).toBeGreaterThan(0.4)
    expect(segmentFill(segs[5], now)).toBeLessThan(0.6)
    expect(segmentFill(segs[6], now)).toBe(0)
  })
})

describe('Tiến độ năm âm lịch', () => {
  it('3/11/2026 thuộc năm Bính Ngọ (17/2/2026 → 6/2/2027)', () => {
    const now = new Date(2026, 10, 3)
    const r = getRange('lunar', now)
    expect(r.label).toBe('Bính Ngọ')
    expect(r.start).toEqual(new Date(2026, 1, 17))
    expect(r.end).toEqual(new Date(2027, 1, 6))
    expect(progressOf(r, now).totalDays).toBe(354)
  })
  it('trước Tết 2026 (1/1/2026) vẫn thuộc năm Ất Tỵ, đúng lúc Tết thì sang Bính Ngọ và về 0%', () => {
    expect(getRange('lunar', new Date(2026, 0, 1)).label).toBe('Ất Tỵ')
    const tet = new Date(2026, 1, 17, 0, 0, 0)
    const r = getRange('lunar', tet)
    expect(r.label).toBe('Bính Ngọ')
    expect(progressOf(r, tet).fraction).toBe(0)
  })
  it('các tháng âm lịch phủ kín cả năm, năm 2025 có tháng nhuận (13 tháng)', () => {
    const r = getRange('lunar', new Date(2025, 6, 1))
    const segs = monthSegments(r)
    expect(segs).toHaveLength(13)
    expect(segs.filter((s) => s.leap)).toHaveLength(1)
    expect(segs[0].start).toEqual(r.start)
    expect(segs.at(-1).end).toEqual(r.end)
  })
})
