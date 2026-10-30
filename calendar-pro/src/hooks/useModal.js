import { useEffect, useRef } from 'react'

let lockCount = 0
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Hành vi chuẩn cho dialog/sheet: Esc để đóng, khoá cuộn nền (đếm số lớp chồng nhau),
 * đưa focus vào trong, giữ Tab quay vòng trong hộp thoại và trả focus về nơi cũ khi đóng.
 */
export function useModal(active, onClose, panelRef) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!active) return
    const previous = document.activeElement
    lockCount += 1
    document.body.style.overflow = 'hidden'

    const getFocusable = () =>
      panelRef.current
        ? [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((n) => !n.disabled && n.offsetParent !== null)
        : []

    const frame = requestAnimationFrame(() => {
      const first = getFocusable()[0]
      ;(first ?? panelRef.current)?.focus({ preventScroll: true })
    })

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeRef.current()
      } else if (e.key === 'Tab') {
        const items = getFocusable()
        if (!items.length) {
          e.preventDefault()
          return
        }
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) document.body.style.overflow = ''
      if (previous && document.contains(previous)) previous.focus?.({ preventScroll: true })
    }
  }, [active, panelRef])
}
