/**
 * Lớp trang trí cho thẻ / banner của ngày đặc biệt: hoa văn chấm, vệt sáng góc và vài biểu tượng
 * (tuyết, bí ngô, hoa đào, đèn lồng...) trôi nhẹ. Nằm dưới nội dung (pointer-events: none), cắt theo bo góc của thẻ cha.
 */
export default function HolidayArt({ theme, compact = false, scale = 1 }) {
  if (!theme) return null
  const items = compact ? theme.emojis.slice(0, 2) : theme.emojis
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: theme.pattern }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 100% 0%, rgba(255,255,255,0.18), transparent 55%)' }} />
      {items.map(({ e, size, delay, ...pos }) => (
        <span
          key={e}
          className="holiday-emoji absolute select-none leading-none"
          style={{ ...pos, fontSize: `${size * scale * (compact ? 0.8 : 1)}rem`, animationDelay: `${delay}s` }}
        >
          {e}
        </span>
      ))}
    </div>
  )
}
