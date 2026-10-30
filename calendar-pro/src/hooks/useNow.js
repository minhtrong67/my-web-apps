import { useSyncExternalStore } from 'react'

/**
 * Bộ đếm thời gian dùng chung: mỗi chu kỳ (1s, 60s...) chỉ có MỘT setInterval cho toàn app,
 * bất kể có bao nhiêu thẻ đếm ngược đang hiển thị. Tự dừng khi không còn ai đăng ký
 * và tạm dừng khi tab bị ẩn (tiết kiệm CPU/pin), tự đồng bộ lại ngay khi tab hiện trở lại.
 */
const stores = new Map()

function createStore(intervalMs) {
  let now = new Date()
  let timer = null
  const subs = new Set()

  const emit = () => {
    now = new Date()
    subs.forEach((cb) => cb())
  }
  const onVisibility = () => {
    if (!document.hidden && subs.size) emit()
  }

  return {
    subscribe(cb) {
      subs.add(cb)
      if (subs.size === 1) {
        now = new Date()
        timer = setInterval(() => {
          if (!document.hidden) emit()
        }, intervalMs)
        document.addEventListener('visibilitychange', onVisibility)
      }
      return () => {
        subs.delete(cb)
        if (subs.size === 0) {
          clearInterval(timer)
          timer = null
          document.removeEventListener('visibilitychange', onVisibility)
        }
      }
    },
    getSnapshot: () => now
  }
}

/** Trả về thời gian hiện tại, tự cập nhật mỗi `intervalMs` mili-giây (dùng chung giữa các component) */
export function useNow(intervalMs = 1000) {
  let store = stores.get(intervalMs)
  if (!store) {
    store = createStore(intervalMs)
    stores.set(intervalMs, store)
  }
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
