/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep emerald accent — used sparingly (primary actions, active
        // states) against a neutral zinc scale everywhere else.
        brand: {
          50: "#effcf6",
          100: "#d7f7e8",
          200: "#b0eed3",
          300: "#79dfb8",
          400: "#3fc998",
          500: "#18a87a",
          600: "#0e8763",
          700: "#0c6c51",
          800: "#0d5641",
          900: "#0b4737",
          950: "#04281f",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        card: "0 1px 2px 0 rgb(0 0 0 / 0.03), 0 8px 24px -8px rgb(0 0 0 / 0.10)",
        popover: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 12px 32px -8px rgb(0 0 0 / 0.16)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
