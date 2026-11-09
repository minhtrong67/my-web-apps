import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Tooltip: đo kích thước thật, tự lật xuống dưới nếu thiếu chỗ phía trên, luôn nằm trong viewport
export default function Tooltip({ label, children }) {
  const [anchor, setAnchor] = useState(null)
  const [pos, setPos] = useState(null)
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (!anchor || !ref.current) return setPos(null)
    const r = anchor.getBoundingClientRect()
    const w = ref.current.offsetWidth, h = ref.current.offsetHeight
    const left = Math.min(Math.max(r.left + r.width / 2 - w / 2, 8), innerWidth - w - 8)
    setPos({ left, top: r.top - h - 8 >= 8 ? r.top - h - 8 : r.bottom + 8 })
  }, [anchor, label])

  useEffect(() => {
    if (!anchor) return
    const off = () => setAnchor(null)
    addEventListener('scroll', off, true); addEventListener('resize', off)
    return () => { removeEventListener('scroll', off, true); removeEventListener('resize', off) }
  }, [anchor])

  const off = () => setAnchor(null)
  return (
    <span className="inline-flex"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setAnchor(e.currentTarget)}
      onFocus={(e) => e.target.matches?.(':focus-visible') && setAnchor(e.currentTarget)}
      onPointerLeave={off} onBlur={off} onPointerDown={off}>
      {children}
      {anchor && createPortal(
        <div ref={ref} role="tooltip" className="tip cut-sm w-max max-w-[16rem] border border-p bg-fg px-2.5 py-1.5 text-xs font-bold text-bg shadow-xl"
          style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999, visibility: pos ? 'visible' : 'hidden' }}>{label}</div>,
        document.body)}
    </span>
  )
}
