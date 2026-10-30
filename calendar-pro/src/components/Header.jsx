import Icon from './Icon'
import { useSettings } from '../contexts/SettingsContext'
import { useTranslation } from '../i18n/useTranslation'
import { withThemeTransition } from '../lib/themeTransition'

/**
 * Top app bar (chỉ hiện trên di động, sm:hidden): nút menu tonal, tên ứng dụng, đổi sáng/tối và ngôn ngữ.
 * Đổi sáng/tối dùng View Transition: giao diện mới lan ra theo vòng tròn từ đúng điểm bấm.
 */
export default function Header({ onMenuClick }) {
  const { isDark, update } = useSettings()
  const { t, lang, toggleLang } = useTranslation()

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
      <p className="min-w-0 flex-1 truncate text-title-lg text-on-surface">{t('app.name')}</p>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={(e) => withThemeTransition(() => update({ themeMode: isDark ? 'light' : 'dark' }), e)}
          className="state morph focus-ring flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant"
          aria-label={t('header.toggleTheme')}
        >
          <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={24} />
        </button>
        <button
          onClick={toggleLang}
          className="state morph focus-ring flex h-12 items-center gap-1.5 rounded-full bg-secondary-container px-4 text-on-secondary-container"
          aria-label={t('header.toggleLanguage')}
        >
          <Icon name="translate" size={20} />
          <span className="text-label-lg uppercase">{lang}</span>
        </button>
      </div>
    </header>
  )
}
