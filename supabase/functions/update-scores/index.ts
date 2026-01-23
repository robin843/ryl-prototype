import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Signal weights for affinity calculation
const SIGNAL_WEIGHTS = {
  purchase: 100,
  checkout_started: 50,
  hotspot_click: 30,
  product_save: 20,
  video_complete: 15,
  video_progress_75: 10,
  like: 5,
  skip: -15,
  replay: 25,
  // Regret signals
  refund: -80,
  checkout_abandoned_repeat: -20,
  post_purchase_skip: -15,
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const msg = details ? `${step}: ${JSON.stringify(details)}` : step;
  console.log(`[UPDATE-SCORES] ${msg}`);
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting score update job");
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    // =====================================================
    // 1. UPDATE USER CONTENT SCORES
    // =====================================================
    logStep("Phase 1: Updating user content scores");
    
    // Get recent analytics events with category info
    const { data: recentEvents, error: eventsError } = await supabase
      .from('analytics_events')
      .select(`
        id,
        user_id,
        event_type,
        episode_id,
        product_id,
        created_at
      `)
      .gte('created_at', fifteenMinutesAgo.toISOString())
      .not('user_id', 'is', null);
    
    if (eventsError) {
      logStep("ERROR fetching events", { error: eventsError.message });
    } else if (recentEvents && recentEvents.length > 0) {
      logStep("Found recent events", { count: recentEvents.length });
      
      // Get episode -> series -> category mapping
      const episodeIds = [...new Set(recentEvents.filter(e => e.episode_id).map(e => e.episode_id))];
      
      const { data: episodes } = await supabase
        .from('episodes')
        .select('id, series_id')
        .in('id', episodeIds);
      
      const seriesIds = [...new Set((episodes || []).map(e => e.series_id))];
      
      const { data: seriesData } = await supabase
        .from('series')
        .select('id, category_id')
        .in('id', seriesIds);
      
      // Build lookup maps
      const episodeToSeries = new Map((episodes || []).map(e => [e.id, e.series_id]));
      const seriesToCategory = new Map((seriesData || []).map(s => [s.id, s.category_id]));
      
      // Aggregate scores per user per category
      const userCategoryScores: Map<string, { 
        purchase: number; 
        engagement: number; 
        regret: number;
      }> = new Map();
      
      for (const event of recentEvents) {
        if (!event.user_id || !event.episode_id) continue;
        
        const seriesId = episodeToSeries.get(event.episode_id);
        const categoryId = seriesId ? seriesToCategory.get(seriesId) : null;
        
        if (!categoryId) continue;
        
        const key = `${event.user_id}:${categoryId}`;
        const current = userCategoryScores.get(key) || { purchase: 0, engagement: 0, regret: 0 };
        
        const weight = SIGNAL_WEIGHTS[event.event_type as keyof typeof SIGNAL_WEIGHTS] || 0;
        
        if (event.event_type === 'purchase') {
          current.purchase += 1;
        } else if (weight < 0) {
          current.regret += 1;
        } else if (weight > 0) {
          current.engagement += 1;
        }
        
        userCategoryScores.set(key, current);
      }
      
      // Upsert user content scores
      for (const [key, scores] of userCategoryScores) {
        const [userId, categoryId] = key.split(':');
        
        // Calculate affinity delta
        const affinityDelta = 
          (scores.purchase * SIGNAL_WEIGHTS.purchase) +
          (scores.engagement * 5) - // Avg engagement weight
          (scores.regret * 15); // Avg regret weight
        
        const { error: upsertError } = await supabase
          .from('user_content_scores')
          .upsert({
            user_id: userId,
            category_id: categoryId,
            affinity_score: Math.max(-100, Math.min(100, affinityDelta)), // Clamp to -100 to 100
            purchase_signals: scores.purchase,
            engagement_signals: scores.engagement,
            regret_signals: scores.regret,
            last_interaction: now.toISOString(),
            updated_at: now.toISOString(),
          }, {
            onConflict: 'user_id,category_id',
          });
        
        if (upsertError) {
          logStep("ERROR upserting user score", { userId, categoryId, error: upsertError.message });
        }
      }
      
      logStep("User content scores updated", { updated: userCategoryScores.size });
    }
    
    // =====================================================
    // 2. UPDATE CONTENT QUALITY SCORES
    // =====================================================
    logStep("Phase 2: Updating content quality scores");
    
    // Get all published episodes
    const { data: publishedEpisodes, error: episodesError } = await supabase
      .from('episodes')
      .select('id, created_at, views')
      .eq('status', 'published');
    
    if (episodesError) {
      logStep("ERROR fetching episodes", { error: episodesError.message });
    } else if (publishedEpisodes && publishedEpisodes.length > 0) {
      logStep("Processing episodes", { count: publishedEpisodes.length });
      
      for (const episode of publishedEpisodes) {
        // Get analytics for this episode
        const { data: episodeEvents } = await supabase
          .from('analytics_events')
          .select('event_type, revenue_cents')
          .eq('episode_id', episode.id);
        
        if (!episodeEvents || episodeEvents.length === 0) continue;
        
        const views = episodeEvents.filter(e => e.event_type === 'video_view').length || episode.views || 0;
        const completions = episodeEvents.filter(e => e.event_type === 'video_complete').length;
        const hotspotClicks = episodeEvents.filter(e => e.event_type === 'hotspot_click').length;
        const purchases = episodeEvents.filter(e => e.event_type === 'purchase').length;
        const totalRevenue = episodeEvents.reduce((sum, e) => sum + (e.revenue_cents || 0), 0);
        
        // Get watch history for avg watch percent
        const { data: watchData } = await supabase
          .from('watch_history')
          .select('progress_seconds, completed')
          .eq('episode_id', episode.id);
        
        const avgWatchPercent = watchData && watchData.length > 0
          ? (watchData.filter(w => w.completed).length / watchData.length) * 100
          : 0;
        
        // Calculate metrics
        const completionRate = views > 0 ? completions / views : 0;
        const conversionRate = views > 0 ? purchases / views : 0;
        const hotspotCtr = views > 0 ? hotspotClicks / views : 0;
        
        // Estimate watch minutes (assuming avg 2 min per view)
        const estimatedWatchMinutes = views * 2;
        const cpmW = estimatedWatchMinutes > 0 
          ? (purchases / estimatedWatchMinutes) * 1000 
          : 0;
        
        // Calculate freshness (exponential decay over 7 days)
        const ageHours = (now.getTime() - new Date(episode.created_at).getTime()) / (1000 * 60 * 60);
        const freshnessScore = Math.max(0.1, Math.exp(-ageHours / 168)); // 168 hours = 7 days
        
        const { error: qualityError } = await supabase
          .from('content_quality_scores')
          .upsert({
            episode_id: episode.id,
            view_count: views,
            completion_rate: Math.round(completionRate * 10000) / 10000,
            conversion_rate: Math.round(conversionRate * 10000) / 10000,
            avg_watch_percent: Math.round(avgWatchPercent * 100) / 100,
            hotspot_ctr: Math.round(hotspotCtr * 10000) / 10000,
            cpm_w: Math.round(cpmW * 10000) / 10000,
            freshness_score: Math.round(freshnessScore * 100) / 100,
            updated_at: now.toISOString(),
          }, {
            onConflict: 'episode_id',
          });
        
        if (qualityError) {
          logStep("ERROR upserting content quality", { episodeId: episode.id, error: qualityError.message });
        }
      }
      
      logStep("Content quality scores updated", { processed: publishedEpisodes.length });
    }
    
    // =====================================================
    // 3. UPDATE CREATOR QUALITY SCORES (CQS)
    // =====================================================
    logStep("Phase 3: Updating creator quality scores");
    
    // Get all creators with published content
    const { data: creators, error: creatorsError } = await supabase
      .from('episodes')
      .select('creator_id')
      .eq('status', 'published');
    
    if (creatorsError) {
      logStep("ERROR fetching creators", { error: creatorsError.message });
    } else if (creators) {
      const uniqueCreatorIds = [...new Set(creators.map(c => c.creator_id))];
      logStep("Processing creators", { count: uniqueCreatorIds.length });
      
      for (const creatorId of uniqueCreatorIds) {
        // Get all episode quality scores for this creator
        const { data: creatorEpisodes } = await supabase
          .from('episodes')
          .select('id')
          .eq('creator_id', creatorId)
          .eq('status', 'published');
        
        const episodeIds = (creatorEpisodes || []).map(e => e.id);
        
        const { data: qualityScores } = await supabase
          .from('content_quality_scores')
          .select('cpm_w, conversion_rate')
          .in('episode_id', episodeIds);
        
        // Calculate average CPM-W
        const avgCpmW = qualityScores && qualityScores.length > 0
          ? qualityScores.reduce((sum, q) => sum + (q.cpm_w || 0), 0) / qualityScores.length
          : 0;
        
        // Get return rate (last 90 days)
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        
        const { data: returns } = await supabase
          .from('purchase_returns')
          .select('id')
          .eq('creator_id', creatorId)
          .gte('created_at', ninetyDaysAgo.toISOString());
        
        const { data: sales } = await supabase
          .from('analytics_events')
          .select('id')
          .eq('creator_id', creatorId)
          .eq('event_type', 'purchase')
          .gte('created_at', ninetyDaysAgo.toISOString());
        
        const returnCount = returns?.length || 0;
        const salesCount = sales?.length || 0;
        const returnRate = salesCount > 0 ? returnCount / salesCount : 0;
        
        // Calculate viewer retention (unique viewers who returned within 30 days)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const { data: viewerData } = await supabase
          .from('analytics_events')
          .select('user_id, created_at')
          .eq('creator_id', creatorId)
          .eq('event_type', 'video_view')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .not('user_id', 'is', null);
        
        // Count unique viewers with multiple views
        const viewerCounts = new Map<string, number>();
        for (const v of viewerData || []) {
          if (v.user_id) {
            viewerCounts.set(v.user_id, (viewerCounts.get(v.user_id) || 0) + 1);
          }
        }
        
        const totalViewers = viewerCounts.size;
        const returningViewers = Array.from(viewerCounts.values()).filter(c => c > 1).length;
        const viewerRetention = totalViewers > 0 ? returningViewers / totalViewers : 0;
        
        // Determine quality tier
        let qualityTier = 'standard';
        let featuredBoost = 1.0;
        
        if (returnRate > 0.1) {
          qualityTier = 'flagged';
          featuredBoost = 0.7;
        } else if (avgCpmW > 8 && returnRate < 0.03 && viewerRetention > 0.3) {
          qualityTier = 'premium';
          featuredBoost = 1.5;
        } else if (avgCpmW > 5 && returnRate < 0.05) {
          qualityTier = 'featured';
          featuredBoost = 1.2;
        } else if (salesCount < 5) {
          qualityTier = 'new';
          featuredBoost = 1.3; // New creators get discovery boost
        }
        
        const { error: cqsError } = await supabase
          .from('creator_quality_scores')
          .upsert({
            creator_id: creatorId,
            cpm_w_avg: Math.round(avgCpmW * 10000) / 10000,
            return_rate: Math.round(returnRate * 10000) / 10000,
            viewer_retention_30d: Math.round(viewerRetention * 10000) / 10000,
            total_conversions: salesCount,
            quality_tier: qualityTier,
            featured_boost: featuredBoost,
            updated_at: now.toISOString(),
          }, {
            onConflict: 'creator_id',
          });
        
        if (cqsError) {
          logStep("ERROR upserting CQS", { creatorId, error: cqsError.message });
        }
      }
      
      logStep("Creator quality scores updated", { processed: uniqueCreatorIds.length });
    }
    
    logStep("Score update job completed successfully");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        timestamp: now.toISOString(),
        message: "Scores updated successfully"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    logStep("ERROR: Unexpected", { error: String(error) });
    return new Response(
      JSON.stringify({ error: String(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});