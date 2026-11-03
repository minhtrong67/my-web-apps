/**
 * Vẽ thẻ ngày lễ thành ảnh PNG (canvas 1080×1350) để gửi qua Zalo / Messenger / mạng xã hội.
 * Dùng Web Share (chia sẻ file) nếu thiết bị hỗ trợ, nếu không thì tải ảnh về máy.
 */
const W = 1080
const H = 1350
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'

function hexColors(css) {
  return css.match(/#[0-9a-fA-F]{6}/g) ?? []
}

function wrap(ctx, text, maxWidth, maxLines) {
  const words = text.split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    lines.length = maxLines
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '…')
  }
  return lines
}

/**
 * @param {{name:string,dateText:string,daysText:string,unitText:string,footer:string,theme?:object,fallbackColors?:string[]}} o
 * @returns {Promise<Blob>}
 */
export async function renderShareCard({ name, dateText, daysText, unitText, footer, theme, fallbackColors = ['#BE003A', '#7a0027'] }) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  const family = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif'
  if (document.fonts?.ready) await document.fonts.ready

  // Nền gradient chéo
  const colors = theme ? hexColors(theme.bg) : fallbackColors
  const g = ctx.createLinearGradient(0, 0, W, H)
  colors.forEach((c, i) => g.addColorStop(colors.length === 1 ? 0 : i / (colors.length - 1), c))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // Vệt sáng góc + chấm trang trí
  const glow = ctx.createRadialGradient(W, 0, 0, W, 0, 900)
  glow.addColorStop(0, 'rgba(255,255,255,0.28)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ;[[130, 260, 9], [880, 190, 7], [610, 700, 10], [960, 1020, 7], [240, 1120, 8], [90, 640, 6]].forEach(([x, y, r]) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  })

  // Biểu tượng chủ đề (mờ, lớn)
  if (theme) {
    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.textBaseline = 'middle'
    ctx.font = `150px ${EMOJI_FONT}`
    ctx.fillText(theme.emojis[0]?.e ?? '', 790, 250)
    ctx.font = `210px ${EMOJI_FONT}`
    ctx.fillText(theme.emojis[1]?.e ?? theme.emojis[0]?.e ?? '', 700, 1010)
    ctx.restore()
  }

  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.shadowColor = 'rgba(0,0,0,0.25)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 3

  // Tên sự kiện
  ctx.font = `800 82px ${family}`
  const lines = wrap(ctx, name, W - 160, 3)
  lines.forEach((l, i) => ctx.fillText(l, 80, 230 + i * 100))
  const afterTitle = 230 + (lines.length - 1) * 100

  ctx.font = `500 38px ${family}`
  ctx.globalAlpha = 0.92
  ctx.fillText(dateText, 80, afterTitle + 80)
  ctx.globalAlpha = 1

  // Số ngày còn lại (to)
  ctx.font = `900 330px ${family}`
  ctx.fillText(daysText, 70, 930)
  ctx.font = `700 64px ${family}`
  ctx.fillText(unitText, 84, 1030)

  // Chân trang
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillRect(0, H - 150, W, 150)
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 40px ${family}`
  ctx.fillText('Calendar Pro', 80, H - 70)
  ctx.font = `500 30px ${family}`
  ctx.globalAlpha = 0.85
  ctx.fillText(footer, 80, H - 28)

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'))
}

/** Chia sẻ ảnh qua Web Share nếu được, ngược lại tải về. Trả về 'shared' | 'downloaded' | 'cancelled' */
export async function shareOrDownload(blob, filename, title) {
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title })
      return 'shared'
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return 'downloaded'
}
