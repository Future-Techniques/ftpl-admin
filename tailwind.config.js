/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f9f7fa',
          100: '#f3eff6',
          200: '#e7dfec',
          300: '#d3c4db',
          400: '#aa94b7',
          500: '#756387',
          600: '#574b66', // Authentic FTPL Primary Plum
          700: '#483d54',
          800: '#3a3144',
          900: '#2b2433',
          950: '#1b1621',
        },
        rose: {
          50: '#fdf8f9',
          100: '#fbf0f2',
          200: '#f6dfe3',
          300: '#edc2c8',
          400: '#e2a6af',
          500: '#d6969d', // Authentic FTPL Secondary Rose Gold
          600: '#c47983',
          700: '#a65a64',
          800: '#894851',
          900: '#723e45',
          950: '#412025',
        },
        surface: {
          base: '#f8f9fb', // Light clean body background
          card: '#ffffff', // Crisp white card
          card2: '#faf9fb',
          hover: '#f4eff6',
          border: '#e8e4ee',
          borderLight: '#f1edf5',
          muted: '#6b7280',
          dark: '#1e1b24',
          sidebar: '#574b66', // Website header plum for sidebar
          sidebarDark: '#483d54',
          sidebarLight: '#655776',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(87, 75, 102, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(87, 75, 102, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px -3px rgba(87, 75, 102, 0.15)',
      }
    },
  },
  plugins: [],
}
