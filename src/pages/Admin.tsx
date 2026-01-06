import { useState, useEffect } from "react";
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

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
      <header className="px-6 pt-4 pb-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-headline">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Producer-Bewerbungen verwalten
            </p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="px-6 py-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-card border border-border/30 text-center">
            <Clock className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-serif">{pendingApps.length}</p>
            <p className="text-xs text-muted-foreground">Offen</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/30 text-center">
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-serif">{applications.filter(a => a.status === 'approved').length}</p>
            <p className="text-xs text-muted-foreground">Genehmigt</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/30 text-center">
            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-serif">{applications.filter(a => a.status === 'rejected').length}</p>
            <p className="text-xs text-muted-foreground">Abgelehnt</p>
          </div>
        </div>
      </section>

      {/* Pending Applications */}
      <section className="px-6 py-6">
        <h3 className="text-headline text-lg mb-4">Offene Bewerbungen</h3>
        {pendingApps.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-border text-center">
            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Keine offenen Bewerbungen
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApps.map((app) => (
              <Card key={app.id} className="cursor-pointer hover:border-border transition-colors" onClick={() => setSelectedApp(app)}>
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
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      Offen
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Processed Applications */}
      {processedApps.length > 0 && (
        <section className="px-6 py-6">
          <h3 className="text-headline text-lg mb-4">Bearbeitete Bewerbungen</h3>
          <div className="space-y-3">
            {processedApps.map((app) => (
              <Card key={app.id}>
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
        </section>
      )}

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedApp?.company_name}</DialogTitle>
            <DialogDescription>
              Bewerbung vom {selectedApp && new Date(selectedApp.created_at).toLocaleDateString('de-DE')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Beschreibung</h4>
              <p className="text-sm text-muted-foreground">{selectedApp?.description}</p>
            </div>

            {selectedApp?.portfolio_url && (
              <div>
                <h4 className="text-sm font-medium mb-1">Portfolio</h4>
                <a 
                  href={selectedApp.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary flex items-center gap-1 hover:underline"
                >
                  {selectedApp.portfolio_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-2">Ablehnungsgrund (optional)</h4>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Grund für die Ablehnung eingeben..."
                rows={3}
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
