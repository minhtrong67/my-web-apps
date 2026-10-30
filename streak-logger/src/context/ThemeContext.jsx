import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { DEFAULT_COLOR, applyTokens, buildTokens, getColorOption } from '../theme/palette'

const ThemeContext = createContext(null)
const MODE_KEY = 'streak-logger:theme'
const COLOR_KEY = 'streak-logger:color'
/** Màu nền đã áp dụng, đọc lại bởi script trong index.html để màn hình chờ khớp giao diện. */
const BG_KEY = 'streak-logger:bg'

const readStored = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

const resolveDark = (mode) =>
  mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

/**
 * Áp dụng giao diện lên <html>: class `dark`, token màu Material, meta theme-color
 * và manifest. Màu thanh trạng thái (theme-color) luôn bằng màu nền `surface`
 * nên thanh trạng thái trên mobile liền mạch với header của ứng dụng.
 */
function applyTheme(mode, colorKey) {
  const root = document.documentElement
  const isDark = resolveDark(mode)
  root.classList.toggle('dark', isDark)

  const tokens = buildTokens(getColorOption(colorKey).hex, isDark)
  applyTokens(tokens, root)

  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.removeAttribute('media')
    meta.setAttribute('content', tokens.surface)
  })
  document
    .getElementById('app-manifest')
    ?.setAttribute('href', isDark ? '/manifest-dark.webmanifest' : '/manifest.webmanifest')
  try {
    localStorage.setItem(BG_KEY, tokens.surface)
  } catch {
    /* bỏ qua */
  }
  return isDark
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => readStored(MODE_KEY, 'system'))
  const [colorKey, setColorKeyState] = useState(() => getColorOption(readStored(COLOR_KEY, DEFAULT_COLOR)).key)
  const [isDark, setIsDark] = useState(() => resolveDark(readStored(MODE_KEY, 'system')))

  useLayoutEffect(() => {
    setIsDark(applyTheme(theme, colorKey))
    try {
      localStorage.setItem(MODE_KEY, theme)
      localStorage.setItem(COLOR_KEY, colorKey)
    } catch {
      /* bỏ qua */
    }
  }, [theme, colorKey])

  // Ở chế độ "Hệ thống", tự đổi theo khi người dùng đổi giao diện của thiết bị.
  useEffect(() => {
    if (theme !== 'system') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setIsDark(applyTheme('system', colorKey))
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, colorKey])

  const setTheme = useCallback((mode) => setThemeState(mode), [])
  const setColor = useCallback((key) => setColorKeyState(getColorOption(key).key), [])
  const value = useMemo(
    () => ({ theme, setTheme, colorKey, setColor, isDark }),
    [theme, setTheme, colorKey, setColor, isDark],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme phải được dùng bên trong ThemeProvider')
  return ctx
}
