/**
 * Icon — bọc font Material Symbols Outlined (variable font).
 *
 * Dùng "font-variation-settings" để bật/tắt fill và chỉnh độ đậm ngay tại chỗ dùng. Material 3 Expressive
 * dùng nét dày hơn (weight 400–500) và icon đặc (FILL 1) cho trạng thái đang chọn; CSS có transition
 * cho font-variation-settings nên icon "đặc dần" mượt khi chuyển trạng thái.
 */
export default function Icon({ name, size = 24, filled = false, weight = 400, className = '', style, ...props }) {
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
