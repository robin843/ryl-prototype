import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Gift, Users, ShoppingBag, Star, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useValidateUserReferralCode } from "@/hooks/useUserReferral";

const REFERRAL_CODE_KEY = "ryl_user_referral_code";

export default function InviteReferral() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useValidateUserReferralCode(code);

  const isValid = data?.isValid ?? false;
  const referrer = data?.referrer;

  // Store referral code for later use
  useEffect(() => {
    if (isValid && code) {
      localStorage.setItem(REFERRAL_CODE_KEY, code);
    }
  }, [isValid, code]);

  const handleJoin = () => {
    navigate("/auth?intent=signup");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold mb-2">Link ungültig</h1>
          <p className="text-muted-foreground mb-6">
            Dieser Einladungslink ist leider nicht mehr gültig oder existiert nicht.
          </p>
          <Button onClick={() => navigate("/feed")} className="w-full">
            Zur App
          </Button>
        </Card>
      </div>
    );
  }

  const referrerName = referrer?.profile?.display_name || "Ein Freund";
  const referrerInitial = referrerName.charAt(0).toUpperCase();

  const benefits = [
    {
      icon: Gift,
      title: "€5 Startguthaben",
      description: "Für deinen ersten Einkauf",
    },
    {
      icon: ShoppingBag,
      title: "Shop while you watch",
      description: "Kaufe Produkte direkt aus Videos",
    },
    {
      icon: Star,
      title: "Exklusive Inhalte",
      description: "Entdecke einzigartige Creator",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gold/20 via-background to-background pt-12 pb-8 px-4">
        <div className="max-w-md mx-auto text-center">
          {/* Referrer Badge */}
          <div className="inline-flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-gold/20">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
              {referrer?.profile?.avatar_url ? (
                <img 
                  src={referrer.profile.avatar_url} 
                  alt={referrerName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                referrerInitial
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{referrerName}</p>
              <p className="text-xs text-muted-foreground">hat dich eingeladen</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-3">
            <span className="text-gold">€5 Guthaben</span>
            <br />
            für dich!
          </h1>
          <p className="text-muted-foreground mb-6">
            Registriere dich jetzt und erhalte €5 auf deinen ersten Einkauf bei Ryl.
          </p>

          <Button 
            onClick={handleJoin}
            className="w-full max-w-xs bg-gold text-gold-foreground hover:bg-gold/90"
            size="lg"
          >
            Jetzt registrieren
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Benefits */}
      <div className="px-4 py-8 max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-center">Was ist Ryl?</h2>
        <div className="space-y-3">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-medium">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="px-4 pb-12 max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-center">So funktioniert's</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center flex-shrink-0">
              1
            </div>
            <p className="text-sm">Registriere dich kostenlos</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center flex-shrink-0">
              2
            </div>
            <p className="text-sm">Entdecke Videos und Produkte</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center flex-shrink-0">
              3
            </div>
            <p className="text-sm">Dein €5 Guthaben wird automatisch angewendet</p>
          </div>
        </div>

        <Button 
          onClick={handleJoin}
          className="w-full mt-8 bg-gold text-gold-foreground hover:bg-gold/90"
          size="lg"
        >
          Los geht's!
        </Button>
      </div>
    </div>
  );
}
