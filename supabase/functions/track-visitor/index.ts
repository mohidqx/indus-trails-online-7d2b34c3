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
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || req.headers.get("x-real-ip")
      || "unknown";

    if (req.method === "POST") {
      const body = await req.json();
      
      // Detect device type from user agent
      const ua = (body.user_agent || "").toLowerCase();
      let deviceType = "desktop";
      if (/mobile|android|iphone|ipod/.test(ua)) deviceType = "mobile";
      else if (/tablet|ipad/.test(ua)) deviceType = "tablet";
      else if (body.max_touch_points > 0 && body.screen_width && body.screen_width < 1200) deviceType = "tablet";

      const { data, error } = await db.from("visitor_logs").insert({
        session_id: body.session_id,
        user_agent: body.user_agent,
        browser: body.browser,
        browser_version: body.browser_version,
        os: body.os,
        platform: body.platform,
        language: body.language,
        all_languages: body.all_languages,
        timezone: body.timezone,
        tz_offset: body.tz_offset,
        cookies_enabled: body.cookies_enabled,
        online: body.online,
        pdf_viewer: body.pdf_viewer,
        screen_width: body.screen_width,
        screen_height: body.screen_height,
        available_width: body.available_width,
        available_height: body.available_height,
        viewport_width: body.viewport_width,
        viewport_height: body.viewport_height,
        pixel_ratio: body.pixel_ratio,
        color_depth: body.color_depth,
        orientation: body.orientation,
        cpu_cores: body.cpu_cores,
        max_touch_points: body.max_touch_points,
        touch_support: body.touch_support,
        gpu_vendor: body.gpu_vendor,
        gpu_renderer: body.gpu_renderer,
        entry_url: body.entry_url,
        nav_type: body.nav_type,
        ip_address: ipAddress,
        device_type: deviceType,
      }).select().single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const sessionId = body.session_id;
      if (!sessionId) {
        return new Response(JSON.stringify({ error: "Missing session_id" }), {
          status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const { error } = await db.from("visitor_logs")
        .update({
          time_on_page: body.time_on_page,
          mouse_moves: body.mouse_moves,
          scroll_distance: body.scroll_distance,
          max_scroll: body.max_scroll,
          sections_viewed: body.sections_viewed,
          updated_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId);

      if (error) throw error;

      return new Response(JSON.stringify({ data: { success: true } }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("track-visitor error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
