import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import {
  claimDevice,
  deviceCommand,
  fetchAssignedDevice,
  fetchDeviceById,
  fetchDeviceStatus,
  fetchDeviceVariable,
  fetchUserDevices,
  fetchUserToolboxDevice,
} from "@/features/device/api";

export type { DeviceCommand } from "@/features/device/api";

export function useDeviceById(deviceId: string | undefined) {
  return useQuery({
    queryKey: ["device", deviceId],
    enabled: Boolean(deviceId),
    queryFn: () => fetchDeviceById(deviceId!),
  });
}

export function useUserDevices(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-devices", userId],
    enabled: Boolean(userId),
    queryFn: () => fetchUserDevices(userId!),
  });
}

export function useAssignedDevice(user: User | null) {
  return useQuery({
    queryKey: ["assigned-device", user?.id],
    enabled: Boolean(user),
    queryFn: () => fetchAssignedDevice(user!),
  });
}

export function useUserToolboxDevice(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-toolbox-device", userId],
    enabled: Boolean(userId),
    queryFn: () => fetchUserToolboxDevice(userId!),
  });
}

export function useDeviceVariable(deviceId: string | null | undefined, variableName: string) {
  return useQuery({
    queryKey: ["device-variable", deviceId, variableName],
    enabled: Boolean(deviceId),
    queryFn: () => fetchDeviceVariable({ deviceId: deviceId!, variableName }),
    staleTime: 30_000,
  });
}

export function useDeviceBattery(deviceId: string | null | undefined) {
  return useQuery({
    queryKey: ["device-status", deviceId],
    enabled: Boolean(deviceId),
    queryFn: () => fetchDeviceStatus(deviceId!),
    staleTime: 30_000,
  });
}

export function useClaimDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimDevice,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-devices"] });
      void queryClient.invalidateQueries({ queryKey: ["assigned-device"] });
    },
  });
}

export function useDeviceCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deviceCommand,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["assigned-device"] });
      void queryClient.invalidateQueries({ queryKey: ["device"] });
    },
  });
}
