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

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const db = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Admin operations require auth
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

    // Fetch all stats in parallel
    const [bookingsRes, toursRes, dealsRes, vehiclesRes, feedbackRes, profilesRes] = await Promise.all([
      db.from("bookings").select("id, status, total_price, created_at"),
      db.from("tours").select("id, is_active"),
      db.from("deals").select("id, is_active"),
      db.from("vehicles").select("id, is_available"),
      db.from("feedback").select("id, is_approved, rating"),
      db.from("profiles").select("id"),
    ]);

    const bookings = bookingsRes.data || [];
    const tours = toursRes.data || [];
    const deals = dealsRes.data || [];
    const vehicles = vehiclesRes.data || [];
    const feedback = feedbackRes.data || [];
    const profiles = profilesRes.data || [];

    // Calculate stats
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    const pendingBookings = bookings.filter(b => b.status === "pending").length;
    const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
    const completedBookings = bookings.filter(b => b.status === "completed").length;
    const cancelledBookings = bookings.filter(b => b.status === "cancelled").length;

    // Recent bookings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBookings = bookings.filter(b => new Date(b.created_at) >= thirtyDaysAgo).length;

    // Monthly revenue
    const currentMonth = new Date().getMonth();
    const monthlyRevenue = bookings
      .filter(b => new Date(b.created_at).getMonth() === currentMonth)
      .reduce((sum, b) => sum + (b.total_price || 0), 0);

    const stats = {
      bookings: {
        total: bookings.length,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        recent: recentBookings,
      },
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        average: bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0,
      },
      tours: {
        total: tours.length,
        active: tours.filter(t => t.is_active).length,
      },
      deals: {
        total: deals.length,
        active: deals.filter(d => d.is_active).length,
      },
      vehicles: {
        total: vehicles.length,
        available: vehicles.filter(v => v.is_available).length,
      },
      feedback: {
        total: feedback.length,
        approved: feedback.filter(f => f.is_approved).length,
        averageRating: feedback.length > 0 
          ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) 
          : 0,
      },
      users: {
        total: profiles.length,
      },
    };

    return new Response(JSON.stringify({ data: stats }), {
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
