import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        brand: {
          DEFAULT: '#0F6E56',
          light: '#E1F5EE',
          mid: '#1D9E75',
          dark: '#085041',
        },
        accent: {
          DEFAULT: '#185FA5',
          light: '#E6F1FB',
        },
        gold: {
          DEFAULT: '#BA7517',
          light: '#FAEEDA',
        },
      },
      borderRadius: {
        card: "12px",
        element: "8px",
        pill: "20px",
      },
      borderWidth: {
        'half': '0.5px',
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
};
export default config;
