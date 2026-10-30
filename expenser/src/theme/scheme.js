// Material 3 colour scheme generation (Google's material-color-utilities).
// The default green scheme is baked into colors.css by scripts/gen-theme.mjs; this module is
// only dynamically imported at runtime when the user picks a custom seed colour.
import {
  argbFromHex, hexFromArgb, Hct, SchemeVibrant, MaterialDynamicColors as M, customColor,
} from '@material/material-color-utilities';

export const SEED = '#4CAF50'; // Material green 500

const ROLES = {
  primary: M.primary, onPrimary: M.onPrimary, primaryContainer: M.primaryContainer, onPrimaryContainer: M.onPrimaryContainer,
  secondary: M.secondary, onSecondary: M.onSecondary, secondaryContainer: M.secondaryContainer, onSecondaryContainer: M.onSecondaryContainer,
  tertiary: M.tertiary, onTertiary: M.onTertiary, tertiaryContainer: M.tertiaryContainer, onTertiaryContainer: M.onTertiaryContainer,
  error: M.error, onError: M.onError, errorContainer: M.errorContainer, onErrorContainer: M.onErrorContainer,
  background: M.background, onBackground: M.onBackground, surface: M.surface, onSurface: M.onSurface,
  surfaceVariant: M.surfaceVariant, onSurfaceVariant: M.onSurfaceVariant, outline: M.outline, outlineVariant: M.outlineVariant,
  inverseSurface: M.inverseSurface, inverseOnSurface: M.inverseOnSurface, inversePrimary: M.inversePrimary,
  surfaceTint: M.primary, surfaceDim: M.surfaceDim, surfaceBright: M.surfaceBright,
  surfaceContainerLowest: M.surfaceContainerLowest, surfaceContainerLow: M.surfaceContainerLow, surfaceContainer: M.surfaceContainer,
  surfaceContainerHigh: M.surfaceContainerHigh, surfaceContainerHighest: M.surfaceContainerHighest,
};

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** seed hex -> { light: {role: hex}, dark: {...} }. Income is always green, whatever the seed. */
export function generateScheme(seedHex) {
  const source = argbFromHex(seedHex);
  const out = {};
  [false, true].forEach((dark) => {
    const scheme = new SchemeVibrant(Hct.fromInt(source), dark, 0);
    const roles = {};
    Object.entries(ROLES).forEach(([k, dc]) => { roles[k] = hexFromArgb(dc.getArgb(scheme)); });
    const inc = customColor(argbFromHex(SEED), { name: 'income', value: argbFromHex('#2E9E5B'), blend: false });
    const v = dark ? inc.dark : inc.light;
    roles.income = hexFromArgb(v.color); roles.onIncome = hexFromArgb(v.onColor);
    roles.incomeContainer = hexFromArgb(v.colorContainer); roles.onIncomeContainer = hexFromArgb(v.onColorContainer);
    out[dark ? 'dark' : 'light'] = roles;
  });
  return out;
}

/** roles -> "--md-primary:#...;--md-on-primary:#...;" */
export function schemeToCss(roles, only) {
  return Object.entries(roles).filter(([k]) => !only || only(k)).map(([k, v]) => `--md-${kebab(k)}:${v}`).join(';') + ';';
}
