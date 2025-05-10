/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0091ff',
        secondary: '#e0e0e0',
        light: '#ffffff',
        dark: '#191E29',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out forwards',
        'slideUp': 'slideUp 0.5s ease-in-out forwards',
        'slideDown': 'slideDown 0.5s ease-in-out forwards',
        'slideLeft': 'slideLeft 0.5s ease-in-out forwards',
        'slideRight': 'slideRight 0.5s ease-in-out forwards',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slowSpin': 'spin 20s linear infinite',
        'popHover': 'popHover 0.3s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        popHover: {
          '0%': { transform: 'scale(1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
          '100%': { transform: 'scale(1.05)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
        },
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {};
      // Create width percentages from 0 to 100 for progress bars
      for (let i = 0; i <= 100; i++) {
        newUtilities[`.w-progress-${i}`] = {
          width: `${i}%`,
        };
      }
      addUtilities(newUtilities);
    },
  ],
}