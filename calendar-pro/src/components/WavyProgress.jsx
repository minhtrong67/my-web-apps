/**
 * Thanh tiến trình dạng sóng (wavy progress indicator) của Material 3 Expressive.
 * Phần đã đi là đường sóng đang "chảy"; phần còn lại là vạch thẳng mờ; cuối thanh có chấm dừng.
 * value: 0–1. Dùng stroke không co giãn nên nét luôn dày đều ở mọi độ rộng.
 */
const W = 200
const PERIOD = 24
const wave = (() => {
  let d = 'M0 8 Q6 1 12 8'
  for (let x = 24; x <= W + PERIOD * 2; x += 12) d += ` T${x} 8`
  return d
})()

export default function WavyProgress({ value = 0, className = '', label, color }) {
  const p = Math.min(1, Math.max(0, value))
  const x = Math.max(6, p * W)
  const id = `wp-${Math.round(p * 1000)}`
  return (
    <svg
      viewBox={`0 0 ${W} 16`}
      preserveAspectRatio="none"
      className={`h-4 w-full overflow-visible ${color ? '' : 'text-primary'} ${className}`}
      style={color ? { color } : undefined}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <clipPath id={id}>
          <rect x="-4" y="-4" width={x + 4} height="24" />
        </clipPath>
      </defs>
      <line x1={Math.min(W - 6, x + 8)} y1="8" x2={W - 6} y2="8" stroke="currentColor" strokeOpacity="0.28" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={W - 3} cy="8" r="2" fill="currentColor" vectorEffect="non-scaling-stroke" />
      <g clipPath={`url(#${id})`}>
        <g className="wavy-move">
          <path d={wave} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </g>
      </g>
    </svg>
  )
}
