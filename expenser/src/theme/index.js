// Theme runtime helpers.
//
// Colour roles for the default green scheme live in ./colors.css (generated) and the rest of the
// Material 3 Expressive tokens in ./theme.css. This module handles what CSS cannot:
//   1. an optional seed colour chosen in Settings: a full M3 scheme is generated from it
//      (lazy-loaded) and written over the --md-* roles on <html>;
//   2. resolving CSS colours to plain hex for Recharts and the browser's theme-color.

// Seeds offered in Settings. `hex: ''` is the default green (colors.css) - nothing is overridden.
export const ACCENT_PRESETS = [
  { id: 'red', hex: '#F44336', swatch: '#F44336' },
  { id: 'pink', hex: '#E91E63', swatch: '#E91E63' },
  { id: 'purple', hex: '#9C27B0', swatch: '#9C27B0' },
  { id: 'deepPurple', hex: '#673AB7', swatch: '#673AB7' },
  { id: 'indigo', hex: '#3F51B5', swatch: '#3F51B5' },
  { id: 'blue', hex: '#2196F3', swatch: '#2196F3' },
  { id: 'lightBlue', hex: '#03A9F4', swatch: '#03A9F4' },
  { id: 'cyan', hex: '#00BCD4', swatch: '#00BCD4' },
  { id: 'teal', hex: '#009688', swatch: '#009688' },
  { id: 'green', hex: '', swatch: '#4CAF50' },
  { id: 'lightGreen', hex: '#8BC34A', swatch: '#8BC34A' },
  { id: 'lime', hex: '#CDDC39', swatch: '#CDDC39' },
  { id: 'yellow', hex: '#FFEB3B', swatch: '#FFEB3B' },
  { id: 'amber', hex: '#FFC107', swatch: '#FFC107' },
  { id: 'orange', hex: '#FF9800', swatch: '#FF9800' },
  { id: 'deepOrange', hex: '#FF5722', swatch: '#FF5722' },
  { id: 'brown', hex: '#795548', swatch: '#795548' },
  { id: 'grey', hex: '#9E9E9E', swatch: '#9E9E9E' },
  { id: 'blueGrey', hex: '#607D8B', swatch: '#607D8B' },
];

// Colours offered by earlier versions -> the Material 3 palette value that replaced them.
export const LEGACY_ACCENTS = { '#FFB300': '#FFC107', '#FF6D00': '#FF9800' };

/** True for light swatches (lime, yellow, amber...) that need a dark check mark on top. */
export function isLightColor(hex) {
  if (!isValidHex(hex)) return false;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

export const DEFAULT_ACCENT = '';
export const DEFAULT_SEED = '#4CAF50';

const ACCENT_CACHE_KEY = 'qlct:accent';
const OWNED = new Set(); // custom properties currently overridden on <html>

export function isValidHex(value) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function clearAccent(root) {
  OWNED.forEach((name) => root.style.removeProperty(name));
  OWNED.clear();
}

let schemeModule;
const loadScheme = () => (schemeModule ||= import('./scheme.js'));

// Income/expense are semantic (always green/red), so they never follow the seed.
const isSeedRole = (key) => !/^(income|onIncome|error|onError|errorContainer|onErrorContainer)/.test(key);

/** Applies (or clears) the seed override. Resolves true once applied; empty/invalid seed = default green. */
export async function applyAccent(hex, dark, root = document.documentElement) {
  clearAccent(root);
  if (!hex || !isValidHex(hex)) return false;
  const { generateScheme, schemeToCss } = await loadScheme();
  const roles = generateScheme(hex)[dark ? 'dark' : 'light'];
  clearAccent(root);
  schemeToCss(roles, isSeedRole).split(';').filter(Boolean).forEach((decl) => {
    const i = decl.indexOf(':');
    const name = decl.slice(0, i);
    root.style.setProperty(name, decl.slice(i + 1));
    OWNED.add(name);
  });
  return true;
}

/** Stored so index.html could paint the right accent before React boots (only the seed is needed). */
export function cacheAccent(hex) {
  try {
    if (!hex || !isValidHex(hex)) localStorage.removeItem(ACCENT_CACHE_KEY);
    else localStorage.setItem(ACCENT_CACHE_KEY, JSON.stringify({ hex }));
  } catch {
    /* storage unavailable - React re-applies the accent anyway */
  }
}

// ---- resolving CSS colours to hex ------------------------------------------
let probe;
let ctx;

function resolveToHex(cssValue) {
  if (!probe) {
    probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:0;height:0';
    document.body.appendChild(probe);
    ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    ctx.canvas.width = 1;
    ctx.canvas.height = 1;
  }
  probe.style.color = '';
  probe.style.color = cssValue;
  const computed = getComputedStyle(probe).color;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#000';
  ctx.fillStyle = computed;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
  return a === 255 ? hex : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
}

const COLOR_VARS = {
  primary: '--md-primary',
  primaryContainer: '--md-primary-container',
  secondary: '--md-secondary',
  tertiary: '--md-tertiary',
  income: '--md-income',
  expense: '--md-error',
  surface: '--md-surface',
  surfaceContainer: '--md-surface-container',
  onSurface: '--md-on-surface',
  onSurfaceVariant: '--md-on-surface-variant',
  outlineVariant: '--md-outline-variant',
  inverseSurface: '--md-inverse-surface',
  inverseOnSurface: '--md-inverse-on-surface',
};

/** Active theme colours as plain hex (follows light/dark and the seed). Call after the vars are applied. */
export function readThemeColors() {
  return Object.fromEntries(Object.entries(COLOR_VARS).map(([key, name]) => [key, resolveToHex(`var(${name})`)]));
}

const CSS_VAR_COLORS = Object.fromEntries(Object.entries(COLOR_VARS).map(([key, name]) => [key, `var(${name})`]));

/**
 * Applies light/dark + the seed override to <html> and returns the resolved colours.
 * The default green needs no async work; a custom seed re-resolves via `onReady` once generated.
 */
export function applyTheme(isDark, accent, root = document.documentElement, onReady) {
  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);
  if (accent && isValidHex(accent)) {
    applyAccent(accent, isDark, root).then(() => onReady?.(safeRead()));
  } else {
    clearAccent(root);
  }
  return safeRead();
}

function safeRead() {
  try {
    return readThemeColors();
  } catch {
    return CSS_VAR_COLORS;
  }
}

/** Keeps <meta name="theme-color"> (browser UI / Android status bar) equal to the page surface. */
export function applyBrowserThemeColor(color) {
  if (!color || color.startsWith('var(')) return;
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', color);
}
