export const COLORS = {
  Red: '#F44336', Pink: '#E91E63', Purple: '#9C27B0', 'Deep Purple': '#673AB7', Indigo: '#3F51B5',
  Blue: '#2196F3', 'Light Blue': '#03A9F4', Cyan: '#00BCD4', Teal: '#009688', Green: '#4CAF50',
  'Light Green': '#8BC34A', Lime: '#CDDC39', Yellow: '#FFEB3B', Amber: '#FFC107', Orange: '#FF9800',
  'Deep Orange': '#FF5722', Brown: '#795548', Grey: '#9E9E9E', 'Blue Grey': '#607D8B'
}

export const FONTS = {
  System: 'system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
  'Google Sans Flex': '"Google Sans Flex","Google Sans",system-ui,sans-serif',
  'Roboto Flex': '"Roboto Flex",Roboto,system-ui,sans-serif',
  Roboto: 'Roboto,system-ui,sans-serif',
  Arial: 'Arial,"Helvetica Neue",Helvetica,sans-serif',
  Inter: 'Inter,system-ui,sans-serif',
  'Be Vietnam Pro': '"Be Vietnam Pro",system-ui,sans-serif'
}

export const SIZES = { sm: '14px', md: '16px', lg: '18px' }

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (c, t, a) => c.map((v, i) => Math.round(v + (t[i] - v) * a))
const lum = (c) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
}
export const onColor = (hex) => (lum(rgb(hex)) > 0.4 ? '#111827' : '#ffffff')

export function applyTheme(s) {
  const root = document.documentElement
  const dark = s.theme === 'dark' || (s.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light'
  const c = rgb(COLORS[s.color] || COLORS['Light Blue'])
  const ink = dark ? mix(c, [255, 255, 255], 0.25) : mix(c, [0, 0, 0], lum(c) > 0.45 ? 0.62 : 0.3)
  const on = lum(c) > 0.4 ? [17, 24, 39] : [255, 255, 255]
  root.style.setProperty('--p', c.join(' '))
  root.style.setProperty('--p-ink', ink.join(' '))
  root.style.setProperty('--on-p', on.join(' '))
  root.style.setProperty('--font', FONTS[s.font] || FONTS.System)
  root.style.fontSize = SIZES[s.size] || SIZES.md
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#08111e' : '#f2f6fb')
}
