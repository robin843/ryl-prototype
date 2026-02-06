import { Bell, Check, CheckCheck, AlertTriangle, TrendingUp, Users, Package, RotateCcw } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrandNotification } from '@/hooks/useBrandNotifications';
import { cn } from '@/lib/utils';

const typeIcons: Record<string, React.ReactNode> = {
  budget_warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  partnership_update: <Users className="h-4 w-4 text-blue-500" />,
  trending: <TrendingUp className="h-4 w-4 text-green-500" />,
  stock_alert: <Package className="h-4 w-4 text-orange-500" />,
  refund: <RotateCcw className="h-4 w-4 text-red-500" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `vor ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours}h`;
  const days = Math.floor(hours / 24);
  return `vor ${days}d`;
}

interface Props {
  notifications: BrandNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function BrandNotificationsSheet({ notifications, unreadCount, onMarkAsRead, onMarkAllAsRead }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gold/10 hover:text-gold relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] bg-red-500 text-white border-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[340px] sm:w-[400px]">
        <SheetHeader className="flex flex-row items-center justify-between pr-2">
          <SheetTitle className="text-gold">Benachrichtigungen</SheetTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="text-xs h-7">
              <CheckCheck className="h-3 w-3 mr-1" />
              Alle gelesen
            </Button>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Keine Benachrichtigungen</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => !n.is_read && onMarkAsRead(n.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    n.is_read ? "opacity-60" : "bg-gold/5 hover:bg-gold/10"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {typeIcons[n.type] || <Bell className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
