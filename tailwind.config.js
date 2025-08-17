module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'dark-purple': '#0f172a',
        'royal-purple': '#1e1b4b',
        'deep-purple': '#3b0764',
        'electric-purple': '#6d28d9',
        'neon-orange': '#ff4c29',
      },
    },
  },
  plugins: [],
}