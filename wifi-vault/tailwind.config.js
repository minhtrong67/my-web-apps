/** @type {import('tailwindcss').Config} */

// Màu lấy từ CSS variables của Material 3 (xem src/theme/theme.js) — hỗ trợ độ trong suốt: bg-primary/10
const c = (name) => `rgb(var(--md-${name}) / <alpha-value>)`;
const TOKENS = [
  'primary', 'on-primary', 'primary-container', 'on-primary-container',
  'secondary', 'on-secondary', 'secondary-container', 'on-secondary-container',
  'tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container',
  'error', 'on-error', 'error-container', 'on-error-container',
  'background', 'on-background', 'surface', 'on-surface', 'surface-variant', 'on-surface-variant',
  'outline', 'outline-variant', 'shadow', 'scrim', 'inverse-surface', 'inverse-on-surface', 'inverse-primary',
  'surface-tint', 'surface-dim', 'surface-bright',
  'surface-container-lowest', 'surface-container-low', 'surface-container', 'surface-container-high', 'surface-container-highest',
];

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: Object.fromEntries(TOKENS.map((t) => [t, c(t)])),
      // Phông chữ do người dùng chọn trong Cài đặt (biến --font, xem src/lib/fonts.js)
      fontFamily: { sans: ['var(--font)'] },
      // Hình khối Material 3 Expressive: xs 4 · sm 8 · md 12 · lg 16 · lg-increased 20 · xl 28 · xl-increased 32 · xxl 48
      borderRadius: { '3xl': '24px', '4xl': '28px', '5xl': '32px', '6xl': '48px' },
      // Đổ bóng theo cấp độ elevation của Material 3
      boxShadow: {
        el1: '0 1px 2px rgb(var(--md-shadow) / .3), 0 1px 3px 1px rgb(var(--md-shadow) / .15)',
        el2: '0 1px 2px rgb(var(--md-shadow) / .3), 0 2px 6px 2px rgb(var(--md-shadow) / .15)',
        el3: '0 1px 3px rgb(var(--md-shadow) / .3), 0 4px 8px 3px rgb(var(--md-shadow) / .15)',
        el4: '0 2px 3px rgb(var(--md-shadow) / .3), 0 6px 10px 4px rgb(var(--md-shadow) / .15)',
      },
      // Motion Material 3 Expressive: spring (xem biến --spring* trong src/index.css)
      transitionTimingFunction: {
        spring: 'var(--spring)',
        'spring-fast': 'var(--spring-fast)',
        'spring-damped': 'var(--spring-damped)',
        effects: 'var(--effects)',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'none' } },
        pop: { from: { opacity: 0, transform: 'scale(.92)' }, to: { opacity: 1, transform: 'none' } },
        // Fade through: hiệu ứng chuyển trang của Material
        fadeThrough: { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'none' } },
        snack: { from: { opacity: 0, transform: 'translateY(12px) scale(.96)' }, to: { opacity: 1, transform: 'none' } },
        // Thanh tiến trình không xác định (linear progress indicator)
        loading: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(200%)' } },
        ripple: { from: { transform: 'scale(0)', opacity: 0.18 }, to: { transform: 'scale(1)', opacity: 0 } },
        // Loading indicator Expressive: hình khối xoay và co giãn liên tục
        morph: { '0%': { transform: 'rotate(0) scale(1)' }, '50%': { transform: 'rotate(180deg) scale(.72)' }, '100%': { transform: 'rotate(360deg) scale(1)' } },
      },
      animation: {
        fadeIn: 'fadeIn .2s var(--effects)',
        slideUp: 'slideUp .5s var(--spring) backwards',
        pop: 'pop .4s var(--spring-fast) backwards',
        fadeThrough: 'fadeThrough .45s var(--spring-damped) backwards',
        snack: 'snack .4s var(--spring-fast) backwards',
        loading: 'loading 1.2s cubic-bezier(.4,0,.2,1) infinite',
        ripple: 'ripple .6s var(--effects) forwards',
        morph: 'morph 1.6s var(--spring-damped) infinite',
      },
    },
  },
  plugins: [],
};
