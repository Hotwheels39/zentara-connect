// Device API — deviceCommand → device-command, claimDevice → claim-device
import type { User } from "@supabase/supabase-js";
import { useAuthStore } from "@/features/auth/store";
import { requireSupabase, supabaseAnonKey } from "@/lib/supabase";

export type DeviceCommand =
  | "siren_on"
  | "siren_off"
  | "all_off"
  | "open_lid"
  | "close_lid"
  | "stop"
  | "toolbox_open"
  | "toolbox_close"
  | "open"
  | "close"
  | "beep";

const EDGE_BASE = "https://gfwbbepcfigutzfesxhf.supabase.co/functions/v1";
const deviceCommandUrl = `${EDGE_BASE}/device-command`;
const deviceVariableUrl = `${EDGE_BASE}/device-variable`;
const deviceStatusUrl = `${EDGE_BASE}/device-status`;
const claimDeviceUrl = `${EDGE_BASE}/claim-device`;

export type AssignedDevice = {
  deviceId: string;
  deviceName: string;
  deviceStatus: string | null;
  userEmail: string;
  particleDeviceId: string | null;
  particle_device_id?: string | null;
  particle_id?: string | null;
  external_id?: string | null;
};

type DeviceCommandParams = {
  deviceId: string;
  command: DeviceCommand;
};

export type UserDevice = {
  deviceId: string;
  deviceName: string;
  deviceType: string | null;
  deviceStatus: string | null;
  particleDeviceId: string | null;
  particle_device_id?: string | null;
  particle_id?: string | null;
  external_id?: string | null;
};

export async function fetchUserDevices(userId: string): Promise<UserDevice[]> {
  const client = requireSupabase();

  const { data: assignments, error: assignmentError } = await client
    .from("device_assignments")
    .select("device_id")
    .eq("user_id", userId);

  if (assignmentError) {
    throw assignmentError;
  }

  if (!assignments || assignments.length === 0) {
    return [];
  }

  const deviceIds = assignments.map((a) => a.device_id);

  const { data: devices, error: deviceError } = await client
    .from("devices")
    .select("*")
    .in("id", deviceIds);

  if (deviceError) {
    throw deviceError;
  }

  return (devices ?? []).map((d) => ({
    deviceId: d.id,
    deviceName: d.name,
    deviceType: d.type ?? null,
    deviceStatus: d.status ?? null,
    particleDeviceId: d.particle_device_id ?? d.particle_id ?? d.external_id ?? null,
    particle_device_id: d.particle_device_id ?? null,
    particle_id: d.particle_id ?? null,
    external_id: d.external_id ?? null,
  }));
}

export async function fetchDeviceById(deviceId: string): Promise<AssignedDevice | null> {
  const client = requireSupabase();

  const { data: device, error: deviceError } = await client
    .from("devices")
    .select("*")
    .eq("id", deviceId)
    .maybeSingle();

  if (deviceError) {
    throw deviceError;
  }

  if (!device) {
    return null;
  }

  return {
    deviceId: device.id,
    deviceName: device.name,
    deviceStatus: device.status,
    userEmail: "",
    particleDeviceId: device.particle_device_id ?? device.particle_id ?? device.external_id ?? null,
    particle_device_id: device.particle_device_id ?? null,
    particle_id: device.particle_id ?? null,
    external_id: device.external_id ?? null,
  };
}

export async function fetchAssignedDevice(user: User): Promise<AssignedDevice | null> {
  const client = requireSupabase();

  const { data: assignment, error: assignmentError } = await client
    .from("device_assignments")
    .select("device_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (assignmentError) {
    throw assignmentError;
  }

  if (!assignment?.device_id) {
    return null;
  }

  const { data: device, error: deviceError } = await client
    .from("devices")
    .select("*")
    .eq("id", assignment.device_id)
    .maybeSingle();

  if (deviceError) {
    throw deviceError;
  }

  if (!device) {
    throw new Error("Assigned device not found.");
  }

  return {
    deviceId: device.id,
    deviceName: device.name,
    deviceStatus: device.status,
    userEmail: user.email ?? "",
    particleDeviceId: device.particle_device_id ?? device.particle_id ?? device.external_id ?? null,
    particle_device_id: device.particle_device_id ?? null,
    particle_id: device.particle_id ?? null,
    external_id: device.external_id ?? null,
  };
}

export async function fetchUserToolboxDevice(userId: string): Promise<AssignedDevice | null> {
  const client = requireSupabase();

  const { data: assignments, error: assignmentError } = await client
    .from("device_assignments")
    .select("device_id")
    .eq("user_id", userId);

  if (assignmentError) {
    throw assignmentError;
  }

  if (!assignments || assignments.length === 0) {
    return null;
  }

  const deviceIds = assignments.map((a) => a.device_id);

  const { data: device, error: deviceError } = await client
    .from("devices")
    .select("*")
    .in("id", deviceIds)
    .eq("name", "EasyReach Toolbox 1")
    .maybeSingle();

  if (deviceError) {
    throw deviceError;
  }

  if (!device) {
    return null;
  }

  return {
    deviceId: device.id,
    deviceName: device.name,
    deviceStatus: device.status,
    userEmail: "",
    particleDeviceId: device.particle_device_id ?? device.particle_id ?? device.external_id ?? null,
    particle_device_id: device.particle_device_id ?? null,
    particle_id: device.particle_id ?? null,
    external_id: device.external_id ?? null,
  };
}

function getErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("message" in payload && typeof payload.message === "string" && payload.message.length > 0) {
    return payload.message;
  }

  if ("error" in payload && typeof payload.error === "string" && payload.error.length > 0) {
    return payload.error;
  }

  return null;
}

export async function deviceCommand({ deviceId, command }: DeviceCommandParams) {
  const { setLastAuthorizationDebug } = useAuthStore.getState();
  const normalizedAuthToken = supabaseAnonKey.trim();
  const authorizationHeader = `Bearer ${normalizedAuthToken}`;

  setLastAuthorizationDebug({
    startsWithBearerEyJ: authorizationHeader.startsWith("Bearer eyJ"),
    length: authorizationHeader.length,
    tokenPreview: normalizedAuthToken.slice(0, 20) || "missing",
  });

  const requestBody = { device_id: deviceId, command };

  console.log("[DeviceCommand] === REQUEST ===");
  console.log("[DeviceCommand] URL:", deviceCommandUrl);
  console.log("[DeviceCommand] body:", JSON.stringify(requestBody));

  const response = await fetch(deviceCommandUrl, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: authorizationHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const responseBodyText = await response.text();

  console.log("[DeviceCommand] === RESPONSE ===");
  console.log("[DeviceCommand] status:", response.status);
  console.log("[DeviceCommand] statusText:", response.statusText);
  console.log("[DeviceCommand] raw body:", responseBodyText);

  let payload: unknown;
  try {
    payload = JSON.parse(responseBodyText);
  } catch {
    payload = responseBodyText;
  }

  if (!response.ok) {
    console.error("[DeviceCommand] === FAILED ===");
    console.error("[DeviceCommand] status:", response.status);
    console.error("[DeviceCommand] full response:", responseBodyText);
    console.error("[DeviceCommand] sent body:", JSON.stringify(requestBody));

    const errorMessage =
      getErrorMessage(payload) ||
      (typeof payload === "string" && payload.length > 0 ? payload : null) ||
      `Request failed with status ${response.status}.`;

    throw new Error(errorMessage);
  }

  const particleReturn =
    payload &&
    typeof payload === "object" &&
    "particle_response" in payload &&
    payload.particle_response &&
    typeof payload.particle_response === "object" &&
    "return_value" in payload.particle_response
      ? (payload.particle_response as { return_value: number }).return_value
      : undefined;

  if (particleReturn !== undefined && particleReturn < 0) {
    console.error("[DeviceCommand] Firmware rejected command:", command, "return_value:", particleReturn);
    throw new Error("Device did not recognize that command.");
  }

  return payload;
}

type DeviceVariableParams = {
  deviceId: string;
  variableName: string;
};

export async function fetchDeviceVariable({ deviceId, variableName }: DeviceVariableParams): Promise<number | null> {
  const normalizedAuthToken = supabaseAnonKey.trim();

  const response = await fetch(deviceVariableUrl, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${normalizedAuthToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ device_id: deviceId, variable_name: variableName }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();

  const result = payload?.particle_response?.result;
  if (typeof result === "number") {
    return result;
  }

  return null;
}

export async function fetchDeviceStatus(deviceId: string): Promise<number | null> {
  const normalizedAuthToken = supabaseAnonKey.trim();

  const response = await fetch(deviceStatusUrl, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${normalizedAuthToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ device_id: deviceId }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();

  if (typeof payload?.battery === "number") {
    return payload.battery;
  }

  return null;
}

export async function claimDevice(claimCode: string) {
  const client = requireSupabase();
  const { data, error: sessionError } = await client.auth.getSession();
  const token = data.session?.access_token;

  if (sessionError) {
    throw sessionError;
  }

  if (!token) {
    throw new Error("Not authenticated.");
  }

  const response = await fetch(claimDeviceUrl, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ claim_code: claimCode }),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJsonResponse = contentType.includes("application/json");
  const payload = isJsonResponse ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      getErrorMessage(payload) ||
      (typeof payload === "string" && payload.length > 0 ? payload : null) ||
      `Request failed with status ${response.status}.`;

    throw new Error(errorMessage);
  }

  return payload;
}
