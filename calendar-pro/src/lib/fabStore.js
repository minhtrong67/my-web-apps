import { useEffect, useSyncExternalStore } from 'react'

/**
 * Các trang có nút nổi (FAB) ở góc phải dưới đăng ký ở đây để nút "lên đầu trang" biết cần nhích lên tránh đè.
 * Nhờ vậy vị trí phụ thuộc vào việc FAB có thật sự đang hiển thị, chứ không phải đoán theo đường dẫn trang.
 */
const fabs = new Map()
const subs = new Set()
let snap = ''

function recompute() {
  const all = [...fabs.values()]
  const next = `${all.some((f) => f.mobile) ? 'm' : ''}${all.some((f) => f.desktop) ? 'd' : ''}`
  if (next !== snap) {
    snap = next
    subs.forEach((cb) => cb())
  }
}

/** Gọi trong trang có FAB. active=false khi FAB đang ẩn. mobile/desktop: FAB hiện ở màn hình nhỏ / từ breakpoint sm trở lên */
export function useRegisterFab(active, { mobile = true, desktop = true } = {}) {
  useEffect(() => {
    if (!active) return undefined
    const id = Symbol('fab')
    fabs.set(id, { mobile, desktop })
    recompute()
    return () => {
      fabs.delete(id)
      recompute()
    }
  }, [active, mobile, desktop])
}

/** { mobile, desktop }: có FAB nào đang hiện ở từng cỡ màn hình không */
export function useFabPresence() {
  const s = useSyncExternalStore(
    (cb) => {
      subs.add(cb)
      return () => subs.delete(cb)
    },
    () => snap,
    () => ''
  )
  return { mobile: s.includes('m'), desktop: s.includes('d') }
}
