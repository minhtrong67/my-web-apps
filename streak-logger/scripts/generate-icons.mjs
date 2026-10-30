/**
 * Sinh toàn bộ icon, favicon và ảnh splash từ logo trong src/theme/brand.js.
 * Chạy: npm run icons   (cần devDependency `sharp`).
 *
 * Màu nền splash khớp token `surface` mặc định (seed violet): sáng #FEF7FF, tối #15121C,
 * trùng với index.html, manifest và theme-color để không bị nháy khi mở PWA.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'
import { BRAND_COLOR, BRAND_CORE, COOKIE_PATH, FLAME_CORE_PATH, FLAME_PATH, FLAME_TRANSFORM } from '../src/theme/brand.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pub = (...p) => path.join(root, 'public', ...p)

const SURFACE_LIGHT = '#FEF7FF'
const SURFACE_DARK = '#15121C'

const flame = (extra = '') => `
  <g transform="${extra} ${FLAME_TRANSFORM}">
    <path d="${FLAME_PATH}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="${FLAME_CORE_PATH}" fill="${BRAND_CORE}"/>
  </g>`

/** Logo đầy đủ trên nền trong suốt: khối cookie + ngọn lửa. */
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <path d="${COOKIE_PATH}" fill="${BRAND_COLOR}"/>${flame()}
</svg>`

/** Icon vuông tràn viền (cho maskable và apple-touch-icon): hệ điều hành tự bo góc. */
const squareSvg = (scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BRAND_COLOR}"/>${flame(`translate(256 256) scale(${scale}) translate(-256 -256)`)}
</svg>`

const splashSvg = (w, h, bg) => {
  const size = Math.round(Math.min(w, h) * 0.24)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <svg x="${(w - size) / 2}" y="${(h - size) / 2}" width="${size}" height="${size}" viewBox="0 0 512 512">
    <path d="${COOKIE_PATH}" fill="${BRAND_COLOR}"/>${flame()}
  </svg>
</svg>`
}

const png = (svg, size) => sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toBuffer()

/** Gói nhiều ảnh PNG vào một tệp .ico. */
function buildIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = 6 + images.length * 16
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += data.length
    return entry
  })
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)])
}

await mkdir(pub('icons'), { recursive: true })
await mkdir(pub('splash'), { recursive: true })

await writeFile(pub('favicon.svg'), logoSvg)

for (const size of [16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512]) {
  await writeFile(pub('icons', `icon-${size}.png`), await png(logoSvg, size))
}
await writeFile(pub('icons', 'icon-maskable-192.png'), await png(squareSvg(0.82), 192))
await writeFile(pub('icons', 'icon-maskable-512.png'), await png(squareSvg(0.82), 512))
await writeFile(pub('icons', 'apple-touch-icon.png'), await png(squareSvg(1), 180))

const icoImages = []
for (const size of [16, 32, 48]) icoImages.push({ size, data: await png(logoSvg, size) })
await writeFile(pub('favicon.ico'), buildIco(icoImages))

const splashSizes = [
  [1320, 2868], [1206, 2622], [1290, 2796], [1179, 2556], [1170, 2532], [1284, 2778], [1125, 2436],
  [1242, 2688], [828, 1792], [750, 1334], [1242, 2208], [2048, 2732], [1668, 2388], [1640, 2360],
  [1620, 2160], [1668, 2224], [1536, 2048],
]
for (const [w, h] of splashSizes) {
  for (const [mode, bg] of [['light', SURFACE_LIGHT], ['dark', SURFACE_DARK]]) {
    await sharp(Buffer.from(splashSvg(w, h, bg)), { density: 96 }).png({ compressionLevel: 9 }).toFile(pub('splash', `${mode}-${w}x${h}.png`))
  }
}
console.log('Đã sinh icon, favicon và ảnh splash.')
