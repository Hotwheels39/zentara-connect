import * as React from "react";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, View } from "react-native";
import { AppScreen } from "@/components/layout/app-screen";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/features/auth/store";
import { requireSupabase, supabaseUrl, supabaseAnonKey } from "@/lib/supabase";
import LucideIcon from "@/lib/icons/LucideIcon";
import { ZentaraLogo } from "@/components/zentara-logo";

export default function LoginScreen() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { isConfigured, isLoading, user } = useAuth();
  const setAuthToken = useAuthStore((state) => state.setAuthToken);
  const setLastLoginResponseKeys = useAuthStore((state) => state.setLastLoginResponseKeys);
  const setAuthTokenSource = useAuthStore((state) => state.setAuthTokenSource);

  React.useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, user]);

  async function handleSignIn() {
    if (!isConfigured) {
      setError("Supabase configuration is missing.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    console.log("[Login] === DIAGNOSTICS ===");
    console.log("[Login] supabaseUrl:", supabaseUrl);
    console.log("[Login] anonKey present:", Boolean(supabaseAnonKey));
    console.log("[Login] anonKey length:", supabaseAnonKey?.length ?? 0);

    let clientOk = false;
    try {
      requireSupabase();
      clientOk = true;
    } catch (e) {
      console.error("[Login] requireSupabase() failed:", e);
    }
    console.log("[Login] requireSupabase() ok:", clientOk);

    try {
      console.log("[Login] Connectivity test: fetching", `${supabaseUrl}/auth/v1/settings`);
      const testRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: { apikey: supabaseAnonKey },
      });
      console.log("[Login] Connectivity test status:", testRes.status);
    } catch (testErr) {
      console.error(
        "[Login] Connectivity test FAILED:",
        testErr instanceof Error ? testErr.message : testErr,
      );
    }

    try {
      const client = requireSupabase();
      console.log("[Login] Calling signInWithPassword for:", email.trim());
      const { data, error: signInError } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        console.error("[Login] signInError:", signInError.message);
        console.error("[Login] signInError name:", signInError.name);
        console.error("[Login] signInError status:", (signInError as any).status);
        throw signInError;
      }
      console.log("[Login] signIn succeeded");

      const topLevelKeys = Object.keys(data ?? {});
      const session = data.session;
      const sessionKeys = session && typeof session === "object" ? Object.keys(session) : [];
      const accessToken = session?.access_token ?? null;

      setLastLoginResponseKeys(
        `data: ${topLevelKeys.join(", ") || "none"} | session: ${sessionKeys.join(", ") || "none"}`,
      );
      setAuthTokenSource(`supabase.auth.signInWithPassword @ ${supabaseUrl}`);
      setAuthToken(accessToken);

      if (!session) {
        setAuthToken(null);
        throw new Error("No session returned from sign-in.");
      }

      if (!accessToken) {
        setAuthToken(null);
        throw new Error("No session access token returned from sign-in.");
      }

      router.replace("/dashboard");
    } catch (caughtError) {
      console.error("[Login] === SIGN IN FAILED ===");
      console.error("[Login] error type:", caughtError?.constructor?.name);
      console.error(
        "[Login] error message:",
        caughtError instanceof Error ? caughtError.message : String(caughtError),
      );
      console.error(
        "[Login] full error:",
        JSON.stringify(
          caughtError,
          Object.getOwnPropertyNames(caughtError instanceof Error ? caughtError : {}),
        ),
      );
      const message = caughtError instanceof Error ? caughtError.message : "Sign in failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppScreen contentClassName="flex-1 justify-center py-10">
      <View className="gap-8">
        <View className="items-center gap-4">
          <ZentaraLogo />
          <Text className="text-body leading-6 text-muted-foreground">
            Sign in to access your devices.
          </Text>
        </View>

        <View className="gap-4 rounded-3xl border border-border bg-card p-5">
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Email</Text>
            <Input
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Email"
              value={email}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Password</Text>
            <View className="relative">
              <Input
                autoCapitalize="none"
                autoComplete="password"
                className="pr-12"
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
              />
              <Pressable
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                accessibilityRole="button"
                className="absolute right-3 top-0 h-10 items-center justify-center native:h-12"
                onPress={() => setShowPassword((current) => !current)}
              >
                <LucideIcon
                  name={showPassword ? "EyeOff" : "Eye"}
                  className="text-muted-foreground"
                  size={18}
                  strokeWidth={2.2}
                />
              </Pressable>
            </View>
          </View>

          {error ? (
            <View className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <Text className="text-sm text-destructive">{error}</Text>
            </View>
          ) : null}

          <Button
            size="lg"
            disabled={isSubmitting || isLoading || !email.trim() || !password}
            onPress={handleSignIn}
          >
            {isSubmitting ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator />
                <Text className="text-button text-primary-foreground">Signing in...</Text>
              </View>
            ) : (
              <Text className="text-button text-primary-foreground">Sign in</Text>
            )}
          </Button>

          <Pressable
            accessibilityRole="button"
            className="items-center py-1"
            onPress={() => router.push("/signup")}
          >
            <Text className="text-sm text-muted-foreground">
              Need an account? <Text className="font-medium text-foreground">Sign up</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}
