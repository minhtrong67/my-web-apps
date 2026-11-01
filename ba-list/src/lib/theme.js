/* Phong cách Blue Archive: mọi màu được dẫn xuất bằng color-mix() trong index.css từ biến --ac.
   Ở đây chỉ cần đặt màu chủ đạo, màu chữ trên nền chủ đạo và theme-color của trình duyệt. */
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return (n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114
}
export function applyScheme(seed, mode) {
  const root = document.documentElement
  root.style.setProperty('--ac', seed)
  root.style.setProperty('--on-ac', lum(seed) > 170 ? '#10223c' : '#ffffff')
  root.style.background = ''
  const tc = document.getElementById('tc')
  if (tc) tc.content = mode === 'dark' ? '#0a111f' : '#eaf3ff'
}
