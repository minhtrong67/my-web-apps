import { useMemo, useState } from 'react';
import { notify } from '../utils/notify';
import TextInput from '../components/ui/TextInput';
import Fab from '../components/ui/Fab';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import SwipeableItem from '../components/ui/SwipeableItem';
import { TableSkeleton } from '../components/ui/Skeleton';
import CafeShopCard from '../components/CafeShopCard';
import CafeShopFormModal from '../components/CafeShopFormModal';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../i18n';
import { useSessionState } from '../hooks/useSessionState';
import { normalizeText } from '../utils/cafe';

export default function CafeShopsPage() {
  const { t } = useI18n();
  const { cafeShops, reorderCafeShops, cafeLogs, deleteCafeShop, cafeLoading } = useData();
  const [search, setSearch] = useSessionState('cafeShops.search', '');
  const [moving, setMoving] = useState(false);
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

  const canMove = !search.trim(); // order only makes sense on the full list

  async function move(id, dir) {
    const ids = cafeShops.map((x) => x.id);
    const from = ids.indexOf(id);
    const to = from + dir;
    if (from < 0 || to < 0 || to >= ids.length || moving) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    setMoving(true);
    try {
      await reorderCafeShops(ids);
    } catch {
      notify.error(t('cafe.reorderError'));
    } finally {
      setMoving(false);
    }
  }

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
      <TextInput icon="search" label={t('cafe.shopSearch')} value={search} onChange={(e) => setSearch(e.target.value)} />

      {cafeLoading ? (
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
              <SwipeableItem key={s.id} rounded="rounded-3xl" className="animate-slide-up" style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }} onEdit={() => openForm(s)} onDelete={() => setDeleteTarget(s)}>
                <CafeShopCard
                  shop={s}
                  visits={usage.get(s.id) || 0}
                  canMove={canMove && list.length > 1}
                  isFirst={idx === 0}
                  isLast={idx === list.length - 1}
                  busy={moving}
                  onMove={(dir) => move(s.id, dir)}
                  onEdit={() => openForm(s)}
                  onDelete={() => setDeleteTarget(s)}
                />
              </SwipeableItem>
            ))}
          </div>
        </>
      )}

      <Fab label={t('cafe.shopAdd')} onClick={() => openForm()} />

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
