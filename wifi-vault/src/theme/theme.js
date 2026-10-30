// Material 3 Expressive (2026): biến bảng màu thành CSS variables dạng "R G B"
// để Tailwind dùng được kèm độ trong suốt, ví dụ `bg-primary/10`.
// Bảng màu mặc định (blue) được sinh sẵn bằng `node scripts/build-theme.mjs` → default-scheme.json.
import defaults from './default-scheme.json';
import { buildScheme, TOKENS } from './scheme';

export const DEFAULT_SEED = defaults.seed; // #1A73E8 – blue của Material 3 Expressive

/** Màu hạt người dùng có thể chọn làm màu chủ đề (blue là mặc định) */
export const THEME_COLORS = [
  { name: 'blue', hex: '#1A73E8' },
  { name: 'lightBlue', hex: '#039BE5' },
  { name: 'cyan', hex: '#12B5CB' },
  { name: 'teal', hex: '#009688' },
  { name: 'green', hex: '#1E8E3E' },
  { name: 'lime', hex: '#8BA800' },
  { name: 'amber', hex: '#F9AB00' },
  { name: 'orange', hex: '#E8710A' },
  { name: 'red', hex: '#D93025' },
  { name: 'pink', hex: '#D01884' },
  { name: 'purple', hex: '#9334E6' },
  { name: 'indigo', hex: '#4F46E5' },
];
export const isThemeSeed = (seed) => THEME_COLORS.some((c) => c.hex === String(seed).toUpperCase());


const kebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
const triplet = (hex) => {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};
const vars = (scheme) => TOKENS.map((k) => `--md-${kebab(k)}:${triplet(scheme[k])}`).join(';');

/** Dựng CSS cho cả hai chế độ sáng/tối. `strong` nâng độ ưu tiên để luôn thắng CSS mặc định. */
export const schemesToCss = (light, dark, strong = false) => {
  const r = strong ? ':root:root' : ':root';
  return `${r}{${vars(light)}}${r}.dark{${vars(dark)}}`;
};

export const DEFAULT_SCHEMES = { light: defaults.light, dark: defaults.dark };

/** Sinh bảng màu Expressive từ một màu hạt (xem scheme.js). Thư viện chỉ tải khi cần nên không làm nặng lần mở đầu. */
export async function schemesFromSeed(seed) {
  if (seed.toUpperCase() === DEFAULT_SEED.toUpperCase()) return DEFAULT_SCHEMES;
  const lib = await import('@material/material-color-utilities');
  return { light: buildScheme(lib, seed, false), dark: buildScheme(lib, seed, true) };
}

/** Bảng màu (hex) của một chế độ, dùng cho biểu đồ và báo cáo */
export const tokensFor = (schemes, dark) => (dark ? schemes.dark : schemes.light);
