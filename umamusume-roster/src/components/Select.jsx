import { useEffect, useLayoutEffect, useRef, useState, useId } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export default function Select({ value, onChange, options, label, icon: Icon, className = '', maxH = 256 }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(null);
  const btn = useRef(null);
  const list = useRef(null);
  const uid = useId();
  const idx = options.findIndex((o) => o.value === value);
  const current = options[idx];

  const openList = () => { setActive(Math.max(idx, 0)); setOpen(true); };
  const choose = (o) => { onChange(o.value); setOpen(false); btn.current?.focus(); };

  useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    const place = () => {
      const r = btn.current.getBoundingClientRect();
      const want = Math.min(maxH, options.length * 40 + 10);
      const below = innerHeight - r.bottom - 14;
      const up = below < want && r.top > below;
      setPos({ left: r.left, width: r.width, up, y: up ? innerHeight - r.top + 6 : r.bottom + 6, max: Math.max(120, Math.min(maxH, (up ? r.top - 14 : below))) });
    };
    place();
    const onScroll = (e) => { if (!list.current?.contains(e.target)) setOpen(false); };
    addEventListener('resize', place);
    addEventListener('scroll', onScroll, true);
    return () => { removeEventListener('resize', place); removeEventListener('scroll', onScroll, true); };
  }, [open, maxH, options.length]);

  useEffect(() => {
    if (!open) return;
    const down = (e) => { if (!btn.current?.contains(e.target) && !list.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', down);
    return () => document.removeEventListener('pointerdown', down);
  }, [open]);

  useEffect(() => { if (open && pos) list.current?.children[active]?.scrollIntoView({ block: 'nearest' }); }, [active, open, pos]);

  const onKey = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList(); }
      return;
    }
    const last = options.length - 1;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(last, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(last); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(options[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setOpen(false); }
    else if (e.key === 'Tab') setOpen(false);
  };

  return (
    <>
      <button
        ref={btn}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKey}
        className={`flex w-full items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2 text-left text-sm font-medium transition hover:border-primary/60 ${open ? 'border-primary ring-2 ring-primary/30' : ''} ${className}`}
      >
        {Icon && <Icon className="size-4 shrink-0 text-accent" aria-hidden />}
        <span className="min-w-0 flex-1 truncate" style={current?.style}>{current?.label ?? '—'}</span>
        <ChevronDown className={`size-4 shrink-0 text-ink-2 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && createPortal(
        <ul
          ref={list}
          id={`${uid}-list`}
          role="listbox"
          data-state="open"
          className="pop fixed z-[150] overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-2xl"
          style={{ left: pos?.left ?? 0, width: pos?.width, maxHeight: pos?.max ?? maxH, visibility: pos ? 'visible' : 'hidden', ...(pos?.up ? { bottom: pos.y } : { top: pos?.y ?? 0 }) }}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onMouseEnter={() => setActive(i)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => choose(o)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm ${i === active ? 'bg-primary/15' : ''} ${o.value === value ? 'font-bold text-accent' : ''}`}
              style={o.style}
            >
              <span className="min-w-0 flex-1 truncate">{o.label}</span>
              {o.hint != null && <span className="text-xs text-ink-2">{o.hint}</span>}
              {o.value === value && <Check className="size-4 shrink-0" aria-hidden />}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </>
  );
}
