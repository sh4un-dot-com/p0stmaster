/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './p0stmaster.jsx',
    './components/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'ui-sans-serif', 'system-ui'],
        display: ['Sora', 'Space Grotesk', 'ui-sans-serif', 'system-ui'],
        gothic: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
