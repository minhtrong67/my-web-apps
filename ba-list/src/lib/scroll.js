/* Cuộn mượt tự viết (rAF + easing). Không dùng CSS scroll-behavior để tránh "mượt chồng mượt" bị trễ.
   Tôn trọng công tắc "Hiệu ứng chuyển động" trong Cài đặt (mặc định lấy theo prefers-reduced-motion của hệ điều hành). */
export function motionOn() {
  try {
    const c = JSON.parse(localStorage.getItem('ba-cfg') || '{}')
    if (c.motion === 0) return false
    if (c.motion === 1) return true
  } catch { /* bỏ qua */ }
  return !matchMedia('(prefers-reduced-motion: reduce)').matches
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) // easeInOutCubic
let raf = 0

export function smoothScrollTo(target, { duration } = {}) {
  cancelAnimationFrame(raf)
  const max = document.documentElement.scrollHeight - innerHeight
  const y = Math.max(0, Math.min(target, max))
  const start = scrollY, dist = y - start
  if (Math.abs(dist) < 2) return Promise.resolve()
  if (!motionOn()) { scrollTo({ top: y, behavior: 'instant' }); return Promise.resolve() }
  const dur = duration ?? Math.min(1000, 420 + Math.abs(dist) * 0.12)
  return new Promise((resolve) => {
    const stop = () => { cancelAnimationFrame(raf); off(); resolve() }
    const evs = ['wheel', 'touchstart', 'keydown', 'mousedown']
    const off = () => evs.forEach((e) => removeEventListener(e, stop))
    evs.forEach((e) => addEventListener(e, stop, { passive: true, once: true }))
    const t0 = performance.now()
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur)
      scrollTo({ top: start + dist * ease(p), behavior: 'instant' })
      if (p < 1) raf = requestAnimationFrame(step); else { off(); resolve() }
    }
    raf = requestAnimationFrame(step)
  })
}

export const scrollToTop = () => smoothScrollTo(0)
export const scrollToEl = (el, offset = 0) => smoothScrollTo(el.getBoundingClientRect().top + scrollY - offset)
