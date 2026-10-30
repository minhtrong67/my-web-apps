import Icon from './Icon'
import { useSettings } from '../contexts/SettingsContext'
import { useTranslation } from '../i18n/useTranslation'

/**
 * Header — thanh trên cùng, chỉ hiện trên di động (sm:hidden): nút mở menu, tên ứng dụng,
 * đổi giao diện sáng/tối và ngôn ngữ. Ngăn cách với nội dung bằng 1 đường kẻ mảnh.
 */
export default function Header({ onMenuClick }) {
  const { isDark, update } = useSettings()
  const { t, lang, toggleLang } = useTranslation()

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-1 border-b border-outline-variant bg-card px-2 pb-2 sm:hidden"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
    >
      <button
        onClick={onMenuClick}
        className="state focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink"
        aria-label={t('nav.openMenu')}
      >
        <Icon name="menu" size={24} />
      </button>
      <p className="min-w-0 flex-1 truncate text-title-lg text-ink">{t('app.name')}</p>

      <div className="flex shrink-0 items-center">
        <button
          onClick={() => update({ themeMode: isDark ? 'light' : 'dark' })}
          className="state focus-ring flex h-11 w-11 items-center justify-center rounded-lg text-ink-soft"
          aria-label={t('header.toggleTheme')}
        >
          <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={22} />
        </button>
        <button
          onClick={toggleLang}
          className="state focus-ring flex h-11 items-center gap-1.5 rounded-lg px-3 text-ink-soft"
          aria-label={t('header.toggleLanguage')}
        >
          <Icon name="translate" size={20} />
          <span className="text-label-md uppercase">{lang}</span>
        </button>
      </div>
    </header>
  )
}
