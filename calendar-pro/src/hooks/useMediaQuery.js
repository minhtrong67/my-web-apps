import { useCallback, useSyncExternalStore } from 'react'

/** Theo dõi một media query (vd. '(min-width: 1024px)') và render lại khi kết quả đổi. */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (cb) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    [query]
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}
