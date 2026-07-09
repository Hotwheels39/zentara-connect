import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  requireSupabase,
  supabase,
  isSupabaseConfigured,
  missingSupabaseConfigMessage,
  supabaseUrl,
} from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/store";

type AuthContextValue = {
  isConfigured: boolean;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  error: string | null;
  refreshSession: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const setAuthToken = useAuthStore((state) => state.setAuthToken);
  const setAuthTokenSource = useAuthStore((state) => state.setAuthTokenSource);

  const applySession = React.useCallback(
    async (nextSession: Session | null, source: string) => {
      const nextToken = nextSession?.access_token ?? null;

      setSession(nextSession);
      setAuthToken(nextToken);
      setAuthTokenSource(source);
      setError(null);
    },
    [setAuthToken, setAuthTokenSource],
  );

  const refreshSession = React.useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError(missingSupabaseConfigMessage);
      setSession(null);
      setAuthToken(null);
      setAuthTokenSource("unconfigured");
      setIsLoading(false);
      return;
    }

    try {
      const client = requireSupabase();
      const { data, error: sessionError } = await client.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      await applySession(data.session, `supabase.auth.getSession @ ${supabaseUrl}`);
    } catch (caughtError) {
      setError(null);
      setSession(null);
      setAuthToken(null);
      setAuthTokenSource("session-error");
    } finally {
      setIsLoading(false);
    }
  }, [applySession, setAuthToken, setAuthTokenSource]);

  React.useEffect(() => {
    refreshSession();

    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      await applySession(nextSession, `supabase.auth.onAuthStateChange:${event} @ ${supabaseUrl}`);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [applySession, refreshSession]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      isConfigured: isSupabaseConfigured,
      isLoading,
      session,
      user: session?.user ?? null,
      error,
      refreshSession,
    }),
    [error, isLoading, refreshSession, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
