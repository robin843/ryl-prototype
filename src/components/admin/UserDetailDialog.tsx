import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Mail, User, Calendar, Crown, Shield, Ban, Trash2, ShieldOff } from "lucide-react";
import { useBanUser, useUnbanUser, useDeleteUser } from "@/hooks/useAdminData";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  birthdate: string | null;
  gender: string | null;
  age_at_signup: number | null;
  created_at: string;
  onboarding_completed_at: string | null;
}

interface Subscription {
  user_id: string;
  status: string;
  user_tier: "none" | "basic" | "premium" | null;
  producer_tier: "none" | "basic" | "studio" | "enterprise" | null;
}

interface UserDetailDialogProps {
  profile: Profile | null;
  roles: string[];
  subscription: Subscription | undefined;
  email?: string;
  isBanned?: boolean;
  currentUserId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const genderLabels: Record<string, string> = {
  female: "Weiblich",
  male: "Männlich",
  diverse: "Divers",
  not_specified: "Keine Angabe",
};

const roleLabels: Record<string, string> = {
  user: "Nutzer",
  verified_producer: "Verifizierter Producer",
  brand: "Brand Partner",
  admin: "Administrator",
};

const tierLabels: Record<string, string> = {
  none: "Kein Abo",
  basic: "Basic",
  premium: "Premium",
  studio: "Studio",
  enterprise: "Enterprise",
};

export function UserDetailDialog({
  profile,
  roles,
  subscription,
  email,
  isBanned,
  currentUserId,
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const deleteUser = useDeleteUser();

  if (!profile) return null;

  const isCurrentUser = profile.user_id === currentUserId;
  const isAdmin = roles.includes("admin");

  const handleBan = async () => {
    await banUser.mutateAsync(profile.user_id);
    setShowBanDialog(false);
  };

  const handleUnban = async () => {
    await unbanUser.mutateAsync(profile.user_id);
  };

  const handleDelete = async () => {
    await deleteUser.mutateAsync(profile.user_id);
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md border-gold/20">
          <DialogHeader>
            <DialogTitle className="text-gold">Nutzerdetails</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-gold/30">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-xl bg-gold/10 text-gold">
                  {profile.display_name?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {profile.display_name || "Unbenannt"}
                  </h3>
                  {isBanned && (
                    <Badge variant="destructive" className="text-xs">
                      Gesperrt
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {profile.user_id.slice(0, 16)}...
                </p>
              </div>
            </div>

            {/* Email */}
            {email && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gold" />
                  <span className="text-muted-foreground">E-Mail:</span>
                  <a
                    href={`mailto:${email}`}
                    className="text-gold hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {email}
                  </a>
                </div>
              </>
            )}

            <Separator className="bg-gold/20" />

            {/* Demographics */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-gold" />
                <span className="text-gold">Demografische Daten</span>
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Alter bei Anmeldung</p>
                  <p className="font-medium">
                    {profile.age_at_signup !== null ? `${profile.age_at_signup} Jahre` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Geschlecht</p>
                  <p className="font-medium">
                    {profile.gender ? genderLabels[profile.gender] || profile.gender : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Geburtsdatum</p>
                  <p className="font-medium">
                    {profile.birthdate
                      ? format(new Date(profile.birthdate), "dd.MM.yyyy", { locale: de })
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-gold/20" />

            {/* Roles */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-gold" />
                <span className="text-gold">Rollen</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <Badge
                      key={role}
                      variant={role === "admin" ? "default" : "secondary"}
                      className={role === "admin" ? "bg-gold text-black" : ""}
                    >
                      {roleLabels[role] || role}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">Keine Rollen zugewiesen</span>
                )}
              </div>
            </div>

            <Separator className="bg-gold/20" />

            {/* Subscription */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Crown className="h-4 w-4 text-gold" />
                <span className="text-gold">Abonnement</span>
              </h4>
              {subscription ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant={subscription.status === "active" ? "default" : "secondary"} className={subscription.status === "active" ? "bg-gold text-black" : ""}>
                      {subscription.status === "active" ? "Aktiv" : subscription.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">User Tier</p>
                    <p className="font-medium">
                      {subscription.user_tier
                        ? tierLabels[subscription.user_tier] || subscription.user_tier
                        : "-"}
                    </p>
                  </div>
                  {subscription.producer_tier && subscription.producer_tier !== "none" && (
                    <div>
                      <p className="text-muted-foreground">Producer Tier</p>
                      <p className="font-medium">
                        {tierLabels[subscription.producer_tier] || subscription.producer_tier}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Kein Abonnement</span>
              )}
            </div>

            <Separator className="bg-gold/20" />

            {/* Timestamps */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gold" />
                <span className="text-gold">Zeitstempel</span>
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Registriert</p>
                  <p className="font-medium">
                    {format(new Date(profile.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Onboarding</p>
                  <p className="font-medium">
                    {profile.onboarding_completed_at
                      ? format(new Date(profile.onboarding_completed_at), "dd.MM.yyyy", {
                          locale: de,
                        })
                      : "Nicht abgeschlossen"}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            {!isCurrentUser && (
              <>
                <Separator className="bg-gold/20" />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-destructive">Admin-Aktionen</h4>
                  <div className="flex gap-2">
                    {isBanned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUnban}
                        disabled={unbanUser.isPending}
                        className="border-gold/20 hover:bg-gold/10"
                      >
                        <ShieldOff className="h-4 w-4 mr-2" />
                        {unbanUser.isPending ? "..." : "Entsperren"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBanDialog(true)}
                        disabled={isAdmin}
                        title={isAdmin ? "Admins können nicht gesperrt werden" : undefined}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Sperren
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isAdmin}
                      title={isAdmin ? "Admins können nicht gelöscht werden" : undefined}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </Button>
                  </div>
                  {isAdmin && (
                    <p className="text-xs text-muted-foreground">
                      Admins können nicht gesperrt oder gelöscht werden.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent className="border-gold/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Nutzer sperren?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Nutzer <strong className="text-gold">{profile.display_name || email || "Unbenannt"}</strong> wird gesperrt und kann sich nicht mehr anmelden.
              Diese Aktion kann jederzeit rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              disabled={banUser.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {banUser.isPending ? "Wird gesperrt..." : "Sperren"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-gold/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Nutzer unwiderruflich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Nutzer <strong className="text-gold">{profile.display_name || email || "Unbenannt"}</strong> und alle zugehörigen Daten werden unwiderruflich gelöscht.
              Diese Aktion kann nicht rückgängig gemacht werden!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteUser.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUser.isPending ? "Wird gelöscht..." : "Endgültig löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
