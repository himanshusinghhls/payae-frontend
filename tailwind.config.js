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
          brand: "#1c3166", 
          orange: "#f58220", 
          green: "#00a651",  
          accent: "#00E5FF", 
          success: "#00FF94", 
          card: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.1)",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
