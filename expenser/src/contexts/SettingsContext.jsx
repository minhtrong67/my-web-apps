import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { I18nContext, LANGUAGES, createT, detectLanguage } from '../i18n';
import { setFormatLocale } from '../utils/format';
import { DEFAULT_REMINDER, normalizeTime } from '../services/reminders';
import {
  DEFAULT_ACCENT,
  LEGACY_ACCENTS,
  applyBrowserThemeColor,
  applyTheme,
  cacheAccent,
  isValidHex,
} from '../theme';

import { DEFAULT_FONT, FONT_IDS, applyFont, loadFont } from '../theme/fonts';

const SettingsContext = createContext(null);

// Appearance changes (theme mode, accent colour, font, text size) cross-fade through the browser's
// View Transitions API: it snapshots the old page, applies the change, and blends the snapshots on the
// GPU. That stays smooth on big screens, unlike transitioning every element's colour on the main thread.
// Browsers without it (or users who prefer reduced motion) simply get the instant change.
let transitionActive = false;
function runWithTransition(apply) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce || transitionActive) {
    apply();
    return;
  }
  transitionActive = true;
  const vt = document.startViewTransition(() => {
    flushSync(apply); // the new DOM must be complete when the callback returns
  });
  vt.finished.finally(() => {
    transitionActive = false;
  });
}
let lastAccentChange = 0;

const FONT_SCALES = { sm: 0.92, md: 1, lg: 1.1 };

// Shared metadata for the 3 theme modes so any component (Topbar quick
// toggle, Settings page selector, ...) stays in sync.
export const THEME_MODES = [
  { id: 'light', labelKey: 'settings.mode.light', icon: 'light_mode' },
  { id: 'dark', labelKey: 'settings.mode.dark', icon: 'dark_mode' },
  { id: 'system', labelKey: 'settings.mode.system', icon: 'brightness_auto' },
];

const DEFAULT_SETTINGS = {
  themeMode: 'system', // light | dark | system
  fontSize: 'md', // sm | md | lg
  fontFamily: DEFAULT_FONT, // system | google-sans-flex | roboto-flex | roboto | arial | inter | be-vietnam-pro
  language: detectLanguage(), // vi | en
  reminder: DEFAULT_REMINDER, // daily notification: { enabled, time: 'HH:MM' } - per device
  accentColor: DEFAULT_ACCENT, // '' = the supplied theme (theme.css); or any #RRGGBB accent
};

function getSystemPrefersDark() {
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export function SettingsProvider({ children }) {
  const [stored, setStored] = useLocalStorage('qlct:settings', DEFAULT_SETTINGS);
  // Old installs saved fewer fields (and a now-removed notification flag) -
  // merge over the defaults so every field is always defined.
  const settings = useMemo(() => {
    // eslint-disable-next-line no-unused-vars
    const { seedColor: legacySeed, ...merged } = { ...DEFAULT_SETTINGS, ...stored }; // seedColor = removed Material 3 setting
    if (!LANGUAGES.some((l) => l.id === merged.language)) merged.language = DEFAULT_SETTINGS.language;
    if (merged.accentColor && !isValidHex(merged.accentColor)) merged.accentColor = DEFAULT_ACCENT;
    merged.accentColor = LEGACY_ACCENTS[merged.accentColor?.toUpperCase()] || merged.accentColor;
    merged.reminder = { enabled: !!merged.reminder?.enabled, time: normalizeTime(merged.reminder?.time) };
    if (merged.fontSize === 'xl') merged.fontSize = 'lg'; // removed size
    if (!FONT_SCALES[merged.fontSize]) merged.fontSize = 'md';
    if (!FONT_IDS.includes(merged.fontFamily)) merged.fontFamily = DEFAULT_FONT;
    return merged;
  }, [stored]);

  const [systemDark, setSystemDark] = useState(getSystemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = settings.themeMode === 'system' ? systemDark : settings.themeMode === 'dark';

  // ---- Theme: M3 tokens come from theme.css / colors.css, the seed colour is an optional override ----
  const accent = settings.accentColor;
  // Resolved synchronously on the first render, so charts never paint with a stale palette.
  const [colors, setColors] = useState(() => applyTheme(isDark, accent));

  useLayoutEffect(() => {
    const sync = (resolved) => {
      applyBrowserThemeColor(resolved.surface); // status bar / browser chrome follows the page surface
      setColors(resolved);
    };
    sync(applyTheme(isDark, accent, document.documentElement, sync)); // a custom seed re-syncs once its scheme is generated
    cacheAccent(accent);
  }, [isDark, accent]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(FONT_SCALES[settings.fontSize] || 1));
  }, [settings.fontSize]);

  // Font family: download the chosen font first, then switch, so text never flashes a fallback face.
  useEffect(() => {
    let cancelled = false;
    loadFont(settings.fontFamily).then(() => {
      if (!cancelled) applyFont(settings.fontFamily);
    });
    return () => {
      cancelled = true;
    };
  }, [settings.fontFamily]);

  // ---- Language ----------------------------------------------------------------
  const lang = settings.language;
  const i18n = useMemo(() => {
    // Render-time on purpose: formatters must follow the new language before
    // any child renders with it.
    setFormatLocale(lang);
    return { lang, locale: LANGUAGES.find((l) => l.id === lang)?.locale, t: createT(lang) };
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', i18n.t('meta.description'));
  }, [lang, i18n]);

  // ---- Actions -----------------------------------------------------------------
  const update = useCallback(
    async (patch) => {
      const apply = () => {
        setStored((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...patch }));
        if (patch.fontFamily) applyFont(patch.fontFamily);
        if (patch.fontSize) document.documentElement.style.setProperty('--font-scale', String(FONT_SCALES[patch.fontSize] || 1));
      };
      // Fetch a new font first so text never flashes a fallback face mid-transition.
      if (patch.fontFamily) await loadFont(patch.fontFamily);
      let animate = 'themeMode' in patch || 'fontFamily' in patch || 'fontSize' in patch;
      if ('accentColor' in patch) {
        // A colour dragged in the native picker fires continuously - only animate the first change of a burst.
        const now = Date.now();
        animate = animate || now - lastAccentChange > 1500;
        lastAccentChange = now;
      }
      if (animate) runWithTransition(apply);
      else apply();
    },
    [setStored],
  );

  const cycleThemeMode = useCallback(() => {
    runWithTransition(() =>
      setStored((prev) => {
        const order = THEME_MODES.map((m) => m.id);
        const current = { ...DEFAULT_SETTINGS, ...prev }.themeMode;
        return { ...DEFAULT_SETTINGS, ...prev, themeMode: order[(order.indexOf(current) + 1) % order.length] };
      }),
    );
  }, [setStored]);

  const toggleLanguage = useCallback(() => {
    setStored((prev) => {
      const current = { ...DEFAULT_SETTINGS, ...prev }.language;
      return { ...DEFAULT_SETTINGS, ...prev, language: current === 'vi' ? 'en' : 'vi' };
    });
  }, [setStored]);

  // Resets appearance only - the language is an explicit choice, so it stays.
  const resetSettings = useCallback(
    () => runWithTransition(() => setStored((prev) => ({ ...DEFAULT_SETTINGS, language: { ...DEFAULT_SETTINGS, ...prev }.language }))),
    [setStored],
  );

  const value = useMemo(
    () => ({ settings, update, cycleThemeMode, toggleLanguage, resetSettings, isDark, colors, FONT_SCALES }),
    [settings, update, cycleThemeMode, toggleLanguage, resetSettings, isDark, colors],
  );

  return (
    <SettingsContext.Provider value={value}>
      <I18nContext.Provider value={i18n}>{children}</I18nContext.Provider>
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
