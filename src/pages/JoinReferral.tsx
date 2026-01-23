import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useValidateReferralCode } from '@/hooks/useCreatorReferrals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Gift, Users, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';

const REFERRAL_CODE_KEY = 'ryl_referral_code';

export default function JoinReferral() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { referrer, loading, isValid } = useValidateReferralCode(code);

  // Store referral code in localStorage when valid
  useEffect(() => {
    if (isValid && code) {
      localStorage.setItem(REFERRAL_CODE_KEY, code);
    }
  }, [isValid, code]);

  const handleJoin = () => {
    // Navigate to auth with intent to become producer
    navigate('/auth?intent=producer');
  };

  const handleLearnMore = () => {
    navigate('/why-shopable');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Ungültiger Einladungslink</CardTitle>
            <CardDescription>
              Dieser Einladungslink ist leider nicht mehr gültig oder existiert nicht.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const referrerName = referrer?.profile?.display_name || referrer?.profile?.username || 'Ein Creator';
  const referrerInitial = referrerName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center space-y-6">
            {/* Referrer Badge */}
            <div className="inline-flex items-center gap-3 bg-card border rounded-full px-4 py-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={referrer?.profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {referrerInitial}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Eingeladen von <span className="font-medium text-foreground">{referrerName}</span>
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Werde <span className="text-primary">Ryl Creator</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Erstelle shoppable Videos und verdiene mit jedem Verkauf. 
              Dein Mentor verdient mit – und du auch, wenn du andere einlädst.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={handleJoin} className="gap-2">
                Jetzt anmelden
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={handleLearnMore}>
                Mehr erfahren
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Shoppable Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Platziere Produkte direkt in deinen Videos. Zuschauer können mit einem Tap kaufen.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Verdiene pro Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keine Views zählen – nur echte Verkäufe. Du behältst den Großteil des Umsatzes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Referral Programm</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lade andere Creator ein und verdiene 5% ihrer Umsätze – 12 Monate lang.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-muted/30 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">So funktioniert's</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold">Account erstellen</h3>
                <p className="text-sm text-muted-foreground">
                  Melde dich an und bewerbe dich als Creator.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold">Videos hochladen</h3>
                <p className="text-sm text-muted-foreground">
                  Lade deine Videos hoch und platziere shoppable Hotspots.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold">Verdienen</h3>
                <p className="text-sm text-muted-foreground">
                  Jeder Kauf über deine Videos bringt dir Einnahmen.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Button size="lg" onClick={handleJoin} className="gap-2">
              Jetzt starten
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
