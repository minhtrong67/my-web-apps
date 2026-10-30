// Dựng bảng màu Material 3 Expressive từ một màu hạt.
// - Màu nhấn (primary / secondary / tertiary / error) lấy từ palette Vibrant (spec 2025) → rực rỡ, đúng tinh thần Expressive.
// - Bề mặt (surface, container, outline…) dùng palette trung tính có độ bão hòa thấp theo đúng thang tone của Material 3,
//   nên nền sáng rất sạch và nền tối là xám đậm trung tính, không bị "ngả xanh" quá mức.
// Hàm nhận thư viện `@material/material-color-utilities` làm tham số để dùng chung cho app (trình duyệt) và scripts/build-theme.mjs (Node).
export const TOKENS = [
  'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
  'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
  'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
  'error', 'onError', 'errorContainer', 'onErrorContainer',
  'background', 'onBackground', 'surface', 'onSurface', 'surfaceVariant', 'onSurfaceVariant',
  'outline', 'outlineVariant', 'shadow', 'scrim', 'inverseSurface', 'inverseOnSurface', 'inversePrimary',
  'surfaceTint', 'surfaceDim', 'surfaceBright',
  'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer', 'surfaceContainerHigh', 'surfaceContainerHighest',
];

// Thang tone của Material 3: [light, dark]
const A = { // màu nhấn: palette → [tone sáng, tone tối]
  primary: ['p', 40, 80], onPrimary: ['p', 100, 20], primaryContainer: ['p', 90, 30], onPrimaryContainer: ['p', 10, 90],
  secondary: ['s', 40, 80], onSecondary: ['s', 100, 20], secondaryContainer: ['s', 90, 30], onSecondaryContainer: ['s', 10, 90],
  tertiary: ['t', 40, 80], onTertiary: ['t', 100, 20], tertiaryContainer: ['t', 90, 30], onTertiaryContainer: ['t', 10, 90],
  error: ['e', 40, 80], onError: ['e', 100, 20], errorContainer: ['e', 90, 30], onErrorContainer: ['e', 10, 90],
  inversePrimary: ['p', 80, 40], surfaceTint: ['p', 40, 80],
};
const N = { // bề mặt: palette trung tính (n) / trung tính biến thể (v)
  background: ['n', 98, 6], onBackground: ['n', 10, 90], surface: ['n', 98, 6], onSurface: ['n', 10, 90],
  surfaceVariant: ['v', 90, 30], onSurfaceVariant: ['v', 30, 80], outline: ['v', 50, 60], outlineVariant: ['v', 80, 30],
  inverseSurface: ['n', 20, 90], inverseOnSurface: ['n', 95, 20],
  surfaceDim: ['n', 87, 6], surfaceBright: ['n', 98, 24],
  surfaceContainerLowest: ['n', 100, 4], surfaceContainerLow: ['n', 96, 10], surfaceContainer: ['n', 94, 12],
  surfaceContainerHigh: ['n', 92, 17], surfaceContainerHighest: ['n', 90, 22],
};

export function buildScheme(lib, seed, dark) {
  const { SchemeVibrant, Hct, TonalPalette, argbFromHex } = lib;
  const source = Hct.fromInt(argbFromHex(seed));
  const sch = new SchemeVibrant(source, dark, 0, '2025', 'phone');
  const pal = {
    p: sch.primaryPalette, s: sch.secondaryPalette, t: sch.tertiaryPalette, e: sch.errorPalette,
    n: TonalPalette.fromHueAndChroma(source.hue, 4), v: TonalPalette.fromHueAndChroma(source.hue, 8),
  };
  const hex = (a) => `#${(a & 0xffffff).toString(16).padStart(6, '0')}`.toUpperCase();
  const out = { shadow: '#000000', scrim: '#000000' };
  for (const [k, [p, l, d]] of Object.entries({ ...A, ...N })) out[k] = hex(pal[p].tone(dark ? d : l));
  return Object.fromEntries(TOKENS.map((k) => [k, out[k]]));
}
