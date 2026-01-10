import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CreateBookingRequest = {
  tour_id: string | null;
  travel_date: string;
  num_travelers: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_nationality?: string | null;
  customer_cnic?: string | null;
  customer_address?: string | null;
  special_requests?: string | null;
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const body = (await req.json()) as Partial<CreateBookingRequest>;

    const tour_id = typeof body.tour_id === "string" && body.tour_id.length ? body.tour_id : null;
    const travel_date = (body.travel_date ?? "").toString();
    const num_travelers = Number(body.num_travelers);
    const customer_name = (body.customer_name ?? "").toString().trim();
    const customer_email = (body.customer_email ?? "").toString().trim().toLowerCase();
    const customer_phone = (body.customer_phone ?? "").toString().trim();

    const customer_nationality = (body.customer_nationality ?? null)?.toString().trim() || null;
    const customer_cnic = (body.customer_cnic ?? null)?.toString().trim() || null;
    const customer_address = (body.customer_address ?? null)?.toString().trim() || null;
    const special_requests = (body.special_requests ?? null)?.toString().trim() || null;

    if (customer_name.length < 2) return badRequest("Name is required");
    if (!isEmail(customer_email)) return badRequest("Valid email is required");
    if (customer_phone.length < 7) return badRequest("Valid phone is required");
    if (!travel_date) return badRequest("Travel date is required");
    if (!Number.isFinite(num_travelers) || num_travelers < 1 || num_travelers > 50) {
      return badRequest("Number of travelers must be between 1 and 50");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // If user is logged in, capture user_id from JWT (optional)
    let user_id: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data, error } = await authClient.auth.getClaims(token);
      if (!error && data?.claims?.sub) {
        user_id = data.claims.sub;
      }
    }

    // Use service role for DB write (bypasses RLS) + server-side price calc
    const db = createClient(supabaseUrl, serviceRoleKey);

    let total_price: number | null = null;
    if (tour_id) {
      const { data: tour, error: tourError } = await db
        .from("tours")
        .select("price, discount_price")
        .eq("id", tour_id)
        .maybeSingle();

      if (tourError) {
        return new Response(JSON.stringify({ error: "Failed to load tour pricing" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      if (tour) {
        const unit = Number(tour.discount_price ?? tour.price);
        total_price = Number.isFinite(unit) ? unit * num_travelers : null;
      }
    }

    const { data: booking, error: insertError } = await db
      .from("bookings")
      .insert({
        user_id,
        tour_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_nationality,
        customer_cnic,
        customer_address,
        travel_date,
        num_travelers,
        special_requests,
        total_price,
        status: "pending",
      })
      .select("id, created_at, total_price")
      .single();

    if (insertError) {
      console.error("create-booking insert error", insertError);
      return new Response(JSON.stringify({ error: "Failed to create booking" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ booking }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("create-booking error", error);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
