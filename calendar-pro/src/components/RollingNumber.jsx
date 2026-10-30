import { memo } from 'react'

/**
 * Số "cuộn" kiểu đồng hồ cơ (odometer): mỗi chữ số là một dải 0–9 trượt lên/xuống bằng spring khi giá trị đổi.
 * Dùng cho đồng hồ đếm ngược và ngày âm lịch. Chỉ animate transform nên rất nhẹ.
 * Có aria-label chứa giá trị thật để trình đọc màn hình đọc đúng (các chữ số cuộn bị ẩn khỏi cây trợ năng).
 */
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function RollingNumber({ value, pad = 0, className = '' }) {
  const text = String(Math.max(0, Math.floor(value))).padStart(pad, '0')
  return (
    <span className={`num inline-flex ${className}`} role="text" aria-label={text}>
      {text.split('').map((ch, i) => (
        <span key={`${text.length - i}`} className="odo" aria-hidden="true">
          <span className="odo-strip" style={{ transform: `translateY(${-Number(ch) * 1.15}em)` }}>
            {DIGITS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}

export default memo(RollingNumber)
