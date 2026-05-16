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
        bgSecondary: "#F0F5FA",
        bgTertiary: "#E8F0F8",
        textPrimary: "#1A2332",
        textSecondary: "#647281",
        borderLight: "#D4DEE6",
        borderDarker: "#C4D0DE",

        // Back Pain - Warm Rose
        backPrimary: "#E84C3D",
        backLight: "#F5E5E1",
        backDark: "#A52D28",
        backHover: "#F2D5D0",

        // Shoulder Pain - Warm Amber
        shoulderPrimary: "#E8A23D",
        shoulderLight: "#F5EDE1",
        shoulderDark: "#A5742D",
        shoulderHover: "#F2E3D0",

        // Knee Pain - Warm Gold
        kneePrimary: "#D4A83D",
        kneeLight: "#F2EDE1",
        kneeDark: "#8A6F28",
        kneeHover: "#E8DCC4",

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

        infoPrimary: "#3D7EC8",
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
