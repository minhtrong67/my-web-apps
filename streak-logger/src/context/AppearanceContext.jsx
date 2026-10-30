import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_FONT, ensureFontLoaded, getFontOption } from '../theme/fonts'

const AppearanceContext = createContext(null)

const SIZE_KEY = 'streak-logger:fontSize'
const FONT_KEY = 'streak-logger:font'

/** 3 mức cỡ chữ, áp dụng lên font-size gốc nên toàn bộ giao diện (đơn vị rem) co giãn theo. */
// eslint-disable-next-line react-refresh/only-export-components
export const FONT_SIZES = {
  sm: { px: '15px' },
  md: { px: '16px' },
  lg: { px: '18px' },
}

export const DEFAULT_FONT_SIZE = 'md'

const readStored = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function AppearanceProvider({ children }) {
  const [fontSize, setFontSizeState] = useState(() => {
    const saved = readStored(SIZE_KEY)
    return saved in FONT_SIZES ? saved : DEFAULT_FONT_SIZE
  })
  const [font, setFontState] = useState(() => getFontOption(readStored(FONT_KEY) || DEFAULT_FONT).key)

  useEffect(() => {
    document.documentElement.style.fontSize = (FONT_SIZES[fontSize] || FONT_SIZES[DEFAULT_FONT_SIZE]).px
  }, [fontSize])

  // Đổi font: áp dụng ngay bằng font dự phòng, rồi nạp font web ở nền (font-display: swap).
  useEffect(() => {
    const option = getFontOption(font)
    document.documentElement.style.setProperty('--app-font', option.stack)
    ensureFontLoaded(font)
  }, [font])

  const setFontSize = useCallback((value) => {
    try {
      localStorage.setItem(SIZE_KEY, value)
    } catch {
      /* bỏ qua */
    }
    setFontSizeState(value)
  }, [])

  const setFont = useCallback((key) => {
    const next = getFontOption(key).key
    try {
      localStorage.setItem(FONT_KEY, next)
    } catch {
      /* bỏ qua */
    }
    setFontState(next)
  }, [])

  const value = useMemo(
    () => ({ fontSize, setFontSize, font, setFont }),
    [fontSize, setFontSize, font, setFont],
  )
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppearance() {
  const ctx = useContext(AppearanceContext)
  if (!ctx) throw new Error('useAppearance phải được dùng bên trong AppearanceProvider')
  return ctx
}
