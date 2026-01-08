import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-EPISODE-ACCESS] ${step}${detailsStr}`);
};

// Werbefrei Produkt-ID
const ADFREE_PRODUCT_ID = "prod_TktxSiZipxdyuk";

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight or validate origin
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  try {
    logStep("Function started");

    const { episodeId } = await req.json();
    if (!episodeId) {
      throw new Error("episodeId is required");
    }
    logStep("Episode requested", { episodeId });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch episode from database
    const { data: episode, error: episodeError } = await supabaseClient
      .from("episodes")
      .select(`
        id,
        title,
        description,
        video_url,
        thumbnail_url,
        series_id,
        episode_number,
        series:series_id (
          title
        )
      `)
      .eq("id", episodeId)
      .eq("status", "published")
      .single();

    if (episodeError || !episode) {
      logStep("Episode not found in DB", { error: episodeError?.message });
      return new Response(
        JSON.stringify({ hasAccess: false, error: "Episode not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const seriesArray = episode.series as { title: string }[] | null;
    const seriesTitle = seriesArray?.[0]?.title || null;
    logStep("Episode found", { title: episode.title });

    // FREEMIUM MODEL: Alle User haben Zugang zu allen Episoden
    // Nur prüfen ob User werbefrei ist
    let showAds = true;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      const user = userData?.user;

      if (user?.email) {
        logStep("User authenticated", { email: user.email });

        // Check if user has ad-free subscription
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (stripeKey) {
          const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
          const customers = await stripe.customers.list({ email: user.email, limit: 1 });

          if (customers.data.length > 0) {
            const subscriptions = await stripe.subscriptions.list({
              customer: customers.data[0].id,
              status: "active",
              limit: 10,
            });

            // Check if any subscription is the ad-free product
            for (const sub of subscriptions.data) {
              for (const item of sub.items.data) {
                if (item.price.product === ADFREE_PRODUCT_ID) {
                  showAds = false;
                  break;
                }
              }
            }
            logStep("Subscription check", { showAds, customerId: customers.data[0].id });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        hasAccess: true, // FREEMIUM: Alle haben Zugang
        showAds,
        episode: {
          id: episode.id,
          title: episode.title,
          description: episode.description,
          videoUrl: episode.video_url,
          thumbnailUrl: episode.thumbnail_url,
          seriesId: episode.series_id,
          seriesTitle: seriesTitle,
          episodeNumber: episode.episode_number,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage, hasAccess: false, showAds: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
