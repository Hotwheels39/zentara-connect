import * as React from "react";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, View } from "react-native";
import { AppScreen } from "@/components/layout/app-screen";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { requireSupabase } from "@/lib/supabase";
import LucideIcon from "@/lib/icons/LucideIcon";
import { ZentaraLogo } from "@/components/zentara-logo";

export default function SignUpScreen() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { isConfigured, isLoading, user } = useAuth();

  React.useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, user]);

  async function handleSignUp() {
    if (!isConfigured) {
      setError("Supabase configuration is missing.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const client = requireSupabase();
      const { data, error: signUpError } = await client.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        router.replace("/dashboard");
        return;
      }

      setMessage("Account created. Check your email to confirm your account, then sign in.");
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError.message : "Sign up failed.";
      setError(nextError);
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
            Create an account to access your devices.
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
                autoComplete="password-new"
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

          {message ? (
            <View className="rounded-2xl border border-border bg-card px-4 py-3">
              <Text className="text-sm text-foreground">{message}</Text>
            </View>
          ) : null}

          <Button
            size="lg"
            disabled={isSubmitting || isLoading || !email.trim() || !password}
            onPress={handleSignUp}
          >
            {isSubmitting ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator />
                <Text className="text-button text-primary-foreground">Creating account...</Text>
              </View>
            ) : (
              <Text className="text-button text-primary-foreground">Sign up</Text>
            )}
          </Button>

          <Pressable
            accessibilityRole="button"
            className="items-center py-1"
            onPress={() => router.replace("/login")}
          >
            <Text className="text-sm text-muted-foreground">
              Already have an account? <Text className="font-medium text-foreground">Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}
