import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import vi from './vi'
import en from './en'

const DICTS = { vi, en }
const LOCALES = { vi: 'vi-VN', en: 'en-US' }
const LANG_KEY = 'lang'

export const LANGUAGES = [
  { key: 'vi', label: 'Tiếng Việt' },
  { key: 'en', label: 'English' }
]

// Ngôn ngữ của thiết bị: lấy theo thứ tự ưu tiên trong navigator.languages, ngôn ngữ nào app hỗ trợ trước thì dùng.
export function detectDeviceLang() {
  const list = (typeof navigator !== 'undefined' && (navigator.languages?.length ? navigator.languages : [navigator.language])) || []
  for (const l of list) {
    const code = String(l || '').toLowerCase().slice(0, 2)
    if (code === 'vi' || code === 'en') return code
  }
  return 'en'
}

// 'auto' (mặc định, theo thiết bị) hoặc lựa chọn cố định 'vi' | 'en'.
function readLangPref() {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    if (stored === 'vi' || stored === 'en') return stored
  } catch {
    /* ignore */
  }
  return 'auto'
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [langPref, setLangPref] = useState(readLangPref)
  const [deviceLang, setDeviceLang] = useState(detectDeviceLang)
  const lang = langPref === 'auto' ? deviceLang : langPref

  // Người dùng đổi ngôn ngữ thiết bị khi app đang mở → cập nhật theo (chỉ có tác dụng ở chế độ tự động).
  useEffect(() => {
    const onChange = () => setDeviceLang(detectDeviceLang())
    window.addEventListener('languagechange', onChange)
    return () => window.removeEventListener('languagechange', onChange)
  }, [])

  // Đồng bộ <html lang>, tiêu đề và mô tả trang theo ngôn ngữ (có lợi cho SEO / trình đọc màn hình).
  useEffect(() => {
    const dict = DICTS[lang]
    document.documentElement.lang = lang
    document.title = dict['meta.title']
    document.querySelector('meta[name="description"]')?.setAttribute('content', dict['meta.description'])
    const setMeta = (sel, v) => document.querySelector(sel)?.setAttribute('content', v)
    setMeta('meta[property="og:title"]', dict['meta.title'])
    setMeta('meta[property="og:description"]', dict['meta.description'])
    setMeta('meta[name="twitter:title"]', dict['meta.title'])
    setMeta('meta[name="twitter:description"]', dict['meta.description'])
    setMeta('meta[property="og:locale"]', lang === 'vi' ? 'vi_VN' : 'en_US')
    setMeta('meta[property="og:locale:alternate"]', lang === 'vi' ? 'en_US' : 'vi_VN')
  }, [lang])

  const setLang = useCallback((next) => {
    try {
      if (next === 'auto') localStorage.removeItem(LANG_KEY)
      else localStorage.setItem(LANG_KEY, next)
    } catch {
      /* ignore */
    }
    setLangPref(next)
  }, [])

  const value = useMemo(() => {
    const dict = DICTS[lang]
    // t('key', { n: 3 }) — thay {n} trong chuỗi; thiếu khóa → thử tiếng Việt rồi trả về chính khóa.
    const t = (key, params) => {
      let str = dict[key] ?? vi[key] ?? key
      if (params && typeof str === 'string') {
        for (const [k, v] of Object.entries(params)) str = str.replaceAll(`{${k}}`, v)
      }
      return str
    }
    return { t, lang, langPref, setLang, locale: LOCALES[lang] }
  }, [lang, langPref, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
