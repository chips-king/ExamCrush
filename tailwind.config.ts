import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        paper: "#f7f6f2",
        line: "#d8d2c4",
        mint: "#2f7d69",
        tomato: "#c7503f"
      },
      boxShadow: {
        panel: "0 1px 0 rgba(31, 41, 51, 0.08), 0 12px 30px rgba(31, 41, 51, 0.08)"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
