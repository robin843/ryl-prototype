import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Core analytics events from the 14-day sprint plan
export type AnalyticsEventType =
  | 'video_view'           // User views a video
  | 'video_complete'       // User completes a video (100% progress)
  | 'hotspot_impression'   // Hotspot becomes visible on screen
  | 'hotspot_click'        // User clicks a hotspot
  | 'product_panel_open'   // Product panel opens
  | 'product_panel_close'  // Product panel closes
  | 'mock_checkout_attempt'// User clicks "buy" in mock mode
  | 'product_save'         // User saves a product
  | 'auth_prompt_shown';   // Auth prompt is displayed

interface EventMetadata {
  sessionId?: string;
  videoProgress?: number;
  source?: 'feed' | 'series' | 'watch' | 'direct';
  panelDurationMs?: number;
  hotspotPosition?: { x: number; y: number };
  promptType?: string;
  [key: string]: unknown;
}

interface TrackEventParams {
  eventType: AnalyticsEventType;
  episodeId?: string;
  productId?: string;
  hotspotId?: string;
  creatorId?: string;
  revenueCents?: number;
  metadata?: EventMetadata;
}

// Generate a session ID for anonymous tracking
function getSessionId(): string {
  const key = 'ryl_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

export function useTrackEvent() {
  const { user } = useAuth();
  const trackedEvents = useRef<Set<string>>(new Set());

  const trackEvent = useCallback(async ({
    eventType,
    episodeId,
    productId,
    hotspotId,
    creatorId,
    revenueCents,
    metadata = {},
  }: TrackEventParams) => {
    // Add session ID to metadata for anonymous aggregation
    const enrichedMetadata = {
      ...metadata,
      sessionId: getSessionId(),
    };

    // Create a dedup key to prevent duplicate events in the same session
    const dedupKey = `${eventType}_${episodeId || ''}_${productId || ''}_${hotspotId || ''}`;
    
    // For certain events, we want to allow duplicates (e.g., video_view on replay)
    const allowDuplicates = ['product_panel_open', 'product_panel_close', 'mock_checkout_attempt'];
    
    if (!allowDuplicates.includes(eventType) && trackedEvents.current.has(dedupKey)) {
      console.log(`[Analytics] Skipping duplicate event: ${eventType}`);
      return;
    }

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: eventType,
          user_id: user?.id || null,
          episode_id: episodeId || null,
          product_id: productId || null,
          hotspot_id: hotspotId || null,
          creator_id: creatorId || '',
          revenue_cents: revenueCents || null,
          metadata: enrichedMetadata,
        });

      if (error) {
        console.error('[Analytics] Error tracking event:', error);
      } else {
        trackedEvents.current.add(dedupKey);
        console.log(`[Analytics] Tracked: ${eventType}`, { episodeId, productId, hotspotId });
      }
    } catch (err) {
      console.error('[Analytics] Failed to track event:', err);
    }
  }, [user?.id]);

  // Convenience methods for common events
  const trackVideoView = useCallback((episodeId: string, creatorId: string, source: EventMetadata['source'] = 'feed') => {
    trackEvent({
      eventType: 'video_view',
      episodeId,
      creatorId,
      metadata: { source },
    });
  }, [trackEvent]);

  const trackVideoComplete = useCallback((episodeId: string, creatorId: string) => {
    trackEvent({
      eventType: 'video_complete',
      episodeId,
      creatorId,
    });
  }, [trackEvent]);

  const trackHotspotImpression = useCallback((
    hotspotId: string, 
    episodeId: string, 
    creatorId: string,
    productId: string,
    position: { x: number; y: number }
  ) => {
    trackEvent({
      eventType: 'hotspot_impression',
      hotspotId,
      episodeId,
      creatorId,
      productId,
      metadata: { hotspotPosition: position },
    });
  }, [trackEvent]);

  const trackHotspotClick = useCallback((
    hotspotId: string, 
    episodeId: string, 
    creatorId: string,
    productId: string
  ) => {
    trackEvent({
      eventType: 'hotspot_click',
      hotspotId,
      episodeId,
      creatorId,
      productId,
    });
  }, [trackEvent]);

  const trackProductPanelOpen = useCallback((productId: string, episodeId: string, creatorId: string) => {
    trackEvent({
      eventType: 'product_panel_open',
      productId,
      episodeId,
      creatorId,
    });
  }, [trackEvent]);

  const trackProductPanelClose = useCallback((
    productId: string, 
    episodeId: string, 
    creatorId: string,
    durationMs: number
  ) => {
    trackEvent({
      eventType: 'product_panel_close',
      productId,
      episodeId,
      creatorId,
      metadata: { panelDurationMs: durationMs },
    });
  }, [trackEvent]);

  const trackMockCheckoutAttempt = useCallback((
    productId: string, 
    episodeId: string, 
    creatorId: string
  ) => {
    trackEvent({
      eventType: 'mock_checkout_attempt',
      productId,
      episodeId,
      creatorId,
    });
  }, [trackEvent]);

  const trackProductSave = useCallback((productId: string, episodeId: string, creatorId: string) => {
    trackEvent({
      eventType: 'product_save',
      productId,
      episodeId,
      creatorId,
    });
  }, [trackEvent]);

  const trackAuthPromptShown = useCallback((promptType: string, episodeId?: string) => {
    trackEvent({
      eventType: 'auth_prompt_shown',
      episodeId,
      metadata: { promptType },
    });
  }, [trackEvent]);

  // Reset tracked events (e.g., when navigating to new content)
  const resetTracking = useCallback(() => {
    trackedEvents.current.clear();
  }, []);

  return {
    trackEvent,
    trackVideoView,
    trackVideoComplete,
    trackHotspotImpression,
    trackHotspotClick,
    trackProductPanelOpen,
    trackProductPanelClose,
    trackMockCheckoutAttempt,
    trackProductSave,
    trackAuthPromptShown,
    resetTracking,
  };
}
