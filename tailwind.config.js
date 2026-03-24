/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        flood: {
          bg: 'var(--flood-bg)',
          surface: 'var(--flood-surface)',
          surfaceSolid: 'var(--flood-surface-solid)',
          surfaceHover: 'var(--flood-surface-hover)',
          border: 'var(--flood-border)',
          text: 'var(--flood-text)',
          textMuted: 'var(--flood-text-muted)',
          accent: 'var(--flood-accent)',
          accentHover: 'var(--flood-accent-hover)',
          severe: 'var(--flood-severe)',
          warning: 'var(--flood-warning)',
          alert: 'var(--flood-alert)',
          safe: 'var(--flood-safe)',
          glass: 'var(--flood-glass)',
          glassBorder: 'var(--flood-glass-border)',
          glassGlow: 'var(--flood-glass-glow)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
