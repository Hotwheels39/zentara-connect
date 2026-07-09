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
    const { device_id, variable_name } = await req.json();

    if (!device_id) {
      return new Response(JSON.stringify({ error: "Missing device_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!variable_name) {
      return new Response(JSON.stringify({ error: "Missing variable_name" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const particleToken = Deno.env.get("PARTICLE_ACCESS_TOKEN");
    if (!particleToken) {
      return new Response(
        JSON.stringify({ error: "Server configuration error: missing Particle token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const particleUrl = `${PARTICLE_API_URL}/${device_id}/${variable_name}`;

    console.log("[device-variable] GET", particleUrl);

    const particleResponse = await fetch(particleUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${particleToken}`,
      },
    });

    const particleResponseText = await particleResponse.text();

    console.log("[device-variable] status:", particleResponse.status);
    console.log("[device-variable] body:", particleResponseText);

    let particleResult: unknown;
    try {
      particleResult = JSON.parse(particleResponseText);
    } catch {
      particleResult = particleResponseText;
    }

    if (!particleResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Particle API error",
          particle_status: particleResponse.status,
          particle_response: particleResult,
        }),
        {
          status: particleResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        particle_response: particleResult,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[device-variable] Unhandled error:", message);
    return new Response(JSON.stringify({ error: "Internal error", message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
