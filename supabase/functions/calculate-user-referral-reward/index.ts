import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[calculate-user-referral-reward] ${step}`, details ? JSON.stringify(details) : "");
};

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  try {
    const { userId, purchaseIntentId } = await req.json();
    
    logStep("Processing user referral reward", { userId, purchaseIntentId });
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if this user was referred
    const { data: referral, error: referralError } = await supabase
      .from("user_referrals")
      .select("*")
      .eq("referred_id", userId)
      .eq("status", "pending")
      .maybeSingle();
    
    if (referralError) throw referralError;
    
    if (!referral) {
      logStep("No pending referral found for user");
      return new Response(
        JSON.stringify({ success: true, rewarded: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if referral is not expired
    if (new Date(referral.expires_at) < new Date()) {
      logStep("Referral expired", { expiresAt: referral.expires_at });
      
      await supabase
        .from("user_referrals")
        .update({ status: "expired" })
        .eq("id", referral.id);
      
      return new Response(
        JSON.stringify({ success: true, rewarded: false, reason: "expired" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    logStep("Rewarding referral", { 
      referralId: referral.id,
      referrerId: referral.referrer_id,
      referredId: referral.referred_id,
      referrerReward: referral.referrer_reward_cents,
    });
    
    // Update referrer's credits
    const { error: updateReferrerError } = await supabase.rpc("increment_credits", {
      p_user_id: referral.referrer_id,
      p_amount: referral.referrer_reward_cents,
    });
    
    // If RPC doesn't exist, do it manually
    if (updateReferrerError?.code === "42883") {
      const { data: referrerProfile } = await supabase
        .from("profiles")
        .select("credits_cents")
        .eq("user_id", referral.referrer_id)
        .single();
      
      await supabase
        .from("profiles")
        .update({ credits_cents: (referrerProfile?.credits_cents || 0) + referral.referrer_reward_cents })
        .eq("user_id", referral.referrer_id);
    }
    
    // Mark referral as rewarded
    await supabase
      .from("user_referrals")
      .update({ 
        status: "rewarded", 
        rewarded_at: new Date().toISOString() 
      })
      .eq("id", referral.id);
    
    // Create notification for referrer
    await supabase
      .from("notification_triggers")
      .insert({
        trigger_type: "follow_update",
        target_user_id: referral.referrer_id,
        payload: {
          type: "referral_reward",
          amount_cents: referral.referrer_reward_cents,
          referred_user_id: userId,
        },
      });
    
    logStep("Referral reward processed successfully");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        rewarded: true,
        referrerRewardCents: referral.referrer_reward_cents,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    logStep("Error", { error: String(error) });
    return new Response(
      JSON.stringify({ error: "Failed to process user referral reward" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
