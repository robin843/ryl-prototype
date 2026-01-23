import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[process-notification-triggers] ${step}`, details ? JSON.stringify(details) : "");
};

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    logStep("Fetching unprocessed triggers");
    
    // Get unprocessed triggers
    const { data: triggers, error: fetchError } = await supabase
      .from("notification_triggers")
      .select("*")
      .eq("processed", false)
      .order("created_at", { ascending: true })
      .limit(100);
    
    if (fetchError) throw fetchError;
    
    logStep("Found triggers", { count: triggers?.length || 0 });
    
    if (!triggers || triggers.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    let processed = 0;
    let errors: string[] = [];
    
    for (const trigger of triggers) {
      try {
        logStep("Processing trigger", { id: trigger.id, type: trigger.trigger_type });
        
        let targetUserIds: string[] = [];
        let payload: { title: string; body: string; url?: string } | null = null;
        
        switch (trigger.trigger_type) {
          case "new_episode": {
            // Get followers of the creator
            const { data: followers } = await supabase
              .from("creator_follows")
              .select("follower_id")
              .eq("creator_id", trigger.target_creator_id)
              .eq("notifications_enabled", true);
            
            targetUserIds = followers?.map(f => f.follower_id) || [];
            
            const triggerPayload = trigger.payload as { episode_title?: string; series_title?: string };
            payload = {
              title: "Neue Episode! 🎬",
              body: `${triggerPayload.series_title}: ${triggerPayload.episode_title}`,
              url: `/watch/${trigger.reference_id}`,
            };
            break;
          }
          
          case "streak_reminder": {
            targetUserIds = trigger.target_user_id ? [trigger.target_user_id] : [];
            payload = {
              title: "Dein Streak ist in Gefahr! 🔥",
              body: "Schau jetzt rein um deinen Streak zu behalten!",
              url: "/feed",
            };
            break;
          }
          
          case "price_drop": {
            targetUserIds = trigger.target_user_id ? [trigger.target_user_id] : [];
            const pricePayload = trigger.payload as { product_name?: string; discount_percent?: number };
            payload = {
              title: "Preisalarm! 💰",
              body: `${pricePayload.product_name} ist jetzt ${pricePayload.discount_percent}% günstiger!`,
              url: `/product/${trigger.reference_id}`,
            };
            break;
          }
          
          case "follow_update": {
            targetUserIds = trigger.target_user_id ? [trigger.target_user_id] : [];
            const followPayload = trigger.payload as { creator_name?: string };
            payload = {
              title: "Neuer Follower! 👋",
              body: `${followPayload.creator_name} folgt dir jetzt`,
              url: "/studio",
            };
            break;
          }
        }
        
        if (targetUserIds.length > 0 && payload) {
          // Get push subscriptions for target users
          const { data: subscriptions } = await supabase
            .from("push_subscriptions")
            .select("*")
            .in("user_id", targetUserIds);
          
          if (subscriptions && subscriptions.length > 0) {
            // Call send-push-notification for each subscription batch
            const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                payload,
                target: { userIds: targetUserIds },
              }),
            });
            
            if (!response.ok) {
              logStep("Push notification failed", { status: response.status });
            }
          }
        }
        
        // Mark as processed
        await supabase
          .from("notification_triggers")
          .update({ processed: true, processed_at: new Date().toISOString() })
          .eq("id", trigger.id);
        
        processed++;
      } catch (err) {
        logStep("Error processing trigger", { id: trigger.id, error: String(err) });
        errors.push(`${trigger.id}: ${String(err)}`);
      }
    }
    
    logStep("Processing complete", { processed, errors: errors.length });
    
    return new Response(
      JSON.stringify({ processed, errors: errors.length > 0 ? errors : undefined }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    logStep("Error", { error: String(error) });
    return new Response(
      JSON.stringify({ error: "Failed to process notification triggers" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
