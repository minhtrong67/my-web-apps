/** @type {import('tailwindcss').Config} */
// Màu của app đến từ src/styles/theme.css (Material 3 Expressive, seed teal). Các "vai trò" --c-* trong src/index.css
// được suy ra từ token đó; ở đây chỉ ánh xạ chúng thành class Tailwind (bg-surface, text-on-surface, bg-primary/10…).
// `color-mix` cho phép dùng được cả modifier độ trong suốt của Tailwind.
const role = (name) => `color-mix(in oklab, var(--c-${name}) calc(<alpha-value> * 100%), transparent)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans Flex Variable"', '"Google Sans Flex"', '"Google Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Google Sans Flex Round"', '"Google Sans Flex Variable"', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: role('primary'),
        'on-primary': role('on-primary'),
        brand: role('brand'),
        popover: role('popover'),
        'popover-foreground': role('popover-foreground'),
        'primary-container': role('primary-container'),
        'on-primary-container': role('on-primary-container'),
        secondary: role('secondary'),
        'on-secondary': role('on-secondary'),
        tertiary: role('tertiary'),
        'on-tertiary': role('on-tertiary'),
        'secondary-container': role('secondary-container'),
        'on-secondary-container': role('on-secondary-container'),
        'tertiary-container': role('tertiary-container'),
        'on-tertiary-container': role('on-tertiary-container'),
        error: role('error'),
        'on-error': role('on-error'),
        'error-container': role('error-container'),
        'on-error-container': role('on-error-container'),
        background: role('surface'),
        surface: role('surface'),
        'surface-dim': role('surface-dim'),
        'surface-container-lowest': role('surface-container-lowest'),
        'surface-container-low': role('surface-container-low'),
        'surface-container': role('surface-container'),
        'surface-container-high': role('surface-container-high'),
        'surface-container-highest': role('surface-container-highest'),
        'on-surface': role('on-surface'),
        'on-surface-variant': role('on-surface-variant'),
        outline: role('outline'),
        'outline-variant': role('outline-variant'),
        'inverse-surface': role('inverse-surface'),
        'inverse-on-surface': role('inverse-on-surface'),
        'inverse-primary': role('inverse-primary'),
        mood: {
          great: '#F0A34E',
          good: '#8FBF7F',
          okay: '#9FB8C8',
          sad: '#7D8CB0',
          angry: '#C4676B'
        }
      },
      // Shape scale của M3 Expressive: xs 4 · sm 8 · md 12 · lg 16 · xl 28 · 2xl 32 · 3xl 48
      borderRadius: {
        xs: 'var(--shape-xs)',
        sm: 'var(--shape-sm)',
        md: 'var(--shape-md)',
        lg: 'var(--shape-lg)',
        xl: 'var(--shape-xl)',
        '2xl': 'var(--shape-xl-inc)',
        '3xl': 'var(--shape-xxl)'
      },
      // Đổ bóng theo level của M3 — phần lớn bề mặt phân tầng bằng sắc độ, không bằng bóng
      boxShadow: {
        'elev-1': 'var(--elev-1)',
        'elev-2': 'var(--elev-2)',
        'elev-3': 'var(--elev-3)',
        'elev-4': 'var(--elev-3)'
      },
      transitionTimingFunction: {
        emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
        'emphasized-decel': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        'emphasized-accel': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
        spring: 'var(--spring-default-spatial)',
        'spring-fast': 'var(--spring-fast-spatial)',
        'spring-slow': 'var(--spring-slow-spatial)'
      }
    }
  },
  plugins: []
}
