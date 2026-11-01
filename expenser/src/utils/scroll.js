// Smooth, eased page scrolling used by "back to top" and in-page anchor links.
//
// The browser's own `behavior: 'smooth'` has a fixed, engine-chosen duration that feels abrupt on long
// pages, so this animates with requestAnimationFrame instead (ease-in-out, duration scaled to distance).
// `scroll-behavior: smooth` on <html> is switched off while it runs (otherwise every frame would
// start its own native smooth scroll and fight the animation). Any user input cancels it at once.

let raf = 0;
let cleanup = null;

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function cancelSmoothScroll() {
  cancelAnimationFrame(raf);
  raf = 0;
  cleanup?.();
  cleanup = null;
}

/** Scrolls the window to `top` px with easing. Resolves when it finishes or is interrupted. */
export function smoothScrollTo(top, { duration } = {}) {
  cancelSmoothScroll();
  const root = document.documentElement;
  const maxY = Math.max(0, root.scrollHeight - window.innerHeight);
  const from = window.scrollY;
  const to = Math.min(Math.max(0, top), maxY);
  const distance = to - from;

  if (prefersReducedMotion() || Math.abs(distance) < 2) {
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, to);
    root.style.scrollBehavior = '';
    return Promise.resolve();
  }

  const total = duration ?? Math.min(1100, Math.max(520, Math.abs(distance) * 0.6));
  return new Promise((resolve) => {
    root.style.scrollBehavior = 'auto';
    const stop = () => {
      cancelSmoothScroll();
      resolve();
    };
    const events = ['wheel', 'touchstart', 'keydown', 'mousedown'];
    events.forEach((e) => window.addEventListener(e, stop, { passive: true, once: true }));
    cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, stop));
      root.style.scrollBehavior = '';
      resolve();
    };

    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / total);
      window.scrollTo(0, from + distance * easeInOutCubic(p));
      if (p < 1) raf = requestAnimationFrame(step);
      else stop();
    };
    raf = requestAnimationFrame(step);
  });
}

export const scrollToTop = () => smoothScrollTo(0);

/** Scrolls so the element with `id` sits below any sticky header (honours its CSS scroll-margin-top). */
export function scrollToId(id) {
  if (!id || id === 'top') return smoothScrollTo(0);
  const el = document.getElementById(decodeURIComponent(id));
  if (!el) return Promise.resolve();
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - margin);
}
