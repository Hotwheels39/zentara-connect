import { Alert, Platform } from "react-native";
import { requireSupabase, supabaseAnonKey } from "@/lib/supabase";

const EDGE_BASE = "https://gfwbbepcfigutzfesxhf.supabase.co/functions/v1";
const sendNotificationUrl = `${EDGE_BASE}/send-notification`;

type SendPushNotificationParams = {
  userId: string;
  deviceId?: string;
  title: string;
  body: string;
  eventType?: string;
};

type SavePushTokenParams = {
  userId: string;
  deviceId: string;
  expoPushToken: string;
};

export async function savePushToken({ userId, deviceId, expoPushToken }: SavePushTokenParams) {
  const client = requireSupabase();

  const payload = {
    user_id: userId,
    device_id: deviceId,
    expo_push_token: expoPushToken,
    platform: Platform.OS,
    updated_at: new Date().toISOString(),
  };

  // Debug: check auth state before upsert
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  const session = sessionData?.session;
  const authUserId = session?.user?.id ?? "none";
  const authRole = session?.user?.role ?? "none";
  const hasSession = Boolean(session);

  console.log("[PushSave] === AUTH DEBUG ===");
  console.log("[PushSave] auth user id:", authUserId);
  console.log("[PushSave] user_id being sent:", userId);
  console.log("[PushSave] auth user === sent user:", authUserId === userId);
  console.log("[PushSave] has active session:", hasSession);
  console.log("[PushSave] session role:", authRole);
  console.log("[PushSave] session error:", sessionError?.message ?? "none");
  console.log("[PushSave] access_token preview:", session?.access_token?.slice(0, 20) ?? "missing");

  console.log("[PushSave] === PRE-UPSERT ===");
  console.log("[PushSave] user_id:", userId);
  console.log("[PushSave] device_id:", deviceId);
  console.log("[PushSave] expo_push_token:", expoPushToken);
  console.log("[PushSave] platform:", Platform.OS);
  console.log("[PushSave] Full payload:", JSON.stringify(payload, null, 2));

  Alert.alert(
    "[DEBUG] savePushToken",
    [
      `auth_user_id: ${authUserId}`,
      `sent_user_id: ${userId}`,
      `ids_match: ${authUserId === userId}`,
      `has_session: ${hasSession}`,
      `role: ${authRole}`,
      `device_id: ${deviceId}`,
      `token: ${expoPushToken?.slice(0, 30)}...`,
      `platform: ${Platform.OS}`,
    ].join("\n"),
  );

  const { error } = await client
    .from("push_tokens")
    .upsert(payload, { onConflict: "user_id,device_id" });

  if (error) {
    console.error("[PushSave] === UPSERT ERROR ===");
    console.error("[PushSave] message:", error.message);
    console.error("[PushSave] details:", error.details);
    console.error("[PushSave] hint:", error.hint);
    console.error("[PushSave] code:", error.code);
    console.error("[PushSave] Full error:", JSON.stringify(error, null, 2));

    Alert.alert(
      "[DEBUG] savePushToken ERROR",
      `message: ${error.message}\ndetails: ${error.details}\nhint: ${error.hint}\ncode: ${error.code}`,
    );

    throw error;
  }

  console.log("[PushSave] === UPSERT SUCCESS ===");
  Alert.alert("[DEBUG] savePushToken", "Upsert successful");
}

export async function sendPushNotification({
  userId,
  deviceId,
  title,
  body,
  eventType,
}: SendPushNotificationParams) {
  const client = requireSupabase();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  console.log("[SendNotification] fetch URL:", sendNotificationUrl);
  console.log("[SendNotification] session error:", sessionError?.message ?? "none");
  console.log("[SendNotification] has access_token:", Boolean(accessToken));
  console.log("[SendNotification] token preview:", accessToken?.slice(0, 20) ?? "missing");

  if (!accessToken) {
    const reason = sessionError?.message ?? "No active session";
    console.error("[SendNotification] Aborting — no valid access_token:", reason);
    throw new Error(`Cannot send notification: ${reason}`);
  }

  const response = await fetch(sendNotificationUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: supabaseAnonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      ...(deviceId ? { device_id: deviceId } : {}),
      title,
      body,
      ...(eventType ? { event_type: eventType } : {}),
    }),
  });

  const responseBodyText = await response.text();

  console.log("[SendNotification] === RESPONSE ===");
  console.log("[SendNotification] status:", response.status);
  console.log("[SendNotification] statusText:", response.statusText);
  console.log("[SendNotification] body:", responseBodyText);

  if (!response.ok) {
    console.error("[SendNotification] === FAILED ===");
    console.error("[SendNotification] status:", response.status);
    console.error("[SendNotification] statusText:", response.statusText);
    console.error("[SendNotification] body:", responseBodyText);

    Alert.alert(
      "[DEBUG] send-notification FAILED",
      `status: ${response.status}\nstatusText: ${response.statusText}\nbody: ${responseBodyText}`,
    );

    throw new Error(`send-notification failed (${response.status}): ${responseBodyText}`);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(responseBodyText);
  } catch {
    payload = responseBodyText;
  }

  console.log("[SendNotification] === SUCCESS ===");
  console.log("[SendNotification] parsed payload:", JSON.stringify(payload));

  return payload;
}
