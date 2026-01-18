// Published base URL for share links
const BASE_URL = "https://ryl-story-showcase.lovable.app";

/**
 * Generate a share URL with the published base URL
 */
export function getShareUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
}

/**
 * Generate a share URL for a series
 */
export function getSeriesShareUrl(seriesId: string): string {
  return getShareUrl(`/series/${seriesId}`);
}

/**
 * Generate a share URL for an episode
 */
export function getEpisodeShareUrl(episodeId: string): string {
  return getShareUrl(`/watch/${episodeId}`);
}

/**
 * Generate a share URL for a product
 */
export function getProductShareUrl(productId: string): string {
  return getShareUrl(`/product/${productId}`);
}

/**
 * Generate a share URL for a creator profile
 */
export function getCreatorShareUrl(creatorId: string): string {
  return getShareUrl(`/creator/${creatorId}`);
}

/**
 * Get a display-friendly shortened URL
 */
export function getDisplayUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Return domain + first segment of path
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) {
      return urlObj.hostname;
    }
    if (pathSegments.length === 1) {
      return `${urlObj.hostname}/${pathSegments[0]}`;
    }
    // Show domain/type/... for longer paths
    return `${urlObj.hostname}/${pathSegments[0]}/...`;
  } catch {
    return url;
  }
}
