/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1E1A14",
        parchment: "#F3EEDE",
        parchment2: "#EAE2CC",
        chambers: "#16362B",
        chambersDark: "#0E241C",
        brass: "#B8863B",
        seal: "#8B3A2B",
        sage: "#7E9483",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["'Source Serif 4'", "serif"],
        ui: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
