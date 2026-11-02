import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useSettings } from '../lib/app-context.jsx'
import { scrollToTop } from '../lib/scroll.js'
import { cx } from './ui.jsx'

/* Nút cuộn lên đầu trang (hiện sau khi cuộn xuống) */
export default function ScrollTop() {
  const { t } = useSettings()
  const [on, setOn] = useState(false)
  useEffect(() => {
    const f = () => setOn(scrollY > 600)
    f(); addEventListener('scroll', f, { passive: true })
    return () => removeEventListener('scroll', f)
  }, [])
  return (
    <button
      type="button" aria-label={t('scroll.top')} title={t('scroll.top')} tabIndex={on ? 0 : -1}
      onClick={scrollToTop}
      className={cx(
        'slant fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-30 grid size-14 place-items-center bg-hl text-on-hl transition-all duration-300 ease-out-back hover:brightness-105 active:scale-90 [--s:12px]',
        on ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0',
      )}
    ><ArrowUp size={26} strokeWidth={3} /></button>
  )
}
