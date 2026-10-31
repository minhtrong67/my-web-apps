import { flushSync } from 'react-dom'

/**
 * Chuyển giao diện sáng/tối/màu mà KHÔNG gây giật.
 *
 * Nguyên nhân giật của bản cũ (đã sửa):
 *  1. Trong callback của View Transition có chờ `requestAnimationFrame` — nhưng khi đó trình duyệt đang
 *     đóng băng việc vẽ nên rAF không chạy → trang đứng hình ~4 giây cho tới khi View Transition tự hết hạn.
 *  2. Đồng thời bật `transition` cho MỌI phần tử (`*`) trong 0.6s → nội suy hàng nghìn phần tử cùng lúc.
 *
 * Cách hiện tại:
 *  • applyThemeDom      : theme đổi do hệ điều hành / cài đặt tự động → đổi TỨC THÌ (một lần tính lại style,
 *                         không animation) — nhẹ nhất, không rớt khung hình.
 *  • withThemeTransition: người dùng chủ động bấm → View Transition vòng tròn lan từ điểm bấm. Callback đồng bộ
 *                         (flushSync), không chờ rAF. Trình duyệt chưa hỗ trợ hoặc bật "giảm chuyển động" → đổi tức thì.
 */
let circleActive = false

const canTransition = () =>
  typeof document !== 'undefined' &&
  typeof document.startViewTransition === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Áp thay đổi DOM của theme (apply phải đồng bộ, chỉ thao tác DOM). Luôn đổi tức thì để không giật. */
export function applyThemeDom(apply) {
  apply()
}

/** Đổi theme theo thao tác của người dùng: giao diện mới lan ra theo vòng tròn từ điểm bấm. */
export function withThemeTransition(update, origin) {
  if (!canTransition() || circleActive) {
    update()
    return
  }
  const root = document.documentElement
  const x = origin?.clientX ?? window.innerWidth / 2
  const y = origin?.clientY ?? 0
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  circleActive = true
  root.classList.add('vt-circle')
  let t
  try {
    // flushSync: React cập nhật + chạy effect (đổi class .dark) ngay trong callback để ảnh "mới" đúng giao diện
    t = document.startViewTransition(() => flushSync(update))
  } catch {
    circleActive = false
    root.classList.remove('vt-circle')
    update()
    return
  }
  t.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 600, easing: 'cubic-bezier(0.2, 0, 0, 1)', pseudoElement: '::view-transition-new(root)' }
      )
    })
    .catch(() => {})
  t.finished.finally(() => {
    circleActive = false
    root.classList.remove('vt-circle')
  })
}
