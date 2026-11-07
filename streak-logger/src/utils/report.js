import { PDF_FONT, registerPdfFonts } from './pdfFonts'
import { downloadBlob, drawPdfFooters, drawPdfHeader, formatStamp } from './exportData'
import { translate } from '../i18n'

/**
 * Báo cáo thống kê: xuất PDF chi tiết (thẻ số liệu, 2 biểu đồ tròn kèm chú thích đầy đủ,
 * bảng nhật ký) hoặc ảnh PNG gọn (chỉ thẻ số liệu và 2 biểu đồ tròn).
 * Biểu đồ được vẽ trực tiếp (vector trong PDF, canvas trong PNG) và dùng font Unicode
 * nên không lỗi chữ tiếng Việt.
 */

const CARD_COLORS = ['#7C3AED', '#6366F1', '#A855F7', '#0EA5E9']
const MARGIN = 40
const CANVAS_FONT = 'system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
const fmtPercent = (p) => `${Number.isInteger(p) ? p : p.toFixed(1)}%`
const entryText = (s) => `${s.count} · ${fmtPercent(s.percent)}`

/* ------------------------------- PDF ------------------------------- */

function drawSectionTitle(doc, text, y) {
  doc.setFont(PDF_FONT, 'bold')
  doc.setFontSize(12)
  doc.setTextColor('#18181B')
  doc.text(text, MARGIN, y)
  doc.setDrawColor('#7C3AED')
  doc.setLineWidth(2)
  doc.line(MARGIN, y + 6, MARGIN + 28, y + 6)
}

function drawCards(doc, metrics, y) {
  const gap = 10
  const width = (doc.internal.pageSize.getWidth() - MARGIN * 2 - gap * (metrics.length - 1)) / metrics.length
  metrics.forEach((m, i) => {
    const x = MARGIN + i * (width + gap)
    doc.setFillColor(CARD_COLORS[i % CARD_COLORS.length])
    doc.roundedRect(x, y, width, 62, 8, 8, 'F')
    doc.setFont(PDF_FONT, 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor('#EDE9FE')
    doc.text(m.label, x + 12, y + 20)
    doc.setFont(PDF_FONT, 'bold')
    doc.setFontSize(m.value.length > 9 ? 12 : 17)
    doc.setTextColor('#FFFFFF')
    doc.text(m.value, x + 12, y + 44)
  })
}

/** Vẽ một hình quạt bằng đa giác nhiều điểm (jsPDF không có lệnh vẽ cung tô màu). */
function drawSlice(doc, cx, cy, r, startAngle, endAngle, color) {
  const steps = Math.max(2, Math.ceil(((endAngle - startAngle) * 180) / Math.PI / 3))
  const points = [[cx, cy]]
  for (let i = 0; i <= steps; i++) {
    const a = startAngle + ((endAngle - startAngle) * i) / steps
    points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  const vectors = points.slice(1).map((p, i) => [p[0] - points[i][0], p[1] - points[i][1]])
  doc.setFillColor(color)
  doc.setDrawColor('#FFFFFF')
  doc.setLineWidth(1)
  doc.lines(vectors, points[0][0], points[0][1], [1, 1], 'FD', true)
}

/** Biểu đồ tròn kèm chú thích đầy đủ (nhãn, số mục, %). Trả về toạ độ y ngay dưới khối. */
function drawPieSection(doc, title, slices, y) {
  const pageH = doc.internal.pageSize.getHeight()
  const pageW = doc.internal.pageSize.getWidth()
  const rowH = 18
  const columns = slices.length > 8 ? 2 : 1
  const rowsPerCol = Math.ceil(slices.length / columns)
  const r = 64
  const height = Math.max(r * 2 + 10, rowsPerCol * rowH + 6)
  if (y + height + 30 > pageH - 50) {
    doc.addPage()
    y = 50
  }
  drawSectionTitle(doc, title, y)
  const top = y + 22

  if (!slices.length) {
    doc.setFont(PDF_FONT, 'normal')
    doc.setFontSize(10)
    doc.setTextColor('#71717A')
    doc.text(translate('exportDoc.report.noDataInRange'), MARGIN, top + 14)
    return top + 40
  }

  const total = slices.reduce((s, p) => s + p.count, 0)
  const cx = MARGIN + r + 6
  const cy = top + r
  let angle = -Math.PI / 2
  slices.forEach((s) => {
    const sweep = (s.count / total) * Math.PI * 2
    if (s.count === total) {
      doc.setFillColor(s.color)
      doc.circle(cx, cy, r, 'F')
    } else drawSlice(doc, cx, cy, r, angle, angle + sweep, s.color)
    // Nhãn phần trăm ngay trên miếng đủ lớn.
    if (s.percent >= 7) {
      const mid = angle + sweep / 2
      doc.setFont(PDF_FONT, 'bold')
      doc.setFontSize(8)
      doc.setTextColor('#FFFFFF')
      doc.text(fmtPercent(s.percent), cx + r * 0.62 * Math.cos(mid), cy + r * 0.62 * Math.sin(mid) + 3, { align: 'center' })
    }
    angle += sweep
  })

  const legendX = cx + r + 36
  const colW = (pageW - MARGIN - legendX) / columns
  slices.forEach((s, i) => {
    const col = Math.floor(i / rowsPerCol)
    const row = i % rowsPerCol
    const x = legendX + col * colW
    const ly = top + 10 + row * rowH
    const textRight = x + colW - 14
    doc.setFillColor(s.color)
    doc.circle(x + 4, ly - 3, 3.5, 'F')
    doc.setFont(PDF_FONT, 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor('#18181B')
    doc.text(s.name, x + 14, ly)
    doc.setFont(PDF_FONT, 'normal')
    doc.setTextColor('#52525B')
    doc.text(entryText(s), textRight, ly, { align: 'right' })
  })
  return top + height + 16
}

/**
 * Xuất báo cáo PDF chi tiết.
 * @param {object} data
 * @param {string} data.rangeKey day | week | month | year
 * @param {string} data.rangeLabel Nhãn khoảng thời gian, ví dụ "Tháng 9/2026"
 * @param {{label:string,value:string}[]} data.cards Thẻ số liệu (tối đa 4)
 * @param {object[]} data.timeSlices Miếng của biểu đồ tròn theo thời gian ({name,count,percent,color})
 * @param {object[]} data.periodSlices Miếng của biểu đồ tròn theo buổi trong ngày
 * @param {object[]} data.rows Nhật ký trong khoảng (đã sắp xếp)
 * @param {{label:string,value:Function}[]} data.columns Cột của bảng chi tiết
 */
export async function exportStatsReport({ rangeKey, rangeLabel, cards, timeSlices, periodSlices, rows, columns, filename }) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  await registerPdfFonts(doc)

  drawPdfHeader(doc, translate('exportDoc.report.title'), translate('exportDoc.report.stamp', { range: translate(`exportDoc.report.rangeTitle.${rangeKey}`), label: rangeLabel, time: formatStamp() }))
  drawCards(doc, cards, 98)

  let y = 194
  y = drawPieSection(doc, translate('exportDoc.report.sectionOverTime'), timeSlices, y)
  y = drawPieSection(doc, translate('exportDoc.report.sectionByPeriod'), periodSlices, y)

  if (y + 60 > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage()
    y = 50
  }
  drawSectionTitle(doc, translate('exportDoc.report.sectionDetails', { count: rows.length }), y)
  if (rows.length === 0) {
    doc.setFont(PDF_FONT, 'normal')
    doc.setFontSize(10)
    doc.setTextColor('#71717A')
    doc.text(translate('exportDoc.report.noPosts'), MARGIN, y + 26)
  } else {
    autoTable(doc, {
      startY: y + 16,
      head: [columns.map((c) => c.label)],
      body: rows.map((row) => columns.map((c) => String(c.value(row) ?? ''))),
      styles: { font: PDF_FONT, fontSize: 9, cellPadding: 6, textColor: '#27272A', lineColor: '#E4E4E7', lineWidth: 0.5 },
      headStyles: { font: PDF_FONT, fontStyle: 'bold', fillColor: '#7C3AED', textColor: '#FFFFFF' },
      alternateRowStyles: { fillColor: '#F5F3FF' },
      margin: { left: MARGIN, right: MARGIN, bottom: 40 },
    })
  }

  drawPdfFooters(doc)
  doc.save(filename)
}

/* ------------------------------- PNG ------------------------------- */

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Vẽ một bảng biểu đồ tròn (tiêu đề, hình tròn có % trên miếng, chú thích  vào vùng [x, x + w]. Trả về y cuối. */
function paintPiePanel(ctx, title, slices, x, y, w) {
  const rowH = 30
  const r = 120
  const innerPad = 24
  const legendH = slices.length * rowH
  const panelH = innerPad * 2 + 40 + r * 2 + 28 + Math.max(legendH, 40)

  ctx.fillStyle = '#F5F3FF'
  roundRect(ctx, x, y, w, panelH, 28)
  ctx.fill()

  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#18181B'
  ctx.font = `700 20px ${CANVAS_FONT}`
  ctx.fillText(title, x + innerPad, y + innerPad + 12)

  if (!slices.length) {
    ctx.fillStyle = '#71717A'
    ctx.font = `15px ${CANVAS_FONT}`
    ctx.fillText(translate('exportDoc.report.noDataInRange'), x + innerPad, y + innerPad + 70)
    return y + panelH
  }

  const total = slices.reduce((s, p) => s + p.count, 0)
  const cx = x + w / 2
  const cy = y + innerPad + 40 + r + 6
  let angle = -Math.PI / 2
  slices.forEach((s) => {
    const sweep = (s.count / total) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, angle, angle + sweep)
    ctx.closePath()
    ctx.fillStyle = s.color
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#F5F3FF'
    ctx.stroke()
    if (s.percent >= 6) {
      const mid = angle + sweep / 2
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `700 14px ${CANVAS_FONT}`
      ctx.textAlign = 'center'
      ctx.fillText(fmtPercent(s.percent), cx + r * 0.64 * Math.cos(mid), cy + r * 0.64 * Math.sin(mid))
    }
    angle += sweep
  })

  let ly = cy + r + 36
  ctx.textAlign = 'left'
  slices.forEach((s) => {
    const left = x + innerPad
    const right = x + w - innerPad
    ctx.fillStyle = s.color
    ctx.beginPath()
    ctx.arc(left + 6, ly, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#18181B'
    ctx.font = `700 15px ${CANVAS_FONT}`
    ctx.textAlign = 'left'
    ctx.fillText(s.name, left + 20, ly)
    ctx.fillStyle = '#52525B'
    ctx.font = `14px ${CANVAS_FONT}`
    ctx.textAlign = 'right'
    ctx.fillText(entryText(s), right, ly)
    ly += rowH
  })
  ctx.textAlign = 'left'
  return y + panelH
}

/** Xuất ảnh PNG gồm tiêu đề, thẻ số liệu và hai biểu đồ tròn (không kèm bảng chi tiết). */
export async function exportStatsPng({ rangeKey, rangeLabel, cards, timeSlices, periodSlices, filename }) {
  const W = 1240
  const PAD = 40
  const HEADER_H = 110
  const CARD_H = 96
  const GAP = 20
  const panelW = (W - PAD * 2 - GAP) / 2
  const rowsMax = Math.max(timeSlices.length, periodSlices.length, 1)
  const H = HEADER_H + 24 + CARD_H + 28 + (24 * 2 + 40 + 240 + 28 + Math.max(rowsMax * 30, 40)) + PAD
  const scale = H * 2 <= 16000 ? 2 : 1

  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.textBaseline = 'middle'

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#7C3AED'
  ctx.fillRect(0, 0, W, HEADER_H)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `700 30px ${CANVAS_FONT}`
  ctx.fillText(translate('exportDoc.report.title'), PAD, 46)
  ctx.fillStyle = '#EDE9FE'
  ctx.font = `15px ${CANVAS_FONT}`
  ctx.fillText(translate('exportDoc.report.stamp', { range: translate(`exportDoc.report.rangeTitle.${rangeKey}`), label: rangeLabel, time: formatStamp() }), PAD, 80)

  const cardW = (W - PAD * 2 - GAP * (cards.length - 1)) / cards.length
  const cardY = HEADER_H + 24
  cards.forEach((c, i) => {
    const x = PAD + i * (cardW + GAP)
    ctx.fillStyle = CARD_COLORS[i % CARD_COLORS.length]
    roundRect(ctx, x, cardY, cardW, CARD_H, 22)
    ctx.fill()
    ctx.fillStyle = '#EDE9FE'
    ctx.font = `600 14px ${CANVAS_FONT}`
    ctx.fillText(c.label, x + 20, cardY + 30)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `700 ${c.value.length > 10 ? 22 : 30}px ${CANVAS_FONT}`
    ctx.fillText(c.value, x + 20, cardY + 64)
  })

  const panelsY = cardY + CARD_H + 28
  paintPiePanel(ctx, translate('exportDoc.report.sectionOverTime'), timeSlices, PAD, panelsY, panelW)
  paintPiePanel(ctx, translate('exportDoc.report.sectionByPeriod'), periodSlices, PAD + panelW + GAP, panelsY, panelW)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error(translate('exportDoc.pngError'))
  downloadBlob(blob, filename)
}
