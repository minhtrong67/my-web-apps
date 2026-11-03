import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
import { BE_VIETNAM_PRO_REGULAR_BASE64, BE_VIETNAM_PRO_BOLD_BASE64 } from '../assets/pdfFont'

// Gắn autoTable() trực tiếp vào jsPDF.API — cách này ổn định trên mọi bundler
// (kể cả Vite/ESM) thay vì phụ thuộc vào default export có thể không nhất quán.
applyPlugin(jsPDF)

const EXCLUDED_KEYS = new Set(['id', 'created_at', 'updated_at'])
const FALLBACK_ACCENT = [79, 70, 229] // indigo — dùng khi không đọc được theme hiện tại

function rowsForExport(data, fields) {
  const keys = fields.map((f) => f.key)
  return data.map((row) => {
    const out = {}
    keys.forEach((k) => {
      out[k] = row[k] ?? ''
    })
    return out
  })
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportToCSV(data, fields, filename) {
  const rows = rowsForExport(data, fields)
  const csv = Papa.unparse(rows)
  downloadBlob(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`)
}

export function exportToExcel(data, fields, filename) {
  const rows = rowsForExport(data, fields)
  const headerLabels = fields.map((f) => f.label)
  const aoa = [
    headerLabels,
    ...rows.map((r) => fields.map((f) => (f.type === 'password' ? '••••••••' : String(r[f.key] ?? '')))),
  ]
  const worksheet = XLSX.utils.aoa_to_sheet(aoa)

  // Độ rộng cột tự tính theo nội dung dài nhất để trông chuyên nghiệp hơn
  worksheet['!cols'] = fields.map((f, i) => {
    const longest = aoa.reduce((max, row) => Math.max(max, String(row[i] ?? '').length), f.label.length)
    return { wch: Math.min(Math.max(longest + 2, 12), 48) }
  })
  worksheet['!rows'] = [{ hpt: 22 }]
  worksheet['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: aoa.length - 1, c: fields.length - 1 } }) }
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1 }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

function hexToRgb(hex, fallback = FALLBACK_ACCENT) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || '').trim())
  if (!m) return fallback
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

/** Đọc màu chủ đạo/màu module hiện tại từ CSS custom property, để PDF luôn đồng bộ giao diện. */
function readAccentColor(colorKey) {
  if (typeof window === 'undefined') return FALLBACK_ACCENT
  const styles = getComputedStyle(document.documentElement)
  const raw = styles.getPropertyValue(colorKey ? `--color-${colorKey}` : '--color-accent')
  return hexToRgb(raw)
}

function registerVietnameseFont(doc) {
  doc.addFileToVFS('BeVietnamPro-Regular.ttf', BE_VIETNAM_PRO_REGULAR_BASE64)
  doc.addFont('BeVietnamPro-Regular.ttf', 'BeVietnamPro', 'normal')
  doc.addFileToVFS('BeVietnamPro-Bold.ttf', BE_VIETNAM_PRO_BOLD_BASE64)
  doc.addFont('BeVietnamPro-Bold.ttf', 'BeVietnamPro', 'bold')
  doc.setFont('BeVietnamPro', 'normal')
}

const now = () =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())

/**
 * Xuất PDF theo dạng báo cáo chuyên nghiệp: dải tiêu đề màu theo module,
 * bảng dữ liệu có gridlines rõ ràng, đánh số thứ tự, chân trang có số trang.
 * Nhúng sẵn font Be Vietnam Pro (Latin + Vietnamese) để không bị lỗi/vuông
 * dấu tiếng Việt như font mặc định của jsPDF.
 */
export function exportToPDF(data, fields, filename, title, colorKey) {
  const rows = rowsForExport(data, fields)
  const accent = readAccentColor(colorKey)
  const orientation = fields.length > 4 ? 'landscape' : 'portrait'
  const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' })
  registerVietnameseFont(doc)

  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 32

  // Dải tiêu đề
  doc.setFillColor(...accent)
  doc.rect(0, 0, pageWidth, 64, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('BeVietnamPro', 'bold')
  doc.setFontSize(16)
  doc.text(title || filename, marginX, 30)
  doc.setFont('BeVietnamPro', 'normal')
  doc.setFontSize(9)
  doc.text('Sayuri Vault — Thư viện tra cứu cá nhân', marginX, 46)
  const rightText = `${rows.length} bản ghi · Xuất lúc ${now()}`
  doc.text(rightText, pageWidth - marginX - doc.getTextWidth(rightText), 46)

  doc.autoTable({
    startY: 84,
    margin: { left: marginX, right: marginX, bottom: 40 },
    head: [['#', ...fields.map((f) => f.label)]],
    body: rows.map((r, i) => [
      String(i + 1),
      ...fields.map((f) => {
        const val = r[f.key]
        return f.type === 'password' ? (val ? '••••••••' : '') : String(val ?? '')
      }),
    ]),
    styles: {
      font: 'BeVietnamPro',
      fontSize: 9,
      cellPadding: 7,
      overflow: 'linebreak',
      valign: 'middle',
      lineColor: [222, 217, 230],
      lineWidth: 0.6,
      textColor: [30, 27, 38],
    },
    headStyles: {
      font: 'BeVietnamPro',
      fontStyle: 'bold',
      fillColor: accent,
      textColor: 255,
      halign: 'left',
      lineWidth: 0,
    },
    columnStyles: { 0: { cellWidth: 26, halign: 'center', textColor: [140, 135, 150] } },
    alternateRowStyles: { fillColor: [247, 245, 251] },
    theme: 'grid',
    didDrawPage: () => {
      const pageCount = doc.internal.getNumberOfPages()
      const current = doc.internal.getCurrentPageInfo().pageNumber
      const h = doc.internal.pageSize.getHeight()
      doc.setFont('BeVietnamPro', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(150, 145, 158)
      doc.text('Sayuri Vault', marginX, h - 18)
      const pageLabel = `Trang ${current} / ${pageCount}`
      doc.text(pageLabel, pageWidth - marginX - doc.getTextWidth(pageLabel), h - 18)
    },
  })

  doc.save(`${filename}.pdf`)
}

/**
 * Đọc file CSV và trả về mảng object thô (chưa lọc field).
 * Chỉ hỗ trợ .csv — import từ Excel/JSON không còn được hỗ trợ, hãy
 * chuyển đổi file sang CSV trước khi nhập.
 */
export async function parseImportFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext !== 'csv') {
    throw new Error('Chỉ hỗ trợ nhập file .csv. Vui lòng chuyển đổi file của bạn sang CSV trước khi nhập.')
  }

  const text = await file.text()
  const { data, errors } = Papa.parse(text, { header: true, skipEmptyLines: true })
  if (errors?.length) {
    // eslint-disable-next-line no-console
    console.warn('CSV parse warnings:', errors)
  }
  return data
}

/**
 * Chuẩn hoá dữ liệu import theo đúng field của module, bỏ các field hệ thống.
 */
export function normalizeImportedRows(rawRows, fields) {
  const allowedKeys = fields.map((f) => f.key)
  const requiredKeys = fields.filter((f) => f.required).map((f) => f.key)

  const valid = []
  const invalid = []

  rawRows.forEach((raw, index) => {
    const row = {}
    allowedKeys.forEach((k) => {
      const value = raw[k]
      row[k] = value === undefined || value === null ? '' : String(value).trim()
    })
    const missingRequired = requiredKeys.some((k) => !row[k])
    if (missingRequired) {
      invalid.push({ index, row: raw, reason: `Thiếu trường bắt buộc: ${requiredKeys.join(', ')}` })
    } else {
      valid.push(row)
    }
  })

  return { valid, invalid }
}

export { EXCLUDED_KEYS }
