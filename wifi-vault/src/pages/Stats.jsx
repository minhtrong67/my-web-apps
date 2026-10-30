import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, FileImage, FileText, KeyRound, StickyNote, Tags, Wifi } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useSettings, useT } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { MenuButton, PageHeader, Skeleton, StatCard } from '../components/ui';
import { useMediaQuery } from '../lib/useMediaQuery';
import { exportReport } from '../lib/report';

const RAD = Math.PI / 180;

const ChartCard = ({ title, note, children, className = '' }) => (
  <div className={`card animate-fadeThrough p-4 md:p-5 ${className}`}>
    <h2 className="text-base font-semibold text-on-surface">{title}</h2>
    <p className="mb-3 text-xs text-on-surface-variant">{note}</p>
    {children}
  </div>
);

/** Tooltip riêng để theo đúng màu theme (sáng/tối) */
const Tip = ({ active, payload, unit }) =>
  active && payload?.length ? (
    <div className="rounded-2xl bg-inverse-surface px-3 py-2 text-sm text-inverse-on-surface shadow-el2">
      <p className="font-medium">{payload[0].payload.name}</p>
      <p className="opacity-80">{payload[0].value} {unit}</p>
    </div>
  ) : null;

/** Số lượng hiển thị ngay trong lát cắt của biểu đồ tròn (ẩn nếu lát quá nhỏ) */
const sliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) / 2;
  return <text x={cx + r * Math.cos(-midAngle * RAD)} y={cy + r * Math.sin(-midAngle * RAD)} fill="#fff" fontSize={11} fontWeight={700} textAnchor="middle" dominantBaseline="central">{value}</text>;
};

/** Trang thống kê: thẻ số liệu + biểu đồ tròn số wifi theo danh mục + xuất báo cáo PDF/PNG */
export default function Stats() {
  const { wifis, categories, loading, colorOf } = useData();
  const { t, lang } = useT();
  const { colors, lightColors } = useSettings();
  const toast = useToast();
  const mobile = useMediaQuery('(max-width: 640px)');
  const [exporting, setExporting] = useState(false);

  const s = useMemo(() => {
    if (!wifis) return null;
    const byCat = Object.entries(wifis.reduce((m, w) => ((m[w.category] = (m[w.category] || 0) + 1), m), {}))
      .map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, lang));
    const avg = wifis.length ? (wifis.reduce((a, w) => a + w.password.length, 0) / wifis.length).toFixed(1) : '0';
    return { byCat, avg, withNote: wifis.filter((w) => w.note).length };
  }, [wifis, lang]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const total = wifis.length;

  const runExport = async (format) => {
    setExporting(true);
    try {
      await exportReport({ format, s, total, categoriesCount: categories.length, colors: lightColors, t, lang, colorOf });
      toast.success(t('stats.export.done', { fmt: format.toUpperCase() }));
    } catch (e) {
      console.error(e);
      toast.error(t('stats.export.fail'));
    } finally { setExporting(false); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title={t('stats.title')} subtitle={t('stats.subtitle')}>
        <MenuButton label={exporting ? t('stats.export.busy') : t('stats.export')} icon={Download} loading={exporting} disabled={total === 0}
          items={[
            { key: 'pdf', label: t('stats.export.pdf'), icon: FileText, onClick: () => runExport('pdf') },
            { key: 'png', label: t('stats.export.png'), icon: FileImage, onClick: () => runExport('png') },
          ]} />
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Wifi} label={t('stats.total')} value={total} tone="primary" />
        <StatCard icon={Tags} label={t('stats.categories')} value={categories.length} tone="secondary" />
        <StatCard icon={KeyRound} label={t('stats.avgLen')} value={t('stats.chars', { n: s.avg })} tone="tertiary" />
        <StatCard icon={StickyNote} label={t('stats.withNote')} value={s.withNote} tone="neutral" />
      </div>
      {total === 0 ? (
        <div className="card p-10 text-center text-sm text-on-surface-variant">{t('stats.empty')}</div>
      ) : (
        <ChartCard title={t('stats.ratioTitle')} note={t('stats.ratioNote')}>
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="relative">
              <ResponsiveContainer width="100%" height={mobile ? 240 : 300}>
                <PieChart>
                  <Pie data={s.byCat} dataKey="value" nameKey="name" innerRadius="52%" outerRadius="96%" paddingAngle={3} cornerRadius={8} stroke="none" label={sliceLabel} labelLine={false} animationDuration={700}>
                    {s.byCat.map((c) => <Cell key={c.name} fill={colorOf(c.name).hex} />)}
                  </Pie>
                  <Tooltip content={<Tip unit={t('common.wifiUnit')} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div><p className="text-3xl font-bold leading-none text-on-surface">{total}</p><p className="mt-1 text-xs text-on-surface-variant">{t('common.wifiUnit')}</p></div>
              </div>
            </div>
            <ul className="grid gap-1.5 text-sm">
              {s.byCat.map((c) => (
                <li key={c.name} className="flex items-center gap-2.5 rounded-2xl bg-surface-container px-3 py-2">
                  <span className="size-3 shrink-0 rounded-full" style={{ background: colorOf(c.name).hex }} />
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="shrink-0 font-semibold">{c.value}</span>
                  <span className="w-10 shrink-0 text-right text-on-surface-variant">{Math.round((c.value / total) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
