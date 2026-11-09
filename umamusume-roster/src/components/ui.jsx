import Tooltip from './Tooltip';

const VARIANTS = {
  primary: 'bg-primary text-on-primary hover:brightness-110',
  tonal: 'bg-pc text-accent hover:bg-primary/25',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  rose: 'bg-rose-500 text-white hover:bg-rose-600',
  info: 'bg-sky-600 text-white hover:bg-sky-700',
  neutral: 'bg-surface-3 text-ink hover:brightness-95 dark:hover:brightness-110'
};

export function Button({ icon: Icon, children, variant = 'primary', size = 'md', className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-95 disabled:opacity-50 ${size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5 text-sm'} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({ icon: Icon, label, active = false, tone, className = '', iconClass = '', side, ...rest }) {
  return (
    <Tooltip label={label} side={side}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active || undefined}
        className={`grid size-9 place-items-center rounded-full transition active:scale-90 ${active ? tone || 'bg-primary text-on-primary' : 'text-ink-2 hover:bg-primary/15 hover:text-accent'} ${className}`}
        {...rest}
      >
        <Icon className={`size-[1.15rem] ${iconClass}`} aria-hidden />
      </button>
    </Tooltip>
  );
}

export function GroupBadge({ color, children }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.7rem] font-bold"
      style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color: `color-mix(in oklab, ${color} 62%, var(--ink))` }}
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ background: color }} />
      <span className="truncate">{children}</span>
    </span>
  );
}

export function Segmented({ value, onChange, options, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-1 rounded-2xl bg-surface-2 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-40 ${value === o.value ? 'bg-primary text-on-primary shadow' : 'text-ink-2 enabled:hover:bg-primary/12 enabled:hover:text-accent'}`}
        >
          {o.icon && <o.icon className="size-4 shrink-0" aria-hidden />}{o.label}
        </button>
      ))}
    </div>
  );
}

export function Highlight({ text, q }) {
  const s = (q || '').trim().toLowerCase();
  if (!s) return text;
  const i = text.toLowerCase().indexOf(s);
  if (i < 0) return text;
  return <>{text.slice(0, i)}<mark className="rounded bg-primary/30 px-0.5 text-inherit">{text.slice(i, i + s.length)}</mark>{text.slice(i + s.length)}</>;
}
