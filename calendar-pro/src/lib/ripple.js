/**
 * Hiệu ứng tương tác dùng chung — mỗi loại chỉ có MỘT listener ủy quyền trên document
 * (không gắn listener cho từng nút) và chỉ animate transform / opacity nên không gây reflow.
 *  1. Ripple M3 cho mọi phần tử có class ".state"
 *  2. Spotlight: ánh sáng đi theo con trỏ trên mọi phần tử ".fx-spot"
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

  if (window.matchMedia('(hover: hover)').matches) {
    let frame = 0
    document.addEventListener(
      'pointermove',
      (e) => {
        if (reduce.matches || frame) return
        const target = e.target
        frame = requestAnimationFrame(() => {
          frame = 0
          const el = target instanceof Element ? target.closest('.fx-spot') : null
          if (!el) return
          const r = el.getBoundingClientRect()
          el.style.setProperty('--mx', `${e.clientX - r.left}px`)
          el.style.setProperty('--my', `${e.clientY - r.top}px`)
        })
      },
      { passive: true }
    )
  }
}
