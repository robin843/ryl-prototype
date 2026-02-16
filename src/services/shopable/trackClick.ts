/**
 * Hotspot Click Tracking
 * 
 * Calls the track-hotspot-click edge function to:
 * 1. Log the click with a unique click_id
 * 2. Build UTM-enriched redirect URL server-side
 * 3. Return the final redirect URL
 */

import { supabase } from '@/integrations/supabase/client';

interface TrackClickParams {
  hotspotId: string;
  episodeId: string;
  sessionId?: string;
}

interface TrackClickResult {
  click_id: string;
  redirect_url: string;
}

export async function trackHotspotClick(
  params: TrackClickParams
): Promise<TrackClickResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke('track-hotspot-click', {
      body: {
        hotspot_id: params.hotspotId,
        episode_id: params.episodeId,
        session_id: params.sessionId ?? null,
      },
    });

    if (error) {
      console.error('[trackHotspotClick] Edge function error:', error.message);
      return null;
    }

    return data as TrackClickResult;
  } catch (err) {
    console.error('[trackHotspotClick] Network error:', err);
    return null;
  }
}
