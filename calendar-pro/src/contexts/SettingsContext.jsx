import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { HOLIDAYS } from '../data/holidays'

const SettingsContext = createContext(null)

/** Font mặc định: font giao diện của hệ điều hành (system-ui) — nhanh, không tải thêm file, hỗ trợ đủ dấu tiếng Việt. */
export const APP_FONT_FAMILY =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif"

export const LANGUAGE_OPTIONS = [
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'en', label: 'English' }
]

/** 9 màu nhấn — "Hồng Rose" (#FF2056, Tailwind rose-500) là mặc định; màu nhấn chỉ tô nút chính và ngày đang chọn, nền giữ trung tính. */
export const COLOR_OPTIONS = [
  { id: 'mono', label: 'Đơn sắc', hex: '#0A0A0B' },
  { id: 'rose', label: 'Hồng Rose', hex: '#FF2056' },
  { id: 'do', label: 'Đỏ Son', hex: '#B3261E' },
  { id: 'vang', label: 'Vàng Kim', hex: '#C9860F' },
  { id: 'xanh-la', label: 'Xanh Ngọc', hex: '#2C9750' },
  { id: 'xanh-duong', label: 'Xanh Dương', hex: '#226FC2' },
  { id: 'tim', label: 'Tím Huế', hex: '#7638AE' },
  { id: 'hong', label: 'Hồng Đào', hex: '#D23D71' },
  { id: 'cam', label: 'Cam Sen', hex: '#D9670B' },
  { id: 'ngoc-lam', label: 'Ngọc Lam', hex: '#0E8C82' }
]

export const FONT_SIZE_OPTIONS = [
  { id: 'nho', label: 'Nhỏ', scale: 0.925 },
  { id: 'vua', label: 'Vừa', scale: 1 },
  { id: 'lon', label: 'Lớn', scale: 1.08 },
  { id: 'rat-lon', label: 'Rất lớn', scale: 1.16 }
]

const DEFAULTS = {
  themeMode: 'system', // 'light' | 'dark' | 'system'
  color: 'rose',
  dailyColorRotation: false,
  language: 'vi', // 'vi' | 'en'
  fontSize: 'vua',
  notificationsEnabled: false,
  notifyLunarDays: true,
  notifyHolidayIds: HOLIDAYS.map((h) => h.id),
  notifyHour: 8,
  notifyMinute: 0,
  notifyTiming: 'on-day', // 'on-day' | 'before'
  notifyBeforeDays: 1
}

/** Màu --surface (khớp index.css và khối script đầu index.html) — nền trung tính nên chỉ phụ thuộc sáng/tối */
export const SURFACE_HEX = { light: '#F7F4F5', dark: '#0F1217' }

/** Giữ đúng 1 thẻ <meta name="theme-color"> (không media) theo giao diện đang dùng.
 *  Các thẻ có media="(prefers-color-scheme)" ở index.html chỉ là giá trị khởi đầu; khi người dùng
 *  chọn Sáng/Tối riêng trong app thì phải dùng giá trị của app, không theo hệ điều hành. */
export function applyThemeColorMeta(isDark) {
  const hex = isDark ? SURFACE_HEX.dark : SURFACE_HEX.light
  const metas = document.querySelectorAll('meta[name="theme-color"]')
  let meta = metas[0]
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  metas.forEach((m, i) => { if (i > 0) m.remove() })
  meta.removeAttribute('media')
  meta.setAttribute('content', hex)
}

const STORAGE_KEY = 'calendar-pro:settings'
const LEGACY_STORAGE_KEY = 'lich-pro:settings' // tên cũ trước khi đổi project

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return DEFAULTS
    const saved = JSON.parse(raw)
    if (saved.color === 'm3') saved.color = 'rose' // theme "Xanh Material" cũ → Rose
    return { ...DEFAULTS, ...saved }
  } catch {
    return DEFAULTS
  }
}

/** Chọn màu "ngẫu nhiên trong ngày" — cố định trong cùng 1 ngày, đổi khi sang ngày mới. */
export function getDailyColorId(date = new Date()) {
  const dayKey = date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate()
  const index = dayKey % COLOR_OPTIONS.length
  return COLOR_OPTIONS[index].id
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings)
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const isDark = settings.themeMode === 'dark' || (settings.themeMode === 'system' && systemDark)
  const effectiveColor = settings.dailyColorRotation ? getDailyColorId() : settings.color

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.setAttribute('data-color', effectiveColor)
    root.style.setProperty('--font-family', APP_FONT_FAMILY)
    root.setAttribute('lang', settings.language === 'en' ? 'en' : 'vi')
    const scale = FONT_SIZE_OPTIONS.find((s) => s.id === settings.fontSize)?.scale ?? 1
    root.style.setProperty('--font-scale', String(scale))

    root.style.colorScheme = isDark ? 'dark' : 'light'
    root.style.backgroundColor = '' // nền do CSS (--surface) đảm nhiệm sau khi app đã chạy
    applyThemeColorMeta(isDark)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      /* ignore quota errors */
    }
  }, [settings, isDark, effectiveColor])

  const update = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const reset = useCallback(() => setSettings(DEFAULTS), [])

  const value = useMemo(
    () => ({ settings, isDark, effectiveColor, update, reset }),
    [settings, isDark, effectiveColor, update, reset]
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings phải được dùng trong SettingsProvider')
  return ctx
}
