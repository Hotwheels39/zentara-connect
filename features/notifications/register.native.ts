import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("[PushToken] Not a physical device, skipping");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log("[PushToken] Existing permission status:", existingStatus);
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log("[PushToken] Requested permission, result:", finalStatus);
  }

  if (finalStatus !== "granted") {
    console.log("[PushToken] Permission not granted, aborting");
    return null;
  }

  console.log("[PushToken] Permission granted");

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  console.log("[PushToken] Expo push token:", tokenData.data);
  return tokenData.data;
}
