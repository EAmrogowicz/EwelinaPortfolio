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
      },
      fontFamily: {
        primary: ["Roboto", "sans-serif"],
        accent: ["Marcellus", "serif"],
      },
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
