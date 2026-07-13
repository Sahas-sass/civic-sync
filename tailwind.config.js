/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primaryBlue: '#0066cc',
        textDark: '#1a1a1a',
        textLight: '#757575',
        background: '#f8fafc',
        surface: '#ffffff',
      }
    },
  },
  plugins: [],
}
