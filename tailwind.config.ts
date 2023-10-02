import { type Config } from "tailwindcss";
export default {
  content: [
    "./framework/**/*.{html,tsx}",
    "./projects/**/*.{html,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;