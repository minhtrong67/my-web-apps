import { useId } from 'react'

// Phần "đã đạt" của linear progress dạng gợn sóng (M3 Expressive): cao 12px, nét dày 4px, bước sóng 36px.
// Sóng trôi nhẹ theo SMIL; tắt khi người dùng chọn giảm chuyển động. Màu là #hex để html2canvas chụp chính xác.
const WAVE = 36
export default function WavyProgress({ color, className = '', style }) {
  const id = useId().replace(/:/g, '')
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  return (
    <svg className={className} style={style} height="12" width="100%" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id={id} width={WAVE} height="12" patternUnits="userSpaceOnUse">
          <path d={`M0 6 Q${WAVE / 4} -2 ${WAVE / 2} 6 T${WAVE} 6`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
          {!reduce && <animateTransform attributeName="patternTransform" type="translate" from="0 0" to={`${WAVE} 0`} dur="1.4s" repeatCount="indefinite" />}
        </pattern>
      </defs>
      <rect width="100%" height="12" rx="6" fill={`url(#${id})`} />
    </svg>
  )
}
