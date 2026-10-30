/**
 * Hiệu ứng ripple M3 cho mọi phần tử có class ".state".
 * Dùng 1 listener ủy quyền duy nhất trên document (không gắn listener cho từng nút) và chỉ
 * animate transform/opacity nên không gây reflow.
 */
export function initRipple() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')

  document.addEventListener(
    'pointerdown',
    (e) => {
      if (reduce.matches || (e.pointerType === 'mouse' && e.button !== 0)) return
      const el = e.target instanceof Element ? e.target.closest('.state') : null
      if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return

      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      // Bán kính đủ phủ tới góc xa nhất
      const size = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y)) * 2

      const ripple = document.createElement('span')
      ripple.className = 'ripple'
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px`
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
      el.appendChild(ripple)
    },
    { passive: true }
  )
}
