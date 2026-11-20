import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F9FC",
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#5D7CF5",
          hover: "#4968E6",
          light: "#EEF2FE",
        },
        navy: {
          DEFAULT: "#253047",
          light: "#3A4B6E",
          muted: "#64748B",
        },
        mint: {
          DEFAULT: "#A7E6CC",
          light: "#E8FAF2",
          dark: "#1B8C5E",
        },
        peach: {
          DEFAULT: "#FFD8B1",
          light: "#FFF4E8",
          dark: "#B86200",
        },
        coral: {
          DEFAULT: "#FF6B6B",
          light: "#FFEAEB",
          dark: "#C92A2A",
        },
      },
      borderRadius: {
        "xl": "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        "playful": "0 4px 0 0 rgba(37, 48, 71, 0.08), 0 8px 24px -4px rgba(37, 48, 71, 0.06)",
        "playful-hover": "0 6px 0 0 rgba(37, 48, 71, 0.12), 0 14px 28px -4px rgba(37, 48, 71, 0.08)",
        "chunky": "3px 3px 0px 0px #253047",
        "chunky-sm": "2px 2px 0px 0px #253047",
        "chunky-lg": "4px 4px 0px 0px #253047",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
