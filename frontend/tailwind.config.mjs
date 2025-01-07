// tailwind.config.js
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        charReveal: {
          "0%": { color: "white" },
          "100%": { color: "black" },
        },
      },
      animation: {
        "char-reveal": "charReveal 0.2s forwards",
      },
    },
  },
  plugins: [],
};
