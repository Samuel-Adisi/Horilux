import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette (Horilux brand guidelines)
        brand: {
          50: "#F3F0FA",
          100: "#E4DDF4",
          200: "#C9BCE9",
          300: "#9E88D4",
          500: "#4A2A9E",
          600: "#34118A",
          DEFAULT: "#240270",
          800: "#1B0156",
          900: "#12013B",
        },
        forest: {
          50: "#EAF2EA",
          100: "#CFE2CF",
          DEFAULT: "#003E03",
          600: "#1F5A22",
        },
        kokoda: {
          50: "#F6F2DD",
          100: "#EAE2B5",
          DEFAULT: "#7A6D0C",
          700: "#5F5409",
        },
        danger: {
          50: "#FBEDEC",
          100: "#F3D1CE",
          DEFAULT: "#A12C23",
          700: "#7F2019",
        },
        // Neutrals
        ink: {
          DEFAULT: "#17131F",
          muted: "#57535F",
          subtle: "#8A8693",
          faint: "#B4B0BA",
        },
        canvas: "#F6F5F1",
        surface: {
          DEFAULT: "#FFFFFF",
          sunken: "#FAF9F6",
          hover: "#F3F2EE",
        },
        line: {
          DEFAULT: "#E7E4DD",
          strong: "#D4D0C6",
        },
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "5px",
        lg: "6px",
        full: "9999px",
      },
      fontFamily: {
        sans: ['"Manrope Variable"', "Manrope", "system-ui", "sans-serif"],
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
        pop: "0 1px 2px rgba(23,19,31,0.06), 0 8px 24px -6px rgba(23,19,31,0.16)",
        raise: "0 1px 2px rgba(23,19,31,0.05)",
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
