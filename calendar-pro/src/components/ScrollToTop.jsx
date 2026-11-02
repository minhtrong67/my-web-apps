import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from './Icon'
import { useTranslation } from '../i18n/useTranslation'

const SHOW_AFTER = 320 // px đã cuộn xuống thì mới hiện nút

/**
 * Nút "lên đầu trang": hiện khi đã cuộn xuống, bấm để cuộn mượt về đầu (tắt hiệu ứng nếu người dùng bật "giảm chuyển động").
 * Trang Lịch đã có nút nổi "Hôm nay" ở góc dưới phải nên nút này nhích lên trên nút đó để không đè nhau.
 */
export default function ScrollToTop() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)
  const hasFab = pathname.startsWith('/lich')

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      setVisible(window.scrollY > SHOW_AFTER)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pathname])

  function scrollTop() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, left: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  const position = hasFab
    ? 'bottom-[calc(env(safe-area-inset-bottom)+11rem)] sm:bottom-[6.5rem]'
    : 'bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] sm:bottom-8'

  return (
    <button
      type="button"
      onClick={scrollTop}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label={t('common.scrollTop')}
      title={t('common.scrollTop')}
      className={`state morph focus-ring fixed right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-surface-high text-on-surface shadow-elevated transition-[opacity,transform,bottom] duration-spatial ease-spatial sm:right-8 ${position} ${
        visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-75 opacity-0'
      }`}
    >
      <Icon name="arrow_upward" size={24} weight={500} />
    </button>
  )
}
