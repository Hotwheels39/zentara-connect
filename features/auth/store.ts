import { create } from "zustand";

type AuthState = {
  authToken: string | null;
  lastLoginResponseKeys: string;
  authTokenSource: string;
  lastAuthorizationStartsWithBearerEyJ: boolean;
  lastAuthorizationLength: number;
  lastAuthorizationTokenPreview: string;
  setAuthToken: (authToken: string | null) => void;
  setLastLoginResponseKeys: (lastLoginResponseKeys: string) => void;
  setAuthTokenSource: (authTokenSource: string) => void;
  setLastAuthorizationDebug: (debug: {
    startsWithBearerEyJ: boolean;
    length: number;
    tokenPreview: string;
  }) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  authToken: null,
  lastLoginResponseKeys: "none",
  authTokenSource: "none",
  lastAuthorizationStartsWithBearerEyJ: false,
  lastAuthorizationLength: 0,
  lastAuthorizationTokenPreview: "missing",
  setAuthToken: (authToken) => set({ authToken: typeof authToken === "string" ? authToken : null }),
  setLastLoginResponseKeys: (lastLoginResponseKeys) => set({ lastLoginResponseKeys }),
  setAuthTokenSource: (authTokenSource) => set({ authTokenSource }),
  setLastAuthorizationDebug: ({ startsWithBearerEyJ, length, tokenPreview }) =>
    set({
      lastAuthorizationStartsWithBearerEyJ: startsWithBearerEyJ,
      lastAuthorizationLength: length,
      lastAuthorizationTokenPreview: tokenPreview,
    }),
}));
