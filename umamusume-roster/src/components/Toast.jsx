import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from 'lucide-react';
import { useSettings } from '../lib/settings';
import { IconButton, Button } from './ui';

const V = {
  info: { color: '#0ea5e9', icon: Info },
  success: { color: '#16a34a', icon: CheckCircle2 },
  warning: { color: '#f59e0b', icon: TriangleAlert },
  error: { color: '#ef4444', icon: XCircle }
};

const Ctx = createContext(() => {});
export const useToast = () => ({ toast: useContext(Ctx) });

function Item({ item, onDone }) {
  const { t } = useSettings();
  const [leaving, setLeaving] = useState(false);
  const timer = useRef();
  const left = useRef(item.duration);
  const started = useRef(0);
  const { color, icon: Icon } = V[item.variant] || V.info;

  const close = useCallback(() => { setLeaving(true); setTimeout(() => onDone(item.key), 200); }, [item.key, onDone]);
  const start = useCallback(() => {
    if (!left.current) return;
    started.current = Date.now();
    timer.current = setTimeout(close, left.current);
  }, [close]);
  const pause = () => { clearTimeout(timer.current); if (left.current) left.current -= Date.now() - started.current; };

  useEffect(() => { start(); return () => clearTimeout(timer.current); }, [start]);

  return (
    <div
      role={item.variant === 'error' || item.variant === 'warning' ? 'alert' : 'status'}
      onMouseEnter={pause}
      onMouseLeave={start}
      className={`${leaving ? 'toast-out' : 'toast-in'} pointer-events-auto flex w-full items-start gap-3 rounded-2xl border-l-4 border-y border-r py-3 pl-3 pr-2 shadow-2xl`}
      style={{ borderLeftColor: color, borderColor: `color-mix(in oklab, ${color} 35%, var(--line))`, background: `color-mix(in oklab, ${color} 11%, var(--surface))` }}
    >
      <Icon className="mt-0.5 size-5 shrink-0" style={{ color }} aria-hidden />
      <div className="min-w-0 flex-1 text-sm">
        {item.title && <p className="font-bold">{item.title}</p>}
        <p className={item.title ? 'text-ink-2' : 'font-medium'}>{item.message}</p>
        {item.action && (
          <Button size="sm" variant="info" icon={item.action.icon} className="mt-2" onClick={() => { item.action.onClick(); close(); }}>
            {item.action.label}
          </Button>
        )}
      </div>
      <IconButton icon={X} label={t('close')} onClick={close} className="!size-7" iconClass="!size-4" />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback(({ id, variant = 'info', title, message, duration = 3600, action }) => {
    const key = id || `${Date.now()}-${Math.random()}`;
    setItems((list) => [...list.filter((x) => x.key !== key), { key, variant, title, message, duration, action }].slice(-3));
  }, []);
  const done = useCallback((key) => setItems((l) => l.filter((x) => x.key !== key)), []);
  return (
    <Ctx.Provider value={toast}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[300] mx-auto flex w-full max-w-md flex-col gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {items.map((i) => <Item key={i.key} item={i} onDone={done} />)}
        </div>,
        document.body
      )}
    </Ctx.Provider>
  );
}
