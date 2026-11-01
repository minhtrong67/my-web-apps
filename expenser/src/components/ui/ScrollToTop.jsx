import { useEffect, useState } from 'react';
import { useT } from '../../i18n';
import Icon from './Icon';
import { usePresence } from '../../hooks/usePresence';
import { scrollToTop } from '../../utils/scroll';

/** Floating "back to top" button with eased scrolling. `className` positions it (default: bottom-right). */
export default function ScrollToTop({ className = 'bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 sm:bottom-8 sm:right-8', threshold = 360 }) {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const { present, closing } = usePresence(visible, 260);

  useEffect(() => {
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVisible(window.scrollY > threshold));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [threshold]);

  if (!present) return null;

  return (
    <button
      type="button"
      aria-label={t('common.scrollTop')}
      title={t('common.scrollTop')}
      onClick={scrollToTop}
      className={`state-layer morph morph-sq fixed z-30 flex h-12 w-12 items-center justify-center bg-surface-container-high text-primary shadow-elev-2 ${closing ? 'animate-scale-out' : 'animate-scale-in'} ${className}`}
    >
      <Icon name="arrow_upward" size={24} />
    </button>
  );
}
