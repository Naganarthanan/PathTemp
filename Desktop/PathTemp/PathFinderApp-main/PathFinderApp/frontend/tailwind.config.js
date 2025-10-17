/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "deep-navy": {
          500: "#1D1E2C",
          600: "#171825",
          700: "#121320",
        },
        "electric-blue": {
          500: "#2DE2E6",
          600: "#25C2C5",
        },
        "neon-pink": {
          500: "#FF6EC7",
          600: "#E55AB3",
        },
      },
      fontFamily: {
        english: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
