import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Mail } from "lucide-react";
import { User, Calendar, Crown, Shield } from "lucide-react";

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
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nutzerdetails</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-xl">
                {profile.display_name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">
                {profile.display_name || "Unbenannt"}
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                {profile.user_id.slice(0, 16)}...
              </p>
            </div>
          </div>

          {/* Email */}
          {email && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">E-Mail:</span>
                <a
                  href={`mailto:${email}`}
                  className="text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {email}
                </a>
              </div>
            </>
          )}

          <Separator />

          {/* Demographics */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Demografische Daten
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

          <Separator />

          {/* Roles */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Rollen
            </h4>
            <div className="flex flex-wrap gap-2">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <Badge
                    key={role}
                    variant={role === "admin" ? "default" : "secondary"}
                  >
                    {roleLabels[role] || role}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">Keine Rollen zugewiesen</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Subscription */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Abonnement
            </h4>
            {subscription ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
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

          <Separator />

          {/* Timestamps */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Zeitstempel
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
