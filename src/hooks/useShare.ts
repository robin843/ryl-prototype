import { useCallback } from 'react';
import { toast } from 'sonner';

interface ShareData {
  title: string;
  text?: string;
  url?: string;
}

export function useShare() {
  const share = useCallback(async (data: ShareData) => {
    const shareUrl = data.url || window.location.href;
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
  }, []);

  const shareToTwitter = useCallback((data: ShareData) => {
    const url = data.url || window.location.href;
    const text = encodeURIComponent(data.text || data.title);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
  }, []);

  const shareToFacebook = useCallback((data: ShareData) => {
    const url = data.url || window.location.href;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
  }, []);

  const shareToWhatsApp = useCallback((data: ShareData) => {
    const url = data.url || window.location.href;
    const text = encodeURIComponent(`${data.title}\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, []);

  const shareToTelegram = useCallback((data: ShareData) => {
    const url = data.url || window.location.href;
    const text = encodeURIComponent(data.title);
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`,
      '_blank'
    );
  }, []);

  const shareByEmail = useCallback((data: ShareData) => {
    const url = data.url || window.location.href;
    const subject = encodeURIComponent(data.title);
    const body = encodeURIComponent(`${data.text || data.title}\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, []);

  return {
    share,
    shareToTwitter,
    shareToFacebook,
    shareToWhatsApp,
    shareToTelegram,
    shareByEmail,
  };
}
