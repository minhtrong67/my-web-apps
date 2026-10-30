/** @type {import('tailwindcss').Config} */

// Colour roles (bg-surface, text-on-surface-variant, bg-primary-container ...)
// are declared in src/theme/colors.css (generated from the green seed) - the Material 3 colour roles.
// They are full CSS colours (oklch / color-mix), so opacity modifiers such as
// `bg-on-surface/12` are applied with color-mix instead of the rgb() alpha slot.
const role = (name) => `color-mix(in oklab, var(--md-${name}) calc(<alpha-value> * 100%), transparent)`;

const ROLES = [
  'primary', 'on-primary', 'primary-container', 'on-primary-container',
  'secondary', 'on-secondary', 'secondary-container', 'on-secondary-container',
  'tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container',
  'error', 'on-error', 'error-container', 'on-error-container',
  'background', 'on-background',
  'surface', 'on-surface', 'surface-variant', 'on-surface-variant',
  'outline', 'outline-variant', 'shadow', 'scrim',
  'inverse-surface', 'inverse-on-surface', 'inverse-primary', 'surface-tint',
  'surface-dim', 'surface-bright',
  'surface-container-lowest', 'surface-container-low', 'surface-container',
  'surface-container-high', 'surface-container-highest',
  // Semantic money colours
  'income', 'on-income', 'income-container', 'on-income-container',
  'expense', 'on-expense', 'expense-container', 'on-expense-container',
];

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Roboto Flex Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif'],
      },
      colors: Object.fromEntries(ROLES.map((r) => [r, role(r)])),
      // M3 type scale
      fontSize: {
        'display-lg': ['3.5625rem', { lineHeight: '4rem', letterSpacing: '-0.015em' }],
        'display-md': ['2.8125rem', { lineHeight: '3.25rem', letterSpacing: '0' }],
        'display-sm': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '0' }],
        'headline-lg': ['2rem', { lineHeight: '2.5rem', letterSpacing: '0' }],
        'headline-md': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '0' }],
        'headline-sm': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0' }],
        'title-lg': ['1.375rem', { lineHeight: '1.75rem', letterSpacing: '0' }],
        'title-md': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.009em', fontWeight: '500' }],
        'title-sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.007em', fontWeight: '500' }],
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.007em', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.04em', fontWeight: '500' }],
        'label-sm': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.045em', fontWeight: '500' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.03em' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.016em' }],
        'body-sm': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.033em' }],
      },
      // M3 Expressive shape scale (tokens in theme.css)
      borderRadius: {
        none: '0',
        xs: 'var(--shape-xs)',
        sm: 'var(--shape-sm)',
        DEFAULT: 'var(--shape-sm)',
        md: 'var(--shape-md)',
        lg: 'var(--shape-lg)',
        xl: 'var(--shape-lg-inc)',
        '2xl': 'var(--shape-xl)',
        '3xl': 'var(--shape-xl-inc)',
        '4xl': 'var(--shape-xxl)',
        full: 'var(--shape-full)',
      },
      boxShadow: {
        'elev-1': 'var(--elev-1)',
        'elev-2': 'var(--elev-2)',
        'elev-3': 'var(--elev-3)',
      },
      transitionTimingFunction: {
        spatial: 'var(--motion-spatial)',
        'spatial-fast': 'var(--motion-spatial-fast)',
        effects: 'var(--motion-effects)',
        emphasized: 'var(--motion-standard)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'fade-through': {
          '0%': { opacity: 0, transform: 'scale(0.98) translateY(4px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'sheet-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'sheet-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.92)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'menu-in': {
          '0%': { opacity: 0, transform: 'scale(0.95) translateY(-4px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms var(--motion-effects)',
        'fade-through': 'fade-through 450ms var(--motion-spatial) both',
        'slide-up': 'slide-up 500ms var(--motion-spatial) both',
        'sheet-up': 'sheet-up 500ms var(--motion-spatial) both',
        'sheet-right': 'sheet-right 500ms var(--motion-spatial) both',
        'scale-in': 'scale-in 400ms var(--motion-spatial) both',
        'menu-in': 'menu-in 300ms var(--motion-spatial-fast) both',
        shimmer: 'shimmer 1.6s infinite linear',
      },
    },
  },
  plugins: [],
};
