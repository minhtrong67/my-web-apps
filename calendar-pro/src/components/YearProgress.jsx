import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon'
import { formatShortDate } from '../lib/dateUtils'
import { dateAtFraction, getRange, monthSegments, progressOf, segmentFill } from '../lib/yearProgress'
import { useNow } from '../hooks/useNow'
import { useTranslation } from '../i18n/useTranslation'

/**
 * "Tiến độ năm": năm nay (dương lịch hoặc âm lịch) đã trôi qua bao nhiêu phần trăm.
 * Mọi số liệu suy ra từ thời điểm hiện tại, đồng hồ cập nhật mỗi giây → qua 0h ngày 1/1 (hoặc mùng 1 Tết) tự về 0% cho năm kế tiếp.
 */
const DAY = 86400000
const SIZE = 260
const C = SIZE / 2
const R = 100 // bán kính trung bình của vòng
const AMP = 3.2 // biên độ sóng
const WAVES = 24 // số đỉnh sóng quanh vòng

/** Điểm trên vòng sóng tại góc `a` (rad, 0 = 12 giờ, quay thuận chiều kim đồng hồ); `phase` làm sóng chảy dọc theo vòng */
function ringPoint(a, phase = 0) {
  const r = R + AMP * Math.sin(a * WAVES - phase)
  return [C + r * Math.sin(a), C - r * Math.cos(a)]
}

function ringPath(fraction, phase) {
  if (fraction <= 0) return ''
  const end = Math.min(1, fraction) * Math.PI * 2
  const steps = Math.max(2, Math.ceil(end / (Math.PI / 90)))
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const [x, y] = ringPoint((end * i) / steps, phase)
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d
}

/**
 * Vòng tiến độ dạng sóng chảy liên tục (cùng nhịp 1,4 giây/sóng với thanh tiến trình ở các thẻ đếm ngược).
 * Có state + rAF riêng nên mỗi khung hình chỉ vẽ lại SVG này, không kéo cả trang. Tắt chuyển động khi người dùng bật "giảm chuyển động".
 */
function WavyRing({ fraction }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let raf = 0
    const step = (now) => {
      setPhase(((now % 1400) / 1400) * Math.PI * 2)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])
  const f = Math.min(1, fraction)
  const [ex, ey] = ringPoint(f * Math.PI * 2, phase)
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full overflow-visible" aria-hidden="true">
      <circle cx={C} cy={C} r={R} fill="none" stroke="var(--primary)" strokeOpacity="0.16" strokeWidth="12" />
      <path d={ringPath(f, phase)} fill="none" stroke="var(--primary)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      {f > 0 && (
        <>
          <circle cx={ex} cy={ey} r="10" fill="var(--primary)" />
          <circle cx={ex} cy={ey} r="4.5" fill="var(--on-primary)" />
        </>
      )}
    </svg>
  )
}

/** Hoạt ảnh "đổ đầy" lần đầu hiện ra (0 → giá trị thật), sau đó bám sát giá trị thật theo từng giây */
function useFillIn(target, ms = 1100) {
  const [shown, setShown] = useState(0)
  const [done, setDone] = useState(false)
  const targetRef = useRef(target)
  targetRef.current = target
  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const step = (now) => {
      const p = Math.min(1, (now - start) / ms)
      setShown(targetRef.current * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(step)
      else setDone(true)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [ms])
  return done ? target : shown
}

const floorTo = (v, digits) => Math.floor(v * 10 ** digits) / 10 ** digits

export default function YearProgress() {
  const { t, lang } = useTranslation()
  const [kind, setKind] = useState('solar')
  const now = useNow(1000)

  const range = useMemo(() => getRange(kind, now), [kind, now.getFullYear(), now.getMonth(), now.getDate()]) // eslint-disable-line react-hooks/exhaustive-deps
  const p = progressOf(range, now)
  const segments = useMemo(() => monthSegments(range), [range])
  const shown = useFillIn(p.fraction)

  const pct = p.fraction * 100
  const shownPct = floorTo(pct, 2) // làm tròn xuống: không bao giờ hiện 100% trước khi thực sự sang năm mới
  const [whole, dec] = shownPct.toFixed(2).split('.')
  const sep = lang === 'vi' ? ',' : '.' // 83,94% (Việt) · 83.94% (Anh)

  const isNewYear = p.fraction < 0.01
  const isLastDay = p.leftDays <= 0

  const milestones = [0.25, 0.5, 0.75, 1].map((f) => ({
    f,
    date: f === 1 ? new Date(range.end.getTime() - DAY) : dateAtFraction(range, f),
    reached: p.fraction >= f || (f === 1 && p.fraction >= 1)
  }))

  const stats = [
    { icon: 'check_circle', label: t('yearProgress.passed'), value: t('yearProgress.days', p.passedDays) },
    { icon: 'hourglass_top', label: t('yearProgress.left'), value: t('yearProgress.days', Math.max(0, p.leftDays)) },
    { icon: 'today', label: t('yearProgress.today'), value: t('yearProgress.dayOf', p.dayNumber, p.totalDays) },
    { icon: 'calendar_today', label: '', value: t('yearProgress.weekOf', p.weekNumber, p.totalWeeks) }
  ]

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Chọn loại năm */}
      <div className="grid grid-cols-2 gap-2" role="group" aria-label={t('yearProgress.tabYear')}>
        {['solar', 'lunar'].map((id) => {
          const active = kind === id
          return (
            <button
              key={id}
              onClick={() => setKind(id)}
              aria-pressed={active}
              className={`state focus-ring flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-label-lg transition-[background-color,color,box-shadow] duration-spatial-fast ease-spatial-fast active:scale-95 ${active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant shadow-[inset_0_0_0_1px_var(--outline-variant)]'
                }`}
            >
              {active && <Icon name="check" size={18} weight={600} className="animate-pop-in" />}
              {t(`yearProgress.${id}`)}
            </button>
          )
        })}
      </div>

      {/* Thông báo đặc biệt: vừa sang năm mới / ngày cuối năm */}
      {(isNewYear || isLastDay) && (
        <div className="animate-rise flex items-start gap-3 rounded-3xl bg-tertiary-container p-4 text-on-tertiary-container">
          <Icon name="celebration" size={24} filled className="mt-0.5 shrink-0" />
          <p className="text-body-lg">{isNewYear ? t('yearProgress.newYear', range.label) : t('yearProgress.lastDay')}</p>
        </div>
      )}

      {/* Vòng tiến độ */}
      <section className="relative isolate overflow-hidden rounded-[32px] bg-surface-container px-4 pb-6 pt-7 text-center sm:p-8" aria-label={t('yearProgress.yearLabel', range.label)}>
        <span className="fx-spin-slow shape-sunny pointer-events-none absolute -right-14 -top-14 -z-10 h-48 w-48 bg-primary-container opacity-60" aria-hidden="true" />
        <span className="shape-cookie pointer-events-none absolute -bottom-16 -left-12 -z-10 h-44 w-44 bg-tertiary-container opacity-50" aria-hidden="true" />
        <p className="text-label-lg uppercase tracking-wider text-on-surface-variant">{t('yearProgress.yearLabel', range.label)}</p>

        <div className="relative mx-auto mt-3 aspect-square w-full max-w-[19rem]" role="img" aria-label={`${whole}${sep}${dec}% ${t('yearProgress.done')}`}>
          <WavyRing fraction={shown} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="num flex items-baseline leading-none text-primary">
              <span className="text-[4.25rem] font-bold tracking-tight sm:text-[5rem]">{whole}</span>
              <span className="text-headline-md font-semibold">{sep}{dec}%</span>
            </p>
            <p className="mt-2 text-body-md text-on-surface-variant">{t('yearProgress.done')}</p>
          </div>
        </div>

        <p className="mt-3 text-body-sm text-on-surface-variant">{t('yearProgress.perDay', p.perDay.toFixed(2).replace('.', sep))}</p>
      </section>

      {/* Số liệu */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`stagger-item rounded-3xl p-4 ${i === 0 ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container'}`} style={{ '--i': i }}>
            <Icon name={s.icon} size={22} filled className={i === 0 ? '' : 'text-primary'} />
            {s.label && <p className={`mt-2 text-label-md ${i === 0 ? 'opacity-80' : 'text-on-surface-variant'}`}>{s.label}</p>}
            <p className={`num text-title-md ${s.label ? '' : 'mt-2'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Các tháng */}
      <section className="rounded-[28px] bg-surface-container p-5">
        <h3 className="mb-4 text-title-md text-on-surface">{t('yearProgress.months')}</h3>
        <div className="grid items-end gap-1.5 sm:gap-2" style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}>
          {segments.map((seg, i) => {
            const fill = segmentFill(seg, now)
            const current = now >= seg.start && now < seg.end
            return (
              <div key={i} className="flex min-w-0 flex-col items-center gap-1.5">
                <div className={`relative h-28 w-full overflow-hidden rounded-full sm:h-36 ${current ? 'bg-primary-container' : 'bg-surface-high'}`} title={`${formatShortDate(seg.start)} → ${formatShortDate(new Date(seg.end.getTime() - DAY))}`}>
                  <div
                    className={`absolute inset-x-0 bottom-0 rounded-full transition-[height] duration-[1200ms] ease-spatial ${current ? 'bg-primary' : 'bg-primary/55'}`}
                    style={{ height: `${Math.round(fill * 1000) / 10}%` }}
                  />
                </div>
                <span className={`num text-label-sm ${current ? 'font-bold text-primary' : 'text-on-surface-variant'}`}>
                  {seg.label}
                  {seg.leap ? (lang === 'en' ? 'L' : 'n') : ''}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Cột mốc */}
      <section className="rounded-[28px] bg-surface-container p-5">
        <h3 className="mb-3 text-title-md text-on-surface">{t('yearProgress.milestones')}</h3>
        <ul className="flex flex-col">
          {milestones.map((m, i) => (
            <li key={m.f} className={`flex items-center gap-3 py-3 ${i > 0 ? 'border-t border-outline-variant/60' : ''}`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${m.reached ? 'bg-primary text-on-primary' : 'bg-surface-high text-on-surface-variant'}`}>
                <Icon name={m.reached ? 'check' : m.f === 1 ? 'flag' : 'radio_button_unchecked'} size={20} weight={m.reached ? 600 : 400} />
              </span>
              <span className="num text-title-md text-on-surface">{m.f * 100}%</span>
              <span className="num ml-auto text-body-md text-on-surface-variant">{formatShortDate(m.date)}</span>
              {m.reached && <span className="rounded-full bg-secondary-container px-2.5 py-0.5 text-label-sm text-on-secondary-container">{t('yearProgress.reached')}</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
