import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useI18n } from '../i18n'
import { scrollToTop } from '../lib/scroll'

// Nút cuộn lên đầu trang: hiện sau khi cuộn xuống quá `threshold` px, cuộn mượt khi bấm.
export default function ScrollToTop({ threshold = 480 }) {
  const { t } = useI18n()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t('common.scrollTop')}
      title={t('common.scrollTop')}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={`state fixed z-40 right-4 sm:right-6 w-12 h-12 rounded-full bg-primary-container text-on-primary-container shadow-elev-3 flex items-center justify-center transition-[opacity,transform] duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{ bottom: 'calc(1.25rem + var(--safe-bottom))' }}
    >
      <ArrowUp size={22} />
    </button>
  )
}
