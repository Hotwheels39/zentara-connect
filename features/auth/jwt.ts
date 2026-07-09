import { Buffer } from "buffer";

export type JwtPayload = {
  iss?: unknown;
  aud?: unknown;
  exp?: unknown;
  sub?: unknown;
  ref?: unknown;
};

export function decodeJwtPayload(token: string | null | undefined): JwtPayload | null {
  if (!token) {
    return null;
  }

  const segments = token.split(".");

  if (segments.length < 2) {
    return null;
  }

  try {
    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as JwtPayload;
  } catch {
    return null;
  }
}

export function getJwtStringField(payload: JwtPayload | null, key: keyof JwtPayload) {
  const value = payload?.[key];
  return typeof value === "string" ? value : null;
}
