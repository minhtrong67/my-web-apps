/**
 * Danh sách font chữ người dùng có thể chọn. Font web được nạp lười (dynamic
 * import) chỉ khi được chọn, nên mặc định (font hệ thống) không tốn thêm dữ liệu.
 * Các tệp font do gói @fontsource cung cấp, tự đóng gói theo ứng dụng (không
 * phụ thuộc Google Fonts) và được service worker lưu cache để dùng ngoại tuyến.
 */
const FALLBACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'

export const DEFAULT_FONT = 'system'

export const FONT_OPTIONS = [
  { key: 'system', name: null, stack: FALLBACK, load: null },
  {
    key: 'google-sans-flex',
    name: 'Google Sans Flex',
    stack: `"Google Sans Flex Variable", ${FALLBACK}`,
    load: () => import('@fontsource-variable/google-sans-flex/index.css'),
  },
  {
    key: 'roboto-flex',
    name: 'Roboto Flex',
    stack: `"Roboto Flex Variable", ${FALLBACK}`,
    load: () => import('@fontsource-variable/roboto-flex/index.css'),
  },
  {
    key: 'roboto',
    name: 'Roboto',
    stack: `"Roboto", ${FALLBACK}`,
    load: () =>
      Promise.all([
        import('@fontsource/roboto/400.css'),
        import('@fontsource/roboto/500.css'),
        import('@fontsource/roboto/700.css'),
      ]),
  },
  {
    key: 'arial',
    name: 'Arial',
    stack: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    load: null,
  },
  {
    key: 'inter',
    name: 'Inter',
    stack: `"Inter Variable", ${FALLBACK}`,
    load: () => import('@fontsource-variable/inter/index.css'),
  },
  {
    key: 'be-vietnam-pro',
    name: 'Be Vietnam Pro',
    stack: `"Be Vietnam Pro", ${FALLBACK}`,
    load: () =>
      Promise.all([
        import('@fontsource/be-vietnam-pro/400.css'),
        import('@fontsource/be-vietnam-pro/500.css'),
        import('@fontsource/be-vietnam-pro/600.css'),
        import('@fontsource/be-vietnam-pro/700.css'),
      ]),
  },
]

export const getFontOption = (key) =>
  FONT_OPTIONS.find((f) => f.key === key) || FONT_OPTIONS[0]

const loaded = new Set()

/** Nạp CSS của font (một lần). Lỗi mạng không làm hỏng giao diện vì luôn có font dự phòng. */
export async function ensureFontLoaded(key) {
  const option = getFontOption(key)
  if (!option.load || loaded.has(option.key)) return
  try {
    await option.load()
    loaded.add(option.key)
  } catch {
    /* giữ font dự phòng */
  }
}
