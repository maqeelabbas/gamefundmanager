/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2b7a0b",
        secondary: "#0369a1",
        accent: "#f97316",
        background: "#f8fafc",
        text: "#1e293b",
      },
    },
  },
  plugins: [],
}

