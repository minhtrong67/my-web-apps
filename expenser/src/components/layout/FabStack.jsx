import { useEffect, useState } from 'react';
import Icon from '../ui/Icon';
import { useT } from '../../i18n';
import { usePresence } from '../../hooks/usePresence';
import { scrollToTop } from '../../utils/scroll';

/**
 * Bottom-right column for floating buttons. It always holds the "back to top"
 * button (once the page is scrolled) and exposes a slot (`onSlot`) that a page
 * can fill with its own FAB via <Fab> - so the two stack in one column and can
 * never overlap. On phones the column sits above the bottom navigation bar.
 */
export default function FabStack({ onSlot }) {
  const t = useT();
  const [showTop, setShowTop] = useState(false);
  const { present: topPresent, closing: topClosing } = usePresence(showTop, 260);

  useEffect(() => {
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setShowTop(window.scrollY > 360));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fab-stack">
      {topPresent && (
        <button
          type="button"
          aria-label={t('common.scrollTop')}
          title={t('common.scrollTop')}
          onClick={scrollToTop}
          className={`state-layer morph morph-sq flex h-12 w-12 ${topClosing ? 'animate-scale-out' : 'animate-scale-in'} items-center justify-center bg-surface-container-high text-primary shadow-elev-2`}
        >
          <Icon name="arrow_upward" size={24} />
        </button>
      )}
      <div ref={onSlot} className="fab-slot" />
    </div>
  );
}
