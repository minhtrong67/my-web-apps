import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { HOLIDAYS } from '../data/holidays'
import { getFont, loadFont, DEFAULT_FONT_ID } from '../lib/fonts'
import COLOR_SEEDS from '../theme/colors.json'

const SettingsContext = createContext(null)


export const LANGUAGE_OPTIONS = [
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'en', label: 'English' }
]

/** 10 màu chủ đạo — "Hồng Rose" (rose của Material 3 Expressive) là mặc định.
 *  Bảng màu đầy đủ (primary / secondary / tertiary / surface...) được sinh từ seed bởi scripts/generate-theme.mjs. */
export const COLOR_OPTIONS = COLOR_SEEDS.map(({ id, label, seed }) => ({ id, label, hex: seed }))

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
  fontFamily: DEFAULT_FONT_ID,
  notificationsEnabled: false,
  notifyLunarDays: true,
  notifyHolidayIds: HOLIDAYS.map((h) => h.id),
  notifyHour: 8,
  notifyMinute: 0,
  notifyTiming: 'on-day', // 'on-day' | 'before'
  notifyBeforeDays: 1
}

/** Giữ đúng 1 thẻ <meta name="theme-color"> (không media) theo màu --surface đang dùng (đã gồm màu chủ đạo).
 *  Các thẻ có media="(prefers-color-scheme)" ở index.html chỉ là giá trị khởi đầu; khi người dùng
 *  chọn Sáng/Tối riêng trong app thì phải dùng giá trị của app, không theo hệ điều hành. */
export function applyThemeColorMeta() {
  const hex = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim()
  if (!hex) return
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

  const firstRun = useRef(true)
  const lastTheme = useRef(`${isDark}|${effectiveColor}`)

  // Font: áp ngay stack (font dự phòng hiển thị trong lúc tải), tải font web theo nhu cầu
  useEffect(() => {
    const font = getFont(settings.fontFamily)
    document.documentElement.style.setProperty('--font-family', font.stack)
    document.documentElement.setAttribute('data-font', font.id)
    loadFont(font.id)
  }, [settings.fontFamily])

  useEffect(() => {
    const root = document.documentElement
    const themeKey = `${isDark}|${effectiveColor}`
    if (!firstRun.current && lastTheme.current !== themeKey) {
      // Đổi sáng/tối hoặc màu: bật chuyển màu mượt cho toàn trang trong ~0.6s
      root.classList.add('theme-anim')
      window.clearTimeout(root.__themeAnimTimer)
      root.__themeAnimTimer = window.setTimeout(() => root.classList.remove('theme-anim'), 650)
    }
    firstRun.current = false
    lastTheme.current = themeKey
    root.classList.toggle('dark', isDark)
    root.setAttribute('data-color', effectiveColor)
    root.setAttribute('lang', settings.language === 'en' ? 'en' : 'vi')
    const scale = FONT_SIZE_OPTIONS.find((s) => s.id === settings.fontSize)?.scale ?? 1
    root.style.setProperty('--font-scale', String(scale))

    root.style.colorScheme = isDark ? 'dark' : 'light'
    root.style.backgroundColor = '' // nền do CSS (--surface) đảm nhiệm sau khi app đã chạy
    applyThemeColorMeta()
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
