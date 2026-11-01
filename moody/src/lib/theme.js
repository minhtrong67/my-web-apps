import { PALETTES } from './palettes'
import { applyFont, getStoredFont } from './fonts'
import { withThemeTransition } from './transition'

// Quản lý giao diện: chế độ sáng/tối/hệ thống, màu chủ đề (Material 3) và cỡ chữ.
// Bảng màu Material 3 Expressive (seed teal) nằm trong src/styles/theme.css; chế độ tối bật bằng class `.dark` trên <html>.
const THEME_KEY = 'theme'
const FONT_KEY = 'fontScale'
const COLOR_KEY = 'themeColor'
export const DEFAULT_THEME_COLOR = 'teal'

const VALID_THEMES = ['light', 'dark', 'system']


function read(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function write(key, value) {
  try {
    if (value == null || value === '') localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* localStorage bị chặn — bỏ qua */
  }
}

// Chỉ chấp nhận giá trị hợp lệ — localStorage có thể chứa giá trị lạ (app khác cùng origin ghi đè,
// dữ liệu cũ…), khi đó quay về mặc định thay vì làm vỡ giao diện.
export function getStoredTheme() {
  const v = read(THEME_KEY)
  return VALID_THEMES.includes(v) ? v : 'system'
}

export function getStoredThemeColor() {
  const v = read(COLOR_KEY)
  return PALETTES.some((p) => p.id === v) ? v : DEFAULT_THEME_COLOR
}

export function getStoredFontScale() {
  const v = read(FONT_KEY)
  return ['0.9', '1', '1.15'].includes(v) ? v : '1'
}

export function isDarkNow() {
  return document.documentElement.classList.contains('dark')
}

// Đọc một "vai trò màu" đang áp dụng (vd 'primary', 'on-surface') thành #hex — dùng cho biểu đồ SVG.
// Màu trong theme là biến CSS/color-mix nên cho trình duyệt tự quy đổi qua canvas thay vì tự tính.
let probe
let ctx
export function readRole(name) {
  try {
    if (!probe) {
      probe = document.createElement('span')
      probe.style.display = 'none'
      document.body.appendChild(probe)
      ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    }
    probe.style.color = `var(--c-${name})`
    const resolved = getComputedStyle(probe).color
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = '#000'
    ctx.fillStyle = resolved
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')
  } catch {
    return '#000000'
  }
}

// Màu thanh trạng thái / thanh địa chỉ của trình duyệt di động = màu nền (--md-surface) của chế độ đang dùng.
// Không dùng media (prefers-color-scheme) trong thẻ meta vì người dùng có thể chọn giao diện khác với hệ điều hành
// → thanh trên cùng bị trắng khi app đang tối.
const THEME_COLOR = { light: '#f4fbf8', dark: '#0e1513' }

function syncThemeColor(isDark) {
  // Ưu tiên màu nền thật đang áp dụng (đổi theo màu chủ đề); dự phòng bằng hằng số nếu chưa đọc được.
  const surface = getComputedStyle(document.documentElement).getPropertyValue('--md-surface').trim()
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  meta.removeAttribute('media')
  meta.content = surface || (isDark ? THEME_COLOR.dark : THEME_COLOR.light)
}

export function applyTheme(theme) {
  const isDark =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
  syncThemeColor(isDark)
}

export function setTheme(theme) {
  write(THEME_KEY, theme)
  withThemeTransition(() => {
    applyTheme(theme)
    window.dispatchEvent(new CustomEvent('themechange'))
  })
}

// Áp màu chủ đề: ghi đè các token --md-* bằng bảng màu đã sinh sẵn (src/lib/palettes.js).
// Màu mặc định (teal) đã nằm trong theme.css nên chỉ cần gỡ phần ghi đè.
export function applyThemeColor(id) {
  const old = document.getElementById('md-theme-override')
  const pal = PALETTES.find((p) => p.id === id)
  if (!pal || id === DEFAULT_THEME_COLOR) {
    old?.remove()
  } else {
    const block = (o) => Object.entries(o).map(([k, v]) => `--md-${k}:${v}`).join(';')
    const el = old || Object.assign(document.createElement('style'), { id: 'md-theme-override' })
    el.textContent = `:root{${block(pal.light)}}.dark{${block(pal.dark)}}`
    if (!old) document.head.appendChild(el)
  }
  syncThemeColor(isDarkNow())
}

export function setThemeColor(id) {
  write(COLOR_KEY, id === DEFAULT_THEME_COLOR ? '' : id)
  withThemeTransition(() => {
    applyThemeColor(id)
    window.dispatchEvent(new CustomEvent('themechange'))
  })
}

export function applyFontScale(scale) {
  document.documentElement.style.setProperty('--font-scale', scale)
}

export function setFontScale(scale) {
  write(FONT_KEY, scale)
  applyFontScale(scale)
}

export function initTheme() {
  // Dọn khóa của bản cũ (màu chủ đề sinh lúc chạy, nay thay bằng bảng màu M3 dựng sẵn).
  write('themeSeed', '')
  write('themeCss', '')

  applyThemeColor(getStoredThemeColor())
  applyTheme(getStoredTheme())
  applyFontScale(getStoredFontScale())
  applyFont(getStoredFont())
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', () => {
    if (getStoredTheme() === 'system') {
      applyTheme('system')
      window.dispatchEvent(new CustomEvent('themechange'))
    }
  })
}
