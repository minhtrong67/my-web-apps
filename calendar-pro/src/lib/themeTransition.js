import { flushSync } from 'react-dom'

/**
 * Đổi giao diện sáng/tối bằng View Transitions: màn hình mới "lan" ra theo vòng tròn từ điểm người dùng bấm.
 * Trình duyệt chưa hỗ trợ (hoặc bật giảm chuyển động) → đổi ngay, vẫn có hiệu ứng chuyển màu mượt bằng CSS.
 */
export function withThemeTransition(apply, origin) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const root = document.documentElement
  if (reduce || typeof document.startViewTransition !== 'function') {
    apply()
    return
  }
  const x = origin?.clientX ?? window.innerWidth / 2
  const y = origin?.clientY ?? 0
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  root.classList.add('vt-running')
  const t = document.startViewTransition(() => {
    // flushSync: React cập nhật + chạy effect (đổi class .dark) ngay trong callback để ảnh chụp "mới" đúng giao diện
    flushSync(apply)
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
  t.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.2, 0, 0, 1)', pseudoElement: '::view-transition-new(root)' }
      )
    })
    .catch(() => {})
  t.finished.finally(() => root.classList.remove('vt-running'))
}
