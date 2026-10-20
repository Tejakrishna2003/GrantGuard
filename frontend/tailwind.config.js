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
          blue: "#003087",      // PayPal classic navy
          lightBlue: "#0070BA", // PayPal vibrant cyan
          teal: "#00CF92",
          dark: "#0F172A",
          surface: "#1E293B",
          border: "#334155"
        }
      }
    },
  },
  plugins: [],
}
