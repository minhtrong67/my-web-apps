import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { dict } from './i18n.js'

export const COLORS = {
  Red: '#F44336', Pink: '#E91E63', Purple: '#9C27B0', 'Deep Purple': '#673AB7', Indigo: '#3F51B5', Blue: '#2196F3',
  'Light Blue': '#03A9F4', Cyan: '#00BCD4', Teal: '#009688', Green: '#4CAF50', 'Light Green': '#8BC34A', Lime: '#CDDC39',
  Yellow: '#FFEB3B', Amber: '#FFC107', Orange: '#FF9800', 'Deep Orange': '#FF5722', Brown: '#795548', Grey: '#9E9E9E', 'Blue Grey': '#607D8B'
}
export const FONTS = {
  System: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  'Google Sans Flex': '"Google Sans Flex", sans-serif',
  'Roboto Flex': '"Roboto Flex", sans-serif',
  Roboto: 'Roboto, sans-serif',
  Arial: 'Arial, Helvetica, sans-serif',
  Inter: 'Inter, sans-serif',
  'Be Vietnam Pro': '"Be Vietnam Pro", sans-serif'
}
const SIZES = { small: '14px', medium: '16px', large: '18px' }
export const DEFAULTS = { mode: 'dark', color: 'Lime', size: 'medium', lang: 'en', font: 'Be Vietnam Pro', view: 'grid', detailLang: 'en' }

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const lum = ([r, g, b]) => [r, g, b].map((c) => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0)

const mix = (c, to, k) => c.map((v) => Math.round(v + (to - v) * k))
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
// Chọn màu chữ nhấn đạt tương phản >= 4.5 so với nền hiện tại
export function readable(base, dark) {
  const bg = dark ? [11, 11, 13] : [238, 238, 240], to = dark ? 255 : 0
  let c = base
  for (let k = 0; k <= 1 && contrast(c, bg) < 4.5; k += 0.05) c = mix(base, to, k)
  return c
}
export const onHex = (hex) => (lum(rgb(hex)) > 0.4 ? '#111114' : '#ffffff')

const Ctx = createContext(null)
export const useSettings = () => useContext(Ctx)

export function SettingsProvider({ children }) {
  const [s, setS] = useState(() => {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('zzz-settings') || '{}') } } catch { return DEFAULTS }
  })
  const [sysDark, setSysDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const fn = (e) => setSysDark(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  const dark = s.mode === 'system' ? sysDark : s.mode === 'dark'
  useEffect(() => {
    const el = document.documentElement
    el.className = dark ? 'dark' : 'light'
    el.lang = s.lang
    const base = rgb(COLORS[s.color])
    // trong chế độ sáng, làm tối màu chữ nhấn để đủ tương phản
    const pt = readable(base, dark)
    el.style.setProperty('--p', base.join(' '))
    el.style.setProperty('--pt', pt.join(' '))
    el.style.setProperty('--onp', lum(base) > 0.4 ? '17 17 20' : '255 255 255')
    el.style.setProperty('--fs', SIZES[s.size])
    el.style.setProperty('--font', FONTS[s.font])
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#0b0b0d' : '#eeeef0')
    localStorage.setItem('zzz-settings', JSON.stringify(s))
  }, [s, dark])

  const value = useMemo(() => ({
    ...s, set: (patch) => setS((p) => ({ ...p, ...patch })), reset: () => setS(DEFAULTS), t: (k) => dict[s.lang][k] ?? k
  }), [s])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
