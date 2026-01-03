import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-EPISODE-ACCESS] ${step}${detailsStr}`);
};

// Episode data (mirrors mockData.ts - in production this would come from DB)
const episodes = [
  { id: "ep-1-1", seriesId: "series-1", seriesTitle: "The Last Light", episodeNumber: 1, title: "The First Frame", description: "Maya finds an antique camera at a flea market that seems to photograph things that haven't happened yet.", duration: "4:32" },
  { id: "ep-1-2", seriesId: "series-1", seriesTitle: "The Last Light", episodeNumber: 2, title: "Echoes", description: "The photographs begin showing moments from lives Maya never lived.", duration: "3:58" },
  { id: "ep-1-3", seriesId: "series-1", seriesTitle: "The Last Light", episodeNumber: 3, title: "Convergence", description: "Two versions of Maya's life begin to intersect in unexpected ways.", duration: "4:15" },
  { id: "ep-2-1", seriesId: "series-2", seriesTitle: "Silk & Stone", episodeNumber: 1, title: "The Atelier", description: "Celine arrives at the legendary Maison Verne, where tradition meets innovation.", duration: "4:45" },
  { id: "ep-2-2", seriesId: "series-2", seriesTitle: "Silk & Stone", episodeNumber: 2, title: "First Collection", description: "Under pressure to prove herself, Celine takes a bold creative risk.", duration: "4:12" },
  { id: "ep-3-1", seriesId: "series-3", seriesTitle: "Midnight Kitchen", episodeNumber: 1, title: "First Course", description: "Marco discovers a hidden kitchen beneath the city's oldest restaurant.", duration: "3:55" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { episodeId } = await req.json();
    if (!episodeId) {
      throw new Error("episodeId is required");
    }
    logStep("Episode requested", { episodeId });

    // Find episode
    const episode = episodes.find((ep) => ep.id === episodeId);
    if (!episode) {
      return new Response(
        JSON.stringify({ hasAccess: false, error: "Episode not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    logStep("Episode found", { episodeNumber: episode.episodeNumber, title: episode.title });

    // First episode of each series is always free
    const isPremium = episode.episodeNumber > 1;
    if (!isPremium) {
      logStep("Free episode, granting access");
      return new Response(
        JSON.stringify({ hasAccess: true, episode, isPremium: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Premium episode, checking subscription");

    // For premium episodes, validate user subscription
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No auth header, denying access to premium content");
      return new Response(
        JSON.stringify({ hasAccess: false, episode, isPremium: true, reason: "not_authenticated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      logStep("Auth error or no email", { error: userError?.message });
      return new Response(
        JSON.stringify({ hasAccess: false, episode, isPremium: true, reason: "auth_error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    logStep("User authenticated", { email: userData.user.email });

    // Check Stripe subscription
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: userData.user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found, denying access");
      return new Response(
        JSON.stringify({ hasAccess: false, episode, isPremium: true, reason: "no_subscription" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const customerId = customers.data[0].id;
    logStep("Stripe customer found", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSubscription = subscriptions.data.length > 0;
    logStep("Subscription check complete", { hasActiveSubscription });

    if (hasActiveSubscription) {
      return new Response(
        JSON.stringify({ hasAccess: true, episode, isPremium: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ hasAccess: false, episode, isPremium: true, reason: "no_active_subscription" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
