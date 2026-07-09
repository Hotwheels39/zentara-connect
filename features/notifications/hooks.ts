import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { savePushToken, sendPushNotification } from "@/features/notifications/api";
import { getExpoPushToken } from "@/features/notifications/register";
import { fetchUserDevices } from "@/features/device/api";

export function useSendPushNotification() {
  return useMutation({
    mutationFn: sendPushNotification,
  });
}

export function useRegisterPushToken(user: User | null) {
  const hasRegistered = React.useRef(false);

  React.useEffect(() => {
    if (!user || hasRegistered.current) {
      return;
    }

    let cancelled = false;

    async function register() {
      try {
        console.log("[PushReg] Starting registration for user:", user!.id);

        const token = await getExpoPushToken();
        if (!token || cancelled) {
          console.log("[PushReg] No token returned, aborting");
          return;
        }

        const devices = await fetchUserDevices(user!.id);
        console.log("[PushReg] Found devices:", devices.length);
        if (cancelled || devices.length === 0) return;

        for (const device of devices) {
          if (cancelled) return;
          console.log("[PushReg] Saving token for device:", device.deviceId);
          await savePushToken({
            userId: user!.id,
            deviceId: device.deviceId,
            expoPushToken: token,
          });
          console.log("[PushReg] Token saved for device:", device.deviceId);
        }

        hasRegistered.current = true;
        console.log("[PushReg] Registration complete");
      } catch (err) {
        console.error("[PushReg] Registration failed:", err);
      }
    }

    void register();

    return () => {
      cancelled = true;
    };
  }, [user]);
}
