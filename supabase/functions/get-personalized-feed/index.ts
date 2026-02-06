import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Feed ranking weights
const WEIGHTS = {
  categoryAffinity: 0.40,
  contentQuality: 0.30,
  freshness: 0.15,
  creatorBoost: 0.15,
};

// Discovery injection rules
const DISCOVERY_RULES = {
  newCreatorEveryN: 5,        // Every 5th video: new creator
  underrepCategoryEveryN: 10, // Every 10th video: underrepresented category
  newCreatorAgeDays: 14,      // Creators < 14 days old get boost
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const msg = details ? `${step}: ${JSON.stringify(details)}` : step;
  console.log(`[PERSONALIZED-FEED] ${msg}`);
};

interface ScoredEpisode {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  hls_url: string | null;
  duration: string | null;
  episode_number: number;
  views: number;
  created_at: string;
  series_id: string;
  creator_id: string;
  series_title: string;
  series_cover_url: string | null;
  category_id: string | null;
  creator_display_name: string | null;
  creator_avatar_url: string | null;
  quality_score: number;
  freshness_score: number;
  creator_boost: number;
  affinity_score: number;
  total_score: number;
  is_discovery: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const { limit = 30, offset = 0 } = await req.json().catch(() => ({}));
    
    logStep("Feed request received", { limit, offset });
    
    // Check for authenticated user
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData } = await supabaseAuth.auth.getClaims(token);
      userId = claimsData?.claims?.sub || null;
    }
    
    logStep("User context", { authenticated: !!userId });
    
    // Use service role for data access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // =====================================================
    // 1. PARALLEL FETCH: User data + Episode 1s (OPTIMIZED)
    // =====================================================
    let userCategoryScores: Map<string, number> = new Map();
    let watchedEpisodeIds: Set<string> = new Set();
    let seenCreatorIds: Set<string> = new Set();
    let userTopCategories: string[] = [];
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Batch all initial queries in parallel
    const [
      userScoresResult,
      watchHistoryResult,
      seenCreatorsResult,
      ep1Result,
    ] = await Promise.all([
      // User category scores (only if authenticated)
      userId 
        ? supabase
            .from('user_content_scores')
            .select('category_id, affinity_score')
            .eq('user_id', userId)
        : Promise.resolve({ data: null }),
      
      // Watch history with episode info to detect which series are "unlocked"
      userId
        ? supabase
            .from('watch_history')
            .select('episode_id, episodes!inner(series_id, episode_number)')
            .eq('user_id', userId)
            .order('watched_at', { ascending: false })
            .limit(200)
        : Promise.resolve({ data: null }),
      
      // Seen creators (only if authenticated)
      userId
        ? supabase
            .from('analytics_events')
            .select('creator_id')
            .eq('user_id', userId)
            .eq('event_type', 'video_view')
            .gte('created_at', thirtyDaysAgo)
        : Promise.resolve({ data: null }),
      
      // Episode 1s: Default feed content (Feed = Acquisition)
      supabase
        .from('episodes')
        .select(`
          id, title, description, thumbnail_url, video_url, hls_url, duration,
          episode_number, views, created_at, series_id, creator_id,
          series:series_id ( title, cover_url, category_id )
        `)
        .eq('status', 'published')
        .eq('episode_number', 1)
        .order('created_at', { ascending: false })
        .limit(200),
    ]);
    
    // Process user data
    if (userScoresResult.data) {
      for (const s of userScoresResult.data) {
        userCategoryScores.set(s.category_id, s.affinity_score || 0);
      }
      userTopCategories = userScoresResult.data
        .sort((a, b) => (b.affinity_score || 0) - (a.affinity_score || 0))
        .slice(0, 3)
        .map(s => s.category_id);
    }
    
    if (watchHistoryResult.data) {
      watchedEpisodeIds = new Set(watchHistoryResult.data.map((w: any) => w.episode_id));
    }
    
    if (seenCreatorsResult.data) {
      seenCreatorIds = new Set(seenCreatorsResult.data.map(c => c.creator_id));
    }
    
    // =====================================================
    // 1b. UNLOCK LATER EPISODES for series where user watched ANY episode
    // =====================================================
    const unlockedSeriesIds: Set<string> = new Set();
    if (watchHistoryResult.data) {
      for (const w of watchHistoryResult.data as any[]) {
        const ep = Array.isArray(w.episodes) ? w.episodes[0] : w.episodes;
        if (ep) {
          unlockedSeriesIds.add(ep.series_id);
        }
      }
    }
    
    logStep("Unlocked series (user watched any episode)", { count: unlockedSeriesIds.size });
    
    // Check if ALL Episode 1s have been watched → unlock everything (no dead ends)
    const allEp1Ids = new Set((ep1Result.data || []).map((e: any) => e.id));
    const unwatchedEp1Count = [...allEp1Ids].filter(id => !watchedEpisodeIds.has(id)).length;
    const allEp1sWatched = userId && allEp1Ids.size > 0 && unwatchedEp1Count === 0;
    
    if (allEp1sWatched) {
      logStep("All Ep1s watched – unlocking ALL series to prevent dead end");
    }
    
    // Fetch later episodes for unlocked series (or ALL if no unwatched Ep1s remain)
    let laterEpisodes: any[] = [];
    if (unlockedSeriesIds.size > 0 || allEp1sWatched) {
      let query = supabase
        .from('episodes')
        .select(`
          id, title, description, thumbnail_url, video_url, hls_url, duration,
          episode_number, views, created_at, series_id, creator_id,
          series:series_id ( title, cover_url, category_id )
        `)
        .eq('status', 'published')
        .gt('episode_number', 1)
        .order('episode_number', { ascending: true })
        .limit(200);
      
      // Only filter by series if not all Ep1s are watched
      if (!allEp1sWatched) {
        query = query.in('series_id', [...unlockedSeriesIds]);
      }
      
      const { data: laterEps, error: laterErr } = await query;
      
      if (!laterErr && laterEps) {
        laterEpisodes = laterEps;
        logStep("Later episodes fetched", { count: laterEpisodes.length, allUnlocked: !!allEp1sWatched });
      }
    }
    
    // Combine Episode 1s + unlocked later episodes, deduplicate
    const epMap = new Map<string, any>();
    for (const ep of [...(ep1Result.data || []), ...laterEpisodes]) {
      epMap.set(ep.id, ep);
    }
    const episodes = [...epMap.values()];
    
    if (ep1Result.error) {
      logStep("ERROR fetching episodes", { error: ep1Result.error.message });
      throw new Error("Failed to fetch episodes");
    }
    
    if (episodes.length === 0) {
      return new Response(
        JSON.stringify({ episodes: [], total: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get unique IDs for batch fetches
    const creatorIds = [...new Set(episodes.map(e => e.creator_id))];
    const episodeIds = episodes.map(e => e.id);
    
    // =====================================================
    // 2. PARALLEL FETCH: Profiles + Quality Scores
    // =====================================================
    const [creatorProfilesResult, qualityScoresResult, creatorScoresResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', creatorIds),
      
      supabase
        .from('content_quality_scores')
        .select('episode_id, conversion_rate, completion_rate, cpm_w, freshness_score')
        .in('episode_id', episodeIds),
      
      supabase
        .from('creator_quality_scores')
        .select('creator_id, featured_boost, quality_tier')
        .in('creator_id', creatorIds),
    ]);
    
    const creatorMap = new Map(
      (creatorProfilesResult.data || []).map(p => [p.id, p])
    );
    
    const qualityMap = new Map(
      (qualityScoresResult.data || []).map(q => [q.episode_id, q])
    );
    
    const creatorScoreMap = new Map(
      (creatorScoresResult.data || []).map(c => [c.creator_id, c])
    );
    
    logStep("Data loaded", { 
      episodes: episodes.length,
      qualityScores: qualityScoresResult.data?.length || 0,
      creatorScores: creatorScoresResult.data?.length || 0,
      durationMs: Date.now() - startTime
    });
    
    // =====================================================
    // 3. SCORE AND RANK EPISODES
    // =====================================================
    const scoredEpisodes: ScoredEpisode[] = [];
    
    for (const ep of episodes) {
      // Check if already watched (for authenticated users) - apply penalty instead of skipping
      const isWatched = userId && watchedEpisodeIds.has(ep.id);
      
      // Handle series data - can be array or object from Supabase join
      const seriesData = ep.series;
      const series = Array.isArray(seriesData) ? seriesData[0] : seriesData as { title: string; cover_url: string | null; category_id: string | null } | null;
      const categoryId = series?.category_id || null;
      const quality = qualityMap.get(ep.id);
      const creatorScore = creatorScoreMap.get(ep.creator_id);
      const creatorProfile = creatorMap.get(ep.creator_id);
      
      // Calculate affinity score (0-100)
      let affinityScore = 50; // Default for anonymous/new users
      if (userId && categoryId && userCategoryScores.has(categoryId)) {
        // Transform -100 to +100 range to 0-100
        affinityScore = (userCategoryScores.get(categoryId)! + 100) / 2;
      }
      
      // Calculate quality score (0-100)
      let qualityScore = 30; // Default
      if (quality) {
        qualityScore = 
          (quality.conversion_rate || 0) * 5000 + // High weight on conversion
          (quality.completion_rate || 0) * 3000 +
          (quality.cpm_w || 0) * 200;
        qualityScore = Math.min(100, qualityScore);
      }
      
      // Calculate freshness score (0-100)
      let freshnessScore = 50;
      if (quality?.freshness_score) {
        freshnessScore = quality.freshness_score * 100;
      } else {
        // Fallback calculation
        const ageHours = (Date.now() - new Date(ep.created_at).getTime()) / (1000 * 60 * 60);
        freshnessScore = Math.max(10, Math.exp(-ageHours / 168) * 100);
      }
      
      // Get creator boost
      const creatorBoost = creatorScore?.featured_boost || 1.0;
      const creatorBoostScore = creatorBoost * 50; // Normalize to ~50 for standard
      
      // Apply watched penalty: reduce score by 70% for already watched episodes
      const watchedPenalty = isWatched ? 0.3 : 1.0;
      
      // Calculate total score with watched penalty
      const totalScore = (
        (affinityScore * WEIGHTS.categoryAffinity) +
        (qualityScore * WEIGHTS.contentQuality) +
        (freshnessScore * WEIGHTS.freshness) +
        (creatorBoostScore * WEIGHTS.creatorBoost)
      ) * watchedPenalty;
      
      scoredEpisodes.push({
        id: ep.id,
        title: ep.title,
        description: ep.description,
        thumbnail_url: ep.thumbnail_url,
        video_url: ep.video_url,
        hls_url: ep.hls_url,
        duration: ep.duration,
        episode_number: ep.episode_number,
        views: ep.views || 0,
        created_at: ep.created_at,
        series_id: ep.series_id,
        creator_id: ep.creator_id,
        series_title: series?.title || 'Untitled Series',
        series_cover_url: series?.cover_url || null,
        category_id: categoryId,
        creator_display_name: creatorProfile?.display_name || null,
        creator_avatar_url: creatorProfile?.avatar_url || null,
        quality_score: qualityScore,
        freshness_score: freshnessScore,
        creator_boost: creatorBoost,
        affinity_score: affinityScore,
        total_score: totalScore,
        is_discovery: false,
      });
    }
    
    // Sort by total score
    scoredEpisodes.sort((a, b) => b.total_score - a.total_score);
    
    // =====================================================
    // 4. APPLY DISCOVERY INJECTION
    // =====================================================
    const finalFeed: ScoredEpisode[] = [];
    let regularIndex = 0;
    let position = 0;
    
    // Find discovery candidates
    const unseenCreatorEpisodes = scoredEpisodes.filter(
      ep => userId && !seenCreatorIds.has(ep.creator_id)
    );
    
    const underrepCategoryEpisodes = scoredEpisodes.filter(
      ep => ep.category_id && !userTopCategories.includes(ep.category_id)
    );
    
    let discoveryCreatorIndex = 0;
    let discoveryCategoryIndex = 0;
    
    while (finalFeed.length < limit + offset && regularIndex < scoredEpisodes.length) {
      position++;
      
      // Every 5th position: inject unseen creator
      if (position % DISCOVERY_RULES.newCreatorEveryN === 0 && 
          discoveryCreatorIndex < unseenCreatorEpisodes.length) {
        const discoveryEp = { ...unseenCreatorEpisodes[discoveryCreatorIndex], is_discovery: true };
        finalFeed.push(discoveryEp);
        discoveryCreatorIndex++;
        continue;
      }
      
      // Every 10th position: inject underrepresented category
      if (position % DISCOVERY_RULES.underrepCategoryEveryN === 0 && 
          discoveryCategoryIndex < underrepCategoryEpisodes.length) {
        const discoveryEp = { ...underrepCategoryEpisodes[discoveryCategoryIndex], is_discovery: true };
        finalFeed.push(discoveryEp);
        discoveryCategoryIndex++;
        continue;
      }
      
      // Regular ranked episode
      if (regularIndex < scoredEpisodes.length) {
        finalFeed.push(scoredEpisodes[regularIndex]);
        regularIndex++;
      }
    }
    
    // Deduplicate (discovery might have duplicates with regular)
    const seenIds = new Set<string>();
    const deduped = finalFeed.filter(ep => {
      if (seenIds.has(ep.id)) return false;
      seenIds.add(ep.id);
      return true;
    });
    
    // Apply pagination
    const paginatedFeed = deduped.slice(offset, offset + limit);
    
    // =====================================================
    // 5. FETCH SOCIAL STATS FOR PAGINATED EPISODES ONLY
    // =====================================================
    const paginatedIds = paginatedFeed.map(ep => ep.id);
    const { data: socialStats } = await supabase
      .from('episode_social_stats')
      .select('episode_id, purchases_today, saves_count, is_trending')
      .in('episode_id', paginatedIds);
    
    const socialMap = new Map(
      (socialStats || []).map(s => [s.episode_id, s])
    );
    
    // Format response (remove internal scoring details for client)
    const clientFeed = paginatedFeed.map(ep => {
      const social = socialMap.get(ep.id);
      return {
        id: ep.id,
        title: ep.title,
        description: ep.description,
        thumbnail_url: ep.thumbnail_url,
        video_url: ep.video_url,
        hls_url: ep.hls_url,
        duration: ep.duration,
        episode_number: ep.episode_number,
        views: ep.views,
        created_at: ep.created_at,
        series_id: ep.series_id,
        creator_id: ep.creator_id,
        series_title: ep.series_title,
        series_cover_url: ep.series_cover_url,
        creator_display_name: ep.creator_display_name,
        creator_avatar_url: ep.creator_avatar_url,
        is_discovery: ep.is_discovery,
        purchases_today: social?.purchases_today || 0,
        saves_count: social?.saves_count || 0,
        is_trending: social?.is_trending || false,
      };
    });
    
    const totalDurationMs = Date.now() - startTime;
    logStep("Feed generated", { 
      total: deduped.length,
      returned: clientFeed.length,
      discoveryInjected: clientFeed.filter(e => e.is_discovery).length,
      totalDurationMs,
    });
    
    // === PERFORMANCE: Cache-Control Headers ===
    // Anonymous users: Cache for 5 minutes (CDN + browser)
    // Authenticated users: No cache (personalized content)
    const cacheControl = !userId 
      ? 'public, max-age=300, stale-while-revalidate=600'
      : 'private, no-cache, no-store, must-revalidate';
    
    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
      'Server-Timing': `feed;dur=${totalDurationMs}`,
      'X-Feed-Count': String(clientFeed.length),
    };
    
    // Add CDN headers only for anonymous users
    if (!userId) {
      responseHeaders['CDN-Cache-Control'] = 'public, max-age=300';
      responseHeaders['Surrogate-Control'] = 'max-age=300';
    }
    
    return new Response(
      JSON.stringify({ 
        episodes: clientFeed,
        total: deduped.length,
        has_more: offset + limit < deduped.length,
      }),
      { 
        status: 200, 
        headers: responseHeaders,
      }
    );
    
  } catch (error) {
    logStep("ERROR", { error: String(error) });
    return new Response(
      JSON.stringify({ error: String(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
