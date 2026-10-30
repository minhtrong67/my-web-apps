import { useEffect, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Giữ phần tử trong DOM thêm `duration` ms sau khi `open` chuyển sang false để chạy animation thoát.
 * Trả về { mounted, closing }: render khi mounted, thêm class "đang đóng" khi closing.
 */
export function useExitTransition(open, duration = 220) {
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    if (!mounted) return
    const id = setTimeout(() => setMounted(false), prefersReducedMotion() ? 0 : duration)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return { mounted: open || mounted, closing: !open && mounted }
}
