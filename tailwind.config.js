/** @type {import('tailwindcss').Config} */
module.exports = {
  // Broaden content paths so Tailwind scans all HTML/JS files in the project.
  // This helps avoid missed classes when adding small partials or scripts.
  // Only scan project HTML and JS files and explicitly ignore node_modules and dist
  content: [
    "./index.html",
    "./script.js",
    "./**/*.{html,js}",
    "!./node_modules/**",
    "!./dist/**",
  ],
  // Safelist: include common utility classes that may be added at runtime
  // or generated dynamically so Purge doesn't remove them.
  safelist: [
    // simple utilities
    "hidden",
    "block",
    "flex",
    "grid",
    "inline-block",
    // state names used in your CSS (if you toggle them via JS)
    "active",
    // pattern-based utilities (text/bg colors, responsive variants...)
    { pattern: /^text-(?:accent|primary|muted|secondary)(?:-[0-9]{3})?$/ },
    { pattern: /^bg-(?:accent|primary|muted|light)(?:-[0-9]{3})?$/ },
    { pattern: /^from-/, variants: ["responsive"] },
    { pattern: /^to-/, variants: ["responsive"] },
  ],
  theme: {
    extend: {
      colors: {
        // Keep custom named colors but avoid overwriting Tailwind's
        // built-in gray scale by introducing a 'muted' token instead.
        accent: "#e76268",
        primary: "#1b232e",
        secondary: "#685769",
        muted: "#87839a",
        light: "#f5f5f5",
      },
      fontFamily: {
        primary: ["Roboto", "sans-serif"],
        accent: ["Marcellus", "serif"],
      },
      maxWidth: {
        container: "1240px",
      },
      // Sync with the CSS custom property --header-height (72px)
      spacing: {
        header: "72px",
      },
    },
  },
  plugins: [],
};
