import { useMemo, useState } from 'react';
import { notify } from '../utils/notify';
import TextInput from '../components/ui/TextInput';
import Fab from '../components/ui/Fab';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import SwipeableItem, { ItemActions } from '../components/ui/SwipeableItem';
import { TableSkeleton } from '../components/ui/Skeleton';
import CafeThumb from '../components/CafeThumb';
import CafeDrinkFormModal from '../components/CafeDrinkFormModal';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../i18n';
import { useSessionState } from '../hooks/useSessionState';
import { normalizeText } from '../utils/cafe';

export default function CafeDrinksPage() {
  const { t, locale } = useI18n();
  const { cafeDrinks, cafeLogs, deleteCafeDrink, cafeLoading } = useData();
  const [search, setSearch] = useSessionState('cafeDrinks.search', '');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const list = useMemo(() => {
    const q = normalizeText(search);
    return cafeDrinks.filter((d) => !q || normalizeText(d.name).includes(q)).sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [cafeDrinks, search, locale]);

  const usage = useMemo(() => {
    const m = new Map();
    cafeLogs.forEach((l) => l.drinkId && m.set(l.drinkId, (m.get(l.drinkId) || 0) + 1));
    return m;
  }, [cafeLogs]);

  function openForm(drink = null) {
    setEditing(drink);
    setFormOpen(true);
  }

  async function handleDelete() {
    const used = usage.get(deleteTarget.id) || 0;
    if (used > 0) {
      notify.warning(t('cafe.drinkInUse', { n: used }));
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await deleteCafeDrink(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      notify.error(t('cafe.deleteError'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <TextInput icon="search" label={t('cafe.drinkSearch')} value={search} onChange={(e) => setSearch(e.target.value)} />

      {cafeLoading ? (
        <TableSkeleton />
      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-low">
          {search.trim() ? (
            <EmptyState icon="search_off" text={t('cafe.noMatch', { q: search.trim() })} action={{ label: t('common.clearSearch'), onClick: () => setSearch('') }} />
          ) : (
            <EmptyState icon="local_cafe" text={t('cafe.drinkEmpty')} action={{ label: t('cafe.drinkAdd'), onClick: () => openForm() }} />
          )}
        </div>
      ) : (
        <>
          <p className="px-1 text-body-sm text-on-surface-variant">{t('common.swipeHint')}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((d, idx) => (
              <SwipeableItem key={d.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }} onEdit={() => openForm(d)} onDelete={() => setDeleteTarget(d)}>
                <div className="flex items-start gap-3 rounded-2xl bg-surface-container-low p-4 transition-colors duration-200 hover:bg-surface-container">
                  <CafeThumb src={d.imageUrl} icon="local_cafe" size={64} />
                  <div className="min-w-0 flex-1">
                    <p className="wrap-any text-title-sm text-on-surface">{d.name}</p>
                    {d.description && <p className="wrap-any line-clamp-2 text-body-sm text-on-surface-variant">{d.description}</p>}
                    <p className="mt-1 text-label-md text-on-surface-variant">{t('cafe.drinkUsage', { n: usage.get(d.id) || 0 })}</p>
                  </div>
                  <ItemActions onEdit={() => openForm(d)} onDelete={() => setDeleteTarget(d)} />
                </div>
              </SwipeableItem>
            ))}
          </div>
        </>
      )}

      <Fab label={t('cafe.drinkAdd')} onClick={() => openForm()} />

      <CafeDrinkFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
      />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message={t('cafe.drinkConfirmDelete', { name: deleteTarget?.name || '' })} />
    </div>
  );
}
