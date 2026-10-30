import { BRAND_COLOR, BRAND_CORE, COOKIE_PATH, FLAME_CORE_PATH, FLAME_PATH, FLAME_TRANSFORM } from '../theme/brand'

/**
 * Logo Streak Logger: khối cookie 12 cánh (Material 3 Expressive) với ngọn lửa ở giữa.
 * Vẽ từ cùng hình học với favicon và icon ứng dụng (src/theme/brand.js),
 * nên luôn giống hệt nhau ở sidebar, header, màn hình chờ, favicon và icon PWA.
 */
export default function BrandMark({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Streak Logger"
      className={`shrink-0 ${className}`}
    >
      <path d={COOKIE_PATH} fill={BRAND_COLOR} />
      <g transform={FLAME_TRANSFORM}>
        <path d={FLAME_PATH} fill="#fff" stroke="#fff" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" />
        <path d={FLAME_CORE_PATH} fill={BRAND_CORE} />
      </g>
    </svg>
  )
}
