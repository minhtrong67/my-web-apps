import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { notify } from '../utils/notify';
import Icon from './ui/Icon';
import Button from './ui/Button';
import TextInput from './ui/TextInput';
import SelectField from './ui/SelectField';
import ConfirmDialog from './ui/ConfirmDialog';
import EmptyState from './ui/EmptyState';
import SwipeableItem, { ItemActions } from './ui/SwipeableItem';
import { TableSkeleton } from './ui/Skeleton';
import CafeThumb from './CafeThumb';
import CafeImageViewer from './CafeImageViewer';
import TransactionFormModal from './TransactionFormModal';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../i18n';
import { useSessionState } from '../hooks/useSessionState';
import { formatMoney, formatDayHeader, formatTime, dayKey, parseLocalDate, parseLocalDateEnd } from '../utils/format';
import { normalizeText, getSession, SESSIONS } from '../utils/cafe';

const PAGE = 40;

const defaultFilters = () => ({ search: '', shopId: 'all', drinkId: 'all', session: 'all', dateFrom: '', dateTo: '', sort: 'desc' });

/** "Giao dịch" tab of the cafe page: filterable, searchable list of cafe transactions grouped by day. */
export default function CafeTransactionList({ items, loading, cafeCategoryId, onAdd }) {
  const { t, locale } = useI18n();
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

  const groups = useMemo(() => {
    const map = new Map();
    visible.forEach((it) => {
      const key = dayKey(it.tx.date);
      if (!map.has(key)) map.set(key, { key, date: it.tx.date, items: [], sum: 0 });
      const g = map.get(key);
      g.items.push(it);
      g.sum += it.tx.amount;
    });
    return Array.from(map.values());
  }, [visible]);

  const shopOptions = useMemo(
    () => [...cafeShops].sort((a, b) => a.name.localeCompare(b.name, locale)).map((s) => ({ value: s.id, label: s.name })),
    [cafeShops, locale],
  );
  const drinkOptions = useMemo(
    () => [...cafeDrinks].sort((a, b) => a.name.localeCompare(b.name, locale)).map((d) => ({ value: d.id, label: d.name })),
    [cafeDrinks, locale],
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
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-low">
          {items.length > 0 ? (
            <EmptyState icon="filter_alt_off" text={t('tx.noMatch')} action={{ label: t('filters.reset'), onClick: () => setFilters(defaultFilters()) }} />
          ) : (
            <EmptyState icon="local_cafe" text={cafeCategoryId ? t('cafe.empty') : t('cafe.noCategory')} action={cafeCategoryId ? { label: t('cafe.addTx'), onClick: onAdd } : undefined} />
          )}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          <p className="px-1 text-body-sm text-on-surface-variant">
            {t('tx.resultCount', { n: filtered.length })} · {formatMoney(total)} · {t('common.swipeHint')}
          </p>
          {groups.map((group) => (
            <section key={group.key}>
              <div className="mb-2 flex items-center justify-between gap-2 px-1">
                <h3 className="text-label-lg uppercase tracking-wide text-on-surface-variant">{formatDayHeader(group.date)}</h3>
                <span className="text-label-lg font-bold tabular-nums text-expense">-{formatMoney(group.sum)}</span>
              </div>
              <div className="space-y-2">
                {group.items.map(({ tx, shop, drink, log, wallet }) => (
                  <SwipeableItem key={tx.id} rounded="rounded-2xl" className="cv-auto" onEdit={() => setEditingTx(tx)} onDelete={() => setDeleteTarget(tx)}>
                    <div className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-3">
                      {log?.imageUrl ? (
                        <button type="button" onClick={() => setViewer({ src: log.imageUrl, title: drink?.name || shop?.name || t('cafe.photo') })} aria-label={t('cafe.viewPhoto')} className="state-layer shrink-0 rounded-2xl">
                          <CafeThumb src={log.imageUrl} size={56} />
                        </button>
                      ) : (
                        <CafeThumb src={drink?.imageUrl || shop?.imageUrl} icon="local_cafe" size={56} />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="wrap-any text-title-sm text-on-surface">{drink?.name || t('cafe.unspecifiedDrink')}</p>
                        <p className="wrap-any flex items-center gap-1 text-body-sm text-on-surface-variant">
                          <Icon name="storefront" size={14} />
                          {shop?.name || t('cafe.unspecifiedShop')}
                        </p>
                        <p className="wrap-any text-body-sm text-on-surface-variant">
                          {formatTime(tx.date)} · {t(`cafe.session.${getSession(tx.date)}`)} · {wallet?.name || ''}
                        </p>
                        {tx.note && <p className="wrap-any text-body-sm text-on-surface-variant">{tx.note}</p>}
                      </div>
                      <span className="shrink-0 text-title-sm font-bold tabular-nums text-expense">-{formatMoney(tx.amount)}</span>
                      <ItemActions onEdit={() => setEditingTx(tx)} onDelete={() => setDeleteTarget(tx)} />
                    </div>
                  </SwipeableItem>
                ))}
              </div>
            </section>
          ))}
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
