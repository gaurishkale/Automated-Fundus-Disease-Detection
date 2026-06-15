/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        medical: {
          50: "#f7fcff",
          100: "#edf9ff",
          200: "#d6f0ff",
          300: "#b6e3fb",
          500: "#2f9ecb",
          600: "#1f7ea5",
          700: "#186583",
          teal: "#0f8a8a",
        },
      },
      boxShadow: {
        soft: "0 8px 28px rgba(15, 101, 131, 0.08)",
      },
    },
  },
  plugins: [],
};
