import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  thumbnailUrl: string | null;
  seriesTitle: string;
}

interface Creator {
  userId: string;
  displayName: string | null;
  companyName: string | null;
  avatarUrl: string | null;
}

export function useProductEpisodes(productId: string | undefined) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch hotspots for this product to find episodes
        const { data: hotspots } = await supabase
          .from('episode_hotspots')
          .select('episode_id')
          .eq('product_id', productId);

        const episodeIds = [...new Set((hotspots || []).map(h => h.episode_id))];

        if (episodeIds.length > 0) {
          const { data: episodeData } = await supabase
            .from('episodes')
            .select(`
              id,
              title,
              episode_number,
              thumbnail_url,
              series_id,
              series (title)
            `)
            .in('id', episodeIds)
            .eq('status', 'published');

          setEpisodes((episodeData || []).map((ep: any) => ({
            id: ep.id,
            title: ep.title,
            episodeNumber: ep.episode_number,
            thumbnailUrl: ep.thumbnail_url,
            seriesTitle: ep.series?.title || 'Serie',
          })));
        }

        // Fetch product creator
        const { data: product } = await supabase
          .from('shopable_products')
          .select('creator_id')
          .eq('id', productId)
          .single();

        if (product?.creator_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, display_name, company_name, avatar_url')
            .eq('user_id', product.creator_id)
            .single();

          if (profile) {
            setCreator({
              userId: profile.user_id,
              displayName: profile.display_name,
              companyName: profile.company_name,
              avatarUrl: profile.avatar_url,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching product episodes:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [productId]);

  return { episodes, creator, isLoading };
}