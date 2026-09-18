import animate from "tailwindcss-animate";

/**
 * Colours are CSS variables (see src/index.css) so the same components render
 * in two themes: the warm "staff" theme and the dark "ceo" command-centre theme.
 */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: v("brand-50"),
          100: v("brand-100"),
          200: v("brand-200"),
          300: v("brand-300"),
          500: v("brand-500"),
          600: v("brand-600"),
          DEFAULT: v("brand"),
          800: v("brand-800"),
          900: v("brand-900"),
          fg: v("brand-fg"),
        },
        forest: { 50: v("forest-50"), 100: v("forest-100"), DEFAULT: v("forest"), 600: v("forest-600") },
        kokoda: { 50: v("kokoda-50"), 100: v("kokoda-100"), DEFAULT: v("kokoda"), 700: v("kokoda-700") },
        danger: { 50: v("danger-50"), 100: v("danger-100"), DEFAULT: v("danger"), 700: v("danger-700") },
        ink: { DEFAULT: v("ink"), muted: v("ink-muted"), subtle: v("ink-subtle"), faint: v("ink-faint") },
        heading: v("heading"),
        canvas: v("canvas"),
        surface: { DEFAULT: v("surface"), sunken: v("surface-sunken"), hover: v("surface-hover"), raised: v("surface-raised") },
        field: v("field"),
        line: { DEFAULT: v("line"), strong: v("line-strong") },
        sidebar: v("sidebar"),
        topbar: v("topbar"),
      },
      borderRadius: {
        none: "0",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius)",
        lg: "var(--radius-card)",
        xl: "var(--radius-card)",
        "2xl": "var(--radius-hero)",
        full: "9999px",
      },
      fontFamily: {
        sans: ['"Manrope Variable"', "Manrope", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono Variable"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["11px", "16px"],
        xs: ["12px", "16px"],
        sm: ["13px", "20px"],
        base: ["14px", "22px"],
        lg: ["16px", "24px"],
        xl: ["19px", "26px"],
        "2xl": ["23px", "30px"],
        "3xl": ["28px", "34px"],
      },
      boxShadow: {
        pop: "var(--shadow-pop)",
        raise: "var(--shadow-raise)",
        card: "var(--shadow-card)",
      },
      keyframes: {
        "slide-in-right": { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        "slide-in-left": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
      },
      animation: {
        "slide-in-right": "slide-in-right 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        "slide-in-left": "slide-in-left 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [animate],
};
