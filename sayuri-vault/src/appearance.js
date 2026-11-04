import { useEffect, useState } from 'react'

// [id, hue oklch, hệ số chroma] — bảng màu chủ đề Material Design
export const COLORS = [['red', 27, 1], ['pink', 355, 1], ['purple', 325, 1], ['deep-purple', 295, .95], ['indigo', 275, 1], ['blue', 255, 1],
  ['light-blue', 238, 1], ['cyan', 205, .9], ['teal', 185, .85], ['green', 150, .95], ['light-green', 130, .95], ['lime', 112, .9],
  ['yellow', 95, .9], ['amber', 80, .95], ['orange', 60, 1], ['deep-orange', 40, 1], ['brown', 45, .25], ['grey', 270, .04], ['blue-grey', 240, .25]]
export const FONTS = [['system', 'System', null], ['google-sans-flex', 'Google Sans Flex', 'Google+Sans+Flex:wght@400..800'], ['roboto-flex', 'Roboto Flex', 'Roboto+Flex:wght@400..800'],
  ['roboto', 'Roboto', 'Roboto:wght@400;500;700'], ['arial', 'Arial', null], ['inter', 'Inter', 'Inter:wght@400..800'], ['be-vietnam', 'Be Vietnam Pro', 'Be+Vietnam+Pro:wght@400;500;700;800']]
const SYS = "system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
const DEF = { theme: 'system', color: 'deep-purple', size: 'md', lang: 'vi', font: 'system' }
const K = 'sv_appearance'

export const read = () => { try { return { ...DEF, ...JSON.parse(localStorage[K] || '{}') } } catch { return DEF } }

export function apply(a = read()) {
  const r = document.documentElement
  r.dataset.theme = a.theme === 'system' ? (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light') : a.theme
  const c = COLORS.find((x) => x[0] === a.color) || COLORS[3]
  r.style.setProperty('--ah', c[1]); r.style.setProperty('--ac', c[2])
  r.style.setProperty('--rs', { sm: '14px', md: '16px', lg: '18px' }[a.size] || '16px')
  const f = FONTS.find((x) => x[0] === a.font) || FONTS[0]
  r.style.setProperty('--ff', f[0] === 'system' ? SYS : f[0] === 'arial' ? 'Arial,Helvetica,sans-serif' : `'${f[1]}',${SYS}`)
  if (f[2] && !document.getElementById('f-' + f[0])) {
    const l = document.createElement('link')
    l.id = 'f-' + f[0]; l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?family=${f[2]}&display=swap`
    document.head.append(l)
  }
  r.lang = a.lang
}
export function update(p) {
  const a = { ...read(), ...p }
  localStorage[K] = JSON.stringify(a); apply(a); dispatchEvent(new Event('sv-appearance'))
}
export function useAppearance() {
  const [a, set] = useState(read)
  useEffect(() => {
    const f = () => set(read())
    addEventListener('sv-appearance', f)
    return () => removeEventListener('sv-appearance', f)
  }, [])
  return [a, update]
}
