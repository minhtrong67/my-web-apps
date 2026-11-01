import { withThemeTransition } from './transition'

// Tuỳ chỉnh font chữ toàn app. Font ngoài (Roboto Flex, Roboto, Inter, Be Vietnam Pro) được tự host qua Fontsource
// và chỉ tải khi người dùng chọn (dynamic import) nên không làm nặng lần tải đầu. System / Arial dùng font có sẵn trên máy.
const FONT_KEY = 'fontFamily'
export const DEFAULT_FONT = 'google-sans-flex'

const SYSTEM_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

export const FONTS = [
  { id: 'system', label: 'System', stack: SYSTEM_STACK },
  {
    id: 'google-sans-flex',
    label: 'Google Sans Flex',
    stack: '"Google Sans Flex Variable", "Google Sans Flex", "Google Sans", ' + SYSTEM_STACK,
    // Tiêu đề dùng bản bo tròn (trục ROND) của chính font này.
    round: '"Google Sans Flex Round", "Google Sans Flex Variable", ' + SYSTEM_STACK
  },
  {
    id: 'roboto-flex',
    label: 'Roboto Flex',
    stack: '"Roboto Flex Variable", ' + SYSTEM_STACK,
    load: () => import('@fontsource-variable/roboto-flex/index.css')
  },
  {
    id: 'roboto',
    label: 'Roboto',
    stack: 'Roboto, ' + SYSTEM_STACK,
    load: () => Promise.all([import('@fontsource/roboto/400.css'), import('@fontsource/roboto/500.css'), import('@fontsource/roboto/700.css')])
  },
  { id: 'arial', label: 'Arial', stack: 'Arial, "Helvetica Neue", Helvetica, sans-serif' },
  {
    id: 'inter',
    label: 'Inter',
    stack: '"Inter Variable", ' + SYSTEM_STACK,
    load: () => import('@fontsource-variable/inter/index.css')
  },
  {
    id: 'be-vietnam-pro',
    label: 'Be Vietnam Pro',
    stack: '"Be Vietnam Pro", ' + SYSTEM_STACK,
    load: () =>
      Promise.all([
        import('@fontsource/be-vietnam-pro/400.css'),
        import('@fontsource/be-vietnam-pro/500.css'),
        import('@fontsource/be-vietnam-pro/600.css'),
        import('@fontsource/be-vietnam-pro/700.css')
      ])
  }
]

function read() {
  try {
    return localStorage.getItem(FONT_KEY)
  } catch {
    return null
  }
}

export function getStoredFont() {
  const v = read()
  return FONTS.some((f) => f.id === v) ? v : DEFAULT_FONT
}

const find = (id) => FONTS.find((f) => f.id === id) || FONTS.find((f) => f.id === DEFAULT_FONT)

function setVars(font) {
  const root = document.documentElement
  root.style.setProperty('--font-sans', font.stack)
  root.style.setProperty('--font-round', font.round || font.stack)
}

// Lúc khởi động: áp ngay; font-display: swap nên chữ hiện bằng font dự phòng rồi đổi khi tải xong.
export function applyFont(id) {
  const font = find(id)
  setVars(font)
  font.load?.().catch(() => {})
}

// Khi người dùng đổi font: tải xong (tối đa 1,5 giây) rồi mới đổi bằng hiệu ứng mờ chéo để chữ không nhảy / nháy.
async function swapFont(font) {
  if (font.load) {
    const fam = font.stack.split(',')[0].trim()
    await Promise.race([
      font.load().then(() => document.fonts.load(`400 1em ${fam}`, 'Aaă')).catch(() => {}),
      new Promise((r) => setTimeout(r, 1500))
    ])
  }
  withThemeTransition(() => setVars(font))
}

export function setFont(id) {
  try {
    if (id === DEFAULT_FONT) localStorage.removeItem(FONT_KEY)
    else localStorage.setItem(FONT_KEY, id)
  } catch {
    /* localStorage bị chặn — bỏ qua */
  }
  swapFont(find(id))
}
