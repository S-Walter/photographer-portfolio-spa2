/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#0a0a0a',
          light: '#1a1a1a',
          card: 'rgba(255,255,255,0.04)',
        },
        accent: {
          DEFAULT: '#ffffff',
          muted: 'rgba(255,255,255,0.6)',
        },
      },
    },
  },
  plugins: [],
};
