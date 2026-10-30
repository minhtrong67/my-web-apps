/**
 * Hình học của logo Streak Logger (Material 3 Expressive): một khối "cookie" 12 cánh
 * bo mượt làm nền, ngọn lửa trắng đầy ở giữa kèm lõi lửa sáng màu.
 * Dùng chung cho component <BrandMark />, favicon, icon ứng dụng và ảnh splash
 * (xem scripts/generate-icons.mjs) để mọi nơi hiển thị đúng cùng một logo.
 * Hệ tọa độ: viewBox 0 0 512 512.
 */
export const BRAND_COLOR = '#7C3AED'
export const BRAND_CORE = '#DDC9FF'
export const BRAND_VIEWBOX = 512

/** Đường viền khối cookie: bán kính dao động theo cos(12θ) để tạo 12 cánh tròn đều. */
function cookiePath(cx = 256, cy = 256, radius = 236, amplitude = 15, lobes = 12, steps = 360) {
  const points = []
  for (let i = 0; i < steps; i++) {
    const theta = (i / steps) * Math.PI * 2
    const r = radius + amplitude * Math.cos(lobes * theta)
    points.push(`${(cx + r * Math.cos(theta - Math.PI / 2)).toFixed(2)} ${(cy + r * Math.sin(theta - Math.PI / 2)).toFixed(2)}`)
  }
  return `M${points.join('L')}Z`
}

export const COOKIE_PATH = cookiePath()

/** Ngọn lửa (đường viền gốc của biểu tượng Flame) và lõi lửa, trong hệ tọa độ 24x24. */
export const FLAME_PATH =
  'M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4'
export const FLAME_CORE_PATH =
  'M12 21.2a3.4 3.4 0 0 1-3.4-3.4c0-1.9 1.7-2.7 2.4-4.7 1 1.5 4.4 2.8 4.4 4.7a3.4 3.4 0 0 1-3.4 3.4z'

/** Biến đổi đặt ngọn lửa vào giữa khung 512 (tỉ lệ 14, lệch xuống nhẹ cho cân mắt). */
export const FLAME_TRANSFORM = 'translate(88 86) scale(14)'
