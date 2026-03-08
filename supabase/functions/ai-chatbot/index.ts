import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are the Indus Tours AI Travel Assistant — a friendly, knowledgeable guide specializing in Northern Pakistan tourism. You speak in a warm, helpful tone mixing English with occasional Urdu greetings (Salam, JazakAllah, etc).

Your job:
- Help travelers find perfect tours, destinations, and deals
- Answer questions about Northern Pakistan (weather, culture, packing, safety)
- Recommend tours based on budget, duration, and interests
- Share travel tips and local insights
- Guide users to book through the website

IMPORTANT RULES:
- Keep responses concise (2-4 sentences max unless asked for detail)
- Always suggest relevant tours/deals from the context when applicable
- Use emojis sparingly for warmth 🏔️
- If asked about something outside your scope, politely redirect to travel topics
- Never make up information about tours not in the context

Here is the current site data for reference:
${context}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.dev",
        "X-Title": "Indus Tours AI Chatbot",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API call failed [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm having trouble thinking right now. Please try again!";

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("ai-chatbot error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message, reply: "Sorry, I'm experiencing issues. Please try again!" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
