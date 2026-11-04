import { useState } from 'react'

// State lưu localStorage, gộp nông với giá trị mặc định
export function useLS(key, init) {
  const [v, s] = useState(() => { try { return { ...init, ...JSON.parse(localStorage[key] || '{}') } } catch { return init } })
  return [v, (x) => s((o) => { const n = { ...o, ...x }; localStorage[key] = JSON.stringify(n); return n })]
}
