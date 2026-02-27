import { useState, useEffect } from "react";
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, ExternalLink, BarChart3, UserCog, Bell, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { UserStatsCards } from "@/components/admin/UserStatsCards";
import { UsersTable } from "@/components/admin/UsersTable";
import { DemographicCharts } from "@/components/admin/DemographicCharts";

import {
  useAdminProfiles,
  useAdminUserRoles,
  useAdminSubscriptions,
  useAdminUserData,
  useAdminStats,
  useDemographicStats,
  getUserRolesMap,
  getSubscriptionsMap,
} from "@/hooks/useAdminData";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

interface Application {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  company_name: string;
  description: string;
  portfolio_url: string | null;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // Admin data hooks
  const { data: profiles, isLoading: profilesLoading } = useAdminProfiles();
  const { data: userRoles } = useAdminUserRoles();
  const { data: subscriptions } = useAdminSubscriptions();
  const { data: userData } = useAdminUserData(isAdmin);
  
  const emailsMap = userData?.emails;
  const bannedMap = userData?.banned;

  const stats = useAdminStats(profiles);
  const demographicStats = useDemographicStats(profiles);
  const rolesMap = getUserRolesMap(userRoles);
  const subscriptionsMap = getSubscriptionsMap(subscriptions);

  // Count active subscriptions
  const activeSubscriptions = subscriptions?.filter((s) => s.status === "active").length || 0;

  // Admin notifications
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Fetch pending applications
      const { data, error } = await supabase
        .from('producer_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast.error('Fehler beim Laden der Bewerbungen');
      } else {
        setApplications((data as Application[]) || []);
      }
      setLoading(false);
    };

    checkAdminAndLoad();
  }, [user]);

  const handleApprove = async (app: Application) => {
    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('approve-producer', {
        body: { applicationId: app.id, action: 'approve' }
      });

      if (error) throw error;

      setApplications(prev => 
        prev.map(a => a.id === app.id ? { ...a, status: 'approved' as const } : a)
      );
      setSelectedApp(null);
      toast.success(`${app.company_name} wurde als Producer genehmigt!`);
    } catch (err) {
      console.error('Error approving application:', err);
      toast.error('Fehler beim Genehmigen der Bewerbung');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (app: Application) => {
    if (!rejectionReason.trim()) {
      toast.error('Bitte gib einen Ablehnungsgrund an');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('approve-producer', {
        body: { 
          applicationId: app.id, 
          action: 'reject',
          rejectionReason: rejectionReason.trim()
        }
      });

      if (error) throw error;

      setApplications(prev => 
        prev.map(a => a.id === app.id ? { ...a, status: 'rejected' as const } : a)
      );
      setSelectedApp(null);
      setRejectionReason("");
      toast.success(`Bewerbung von ${app.company_name} wurde abgelehnt`);
    } catch (err) {
      console.error('Error rejecting application:', err);
      toast.error('Fehler beim Ablehnen der Bewerbung');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-headline mb-2">Zugriff verweigert</h1>
          <p className="text-muted-foreground mb-6">
            Du hast keine Berechtigung, diese Seite aufzurufen.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            Zurück zur Startseite
          </Button>
        </div>
      </div>
    );
  }

  const pendingApps = applications.filter(a => a.status === 'pending');
  const processedApps = applications.filter(a => a.status !== 'pending');

  return (
    <div className="min-h-screen bg-background safe-area-top pb-24">
      {/* Header */}
      <header className="px-6 pt-4 pb-6 border-b border-gold/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-headline">
                <span className="text-gold">Admin</span> Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Nutzer & Producer-Bewerbungen verwalten
              </p>
            </div>
          </div>

          {/* Notifications Bell */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-gold" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-black text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 border-gold/20">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20">
                <h4 className="font-medium text-gold">Benachrichtigungen</h4>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => markAllAsRead()}
                    className="text-xs h-auto py-1 text-gold"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Alle gelesen
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    Keine Benachrichtigungen
                  </div>
                ) : (
                  <div className="divide-y divide-gold/10">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 cursor-pointer hover:bg-gold/5 transition-colors ${
                          !notification.is_read ? 'bg-gold/5' : ''
                        }`}
                        onClick={() => {
                          markAsRead(notification.id);
                          if (notification.link) {
                            navigate(notification.link);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.is_read ? 'bg-muted' : 'bg-gold'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.created_at).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 py-6">
        <Tabs defaultValue={initialTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto bg-gold/5 border border-gold/20 gap-1 p-1">
            <TabsTrigger value="overview" className="flex flex-col gap-1 py-2 px-1 data-[state=active]:bg-gold data-[state=active]:text-black">
              <BarChart3 className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs">Übersicht</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex flex-col gap-1 py-2 px-1 data-[state=active]:bg-gold data-[state=active]:text-black">
              <Users className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs">Nutzer</span>
            </TabsTrigger>
            <TabsTrigger value="demographics" className="flex flex-col gap-1 py-2 px-1 data-[state=active]:bg-gold data-[state=active]:text-black">
              <UserCog className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs">Demo.</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex flex-col gap-1 py-2 px-1 relative data-[state=active]:bg-gold data-[state=active]:text-black">
              <Clock className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs">Bew.</span>
              {pendingApps.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-black text-xs rounded-full flex items-center justify-center">
                  {pendingApps.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {profilesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gold" />
              </div>
            ) : (
              <>
                <UserStatsCards
                  totalUsers={stats.totalUsers}
                  newUsersLast7Days={stats.newUsersLast7Days}
                  activeSubscriptions={activeSubscriptions}
                  completedOnboarding={stats.completedOnboarding}
                />

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-card/50 border-gold/20">
                    <CardContent className="p-4 text-center">
                      <Clock className="w-5 h-5 text-gold mx-auto mb-2" />
                      <p className="text-2xl font-serif text-gold">{pendingApps.length}</p>
                      <p className="text-xs text-muted-foreground">Offene Bewerbungen</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 border-gold/20">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-serif">{applications.filter(a => a.status === 'approved').length}</p>
                      <p className="text-xs text-muted-foreground">Genehmigt</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 border-gold/20">
                    <CardContent className="p-4 text-center">
                      <XCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
                      <p className="text-2xl font-serif">{applications.filter(a => a.status === 'rejected').length}</p>
                      <p className="text-xs text-muted-foreground">Abgelehnt</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            {profilesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gold" />
              </div>
            ) : profiles && profiles.length > 0 ? (
              <UsersTable
                profiles={profiles}
                rolesMap={rolesMap}
                subscriptionsMap={subscriptionsMap}
                emailsMap={emailsMap}
                bannedMap={bannedMap}
              />
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-gold/30 text-center">
                <Users className="w-12 h-12 text-gold/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Keine Nutzer gefunden</p>
              </div>
            )}
          </TabsContent>


          {/* Demographics Tab */}
          <TabsContent value="demographics">
            {profilesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gold" />
              </div>
            ) : (
              <DemographicCharts
                ageGroups={demographicStats.ageGroups}
                genderDistribution={demographicStats.genderDistribution}
                registrationTimeline={demographicStats.registrationTimeline}
                totalWithAge={demographicStats.totalWithAge}
                totalWithGender={demographicStats.totalWithGender}
                totalUsers={stats.totalUsers}
              />
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            {/* Pending Applications */}
            <div>
              <h3 className="text-headline text-lg mb-4">
                <span className="text-gold">Offene</span> Bewerbungen
              </h3>
              {pendingApps.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-gold/30 text-center">
                  <Clock className="w-12 h-12 text-gold/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Keine offenen Bewerbungen</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApps.map((app) => (
                    <Card key={app.id} className="cursor-pointer hover:border-gold/50 border-gold/20 transition-colors" onClick={() => setSelectedApp(app)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{app.company_name}</h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {app.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(app.created_at).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20">
                            Offen
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Processed Applications */}
            {processedApps.length > 0 && (
              <div>
                <h3 className="text-headline text-lg mb-4">
                  <span className="text-gold">Bearbeitete</span> Bewerbungen
                </h3>
                <div className="space-y-3">
                  {processedApps.map((app) => (
                    <Card key={app.id} className="border-gold/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{app.company_name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(app.created_at).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={app.status === 'approved' 
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                            }
                          >
                            {app.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-md border-gold/20">
          <DialogHeader>
            <DialogTitle className="text-gold">{selectedApp?.company_name}</DialogTitle>
            <DialogDescription>
              Bewerbung vom {selectedApp && new Date(selectedApp.created_at).toLocaleDateString('de-DE')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1 text-gold">Beschreibung</h4>
              <p className="text-sm text-muted-foreground">{selectedApp?.description}</p>
            </div>

            {selectedApp?.portfolio_url && (
              <div>
                <h4 className="text-sm font-medium mb-1 text-gold">Portfolio</h4>
                <a 
                  href={selectedApp.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gold flex items-center gap-1 hover:underline"
                >
                  {selectedApp.portfolio_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-2 text-gold">Ablehnungsgrund (optional)</h4>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Grund für die Ablehnung eingeben..."
                rows={3}
                className="border-gold/20 focus:border-gold focus:ring-gold/20"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button 
              variant="destructive" 
              onClick={() => selectedApp && handleReject(selectedApp)}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
              Ablehnen
            </Button>
            <Button 
              onClick={() => selectedApp && handleApprove(selectedApp)}
              disabled={processing}
              className="bg-gold hover:bg-gold/90 text-black"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
              Genehmigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
