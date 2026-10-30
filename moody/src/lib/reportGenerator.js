import { readRole } from './theme'

// Xuất PDF / PNG bằng cách CHỤP TRỰC TIẾP vùng nội dung đang hiển thị trên trang Thống kê
// (từ các thẻ chỉ số đến hết 2 biểu đồ và 2 thanh tiến độ), nên kết quả giống hệt những gì người dùng thấy,
// đúng cả giao diện sáng/tối. Bộ lọc (kỳ, điều hướng ngày) nằm ngoài vùng chụp nên không xuất hiện.
// html2canvas-pro được nạp khi bấm xuất để trang Thống kê mở nhanh hơn.
const SCALE = 2

async function capture(node) {
  if (!node) throw new Error('Không tìm thấy vùng cần chụp')
  const { default: html2canvas } = await import('html2canvas-pro')
  if (document.fonts?.ready) await document.fonts.ready
  // Đợi một khung hình để Recharts / thanh tiến độ vẽ xong trước khi chụp.
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  return html2canvas(node, {
    scale: SCALE,
    backgroundColor: readRole('surface'),
    useCORS: true,
    logging: false
  })
}

function fileSafeLabel(label) {
  return String(label || '').replace(/[\s/,→]+/g, '-')
}

function download(url, name) {
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// PDF: một trang có kích thước đúng bằng ảnh chụp (không bị cắt ngang biểu đồ / thanh tiến độ).
export async function exportStatsPdf({ node, periodLabel }) {
  const [canvas, { default: jsPDF }] = await Promise.all([capture(node), import('jspdf')])
  const w = canvas.width / SCALE
  const h = canvas.height / SCALE
  const pdf = new jsPDF({ unit: 'px', format: [w, h], orientation: w > h ? 'landscape' : 'portrait', hotfixes: ['px_scaling'] })
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h)
  pdf.save(`moody-stats-${fileSafeLabel(periodLabel)}.pdf`)
}

export async function exportStatsImage({ node, periodLabel }) {
  const canvas = await capture(node)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  const url = URL.createObjectURL(blob)
  download(url, `moody-stats-${fileSafeLabel(periodLabel)}.png`)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
