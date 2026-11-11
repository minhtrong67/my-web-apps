import { RADAR_AXES, STAT_KEYS } from '../lib/data.js'
import { useI18n } from '../lib/i18n.jsx'

/** 0..1 value per radar axis, relative to the 95th percentile of the whole roster. */
export const radarPct = (s, tab, ref) => {
  const v = s.s[tab] || s.s[2] || s.s[1] || s.s[0]
  return RADAR_AXES.map((j) => {
    const n = parseFloat(v?.[j])
    return ref[tab][j] ? Math.max(0.04, Math.min(1, (isNaN(n) ? 0 : n) / ref[tab][j])) : 0
  })
}

/** Hexagon radar chart. series: [{ pct: number[6], color, label }] */
export function Radar({ series, size = 230 }) {
  const { t } = useI18n()
  const c = size / 2, R = size * 0.33, n = RADAR_AXES.length
  const pt = (i, v, k = 1) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [c + Math.cos(a) * R * v * k, c + Math.sin(a) * R * v * k] }
  const poly = (v) => RADAR_AXES.map((_, i) => pt(i, typeof v === 'number' ? v : v[i]).map((x) => x.toFixed(1)).join(',')).join(' ')
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[16rem]" role="img" aria-label={t('radar')}>
      {[0.25, 0.5, 0.75, 1].map((r) => <polygon key={r} points={poly(r)} className="fill-none stroke-line" strokeWidth="1" />)}
      {RADAR_AXES.map((_, i) => { const [x, y] = pt(i, 1); return <line key={i} x1={c} y1={c} x2={x} y2={y} className="stroke-line" strokeWidth="1" /> })}
      {series.map((s, k) => (
        <g key={k}>
          <polygon points={poly(s.pct)} fill={s.color} fillOpacity=".22" stroke={s.color} strokeWidth="2" strokeLinejoin="round" style={{ animation: 'fade .6s ease-out both' }} />
          {s.pct.map((v, i) => { const [x, y] = pt(i, v); return <circle key={i} cx={x} cy={y} r="2.5" fill={s.color} /> })}
        </g>
      ))}
      {RADAR_AXES.map((j, i) => {
        const [x, y] = pt(i, 1, 1.2)
        return <text key={j} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-muted" style={{ fontSize: 10, fontWeight: 600 }}>{t('st_' + STAT_KEYS[j])}</text>
      })}
    </svg>
  )
}
