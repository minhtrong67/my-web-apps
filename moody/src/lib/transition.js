// Chuyển đổi giao diện (sáng/tối, màu chủ đề, font) bằng hiệu ứng mờ chéo toàn trang thay vì đổi màu giật cục.
// Dùng View Transitions API khi có; trình duyệt cũ dùng class `theme-fade` (transition màu tạm thời, gỡ sau khi xong).
export function withThemeTransition(apply) {
  const root = document.documentElement
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) return apply()
  if (typeof document.startViewTransition === 'function') {
    root.classList.add('vt-theme')
    const vt = document.startViewTransition(() => { apply() })
    vt.finished.catch(() => {}).finally(() => root.classList.remove('vt-theme'))
    return
  }
  root.classList.add('theme-fade')
  apply()
  setTimeout(() => root.classList.remove('theme-fade'), 400)
}
