import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        avi: {
          green: {
            DEFAULT: "#14452F",
            dark: "#0E3021",
            light: "#1F6647",
            subtle: "#E8F0EC",
          },
          orange: {
            DEFAULT: "#D9531E",
            dark: "#B84214",
            light: "#E36C3D",
            subtle: "#FDEEE8",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
