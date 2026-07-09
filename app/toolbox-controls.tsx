import * as React from "react";
import { router, Stack } from "expo-router";
import { ActivityIndicator, Pressable, View } from "react-native";

import { AppScreen } from "@/components/layout/app-screen";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ZentaraLogo } from "@/components/zentara-logo";
import LucideIcon from "@/lib/icons/LucideIcon";

import { useQueryClient } from "@tanstack/react-query";

import {
  type DeviceCommand,
  useDeviceBattery,
  useDeviceCommand,
  useUserToolboxDevice,
} from "@/features/device/hooks";

type CommandFeedback = {
  tone: "success" | "error";
  text: string;
};

export default function ToolboxControlsScreen() {
  const { isLoading: isAuthLoading, user } = useAuth();

  const toolboxQuery = useUserToolboxDevice(user?.id);
  const device = toolboxQuery.data ?? null;

  const resolvedParticleId =
    device?.particleDeviceId ||
    device?.particle_device_id ||
    null;

  const batteryQuery = useDeviceBattery(resolvedParticleId);
  const queryClient = useQueryClient();

  const commandMutation = useDeviceCommand();
  const [feedback, setFeedback] = React.useState<CommandFeedback | null>(null);

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user]);

  async function handleCommand(command: DeviceCommand) {
    if (!resolvedParticleId) {
      setFeedback({ tone: "error", text: "No Particle device ID found." });
      return;
    }

    commandMutation.reset();
    setFeedback(null);

    try {
      await commandMutation.mutateAsync({
        deviceId: resolvedParticleId,
        command,
      });

      const labels: Record<string, string> = {
        open: "Open command sent.",
        close: "Close command sent.",
        stop: "Stop command sent.",
        beep: "Beep command sent.",
      };

      setFeedback({ tone: "success", text: labels[command] ?? "Command sent successfully." });
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

  const isLoadingDevice = toolboxQuery.isLoading;

  if (isLoadingDevice) {
    return (
      <AppScreen contentClassName="flex-1 items-center justify-center py-10">
        <ActivityIndicator />
        <Text className="mt-3 text-body text-muted-foreground">Loading device...</Text>
      </AppScreen>
    );
  }

  const resolvedName = device?.deviceName || "EasyReach Toolbox 1";
  const resolvedStatus = device?.deviceStatus || "";
  const isOnline = resolvedStatus ? resolvedStatus.toLowerCase() === "online" : false;
  const isSending = commandMutation.isPending;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Toolbox Controls",
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
                  <LucideIcon name="Box" className="text-primary" size={24} />
                </View>
                <View className="gap-1">
                  <Text className="text-lg font-semibold text-foreground">{resolvedName}</Text>
                  <Text className="text-xs text-muted-foreground">EasyReach Toolbox</Text>
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

          <Button
            size="sm"
            variant="outline"
            onPress={() => {
              void queryClient.invalidateQueries({ queryKey: ["user-toolbox-device"] });
              void queryClient.invalidateQueries({ queryKey: ["device-status"] });
            }}
          >
            <View className="flex-row items-center gap-2">
              <LucideIcon name="RefreshCw" className="text-foreground" size={14} />
              <Text className="text-sm text-foreground">
                {toolboxQuery.isFetching || batteryQuery.isFetching
                  ? "Refreshing..."
                  : "Refresh Devices"}
              </Text>
            </View>
          </Button>

          <View className="flex-row gap-3">
            <View className="flex-1 rounded-2xl border border-border bg-card p-4">
              <View className="flex-row items-center gap-2">
                <LucideIcon name="DoorClosed" className="text-muted-foreground" size={16} />
                <Text className="text-xs text-muted-foreground">Lid Status</Text>
              </View>
              <Text className="mt-2 text-lg font-semibold text-foreground">Closed</Text>
            </View>

            <View className="flex-1 rounded-2xl border border-border bg-card p-4">
              <View className="flex-row items-center gap-2">
                <LucideIcon name="Battery" className="text-muted-foreground" size={16} />
                <Text className="text-xs text-muted-foreground">Battery Level</Text>
              </View>
              <Text className="mt-2 text-lg font-semibold text-foreground">
                {batteryQuery.data != null
                  ? `${batteryQuery.data.toFixed(1)}V`
                  : "--.-V"}
              </Text>
              {batteryQuery.data != null ? (
                <Text
                  className={
                    batteryQuery.data >= 12.7
                      ? "mt-1 text-xs font-medium text-success"
                      : batteryQuery.data >= 12.2
                        ? "mt-1 text-xs font-medium text-yellow-500"
                        : "mt-1 text-xs font-medium text-destructive"
                  }
                >
                  {batteryQuery.data >= 12.7
                    ? "Good"
                    : batteryQuery.data >= 12.2
                      ? "Medium"
                      : "Low"}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-sm font-medium text-muted-foreground">Toolbox Actions</Text>

            <Button
              size="lg"
              onPress={() => handleCommand("open")}
              className="bg-primary"
            >
              <View className="flex-row items-center gap-2">
                <LucideIcon name="FolderOpen" className="text-primary-foreground" size={18} />
                <Text className="text-button text-primary-foreground">
                  {isSending && commandMutation.variables?.command === "open"
                    ? "Sending..."
                    : "Open Toolbox"}
                </Text>
              </View>
            </Button>

            <Button
              size="lg"
              variant="secondary"
              onPress={() => handleCommand("close")}
            >
              <View className="flex-row items-center gap-2">
                <LucideIcon name="FolderClosed" className="text-secondary-foreground" size={18} />
                <Text className="text-button text-secondary-foreground">
                  {isSending && commandMutation.variables?.command === "close"
                    ? "Sending..."
                    : "Close Toolbox"}
                </Text>
              </View>
            </Button>

            <Button
              size="lg"
              variant="destructive"
              onPress={() => handleCommand("stop")}
            >
              <View className="flex-row items-center gap-2">
                <LucideIcon name="CircleStop" className="text-destructive-foreground" size={18} />
                <Text className="text-button text-destructive-foreground">
                  {isSending && commandMutation.variables?.command === "stop"
                    ? "Sending..."
                    : "Stop"}
                </Text>
              </View>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onPress={() => handleCommand("beep")}
            >
              <View className="flex-row items-center gap-2">
                <LucideIcon name="Bell" className="text-foreground" size={18} />
                <Text className="text-button text-foreground">
                  {isSending && commandMutation.variables?.command === "beep"
                    ? "Sending..."
                    : "Test Beeper"}
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
