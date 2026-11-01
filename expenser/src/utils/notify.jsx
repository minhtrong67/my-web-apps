import toast from 'react-hot-toast';
import Icon from '../components/ui/Icon';

// App notifications (snackbars) in four variants. Colours come from the theme roles, so they follow
// light/dark mode and the accent colour automatically (even for toasts already on screen).
//
// Use sparingly - only when the result of an action is NOT already visible on screen:
//   success  - a file was exported, data imported, password changed (no visible UI change)
//   error    - something failed and the user must know
//   warning  - an action was blocked / partly done (category in use, rows skipped)
//   info     - neutral hints (nothing to import, feature unsupported)
// Adding / editing / deleting a record does NOT toast: the list updating is the feedback.
const VARIANTS = {
  success: { icon: 'check_circle', box: 'bg-income-container text-on-income-container', glyph: 'text-income', role: 'status' },
  error: { icon: 'error', box: 'bg-error-container text-on-error-container', glyph: 'text-error', role: 'alert' },
  warning: { icon: 'warning', box: 'bg-warning-container text-on-warning-container', glyph: 'text-warning', role: 'alert' },
  info: { icon: 'info', box: 'bg-secondary-container text-on-secondary-container', glyph: 'text-secondary', role: 'status' },
};

function ToastCard({ toastState, variant, message }) {
  const v = VARIANTS[variant];
  return (
    <div
      role={v.role}
      onClick={() => toast.dismiss(toastState.id)}
      className={`pointer-events-auto flex w-max max-w-[min(92vw,420px)] cursor-pointer items-start gap-3 rounded-2xl px-4 py-3 text-body-md shadow-elev-3 ${v.box} ${
        toastState.visible ? 'animate-toast-in' : 'animate-toast-out'
      }`}
    >
      <Icon name={v.icon} size={22} className={`mt-px shrink-0 ${v.glyph}`} />
      <p className="wrap-any min-w-0 flex-1 pt-px">{message}</p>
    </div>
  );
}

function show(variant, message, { id, duration } = {}) {
  if (!message) return undefined;
  const toastId = id ?? `${variant}:${message}`; // same message never stacks twice
  toast.dismiss(); // one snackbar at a time
  return toast.custom((state) => <ToastCard toastState={state} variant={variant} message={message} />, {
    id: toastId,
    duration: duration ?? (variant === 'error' || variant === 'warning' ? 5000 : 3000),
  });
}

export const notify = {
  success: (message, opts) => show('success', message, opts),
  error: (message, opts) => show('error', message, opts),
  warning: (message, opts) => show('warning', message, opts),
  info: (message, opts) => show('info', message, opts),
};
