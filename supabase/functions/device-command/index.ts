import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const PARTICLE_API_URL = "https://api.particle.io/v1/devices";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
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
    const { device_id, command } = await req.json();

    console.log("[device-command] Received request:", JSON.stringify({ device_id, command }));

    if (!device_id) {
      console.error("[device-command] Missing device_id");
      return new Response(JSON.stringify({ error: "Missing device_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!command) {
      console.error("[device-command] Missing command");
      return new Response(JSON.stringify({ error: "Missing command" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const particleToken = Deno.env.get("PARTICLE_ACCESS_TOKEN");
    if (!particleToken) {
      console.error("[device-command] PARTICLE_ACCESS_TOKEN not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error: missing Particle token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Call Particle cloud function "control" on the device
    const particleUrl = `${PARTICLE_API_URL}/${device_id}/command`;
    const particleBody = `arg=${command}`;

    console.log("[device-command] === PARTICLE REQUEST ===");
    console.log("[device-command] URL:", particleUrl);
    console.log("[device-command] function name: command");
    console.log("[device-command] particle device ID:", device_id);
    console.log("[device-command] arg:", command);

    const particleResponse = await fetch(particleUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${particleToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: particleBody,
    });

    const particleResponseText = await particleResponse.text();

    console.log("[device-command] === PARTICLE RESPONSE ===");
    console.log("[device-command] status:", particleResponse.status);
    console.log("[device-command] statusText:", particleResponse.statusText);
    console.log("[device-command] body:", particleResponseText);

    let particleResult: unknown;
    try {
      particleResult = JSON.parse(particleResponseText);
    } catch {
      particleResult = particleResponseText;
    }

    if (!particleResponse.ok) {
      console.error("[device-command] === PARTICLE FAILED ===");
      console.error("[device-command] full error:", particleResponseText);

      return new Response(
        JSON.stringify({
          error: "Particle API error",
          particle_status: particleResponse.status,
          particle_statusText: particleResponse.statusText,
          particle_response: particleResult,
          particle_url: particleUrl,
          particle_function: "command",
          particle_device_id: device_id,
          particle_arg: command,
        }),
        {
          status: particleResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("[device-command] === SUCCESS ===");

    return new Response(
      JSON.stringify({
        success: true,
        particle_response: particleResult,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[device-command] Unhandled error:", message);
    return new Response(JSON.stringify({ error: "Internal error", message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
