import "@/global.css";
import "@/appearance-polyfill";

import {
  Theme as NavigationTheme,
  ThemeProvider as NavigationThemeProvider,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";
import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useColorScheme } from "@/lib/useColorScheme";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider, useTheme } from "@/theming/ThemeProvider";
import darkTheme from "@/theming/themes/dark";
import lightTheme from "@/theming/themes/light";
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { PortalHost } from "@rn-primitives/portal";
import { WebPortalContext } from "@/components/WebPortalContext";
import * as SplashScreen from "expo-splash-screen";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRegisterPushToken } from "@/features/notifications/hooks";

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore splash init failures so the app can continue booting in preview.
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

function PushTokenRegistration() {
  const { user } = useAuth();
  useRegisterPushToken(user);
  return null;
}

function RootContent() {
  const hasMounted = React.useRef(false);
  const [portalContainer, setPortalContainer] = React.useState<View | null>(null);
  const [queryClient] = React.useState(() => new QueryClient());
  const { isDarkColorScheme } = useColorScheme();
  const { theme, setTheme } = useTheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const isLoadingFonts = !fontsLoaded && !fontError;

  const navigationTheme: NavigationTheme = React.useMemo(() => {
    const navigationThemeBase = isDarkColorScheme ? NavigationDarkTheme : NavigationDefaultTheme;
    const baseColors = navigationThemeBase.colors;
    return {
      ...navigationThemeBase,
      colors: {
        ...baseColors,
        background: theme.colors.background ?? baseColors.background,
        border: theme.colors.border ?? baseColors.border,
        card: theme.colors.card ?? baseColors.card,
        notification: theme.colors.destructive ?? baseColors.notification,
        primary: theme.colors.primary ?? baseColors.primary,
        text: theme.colors.foreground ?? baseColors.text,
      },
    };
  }, [theme, isDarkColorScheme]);

  React.useEffect(() => {
    if (isDarkColorScheme && theme.name !== "dark") {
      setTheme("dark");
    }
    if (!isDarkColorScheme && theme.name !== "light") {
      setTheme("light");
    }
  }, [isDarkColorScheme]);

  React.useEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web" && typeof document !== "undefined") {
      // Adds the background color to the html element to prevent white background on overscroll.
      // eslint-disable-next-line no-undef
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  React.useEffect(() => {
    if (!isLoadingFonts) {
      void SplashScreen.hideAsync().catch(() => {
        // Ignore splash hide failures in preview environments.
      });
    }
  }, [isLoadingFonts]);

  if (!isColorSchemeLoaded || isLoadingFonts) {
    return null;
  }

  return (
    <WebPortalContext.Provider
      value={{ container: portalContainer as unknown as HTMLElement | null }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PushTokenRegistration />
          <NavigationThemeProvider value={navigationTheme}>
            <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
            <Stack
              screenOptions={() => ({
                headerStyle: {
                  backgroundColor: theme.colors.background,
                  borderBottomColor: theme.colors.border,
                },
                headerTintColor: theme.colors.foreground,
                headerTitleAlign: "center",
                headerShadowVisible: false,
                animation: "fade",
                headerTitleStyle: {
                  fontFamily: theme.typography.h1?.fontFamily,
                },
              })}
            >
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="login"
                options={{
                  title: "Sign in",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="signup"
                options={{
                  title: "Sign up",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="dashboard"
                options={{
                  title: "Dashboard",
                }}
              />
              <Stack.Screen
                name="controls"
                options={{
                  title: "Sniper Controls",
                }}
              />
              <Stack.Screen
                name="toolbox-controls"
                options={{
                  title: "Toolbox Controls",
                }}
              />
              <Stack.Screen
                name="settings"
                options={{
                  title: "Settings",
                }}
              />
              <Stack.Screen
                name="+not-found"
                options={{
                  title: "Not Found",
                }}
              />
            </Stack>
            {
              // View used as a portal container on web
              <View
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: "none",
                }}
                ref={setPortalContainer}
              />
            }
            {
              // PortalHost used as a portal container on native
              <PortalHost />
            }
          </NavigationThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WebPortalContext.Provider>
  );
}

export default function RootLayout() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <ThemeProvider
      initialThemeName={isDarkColorScheme ? "dark" : "light"}
      themes={[lightTheme, darkTheme]}
    >
      <RootContent />
    </ThemeProvider>
  );
}
