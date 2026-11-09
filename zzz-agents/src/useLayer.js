import { useEffect, useRef } from 'react'

const stack = []
const SEL = 'a[href],button:not([disabled]),input,textarea,summary,[tabindex]:not([tabindex="-1"])'

// Quản lý lớp phủ (dialog / drawer / lightbox): Esc đóng lớp trên cùng, khóa cuộn, giữ focus, trả focus khi đóng
export function useLayer(ref, active, onClose) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const id = Symbol('layer')
    const prev = document.activeElement
    stack.push(id)
    document.body.style.overflow = 'hidden'
    const items = () => [...el.querySelectorAll(SEL)].filter((n) => !n.closest('[inert]') && n.getClientRects().length)
    ;(items()[0] || el).focus({ preventScroll: true })

    const key = (e) => {
      if (stack[stack.length - 1] !== id) return
      if (e.key === 'Escape') {
        if (document.activeElement?.getAttribute('aria-expanded') === 'true') return // để dropdown tự đóng trước
        e.stopPropagation(); e.preventDefault(); closeRef.current()
      } else if (e.key === 'Tab') {
        const f = items()
        if (!f.length) { e.preventDefault(); return el.focus() }
        const out = !el.contains(document.activeElement)
        if (e.shiftKey && (out || document.activeElement === f[0])) { e.preventDefault(); f[f.length - 1].focus() }
        else if (!e.shiftKey && (out || document.activeElement === f[f.length - 1])) { e.preventDefault(); f[0].focus() }
      }
    }
    document.addEventListener('keydown', key, true)
    return () => {
      document.removeEventListener('keydown', key, true)
      stack.splice(stack.indexOf(id), 1)
      if (!stack.length) document.body.style.overflow = ''
      prev?.focus?.({ preventScroll: true })
    }
  }, [active, ref])
}
