/**
 * Font chữ chọn được trong Cài đặt. Font web được tự host qua @fontsource (không phụ thuộc Google CDN,
 * dùng được offline sau lần tải đầu) và chỉ tải khi người dùng thực sự chọn — mỗi font là một chunk riêng.
 * Tất cả đều có đủ dấu tiếng Việt (subset "vietnamese").
 */
const SYSTEM_STACK = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif"
const FALLBACK = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', Arial, sans-serif"

export const FONT_OPTIONS = [
  { id: 'system', label: 'System', note: 'Font của hệ điều hành', stack: SYSTEM_STACK, load: null },
  {
    id: 'google-sans-flex',
    label: 'Google Sans Flex',
    note: 'Font của Material 3 Expressive',
    stack: `'Google Sans Flex Variable', ${FALLBACK}`,
    load: () => import('@fontsource-variable/google-sans-flex/wght.css')
  },
  {
    id: 'roboto-flex',
    label: 'Roboto Flex',
    note: 'Biến thể linh hoạt của Roboto',
    stack: `'Roboto Flex Variable', ${FALLBACK}`,
    load: () => import('@fontsource-variable/roboto-flex/wght.css')
  },
  {
    id: 'roboto',
    label: 'Roboto',
    note: 'Font Material cổ điển',
    stack: `'Roboto', ${FALLBACK}`,
    load: () => Promise.all([
      import('@fontsource/roboto/400.css'),
      import('@fontsource/roboto/500.css'),
      import('@fontsource/roboto/700.css')
    ])
  },
  { id: 'arial', label: 'Arial', note: 'Có sẵn trên mọi máy', stack: "Arial, 'Helvetica Neue', Helvetica, sans-serif", load: null },
  {
    id: 'inter',
    label: 'Inter',
    note: 'Gọn, dễ đọc trên màn hình',
    stack: `'Inter Variable', ${FALLBACK}`,
    load: () => import('@fontsource-variable/inter/wght.css')
  },
  {
    id: 'be-vietnam-pro',
    label: 'Be Vietnam Pro',
    note: 'Thiết kế riêng cho tiếng Việt',
    stack: `'Be Vietnam Pro', ${FALLBACK}`,
    load: () => Promise.all([
      import('@fontsource/be-vietnam-pro/400.css'),
      import('@fontsource/be-vietnam-pro/500.css'),
      import('@fontsource/be-vietnam-pro/600.css'),
      import('@fontsource/be-vietnam-pro/700.css')
    ])
  }
]

export const DEFAULT_FONT_ID = 'system'
export const getFont = (id) => FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0]

const loaded = new Map()

/** Tải font (một lần) rồi trả về promise; font hệ thống thì trả về ngay. */
export function loadFont(id) {
  const font = getFont(id)
  if (!font.load) return Promise.resolve()
  if (!loaded.has(font.id)) loaded.set(font.id, font.load().catch(() => loaded.delete(font.id)))
  return loaded.get(font.id)
}
