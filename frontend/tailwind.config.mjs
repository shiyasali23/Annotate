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
        dropdown: {
          '0%': { transform: 'translateY(-50%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        "char-reveal": "charReveal 0.2s forwards",
        "dropdown" : "dropdown 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
