/**
 * Hiệu ứng ripple của Material: một vòng tròn lan ra từ điểm chạm.
 * Dùng một bộ lắng nghe duy nhất ở cấp document, nên bất kỳ phần tử nào có
 * class `m3-ripple` đều có hiệu ứng mà không cần thêm state hay re-render.
 * Hiệu ứng tự tắt khi người dùng bật "giảm chuyển động" (xem index.css).
 */
export function initRipple() {
  if (typeof document === 'undefined') return
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (e.button !== undefined && e.button !== 0) return
      const host = e.target instanceof Element ? e.target.closest('.m3-ripple') : null
      if (!host || host.matches(':disabled, [aria-disabled="true"]')) return

      const rect = host.getBoundingClientRect()
      const size = Math.hypot(Math.max(e.clientX - rect.left, rect.right - e.clientX), Math.max(e.clientY - rect.top, rect.bottom - e.clientY)) * 2
      const wave = document.createElement('span')
      wave.className = 'm3-ripple-wave'
      wave.style.width = wave.style.height = `${size}px`
      wave.style.left = `${e.clientX - rect.left - size / 2}px`
      wave.style.top = `${e.clientY - rect.top - size / 2}px`
      host.appendChild(wave)
      wave.addEventListener('animationend', () => wave.remove(), { once: true })
      setTimeout(() => wave.remove(), 900)
    },
    { passive: true },
  )
}
