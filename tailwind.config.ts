import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#84cc16',
          dark: '#65a30d',
          light: '#a3e635',
          glow: '#bef264',
        },
        dark: {
          bg: '#09090b',
          card: '#121215',
          'card-hover': '#18181d',
          border: '#27272a',
          text: '#f4f4f5',
          muted: '#a1a1aa',
        },
      },
      fontFamily: {
        anton: ['var(--font-anton)'],
        manrope: ['var(--font-manrope)'],
        mono: ['var(--font-space-mono)'],
      },
      boxShadow: {
        'lime-glow': '0 0 20px rgba(132, 204, 22, 0.35)',
        'lime-glow-lg': '0 0 35px rgba(132, 204, 22, 0.45)',
      },
    },
  },
  plugins: [],
}
export default config
