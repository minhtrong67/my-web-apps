import { useState } from 'react';
import { notify } from '../utils/notify';
import { useT } from '../i18n';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import CafeThumb from './CafeThumb';

/**
 * Manual ordering of shops / drinks with up / down buttons. Nothing is saved until "Done".
 * items: [{ id, name, imageUrl }]; onSave(ids) persists the new order.
 */
export default function CafeReorderList({ items, icon, onSave, onCancel }) {
  const t = useT();
  const [ids, setIds] = useState(() => items.map((i) => i.id));
  const [saving, setSaving] = useState(false);
  const byId = new Map(items.map((i) => [i.id, i]));
  const changed = ids.some((id, i) => id !== items[i]?.id);

  function move(index, dir) {
    const to = index + dir;
    if (to < 0 || to >= ids.length) return;
    setIds((cur) => {
      const next = [...cur];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }

  async function save() {
    if (!changed) return onCancel();
    setSaving(true);
    try {
      await onSave(ids);
      onCancel();
    } catch {
      notify.error(t('cafe.reorderError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-secondary-container px-4 py-3 text-on-secondary-container">
        <p className="text-body-md">{t('cafe.reorderHint')}</p>
        <div className="flex shrink-0 gap-2">
          <Button variant="text" size="sm" onClick={onCancel} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button size="sm" icon="check" onClick={save} loading={saving}>
            {t('cafe.reorderDone')}
          </Button>
        </div>
      </div>
      <ol className="space-y-2">
        {ids.map((id, i) => {
          const it = byId.get(id);
          return (
            <li key={id} className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-3">
              <span className="w-6 text-center text-label-lg font-bold tabular-nums text-on-surface-variant">{i + 1}</span>
              <CafeThumb src={it.imageUrl} icon={icon} size={44} />
              <p className="wrap-any min-w-0 flex-1 text-title-sm text-on-surface">{it.name}</p>
              <IconButton icon="arrow_upward" label={t('cafe.moveUp')} variant="tonal" disabled={i === 0} onClick={() => move(i, -1)} />
              <IconButton icon="arrow_downward" label={t('cafe.moveDown')} variant="tonal" disabled={i === ids.length - 1} onClick={() => move(i, 1)} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
