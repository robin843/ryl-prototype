import { useCallback } from 'react';
import { toast } from 'sonner';
import { getShareUrl } from '@/lib/shareUrls';

interface ShareData {
  title: string;
  text?: string;
  url?: string;
  /** Path to use for published URL (e.g., /series/123) */
  path?: string;
}

/**
 * Hook for sharing content with native share or clipboard fallback
 * Uses published URLs instead of preview URLs for sharing
 */
export function useShare() {
  /**
   * Get the final share URL, preferring published URL
   */
  const getUrl = useCallback((data: ShareData): string => {
    // If explicit path provided, use published URL
    if (data.path) {
      return getShareUrl(data.path);
    }
    // If URL provided and it's already a published URL, use it
    if (data.url) {
      return data.url;
    }
    // Fallback to current page with published base
    const currentPath = window.location.pathname;
    return getShareUrl(currentPath);
  }, []);

  const share = useCallback(async (data: ShareData) => {
    const shareUrl = getUrl(data);
    const shareData = {
      title: data.title,
      text: data.text || data.title,
      url: shareUrl,
    };

    // Try native share first (works on mobile and some desktop browsers)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (err) {
        // User cancelled - that's fine
        if ((err as Error).name === 'AbortError') {
          return false;
        }
        // Other error - fall through to clipboard
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link kopiert!");
      return true;
    } catch (err) {
      // Final fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success("Link kopiert!");
      return true;
    }
  }, [getUrl]);

  const shareToTwitter = useCallback((data: ShareData) => {
    const url = getUrl(data);
    const text = encodeURIComponent(data.text || data.title);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
  }, [getUrl]);

  const shareToFacebook = useCallback((data: ShareData) => {
    const url = getUrl(data);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
  }, [getUrl]);

  const shareToWhatsApp = useCallback((data: ShareData) => {
    const url = getUrl(data);
    const text = encodeURIComponent(`${data.title}\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [getUrl]);

  const shareToTelegram = useCallback((data: ShareData) => {
    const url = getUrl(data);
    const text = encodeURIComponent(data.title);
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`,
      '_blank'
    );
  }, [getUrl]);

  const shareByEmail = useCallback((data: ShareData) => {
    const url = getUrl(data);
    const subject = encodeURIComponent(data.title);
    const body = encodeURIComponent(`${data.text || data.title}\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [getUrl]);

  return {
    share,
    shareToTwitter,
    shareToFacebook,
    shareToWhatsApp,
    shareToTelegram,
    shareByEmail,
    getUrl,
  };
}
