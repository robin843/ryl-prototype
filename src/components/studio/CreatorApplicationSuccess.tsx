import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CreatorApplicationSuccess() {
  const navigate = useNavigate();

  return (
    <Card className="max-w-lg mx-auto border-gold/20">
      <CardContent className="pt-8 pb-6 text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Headline */}
        <div>
          <h2 className="text-xl font-bold mb-2">
            Bewerbung <span className="text-gold">eingereicht</span>
          </h2>
          <p className="text-muted-foreground">
            Vielen Dank für dein Interesse an der Ryl Creator Community!
          </p>
        </div>

        {/* Timeline */}
        <div className="p-4 rounded-xl bg-muted/50 space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gold" />
            <span className="font-medium">Prüfung in 1–3 Werktagen</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Du erhältst eine Benachrichtigung, sobald wir entschieden haben.
          </p>
        </div>

        {/* What happens */}
        <div className="text-left p-4 rounded-xl border border-gold/10 bg-gold/5">
          <p className="text-sm font-medium mb-2 text-gold">Was passiert jetzt?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Wir schauen uns dein Profil und deinen Content an. 
            Bei Fragen melden wir uns per E-Mail bei dir.
          </p>
        </div>

        {/* CTA */}
        <Button
          onClick={() => navigate('/feed')}
          variant="outline"
          className="w-full border-gold/20 hover:bg-gold/5"
        >
          Weiter stöbern
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
