/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primaryBlue: '#1E3A8A',
        secondaryBlue: '#3B82F6',
        textDark: '#0F172A',
        textLight: '#94A3B8',
        background: '#F8FAFC',
        surface: '#FFFFFF',
      }
    },
  },
  plugins: [],
}
