/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7f3",
          100: "#dcece2",
          200: "#b9d9c6",
          300: "#8fc0a5",
          400: "#5fa17f",
          500: "#2f6f4f",
          600: "#275e42",
          700: "#204c36",
          800: "#1a3d2b",
          900: "#153122",
        },
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
