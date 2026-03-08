import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(supabaseUrl, serviceRoleKey);

  try {
    const body = await req.json();
    const { action, user_id, user_agent, browser, os, device_type } = body;

    // Resolve IP
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || req.headers.get("x-real-ip")
      || "unknown";

    if (action === "start") {
      if (!user_id) {
        return new Response(JSON.stringify({ error: "Missing user_id" }), {
          status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Geo-resolve IP
      let country: string | null = null;
      let city: string | null = null;
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}?fields=country,city`);
        if (geoRes.ok) {
          const geo = await geoRes.json();
          country = geo.country || null;
          city = geo.city || null;
        }
      } catch {}

      // Check if user is banned
      const { data: banCheck } = await db.from("user_bans")
        .select("id")
        .eq("user_id", user_id)
        .eq("is_active", true)
        .limit(1);

      if (banCheck && banCheck.length > 0) {
        return new Response(JSON.stringify({ error: "Account suspended", banned: true }), {
          status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Check if IP is banned
      const { data: ipBanCheck } = await db.from("banned_ips")
        .select("id")
        .eq("ip_address", ipAddress)
        .eq("is_active", true)
        .limit(1);

      if (ipBanCheck && ipBanCheck.length > 0) {
        return new Response(JSON.stringify({ error: "Access denied", ip_banned: true }), {
          status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Insert session with geo data
      const { data, error } = await db.from("user_sessions").insert({
        user_id,
        ip_address: ipAddress,
        user_agent: user_agent || null,
        browser: browser || null,
        os: os || null,
        device_type: device_type || null,
        country,
        city,
        is_active: true,
      }).select().single();

      if (error) throw error;

      // Log login activity
      await db.from("activity_logs").insert({
        user_id,
        action: "user_login",
        entity_type: "session",
        entity_id: data.id,
        ip_address: ipAddress,
        user_agent: user_agent || null,
        details: { browser, os, device_type, country, city },
      });

      // Record login attempt as successful
      await db.from("login_attempts").insert({
        email: body.email || "unknown",
        ip_address: ipAddress,
        user_agent: user_agent || null,
        success: true,
        country,
        city,
      });

      return new Response(JSON.stringify({ data, geo: { country, city, ip: ipAddress } }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (action === "end") {
      if (!user_id) {
        return new Response(JSON.stringify({ error: "Missing user_id" }), {
          status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const { error } = await db.from("user_sessions")
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq("user_id", user_id)
        .eq("is_active", true);

      if (error) throw error;

      // Log logout activity
      await db.from("activity_logs").insert({
        user_id,
        action: "user_logout",
        entity_type: "session",
        ip_address: ipAddress,
        user_agent: user_agent || null,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (action === "heartbeat") {
      if (!user_id) {
        return new Response(JSON.stringify({ error: "Missing user_id" }), {
          status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const { error } = await db.from("user_sessions")
        .update({ last_active_at: new Date().toISOString() })
        .eq("user_id", user_id)
        .eq("is_active", true);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("track-session error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
