import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightOrValidateOrigin } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const logStep = (step: string, details?: Record<string, unknown>) => {
  const msg = details ? `${step}: ${JSON.stringify(details)}` : step;
  console.log(`[UPDATE-STREAKS] ${msg}`);
};

// Helper: Format date as YYYY-MM-DD for date column
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  // Handle CORS preflight or validate origin
  const corsResponse = handleCorsPreflightOrValidateOrigin(req, logStep);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    logStep("Streak update started");

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();
    const today = formatDate(now);
    
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = formatDate(yesterdayDate);

    // Step 1: Get all users with activity today (from analytics_events)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: todayActive, error: todayError } = await supabaseAdmin
      .from("analytics_events")
      .select("user_id")
      .gte("created_at", todayStart.toISOString())
      .not("user_id", "is", null);

    if (todayError) {
      logStep("ERROR: Failed to fetch today's activity", { error: todayError.message });
      throw todayError;
    }

    // Get unique user IDs active today
    const activeUserIds = [...new Set((todayActive || []).map((e: { user_id: string }) => e.user_id))];
    logStep("Users active today", { count: activeUserIds.length });

    // Step 2: Get current streak data for all users
    const { data: currentStreaks, error: streakError } = await supabaseAdmin
      .from("user_streaks")
      .select("*");

    if (streakError) {
      logStep("ERROR: Failed to fetch streaks", { error: streakError.message });
      throw streakError;
    }

    const streakMap = new Map<string, any>();
    (currentStreaks || []).forEach((streak: any) => {
      streakMap.set(streak.user_id, streak);
    });

    // Step 3: Process each active user
    let updated = 0;
    let created = 0;
    let continued = 0;
    let reset = 0;

    for (const userId of activeUserIds) {
      const existing = streakMap.get(userId);

      if (!existing) {
        // New user streak - use upsert to handle race conditions
        const { error: insertError } = await supabaseAdmin
          .from("user_streaks")
          .upsert({
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_active_date: today,
            total_watch_days: 1,
            updated_at: now.toISOString(),
          }, { onConflict: "user_id" });

        if (!insertError) {
          created++;
        } else {
          logStep("WARN: Insert failed", { userId, error: insertError.message });
        }
      } else {
        const lastActiveDate = existing.last_active_date; // Date format: YYYY-MM-DD

        // Check if already active today (no update needed)
        if (lastActiveDate === today) {
          continue; // Already counted today
        }

        let newStreak = existing.current_streak || 0;
        let newLongest = existing.longest_streak || 0;
        const newTotalDays = (existing.total_watch_days || 0) + 1;

        // Check if activity was yesterday (streak continues)
        if (lastActiveDate === yesterday) {
          newStreak = (existing.current_streak || 0) + 1;
          newLongest = Math.max(newLongest, newStreak);
          continued++;
        } else {
          // Streak broken, reset to 1
          newStreak = 1;
          reset++;
        }

        const { error: updateError } = await supabaseAdmin
          .from("user_streaks")
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_active_date: today,
            total_watch_days: newTotalDays,
            updated_at: now.toISOString(),
          })
          .eq("user_id", userId);

        if (!updateError) {
          updated++;
        } else {
          logStep("WARN: Update failed", { userId, error: updateError.message });
        }
      }
    }

    // Step 4: Reset streaks for users who haven't been active today
    // (Those with current_streak > 0 but last_active_date != today and != yesterday)
    const { data: staleStreaks, error: staleError } = await supabaseAdmin
      .from("user_streaks")
      .update({ current_streak: 0, updated_at: now.toISOString() })
      .lt("last_active_date", yesterday)
      .gt("current_streak", 0)
      .select("user_id");

    const staleCount = staleStreaks?.length || 0;
    if (staleError) {
      logStep("WARN: Failed to reset stale streaks", { error: staleError.message });
    }

    logStep("Streak update completed", {
      created,
      updated,
      continued,
      reset,
      staleReset: staleCount,
      totalActiveToday: activeUserIds.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        created,
        updated,
        continued,
        reset,
        staleReset: staleCount,
        totalActiveToday: activeUserIds.length,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    logStep("ERROR: Unexpected", { error: String(error) });
    return new Response(
      JSON.stringify({ error: String(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
