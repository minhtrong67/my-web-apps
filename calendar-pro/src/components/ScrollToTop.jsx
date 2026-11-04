import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from './Icon'
import { useFabPresence } from '../lib/fabStore'
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
  // Trang đang có FAB (Lịch: "Hôm nay"; Đếm ngược > Sự kiện: thêm sự kiện) → nhích nút lên trên để không đè nhau
  const fab = useFabPresence()
  const rafRef = useRef(0)

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
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pathname])

  // Tự chạy hoạt ảnh cuộn bằng requestAnimationFrame thay vì phụ thuộc scroll-behavior của trình duyệt
  // (bị tắt khi hệ điều hành bật "giảm chuyển động", hoặc bị CSS ghi đè). Người dùng chạm/lăn chuột thì dừng ngay.
  function scrollTop() {
    cancelAnimationFrame(rafRef.current)
    const from = window.scrollY
    if (from <= 0) return
    const duration = Math.min(700, 280 + from * 0.12)
    const start = performance.now()
    const stop = () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
    }
    window.addEventListener('wheel', stop, { passive: true, once: true })
    window.addEventListener('touchstart', stop, { passive: true, once: true })
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      window.scrollTo({ top: from * (1 - eased), left: 0, behavior: 'instant' })
      if (p < 1) rafRef.current = requestAnimationFrame(step)
      else stop()
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const position = `${fab.mobile ? 'bottom-[calc(env(safe-area-inset-bottom)+11rem)]' : 'bottom-[calc(env(safe-area-inset-bottom)+6.5rem)]'} ${
    fab.desktop ? 'sm:bottom-[6.5rem]' : 'sm:bottom-8'
  }`

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
