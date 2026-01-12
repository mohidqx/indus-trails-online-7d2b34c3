import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    // Get IP and user agent for logging
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: role } = await db
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!role) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      
      if (body.type === "activity") {
        // Log activity
        const { error } = await db.from("activity_logs").insert({
          user_id: user.id,
          ip_address: ipAddress,
          user_agent: userAgent,
          action: body.action,
          entity_type: body.entity_type,
          entity_id: body.entity_id || null,
          details: body.details || null,
        });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (req.method === "GET") {
      // Return users list
      if (type === "users") {
        // Get all users from auth.users (requires service role)
        const { data: authUsers, error: authError } = await db.auth.admin.listUsers();
        
        if (authError) throw authError;

        // Get profiles
        const { data: profiles } = await db.from("profiles").select("*");
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Get roles
        const { data: roles } = await db.from("user_roles").select("user_id, role");
        const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

        // Combine data
        const users = authUsers.users.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          full_name: profileMap.get(u.id)?.full_name || null,
          phone: profileMap.get(u.id)?.phone || u.phone || null,
          avatar_url: profileMap.get(u.id)?.avatar_url || null,
          role: roleMap.get(u.id) || "user",
        }));

        return new Response(JSON.stringify({ data: users }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Return activity logs
      if (type === "activity") {
        const { data: logs, error } = await db
          .from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        return new Response(JSON.stringify({ data: logs }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Default: Return dashboard stats
      const [
        bookingsRes,
        toursRes,
        vehiclesRes,
        dealsRes,
        feedbackRes,
        usersRes,
      ] = await Promise.all([
        db.from("bookings").select("id, status, total_price, created_at, is_deleted").or("is_deleted.is.null,is_deleted.eq.false"),
        db.from("tours").select("id, is_active"),
        db.from("vehicles").select("id, is_available"),
        db.from("deals").select("id, is_active"),
        db.from("feedback").select("id, is_approved, rating"),
        db.auth.admin.listUsers(),
      ]);

      const bookings = bookingsRes.data || [];
      const tours = toursRes.data || [];
      const vehicles = vehiclesRes.data || [];
      const deals = dealsRes.data || [];
      const feedback = feedbackRes.data || [];
      const totalUsers = usersRes.data?.users?.length || 0;

      // Calculate stats
      const totalBookings = bookings.length;
      const pendingBookings = bookings.filter(b => b.status === "pending").length;
      const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
      const completedBookings = bookings.filter(b => b.status === "completed").length;
      const cancelledBookings = bookings.filter(b => b.status === "cancelled").length;
      
      const totalRevenue = bookings
        .filter(b => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

      const activeTours = tours.filter(t => t.is_active).length;
      const availableVehicles = vehicles.filter(v => v.is_available).length;
      const activeDeals = deals.filter(d => d.is_active).length;
      const approvedFeedback = feedback.filter(f => f.is_approved).length;
      const avgRating = feedback.length > 0 
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
        : 0;

      // Get recent bookings for chart
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentBookings = bookings.filter(b => 
        new Date(b.created_at) >= thirtyDaysAgo
      );

      // Group by date
      const bookingsByDate: Record<string, number> = {};
      recentBookings.forEach(b => {
        const date = new Date(b.created_at).toISOString().split("T")[0];
        bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
      });

      const stats = {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        activeTours,
        totalTours: tours.length,
        availableVehicles,
        totalVehicles: vehicles.length,
        activeDeals,
        totalDeals: deals.length,
        approvedFeedback,
        totalFeedback: feedback.length,
        avgRating: Math.round(avgRating * 10) / 10,
        totalUsers,
        bookingsByDate,
      };

      return new Response(JSON.stringify({ data: stats }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (err) {
    console.error("api-stats error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
