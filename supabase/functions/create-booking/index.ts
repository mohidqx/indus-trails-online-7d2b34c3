import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "admin@industours.pk";
const NOTIFICATION_EMAIL = "mohidmughalk@gmail.com";

type CreateBookingRequest = {
  tour_id: string | null;
  deal_id?: string | null;
  travel_date: string;
  num_travelers: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_nationality?: string | null;
  customer_cnic?: string | null;
  customer_address?: string | null;
  special_requests?: string | null;
  total_price?: number | null;
  original_price?: number | null;
  discount_applied?: number | null;
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

function formatPrice(price: number | null): string {
  if (!price) return "To be confirmed";
  return `PKR ${price.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

async function sendCustomerEmail(
  resend: Resend,
  booking: {
    id: string;
    customer_name: string;
    customer_email: string;
    travel_date: string;
    num_travelers: number;
    total_price: number | null;
    tour_title?: string;
    deal_title?: string;
    discount_percent?: number;
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a5f2a 0%, #2d8a3e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #666; font-weight: 500; }
        .value { color: #333; font-weight: 600; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { color: #1a5f2a; font-weight: bold; }
        .deal-badge { background: #fef2f2; color: #dc2626; padding: 8px 16px; border-radius: 8px; display: inline-block; margin: 10px 0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 Booking Confirmed!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for choosing Indus Tours</p>
        </div>
        <div class="content">
          <p>Dear <strong>${booking.customer_name}</strong>,</p>
          <p>We're thrilled to confirm your booking! Our team will contact you shortly with more details about your upcoming adventure.</p>
          
          ${booking.deal_title ? `<div class="deal-badge">🏷️ Deal Applied: ${booking.deal_title} (${booking.discount_percent}% OFF)</div>` : ''}
          
          <div class="booking-details">
            <h3 style="margin-top: 0; color: #1a5f2a;">📋 Booking Details</h3>
            <div class="detail-row">
              <span class="label">Booking ID</span>
              <span class="value">${booking.id.slice(0, 8).toUpperCase()}</span>
            </div>
            ${booking.tour_title ? `
            <div class="detail-row">
              <span class="label">Tour</span>
              <span class="value">${booking.tour_title}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Travel Date</span>
              <span class="value">${formatDate(booking.travel_date)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Travelers</span>
              <span class="value">${booking.num_travelers} person(s)</span>
            </div>
            <div class="detail-row">
              <span class="label">Total Amount</span>
              <span class="value highlight">${formatPrice(booking.total_price)}</span>
            </div>
          </div>

          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Our team will call you within 24 hours to confirm details</li>
            <li>You'll receive a detailed itinerary via WhatsApp/Email</li>
            <li>Payment instructions will be shared during the call</li>
          </ul>

          <p>For any queries, contact us at:<br>
          📞 Phone: +92 XXX XXXXXXX<br>
          📧 Email: ${ADMIN_EMAIL}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Indus Tours - Explore Pakistan's Beauty</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return resend.emails.send({
    from: "Indus Tours <onboarding@resend.dev>",
    to: [booking.customer_email],
    subject: `🎉 Booking Confirmed - ${booking.tour_title || "Your Tour"} | Indus Tours`,
    html,
  });
}

async function sendAdminEmail(
  resend: Resend,
  booking: {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_nationality: string | null;
    customer_cnic: string | null;
    customer_address: string | null;
    travel_date: string;
    num_travelers: number;
    special_requests: string | null;
    total_price: number | null;
    original_price: number | null;
    discount_applied: number | null;
    tour_title?: string;
    deal_title?: string;
    created_at: string;
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 25px; border-radius: 0 0 10px 10px; }
        .section { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .section h3 { margin-top: 0; color: #d97706; border-bottom: 2px solid #fef3c7; padding-bottom: 10px; }
        .detail-row { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { color: #1f2937; font-weight: 600; margin-top: 2px; }
        .urgent { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
        .price-box { background: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center; }
        .price { font-size: 24px; color: #059669; font-weight: bold; }
        .deal-info { background: #fef2f2; padding: 10px 15px; border-radius: 8px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🔔 New Booking Alert!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${new Date(booking.created_at).toLocaleString("en-PK")}</p>
        </div>
        <div class="content">
          <div class="urgent">
            <strong>⚡ Action Required:</strong> Contact customer within 24 hours to confirm booking details.
          </div>

          <div class="section">
            <h3>👤 Customer Information</h3>
            <div class="detail-row"><div class="label">Full Name</div><div class="value">${booking.customer_name}</div></div>
            <div class="detail-row"><div class="label">Email</div><div class="value"><a href="mailto:${booking.customer_email}">${booking.customer_email}</a></div></div>
            <div class="detail-row"><div class="label">Phone</div><div class="value"><a href="tel:${booking.customer_phone}">${booking.customer_phone}</a></div></div>
            ${booking.customer_nationality ? `<div class="detail-row"><div class="label">Nationality</div><div class="value">${booking.customer_nationality}</div></div>` : ''}
            ${booking.customer_cnic ? `<div class="detail-row"><div class="label">CNIC</div><div class="value">${booking.customer_cnic}</div></div>` : ''}
            ${booking.customer_address ? `<div class="detail-row"><div class="label">Address</div><div class="value">${booking.customer_address}</div></div>` : ''}
          </div>

          <div class="section">
            <h3>🗺️ Tour Details</h3>
            <div class="detail-row"><div class="label">Booking ID</div><div class="value">${booking.id}</div></div>
            ${booking.tour_title ? `<div class="detail-row"><div class="label">Tour Package</div><div class="value">${booking.tour_title}</div></div>` : ''}
            <div class="detail-row"><div class="label">Travel Date</div><div class="value">${formatDate(booking.travel_date)}</div></div>
            <div class="detail-row"><div class="label">Number of Travelers</div><div class="value">${booking.num_travelers} person(s)</div></div>
          </div>

          ${booking.deal_title ? `
          <div class="deal-info">
            <strong>🏷️ Deal Applied:</strong> ${booking.deal_title} (${booking.discount_applied}% off)
            ${booking.original_price ? `<br>Original: PKR ${booking.original_price.toLocaleString()} → Discounted: PKR ${(booking.total_price || 0).toLocaleString()}` : ''}
          </div>
          ` : ''}

          ${booking.special_requests ? `
          <div class="section">
            <h3>📝 Special Requests</h3>
            <p style="margin: 0; color: #4b5563;">${booking.special_requests}</p>
          </div>
          ` : ''}

          <div class="price-box">
            <div class="label">Total Booking Amount</div>
            <div class="price">${formatPrice(booking.total_price)}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return resend.emails.send({
    from: "Indus Tours Bookings <onboarding@resend.dev>",
    to: [ADMIN_EMAIL, NOTIFICATION_EMAIL],
    subject: `🔔 New Booking: ${booking.customer_name} - ${booking.tour_title || "Tour"} | ${formatDate(booking.travel_date)}`,
    html,
  });
}

serve(async (req) => {
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
    const deal_id = typeof body.deal_id === "string" && body.deal_id.length ? body.deal_id : null;
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let user_id: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data, error } = await authClient.auth.getUser(token);
      if (!error && data?.user?.id) {
        user_id = data.user.id;
      }
    }

    const db = createClient(supabaseUrl, serviceRoleKey);

    let total_price: number | null = null;
    let original_price: number | null = null;
    let discount_applied: number | null = null;
    let tour_title: string | undefined;
    let deal_title: string | undefined;
    let discount_percent = 0;
    
    // Fetch tour price
    if (tour_id) {
      const { data: tour, error: tourError } = await db
        .from("tours")
        .select("title, price, discount_price")
        .eq("id", tour_id)
        .maybeSingle();

      if (tourError) {
        return new Response(JSON.stringify({ error: "Failed to load tour pricing" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      if (tour) {
        tour_title = tour.title;
        const unitPrice = Number(tour.discount_price ?? tour.price);
        original_price = Number.isFinite(unitPrice) ? unitPrice * num_travelers : null;
        total_price = original_price;
      }
    }

    // Fetch and apply deal discount
    if (deal_id) {
      const { data: deal } = await db
        .from("deals")
        .select("title, discount_percent, is_active")
        .eq("id", deal_id)
        .eq("is_active", true)
        .maybeSingle();

      if (deal && deal.discount_percent) {
        deal_title = deal.title;
        discount_percent = deal.discount_percent;
        discount_applied = discount_percent;
        
        if (total_price !== null) {
          total_price = Math.round(total_price * (1 - discount_percent / 100));
        }
      }
    }

    const { data: booking, error: insertError } = await db
      .from("bookings")
      .insert({
        user_id,
        tour_id,
        deal_id,
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
        original_price,
        discount_applied,
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

    // Send email notifications (non-blocking)
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      
      const emailData = {
        id: booking.id,
        customer_name,
        customer_email,
        customer_phone,
        customer_nationality,
        customer_cnic,
        customer_address,
        travel_date,
        num_travelers,
        special_requests,
        total_price: booking.total_price,
        original_price,
        discount_applied,
        tour_title,
        deal_title,
        discount_percent,
        created_at: booking.created_at,
      };

      try {
        const [customerResult, adminResult] = await Promise.allSettled([
          sendCustomerEmail(resend, emailData),
          sendAdminEmail(resend, emailData),
        ]);

        if (customerResult.status === "rejected") {
          console.error("Failed to send customer email:", customerResult.reason);
        }
        if (adminResult.status === "rejected") {
          console.error("Failed to send admin email:", adminResult.reason);
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }
    } else {
      console.warn("RESEND_API_KEY not configured - skipping email notifications");
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
