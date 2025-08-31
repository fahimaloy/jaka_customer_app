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
        // Modern Restaurant/Kiosk themed colors - inspired by Foodpanda, Swiggy, Zomato
        primary: "#FF6B35", // Vibrant orange-red (Foodpanda inspired)
        "primary-dark": "#E55A2B", // Darker variant for hover
        "primary-light": "#FF8B5A", // Lighter variant
        secondary: "#FF4757", // Bold red (Zomato inspired)
        "secondary-dark": "#FF3742", 
        accent: "#FFB52A", // Golden amber (Swiggy inspired)
        "accent-dark": "#FF9500",
        tertiary: "#6C5CE7", // Purple for contrast
        "tertiary-light": "#A29BFE",
        success: "#00D4AA", // Modern teal green
        "success-light": "#26F0C7",
        warning: "#FFD93D", // Bright yellow
        danger: "#FF6B6B", // Coral red
        "food-orange": "#FF6348", // Tomato orange
        "food-green": "#2ED573", // Fresh green
        "food-purple": "#5742FF", // Violet
        "food-pink": "#FF6B9D", // Pink
        "bg-warm": "#FFF8F3", // Warm white background
        "bg-light": "#FFEAA7", // Light yellow background
        "text-warm": "#2C2C2C", // Warm dark text
        "text-muted": "#6C7B7F", // Muted text
        "overlay-dark": "rgba(0, 0, 0, 0.8)", // Strong overlay
        "overlay-light": "rgba(255, 255, 255, 0.95)", // Light overlay
      },
    },
  },
  plugins: [],
};
