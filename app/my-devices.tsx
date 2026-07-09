import * as React from "react";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, View } from "react-native";
import { AppScreen } from "@/components/layout/app-screen";
import { useAuth } from "@/components/providers/AuthProvider";
import { useUserDevices } from "@/features/device/hooks";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function MyDevicesScreen() {
  const { isLoading: isAuthLoading, user } = useAuth();
  const devicesQuery = useUserDevices(user?.id);

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user]);

  if (isAuthLoading || !user) {
    return (
      <AppScreen contentClassName="flex-1 items-center justify-center py-10">
        <ActivityIndicator />
      </AppScreen>
    );
  }

  React.useEffect(() => {
    if (devicesQuery.data?.length === 1) {
      router.replace({
        pathname: "/controls",
        params: { deviceId: devicesQuery.data[0].deviceId },
      });
    }
  }, [devicesQuery.data]);

  if (devicesQuery.isLoading) {
    return (
      <AppScreen contentClassName="flex-1 items-center justify-center py-10">
        <ActivityIndicator />
        <Text className="mt-3 text-body text-muted-foreground">Loading devices...</Text>
      </AppScreen>
    );
  }

  if (devicesQuery.data?.length === 1) {
    return (
      <AppScreen contentClassName="flex-1 items-center justify-center py-10">
        <ActivityIndicator />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View className="gap-6">
        {/* Header */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 gap-1">
            <Text className="text-h1 text-foreground">My Devices</Text>
            <Text className="text-body text-muted-foreground">Select a Zentara device</Text>
          </View>
          <Button size="lg" onPress={() => router.push("/add-device")}>
            <Text className="text-button text-primary-foreground">Add Device</Text>
          </Button>
        </View>

        {/* Error state */}
        {devicesQuery.error ? (
          <View className="items-center gap-3 rounded-3xl border border-border bg-card px-5 py-10">
            <Text className="text-lg font-medium text-foreground">Unable to load devices</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Please check your connection and try again.
            </Text>
            <Button
              variant="outline"
              size="lg"
              className="mt-2"
              onPress={() => devicesQuery.refetch()}
            >
              <Text className="text-button text-foreground">Retry</Text>
            </Button>
          </View>
        ) : null}

        {/* Empty state */}
        {!devicesQuery.error && devicesQuery.data?.length === 0 ? (
          <View className="items-center gap-3 rounded-3xl border border-border bg-card px-5 py-10">
            <Text className="text-lg font-medium text-foreground">No devices yet</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Add a device using a claim code to get started.
            </Text>
            <Button size="lg" className="mt-2" onPress={() => router.push("/add-device")}>
              <Text className="text-button text-primary-foreground">Add Device</Text>
            </Button>
          </View>
        ) : null}

        {/* Device list */}
        {devicesQuery.data && devicesQuery.data.length > 0 ? (
          <View className="gap-3">
            {devicesQuery.data.map((device) => {
              const isOnline = device.deviceStatus?.toLowerCase() === "online";

              return (
                <Pressable
                  key={device.deviceId}
                  onPress={() => {
                    router.push({ pathname: "/controls", params: { deviceId: device.deviceId } });
                  }}
                >
                  <View className="gap-3 rounded-3xl border border-border bg-card p-5">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 gap-1">
                        <Text className="text-lg font-semibold text-foreground">
                          {device.deviceName}
                        </Text>
                        {device.deviceType ? (
                          <Text className="text-sm text-muted-foreground">{device.deviceType}</Text>
                        ) : null}
                      </View>
                      <View
                        className={
                          isOnline
                            ? "rounded-full bg-emerald-500/15 px-3 py-1"
                            : "rounded-full bg-muted px-3 py-1"
                        }
                      >
                        <Text
                          className={
                            isOnline
                              ? "text-xs font-medium text-emerald-600"
                              : "text-xs font-medium text-muted-foreground"
                          }
                        >
                          {isOnline ? "Online" : "Offline"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </AppScreen>
  );
}
