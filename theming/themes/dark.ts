import { Theme } from "../Theme";

const darkTheme: Theme = {
  name: "dark",
  colors: {
    background: "hsl(222 47% 7%)",
    foreground: "hsl(210 40% 98%)",
    card: "hsl(222 40% 11%)",
    cardForeground: "hsl(210 40% 98%)",
    popover: "hsl(222 40% 11%)",
    popoverForeground: "hsl(210 40% 98%)",
    primary: "hsl(217 91% 60%)",
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(220 30% 16%)",
    secondaryForeground: "hsl(210 40% 98%)",
    tertiary: "hsl(199 89% 48%)",
    tertiaryForeground: "hsl(0 0% 100%)",
    muted: "hsl(220 20% 16%)",
    mutedForeground: "hsl(215 15% 55%)",
    accent: "hsl(220 25% 18%)",
    accentForeground: "hsl(210 40% 98%)",
    success: "hsl(142 71% 45%)",
    successForeground: "hsl(0 0% 100%)",
    warning: "hsl(38 92% 50%)",
    warningForeground: "hsl(222 47% 7%)",
    destructive: "hsl(0 72% 51%)",
    destructiveForeground: "hsl(0 0% 100%)",
    border: "hsl(220 20% 18%)",
    notification: "hsl(220 20% 18%)",
    input: "hsl(220 20% 18%)",
    ring: "hsl(217 91% 60%)",
    overlay: "hsl(0 0% 0%)",
  },
  typography: {
    h1: {
      fontSize: "34px",
      fontFamily: "Inter_700Bold",
    },
    h2: {
      fontSize: "26px",
      fontFamily: "Inter_700Bold",
    },
    h3: {
      fontSize: "21px",
      fontFamily: "Inter_600SemiBold",
    },
    h4: {
      fontSize: "18px",
      fontFamily: "Inter_600SemiBold",
    },
    h5: {
      fontSize: "16px",
      fontFamily: "Inter_500Medium",
    },
    h6: {
      fontSize: "14px",
      fontFamily: "Inter_500Medium",
    },
    body: {
      fontSize: "15px",
      fontFamily: "Inter_400Regular",
    },
    caption: {
      fontSize: "12px",
      fontFamily: "Inter_300Light",
    },
    button: {
      fontSize: "16px",
      fontFamily: "Inter_500Medium",
    },
  },
};

export default darkTheme;
