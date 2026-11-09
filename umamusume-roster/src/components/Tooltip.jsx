import { useLayoutEffect, useRef, useState, useId } from 'react';
import { createPortal } from 'react-dom';

export default function Tooltip({ label, children, side = 'top', className = '' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const host = useRef(null);
  const tip = useRef(null);
  const id = useId();

  useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    if (!host.current || !tip.current) return;
    const r = host.current.getBoundingClientRect();
    const t = tip.current.getBoundingClientRect();
    let up = side === 'top';
    if (up && r.top - t.height - 10 < 0) up = false;
    else if (!up && r.bottom + t.height + 10 > innerHeight && r.top - t.height - 10 > 0) up = true;
    const left = Math.max(8, Math.min(r.left + r.width / 2 - t.width / 2, innerWidth - t.width - 8));
    setPos({ left, top: up ? r.top - t.height - 9 : r.bottom + 9, up, ax: r.left + r.width / 2 - left });
  }, [open, label, side]);

  useLayoutEffect(() => {
    if (!open) return;
    const hide = () => setOpen(false);
    addEventListener('scroll', hide, true);
    addEventListener('resize', hide);
    return () => { removeEventListener('scroll', hide, true); removeEventListener('resize', hide); };
  }, [open]);

  return (
    <span
      ref={host}
      className={`inline-flex ${className}`}
      aria-describedby={open ? id : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onPointerDown={() => setOpen(false)}
    >
      {children}
      {open && createPortal(
        <div
          ref={tip}
          id={id}
          role="tooltip"
          className="pointer-events-none fixed z-[200] max-w-[16rem] rounded-lg bg-ink px-2.5 py-1.5 text-xs font-semibold text-bg shadow-xl"
          style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? 'visible' : 'hidden' }}
        >
          {label}
          {pos && (
            <span
              className="absolute size-2 rotate-45 bg-ink"
              style={{ left: pos.ax - 4, [pos.up ? 'bottom' : 'top']: -3 }}
            />
          )}
        </div>,
        document.body
      )}
    </span>
  );
}
