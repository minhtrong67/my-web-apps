/** Màu từ biến CSS có hỗ trợ độ trong suốt (bg-primary/10, text-on-surface/40...) qua color-mix */
const c = (name) => ({ opacityValue }) =>
  opacityValue === undefined
    ? `var(${name})`
    : `color-mix(in srgb, var(${name}) calc(${opacityValue} * 100%), transparent)`

const role = (name) => c(`--${name}`)

/** @type {import('tailwindcss').Config} */
// Material 3 Expressive (2026): màu vibrant theo tông màu chủ đạo, hình dạng bo lớn (28–48px),
// bề mặt "tonal" thay cho viền/đổ bóng, chuyển động lò xo (spring) có độ nảy.
// Toàn bộ vai trò màu được sinh tự động từ scripts/generate-theme.mjs.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-family)', 'sans-serif']
      },
      colors: {
        primary: role('primary'),
        'on-primary': role('on-primary'),
        'primary-container': role('primary-container'),
        'on-primary-container': role('on-primary-container'),
        secondary: role('secondary'),
        'on-secondary': role('on-secondary'),
        'secondary-container': role('secondary-container'),
        'on-secondary-container': role('on-secondary-container'),
        tertiary: role('tertiary'),
        'on-tertiary': role('on-tertiary'),
        'tertiary-container': role('tertiary-container'),
        'on-tertiary-container': role('on-tertiary-container'),
        error: role('error'),
        'on-error': role('on-error'),
        'error-container': role('error-container'),
        'on-error-container': role('on-error-container'),
        chay: role('chay'),
        'on-chay': role('on-chay'),
        'chay-container': role('chay-container'),
        'on-chay-container': role('on-chay-container'),
        holiday: role('holiday'),
        'on-holiday': role('on-holiday'),
        'holiday-container': role('holiday-container'),
        'on-holiday-container': role('on-holiday-container'),
        'inverse-surface': role('inverse-surface'),
        'inverse-on-surface': role('inverse-on-surface'),
        'inverse-primary': role('inverse-primary'),
        surface: {
          DEFAULT: role('surface'),
          dim: role('surface-dim'),
          bright: role('surface-bright'),
          lowest: role('surface-lowest'),
          low: role('surface-low'),
          container: role('surface-container'),
          high: role('surface-high'),
          highest: role('surface-highest')
        },
        'on-surface': role('on-surface'),
        'on-surface-variant': role('on-surface-variant'),
        outline: role('outline'),
        'outline-variant': role('outline-variant'),
        // Bí danh giữ tương thích với tên cũ
        card: role('surface-lowest'),
        ink: { DEFAULT: role('on-surface'), soft: role('on-surface-variant'), faint: role('outline') },
        border: role('outline-variant')
      },
      // Thang hình dạng Material 3 Expressive: 4 · 8 · 12 · 16 · 20 · 28 · 36 · 48
      borderRadius: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        '4xl': '3rem'
      },
      // Thang chữ Expressive: tiêu đề đậm, tracking âm, nhấn mạnh bằng độ đậm
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '3.75rem', letterSpacing: '-0.035em', fontWeight: '700' }],
        'display-md': ['2.75rem', { lineHeight: '3rem', letterSpacing: '-0.03em', fontWeight: '700' }],
        'headline-lg': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em', fontWeight: '700' }],
        'headline-md': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-sm': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em', fontWeight: '650' }],
        'title-lg': ['1.375rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em', fontWeight: '650' }],
        'title-md': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0', fontWeight: '600' }],
        'title-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem' }],
        'body-sm': ['0.75rem', { lineHeight: '1rem' }],
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', fontWeight: '600', letterSpacing: '0.02em' }],
        'label-sm': ['0.6875rem', { lineHeight: '1rem', fontWeight: '600', letterSpacing: '0.03em' }]
      },
      // Material 3 dùng "tonal elevation" (đổi màu bề mặt) là chính; bóng chỉ cho lớp nổi
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.04)',
        card: '0 1px 3px color-mix(in srgb, var(--shadow) 14%, transparent)',
        elevated: '0 8px 28px -6px color-mix(in srgb, var(--shadow) 28%, transparent), 0 2px 6px color-mix(in srgb, var(--shadow) 10%, transparent)',
        fab: '0 6px 18px -4px color-mix(in srgb, var(--primary) 55%, transparent), 0 2px 6px color-mix(in srgb, var(--shadow) 18%, transparent)'
      },
      transitionTimingFunction: {
        spatial: 'var(--ease-spatial)',
        'spatial-fast': 'var(--ease-spatial-fast)',
        'spatial-slow': 'var(--ease-spatial-slow)',
        effects: 'var(--ease-effects)',
        emphasized: 'var(--ease-emphasized)',
        'emphasized-decel': 'var(--ease-emphasized-decel)',
        'emphasized-accel': 'var(--ease-emphasized-accel)'
      },
      transitionDuration: {
        spatial: 'var(--dur-spatial)',
        'spatial-fast': 'var(--dur-spatial-fast)',
        'spatial-slow': 'var(--dur-spatial-slow)',
        effects: 'var(--dur-effects)'
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        rise: { '0%': { opacity: 0, transform: 'translateY(22px) scale(0.97)' }, '100%': { opacity: 1, transform: 'none' } },
        'pop-in': { '0%': { opacity: 0, transform: 'scale(0.6)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        'toast-in': { '0%': { opacity: 0, transform: 'translateY(24px) scale(0.92)' }, '100%': { opacity: 1, transform: 'none' } },
        spin: { to: { transform: 'rotate(360deg)' } }
      },
      animation: {
        'fade-in': 'fade-in var(--dur-effects) var(--ease-effects) both',
        rise: 'rise var(--dur-spatial) var(--ease-spatial) both',
        'pop-in': 'pop-in var(--dur-spatial-fast) var(--ease-spatial-fast) both',
        shimmer: 'shimmer 1.6s infinite linear',
        'toast-in': 'toast-in var(--dur-spatial) var(--ease-spatial) both'
      }
    }
  },
  plugins: []
}
