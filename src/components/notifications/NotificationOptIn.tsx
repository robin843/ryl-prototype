import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'ryl_notification_prompt_dismissed';
const VIEW_COUNT_KEY = 'ryl_video_view_count';
const VIEWS_BEFORE_PROMPT = 3;

export function NotificationOptIn() {
  const { user } = useAuth();
  const { isSupported, isSubscribed, permission, subscribe, loading } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // Don't show if not supported, already subscribed, or permission denied
    if (!isSupported || isSubscribed || permission === 'denied') {
      return;
    }

    // Don't show if user not logged in
    if (!user) {
      return;
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') {
      return;
    }

    // Check view count
    const viewCount = parseInt(localStorage.getItem(VIEW_COUNT_KEY) || '0', 10);
    if (viewCount >= VIEWS_BEFORE_PROMPT) {
      setShowPrompt(true);
    }
  }, [isSupported, isSubscribed, permission, user]);

  const handleEnable = async () => {
    setIsSubscribing(true);
    const success = await subscribe();
    setIsSubscribing(false);
    
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowPrompt(false);
  };

  if (loading || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 relative">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Schließen"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-3 pr-6">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-sm">
                Verpasse keine neuen Folgen
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Erhalte Benachrichtigungen wenn deine Lieblings-Creator neue Folgen veröffentlichen.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-1 text-muted-foreground"
            >
              Später
            </Button>
            <Button
              size="sm"
              onClick={handleEnable}
              disabled={isSubscribing}
              className="flex-1 bg-gold hover:bg-gold/90 text-black"
            >
              {isSubscribing ? 'Aktiviere...' : 'Aktivieren'}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper function to increment view count (call this when video is viewed)
export function incrementVideoViewCount() {
  const current = parseInt(localStorage.getItem(VIEW_COUNT_KEY) || '0', 10);
  localStorage.setItem(VIEW_COUNT_KEY, String(current + 1));
}
