import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

export const supabaseUrl = "https://gfwbbepcfigutzfesxhf.supabase.co";
export const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmd2JiZXBjZmlndXR6ZmVzeGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDE3MjksImV4cCI6MjA5MDU3NzcyOX0.yE5ICa8LP9Tu2_f0_uzc1PqTXm1Vj5rba45LpcsVtfw";
export const supabaseProjectRef = "gfwbbepcfigutzfesxhf";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const missingSupabaseConfigMessage =
  "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.";

const authOptions =
  Platform.OS === "web"
    ? {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      }
    : {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: AsyncStorage,
      };

declare global {
  var __sniperSupabaseClient__: SupabaseClient | undefined;
}

function createSupabaseSingleton() {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!globalThis.__sniperSupabaseClient__) {
    globalThis.__sniperSupabaseClient__ = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: authOptions,
    });
  }

  return globalThis.__sniperSupabaseClient__;
}

export const supabase = createSupabaseSingleton();

export function requireSupabase() {
  if (!supabase) {
    throw new Error(missingSupabaseConfigMessage);
  }

  return supabase;
}
