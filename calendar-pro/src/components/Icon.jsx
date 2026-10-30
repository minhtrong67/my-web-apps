/**
 * Icon — bọc font Material Symbols Outlined, dùng nét mảnh (weight 300) cho phong cách minimalist.
 *
 * Dùng "font-variation-settings" (variable font) để bật/tắt fill và chỉnh độ đậm ngay tại chỗ dùng,
 * không cần tải thêm file font nào khác.
 */
export default function Icon({ name, size = 20, filled = false, weight = 300, className = '', style, ...props }) {
  return (
    <span
      className={`material-symbols-outlined inline-block shrink-0 select-none leading-none ${className}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${Math.min(48, Math.max(20, size))}`,
        ...style
      }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  )
}
