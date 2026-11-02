import { useMemo } from 'react';
import { ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import Icon from './ui/Icon';
import IconButton from './ui/IconButton';
import Chip from './ui/Chip';
import EmptyState from './ui/EmptyState';
import { ChartSkeleton } from './ui/Skeleton';
import { useI18n } from '../i18n';
import { useSessionState } from '../hooks/useSessionState';
import { useChartTheme } from '../hooks/useChartTheme';
import { formatMoney, formatDateShort, formatMonthYear } from '../utils/format';
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

function StatCard({ icon, label, value, hint, tone }) {
  return (
    <div className={`min-w-0 rounded-xl p-3 sm:p-4 ${tone}`}>
      <p className="flex items-center gap-1 text-label-md opacity-80">
        <Icon name={icon} size={13} /> {label}
      </p>
      <p className="mt-1.5 wrap-any text-title-md font-bold tabular-nums leading-tight sm:text-title-lg">{value}</p>
      {hint && <p className="wrap-any mt-0.5 text-body-sm opacity-80">{hint}</p>}
    </div>
  );
}

/**
 * Donut + progress bars. `valueKey`: 'visits' (how often) or 'amount' (how much money).
 * rows: [{ name, visits, amount, color }]
 */
function PieWithBars({ rows, valueKey, chart, t }) {
  const total = rows.reduce((s, r) => s + r[valueKey], 0);
  if (rows.length === 0 || total === 0) return <EmptyState icon="donut_large" text={t('common.noData')} />;
  const data = rows.map((r) => ({ ...r, pct: Math.round((r[valueKey] / total) * 100) }));
  return (
    <>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey={valueKey} nameKey="name" innerRadius={55} outerRadius={92} paddingAngle={2} stroke="none" isAnimationActive={false} label={({ pct }) => (pct >= 5 ? `${pct}%` : '')} labelLine={false} style={{ fontSize: 11, fontWeight: 600 }}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip {...chart.tooltip} formatter={(v, n, { payload }) => [`${t('cafe.visits', { n: payload.visits })} · ${formatMoney(payload.amount)} (${payload.pct}%)`, payload.name]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-3 space-y-3 border-t border-outline-variant pt-4">
        {data.map((d) => (
          <li key={d.key}>
            <div className="mb-1 flex items-center justify-between gap-2 text-body-sm">
              <span className="flex min-w-0 items-center gap-2 text-on-surface">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="wrap-any">{d.name}</span>
              </span>
              <span className="shrink-0 tabular-nums text-on-surface-variant">
                {valueKey === 'amount' ? formatMoney(d.amount) : t('cafe.visits', { n: d.visits })} · {d.pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest" role="progressbar" aria-label={d.name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={d.pct}>
              <div className="h-full rounded-full transition-[width] duration-500 ease-emphasized" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
            </div>
          </li>
        ))}
      </ul>
    </>
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

  const sessionRows = useMemo(
    () => aggregate(inPeriod, (it) => getSession(it.tx.date), (k) => t(`cafe.session.${k}`), (k) => SESSION_COLORS[k], t('common.other')).sort((a, b) => SESSIONS.indexOf(a.key) - SESSIONS.indexOf(b.key)),
    [inPeriod, t],
  );
  const drinkRows = useMemo(
    () => aggregate(inPeriod, (it) => it.log?.drinkId || '', (k, it) => it.drink?.name || t('cafe.unspecified'), (k, i) => (k ? CHART_PALETTE[i % CHART_PALETTE.length] : OTHER_COLOR), t('common.other')),
    [inPeriod, t],
  );
  const drinkSpendRows = useMemo(() => [...drinkRows].sort((a, b) => b.amount - a.amount), [drinkRows]);
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
        <div className="grid grid-cols-3 gap-2 text-center" role="group" aria-label={t('stats.rangeLabel')}>
          {RANGES.map((id) => (
            <Chip className='text-center flex items-center justify-center' key={id} selected={range === id} onClick={() => setRange(id)}>
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
        <StatCard tone="bg-expense-container text-on-expense-container" icon="payments" label={t('cafe.statTotal')} value={formatMoney(summary.total)} />
        <StatCard tone="bg-primary-container text-on-primary-container" icon="local_cafe" label={t('cafe.statCount')} value={summary.count} hint={t('cafe.statDays', { n: summary.days })} />
        <StatCard tone="bg-tertiary-container text-on-tertiary-container" icon="trending_up" label={t('cafe.statAvg')} value={formatMoney(summary.avg)} />
        <StatCard tone="bg-secondary-container text-on-secondary-container" icon="storefront" label={t('cafe.statTopShop')} value={topShop?.name || '—'} hint={topShop ? t('cafe.visits', { n: topShop.visits }) : undefined} />
      </section>

      {inPeriod.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-low">
          <EmptyState icon="bar_chart" text={t('cafe.statsEmpty')} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartCard title={t('cafe.chartSessions')} subtitle={t('cafe.chartSessionsHint')}>
              <PieWithBars rows={sessionRows} valueKey="visits" chart={chart} t={t} />
            </ChartCard>
            <ChartCard title={t('cafe.chartDrinkSpend')} subtitle={t('cafe.chartDrinkSpendHint', { total: formatMoney(summary.total) })}>
              <PieWithBars rows={drinkSpendRows} valueKey="amount" chart={chart} t={t} />
            </ChartCard>
            <ChartCard title={t('cafe.chartDrinks')} subtitle={topDrink ? t('cafe.topDrink', { name: topDrink.name }) : undefined}>
              <PieWithBars rows={drinkRows} valueKey="visits" chart={chart} t={t} />
            </ChartCard>
            <ChartCard title={t('cafe.chartShops')} subtitle={topShop ? t('cafe.topShop', { name: topShop.name }) : undefined}>
              <PieWithBars rows={shopRows} valueKey="visits" chart={chart} t={t} />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
