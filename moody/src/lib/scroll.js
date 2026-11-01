// Cuộn mượt bằng requestAnimationFrame (easing + thời lượng theo quãng đường) — mượt đều trên mọi trình duyệt,
// kể cả khi `scroll-behavior` của trình duyệt bị tắt hoặc quá nhanh. Người dùng chạm / lăn chuột giữa chừng thì dừng ngay.
let cancel = null

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2) // easeInOutCubic

export function smoothScrollTo(targetY) {
  cancel?.()
  const from = window.scrollY
  const max = document.documentElement.scrollHeight - window.innerHeight
  const to = Math.max(0, Math.min(targetY, max))
  const dist = to - from
  // 'instant' để ghi đè `scroll-behavior: smooth` của CSS — mỗi khung hình ta tự đặt vị trí.
  const jump = (y) => window.scrollTo({ top: y, behavior: 'instant' })
  if (reduced() || Math.abs(dist) < 2) return jump(to)

  const duration = Math.min(1000, Math.max(450, Math.abs(dist) * 0.35))
  const start = performance.now()
  let raf = 0
  const stop = () => {
    cancelAnimationFrame(raf)
    ;['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((e) => window.removeEventListener(e, stop))
    cancel = null
  }
  const step = (now) => {
    const p = Math.min(1, (now - start) / duration)
    jump(from + dist * ease(p))
    if (p < 1) raf = requestAnimationFrame(step)
    else stop()
  }
  ;['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((e) => window.addEventListener(e, stop, { passive: true }))
  cancel = stop
  raf = requestAnimationFrame(step)
}

export const scrollToTop = () => smoothScrollTo(0)

// Cuộn tới phần tử có id, chừa chỗ cho thanh điều hướng cố định phía trên.
export function scrollToId(id, offset = 80) {
  const el = document.getElementById(id)
  if (el) smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - offset)
}
