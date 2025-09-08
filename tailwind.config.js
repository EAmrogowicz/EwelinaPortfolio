/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        accent: "#e76268",
        primary: "#1b232e",
        secondary: "#685769",
        gray: "#87839a",
        light: "#f5f5f5",
      },
      fontFamily: {
        primary: ["Roboto", "sans-serif"],
        accent: ["Marcellus", "serif"],
      },
      // fontSize: {
      //   "h1-clamp": [
      //     "clamp(2.5rem, 3rem + 2vw, 4rem)",
      //     { lineHeight: "1.2", letterSpacing: "0.2rem" },
      //   ],
      //   "subtitle-clamp": [
      //     "clamp(1rem, 1.2rem + 1vw, 1.5rem)",
      //     { lineHeight: "1.2" },
      //   ],
      // },
      maxWidth: {
        container: "1240px",
      },
      spacing: {
        header: "72px",
      },
    },
  },
  plugins: [],
};
