import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import Icon from './Icon';

/**
 * Page-level floating action button (M3 Expressive: rounded-square, primary container,
 * morphs to a circle when pressed). Rendered into the layout's FAB column so it stacks with the
 * back-to-top button. Extended (with label) on large screens.
 */
export default function Fab({ label, onClick, icon = 'add' }) {
  const ctx = useOutletContext();
  const slot = ctx?.fabSlot;
  if (!slot) return null;
  return createPortal(
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="state-layer morph morph-sq flex h-14 min-w-14 animate-scale-in items-center justify-center gap-3 bg-primary-container px-4 text-on-primary-container shadow-elev-3 lg:h-14 lg:px-6"
    >
      <Icon name={icon} size={24} />
      <span className="hidden text-label-lg font-semibold lg:inline">{label}</span>
    </button>,
    slot,
  );
}
