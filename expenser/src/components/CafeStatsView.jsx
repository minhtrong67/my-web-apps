import { useMemo } from 'react';
import { ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Icon from './ui/Icon';
import IconButton from './ui/IconButton';
import Chip from './ui/Chip';
import EmptyState from './ui/EmptyState';
import { ChartSkeleton } from './ui/Skeleton';
import { useI18n } from '../i18n';
import { useSessionState } from '../hooks/useSessionState';
import { useChartTheme } from '../hooks/useChartTheme';
import { formatMoney, formatCompactMoney, formatDateShort, formatMonthYear, formatDate } from '../utils/format';
import { getPeriod, shiftAnchor, getSession, SESSIONS, SESSION_COLORS, CHART_PALETTE } from '../utils/cafe';

const RANGES = ['week', 'month', 'year'];
const OTHER_COLOR = '#94A3B8';
const MAX_SLICES = 8;

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="animate-fade-in rounded-2xl bg-surface-container-low p-4 sm:p-5">
      <h3 className="text-title-md text-on-surface">{title}</h3>
      {subtitle && <p className="mb-3 text-body-sm text-on-surface-variant">{subtitle}</p>}
      <div className={subtitle ? '' : 'mt-3'}>{children}</div>
    </section>
  );
}

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-container p-3 text-on-surface sm:p-4">
      <p className="flex items-center gap-1 text-label-md text-on-surface-variant">
        <Icon name={icon} size={13} /> {label}
      </p>
      <p className="mt-1.5 wrap-any text-title-md font-bold tabular-nums leading-tight sm:text-title-lg">{value}</p>
      {hint && <p className="wrap-any mt-0.5 text-body-sm text-on-surface-variant">{hint}</p>}
    </div>
  );
}

/** Donut of "how often" (visits) with spend in the tooltip. rows: [{ name, visits, amount, color }] */
function VisitsPie({ rows, chart, t }) {
  if (rows.length === 0) return <EmptyState icon="donut_large" text={t('common.noData')} />;
  const total = rows.reduce((s, r) => s + r.visits, 0);
  const data = rows.map((r) => ({ ...r, pct: Math.round((r.visits / total) * 100) }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="visits" nameKey="name" innerRadius={55} outerRadius={92} paddingAngle={2} stroke="none" isAnimationActive={false} label={({ pct }) => (pct >= 5 ? `${pct}%` : '')} labelLine={false} style={{ fontSize: 11, fontWeight: 600 }}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip {...chart.tooltip} formatter={(v, n, { payload }) => [`${t('cafe.visits', { n: v })} · ${formatMoney(payload.amount)} (${payload.pct}%)`, payload.name]} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Group items by a key, count visits + sum spend, sorted by visits (top slices + one "other").
function aggregate(items, keyFn, labelFn, colorFn, otherLabel) {
  const map = new Map();
  items.forEach((it) => {
    const key = keyFn(it);
    const cur = map.get(key) || { key, name: labelFn(key, it), visits: 0, amount: 0 };
    cur.visits += 1;
    cur.amount += it.tx.amount;
    map.set(key, cur);
  });
  const rows = [...map.values()].sort((a, b) => b.visits - a.visits || b.amount - a.amount);
  const head = rows.slice(0, MAX_SLICES).map((r, i) => ({ ...r, color: colorFn(r.key, i) }));
  const tail = rows.slice(MAX_SLICES);
  if (tail.length) head.push({ key: '__other', name: otherLabel, visits: tail.reduce((s, r) => s + r.visits, 0), amount: tail.reduce((s, r) => s + r.amount, 0), color: OTHER_COLOR });
  return head;
}

/** "Thống kê" tab: week / month / year summary cards + spend chart + donuts for sessions, drinks, shops. */
export default function CafeStatsView({ items, loading }) {
  const { t } = useI18n();
  const chart = useChartTheme();
  const [range, setRange] = useSessionState('cafe.stats.range', 'month');
  const [anchorTs, setAnchorTs] = useSessionState('cafe.stats.anchor', () => Date.now());

  const period = useMemo(() => getPeriod(range, anchorTs), [range, anchorTs]);
  const { start, end } = period;
  const isCurrent = useMemo(() => {
    const now = Date.now();
    return now >= start.getTime() && now <= end.getTime();
  }, [start, end]);

  const label = useMemo(() => {
    if (range === 'week') return `${formatDateShort(start)} – ${formatDateShort(end)}/${end.getFullYear()}`;
    if (range === 'month') return formatMonthYear(start);
    return t('stats.yearLabel', { year: start.getFullYear() });
  }, [range, start, end, t]);

  const inPeriod = useMemo(() => items.filter((it) => it.tx.date >= start && it.tx.date <= end), [items, start, end]);

  const summary = useMemo(() => {
    const total = inPeriod.reduce((s, it) => s + it.tx.amount, 0);
    const days = new Set(inPeriod.map((it) => new Date(it.tx.date).toDateString())).size;
    return { total, count: inPeriod.length, avg: inPeriod.length ? Math.round(total / inPeriod.length) : 0, days };
  }, [inPeriod]);

  // Spend per day (week / month) or per month (year).
  const series = useMemo(() => {
    if (range === 'year') {
      const buckets = Array.from({ length: 12 }, (_, m) => ({ label: String(m + 1), full: formatMonthYear(new Date(start.getFullYear(), m, 1)), amount: 0, visits: 0 }));
      inPeriod.forEach((it) => {
        const b = buckets[new Date(it.tx.date).getMonth()];
        b.amount += it.tx.amount;
        b.visits += 1;
      });
      return buckets;
    }
    const n = Math.round((end - start) / 86400000);
    const buckets = Array.from({ length: n }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      return { label: range === 'week' ? formatDateShort(d) : String(d.getDate()), full: formatDate(d), amount: 0, visits: 0 };
    });
    inPeriod.forEach((it) => {
      const d = new Date(it.tx.date);
      const idx = Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - start) / 86400000);
      if (buckets[idx]) {
        buckets[idx].amount += it.tx.amount;
        buckets[idx].visits += 1;
      }
    });
    return buckets;
  }, [inPeriod, range, start, end]);

  const sessionRows = useMemo(
    () => aggregate(inPeriod, (it) => getSession(it.tx.date), (k) => t(`cafe.session.${k}`), (k) => SESSION_COLORS[k], t('common.other')).sort((a, b) => SESSIONS.indexOf(a.key) - SESSIONS.indexOf(b.key)),
    [inPeriod, t],
  );
  const drinkRows = useMemo(
    () => aggregate(inPeriod, (it) => it.log?.drinkId || '', (k, it) => it.drink?.name || t('cafe.unspecified'), (k, i) => (k ? CHART_PALETTE[i % CHART_PALETTE.length] : OTHER_COLOR), t('common.other')),
    [inPeriod, t],
  );
  const shopRows = useMemo(
    () => aggregate(inPeriod, (it) => it.log?.shopId || '', (k, it) => it.shop?.name || t('cafe.unspecified'), (k, i) => (k ? CHART_PALETTE[i % CHART_PALETTE.length] : OTHER_COLOR), t('common.other')),
    [inPeriod, t],
  );

  const topShop = shopRows.find((r) => r.key && r.key !== '__other');
  const topDrink = drinkRows.find((r) => r.key && r.key !== '__other');

  if (loading) {
    return (
      <div className="space-y-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="space-y-3">
        <div className="flex gap-2" role="group" aria-label={t('stats.rangeLabel')}>
          {RANGES.map((id) => (
            <Chip key={id} selected={range === id} onClick={() => setRange(id)}>
              {t(`cafe.range.${id}`)}
            </Chip>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface-container p-1">
          <IconButton icon="chevron_left" label={t('stats.prev')} variant="tonal" onClick={() => setAnchorTs((ts) => shiftAnchor(range, ts, -1))} />
          <button onClick={() => setAnchorTs(Date.now())} disabled={isCurrent} className="state-layer flex min-w-0 flex-col items-center rounded-lg px-4 py-1 disabled:pointer-events-none">
            <span className="wrap-any text-title-sm font-bold text-on-surface">{label}</span>
            {!isCurrent && <span className="text-label-sm text-primary">{t('stats.backToCurrent')}</span>}
          </button>
          <IconButton icon="chevron_right" label={t('stats.next')} variant="tonal" onClick={() => setAnchorTs((ts) => shiftAnchor(range, ts, 1))} disabled={isCurrent} />
        </div>
      </div>

      <section className="animate-fade-in grid grid-cols-2 gap-2 rounded-2xl bg-surface-container-low p-3 sm:gap-3 sm:p-4 lg:grid-cols-4">
        <StatCard icon="payments" label={t('cafe.statTotal')} value={formatMoney(summary.total)} />
        <StatCard icon="local_cafe" label={t('cafe.statCount')} value={summary.count} hint={t('cafe.statDays', { n: summary.days })} />
        <StatCard icon="trending_up" label={t('cafe.statAvg')} value={formatMoney(summary.avg)} />
        <StatCard icon="storefront" label={t('cafe.statTopShop')} value={topShop?.name || '—'} hint={topShop ? t('cafe.visits', { n: topShop.visits }) : undefined} />
      </section>

      {inPeriod.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-low">
          <EmptyState icon="bar_chart" text={t('cafe.statsEmpty')} />
        </div>
      ) : (
        <>
          <ChartCard title={t('cafe.chartSpend')} subtitle={range === 'year' ? t('cafe.chartByMonth') : t('cafe.chartByDay')}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke={chart.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={chart.tick} axisLine={false} tickLine={false} interval={range === 'month' ? 'preserveStartEnd' : 0} />
                <YAxis tick={chart.tick} axisLine={false} tickLine={false} tickFormatter={formatCompactMoney} width={52} />
                <Tooltip {...chart.tooltip} cursor={chart.cursor} labelFormatter={(_, p) => p?.[0]?.payload?.full} formatter={(v, n, { payload }) => [`${formatMoney(v)} · ${t('cafe.visits', { n: payload.visits })}`, t('cafe.statTotal')]} />
                <Bar dataKey="amount" fill={chart.primary} radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartCard title={t('cafe.chartSessions')} subtitle={t('cafe.chartSessionsHint')}>
              <VisitsPie rows={sessionRows} chart={chart} t={t} />
            </ChartCard>
            <ChartCard title={t('cafe.chartDrinks')} subtitle={topDrink ? t('cafe.topDrink', { name: topDrink.name }) : undefined}>
              <VisitsPie rows={drinkRows} chart={chart} t={t} />
            </ChartCard>
            <ChartCard title={t('cafe.chartShops')} subtitle={topShop ? t('cafe.topShop', { name: topShop.name }) : undefined}>
              <VisitsPie rows={shopRows} chart={chart} t={t} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
