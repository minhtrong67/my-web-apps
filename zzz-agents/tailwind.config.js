const v = (n) => `rgb(var(--${n}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { bg: v('bg'), surface: v('surface'), fg: v('fg'), muted: v('muted'), line: v('line'), p: v('p'), pt: v('pt'), onp: v('onp') },
      fontFamily: { app: 'var(--font)', mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'] }
    }
  }
}
