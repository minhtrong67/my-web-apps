import { useEffect } from 'react';

function setMeta(selector, attr, value) {
  if (value == null) return;
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

/**
 * Keeps <title>, description, Open Graph / Twitter text and the robots directive in step with the
 * page being shown. Private (signed-in) pages are `noindex`; the public pages are indexable.
 */
export function useSeo({ title, description, noindex = false, locale }) {
  useEffect(() => {
    if (title) {
      document.title = title;
      setMeta('meta[property="og:title"]', 'content', title);
      setMeta('meta[name="twitter:title"]', 'content', title);
    }
    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
      setMeta('meta[name="twitter:description"]', 'content', description);
    }
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');
    setMeta('meta[name="googlebot"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow');
    if (locale) setMeta('meta[property="og:locale"]', 'content', locale === 'en' ? 'en_US' : 'vi_VN');
  }, [title, description, noindex, locale]);
}
