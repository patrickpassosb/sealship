import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: 'var(--container-padding)',
      screens: {
        '2xl': 'var(--container-max)',
      },
    },
    extend: {
      colors: {
        background: 'var(--bg-primary)',
        foreground: 'var(--text-primary)',
        
        polkadot: {
          pink: 'var(--polkadot-pink)',
          'pink-light': 'var(--polkadot-pink-light)',
          purple: 'var(--polkadot-purple)',
          cyan: 'var(--polkadot-cyan)',
          green: 'var(--polkadot-green)',
          lime: 'var(--polkadot-lime)',
        },
        ocean: {
          deep: 'var(--ocean-deep)',
          dark: 'var(--ocean-dark)',
          mid: 'var(--ocean-mid)',
          light: 'var(--ocean-light)',
          surface: 'var(--ocean-surface)',
          foam: 'var(--ocean-foam)',
          spray: 'var(--ocean-spray)',
        },
        seal: {
          warm: 'var(--seal-warm)',
          light: 'var(--seal-light)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
        ocean: 'var(--shadow-ocean)',
      },
      animation: {
        wave: 'wave 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn var(--transition-slow) ease-out',
        'slide-up': 'slideUp var(--transition-slow) ease-out',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-6px) rotate(1deg)' },
          '66%': { transform: 'translateY(3px) rotate(-1deg)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
