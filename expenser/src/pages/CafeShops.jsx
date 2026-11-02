import { useMemo, useState } from 'react';
import { notify } from '../utils/notify';
import Icon from '../components/ui/Icon';
import TextInput from '../components/ui/TextInput';
import Fab from '../components/ui/Fab';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import SwipeableItem, { ItemActions } from '../components/ui/SwipeableItem';
import { Stars } from '../components/ui/RatingInput';
import { TableSkeleton } from '../components/ui/Skeleton';
import CafeThumb from '../components/CafeThumb';
import CafeReorderList from '../components/CafeReorderList';
import Button from '../components/ui/Button';
import CafeShopFormModal from '../components/CafeShopFormModal';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../i18n';
import { useSessionState } from '../hooks/useSessionState';
import { normalizeText } from '../utils/cafe';

export default function CafeShopsPage() {
  const { t } = useI18n();
  const { cafeShops, reorderCafeShops, cafeLogs, deleteCafeShop, cafeLoading } = useData();
  const [search, setSearch] = useSessionState('cafeShops.search', '');
  const [sorting, setSorting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const list = useMemo(() => {
    const q = normalizeText(search);
    return cafeShops
      .filter((s) => !q || normalizeText(`${s.name} ${s.address || ''}`).includes(q))
      ;
  }, [cafeShops, search]);

  const usage = useMemo(() => {
    const m = new Map();
    cafeLogs.forEach((l) => l.shopId && m.set(l.shopId, (m.get(l.shopId) || 0) + 1));
    return m;
  }, [cafeLogs]);

  function openForm(shop = null) {
    setEditing(shop);
    setFormOpen(true);
  }

  async function handleDelete() {
    const used = usage.get(deleteTarget.id) || 0;
    if (used > 0) {
      notify.warning(t('cafe.shopInUse', { n: used }));
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await deleteCafeShop(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      notify.error(t('cafe.deleteError'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {!sorting && (
        <div className="flex items-start gap-2">
          <TextInput className="min-w-0 flex-1" icon="search" label={t('cafe.shopSearch')} value={search} onChange={(e) => setSearch(e.target.value)} />
          {cafeShops.length > 1 && (
            <Button variant="tonal" icon="swap_vert" onClick={() => setSorting(true)} className="mt-1 shrink-0">
              {t('cafe.reorder')}
            </Button>
          )}
        </div>
      )}

      {sorting ? (
        <CafeReorderList items={cafeShops} icon="storefront" onSave={reorderCafeShops} onCancel={() => setSorting(false)} />
      ) : cafeLoading ? (
        <TableSkeleton />
      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-low">
          {search.trim() ? (
            <EmptyState icon="search_off" text={t('cafe.noMatch', { q: search.trim() })} action={{ label: t('common.clearSearch'), onClick: () => setSearch('') }} />
          ) : (
            <EmptyState icon="storefront" text={t('cafe.shopEmpty')} action={{ label: t('cafe.shopAdd'), onClick: () => openForm() }} />
          )}
        </div>
      ) : (
        <>
          <p className="px-1 text-body-sm text-on-surface-variant">{t('common.swipeHint')}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s, idx) => (
              <SwipeableItem key={s.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }} onEdit={() => openForm(s)} onDelete={() => setDeleteTarget(s)}>
                <div className="flex items-start gap-3 rounded-2xl bg-surface-container-low p-4 transition-colors duration-200 hover:bg-surface-container">
                  <CafeThumb src={s.imageUrl} icon="storefront" size={64} />
                  <div className="min-w-0 flex-1">
                    <p className="wrap-any text-title-sm text-on-surface">{s.name}</p>
                    {s.rating > 0 && <Stars value={s.rating} size={15} />}
                    {s.address && (
                      <p className="wrap-any flex items-start gap-1 text-body-sm text-on-surface-variant">
                        <Icon name="location_on" size={14} className="mt-0.5" />
                        <span>{s.address}</span>
                      </p>
                    )}
                    {s.description && <p className="wrap-any line-clamp-2 text-body-sm text-on-surface-variant">{s.description}</p>}
                    <p className="mt-1 text-label-md text-on-surface-variant">{t('cafe.visits', { n: usage.get(s.id) || 0 })}</p>
                  </div>
                  <ItemActions onEdit={() => openForm(s)} onDelete={() => setDeleteTarget(s)} />
                </div>
              </SwipeableItem>
            ))}
          </div>
        </>
      )}

      {!sorting && <Fab label={t('cafe.shopAdd')} onClick={() => openForm()} />}

      <CafeShopFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
      />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={t('cafe.shopConfirmDelete', { name: deleteTarget?.name || '' })} />
    </div>
  );
}
