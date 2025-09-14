/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        borderGlow: "borderGlow 3s ease-in-out infinite",
      },
      keyframes: {
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(255,115,0,0.7)" },
          "50%": { borderColor: "rgba(138,43,226,0.7)" },
        },
      },
    },
  },
  plugins: [],
};
