const v = (n) => `rgb(var(--${n}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: v('p'), ink: v('p-ink'), onp: v('on-p'),
        bg: v('bg'), surf: v('surf'), surf2: v('surf2'), line: v('line'),
        fg: v('fg'), muted: v('muted')
      },
      fontFamily: { sans: ['var(--font)'] }
    }
  },
  plugins: []
}
