import * as React from "react";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, View } from "react-native";
import { AppScreen } from "@/components/layout/app-screen";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useUserDevices } from "@/features/device/hooks";
import type { UserDevice } from "@/features/device/api";
import { ZentaraLogo } from "@/components/zentara-logo";
import LucideIcon from "@/lib/icons/LucideIcon";

type DashboardDevice = {
  deviceId: string;
  deviceName: string;
  deviceType: string | null;
  deviceStatus: string | null;
  particleDeviceId: string | null;
  icon: string;
  category: string;
  route: "/controls" | "/toolbox-controls";
};

const FALLBACK_DEVICES: DashboardDevice[] = [
  {
    deviceId: "sniper-1",
    deviceName: "Sniper Unit 1",
    deviceType: "sniper",
    deviceStatus: "online",
    particleDeviceId: null,
    icon: "Crosshair",
    category: "Security",
    route: "/controls",
  },
  {
    deviceId: "toolbox-1",
    deviceName: "EasyReach Toolbox 1",
    deviceType: "toolbox",
    deviceStatus: "online",
    particleDeviceId: null,
    icon: "Box",
    category: "Toolbox",
    route: "/toolbox-controls",
  },
];

function isToolboxDevice(device: { deviceName: string; deviceType: string | null }): boolean {
  const name = device.deviceName.toLowerCase();
  const type = (device.deviceType ?? "").toLowerCase();
  return name.includes("toolbox") || name.includes("easyreach") || type.includes("toolbox");
}

function toDashboardDevice(device: UserDevice): DashboardDevice {
  const isToolbox = isToolboxDevice(device);
  return {
    deviceId: device.deviceId,
    deviceName: device.deviceName,
    deviceType: device.deviceType,
    deviceStatus: device.deviceStatus,
    particleDeviceId: device.particleDeviceId ?? device.particle_device_id ?? null,
    icon: isToolbox ? "Box" : "Crosshair",
    category: isToolbox ? "Toolbox" : "Security",
    route: isToolbox ? "/toolbox-controls" : "/controls",
  };
}

function buildDeviceList(apiDevices: UserDevice[] | undefined): DashboardDevice[] {
  const devices = (apiDevices ?? []).map(toDashboardDevice);

  const hasSniper = devices.some((d) => !isToolboxDevice(d));
  const hasToolbox = devices.some((d) => isToolboxDevice(d));

  if (!hasSniper) {
    devices.push(FALLBACK_DEVICES[0]);
  }
  if (!hasToolbox) {
    devices.push(FALLBACK_DEVICES[1]);
  }

  return devices;
}

export default function DashboardScreen() {
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

  return (
    <AppScreen>
      <View className="gap-6">
        <View className="items-center pb-2 pt-2">
          <ZentaraLogo />
        </View>

        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-xl font-semibold text-foreground">Your Devices</Text>
            <Text className="text-sm text-muted-foreground">{user.email}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            accessibilityLabel="Settings"
            hitSlop={8}
          >
            <LucideIcon name="Settings" className="text-muted-foreground" size={22} />
          </Pressable>
        </View>

        {devicesQuery.isLoading ? (
          <View className="items-center gap-3 py-10">
            <ActivityIndicator />
            <Text className="text-body text-muted-foreground">Loading devices...</Text>
          </View>
        ) : (
          <View className="gap-3">
            {buildDeviceList(devicesQuery.data ?? undefined).map((device) => {
              const isOnline = device.deviceStatus?.toLowerCase() === "online";

              return (
                <Pressable
                  key={device.deviceId}
                  onPress={() => {
                    router.push({
                      pathname: device.route,
                      params: {
                        deviceId: device.deviceId,
                        particleDeviceId: device.particleDeviceId ?? "",
                        deviceName: device.deviceName,
                        deviceStatus: device.deviceStatus ?? "",
                      },
                    });
                  }}
                >
                  <View className="flex-row items-center gap-4 rounded-2xl border border-border bg-card p-4">
                    <View className="h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <LucideIcon name={device.icon as any} className="text-primary" size={26} />
                    </View>

                    <View className="flex-1 gap-1">
                      <Text className="text-base font-semibold text-foreground">
                        {device.deviceName}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        Type: {device.category}
                      </Text>
                      <View className="flex-row items-center gap-1.5">
                        <View
                          className={
                            isOnline
                              ? "h-2 w-2 rounded-full bg-success"
                              : "h-2 w-2 rounded-full bg-muted-foreground"
                          }
                        />
                        <Text
                          className={
                            isOnline
                              ? "text-xs text-success"
                              : "text-xs text-muted-foreground"
                          }
                        >
                          Status: {isOnline ? "Online" : "Offline"}
                        </Text>
                      </View>
                    </View>

                    <LucideIcon name="ChevronRight" className="text-muted-foreground" size={18} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <Button
          variant="outline"
          size="lg"
          disabled={devicesQuery.isFetching}
          onPress={() => devicesQuery.refetch()}
        >
          <View className="flex-row items-center gap-2">
            <LucideIcon name="RefreshCw" className="text-foreground" size={16} />
            <Text className="text-button text-foreground">
              {devicesQuery.isFetching ? "Refreshing..." : "Refresh Devices"}
            </Text>
          </View>
        </Button>
      </View>
    </AppScreen>
  );
}
