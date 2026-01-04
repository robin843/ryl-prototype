import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

// Whitelist of allowed Stripe Price IDs
const ALLOWED_PRICE_IDS: Record<string, { name: string; type: "user" | "producer" }> = {
  // User tiers
  "price_1SlWVsLHz2QNjBxKXqF4Fgep": { name: "User Basic", type: "user" },
  "price_1SlWWSLHz2QNjBxK0vqSC8Jc": { name: "User Premium", type: "user" },
  "price_1SlYqPLHz2QNjBxKNTKe0tSb": { name: "User Offline", type: "user" },
  // Producer tiers
  "price_1SlWXgLHz2QNjBxKlbxJwCxs": { name: "Producer Basic", type: "producer" },
  "price_1SlWYULHz2QNjBxKcfK9Wf9T": { name: "Producer Premium", type: "producer" },
  "price_1SlWaJLHz2QNjBxKHyvF65YA": { name: "Producer Enterprise", type: "producer" },
};

const PRODUCER_PRICE_IDS = Object.entries(ALLOWED_PRICE_IDS)
  .filter(([_, info]) => info.type === "producer")
  .map(([id]) => id);

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight or validate origin
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { priceId } = await req.json();
    if (!priceId) throw new Error("No priceId provided");
    logStep("Price ID received", { priceId });

    // Validate price ID against whitelist
    if (!ALLOWED_PRICE_IDS[priceId]) {
      logStep("SECURITY: Invalid price ID attempted", { priceId, userId: user.id });
      return new Response(
        JSON.stringify({ error: "Invalid subscription tier" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    logStep("Price ID validated", { tier: ALLOWED_PRICE_IDS[priceId].name });

    // Check if user has producer role for producer tiers
    if (PRODUCER_PRICE_IDS.includes(priceId)) {
      const { data: roles } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const canSubscribeProducer = roles?.some((r) =>
        ["verified_producer", "admin"].includes(r.role)
      );

      if (!canSubscribeProducer) {
        logStep("SECURITY: Non-producer attempted producer subscription", { priceId, userId: user.id });
        return new Response(
          JSON.stringify({ error: "Producer verification required for this tier" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
      logStep("Producer role verified");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const origin = req.headers.get("origin") || "";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      payment_method_types: ['card', 'sepa_debit'],
      billing_address_collection: 'required',
      locale: 'de',
      success_url: `${origin}/onboarding?step=3&success=true`,
      cancel_url: `${origin}/onboarding?step=2&canceled=true`,
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
