/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        payae: {
          bg: "#0A0F1C", 
          card: "rgba(255, 255, 255, 0.03)", 
          border: "rgba(255, 255, 255, 0.08)", 
          accent: "#00E5FF", 
          success: "#00FF94",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}