import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutral Base
        bgPrimary: "#FAFBFC",
        bgSecondary: "#F5F7F9",
        bgTertiary: "#EEF2F7",
        textPrimary: "#1A2332",
        textSecondary: "#647281",
        borderLight: "#DDE3EB",
        borderDarker: "#C4D0DE",

        // Back Pain - Warm Rose
        backPrimary: "#D97462",
        backLight: "#F5CCC7",
        backDark: "#A52D28",
        backHover: "#EDBDB2",

        // Shoulder Pain - Warm Amber
        shoulderPrimary: "#E8A23D",
        shoulderLight: "#F5EDE1",
        shoulderDark: "#A5742D",
        shoulderHover: "#F2E3D0",

        // Knee Pain - Sage Green
        kneePrimary: "#6B9E8C",
        kneeLight: "#C8E6D7",
        kneeDark: "#4A6E61",
        kneeHover: "#B8DCC9",

        // Semantic Colors
        successPrimary: "#2EAE7E",
        successLight: "#D9F0E9",
        successDark: "#0D6A47",

        warningPrimary: "#D4A03D",
        warningLight: "#F2EBD9",
        warningDark: "#8A6B1F",

        dangerPrimary: "#C84C3D",
        dangerLight: "#F5E5E1",
        dangerDark: "#8A2D28",

        infoPrimary: "#4B7BA7",
        infoLight: "#E1EDF5",
        infoDark: "#1A4A7E",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        DEFAULT: "12px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(26, 35, 50, 0.04)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
