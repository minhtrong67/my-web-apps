// Sinh các bảng màu Material 3 từ màu hạt giống (seed) bằng @material/material-color-utilities (scheme TonalSpot, contrast 0).
// Chạy:  npm run gen:theme
// Kết quả: src/lib/palettes.js (các màu chủ đề chọn được trong Cài đặt) và khối màu mặc định (teal) cho src/styles/theme.css.
import { writeFileSync, readFileSync } from 'node:fs'
import { argbFromHex, hexFromArgb, Hct, SchemeTonalSpot, MaterialDynamicColors as M } from '@material/material-color-utilities'

// Màu mặc định là teal. Thứ tự = thứ tự hiển thị trong Cài đặt.
const SEEDS = [
  { id: 'teal', seed: '#009688' },
  { id: 'green', seed: '#43A047' },
  { id: 'cyan', seed: '#00ACC1' },
  { id: 'blue', seed: '#1E88E5' },
  { id: 'indigo', seed: '#3F51B5' },
  { id: 'violet', seed: '#6750A4' },
  { id: 'pink', seed: '#E91E63' },
  { id: 'red', seed: '#E53935' },
  { id: 'orange', seed: '#FB8C00' },
  { id: 'yellow', seed: '#FDD835' }
]

// Chỉ các vai trò app thực sự dùng (xem src/index.css).
const ROLES = {
  primary: M.primary, 'on-primary': M.onPrimary, 'primary-container': M.primaryContainer, 'on-primary-container': M.onPrimaryContainer,
  secondary: M.secondary, 'on-secondary': M.onSecondary, 'secondary-container': M.secondaryContainer, 'on-secondary-container': M.onSecondaryContainer,
  tertiary: M.tertiary, 'on-tertiary': M.onTertiary, 'tertiary-container': M.tertiaryContainer, 'on-tertiary-container': M.onTertiaryContainer,
  error: M.error, 'on-error': M.onError, 'error-container': M.errorContainer, 'on-error-container': M.onErrorContainer,
  surface: M.surface, 'surface-dim': M.surfaceDim,
  'surface-container-lowest': M.surfaceContainerLowest, 'surface-container-low': M.surfaceContainerLow, 'surface-container': M.surfaceContainer,
  'surface-container-high': M.surfaceContainerHigh, 'surface-container-highest': M.surfaceContainerHighest,
  'on-surface': M.onSurface, 'on-surface-variant': M.onSurfaceVariant, outline: M.outline, 'outline-variant': M.outlineVariant,
  'inverse-surface': M.inverseSurface, 'inverse-on-surface': M.inverseOnSurface, 'inverse-primary': M.inversePrimary
}

const make = (hex, dark) => {
  const s = new SchemeTonalSpot(Hct.fromInt(argbFromHex(hex)), dark, 0)
  return Object.fromEntries(Object.entries(ROLES).map(([k, v]) => [k, hexFromArgb(v.getArgb(s)).toLowerCase()]))
}

const palettes = SEEDS.map(({ id, seed }) => ({ id, seed, light: make(seed, false), dark: make(seed, true) }))

writeFileSync(
  new URL('../src/lib/palettes.js', import.meta.url),
  `// TỰ SINH bởi scripts/gen-theme.mjs — đừng sửa tay. Bảng màu Material 3 (TonalSpot) cho từng màu chủ đề.\nexport const PALETTES = ${JSON.stringify(palettes, null, 1)}\n`
)

// Khối màu mặc định (teal) trong theme.css (để lần vẽ đầu tiên đã đúng màu, không chờ JS).
const css = (p) => Object.entries(p).map(([k, v]) => `  --md-${k}: ${v};`).join('\n')
const file = new URL('../src/styles/theme.css', import.meta.url)
let t = readFileSync(file, 'utf8')
t = t.replace(/(:root \{\n)[\s\S]*?(\n\n  \/\* ---- Shape scale)/, `$1${css(palettes[0].light)}$2`)
t = t.replace(/(\.dark \{\n)[\s\S]*?(\n\})/, `$1${css(palettes[0].dark)}$2`)
writeFileSync(file, t)
console.log('OK', palettes.length, 'palettes')
