import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };
}

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
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
      
      if (body._method === "PUT") {
        const sessionId = body.session_id;
        if (!sessionId) {
          return new Response(JSON.stringify({ error: "Missing session_id" }), {
            status: 400, headers: { "Content-Type": "application/json", ...cors },
          });
        }
        const { error } = await db.from("visitor_logs")
          .update({
            time_on_page: Math.round(body.time_on_page || 0),
            mouse_moves: Math.round(body.mouse_moves || 0),
            scroll_distance: Math.round(body.scroll_distance || 0),
            max_scroll: Math.round(body.max_scroll || 0),
            sections_viewed: body.sections_viewed,
            total_clicks: Math.round(body.total_clicks || 0),
            rage_clicks: Math.round(body.rage_clicks || 0),
            tab_switches: Math.round(body.tab_switches || 0),
            tab_hidden_time: Math.round(body.tab_hidden_time || 0),
            form_interactions: Math.round(body.form_interactions || 0),
            copy_events: Math.round(body.copy_events || 0),
            right_click_events: Math.round(body.right_click_events || 0),
            screen_orientation_changes: Math.round(body.screen_orientation_changes || 0),
            idle_time: Math.round(body.idle_time || 0),
            engagement_score: Math.round(body.engagement_score || 0),
            pages_visited: body.pages_visited,
            exit_url: body.exit_url,
            js_heap_size: body.js_heap_size,
            updated_at: new Date().toISOString(),
          })
          .eq("session_id", sessionId);
        if (error) throw error;
        return new Response(JSON.stringify({ data: { success: true } }), {
          headers: { "Content-Type": "application/json", ...cors },
        });
      }

      const { data: bannedCheck } = await db.from("banned_ips")
        .select("id")
        .eq("ip_address", ipAddress)
        .eq("is_active", true)
        .limit(1);
      
      if (bannedCheck && bannedCheck.length > 0) {
        return new Response(JSON.stringify({ error: "Blocked" }), {
          status: 403, headers: { "Content-Type": "application/json", ...cors },
        });
      }

      const ua = (body.user_agent || "").toLowerCase();
      let deviceType = "desktop";
      if (/mobile|android|iphone|ipod/.test(ua)) deviceType = "mobile";
      else if (/tablet|ipad/.test(ua)) deviceType = "tablet";
      else if (body.max_touch_points > 0 && body.screen_width && body.screen_width < 1200) deviceType = "tablet";

      let country = null;
      let city = null;
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}?fields=country,city`);
        if (geoRes.ok) {
          const geo = await geoRes.json();
          country = geo.country || null;
          city = geo.city || null;
        }
      } catch {}

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
        country,
        city,
        device_memory: body.device_memory,
        connection_type: body.connection_type,
        downlink: body.downlink,
        battery_level: body.battery_level != null ? Math.round(body.battery_level) : null,
        battery_charging: body.battery_charging,
        page_load_time: body.page_load_time != null ? Math.round(body.page_load_time) : null,
        dom_load_time: body.dom_load_time != null ? Math.round(body.dom_load_time) : null,
        referrer: body.referrer,
        referrer_domain: body.referrer_domain,
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        utm_term: body.utm_term,
        utm_content: body.utm_content,
        canvas_fingerprint: body.canvas_fingerprint,
        audio_fingerprint: body.audio_fingerprint,
        webgl_fingerprint: body.webgl_fingerprint,
        ad_blocker_detected: body.ad_blocker_detected,
        incognito_detected: body.incognito_detected,
        do_not_track: body.do_not_track,
        service_worker_support: body.service_worker_support,
        webgl_extensions: body.webgl_extensions,
        has_camera: body.has_camera,
        has_microphone: body.has_microphone,
        installed_plugins: body.installed_plugins,
        storage_quota: body.storage_quota,
        js_heap_size: body.js_heap_size,
      }).select().single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), {
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const sessionId = body.session_id;
      if (!sessionId) {
        return new Response(JSON.stringify({ error: "Missing session_id" }), {
          status: 400, headers: { "Content-Type": "application/json", ...cors },
        });
      }

      const { error } = await db.from("visitor_logs")
        .update({
          time_on_page: Math.round(body.time_on_page || 0),
          mouse_moves: Math.round(body.mouse_moves || 0),
          scroll_distance: Math.round(body.scroll_distance || 0),
          max_scroll: Math.round(body.max_scroll || 0),
          sections_viewed: body.sections_viewed,
          total_clicks: Math.round(body.total_clicks || 0),
          rage_clicks: Math.round(body.rage_clicks || 0),
          tab_switches: Math.round(body.tab_switches || 0),
          tab_hidden_time: Math.round(body.tab_hidden_time || 0),
          form_interactions: Math.round(body.form_interactions || 0),
          copy_events: Math.round(body.copy_events || 0),
          right_click_events: Math.round(body.right_click_events || 0),
          screen_orientation_changes: Math.round(body.screen_orientation_changes || 0),
          idle_time: Math.round(body.idle_time || 0),
          engagement_score: Math.round(body.engagement_score || 0),
          pages_visited: body.pages_visited,
          exit_url: body.exit_url,
          js_heap_size: body.js_heap_size,
          updated_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId);

      if (error) throw error;

      return new Response(JSON.stringify({ data: { success: true } }), {
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json", ...cors },
    });
  } catch (err) {
    console.error("track-visitor error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { "Content-Type": "application/json", ...cors },
    });
  }
});
