import { ArrowUp } from 'lucide-react'
import { useScrolledPast } from '../../hooks/useScrollPosition'
import { usePresence } from '../../hooks/useOverlay'
import { useLang } from '../../context/LangContext'
import { smoothScrollTo } from '../../utils/scroll'

/**
 * Nút lên đầu trang (FAB nhỏ kiểu Material 3 Expressive). Chỉ xuất hiện khi trang đã cuộn
 * xuống đủ xa, nảy vào bằng lò xo và thu nhỏ biến mất khi quay lại đầu trang.
 * Trên mobile nằm phía trên thanh điều hướng dưới.
 */
export default function ScrollToTopButton() {
  const { t } = useLang()
  const past = useScrolledPast(300)
  const { mounted, closing } = usePresence(past, 220)

  if (!mounted) return null

  return (
    <button
      type="button"
      onClick={() => smoothScrollTo(0)}
      className={`m3-ripple morph fixed bottom-[calc(6rem+var(--fab-offset,0px)+env(safe-area-inset-bottom))] lg:bottom-[calc(2rem+var(--fab-offset,0px))] right-4 lg:right-8 z-40 w-14 h-14 inline-flex items-center justify-center rounded-[18px] active:rounded-[28px] bg-[var(--md-tertiary-container)] text-[var(--md-on-tertiary-container)] shadow-[var(--shadow-fab)] ${closing ? 'anim-fab-out' : 'anim-fab-in'}`}
      aria-label={t('common.scrollTop')}
      title={t('common.scrollTop')}
    >
      <ArrowUp size={24} strokeWidth={2.5} />
    </button>
  )
}
