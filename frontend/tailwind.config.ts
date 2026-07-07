import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        soft: 'var(--soft)',
        hero: 'var(--hero-bg)',
        footer: 'var(--footer-bg)',
        sale: 'var(--sale)',
        rent: 'var(--rent)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        whatsapp: 'var(--whatsapp)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      boxShadow: {
        soft: 'var(--shadow)',
      },
      fontFamily: {
        sans: ['var(--font-vazirmatn)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
