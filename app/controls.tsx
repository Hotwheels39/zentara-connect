import * as React from "react";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { ActivityIndicator, Pressable, View } from "react-native";

import { AppScreen } from "@/components/layout/app-screen";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ZentaraLogo } from "@/components/zentara-logo";
import LucideIcon from "@/lib/icons/LucideIcon";

import {
  type DeviceCommand,
  useAssignedDevice,
  useDeviceById,
  useDeviceCommand,
} from "@/features/device/hooks";

type CommandFeedback = {
  tone: "success" | "error";
  text: string;
};

export default function ControlsScreen() {
  const { deviceId: routeDeviceId } = useLocalSearchParams<{ deviceId?: string }>();
  const { isLoading: isAuthLoading, user } = useAuth();

  const deviceByIdQuery = useDeviceById(routeDeviceId);
  const assignedDeviceQuery = useAssignedDevice(!routeDeviceId ? user : null);

  const activeDeviceQuery = routeDeviceId ? deviceByIdQuery : assignedDeviceQuery;
  const commandMutation = useDeviceCommand();

  const [feedback, setFeedback] = React.useState<CommandFeedback | null>(null);

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user]);

  async function handleCommand(command: DeviceCommand) {
    const particleDeviceId =
      activeDeviceQuery.data?.particleDeviceId || activeDeviceQuery.data?.particle_device_id;

    if (!particleDeviceId) {
      setFeedback({ tone: "error", text: "No Particle device ID found." });
      return;
    }

    commandMutation.reset();
    setFeedback(null);

    try {
      await commandMutation.mutateAsync({
        deviceId: particleDeviceId,
        command,
      });

      setFeedback({ tone: "success", text: "Command sent successfully." });
    } catch (caughtError) {
      const errorMessage =
        caughtError instanceof Error ? caughtError.message : "Something went wrong. Try again.";
      setFeedback({ tone: "error", text: errorMessage });
    }
  }

  if (isAuthLoading || !user) {
    return (
      <AppScreen contentClassName="flex-1 items-center justify-center py-10">
        <ActivityIndicator />
      </AppScreen>
    );
  }

  if (activeDeviceQuery.isLoading) {
    return (
      <AppScreen contentClassName="flex-1 items-center justify-center py-10">
        <ActivityIndicator />
        <Text className="mt-3 text-body text-muted-foreground">Loading device...</Text>
      </AppScreen>
    );
  }

  if (activeDeviceQuery.error || !activeDeviceQuery.data) {
    return (
      <AppScreen>
        <View className="gap-5">
          <View className="items-center pt-2">
            <ZentaraLogo size="sm" />
          </View>

          <View className="items-center gap-3 rounded-2xl border border-border bg-card px-5 py-10">
            <Text className="text-lg font-medium text-foreground">No device found</Text>
            <Text className="text-center text-sm text-muted-foreground">
              {activeDeviceQuery.error instanceof Error
                ? "Unable to load device details. Please try again."
                : "This device is not available or has not been assigned."}
            </Text>

            <Button variant="outline" size="lg" className="mt-2" onPress={() => router.back()}>
              <Text className="text-button text-foreground">Go Back</Text>
            </Button>
          </View>
        </View>
      </AppScreen>
    );
  }

  const device = activeDeviceQuery.data;
  const isOnline = device.deviceStatus?.toLowerCase() === "online";
  const buttonsDisabled =
    commandMutation.isPending || (!device.particleDeviceId && !device.particle_device_id);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sniper Controls",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/settings")}
              accessibilityLabel="Settings"
              hitSlop={8}
            >
              <LucideIcon name="Settings" className="text-muted-foreground" size={22} />
            </Pressable>
          ),
        }}
      />
      <AppScreen>
        <View className="gap-6">
          <View className="items-center pt-2">
            <ZentaraLogo size="sm" />
          </View>

          <View className="gap-4 rounded-2xl border border-border bg-card p-5">
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <LucideIcon name="Crosshair" className="text-primary" size={24} />
                </View>
                <View className="gap-1">
                  <Text className="text-lg font-semibold text-foreground">{device.deviceName}</Text>
                  <Text className="text-xs text-muted-foreground">Security</Text>
                </View>
              </View>

              <View
                className={
                  isOnline
                    ? "rounded-full bg-success/15 px-3 py-1"
                    : "rounded-full bg-muted px-3 py-1"
                }
              >
                <Text
                  className={
                    isOnline
                      ? "text-xs font-medium text-success"
                      : "text-xs font-medium text-muted-foreground"
                  }
                >
                  {isOnline ? "Online" : "Offline"}
                </Text>
              </View>
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-sm font-medium text-muted-foreground">Actions</Text>

            <Button size="lg" disabled={buttonsDisabled} onPress={() => handleCommand("siren_on")}>
              <View className="flex-row items-center gap-2">
                <LucideIcon name="Volume2" className="text-primary-foreground" size={18} />
                <Text className="text-button text-primary-foreground">
                  {commandMutation.isPending && commandMutation.variables?.command === "siren_on"
                    ? "Sending..."
                    : "Siren ON"}
                </Text>
              </View>
            </Button>

            <Button
              size="lg"
              variant="secondary"
              disabled={buttonsDisabled}
              onPress={() => handleCommand("siren_off")}
            >
              <View className="flex-row items-center gap-2">
                <LucideIcon name="VolumeX" className="text-secondary-foreground" size={18} />
                <Text className="text-button text-secondary-foreground">
                  {commandMutation.isPending && commandMutation.variables?.command === "siren_off"
                    ? "Sending..."
                    : "Siren OFF"}
                </Text>
              </View>
            </Button>

            <Button
              variant="destructive"
              size="lg"
              disabled={buttonsDisabled}
              onPress={() => handleCommand("all_off")}
            >
              <View className="flex-row items-center gap-2">
                <LucideIcon name="Power" className="text-destructive-foreground" size={18} />
                <Text className="text-button text-destructive-foreground">
                  {commandMutation.isPending && commandMutation.variables?.command === "all_off"
                    ? "Sending..."
                    : "All OFF"}
                </Text>
              </View>
            </Button>
          </View>

          {feedback ? (
            <View
              className={
                feedback.tone === "error"
                  ? "rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3"
                  : "rounded-2xl border border-success/40 bg-success/10 px-4 py-3"
              }
            >
              <View className="flex-row items-center gap-2">
                <LucideIcon
                  name={feedback.tone === "error" ? "CircleAlert" : "CircleCheck"}
                  className={feedback.tone === "error" ? "text-destructive" : "text-success"}
                  size={16}
                />
                <Text
                  className={
                    feedback.tone === "error"
                      ? "text-body text-destructive"
                      : "text-body text-success"
                  }
                >
                  {feedback.text}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </AppScreen>
    </>
  );
}
