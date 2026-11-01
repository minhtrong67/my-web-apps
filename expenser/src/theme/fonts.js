// Font choices offered in Settings > Appearance.
// Roboto Flex is bundled with the app (index.css). The others are separate CSS chunks that are only
// downloaded when picked (or when the font dropdown is opened, to preview each name in its own face).

const FALLBACK = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';

export const DEFAULT_FONT = 'roboto-flex';

export const FONT_OPTIONS = [
  { id: 'system', name: 'System', family: null, stack: FALLBACK, load: null },
  { id: 'google-sans-flex', name: 'Google Sans Flex', family: 'Google Sans Flex Variable', stack: `"Google Sans Flex Variable", ${FALLBACK}`, load: () => import('@fontsource-variable/google-sans-flex/index.css') },
  { id: 'roboto-flex', name: 'Roboto Flex', family: 'Roboto Flex Variable', stack: `"Roboto Flex Variable", ${FALLBACK}`, load: null },
  { id: 'roboto', name: 'Roboto', family: 'Roboto Variable', stack: `"Roboto Variable", ${FALLBACK}`, load: () => import('@fontsource-variable/roboto/index.css') },
  { id: 'arial', name: 'Arial', family: null, stack: 'Arial, "Helvetica Neue", Helvetica, sans-serif', load: null },
  { id: 'inter', name: 'Inter', family: 'Inter Variable', stack: `"Inter Variable", ${FALLBACK}`, load: () => import('@fontsource-variable/inter/index.css') },
  {
    id: 'be-vietnam-pro',
    name: 'Be Vietnam Pro',
    family: 'Be Vietnam Pro',
    stack: `"Be Vietnam Pro", ${FALLBACK}`,
    load: () => Promise.all([import('@fontsource/be-vietnam-pro/400.css'), import('@fontsource/be-vietnam-pro/500.css'), import('@fontsource/be-vietnam-pro/600.css'), import('@fontsource/be-vietnam-pro/700.css')]),
  },
];

export const FONT_IDS = FONT_OPTIONS.map((f) => f.id);
export const getFont = (id) => FONT_OPTIONS.find((f) => f.id === id) || FONT_OPTIONS.find((f) => f.id === DEFAULT_FONT);

const loading = new Map();

/** Downloads a font's CSS + the glyphs the UI needs (Latin and Vietnamese). Never rejects. */
export function loadFont(id) {
  const font = getFont(id);
  if (!loading.has(font.id)) {
    loading.set(
      font.id,
      (async () => {
        try {
          await font.load?.();
          if (font.family && document.fonts?.load) {
            // Vietnamese sample so the right unicode-range subsets are fetched before we switch.
            await Promise.race([
              Promise.all(['400', '500', '700'].map((w) => document.fonts.load(`${w} 1em "${font.family}"`, 'Aa Tiếng Việt ₫ 0123'))),
              new Promise((r) => setTimeout(r, 2500)),
            ]);
          }
        } catch {
          /* offline / blocked: the stack falls back to the system font */
        }
      })(),
    );
  }
  return loading.get(font.id);
}

/** Registers every face so the dropdown can preview each name in its own font. */
export function preloadAllFonts() {
  FONT_OPTIONS.forEach((f) => f.load?.().catch(() => {}));
}

export function applyFont(id, root = document.documentElement) {
  root.style.setProperty('--app-font', getFont(id).stack);
}
