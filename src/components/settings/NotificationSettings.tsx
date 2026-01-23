import { Bell, BellOff, Film, Package, Megaphone, UserCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export function NotificationSettings() {
  const { user } = useAuth();
  const {
    isSupported,
    isSubscribed,
    permission,
    preferences,
    loading,
    subscribe,
    unsubscribe,
    updatePreference,
  } = usePushNotifications();

  if (!user) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Melde dich an um Benachrichtigungen zu verwalten</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Push-Benachrichtigungen werden von deinem Browser nicht unterstützt</p>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="text-center py-8">
        <BellOff className="w-8 h-8 mx-auto mb-2 text-destructive opacity-50" />
        <p className="text-sm text-muted-foreground mb-2">
          Benachrichtigungen wurden blockiert
        </p>
        <p className="text-xs text-muted-foreground">
          Aktiviere sie in deinen Browser-Einstellungen
        </p>
      </div>
    );
  }

  const handleMasterToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const notificationTypes = [
    {
      key: 'new_episodes' as const,
      label: 'Neue Folgen',
      description: 'Wenn deine Lieblings-Creator neue Folgen veröffentlichen',
      icon: Film,
    },
    {
      key: 'order_updates' as const,
      label: 'Bestellungen',
      description: 'Status-Updates zu deinen Bestellungen',
      icon: Package,
    },
    {
      key: 'followed_creators' as const,
      label: 'Creator Updates',
      description: 'Neuigkeiten von Creators denen du folgst',
      icon: UserCheck,
    },
    {
      key: 'promotions' as const,
      label: 'Angebote & Aktionen',
      description: 'Exklusive Deals und Rabatte',
      icon: Megaphone,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isSubscribed ? 'bg-gold/20' : 'bg-muted'
          }`}>
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-gold" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">
              Push-Benachrichtigungen
            </p>
            <p className="text-xs text-muted-foreground">
              {isSubscribed ? 'Aktiviert' : 'Deaktiviert'}
            </p>
          </div>
        </div>
        <Button
          variant={isSubscribed ? 'outline' : 'default'}
          size="sm"
          onClick={handleMasterToggle}
          className={!isSubscribed ? 'bg-gold hover:bg-gold/90 text-black' : ''}
        >
          {isSubscribed ? 'Deaktivieren' : 'Aktivieren'}
        </Button>
      </div>

      {/* Individual Preferences */}
      {isSubscribed && (
        <>
          <Separator />
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-foreground">
              Benachrichtigungstypen
            </h4>
            <p className="text-xs text-muted-foreground">
              Wähle welche Benachrichtigungen du erhalten möchtest
            </p>
          </div>

          <div className="space-y-4">
            {notificationTypes.map((type) => (
              <div
                key={type.key}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <type.icon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label
                      htmlFor={type.key}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {type.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={type.key}
                  checked={preferences[type.key]}
                  onCheckedChange={(checked) => updatePreference(type.key, checked)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
