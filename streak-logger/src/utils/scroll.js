/**
 * Cuộn mượt lên vị trí `top` bằng requestAnimationFrame với easing ease-out.
 * Không dùng `scroll-behavior: smooth` của CSS/trình duyệt vì nó bị tắt khi hệ điều hành
 * bật "giảm chuyển động" và xung đột khi gọi scrollTo mỗi khung hình. Hiệu ứng tự hủy
 * ngay khi người dùng cuộn, chạm hoặc bấm phím để không giành quyền điều khiển.
 */
let cancelCurrent = null

export function smoothScrollTo(top = 0) {
  cancelCurrent?.()
  const from = window.scrollY
  const distance = top - from
  if (Math.abs(distance) < 2) return

  const duration = Math.min(900, Math.max(380, Math.abs(distance) * 0.35))
  const start = performance.now()
  let frame = 0
  let stopped = false

  const stop = () => {
    stopped = true
    cancelAnimationFrame(frame)
    ;['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((e) => window.removeEventListener(e, stop))
    if (cancelCurrent === stop) cancelCurrent = null
  }
  cancelCurrent = stop
  ;['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((e) => window.addEventListener(e, stop, { passive: true }))

  const ease = (p) => 1 - Math.pow(1 - p, 4)
  const step = (now) => {
    if (stopped) return
    const p = Math.min(1, (now - start) / duration)
    window.scrollTo({ top: from + distance * ease(p), behavior: 'instant' })
    if (p < 1) frame = requestAnimationFrame(step)
    else stop()
  }
  frame = requestAnimationFrame(step)
}
