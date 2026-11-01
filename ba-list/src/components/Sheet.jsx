import { useEffect, useRef } from 'react'
import { cx } from './ui.jsx'

/**
 * Sheet dựa trên <dialog> gốc (focus trap, Esc, inert nền miễn phí).
 *  - variant="side":   bottom sheet trên mobile, side sheet bên phải từ ≥768px
 *  - variant="bottom": luôn là bottom sheet (bộ lọc trên mobile)
 * data-phase được gán thẳng lên DOM TRƯỚC khi showModal() → animation chạy từ khung đầu tiên (không bị nháy).
 */
export default function Sheet({ open, onClose, variant = 'side', label, children, className }) {
  const ref = useRef(null), last = useRef(children), skip = useRef(false), timer = useRef(0), closeRef = useRef(onClose)
  closeRef.current = onClose
  if (open) last.current = children

  useEffect(() => {
    const d = ref.current
    if (!d) return
    clearTimeout(timer.current)
    if (open) {
      d.style.transition = d.style.transform = ''
      d.dataset.phase = 'open'
      if (!d.open) { window.__sheetAt = performance.now(); document.documentElement.classList.add('sheet-open'); d.showModal() }
      return
    }
    if (!d.open) return
    if (skip.current) {
      skip.current = false
      d.close(); d.dataset.phase = 'closed'; d.style.transition = d.style.transform = ''
      if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('sheet-open')
      return
    }
    d.dataset.phase = 'closing'
    timer.current = setTimeout(() => { d.close(); d.dataset.phase = 'closed'; if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('sheet-open') }, 250)
    return () => clearTimeout(timer.current)
  }, [open])

  /* Kéo thanh nắm xuống để đóng (chỉ khi đang ở dạng bottom sheet) */
  useEffect(() => {
    const d = ref.current
    if (!d) return
    let y0 = 0, dy = 0, t0 = 0, on = false, cap = false, pid = 0
    const isSheet = () => variant === 'bottom' || matchMedia('(max-width: 767px)').matches
    const down = (e) => {
      if (!isSheet() || e.button > 0 || !e.target.closest('[data-drag]') || e.target.closest('button,a,input')) return
      on = true; cap = false; y0 = e.clientY; dy = 0; t0 = e.timeStamp; pid = e.pointerId
    }
    const move = (e) => {
      if (!on || e.pointerId !== pid) return
      const v = e.clientY - y0
      if (!cap) {
        if (Math.abs(v) < 6) return
        cap = true; try { d.setPointerCapture(pid) } catch { /* bỏ qua */ }
        d.style.animation = 'none'; d.style.transition = 'none'
      }
      dy = Math.max(0, v)
      d.style.transform = `translate3d(0, ${dy}px, 0)`
    }
    const end = (e) => {
      if (!on || e.pointerId !== pid) return
      on = false
      if (!cap) return
      cap = false
      const vel = dy / Math.max(1, e.timeStamp - t0)
      d.style.transition = 'transform .26s cubic-bezier(.22,1,.36,1)'
      if (dy > Math.min(140, d.offsetHeight * 0.3) || (vel > 0.5 && dy > 40)) {
        d.style.transform = 'translate3d(0, 105%, 0)'
        setTimeout(() => { skip.current = true; d.style.animation = ''; closeRef.current() }, 200)
      } else {
        d.style.transform = ''
        setTimeout(() => { d.style.transition = ''; d.style.animation = '' }, 280)
      }
    }
    /* sau khi kéo, chặn click "rơi" vào backdrop */
    const swallow = (e) => { if (e.target === d && d.style.transform) { e.stopPropagation(); e.preventDefault() } }
    d.addEventListener('pointerdown', down); d.addEventListener('pointermove', move)
    d.addEventListener('pointerup', end); d.addEventListener('pointercancel', end)
    d.addEventListener('click', swallow, true)
    return () => {
      d.removeEventListener('pointerdown', down); d.removeEventListener('pointermove', move)
      d.removeEventListener('pointerup', end); d.removeEventListener('pointercancel', end)
      d.removeEventListener('click', swallow, true)
    }
  }, [variant])

  return (
    <dialog
      ref={ref} data-side={variant} aria-label={label}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      className={cx(
        'sheet m-0 flex-col overflow-hidden border-0 p-0 text-on-surface open:flex',
        '[clip-path:polygon(0_18px,100%_0,100%_100%,0_100%)]',
        variant === 'side'
          ? 'fixed inset-x-0 bottom-0 top-auto max-h-[92dvh] w-full max-w-none md:inset-y-0 md:left-auto md:right-0 md:h-dvh md:max-h-none md:w-[min(640px,100vw)] md:[clip-path:polygon(26px_0,100%_0,100%_100%,0_100%)]'
          : 'fixed inset-x-0 bottom-0 top-auto mx-auto max-h-[90dvh] w-full max-w-3xl',
        className,
      )}
    >
      <div data-drag className={cx('relative h-8 shrink-0 cursor-grab touch-none select-none', variant === 'side' && 'md:hidden')}>
        <span className="slant absolute left-1/2 top-3.5 h-1.5 w-14 -translate-x-1/2 bg-primary/60 [--s:4px]" />
      </div>
      {open ? children : last.current}
    </dialog>
  )
}
