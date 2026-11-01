import { Children, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';
import { usePresence } from '../../hooks/usePresence';

// <option> children -> [{ value, label }] so existing markup keeps working.
function parseOptions(children) {
  const out = [];
  Children.forEach(children, (child) => {
    if (!child || child.type !== 'option') return;
    const label = Children.toArray(child.props.children).join('');
    out.push({ value: String(child.props.value ?? label), label, disabled: !!child.props.disabled });
  });
  return out;
}

const MAX_H = 288;

/**
 * Custom dropdown styled as an outlined M3 field (replaces the browser's native <select> popup, which
 * cannot follow the theme). Same API as before: pass <option> children, or an `options` array of
 * { value, label, style?, hint? }. `onChange` receives `{ target: { value } }`.
 * The list is portalled to <body> so it is never clipped by a scrolling / overflow-hidden parent.
 */
export default function SelectField({ label, value, onChange, children, options: optionsProp, onOpen, className = '' }) {
  const id = useId();
  const listId = `${id}-list`;
  const options = useMemo(() => optionsProp || parseOptions(children), [optionsProp, children]);
  const current = String(value ?? '');
  const selectedIndex = options.findIndex((o) => String(o.value) === current);
  const selected = options[selectedIndex];

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const { present, closing } = usePresence(open, 200);
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const below = vh - r.bottom - 12;
    const above = r.top - 12;
    const wanted = Math.min(MAX_H, options.length * 44 + 12);
    const flip = below < wanted && above > below;
    setPos({
      left: r.left,
      width: r.width,
      top: flip ? undefined : r.bottom + 4,
      bottom: flip ? vh - r.top + 4 : undefined,
      maxHeight: Math.max(120, Math.min(MAX_H, flip ? above : below)),
      flip,
    });
  }, [options.length]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(e) {
      if (triggerRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the highlighted row visible while moving with the keyboard.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, pos]);

  function openList() {
    setActive(Math.max(0, selectedIndex));
    setOpen(true);
    onOpen?.();
  }

  function choose(opt) {
    if (opt.disabled) return;
    onChange?.({ target: { value: opt.value } });
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function onKeyDown(e) {
    const last = options.length - 1;
    if (e.key === 'Escape' && open) {
      e.stopPropagation(); // do not also close a surrounding dialog
      setOpen(false);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) openList();
      else setActive((i) => Math.min(last, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1))));
    } else if (e.key === 'Home' || e.key === 'End') {
      if (open) {
        e.preventDefault();
        setActive(e.key === 'Home' ? 0 : last);
      }
    } else if ((e.key === 'Enter' || e.key === ' ') && open) {
      e.preventDefault();
      if (options[active]) choose(options[active]);
    } else if (e.key === 'Tab' && open) {
      setOpen(false);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      // type-ahead: jump to the next option starting with the typed letter
      const ch = e.key.toLowerCase();
      const from = open ? active + 1 : selectedIndex + 1;
      const idx = [...options.slice(from), ...options.slice(0, from)].findIndex((o) => String(o.label).toLowerCase().startsWith(ch));
      if (idx >= 0) {
        const target = (from + idx) % options.length;
        if (open) setActive(target);
        else choose(options[target]);
      }
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`md-field md-field-floated w-full cursor-pointer text-left ${className}`}
      >
        <span className="relative min-w-0 flex-1">
          <span className="md-label">{label}</span>
          <span className="block truncate pb-1.5 pt-6 text-body-lg text-on-surface" style={selected?.style}>
            {selected?.label ?? '—'}
          </span>
        </span>
        <Icon name="expand_more" className={`text-on-surface-variant transition-transform duration-300 ease-smooth ${open ? 'rotate-180' : ''}`} />
      </button>

      {present &&
        pos &&
        createPortal(
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={id}
            style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
            className={`z-[70] overflow-y-auto overscroll-contain rounded-2xl border border-outline-variant bg-surface-container-high p-1.5 shadow-elev-3 ${
              pos.flip ? 'origin-bottom' : 'origin-top'
            } ${closing ? 'pointer-events-none animate-menu-out' : 'animate-menu-in'}`}
          >
            {options.map((opt, i) => {
              const isSelected = i === selectedIndex;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  data-index={i}
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()} // keep focus on the trigger
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(opt)}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-body-lg transition-colors duration-150 disabled:opacity-40 ${
                    isSelected ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'
                  } ${i === active && !isSelected ? 'bg-surface-container-highest' : ''}`}
                >
                  <span className="min-w-0 flex-1 wrap-any" style={opt.style}>
                    {opt.label}
                  </span>
                  {opt.hint && <span className="shrink-0 text-body-sm text-on-surface-variant">{opt.hint}</span>}
                  {isSelected && <Icon name="check" size={20} className="shrink-0" />}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
