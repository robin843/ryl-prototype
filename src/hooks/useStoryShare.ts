import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CreateStoryShareParams {
  episodeId: string;
  productId?: string;
  creatorId: string;
  targetUrl?: string;
}

interface StoryShareResult {
  shortCode: string;
  shareUrl: string;
}

export function useStoryShare() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const createStoryShare = useCallback(async (params: CreateStoryShareParams): Promise<StoryShareResult | null> => {
    setIsCreating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-story-share', {
        body: {
          ...params,
          sharerId: user?.id,
        },
      });

      if (error) throw error;

      return {
        shortCode: data.shortCode,
        shareUrl: data.shareUrl,
      };
    } catch (error) {
      console.error('[useStoryShare] Error creating share:', error);
      toast.error('Fehler beim Erstellen des Share-Links');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user]);

  const trackClick = useCallback(async (shortCode: string, conversion = false) => {
    try {
      await supabase.functions.invoke('track-story-click', {
        body: { shortCode, conversion },
      });
    } catch (error) {
      console.error('[useStoryShare] Error tracking click:', error);
    }
  }, []);

  const shareToInstagram = useCallback(async (params: CreateStoryShareParams) => {
    const result = await createStoryShare(params);
    if (!result) return;

    // For Instagram Stories, we need to provide a shareable image
    // Since we can't directly open Instagram Stories from web,
    // we'll copy the link and prompt the user
    try {
      await navigator.clipboard.writeText(result.shareUrl);
      toast.success('Link kopiert! Füge ihn in deine Instagram Story ein.');
      
      // Try to open Instagram if available
      const instagramUrl = `instagram://story-camera`;
      window.open(instagramUrl, '_blank');
    } catch {
      toast.success('Link: ' + result.shareUrl);
    }
  }, [createStoryShare]);

  const shareToTikTok = useCallback(async (params: CreateStoryShareParams) => {
    const result = await createStoryShare(params);
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.shareUrl);
      toast.success('Link kopiert! Füge ihn in dein TikTok ein.');
    } catch {
      toast.success('Link: ' + result.shareUrl);
    }
  }, [createStoryShare]);

  return {
    createStoryShare,
    shareToInstagram,
    shareToTikTok,
    trackClick,
    isCreating,
  };
}
