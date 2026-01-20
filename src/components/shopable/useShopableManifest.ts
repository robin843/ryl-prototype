import { useState, useEffect, useRef } from 'react';
import type { ManifestHotspot, ResolveResponse, ShopableManifest } from './types';

const SHOPABLE_API_BASE_URL = import.meta.env.VITE_SHOPABLE_API_BASE_URL || '';
const PARTNER = 'ryl.zone';

// ETag cache scoped per manifest URL
const etagCache: Record<string, string> = {};
const manifestCache: Record<string, ManifestHotspot[]> = {};

export function useShopableManifest(partnerVideoId: string) {
  const [hotspots, setHotspots] = useState<ManifestHotspot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!partnerVideoId || !SHOPABLE_API_BASE_URL) {
      setIsLoading(false);
      return;
    }

    // Abort previous request if any
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const fetchManifest = async () => {
      try {
        setIsLoading(true);

        // Step 1: Resolve the manifest URL
        const resolveUrl = `${SHOPABLE_API_BASE_URL}/v1/runtime/resolve?partner=${PARTNER}&external_id=${encodeURIComponent(partnerVideoId)}`;
        
        const resolveResponse = await fetch(resolveUrl, { signal });
        
        // Handle 404 or non-ok responses silently
        if (!resolveResponse.ok) {
          setHotspots([]);
          setIsLoading(false);
          return;
        }

        const resolveData: ResolveResponse = await resolveResponse.json();

        // Handle null manifest URL silently
        if (!resolveData.public_manifest_url) {
          setHotspots([]);
          setIsLoading(false);
          return;
        }

        const manifestUrl = resolveData.public_manifest_url;

        // Step 2: Fetch the manifest with ETag caching
        const headers: HeadersInit = {};
        const cachedEtag = etagCache[manifestUrl];
        if (cachedEtag) {
          headers['If-None-Match'] = cachedEtag;
        }

        const manifestResponse = await fetch(manifestUrl, { headers, signal });

        // Handle 304 Not Modified - use cached data
        if (manifestResponse.status === 304 && manifestCache[manifestUrl]) {
          setHotspots(manifestCache[manifestUrl]);
          setIsLoading(false);
          return;
        }

        // Handle non-ok responses silently
        if (!manifestResponse.ok) {
          setHotspots([]);
          setIsLoading(false);
          return;
        }

        // Cache the ETag for future requests
        const newEtag = manifestResponse.headers.get('ETag');
        if (newEtag) {
          etagCache[manifestUrl] = newEtag;
        }

        const manifestData: ShopableManifest = await manifestResponse.json();
        
        // Cache the manifest data
        manifestCache[manifestUrl] = manifestData.hotspots || [];
        setHotspots(manifestData.hotspots || []);
        setIsLoading(false);

      } catch (error) {
        // Fail silently - don't log errors
        if ((error as Error).name !== 'AbortError') {
          setHotspots([]);
          setIsLoading(false);
        }
      }
    };

    fetchManifest();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [partnerVideoId]);

  return { hotspots, isLoading };
}
