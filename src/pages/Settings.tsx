import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Trash2, 
  Film, 
  Play, 
  Loader2,
  Check,
  AlertTriangle,
  Smartphone,
  Wifi,
  Sparkles,
  Bell
} from "lucide-react";
import { WatchHistorySection } from "@/components/settings/WatchHistorySection";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type VideoQuality = "auto" | "low" | "high";

const getStoredVideoQuality = (): VideoQuality => {
  if (typeof window === "undefined") return "auto";
  return (localStorage.getItem("ryl-video-quality") as VideoQuality) || "auto";
};

const getStoredAutoplay = (): boolean => {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("ryl-autoplay");
  return stored === null ? true : stored === "true";
};

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // Account states
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  // Loading states
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Preferences
  const [videoQuality, setVideoQuality] = useState<VideoQuality>(getStoredVideoQuality);
  const [autoplay, setAutoplay] = useState(getStoredAutoplay);

  const handleEmailChange = async () => {
    if (!newEmail) {
      toast.error("Bitte gib eine neue E-Mail-Adresse ein");
      return;
    }

    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      toast.success("Bestätigungs-E-Mail gesendet", {
        description: "Überprüfe dein Postfach und bestätige die neue Adresse.",
      });
      setNewEmail("");
    } catch (error: any) {
      toast.error("Fehler beim Ändern der E-Mail", {
        description: error.message,
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Bitte fülle alle Felder aus");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Passwort muss mindestens 6 Zeichen haben");
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Passwort erfolgreich geändert");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error("Fehler beim Ändern des Passworts", {
        description: error.message,
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "LÖSCHEN") {
      toast.error("Bitte gib 'LÖSCHEN' ein, um zu bestätigen");
      return;
    }

    setDeleteLoading(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");

      if (error) throw error;

      toast.success("Account wird gelöscht", {
        description: "Dein Account wird innerhalb von 14 Tagen vollständig gelöscht.",
      });
      
      await signOut();
      navigate("/");
    } catch (error: any) {
      toast.error("Fehler beim Löschen des Accounts", {
        description: error.message || "Bitte kontaktiere den Support.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleVideoQualityChange = (value: VideoQuality) => {
    setVideoQuality(value);
    localStorage.setItem("ryl-video-quality", value);
    toast.success("Video-Qualität gespeichert");
  };

  const handleAutoplayChange = (checked: boolean) => {
    setAutoplay(checked);
    localStorage.setItem("ryl-autoplay", String(checked));
    toast.success(checked ? "Autoplay aktiviert" : "Autoplay deaktiviert");
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-muted-foreground">Bitte melde dich an</p>
          <Button variant="gold" onClick={() => navigate("/auth")}>
            Anmelden
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen safe-area-top pb-32">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="px-4 h-14 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Einstellungen</h1>
          </div>
        </header>

        <div className="px-4 py-6 space-y-8">
          {/* Video Preferences */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Film className="w-4 h-4 text-gold" />
              <h2 className="text-headline text-lg">Wiedergabe</h2>
            </div>

            <div className="space-y-4 p-4 rounded-2xl bg-card border border-border">
              {/* Video Quality */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Wifi className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Video-Qualität</p>
                    <p className="text-xs text-muted-foreground">
                      {videoQuality === "auto" && "Automatisch anpassen"}
                      {videoQuality === "low" && "Weniger Datenverbrauch"}
                      {videoQuality === "high" && "Beste Qualität"}
                    </p>
                  </div>
                </div>
                <Select value={videoQuality} onValueChange={(v) => handleVideoQualityChange(v as VideoQuality)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Auto
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Sparmodus
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Film className="w-4 h-4" />
                        HD
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Autoplay */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Play className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Autoplay</p>
                    <p className="text-xs text-muted-foreground">
                      Nächste Episode automatisch starten
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoplay}
                  onCheckedChange={handleAutoplayChange}
                />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-gold" />
              <h2 className="text-headline text-lg">Benachrichtigungen</h2>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border">
              <NotificationSettings />
            </div>
          </section>

          {/* Watch History */}
          <WatchHistorySection />

          {/* Account Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-gold" />
              <h2 className="text-headline text-lg">Account</h2>
            </div>

            <div className="space-y-4">
              {/* Current Email Display */}
              <div className="p-4 rounded-2xl bg-card border border-border">
                <p className="text-xs text-muted-foreground mb-1">Aktuelle E-Mail</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>

              {/* Change Email */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">E-Mail ändern</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email" className="text-xs text-muted-foreground">
                    Neue E-Mail-Adresse
                  </Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="neue@email.de"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailChange}
                  disabled={emailLoading || !newEmail}
                  className="w-full"
                >
                  {emailLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  E-Mail ändern
                </Button>
              </div>

              {/* Change Password */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Passwort ändern</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-xs text-muted-foreground">
                    Neues Passwort
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-xs text-muted-foreground">
                    Passwort bestätigen
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePasswordChange}
                  disabled={passwordLoading || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {passwordLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Passwort ändern
                </Button>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="text-headline text-lg text-red-400">Gefahrenzone</h2>
            </div>

            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400">Account löschen</p>
                  <p className="text-xs text-muted-foreground">
                    Alle Daten werden unwiderruflich gelöscht
                  </p>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Account löschen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-400">
                      Account wirklich löschen?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>
                        Diese Aktion kann nicht rückgängig gemacht werden. 
                        Alle deine Daten werden innerhalb von 14 Tagen vollständig gelöscht:
                      </p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Profil und Einstellungen</li>
                        <li>Gespeicherte Produkte</li>
                        <li>Watch History</li>
                        <li>Abo-Daten (falls vorhanden)</li>
                      </ul>
                      <div className="pt-2">
                        <Label htmlFor="delete-confirm" className="text-xs">
                          Gib <span className="font-mono font-bold">LÖSCHEN</span> ein, um zu bestätigen:
                        </Label>
                        <Input
                          id="delete-confirm"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="LÖSCHEN"
                          className="mt-2"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading || deleteConfirmText !== "LÖSCHEN"}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deleteLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Endgültig löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
