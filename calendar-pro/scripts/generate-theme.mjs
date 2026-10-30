/**
 * Sinh src/theme/material-theme.css từ file xuất của Material Theme Builder
 * (src/theme/material-theme.json). Khi đổi theme: xuất lại JSON từ Material Theme Builder,
 * ghi đè file JSON rồi chạy `npm run theme`.
 *
 * - Sáng / tối: dùng đúng các vai trò màu trong "schemes.light" và "schemes.dark".
 * - Tương phản cao: tự áp dụng "light-high-contrast" / "dark-high-contrast"
 *   khi người dùng bật tương phản cao ở hệ điều hành (prefers-contrast: more).
 * - Bảng tông (palettes.primary) trở thành thang màu accent-50 … accent-900.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const theme = JSON.parse(readFileSync(new URL('../src/theme/material-theme.json', import.meta.url), 'utf8'))
const outFile = new URL('../src/theme/material-theme.css', import.meta.url)

// Vai trò màu M3 -> biến CSS dùng trong ứng dụng
const ROLE_VARS = {
  primary: '--primary',
  onPrimary: '--on-primary',
  primaryContainer: '--primary-container',
  onPrimaryContainer: '--on-primary-container',
  secondaryContainer: '--secondary-container',
  onSecondaryContainer: '--on-secondary-container',
  tertiary: '--tertiary',
  onTertiary: '--on-tertiary',
  tertiaryContainer: '--tertiary-container',
  onTertiaryContainer: '--on-tertiary-container',
  error: '--error',
  onError: '--on-error',
  errorContainer: '--error-container',
  onErrorContainer: '--on-error-container',
  surface: '--surface',
  surfaceContainerLowest: '--surface-lowest',
  surfaceContainerLow: '--surface-low',
  surfaceContainer: '--surface-container',
  surfaceContainerHigh: '--surface-high',
  surfaceContainerHighest: '--surface-highest',
  onSurface: '--ink',
  onSurfaceVariant: '--ink-soft',
  outline: '--outline',
  outlineVariant: '--outline-variant',
  inverseSurface: '--inverse-surface',
  inverseOnSurface: '--inverse-on-surface',
  inversePrimary: '--inverse-primary'
}

const roles = (scheme) =>
  Object.entries(ROLE_VARS)
    .map(([key, cssVar]) => `  ${cssVar}: ${scheme[key]};`)
    .join('\n') +
  // Chữ phụ nhạt hơn một chút so với onSurfaceVariant nhưng vẫn đạt tương phản AA
  `\n  --ink-faint: color-mix(in srgb, ${scheme.onSurfaceVariant} 82%, ${scheme.surface});`

const tones = theme.palettes.primary
const accent = Object.entries({ 50: 95, 100: 90, 200: 80, 300: 70, 400: 60, 500: 50, 600: 40, 700: 30, 800: 20, 900: 10 })
  .map(([step, tone]) => `  --accent-${step}: ${tones[tone]};`)
  .join('\n')

const { light, dark } = theme.schemes
const lightHC = theme.schemes['light-high-contrast']
const darkHC = theme.schemes['dark-high-contrast']

const css = `/* ===========================================================================
   TỰ ĐỘNG SINH bởi scripts/generate-theme.mjs từ material-theme.json — đừng sửa tay.
   Seed color: ${theme.seed}
   =========================================================================== */

/* Thang màu accent (palettes.primary) — dùng cho bóng, viền, trạng thái phụ */
html[data-color='m3'] {
${accent}
}
/* Nền tối: các sắc độ chính đều dùng tông sáng (primary tối = tone 80) */
html.dark[data-color='m3'] {
  --accent-400: ${dark.primary};
  --accent-500: ${dark.primary};
  --accent-600: ${dark.primary};
}

/* Sáng */
html[data-color='m3'] {
${roles(light)}
}

/* Tối */
html.dark[data-color='m3'] {
${roles(dark)}
}

/* Tương phản cao (theo cài đặt của hệ điều hành) */
@media (prefers-contrast: more) {
  html[data-color='m3'] {
${roles(lightHC).replace(/^/gm, '  ')}
  }
  html.dark[data-color='m3'] {
${roles(darkHC).replace(/^/gm, '  ')}
  }
}
`
writeFileSync(outFile, css)
console.log(`Đã sinh src/theme/material-theme.css (seed ${theme.seed})`)
