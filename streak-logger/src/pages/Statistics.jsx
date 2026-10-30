import { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Clock, NotebookText, CalendarDays, TrendingUp, Sun, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { useTimeStreak } from '../hooks/useTimeStreak'
import { useStreakPosts } from '../hooks/useStreakPosts'
import { useNow } from '../hooks/useNow'
import { computeElapsedParts } from '../utils/date'
import { PERIOD_HEX } from '../utils/period'
import { RANGES, buildMetrics, buildPeriodCounts, buildPeriodSlices, buildSeries, buildTimeSlices, filterPostsInRange, getRange } from '../utils/stats'
import { POST_COLUMNS } from '../utils/postExport'
import { timestampSuffix } from '../utils/exportData'
import PageHeader from '../components/ui/PageHeader'
import ExportMenu from '../components/ExportMenu'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonStatCard } from '../components/ui/Skeleton'
import Segmented from '../components/ui/Segmented'
import IconButton from '../components/ui/IconButton'

/** Thẻ số liệu: nền phẳng, viền mảnh, số liệu là điểm nhấn duy nhất. */
const STAT_TONES = [
  'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]',
  'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]',
  'bg-[var(--md-tertiary-container)] text-[var(--md-on-tertiary-container)]',
  'bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)]',
  'bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface)]',
]

function StatCard({ icon: Icon, label, value, sub, delay = 0, tone = 0 }) {
  return (
    <div
      className={`stagger-item card-hover rounded-[var(--radius-card)] p-4 sm:p-5 flex flex-col gap-4 h-full ${STAT_TONES[tone % STAT_TONES.length]}`}
      style={{ '--stagger-delay': `${delay}ms` }}
    >
      <div className="flex items-center gap-2 opacity-80">
        <Icon size={18} className="shrink-0" />
        <p className="text-xs font-semibold truncate">{label}</p>
      </div>
      <div className="min-w-0">
        <p className="text-3xl font-bold tabular truncate">{value}</p>
        {sub && <p className="text-xs opacity-75 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--md-surface-container-low)] p-4 sm:p-6">
      <h3 className="text-base font-bold text-[var(--md-on-surface)] mb-4">{title}</h3>
      {children}
    </div>
  )
}

const tooltipProps = {
  contentStyle: { background: 'var(--md-inverse-surface)', border: 'none', borderRadius: 16, fontSize: 12, padding: '8px 12px' },
  labelStyle: { color: 'var(--md-inverse-on-surface)', fontWeight: 700 },
  itemStyle: { color: 'var(--md-inverse-on-surface)' },
}

const fmtPercent = (p) => `${Number.isInteger(p) ? p : p.toFixed(1)}%`

/** Nhãn đầy đủ ngoài mỗi miếng: dòng 1 là tên, dòng 2 là số mục và phần trăm. Miếng quá nhỏ (<4%) chỉ hiện ở danh sách bên dưới. */
function renderPieLabel({ cx, cy, midAngle, outerRadius, payload }) {
  if (!payload || payload.percent < 4) return null
  const RAD = Math.PI / 180
  const r = outerRadius + 16
  const x = cx + r * Math.cos(-midAngle * RAD)
  const y = cy + r * Math.sin(-midAngle * RAD)
  const anchor = x > cx ? 'start' : 'end'
  return (
    <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" fill="var(--md-on-surface)">
      <tspan x={x} dy="-0.6em" fontSize={12} fontWeight={700}>{payload.name}</tspan>
      <tspan x={x} dy="1.25em" fontSize={11} fill="var(--md-on-surface-variant)">{`${payload.count} · ${fmtPercent(payload.percent)}`}</tspan>
    </text>
  )
}

/** Thanh tiến độ phần trăm cho từng miếng, nằm ngay dưới biểu đồ tròn; thanh chạy từ 0 tới giá trị khi hiện ra. */
function ProgressList({ slices }) {
  const { t } = useLang()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="mt-5 pt-4 border-t border-[var(--md-outline-variant)]">
      <p className="text-xs font-semibold text-[var(--md-on-surface-variant)] mb-3">{t('stats.share')}</p>
      <ul className="flex flex-col gap-3.5 max-h-80 overflow-y-auto overscroll-contain-y pr-2">
        {slices.map((s) => (
          <li key={s.key}>
            <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="font-semibold text-[var(--md-on-surface)] truncate">{s.name}</span>
              </span>
              <span className="tabular text-xs text-[var(--md-on-surface-variant)] shrink-0">
                {s.count} {t('stats.entries')} · <span className="font-bold text-[var(--md-on-surface)]">{fmtPercent(s.percent)}</span>
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={s.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${s.name}: ${fmtPercent(s.percent)}`}
              className="h-2.5 rounded-full bg-[var(--md-surface-container-highest)] overflow-hidden"
            >
              <div
                className="h-full rounded-full transition-[width] duration-[900ms] ease-[var(--ease-emphasized-decel)]"
                style={{ width: ready ? `${s.percent}%` : '0%', backgroundColor: s.color }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Thẻ biểu đồ tròn + danh sách thanh phần trăm. */
function PieCard({ title, slices, emptyText }) {
  return (
    <ChartCard title={title}>
      {slices.length === 0 ? (
        <p className="text-sm text-[var(--md-on-surface-variant)] py-16 text-center">{emptyText}</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
              <Pie data={slices} dataKey="count" nameKey="name" outerRadius="62%" paddingAngle={slices.length > 1 ? 1.5 : 0} label={renderPieLabel} labelLine={{ stroke: 'var(--md-outline)' }} isAnimationActive animationDuration={700}>
                {slices.map((s) => (
                  <Cell key={s.key} fill={s.color} stroke="var(--md-surface-container-low)" strokeWidth={3} />
                ))}
              </Pie>
              <Tooltip {...tooltipProps} formatter={(value, _name, item) => [`${value} (${fmtPercent(item.payload.percent)})`, item.payload.name]} />
            </PieChart>
          </ResponsiveContainer>
          <ProgressList slices={slices} />
        </>
      )}
    </ChartCard>
  )
}

export default function Statistics() {
  const { t } = useLang()
  const toast = useToast()
  const now = useNow(60000)
  const { streak, loading: streakLoading } = useTimeStreak()
  const { items: posts, loading: postsLoading } = useStreakPosts()
  const [rangeKey, setRangeKey] = useState('month') // mặc định theo tháng
  const [offset, setOffset] = useState(0)

  const range = useMemo(() => getRange(rangeKey, now, offset), [rangeKey, now, offset])
  const rangePosts = useMemo(() => filterPostsInRange(posts, range), [posts, range])
  const series = useMemo(() => buildSeries(rangePosts, range), [rangePosts, range])
  const periodCounts = useMemo(() => buildPeriodCounts(rangePosts), [rangePosts])
  const metrics = useMemo(() => buildMetrics(rangePosts, periodCounts), [rangePosts, periodCounts])

  const streakDays = streak && new Date(streak.start_at) <= now ? computeElapsedParts(streak.start_at, now).totalDays : null

  const loading = streakLoading || postsLoading
  const hasData = !!streak || posts.length > 0
  const rangeLabels = { day: t('stats.byDay'), week: t('stats.byWeek'), month: t('stats.byMonth'), year: t('stats.byYear') }
  const timeSlices = useMemo(() => buildTimeSlices(series, range), [series, range])
  const periodSlices = useMemo(() => buildPeriodSlices(periodCounts, PERIOD_HEX), [periodCounts])

  const changeRange = (key) => {
    setRangeKey(key)
    setOffset(0)
  }

  /** Xuất báo cáo: PDF chi tiết (kèm bảng nhật ký) hoặc PNG gọn (chỉ số liệu và hai biểu đồ tròn). */
  const handleExportReport = async (format) => {
    try {
      const { exportStatsReport, exportStatsPng } = await import('../utils/report')
      const base = `streak-logger-${t('exportDoc.fileSlug.report')}-${rangeKey}-${timestampSuffix()}`
      const common = {
        rangeKey,
        rangeLabel: range.label,
        cards: [
          { label: t('stats.currentStreak'), value: streakDays !== null ? t('exportDoc.report.daysValue', { count: streakDays }) : t('stats.noStreakYet') },
          { label: t('stats.totalPosts'), value: String(metrics.total) },
          { label: t('stats.activeDays'), value: String(metrics.activeDays) },
          { label: t('stats.mostActivePeriod'), value: metrics.busiest ? metrics.busiest.name : '-' },
        ],
        timeSlices,
        periodSlices,
      }
      if (format === 'png') {
        await exportStatsPng({ ...common, filename: `${base}.png` })
      } else {
        const rows = [...rangePosts].sort((a, b) => `${b.post_date} ${b.post_time}`.localeCompare(`${a.post_date} ${a.post_time}`))
        await exportStatsReport({
          ...common,
          rows,
          columns: POST_COLUMNS.filter((c) => c.key !== 'period').map((c) => ({ label: t(c.labelKey), value: (r) => c.get(r, t) })),
          filename: `${base}.pdf`,
        })
      }
      toast.success(t('stats.reportDone'))
    } catch {
      toast.error(t('csv.exportError'))
    }
  }

  return (
    <div>
      <PageHeader
        title={t('stats.title')}
        subtitle={t('stats.subtitle')}
        actions={
          <ExportMenu
            variant="primary"
            label={t('stats.exportReport')}
            formats={['pdf', 'png']}
            formatLabels={{ pdf: t('stats.exportPdfLabel'), png: t('stats.exportPngLabel') }}
            onExport={handleExportReport}
            disabled={loading || !hasData}
            className="w-full sm:w-auto"
          />
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      ) : !hasData ? (
        <EmptyState icon={NotebookText} title={t('stats.noData')} />
      ) : (
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Chọn mức thống kê và chuyển kỳ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Segmented
              className="w-full sm:w-auto sm:min-w-[22rem]"
              ariaLabel={t('stats.title')}
              value={rangeKey}
              onChange={changeRange}
              options={RANGES.map((g) => ({ value: g, label: rangeLabels[g] }))}
            />
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <IconButton tone="neutral" icon={ChevronLeft} label={t('stats.prev')} onClick={() => setOffset((o) => o - 1)} />
              <button
                type="button"
                onClick={() => setOffset(0)}
                className="m3-ripple morph min-w-[10rem] h-10 px-4 text-sm font-bold text-center text-[var(--md-on-surface)] rounded-full active:rounded-[12px]"
              >
                {range.label}
              </button>
              <IconButton tone="neutral" icon={ChevronRight} label={t('stats.next')} onClick={() => setOffset((o) => o + 1)} disabled={offset >= 0} className="disabled:opacity-35 disabled:pointer-events-none" />
            </div>
          </div>

          {/* Thẻ số liệu */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard tone={0} icon={Clock} label={t('stats.currentStreak')} value={streakDays !== null ? `${streakDays} ${t('stats.days')}` : t('stats.noStreakYet')} sub={streak?.title} delay={0} />
            <StatCard tone={1} icon={NotebookText} label={t('stats.totalPosts')} value={metrics.total} delay={40} />
            <StatCard tone={2} icon={CalendarDays} label={t('stats.activeDays')} value={metrics.activeDays} delay={80} />
            <StatCard tone={3} icon={TrendingUp} label={t('stats.average')} value={metrics.average} sub={t('stats.entries')} delay={120} />
            <div className="col-span-2 lg:col-span-1">
              <StatCard tone={4} icon={Sun} label={t('stats.mostActivePeriod')} value={metrics.busiest ? metrics.busiest.name : '-'} sub={metrics.busiest ? `${metrics.busiest.count} ${t('stats.entries')}` : ''} delay={160} />
            </div>
          </div>

          {/* Hai biểu đồ tròn, mỗi biểu đồ kèm chú thích đầy đủ và thanh phần trăm bên dưới */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
            <PieCard title={`${t('stats.pieOverTime')} (${range.label})`} slices={timeSlices} emptyText={t('stats.noDataInRange')} />
            <PieCard title={t('stats.pieByPeriod')} slices={periodSlices} emptyText={t('stats.noDataInRange')} />
          </div>
        </div>
      )}
    </div>
  )
}
