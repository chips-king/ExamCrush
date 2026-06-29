import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        mint: "rgb(var(--color-mint) / <alpha-value>)",
        tomato: "rgb(var(--color-tomato) / <alpha-value>)"
      },
      boxShadow: {
        panel: "var(--shadow-panel)"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
