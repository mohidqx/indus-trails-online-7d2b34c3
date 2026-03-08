import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const db = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: role } = await db
      .from("user_roles").select("role")
      .eq("user_id", user.id).eq("role", "admin").maybeSingle();

    if (!role) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch all data in parallel
    const [
      bookingsRes, toursRes, vehiclesRes, hotelsRes, dealsRes, destinationsRes,
      feedbackRes, contactRes, blogRes, galleryRes, newsletterRes,
      activityRes, visitorRes, loginAttemptsRes, bannedIpsRes, userBansRes,
      userSessionsRes, loyaltyRes, referralsRes, abandonedRes, siteContentRes,
      siteSettingsRes, userRolesRes, profilesRes, usersRes,
    ] = await Promise.all([
      db.from("bookings").select("*").limit(5000),
      db.from("tours").select("*"),
      db.from("vehicles").select("*"),
      db.from("hotels").select("*"),
      db.from("deals").select("*"),
      db.from("destinations").select("*"),
      db.from("feedback").select("*"),
      db.from("contact_messages").select("*"),
      db.from("blog_posts").select("*"),
      db.from("gallery_photos").select("*"),
      db.from("newsletter_subscribers").select("*"),
      db.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(5000),
      db.from("visitor_logs").select("*").order("created_at", { ascending: false }).limit(5000),
      db.from("login_attempts").select("*").order("created_at", { ascending: false }).limit(5000),
      db.from("banned_ips").select("*"),
      db.from("user_bans").select("*"),
      db.from("user_sessions").select("*").order("created_at", { ascending: false }).limit(5000),
      db.from("loyalty_points").select("*"),
      db.from("referrals").select("*"),
      db.from("abandoned_bookings").select("*"),
      db.from("site_content").select("*"),
      db.from("site_settings").select("*"),
      db.from("user_roles").select("*"),
      db.from("profiles").select("*"),
      db.auth.admin.listUsers(),
    ]);

    const users = usersRes.data?.users?.map(u => ({
      id: u.id, email: u.email, created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at, phone: u.phone,
    })) || [];

    const exportData = {
      exported_at: new Date().toISOString(),
      exported_by: user.email,
      data: {
        users,
        profiles: profilesRes.data || [],
        user_roles: userRolesRes.data || [],
        bookings: bookingsRes.data || [],
        tours: toursRes.data || [],
        vehicles: vehiclesRes.data || [],
        hotels: hotelsRes.data || [],
        deals: dealsRes.data || [],
        destinations: destinationsRes.data || [],
        feedback: feedbackRes.data || [],
        contact_messages: contactRes.data || [],
        blog_posts: blogRes.data || [],
        gallery_photos: galleryRes.data || [],
        newsletter_subscribers: newsletterRes.data || [],
        activity_logs: activityRes.data || [],
        visitor_logs: visitorRes.data || [],
        login_attempts: loginAttemptsRes.data || [],
        banned_ips: bannedIpsRes.data || [],
        user_bans: userBansRes.data || [],
        user_sessions: userSessionsRes.data || [],
        loyalty_points: loyaltyRes.data || [],
        referrals: referralsRes.data || [],
        abandoned_bookings: abandonedRes.data || [],
        site_content: siteContentRes.data || [],
        site_settings: siteSettingsRes.data || [],
      },
    };

    return new Response(JSON.stringify(exportData), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="indus-tours-export-${new Date().toISOString().split("T")[0]}.json"`,
        ...corsHeaders,
      },
    });

  } catch (err) {
    console.error("api-export error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
