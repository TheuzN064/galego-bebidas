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
          DEFAULT: '#FF6B00',
          dark: '#E65A00',
          light: '#FF8533',
        },
        dark: {
          bg: '#0A0A0A',
          card: '#141414',
          border: '#262626',
          text: '#FAFAFA',
          muted: '#A3A3A3',
        },
      },
      fontFamily: {
        anton: ['var(--font-anton)'],
        manrope: ['var(--font-manrope)'],
        mono: ['var(--font-space-mono)'],
      },
    },
  },
  plugins: [],
}
export default config
