import {
  Blend,
  Hct,
  MaterialDynamicColors as M,
  SchemeVibrant,
  TonalPalette,
  argbFromHex,
  hexFromArgb,
} from '@material/material-color-utilities'

/**
 * Bảng màu chủ đề. Mỗi màu là "màu hạt giống" (seed) của Material Design;
 * toàn bộ vai trò màu (primary, container, surface...) được sinh ra từ seed
 * bằng thuật toán màu động của Material 3 (biến thể Vibrant, đúng tinh thần
 * Material 3 Expressive: màu đậm, sống động).
 *
 * `violet` là màu thương hiệu của Streak Logger và là mặc định.
 */
export const COLOR_OPTIONS = [
  { key: 'violet', hex: '#7C3AED' },
  { key: 'red', hex: '#F44336' },
  { key: 'pink', hex: '#E91E63' },
  { key: 'purple', hex: '#9C27B0' },
  { key: 'deepPurple', hex: '#673AB7' },
  { key: 'indigo', hex: '#3F51B5' },
  { key: 'blue', hex: '#2196F3' },
  { key: 'lightBlue', hex: '#03A9F4' },
  { key: 'cyan', hex: '#00BCD4' },
  { key: 'teal', hex: '#009688' },
  { key: 'green', hex: '#4CAF50' },
  { key: 'lightGreen', hex: '#8BC34A' },
  { key: 'lime', hex: '#CDDC39' },
  { key: 'yellow', hex: '#FFEB3B' },
  { key: 'amber', hex: '#FFC107' },
  { key: 'orange', hex: '#FF9800' },
  { key: 'deepOrange', hex: '#FF5722' },
  { key: 'brown', hex: '#795548' },
  { key: 'blueGrey', hex: '#607D8B' },
]

export const DEFAULT_COLOR = 'violet'

export const getColorOption = (key) =>
  COLOR_OPTIONS.find((c) => c.key === key) || COLOR_OPTIONS[0]

/** Các vai trò màu cơ bản lấy trực tiếp từ DynamicScheme. */
const ROLES = {
  primary: M.primary,
  'on-primary': M.onPrimary,
  'primary-container': M.primaryContainer,
  'on-primary-container': M.onPrimaryContainer,
  secondary: M.secondary,
  'on-secondary': M.onSecondary,
  'secondary-container': M.secondaryContainer,
  'on-secondary-container': M.onSecondaryContainer,
  tertiary: M.tertiary,
  'on-tertiary': M.onTertiary,
  'tertiary-container': M.tertiaryContainer,
  'on-tertiary-container': M.onTertiaryContainer,
  error: M.error,
  'on-error': M.onError,
  'error-container': M.errorContainer,
  'on-error-container': M.onErrorContainer,
  surface: M.surface,
  'surface-dim': M.surfaceDim,
  'surface-bright': M.surfaceBright,
  'surface-container-lowest': M.surfaceContainerLowest,
  'surface-container-low': M.surfaceContainerLow,
  'surface-container': M.surfaceContainer,
  'surface-container-high': M.surfaceContainerHigh,
  'surface-container-highest': M.surfaceContainerHighest,
  'on-surface': M.onSurface,
  'on-surface-variant': M.onSurfaceVariant,
  outline: M.outline,
  'outline-variant': M.outlineVariant,
  'inverse-surface': M.inverseSurface,
  'inverse-on-surface': M.inverseOnSurface,
  'inverse-primary': M.inversePrimary,
}

/**
 * Màu ngữ nghĩa (thành công, cảnh báo, thông tin) không có trong bộ vai trò
 * chuẩn của Material, nên được sinh từ một hue cố định rồi "hòa" (harmonize)
 * về phía màu seed để luôn hài hòa với chủ đề đang chọn.
 */
const SEMANTIC_SEEDS = {
  success: '#2E7D32',
  warning: '#F9A825',
  info: '#0288D1',
}

function semanticTokens(seedArgb, dark) {
  const tokens = {}
  Object.entries(SEMANTIC_SEEDS).forEach(([name, hex]) => {
    const harmonized = Blend.harmonize(argbFromHex(hex), seedArgb)
    const hct = Hct.fromInt(harmonized)
    const palette = TonalPalette.fromHueAndChroma(hct.hue, 52)
    const pick = (light, darkTone) => hexFromArgb(palette.tone(dark ? darkTone : light))
    tokens[name] = pick(40, 80)
    tokens[`on-${name}`] = pick(100, 20)
    tokens[`${name}-container`] = pick(90, 30)
    tokens[`on-${name}-container`] = pick(10, 90)
  })
  return tokens
}

/** Sinh toàn bộ token màu (dạng { 'primary': '#rrggbb', ... }) cho một seed và một chế độ sáng/tối. */
export function buildTokens(seedHex, dark) {
  const seedArgb = argbFromHex(seedHex)
  const scheme = new SchemeVibrant(Hct.fromInt(seedArgb), dark, 0)
  const tokens = {}
  Object.entries(ROLES).forEach(([name, role]) => {
    tokens[name] = hexFromArgb(role.getArgb(scheme))
  })
  return { ...tokens, ...semanticTokens(seedArgb, dark) }
}

/** Ghi các token lên <html> dưới dạng biến CSS `--md-*`. */
export function applyTokens(tokens, root = document.documentElement) {
  Object.entries(tokens).forEach(([name, value]) => {
    root.style.setProperty(`--md-${name}`, value)
  })
}
