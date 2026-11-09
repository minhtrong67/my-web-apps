import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useSettings } from '../lib/settings';
import { IconButton, Button } from './ui';

let locks = 0;
function usePresence(open, ms = 220) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) { setMounted(true); return; }
    const timer = setTimeout(() => setMounted(false), ms);
    return () => clearTimeout(timer);
  }, [open, ms]);
  return open || mounted;
}

function useDialogBehavior(open, panelRef) {
  useEffect(() => {
    if (!open) return;
    locks++;
    document.documentElement.classList.add('locked');
    const prev = document.activeElement;
    const raf = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      locks--;
      if (!locks) document.documentElement.classList.remove('locked');
      if (prev && prev.isConnected) prev.focus();
    };
  }, [open, panelRef]);
}

function trapKeys(e, onClose, panel) {
  if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
  if (e.key !== 'Tab') return;
  const f = [...panel.querySelectorAll('button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"]), [role="combobox"]')].filter((el) => el.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function Header({ icon: Icon, title, id, onClose }) {
  const { t } = useSettings();
  return (
    <div className="flex items-center gap-3 border-b border-line px-5 py-4">
      {Icon && <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-pc text-accent"><Icon className="size-5" aria-hidden /></span>}
      <h2 id={id} className="min-w-0 flex-1 truncate text-lg font-extrabold">{title}</h2>
      <IconButton icon={X} label={t('close')} onClick={onClose} />
    </div>
  );
}

export function Modal({ open, onClose, title, icon, children, footer, size = 'md' }) {
  const mounted = usePresence(open);
  const panel = useRef(null);
  const id = useId();
  useDialogBehavior(open, panel);
  if (!mounted) return null;
  const state = open ? 'open' : 'closed';
  const width = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size];
  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
      <div className="backdrop absolute inset-0" data-state={state} onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        data-state={state}
        onKeyDown={(e) => trapKeys(e, onClose, panel.current)}
        className={`modal relative flex max-h-[min(92dvh,46rem)] w-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl outline-none focus-visible:outline-none ${width}`}
      >
        <Header icon={icon} title={title} id={id} onClose={onClose} />
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-surface-2 px-5 py-3.5">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function Sheet({ open, onClose, title, icon, children, footer }) {
  const mounted = usePresence(open, 240);
  const panel = useRef(null);
  const id = useId();
  useDialogBehavior(open, panel);
  if (!mounted) return null;
  const state = open ? 'open' : 'closed';
  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div className="backdrop absolute inset-0" data-state={state} onClick={onClose} />
      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        data-state={state}
        onKeyDown={(e) => trapKeys(e, onClose, panel.current)}
        className="sheet absolute inset-y-0 right-0 flex w-[min(26rem,100vw)] flex-col border-l border-line bg-surface shadow-2xl outline-none focus-visible:outline-none"
      >
        <Header icon={icon} title={title} id={id} onClose={onClose} />
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-surface-2 px-5 py-3.5">{footer}</div>}
      </aside>
    </div>,
    document.body
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel, confirmIcon, variant = 'danger', icon }) {
  const { t } = useSettings();
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      icon={icon}
      footer={
        <>
          <Button variant="neutral" icon={X} onClick={onClose}>{t('cancel')}</Button>
          <Button variant={variant} icon={confirmIcon} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-ink-2">{message}</p>
    </Modal>
  );
}
