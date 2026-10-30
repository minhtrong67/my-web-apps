/** Màu từ biến CSS có hỗ trợ độ trong suốt (bg-primary/10, text-ink/40...) qua color-mix */
const c = (name) => ({ opacityValue }) =>
  opacityValue === undefined
    ? `var(${name})`
    : `color-mix(in srgb, var(${name}) calc(${opacityValue} * 100%), transparent)`

/** @type {import('tailwindcss').Config} */
// Modern minimalist: bảng màu trung tính + 1 màu nhấn, bo góc nhỏ, đường kẻ mảnh thay cho đổ bóng,
// chữ gọn với tracking âm ở tiêu đề. Tên các vai trò màu giữ nguyên để component không phải đổi.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-family)', 'sans-serif']
      },
      colors: {
        // Thang 50–900 của màu nhấn đang chọn
        accent: {
          50: c('--accent-50'),
          100: c('--accent-100'),
          200: c('--accent-200'),
          300: c('--accent-300'),
          400: c('--accent-400'),
          500: c('--accent-500'),
          600: c('--accent-600'),
          700: c('--accent-700'),
          800: c('--accent-800'),
          900: c('--accent-900')
        },
        primary: c('--primary'),
        'on-primary': c('--on-primary'),
        'primary-container': c('--primary-container'),
        'on-primary-container': c('--on-primary-container'),
        'secondary-container': c('--secondary-container'),
        'on-secondary-container': c('--on-secondary-container'),
        tertiary: c('--tertiary'),
        'on-tertiary': c('--on-tertiary'),
        'tertiary-container': c('--tertiary-container'),
        'on-tertiary-container': c('--on-tertiary-container'),
        error: c('--error'),
        'on-error': c('--on-error'),
        'error-container': c('--error-container'),
        'on-error-container': c('--on-error-container'),
        'inverse-surface': c('--inverse-surface'),
        'inverse-on-surface': c('--inverse-on-surface'),
        'inverse-primary': c('--inverse-primary'),
        surface: {
          DEFAULT: c('--surface'),
          low: c('--surface-low'),
          container: c('--surface-container'),
          high: c('--surface-high'),
          highest: c('--surface-highest'),
          lowest: c('--surface-lowest'),
          soft: c('--surface-low'),
          raised: c('--surface-container')
        },
        card: c('--surface-lowest'),
        'on-surface': c('--ink'),
        'on-surface-variant': c('--ink-soft'),
        outline: c('--outline'),
        'outline-variant': c('--outline-variant'),
        ink: {
          DEFAULT: c('--ink'),
          soft: c('--ink-soft'),
          faint: c('--ink-faint')
        },
        border: c('--outline-variant')
      },
      // Bo góc nhỏ và đồng đều: 4 · 6 · 8 · 12 · 14 · 16
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '0.875rem',
        '3xl': '1rem'
      },
      // Thang chữ gọn: tiêu đề đậm vừa + tracking âm, nhãn nhỏ
      fontSize: {
        'display-md': ['2.5rem', { lineHeight: '2.75rem', letterSpacing: '-0.03em', fontWeight: '600' }],
        'headline-lg': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em', fontWeight: '600' }],
        'headline-md': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-sm': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em', fontWeight: '600' }],
        'title-lg': ['1.125rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title-md': ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.005em', fontWeight: '500' }],
        'title-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'body-lg': ['0.9375rem', { lineHeight: '1.5rem' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.125rem' }],
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'label-md': ['0.8125rem', { lineHeight: '1rem', fontWeight: '500' }],
        'label-sm': ['0.75rem', { lineHeight: '1rem', fontWeight: '500', letterSpacing: '0.01em' }]
      },
      // Gần như không đổ bóng; chỉ lớp phủ nổi (sheet, hộp thoại, toast) có bóng khuếch tán nhẹ
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.04)',
        card: '0 1px 2px rgb(0 0 0 / 0.05)',
        elevated: '0 12px 32px -8px rgb(0 0 0 / 0.18)'
      },
      transitionTimingFunction: {
        emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
        'emphasized-decel': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        'emphasized-accel': 'cubic-bezier(0.3, 0, 0.8, 0.15)'
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        'toast-in': { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pop: { '0%': { transform: 'scale(0.96)', opacity: 0.6 }, '100%': { transform: 'scale(1)', opacity: 1 } }
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out both',
        shimmer: 'shimmer 1.6s infinite linear',
        'toast-in': 'toast-in 0.2s cubic-bezier(0.2,0,0,1) both',
        pop: 'pop 0.2s ease-out both'
      }
    }
  },
  plugins: []
}
