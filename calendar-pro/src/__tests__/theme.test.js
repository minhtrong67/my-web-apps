import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import colors from '../theme/colors.json'
import swatches from '../theme/swatches.json'
import theme from '../theme/material-theme.json'
import { FONT_OPTIONS } from '../lib/fonts'
import { FONT_SIZE_OPTIONS, LEGACY_COLORS } from '../contexts/SettingsContext.jsx'

const MATERIAL_19 = ['Red', 'Pink', 'Purple', 'Deep Purple', 'Indigo', 'Blue', 'Light Blue', 'Cyan', 'Teal', 'Green', 'Light Green', 'Lime', 'Yellow', 'Amber', 'Orange', 'Deep Orange', 'Brown', 'Grey', 'Blue Grey']

describe('Màu chủ đề', () => {
  it('đúng 19 màu Material theo thứ tự, id không trùng, đủ nhãn tiếng Việt', () => {
    expect(colors.map((c) => c.label)).toEqual(MATERIAL_19)
    expect(new Set(colors.map((c) => c.id)).size).toBe(19)
    for (const c of colors) expect(c.labelVi).toBeTruthy()
  })
  it('mỗi màu có bảng màu sáng + tối đầy đủ và ô chọn màu', () => {
    for (const c of colors) {
      expect(theme[c.id].light.primary).toMatch(/^#[0-9a-f]{6}$/)
      expect(theme[c.id].dark['on-primary']).toMatch(/^#[0-9a-f]{6}$/)
      expect(swatches[c.id].light.primary).toBeTruthy()
    }
  })
  it('màu cũ đã lưu đều được chuyển sang màu mới tồn tại', () => {
    const ids = new Set(colors.map((c) => c.id))
    for (const target of Object.values(LEGACY_COLORS)) expect(ids.has(target)).toBe(true)
  })
  it('danh sách màu trong index.html (màn hình chờ) khớp thứ tự với colors.json', () => {
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
    const ids = html.match(/var ids = \[([^\]]*)\]/)[1].split(',').map((x) => x.trim().replace(/'/g, ''))
    expect(ids).toEqual(colors.map((c) => c.id))
  })
})

describe('Tuỳ chọn giao diện khác', () => {
  it('7 font theo yêu cầu', () => {
    expect(FONT_OPTIONS.map((f) => f.label)).toEqual(['System', 'Google Sans Flex', 'Roboto Flex', 'Roboto', 'Arial', 'Inter', 'Be Vietnam Pro'])
  })
  it('3 cỡ chữ nhỏ / vừa / lớn', () => {
    expect(FONT_SIZE_OPTIONS.map((s) => s.id)).toEqual(['nho', 'vua', 'lon'])
  })
})
