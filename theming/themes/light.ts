import { Theme } from "../Theme";

const lightTheme: Theme = {
  name: "light",
  colors: {
    background: "hsl(216 28% 96%)",
    foreground: "hsl(222 47% 11%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(222 47% 11%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(222 47% 11%)",
    primary: "hsl(217 91% 50%)",
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(214 32% 91%)",
    secondaryForeground: "hsl(222 47% 11%)",
    tertiary: "hsl(199 89% 48%)",
    tertiaryForeground: "hsl(0 0% 100%)",
    muted: "hsl(214 20% 92%)",
    mutedForeground: "hsl(215 16% 47%)",
    accent: "hsl(214 32% 91%)",
    accentForeground: "hsl(222 47% 11%)",
    success: "hsl(142 71% 36%)",
    successForeground: "hsl(0 0% 100%)",
    warning: "hsl(38 92% 50%)",
    warningForeground: "hsl(0 0% 100%)",
    destructive: "hsl(0 72% 48%)",
    destructiveForeground: "hsl(0 0% 100%)",
    border: "hsl(214 32% 85%)",
    notification: "hsl(214 32% 85%)",
    input: "hsl(214 32% 85%)",
    ring: "hsl(217 91% 50%)",
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

export default lightTheme;
