/* Danh sách font + nạp lười (chỉ tải font khi được chọn, tự host nên dùng được offline) */
const SYSTEM = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'

export const FONT_LIST = [
  { id: 'system', label: 'System', stack: SYSTEM },
  { id: 'google-sans-flex', label: 'Google Sans Flex', family: 'Google Sans Flex Variable', load: () => import('../fonts/google-sans-flex.css') },
  { id: 'roboto-flex', label: 'Roboto Flex', family: 'Roboto Flex Variable', load: () => import('../fonts/roboto-flex.css') },
  { id: 'roboto', label: 'Roboto', family: 'Roboto', load: () => import('../fonts/roboto.js') },
  { id: 'arial', label: 'Arial', stack: 'Arial, "Helvetica Neue", Helvetica, sans-serif' },
  { id: 'inter', label: 'Inter', family: 'Inter Variable', load: () => import('../fonts/inter.css') },
  { id: 'be-vietnam-pro', label: 'Be Vietnam Pro', family: 'Be Vietnam Pro', load: () => import('../fonts/be-vietnam-pro.js') },
]
export const FONT_IDS = FONT_LIST.map((f) => f.id)
export const getFont = (id) => FONT_LIST.find((f) => f.id === id) || FONT_LIST[0]
export const fontStack = (id) => { const f = getFont(id); return f.stack || `"${f.family}", ${SYSTEM}` }
/** Giá trị font cũ (sans/round/serif/mono) → System */
export const normalizeFont = (id) => (FONT_IDS.includes(id) ? id : 'system')

const cache = new Map()
const SAMPLE = 'Aa Ăă Ââ Đđ Êê Ôô Ơơ Ưư ấ ế ộ ự 0123'
/** Nạp CSS + file font cần cho Latin/tiếng Việt; resolve khi font sẵn sàng để đổi font không bị nhảy chữ. */
export function loadFont(id) {
  const f = getFont(id)
  if (!f.load) return Promise.resolve()
  if (!cache.has(id)) {
    const p = f.load()
      .then(() => Promise.all([400, 500, 700].map((w) => document.fonts.load(`${w} 1em "${f.family}"`, SAMPLE))))
      .catch(() => {})
    cache.set(id, p)
  }
  return cache.get(id)
}
