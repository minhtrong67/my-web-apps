// Phông chữ người dùng có thể chọn trong Cài đặt. Phông web được cài từ @fontsource (đóng gói cùng app, chạy offline/PWA)
// và chỉ tải khi được chọn nhờ import động; trình duyệt chỉ tải các subset (latin, vietnamese…) thực sự cần.
const SANS = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const FONTS = [
  { key: 'system', label: null, family: `system-ui, -apple-system, BlinkMacSystemFont, ${SANS}` },
  { key: 'googleSansFlex', label: 'Google Sans Flex', family: `'Google Sans Flex Variable', system-ui, ${SANS}`, load: () => import('@fontsource-variable/google-sans-flex/index.css') },
  { key: 'robotoFlex', label: 'Roboto Flex', family: `'Roboto Flex Variable', system-ui, ${SANS}`, load: () => import('@fontsource-variable/roboto-flex/index.css') },
  { key: 'roboto', label: 'Roboto', family: `Roboto, system-ui, ${SANS}`, load: () => Promise.all([import('@fontsource/roboto/400.css'), import('@fontsource/roboto/500.css'), import('@fontsource/roboto/700.css')]) },
  { key: 'arial', label: 'Arial', family: "Arial, Helvetica, sans-serif" },
  { key: 'inter', label: 'Inter', family: `'Inter Variable', system-ui, ${SANS}`, load: () => import('@fontsource-variable/inter/index.css') },
  { key: 'beVietnamPro', label: 'Be Vietnam Pro', family: `'Be Vietnam Pro', system-ui, ${SANS}`, load: () => Promise.all([import('@fontsource/be-vietnam-pro/400.css'), import('@fontsource/be-vietnam-pro/500.css'), import('@fontsource/be-vietnam-pro/600.css'), import('@fontsource/be-vietnam-pro/700.css')]) },
];
export const DEFAULT_FONT = 'system';
export const isFontKey = (k) => FONTS.some((f) => f.key === k);
export const fontOf = (k) => FONTS.find((f) => f.key === k) || FONTS[0];

const loaded = new Map();
/** Tải CSS/phông của một lựa chọn (chỉ một lần) */
export const loadFont = (key) => {
  const f = fontOf(key);
  if (!f.load) return Promise.resolve();
  if (!loaded.has(f.key)) loaded.set(f.key, f.load().catch(() => loaded.delete(f.key)));
  return loaded.get(f.key);
};
