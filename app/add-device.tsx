import * as React from "react";
import { router } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AppScreen } from "@/components/layout/app-screen";
import { useAuth } from "@/components/providers/AuthProvider";
import { useClaimDevice } from "@/features/device/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

export default function AddDeviceScreen() {
  const { isLoading: isAuthLoading, user } = useAuth();
  const claimMutation = useClaimDevice();
  const [claimCode, setClaimCode] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user]);

  async function handleAddDevice() {
    const trimmed = claimCode.trim();
    if (!trimmed) return;

    claimMutation.reset();
    setSuccess(false);

    try {
      await claimMutation.mutateAsync(trimmed);
      setSuccess(true);
      setTimeout(() => {
        router.replace("/my-devices");
      }, 1200);
    } catch {
      // error is captured in claimMutation.error
    }
  }

  if (isAuthLoading || !user) {
    return (
      <AppScreen contentClassName="flex-1 items-center justify-center py-10">
        <ActivityIndicator />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View className="gap-5">
        <View className="gap-1">
          <Text className="text-h1 text-foreground">Add Device</Text>
          <Text className="text-body text-muted-foreground">
            Enter your device code to link it to your account.
          </Text>
        </View>

        <View className="gap-4 rounded-3xl border border-border bg-card p-5">
          <View className="gap-2">
            <Text className="text-sm text-muted-foreground">Enter Device Code</Text>
            <Input
              placeholder="e.g. ABC-1234"
              value={claimCode}
              onChangeText={setClaimCode}
              autoCapitalize="characters"
              editable={!claimMutation.isPending && !success}
            />
          </View>

          <Button
            size="lg"
            disabled={claimMutation.isPending || !claimCode.trim() || success}
            onPress={handleAddDevice}
          >
            <Text className="text-button text-primary-foreground">
              {claimMutation.isPending ? "Adding..." : "Add Device"}
            </Text>
          </Button>
        </View>

        {claimMutation.isPending ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" />
            <Text className="text-body text-muted-foreground">Claiming device...</Text>
          </View>
        ) : null}

        {success ? (
          <View className="rounded-2xl border border-border bg-card px-4 py-3">
            <Text className="text-body text-foreground">Device added successfully</Text>
          </View>
        ) : null}

        {claimMutation.error && !success ? (
          <View className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3">
            <Text className="text-body text-destructive">
              {claimMutation.error instanceof Error
                ? claimMutation.error.message
                : "Failed to add device."}
            </Text>
          </View>
        ) : null}
      </View>
    </AppScreen>
  );
}
