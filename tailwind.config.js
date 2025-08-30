/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xxs: "0.625rem", // 10px
        xxx: "0.5rem", // 8px
        xxxx: "0.375rem", // 6px
      },
      colors: {
        // primary: "#22B453",
        // primary: "#105A88",
        primary: "#1BA390",
        "dark-primary": "#157D6E",
        secondary: "#11598A",
        "primary-light": "#32B0E0",
        "input-muted": "#9E9E9E",
        muted: {
          dark: "#747474",
        },
      },
    },
  },
  plugins: [],
};
