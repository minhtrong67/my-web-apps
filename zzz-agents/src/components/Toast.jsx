import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import Ic from '../icons.jsx'

const Ctx = createContext(null)
export const useToast = () => useContext(Ctx)
const VAR = {
  success: ['#22c55e', 'ok'], error: ['#ef4444', 'err'], warning: ['#f59e0b', 'alert'], info: ['#3b82f6', 'info']
}

export function ToastProvider({ children }) {
  const [list, setList] = useState([])
  const timers = useRef(new Map())
  const close = useCallback((id) => { clearTimeout(timers.current.get(id)); timers.current.delete(id); setList((l) => l.filter((x) => x.id !== id)) }, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const toast = useCallback((variant, msg) => {
    const id = Math.random()
    setList((l) => [...l.slice(-2), { id, variant, msg }])
    timers.current.set(id, setTimeout(() => close(id), 3500))
  }, [close])
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[90] flex flex-col items-end gap-2 sm:left-auto sm:w-96" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} aria-live="polite">
        {list.map((t) => {
          const [c, ic] = VAR[t.variant]
          return (
            <div key={t.id} role="status" onClick={() => close(t.id)} style={{ borderColor: c }}
              className="toast cut-sm pointer-events-auto relative flex w-full cursor-pointer items-start gap-3 overflow-hidden border-l-4 border-y border-r border-y-line border-r-line bg-surface p-3 shadow-2xl">
              <span style={{ color: c }}><Ic n={ic} /></span>
              <p className="flex-1 text-sm font-semibold">{t.msg}</p>
              <span className="absolute bottom-0 left-0 h-0.5 w-full origin-left" style={{ background: c, animation: 'bar 3.5s linear forwards' }} />
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}
