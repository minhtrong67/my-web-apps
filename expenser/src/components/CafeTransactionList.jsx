import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { notify } from '../utils/notify';
import Icon from './ui/Icon';
import Button from './ui/Button';
import TextInput from './ui/TextInput';
import SelectField from './ui/SelectField';
import ConfirmDialog from './ui/ConfirmDialog';
import EmptyState from './ui/EmptyState';
import IconButton from './ui/IconButton';
import CafeImageViewer from './CafeImageViewer';
import TransactionFormModal from './TransactionFormModal';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../i18n';
import { useSessionState } from '../hooks/useSessionState';
import { formatMoney, formatDate, formatTime, parseLocalDate, parseLocalDateEnd } from '../utils/format';
import { normalizeText, getSession, SESSIONS, SESSION_COLORS } from '../utils/cafe';

function Badge({ icon, color, children, muted }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-label-sm font-medium ${muted ? 'border border-dashed border-outline-variant text-on-surface-variant' : ''}`}
      style={muted ? undefined : { backgroundColor: `${color}26`, color }}
    >
      <Icon name={icon} size={13} />
      <span className="wrap-any">{children}</span>
    </span>
  );
}

const PAGE = 24;

const defaultFilters = () => ({ search: '', shopId: 'all', drinkId: 'all', session: 'all', dateFrom: '', dateTo: '', sort: 'desc' });

/** "Giao dịch" tab of the cafe page: filterable, searchable list of cafe transactions grouped by day. */
export default function CafeTransactionList({ items, loading, cafeCategoryId, onAdd }) {
  const { t } = useI18n();
  const { cafeShops, cafeDrinks, deleteTransaction } = useData();
  const [filters, setFiltersRaw] = useSessionState('cafe.filters', defaultFilters);
  const [filtersOpen, setFiltersOpen] = useSessionState('cafe.filtersOpen', false);
  const [limit, setLimit] = useState(PAGE);
  const [editingTx, setEditingTx] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewer, setViewer] = useState(null);

  const setFilters = useCallback(
    (updater) => {
      setFiltersRaw(updater);
      setLimit(PAGE);
    },
    [setFiltersRaw],
  );
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const defaults = defaultFilters();
  const activeCount = Object.keys(defaults).filter((k) => filters[k] !== defaults[k]).length;

  const filtered = useMemo(() => {
    const from = filters.dateFrom ? parseLocalDate(filters.dateFrom) : null;
    const to = filters.dateTo ? parseLocalDateEnd(filters.dateTo) : null;
    const q = normalizeText(filters.search);
    const list = items.filter((it) => {
      if (filters.shopId === 'none' ? it.shop : filters.shopId !== 'all' && it.log?.shopId !== filters.shopId) return false;
      if (filters.drinkId === 'none' ? it.drink : filters.drinkId !== 'all' && it.log?.drinkId !== filters.drinkId) return false;
      if (filters.session !== 'all' && getSession(it.tx.date) !== filters.session) return false;
      if (from && it.tx.date < from) return false;
      if (to && it.tx.date > to) return false;
      if (q && !normalizeText(`${it.tx.note || ''} ${it.shop?.name || ''} ${it.drink?.name || ''} ${it.shop?.address || ''}`).includes(q)) return false;
      return true;
    });
    return list.sort((a, b) => (filters.sort === 'asc' ? a.tx.date - b.tx.date : b.tx.date - a.tx.date));
  }, [items, filters]);

  const total = useMemo(() => filtered.reduce((s, it) => s + it.tx.amount, 0), [filtered]);

  const visible = useMemo(() => filtered.slice(0, limit), [filtered, limit]);
  const hasMore = filtered.length > limit;
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!hasMore || !el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && setLimit((l) => l + PAGE), { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, visible.length]);

  const shopOptions = useMemo(
    () => cafeShops.map((s) => ({ value: s.id, label: s.name })),
    [cafeShops],
  );
  const drinkOptions = useMemo(
    () => cafeDrinks.map((d) => ({ value: d.id, label: d.name })),
    [cafeDrinks],
  );

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTransaction(deleteTarget);
      setDeleteTarget(null);
    } catch {
      notify.error(t('tx.deleteError'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="overflow-hidden rounded-2xl bg-surface-container-low">
        <div className="flex items-center gap-1 pr-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            aria-controls="cafe-filters-panel"
            className="state-layer flex h-14 min-w-0 flex-1 items-center gap-3 px-4 text-left"
          >
            <Icon name="tune" size={20} className="text-on-surface-variant" />
            <span className="text-title-sm text-on-surface">{t('filters.title')}</span>
            {activeCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-label-sm font-bold text-on-primary">{activeCount}</span>}
            <Icon name="expand_more" size={22} className={`ml-auto text-on-surface-variant transition-transform duration-300 ease-emphasized ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>
          {activeCount > 0 && (
            <Button variant="text" size="sm" icon="filter_alt_off" onClick={() => setFilters(defaultFilters())} className="shrink-0">
              {t('filters.resetShort')}
            </Button>
          )}
        </div>
        <div id="cafe-filters-panel" className={`grid transition-[grid-template-rows] duration-300 ease-emphasized ${filtersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="min-h-0 overflow-hidden">
            <div className={`flex flex-col gap-3 px-4 pb-4 pt-1 transition-opacity duration-300 ${filtersOpen ? 'opacity-100' : 'opacity-0'}`} inert={!filtersOpen}>
              <TextInput
                icon="search"
                label={t('cafe.filterSearch')}
                value={filters.search}
                onChange={(e) => set({ search: e.target.value })}
                trailing={
                  filters.search && (
                    <button type="button" onClick={() => set({ search: '' })} aria-label={t('common.clear')} className="state-layer flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant">
                      <Icon name="close" size={18} />
                    </button>
                  )
                }
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SelectField
                  label={t('cafe.shop')}
                  value={filters.shopId}
                  onChange={(e) => set({ shopId: e.target.value })}
                  options={[{ value: 'all', label: t('cafe.allShops') }, { value: 'none', label: t('cafe.unspecified') }, ...shopOptions]}
                />
                <SelectField
                  label={t('cafe.drink')}
                  value={filters.drinkId}
                  onChange={(e) => set({ drinkId: e.target.value })}
                  options={[{ value: 'all', label: t('cafe.allDrinks') }, { value: 'none', label: t('cafe.unspecified') }, ...drinkOptions]}
                />
                <SelectField
                  label={t('cafe.session')}
                  value={filters.session}
                  onChange={(e) => set({ session: e.target.value })}
                  options={[{ value: 'all', label: t('cafe.allSessions') }, ...SESSIONS.map((s) => ({ value: s, label: t(`cafe.session.${s}`) }))]}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SelectField label={t('filters.sort')} value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
                  <option value="desc">{t('tx.sortNewest')}</option>
                  <option value="asc">{t('tx.sortOldest')}</option>
                </SelectField>
                <TextInput type="date" label={t('filters.from')} value={filters.dateFrom} onChange={(e) => set({ dateFrom: e.target.value })} />
                <TextInput type="date" label={t('filters.to')} value={filters.dateTo} onChange={(e) => set({ dateTo: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <Button variant="tonal" size="sm" icon="restart_alt" onClick={() => setFilters(defaultFilters())} disabled={activeCount === 0}>
                  {t('filters.reset')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-surface-container-low">
              <div className="skeleton aspect-video w-full" />
              <div className="space-y-2 p-4">
                <div className="skeleton h-4 w-2/3 rounded-md" />
                <div className="skeleton h-3 w-1/2 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-low">
          {items.length > 0 ? (
            <EmptyState icon="filter_alt_off" text={t('tx.noMatch')} action={{ label: t('filters.reset'), onClick: () => setFilters(defaultFilters()) }} />
          ) : (
            <EmptyState icon="local_cafe" text={cafeCategoryId ? t('cafe.empty') : t('cafe.noCategory')} action={cafeCategoryId ? { label: t('cafe.addTx'), onClick: onAdd } : undefined} />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="px-1 text-body-sm text-on-surface-variant">
            {t('cafe.momentCount', { n: filtered.length })} · {formatMoney(total)}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map(({ tx, shop, drink, log, wallet }, idx) => {
              const photo = log?.imageUrl || drink?.imageUrl || shop?.imageUrl;
              const session = getSession(tx.date);
              return (
                <article key={tx.id} className="animate-slide-up overflow-hidden rounded-2xl bg-surface-container-low" style={{ animationDelay: `${Math.min(idx * 30, 240)}ms` }}>
                  {photo ? (
                    <button type="button" onClick={() => setViewer({ src: photo, title: drink?.name || shop?.name || t('cafe.photo') })} aria-label={t('cafe.viewPhoto')} className="group relative block aspect-video w-full cursor-zoom-in overflow-hidden bg-surface-container">
                      <img src={photo} alt={drink?.name || ''} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                    </button>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-secondary-container text-on-secondary-container">
                      <Icon name="local_cafe" size={44} />
                    </div>
                  )}
                  <div className="space-y-2.5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="wrap-any text-title-md text-on-surface">{drink?.name || t('cafe.unspecifiedDrink')}</h3>
                      <span className="shrink-0 text-title-md font-bold tabular-nums text-expense">{formatMoney(tx.amount)}</span>
                    </div>
                    <p className="wrap-any flex items-center gap-1.5 text-body-md text-on-surface-variant">
                      <Icon name="storefront" size={16} />
                      {shop?.name || t('cafe.unspecifiedShop')}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-on-surface-variant">
                      <Icon name="schedule" size={16} />
                      <span>
                        {formatDate(tx.date)} · {formatTime(tx.date)}
                        {wallet ? ` · ${wallet.name}` : ''}
                      </span>
                      <Badge icon="schedule" color={SESSION_COLORS[session]}>{t(`cafe.session.${session}`)}</Badge>
                    </div>
                    {tx.note && <p className="wrap-any text-body-md text-on-surface">{tx.note}</p>}
                  </div>
                </article>
              );
            })}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-4">
              <Button variant="tonal" size="sm" onClick={() => setLimit((l) => l + PAGE)}>
                {t('common.loadMore')}
              </Button>
            </div>
          )}
        </div>
      )}

      <TransactionFormModal open={!!editingTx} onClose={() => setEditingTx(null)} editingTx={editingTx} />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={t('tx.confirmDelete')} />
      <CafeImageViewer src={viewer?.src} title={viewer?.title} onClose={() => setViewer(null)} />
    </div>
  );
}
