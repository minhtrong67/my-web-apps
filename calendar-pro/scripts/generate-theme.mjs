/**
 * Sinh bảng màu Material 3 Expressive (2026) cho toàn bộ màu nhấn của app.
 *
 *   npm run theme
 *
 * Với mỗi màu nhấn (src/theme/colors.json) script dựng một DynamicScheme "Expressive":
 *  - primary   : bảng tone bão hoà cao (kiểu Vibrant) bám đúng hue của màu gốc → Rose luôn là hồng-đỏ rực rỡ
 *  - secondary : cùng hệ hue, giảm bão hoà → dùng cho nền chỉ báo điều hướng, chip
 *  - tertiary  : xoay hue −50° → mảng màu tương phản thứ ba, đặc trưng của Expressive
 *  - neutral   : nhuốm nhẹ hue của primary → mọi mặt phẳng (surface) có sắc hồng/ấm thay vì xám lạnh
 * Ngoài ra sinh màu tuỳ biến "chay" (xanh lá) và "holiday" (vàng) được harmonize về màu gốc, 4 chế độ:
 * sáng / tối / sáng-tương phản-cao / tối-tương phản-cao.
 *
 * Ghi ra: src/theme/material-theme.css, src/theme/material-theme.json và khối SURFACES trong index.html.
 */
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const m = require('@material/material-color-utilities')
const {
  Hct, TonalPalette, DynamicScheme, MaterialDynamicColors: D,
  SchemeMonochrome, argbFromHex, hexFromArgb, Blend
} = m

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const colors = JSON.parse(readFileSync(join(root, 'src/theme/colors.json'), 'utf8'))

const ROLES = {
  primary: D.primary, 'on-primary': D.onPrimary, 'primary-container': D.primaryContainer, 'on-primary-container': D.onPrimaryContainer,
  secondary: D.secondary, 'on-secondary': D.onSecondary, 'secondary-container': D.secondaryContainer, 'on-secondary-container': D.onSecondaryContainer,
  tertiary: D.tertiary, 'on-tertiary': D.onTertiary, 'tertiary-container': D.tertiaryContainer, 'on-tertiary-container': D.onTertiaryContainer,
  error: D.error, 'on-error': D.onError, 'error-container': D.errorContainer, 'on-error-container': D.onErrorContainer,
  surface: D.surface, 'surface-dim': D.surfaceDim, 'surface-bright': D.surfaceBright,
  'surface-lowest': D.surfaceContainerLowest, 'surface-low': D.surfaceContainerLow, 'surface-container': D.surfaceContainer,
  'surface-high': D.surfaceContainerHigh, 'surface-highest': D.surfaceContainerHighest,
  'on-surface': D.onSurface, 'on-surface-variant': D.onSurfaceVariant,
  outline: D.outline, 'outline-variant': D.outlineVariant,
  'inverse-surface': D.inverseSurface, 'inverse-on-surface': D.inverseOnSurface, 'inverse-primary': D.inversePrimary,
  'surface-tint': D.surfaceTint, scrim: D.scrim, shadow: D.shadow
}

// Màu tuỳ biến (harmonize về màu gốc để không "lạc tông")
const CUSTOM = { chay: '#2E9E4F', holiday: '#E8A317' }

function build(def, isDark, contrast) {
  const src = Hct.fromInt(argbFromHex(def.seed))
  let scheme
  if (def.mono) {
    scheme = new SchemeMonochrome(src, isDark, contrast)
  } else {
    const h = src.hue
    // Màu gốc ít bão hoà (Brown, Blue Grey) khai báo `chroma` riêng trong colors.json để không bị đẩy thành cam / xanh rực
    const c = def.chroma ?? 200
    scheme = new DynamicScheme({
      sourceColorArgb: src.toInt(),
      variant: 3, /* Variant.VIBRANT */
      contrastLevel: contrast,
      isDark,
      primaryPalette: TonalPalette.fromHueAndChroma(h, c),
      secondaryPalette: TonalPalette.fromHueAndChroma((h + 14) % 360, Math.min(34, c * 0.6)),
      tertiaryPalette: TonalPalette.fromHueAndChroma((h + 310) % 360, Math.min(44, c * 0.8)),
      neutralPalette: TonalPalette.fromHueAndChroma(h, 9),
      neutralVariantPalette: TonalPalette.fromHueAndChroma(h, 15)
    })
  }
  const out = {}
  for (const [name, role] of Object.entries(ROLES)) out[name] = hexFromArgb(role.getArgb(scheme)).toLowerCase()

  for (const [name, hex] of Object.entries(CUSTOM)) {
    const harmonized = def.mono ? argbFromHex(hex) : Blend.harmonize(argbFromHex(hex), src.toInt())
    const hh = Hct.fromInt(harmonized)
    // Giảm bão hoà (≤ 36) để mảng màu xanh/vàng dịu, không lấn át màu chủ đạo
    const pal = TonalPalette.fromHueAndChroma(hh.hue, Math.min(hh.chroma, 36))
    const t = isDark ? [80, 20, 30, 90] : [40, 100, 90, 10]
    const hx = (tone) => hexFromArgb(pal.tone(tone)).toLowerCase()
    out[name] = hx(t[0]); out[`on-${name}`] = hx(t[1]); out[`${name}-container`] = hx(t[2]); out[`on-${name}-container`] = hx(t[3])
  }
  return out
}

const block = (sel, vars) =>
  `${sel} {\n${Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join('\n')}\n}\n`

let css = `/* TỰ SINH bởi scripts/generate-theme.mjs — đừng sửa tay. Chạy: npm run theme */\n`
const json = {}
const surfaces = {}
const swatches = {}

for (const def of colors) {
  const L = build(def, false, 0), Dk = build(def, true, 0)
  const LH = build(def, false, 1), DH = build(def, true, 1)
  json[def.id] = { seed: def.seed, light: L, dark: Dk }
  swatches[def.id] = {
    light: { primary: L.primary, 'on-primary': L['on-primary'], 'tertiary-container': L['tertiary-container'] },
    dark: { primary: Dk.primary, 'on-primary': Dk['on-primary'], 'tertiary-container': Dk['tertiary-container'] }
  }
  surfaces[def.id] = [L.surface, Dk.surface, L.primary, Dk.primary]
  css += `\n/* ${def.label} · seed ${def.seed} */\n`
  css += block(`html[data-color='${def.id}']`, L)
  css += block(`html.dark[data-color='${def.id}']`, Dk)
  css += `@media (prefers-contrast: more) {\n${block(`html[data-color='${def.id}']`, LH)}${block(`html.dark[data-color='${def.id}']`, DH)}}\n`
}

writeFileSync(join(root, 'src/theme/material-theme.css'), css)
writeFileSync(join(root, 'src/theme/material-theme.json'), JSON.stringify(json, null, 2) + '\n')

// Nhúng bảng màu nền vào index.html (để khung hình đầu tiên đã đúng màu, trước khi CSS/JS tải xong)
const htmlPath = join(root, 'index.html')
let html = readFileSync(htmlPath, 'utf8')
const map = JSON.stringify(surfaces)
const ids = JSON.stringify(colors.map((c) => c.id)).replace(/"/g, "'").replace(/,/g, ', ')
html = html.replace(/var ids = \[[^\]]*\];/, `var ids = ${ids};`)
html = html.replace(/\/\* @surfaces:start \*\/[\s\S]*?\/\* @surfaces:end \*\//, `/* @surfaces:start */ var SURF = ${map}; /* @surfaces:end */`)
writeFileSync(htmlPath, html)

writeFileSync(join(root, 'src/theme/swatches.json'), JSON.stringify(swatches, null, 2) + '\n') // nhỏ gọn cho ô chọn màu trong Cài đặt
// Cho phép script khác (icon) dùng
writeFileSync(join(root, 'src/theme/surfaces.json'), JSON.stringify(surfaces, null, 2) + '\n')
console.log(`✔ ${colors.length} màu · ${css.split('\n').length} dòng CSS`)

/* ===========================================================================
   Chuyển động lò xo (spring) của Material 3 Expressive → CSS linear() + hình dạng (shape) → clip-path
   =========================================================================== */

/** Đáp ứng bậc thang của lò xo khối lượng 1: trả về { easing: 'linear(...)', ms } */
function spring(damping, stiffness) {
  const w0 = Math.sqrt(stiffness)
  const zeta = damping
  const wd = w0 * Math.sqrt(Math.max(1 - zeta * zeta, 0))
  const value = (t) =>
    zeta < 1
      ? 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
      : 1 - Math.exp(-w0 * t) * (1 + w0 * t)
  let T = 0.1
  while (T < 3) { // thời điểm dao động còn < 0.2% biên độ
    let ok = true
    for (let t = T; t < T + 0.25; t += 0.01) if (Math.abs(1 - value(t)) > 0.002) { ok = false; break }
    if (ok) break
    T += 0.02
  }
  const N = 48
  const pts = []
  for (let i = 0; i <= N; i++) pts.push(+value((i / N) * T).toFixed(4))
  pts[N] = 1
  return { easing: `linear(${pts.join(', ')})`, ms: Math.round(T * 1000) }
}

const springs = {
  'spatial': spring(0.8, 380),        // chuyển động không gian mặc định (nảy nhẹ)
  'spatial-fast': spring(0.6, 800),   // nút, công tắc, chỉ báo: nảy rõ, nhanh
  'spatial-slow': spring(0.8, 200),   // trang, sheet, thẻ lớn
  'effects': { easing: 'cubic-bezier(0.2, 0, 0, 1)', ms: 200 } // màu / độ trong suốt: không nảy
}
let motion = `/* TỰ SINH bởi scripts/generate-theme.mjs — spring tokens của Material 3 Expressive */\n:root {\n`
for (const [k, v] of Object.entries(springs)) {
  motion += `  --ease-${k}: ${v.easing};\n  --dur-${k}: ${v.ms}ms;\n`
}
motion += `  --ease-emphasized: cubic-bezier(0.2, 0, 0, 1);\n  --ease-emphasized-decel: cubic-bezier(0.05, 0.7, 0.1, 1);\n  --ease-emphasized-accel: cubic-bezier(0.3, 0, 0.8, 0.15);\n}\n`
motion += `/* Trình duyệt chưa hỗ trợ linear(): dùng đường cong có độ nảy gần đúng */\n@supports not (transition-timing-function: linear(0, 1)) {\n  :root {\n    --ease-spatial: cubic-bezier(0.34, 1.3, 0.5, 1);\n    --ease-spatial-fast: cubic-bezier(0.34, 1.56, 0.64, 1);\n    --ease-spatial-slow: cubic-bezier(0.3, 1.15, 0.5, 1);\n    --ease-effects: cubic-bezier(0.2, 0, 0, 1);\n  }\n}\n`
writeFileSync(join(root, 'src/theme/motion.css'), motion)

/** Đa giác cong r(θ)=1+a·cos(nθ) — các "hình" của M3 Expressive (cookie, scallop, flower, burst...) */
function shape(lobes, amp, points = 72, phase = -Math.PI / 2) {
  const out = []
  for (let i = 0; i < points; i++) {
    const th = (i / points) * Math.PI * 2 + phase
    const r = (1 + amp * Math.cos(lobes * (th - phase))) / (1 + amp)
    out.push(`${(50 + 50 * r * Math.cos(th)).toFixed(2)}% ${(50 + 50 * r * Math.sin(th)).toFixed(2)}%`)
  }
  return `polygon(${out.join(',')})`
}
const SHAPES = {
  circle: shape(1, 0),
  scallop: shape(12, 0.05),
  cookie: shape(9, 0.07),
  sunny: shape(8, 0.1),
  flower: shape(5, 0.13),
  clover: shape(4, 0.17),
  burst: shape(14, 0.075)
}
let shapes = `/* TỰ SINH bởi scripts/generate-theme.mjs — các hình dạng M3 Expressive (cùng số điểm nên morph được bằng CSS) */\n:root {\n`
for (const [k, v] of Object.entries(SHAPES)) shapes += `  --shape-${k}: ${v};\n`
shapes += `}\n`
for (const k of Object.keys(SHAPES)) shapes += `.shape-${k} { clip-path: var(--shape-${k}); }\n`
const seq = ['cookie', 'flower', 'sunny', 'clover', 'scallop', 'cookie']
shapes += `\n/* Loading indicator: biến hình liên tục giữa các hình, vừa xoay vừa đổi hình */\n@keyframes shape-morph {\n${seq.map((k, i) => `  ${((i / (seq.length - 1)) * 100).toFixed(0)}% { clip-path: var(--shape-${k}); }`).join('\n')}\n}\n`
writeFileSync(join(root, 'src/theme/shapes.css'), shapes)
console.log('✔ motion.css, shapes.css')
