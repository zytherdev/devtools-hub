/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        card: 'var(--bg-card)',
        body: 'var(--bg-body)',
        input: 'var(--bg-input)',
        'input-readonly': 'var(--bg-input-readonly)',
        hover: 'var(--bg-hover)',
        border: 'var(--border-color)',
        'border-focus': 'var(--border-focus)',
        muted: 'var(--text-muted)',
        badge: 'var(--badge-bg)',
        'badge-text': 'var(--badge-text)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
}