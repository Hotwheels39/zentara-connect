import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { user_id, device_id, title, body, event_type } = await req.json();

    // Validate required fields
    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          details: "user_id, title, and body are required",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create Supabase client with service role for DB access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up push tokens for this user (and optionally device)
    let query = supabase.from("push_tokens").select("expo_push_token").eq("user_id", user_id);

    if (device_id) {
      query = query.eq("device_id", device_id);
    }

    const { data: tokens, error: dbError } = await query;

    if (dbError) {
      return new Response(
        JSON.stringify({
          error: "Database error",
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
          code: dbError.code,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No push tokens found",
          user_id,
          device_id: device_id ?? null,
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Build Expo push messages
    const messages = tokens.map((row: { expo_push_token: string }) => ({
      to: row.expo_push_token,
      sound: "default",
      title,
      body,
      data: {
        user_id,
        device_id: device_id ?? null,
        event_type: event_type ?? null,
      },
    }));

    // Send to Expo push service
    const expoResponse = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const expoResult = await expoResponse.json();

    if (!expoResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Expo push service error",
          status: expoResponse.status,
          expo_response: expoResult,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check for per-ticket errors
    const tickets = expoResult.data ?? [];
    const errors = tickets.filter((t: { status: string }) => t.status === "error");

    return new Response(
      JSON.stringify({
        success: true,
        sent: tickets.length,
        errors: errors.length,
        tickets,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: "Internal error", message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
