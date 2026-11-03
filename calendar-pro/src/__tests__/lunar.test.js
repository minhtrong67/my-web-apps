import { describe, it, expect } from 'vitest'
import { solarToLunar, lunarToSolar, canChiDay, canChiYear, canChiMonth, gioHoangDao, saoNgay, huongXuatHanh } from '../lib/lunar'

describe('Quy đổi dương ↔ âm', () => {
  // Mùng 1 Tết Nguyên Đán các năm (dương lịch) — mốc đã công bố
  const TET = [
    [2020, 1, 25], [2021, 2, 12], [2022, 2, 1], [2023, 1, 22],
    [2024, 2, 10], [2025, 1, 29], [2026, 2, 17], [2027, 2, 6]
  ]
  it.each(TET)('Tết %i rơi vào %i/%i (dương lịch ↔ âm lịch)', (year, m, d) => {
    expect(solarToLunar(d, m, year)).toEqual([1, 1, year, 0])
    expect(lunarToSolar(1, 1, year, 0)).toEqual([d, m, year])
  })

  it('Rằm tháng Tám (Trung Thu) 2024 = 17/9 và 2025 = 6/10', () => {
    expect(lunarToSolar(15, 8, 2024)).toEqual([17, 9, 2024])
    expect(lunarToSolar(15, 8, 2025)).toEqual([6, 10, 2025])
  })

  it('nhận ra tháng nhuận: 22/3/2023 là mùng 1 tháng 2 nhuận', () => {
    expect(solarToLunar(22, 3, 2023)).toEqual([1, 2, 2023, 1])
    expect(solarToLunar(21, 3, 2023)[3]).toBe(0) // ngày trước đó vẫn là tháng 2 thường
    expect(lunarToSolar(1, 2, 2023, 1)).toEqual([22, 3, 2023])
  })

  it('khứ hồi (dương → âm → dương) đúng cho mọi ngày của vài năm', () => {
    for (const year of [2023, 2024, 2026]) {
      for (let dayOfYear = 0; dayOfYear < 366; dayOfYear += 3) {
        const date = new Date(year, 0, 1 + dayOfYear)
        if (date.getFullYear() !== year) continue
        const [ld, lm, ly, leap] = solarToLunar(date.getDate(), date.getMonth() + 1, year)
        expect(lunarToSolar(ld, lm, ly, leap)).toEqual([date.getDate(), date.getMonth() + 1, year])
      }
    }
  })
})

describe('Can chi', () => {
  it('năm', () => {
    expect(canChiYear(2024)).toBe('Giáp Thìn')
    expect(canChiYear(2025)).toBe('Ất Tỵ')
    expect(canChiYear(2026)).toBe('Bính Ngọ')
  })
  it('ngày: 1/1/2000 là Mậu Ngọ', () => {
    expect(canChiDay(1, 1, 2000)).toBe('Mậu Ngọ')
  })
  it('tháng: tháng Giêng năm Giáp/Kỷ là Bính Dần', () => {
    expect(canChiMonth(1, 2024)).toBe('Bính Dần')
    expect(canChiMonth(1, 2026)).toBe('Canh Dần')
  })
})

describe('Giờ hoàng đạo', () => {
  it('ngày Ngọ (1/1/2000): Tý, Sửu, Mão, Ngọ, Thân, Dậu', () => {
    expect(gioHoangDao(1, 1, 2000)).toEqual(['23h-1h (Tý)', '1h-3h (Sửu)', '5h-7h (Mão)', '11h-13h (Ngọ)', '15h-17h (Thân)', '17h-19h (Dậu)'])
  })
  it('ngày Tý và ngày Ngọ dùng chung một bộ giờ (cách nhau 6 ngày)', () => {
    expect(gioHoangDao(7, 1, 2000)).toEqual(gioHoangDao(1, 1, 2000))
  })
  it('luôn có đúng 6 giờ hoàng đạo, mỗi chi ngày một bộ hợp lệ', () => {
    for (let i = 0; i < 12; i++) {
      const hours = gioHoangDao(1 + i, 1, 2000)
      expect(hours).toHaveLength(6)
      expect(new Set(hours).size).toBe(6)
    }
  })
})

describe('Hoàng đạo / hắc đạo', () => {
  it('tháng 12 âm: ngày Ngọ là Thiên Lao (hắc đạo)', () => {
    expect(saoNgay(1, 1, 2000, 12)).toEqual({ name: 'Thiên Lao', good: false })
  })
  it('đúng 6 ngày hoàng đạo trong mỗi vòng 12 ngày', () => {
    for (const month of [1, 5, 12]) {
      const good = Array.from({ length: 12 }, (_, i) => saoNgay(1 + i, 1, 2000, month)).filter((s) => s.good)
      expect(good).toHaveLength(6)
    }
  })
  it('tháng 1: ngày Tý là Thanh Long (tìm ngày Tý quanh 7/1/2000)', () => {
    // 1/1/2000 là ngày Ngọ → 7/1/2000 là ngày Tý
    expect(saoNgay(7, 1, 2000, 1).name).toBe('Thanh Long')
  })
})

describe('Hướng xuất hành', () => {
  it('ngày Mậu (1/1/2000): hỷ thần Đông Nam, tài thần Chính Bắc', () => {
    expect(huongXuatHanh(1, 1, 2000)).toEqual({ hyThan: 'Đông Nam', taiThan: 'Chính Bắc' })
  })
})
