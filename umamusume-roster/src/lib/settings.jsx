import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translate } from '../i18n';

export const COLORS = [
  ['red', '#F44336'], ['pink', '#E91E63'], ['purple', '#9C27B0'], ['deeppurple', '#673AB7'], ['indigo', '#3F51B5'],
  ['blue', '#2196F3'], ['lightblue', '#03A9F4'], ['cyan', '#00BCD4'], ['teal', '#009688'], ['green', '#4CAF50'],
  ['lightgreen', '#8BC34A'], ['lime', '#CDDC39'], ['yellow', '#FFEB3B'], ['amber', '#FFC107'], ['orange', '#FF9800'],
  ['deeporange', '#FF5722'], ['brown', '#795548'], ['grey', '#9E9E9E'], ['bluegrey', '#607D8B']
].map(([id, hex]) => ({ id, hex }));

const SYSTEM_STACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
export const FONTS = [
  { id: 'system', label: null, stack: SYSTEM_STACK },
  { id: 'google-sans-flex', label: 'Google Sans Flex', gf: 'Google+Sans+Flex:wght@400;500;600;700;800', stack: `"Google Sans Flex", ${SYSTEM_STACK}` },
  { id: 'roboto-flex', label: 'Roboto Flex', gf: 'Roboto+Flex:wght@400;500;600;700;800', stack: `"Roboto Flex", ${SYSTEM_STACK}` },
  { id: 'roboto', label: 'Roboto', gf: 'Roboto:wght@400;500;700;900', stack: `Roboto, ${SYSTEM_STACK}` },
  { id: 'arial', label: 'Arial', stack: `Arial, "Helvetica Neue", Helvetica, sans-serif` },
  { id: 'inter', label: 'Inter', gf: 'Inter:wght@400;500;600;700;800', stack: `Inter, ${SYSTEM_STACK}` },
  { id: 'be-vietnam-pro', label: 'Be Vietnam Pro', gf: 'Be+Vietnam+Pro:wght@400;500;600;700;800', stack: `"Be Vietnam Pro", ${SYSTEM_STACK}` }
];

const KEY = 'uma.settings.v1';
const defaults = () => ({
  mode: 'system', color: 'pink', size: 'medium', font: 'system', motion: 'on',
  lang: typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('vi') ? 'vi' : 'en'
});
const load = () => { try { return { ...defaults(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return defaults(); } };

const lum = (hex) => {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const onColor = (hex) => { const L = lum(hex); return 1.05 / (L + 0.05) >= (L + 0.05) / 0.061 ? '#ffffff' : '#1b1b1b'; };

const loadedFonts = new Set();
function ensureFont(f) {
  if (!f.gf || loadedFonts.has(f.id)) return;
  loadedFonts.add(f.id);
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = `https://fonts.googleapis.com/css2?family=${f.gf}&display=swap`;
  document.head.appendChild(l);
}

const Ctx = createContext(null);
export const useSettings = () => useContext(Ctx);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load);
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const fn = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const isDark = settings.mode === 'dark' || (settings.mode === 'system' && systemDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  useEffect(() => {
    const c = COLORS.find((x) => x.id === settings.color) || COLORS[1];
    const on = onColor(c.hex);
    const root = document.documentElement;
    root.style.setProperty('--p', c.hex);
    root.style.setProperty('--on-p', on);
    try { localStorage.setItem('uma.paint', JSON.stringify({ p: c.hex, on })); } catch {}
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c.hex);
  }, [settings.color]);

  useEffect(() => { document.documentElement.dataset.size = settings.size; }, [settings.size]);
  useEffect(() => { document.documentElement.lang = settings.lang; }, [settings.lang]);
  useEffect(() => { document.documentElement.dataset.motion = settings.motion; }, [settings.motion]);
  useEffect(() => {
    const f = FONTS.find((x) => x.id === settings.font) || FONTS[0];
    ensureFont(f);
    document.documentElement.style.setProperty('--app-font', f.stack);
  }, [settings.font]);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch {} }, [settings]);

  const set = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setSettings(defaults()), []);
  const t = useCallback((key, vars) => translate(settings.lang, key, vars), [settings.lang]);
  const value = useMemo(() => ({ settings, set, reset, t, isDark }), [settings, set, reset, t, isDark]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStored(key, initial) {
  const [v, setV] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}
