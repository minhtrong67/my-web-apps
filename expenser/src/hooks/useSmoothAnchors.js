import { useEffect } from 'react';
import { scrollToId } from '../utils/scroll';

/**
 * One delegated listener: every same-page `<a href="#section">` scrolls smoothly (eased, offset for the
 * sticky header), updates the URL hash without a jump, and moves focus to the target for keyboard users.
 */
export function useSmoothAnchors() {
  useEffect(() => {
    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href^="#"]');
      if (!a || a.target === '_blank') return;
      const id = a.getAttribute('href').slice(1);
      if (id && id !== 'top' && !document.getElementById(decodeURIComponent(id))) return;
      e.preventDefault();
      scrollToId(id).then(() => {
        const el = id && id !== 'top' ? document.getElementById(decodeURIComponent(id)) : null;
        if (el) {
          if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
          el.focus({ preventScroll: true });
        }
      });
      const hash = id && id !== 'top' ? `#${id}` : window.location.pathname + window.location.search;
      window.history.replaceState(window.history.state, '', hash);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
