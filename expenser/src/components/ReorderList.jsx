import { useEffect, useRef, useState } from 'react';
import { notify } from '../utils/notify';
import { useT } from '../i18n';
import Button from './ui/Button';
import Icon from './ui/Icon';
import IconButton from './ui/IconButton';

const EDGE = 96; // px from the top / bottom of the screen where dragging auto-scrolls the page
const MAX_SCROLL_SPEED = 18;

/**
 * Manual ordering: drag the handle (mouse or touch) or use the arrow buttons.
 * Nothing is saved until "Done".
 *   items:      [{ id, name, subtitle? }]
 *   renderLead: (item) => node shown before the name (emoji badge, thumbnail ...)
 *   onSave:     (ids) => Promise - persists the new order
 */
export default function ReorderList({ items, renderLead, hint, doneLabel, errorMessage, onSave, onCancel }) {
  const t = useT();
  const [ids, setIds] = useState(() => items.map((i) => i.id));
  const [saving, setSaving] = useState(false);
  const [drag, setDrag] = useState(null); // { id, from, shift, dy, to } while an item is being dragged
  const refs = useRef(new Map()); // id -> <li>
  const info = useRef(null); // measurements taken when a drag starts
  const raf = useRef(0);

  const byId = new Map(items.map((i) => [i.id, i]));
  const visible = ids.filter((id) => byId.has(id)); // an item deleted elsewhere just drops out
  const changed = visible.some((id, i) => id !== items[i]?.id);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  function move(index, dir) {
    const to = index + dir;
    if (to < 0 || to >= visible.length) return;
    setIds(() => {
      const next = [...visible];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }

  // ---- drag & drop (Pointer Events: one code path for mouse, touch and pen) ----
  function computeDrag() {
    const d = info.current;
    if (!d) return;
    const dy = d.clientY + window.scrollY - d.startPageY;
    const r = d.rects[d.from];
    const center = r.top + r.height / 2 + dy;
    let to = 0;
    d.rects.forEach((o, i) => {
      if (i !== d.from && o.top + o.height / 2 < center) to += 1;
    });
    setDrag({ id: d.id, from: d.from, shift: d.shift, dy, to });
  }

  function autoScroll() {
    const d = info.current;
    if (!d) return;
    const topEdge = EDGE + 8; // keep clear of the sticky top bar
    const bottomEdge = window.innerHeight - EDGE;
    let speed = 0;
    if (d.clientY < topEdge) speed = -Math.ceil(((topEdge - d.clientY) / topEdge) * MAX_SCROLL_SPEED);
    else if (d.clientY > bottomEdge) speed = Math.ceil(((d.clientY - bottomEdge) / EDGE) * MAX_SCROLL_SPEED);
    if (speed) {
      window.scrollBy({ top: speed, behavior: 'instant' });
      computeDrag();
    }
    raf.current = requestAnimationFrame(autoScroll);
  }

  function onHandleDown(e, id, index) {
    if (saving || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rects = visible.map((rid) => {
      const r = refs.current.get(rid).getBoundingClientRect();
      return { top: r.top + window.scrollY, height: r.height };
    });
    const gap = rects.length > 1 ? rects[1].top - (rects[0].top + rects[0].height) : 0;
    const shift = rects[index].height + gap; // how far the rows the dragged one passes have to move
    info.current = { id, from: index, shift, rects, startPageY: e.clientY + window.scrollY, clientY: e.clientY };
    setDrag({ id, from: index, shift, dy: 0, to: index });
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(autoScroll);
  }

  function onHandleMove(e) {
    if (!info.current) return;
    info.current.clientY = e.clientY;
    computeDrag();
  }

  function onHandleUp(commit) {
    const d = info.current;
    if (!d) return;
    cancelAnimationFrame(raf.current);
    info.current = null;
    const to = drag?.to ?? d.from;
    setDrag(null);
    if (commit && to !== d.from) {
      setIds(() => {
        const next = [...visible];
        const [moved] = next.splice(d.from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    }
  }

  // Where each row is drawn while dragging: the dragged row follows the pointer, the rows it passes shift to make room.
  function rowStyle(id, index) {
    if (!drag) return undefined;
    if (id === drag.id) return { transform: `translateY(${drag.dy}px) scale(1.02)`, zIndex: 5, transition: 'none' };
    const { from, shift } = drag;
    let y = 0;
    if (from < drag.to && index > from && index <= drag.to) y = -shift;
    else if (from > drag.to && index < from && index >= drag.to) y = shift;
    return { transform: y ? `translateY(${y}px)` : undefined, transition: 'transform 200ms var(--motion-decelerate)' };
  }

  async function save() {
    if (!changed) return onCancel();
    setSaving(true);
    try {
      await onSave(visible);
      onCancel();
    } catch {
      notify.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="sticky z-10 flex items-center justify-between gap-3 rounded-2xl bg-secondary-container px-4 py-3 text-on-secondary-container"
        style={{ top: 'calc(4rem + env(safe-area-inset-top, 0px) + 0.25rem)' }}
      >
        <p className="min-w-0 text-body-md">{hint}</p>
        <div className="flex shrink-0 gap-2">
          <Button variant="text" size="sm" onClick={onCancel} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button size="sm" icon="check" onClick={save} loading={saving}>
            {doneLabel}
          </Button>
        </div>
      </div>

      <ol className="space-y-2">
        {visible.map((id, i) => {
          const it = byId.get(id);
          const dragging = drag?.id === id;
          return (
            <li
              key={id}
              ref={(el) => {
                if (el) refs.current.set(id, el);
                else refs.current.delete(id);
              }}
              style={rowStyle(id, i)}
              className={`flex select-none items-center gap-2 rounded-2xl p-3 sm:gap-3 ${dragging ? 'bg-surface-container-high shadow-elev-3' : 'bg-surface-container-low'}`}
            >
              <button
                type="button"
                aria-label={t('cat.dragHandle')}
                title={t('cat.dragHandle')}
                onPointerDown={(e) => onHandleDown(e, id, i)}
                onPointerMove={onHandleMove}
                onPointerUp={() => onHandleUp(true)}
                onPointerCancel={() => onHandleUp(false)}
                onContextMenu={(e) => e.preventDefault()}
                className={`state-layer flex h-10 w-8 shrink-0 touch-none items-center justify-center rounded-full text-on-surface-variant ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              >
                <Icon name="drag_indicator" size={24} />
              </button>
              <span className="w-5 text-center text-label-lg font-bold tabular-nums text-on-surface-variant">{i + 1}</span>
              {renderLead?.(it)}
              <div className="min-w-0 flex-1">
                <p className="wrap-any text-title-sm text-on-surface">{it.name}</p>
                {it.subtitle && <p className="text-body-sm text-on-surface-variant">{it.subtitle}</p>}
              </div>
              <IconButton icon="arrow_upward" label={t('cafe.moveUp')} variant="tonal" disabled={saving || i === 0} onClick={() => move(i, -1)} />
              <IconButton icon="arrow_downward" label={t('cafe.moveDown')} variant="tonal" disabled={saving || i === visible.length - 1} onClick={() => move(i, 1)} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
