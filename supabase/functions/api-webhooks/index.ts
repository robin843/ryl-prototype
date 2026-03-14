import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

function log(step: string, details?: Record<string, unknown>) {
  console.log(`[api-webhooks] ${step}`, details ? JSON.stringify(details) : "");
}

function generateWebhookSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "whsec_";
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  for (const byte of randomBytes) {
    result += chars[byte % chars.length];
  }
  return result;
}

const VALID_EVENTS = [
  "episode_uploaded",
  "episode_published",
  "purchase_made",
  "series_created",
  "video_processed",
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Authenticate via Supabase JWT
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: claimsData, error: claimsErr } = await supabaseUser.auth.getClaims(authHeader.replace("Bearer ", ""));
  if (claimsErr || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = claimsData.claims.sub as string;

  try {
    // --- GET: List webhooks + recent events ---
    if (req.method === "GET") {
      const { data: webhooks, error } = await supabaseAdmin
        .from("webhook_subscriptions")
        .select("id, url, events, is_active, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({
        webhooks,
        available_events: VALID_EVENTS,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- POST: Create webhook ---
    if (req.method === "POST") {
      const body = await req.json();
      const { url, events } = body;

      if (!url || !events || !Array.isArray(events) || events.length === 0) {
        return new Response(JSON.stringify({ error: "url and events[] are required." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate events
      const invalidEvents = events.filter((e: string) => !VALID_EVENTS.includes(e));
      if (invalidEvents.length > 0) {
        return new Response(JSON.stringify({ error: `Invalid events: ${invalidEvents.join(", ")}. Valid: ${VALID_EVENTS.join(", ")}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const secret = generateWebhookSecret();

      const { data: webhook, error } = await supabaseAdmin
        .from("webhook_subscriptions")
        .insert({ user_id: userId, url, events, secret })
        .select("id, url, events, is_active, created_at")
        .single();

      if (error) throw error;

      log("Webhook created", { webhookId: webhook.id, userId });

      return new Response(JSON.stringify({
        ...webhook,
        secret,
        message: "Save the signing secret — it won't be shown again.",
      }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- DELETE: Remove webhook ---
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const webhookId = url.searchParams.get("id");

      if (!webhookId) {
        return new Response(JSON.stringify({ error: "Missing webhook id" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabaseAdmin
        .from("webhook_subscriptions")
        .delete()
        .eq("id", webhookId)
        .eq("user_id", userId);

      if (error) throw error;

      log("Webhook deleted", { webhookId, userId });
      return new Response(JSON.stringify({ status: "deleted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    log("ERROR", { error: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
