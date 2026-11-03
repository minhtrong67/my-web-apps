import { useEffect, useState } from 'react'

const K = 'sv_appearance'
const read = () => { try { return { theme: 'system', hue: 350, ...JSON.parse(localStorage[K] || '{}') } } catch { return { theme: 'system', hue: 350 } } }

export function apply(a = read()) {
  const r = document.documentElement
  r.dataset.theme = a.theme === 'system' ? (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light') : a.theme
  r.style.setProperty('--ah', a.hue)
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
