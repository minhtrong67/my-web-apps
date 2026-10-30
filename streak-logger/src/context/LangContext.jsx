import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LANG_STORAGE_KEY, LANGUAGES, getLang, setCurrentLang, translate } from '../i18n'

const LangContext = createContext(null)

/**
 * Cung cấp ngôn ngữ hiện tại (vi hoặc en) và hàm `t('khóa.con', { biến: giá trị })`.
 * Ngôn ngữ được lưu trên thiết bị và đồng bộ với kho ngôn ngữ dùng chung của
 * các hàm tiện ích, đồng thời cập nhật thuộc tính `lang` của thẻ <html>.
 */
export function LangProvider({ children }) {
  const [lang, setLangState] = useState(getLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return
    setCurrentLang(next)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next)
    } catch {
      /* bỏ qua */
    }
    setLangState(next)
  }, [])

  // `t` đổi danh tính khi ngôn ngữ đổi để các useMemo phụ thuộc vào `t` tính lại.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const t = useCallback((path, vars) => translate(path, vars), [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang phải được dùng bên trong LangProvider')
  return ctx
}
