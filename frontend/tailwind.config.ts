import type { Config } from 'tailwindcss';

/**
 * TeamBoard "Ink & Patina" design tokens — the single source of truth for the whole
 * UI (docs/00 §6). Colours are the exact brand palette; type is Fraunces / Geist /
 * IBM Plex Mono; shadows are near-invisible; radii are crisp and editorial.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#121A22', // Drafting Ink — text, primary buttons
        slate: '#26323C', // Slate — dark surface, TODO status
        verdigris: {
          DEFAULT: '#4C8577', // primary accent, DONE status
          soft: '#E7EFEC',
        },
        brass: {
          DEFAULT: '#B4915B', // CTA / highlight, IN-PROGRESS status
          soft: '#F2EADB',
        },
        fog: '#E9E6DE', // app background
        bone: '#F5F3ED', // card surface
        paper: '#FBFAF6', // lightest surface
        line: 'rgba(18, 26, 34, 0.10)', // hairline borders
        muted: '#5C6771', // secondary text
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        control: '10px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(18,26,34,0.04), 0 10px 30px -14px rgba(18,26,34,0.12)',
        lift: '0 2px 10px rgba(18,26,34,0.06), 0 30px 60px -30px rgba(18,26,34,0.22)',
      },
      letterSpacing: {
        label: '0.2em',
      },
      maxWidth: {
        content: '76rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(3%, -4%, 0) scale(1.06)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        drift: 'drift 24s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
