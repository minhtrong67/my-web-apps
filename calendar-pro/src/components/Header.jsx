import { Link, useLocation } from 'react-router-dom'
import Icon from './Icon'
import { useSettings } from '../contexts/SettingsContext'
import { useTranslation } from '../i18n/useTranslation'
import { withThemeTransition } from '../lib/themeTransition'

/** Khoá dịch tiêu đề theo đường dẫn (khớp với tên mục trong menu điều hướng) */
const TITLE_KEYS = [
  { match: (p) => p === '/', key: 'nav.home' },
  { match: (p) => p.startsWith('/lich'), key: 'nav.calendarFull' },
  { match: (p) => p.startsWith('/van-nien'), key: 'nav.vanNienFull' },
  { match: (p) => p.startsWith('/dem-nguoc'), key: 'nav.countdownFull' },
  { match: (p) => p.startsWith('/cai-dat'), key: 'nav.settings' }
]

/** Tên trang đang xem (dùng cho header di động và tiêu đề tab trình duyệt) */
export function usePageTitle() {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const found = TITLE_KEYS.find((x) => x.match(pathname))
  return found ? t(found.key) : t('app.name')
}

/**
 * Top app bar (chỉ hiện trên di động, sm:hidden): nút menu tonal, TÊN TRANG đang xem, đổi sáng/tối và lối tắt vào Cài đặt (đổi ngôn ngữ nằm trong Cài đặt).
 * Tên trang đổi bằng hiệu ứng trượt-nảy mỗi lần điều hướng. Đổi sáng/tối dùng View Transition lan tròn từ điểm bấm.
 */
export default function Header({ onMenuClick }) {
  const { isDark, update } = useSettings()
  const { t } = useTranslation()
  const title = usePageTitle()
  const { pathname } = useLocation()

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-2 bg-surface/90 px-3 pb-2 backdrop-blur-md sm:hidden"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
    >
      <button
        onClick={onMenuClick}
        className="state morph focus-ring flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-high text-on-surface"
        aria-label={t('nav.openMenu')}
      >
        <Icon name="menu" size={24} />
      </button>
      <p key={title} className="animate-rise min-w-0 flex-1 truncate pl-1 text-title-lg text-on-surface">
        {title}
      </p>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={(e) => withThemeTransition(() => update({ themeMode: isDark ? 'light' : 'dark' }), e)}
          className="state morph focus-ring flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant"
          aria-label={t('header.toggleTheme')}
        >
          <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={24} />
        </button>
        <Link
          to="/cai-dat"
          className="state morph focus-ring flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
          aria-label={t('nav.settings')}
        >
          <Icon name="settings" size={24} filled={pathname.startsWith('/cai-dat')} />
        </Link>
      </div>
    </header>
  )
}
