import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        base: '18px', // Minimum for older users
        lg: '20px',
        xl: '24px',
        '2xl': '28px',
        '3xl': '32px',
      },
      minHeight: {
        touch: '48px', // Minimum touch target
      },
      minWidth: {
        touch: '48px',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
export default config
