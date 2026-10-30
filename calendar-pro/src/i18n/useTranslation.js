import { useCallback, useMemo } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import { translations, resolvePath } from './translations'

/**
 * useTranslation — trả về hàm t(path, ...args) để lấy chuỗi theo ngôn ngữ hiện tại.
 * - path: đường dẫn dạng "settings.resetBtn"
 * - args: nếu giá trị tìm được là hàm (dùng khi cần nội suy biến), sẽ được gọi với args.
 * Luôn có fallback về tiếng Việt nếu thiếu khoá ở ngôn ngữ hiện tại.
 */
export function useTranslation() {
  const { settings, update } = useSettings()
  const lang = settings.language === 'en' ? 'en' : 'vi'

  const t = useCallback(
    (path, ...args) => {
      const value = resolvePath(translations[lang], path) ?? resolvePath(translations.vi, path)
      if (typeof value === 'function') return value(...args)
      return value ?? path
    },
    [lang]
  )

  const setLang = useCallback((next) => update({ language: next }), [update])
  const toggleLang = useCallback(() => update({ language: lang === 'vi' ? 'en' : 'vi' }), [update, lang])

  return useMemo(() => ({ t, lang, setLang, toggleLang }), [t, lang, setLang, toggleLang])
}
