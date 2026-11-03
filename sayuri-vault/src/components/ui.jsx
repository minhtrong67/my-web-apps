import { useEffect, useRef } from 'react'
import { useData } from '../data'
import { STYLE } from '../config/modules'

export const Icon = ({ name }) => <i className="ms">{name}</i>

export const cookie = (n, a = 5) =>
  'polygon(' + Array.from({ length: 72 }, (_, i) => {
    const t = (i / 72) * Math.PI * 2, r = 50 - a + a * Math.cos(n * t)
    return `${(50 + r * Math.cos(t)).toFixed(1)}% ${(50 + r * Math.sin(t)).toFixed(1)}%`
  }).join() + ')'

export const hue = (key) => ({ '--h': STYLE[key]?.h })

export function Modal({ onClose, locked, style, children }) {
  const ref = useRef()
  useEffect(() => { ref.current.showModal() }, [])
  return (
    <dialog ref={ref} className="dlg" style={style} onClose={onClose}
      onCancel={(e) => locked && e.preventDefault()}>{children}</dialog>
  )
}

export function Toasts() {
  const { toasts, dismiss } = useData()
  return (
    <div className="snack">
      {toasts.map((t) => (
        <div key={t.id}><span>{t.msg}</span>
          {t.label && <button onClick={() => { t.fn(); dismiss(t.id) }}>{t.label}</button>}</div>
      ))}
    </div>
  )
}
