import { useEffect, useRef, useState } from 'react'

// Tooltip tuỳ chỉnh: gắn data-tip="..." (và data-tip-side="right|bottom") lên bất kỳ phần tử nào
export const flashTip = (el, text) => dispatchEvent(new CustomEvent('sv-tip', { detail: { el, text } }))

export default function Tooltip() {
  const [t, setT] = useState(null)
  const timer = useRef()
  useEffect(() => {
    const show = (el, text) => { const r = el.getBoundingClientRect(); setT({ text, r, side: el.dataset.tipSide || 'top' }) }
    const over = (e) => { const el = e.target.closest?.('[data-tip]'); if (el?.dataset.tip) { clearTimeout(timer.current); show(el, el.dataset.tip) } }
    const out = (e) => { const el = e.target.closest?.('[data-tip]'); if (el && !el.contains(e.relatedTarget)) setT(null) }
    const flash = (e) => { show(e.detail.el, e.detail.text); clearTimeout(timer.current); timer.current = setTimeout(() => setT(null), 1100) }
    const hide = () => setT(null)
    document.addEventListener('mouseover', over); document.addEventListener('mouseout', out)
    document.addEventListener('focusin', over); document.addEventListener('focusout', out)
    addEventListener('sv-tip', flash); addEventListener('scroll', hide, true); addEventListener('pointerdown', hide)
    return () => {
      document.removeEventListener('mouseover', over); document.removeEventListener('mouseout', out)
      document.removeEventListener('focusin', over); document.removeEventListener('focusout', out)
      removeEventListener('sv-tip', flash); removeEventListener('scroll', hide, true); removeEventListener('pointerdown', hide)
    }
  }, [])
  if (!t) return null
  const { r, side } = t
  const flip = side === 'top' && r.top < 48 ? 'bottom' : side
  const x = flip === 'right' ? r.right + 10 : Math.min(Math.max(r.left + r.width / 2, 70), innerWidth - 70)
  const y = flip === 'right' ? r.top + r.height / 2 : flip === 'top' ? r.top - 10 : r.bottom + 10
  return <div className={`tip ${flip}`} style={{ left: x, top: y }} role="tooltip">{t.text}</div>
}
