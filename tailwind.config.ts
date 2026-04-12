import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFFBF5",
        purple: "#6C5CE7",
        coral: "#FF6B6B",
        yellow: "#FDCB6E",
        charcoal: "#2D3436",
      },
      fontFamily: {
        sora: ["var(--font-sora)", "sans-serif"],
        "dm-sans": ["var(--font-dm-sans)", "sans-serif"],
        "space-grotesk": ["var(--font-space-grotesk)", "monospace"],
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #2D3436",
        "brutal-lg": "8px 8px 0px 0px #2D3436",
      },
    },
  },
  plugins: [],
};

export default config;
