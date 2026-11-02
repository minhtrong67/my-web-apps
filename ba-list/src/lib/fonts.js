/* Danh sách font + nạp lười (chỉ tải font khi được chọn, tự host nên dùng được offline) */
const SYSTEM = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'

export const FONT_LIST = [
  { id: 'system', label: 'System', stack: SYSTEM },
  { id: 'google-sans-flex', label: 'Google Sans Flex', family: 'Google Sans Flex Variable' },
  { id: 'roboto-flex', label: 'Roboto Flex', family: 'Roboto Flex Variable' },
  { id: 'roboto', label: 'Roboto', family: 'Roboto' },
  { id: 'arial', label: 'Arial', stack: 'Arial, "Helvetica Neue", Helvetica, sans-serif' },
  { id: 'inter', label: 'Inter', family: 'Inter Variable' },
  { id: 'be-vietnam-pro', label: 'Be Vietnam Pro', family: 'Be Vietnam Pro' },
]
export const FONT_IDS = FONT_LIST.map((f) => f.id)
export const getFont = (id) => FONT_LIST.find((f) => f.id === id) || FONT_LIST[0]
export const fontStack = (id) => { const f = getFont(id); return f.stack || `"${f.family}", ${SYSTEM}` }
/** Giá trị font cũ (sans/round/serif/mono) → System */
export const normalizeFont = (id) => (FONT_IDS.includes(id) ? id : 'system')

const cache = new Map()
const SAMPLE = 'Aa Ăă Ââ Đđ Êê Ôô Ơơ Ưư ấ ế ộ ự 0123'
/** Tải sẵn file font cho Latin + tiếng Việt (3 độ đậm); resolve khi font sẵn sàng (hoặc sau 2,5 giây) để không bị nhảy chữ. */
export function loadFont(id) {
  const f = getFont(id)
  if (!f.family) return Promise.resolve()
  if (!cache.has(id)) {
    const load = Promise.all([400, 500, 700].map((w) => document.fonts.load(`${w} 1em "${f.family}"`, SAMPLE))).catch(() => {})
    cache.set(id, Promise.race([load, new Promise((r) => setTimeout(r, 2500))]))
  }
  return cache.get(id)
}
