import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProducerApplication } from '@/hooks/useProducerApplication';
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface ApplicationStatusProps {
  application: ProducerApplication;
  onReapply?: () => void;
}

export function ApplicationStatus({ application, onReapply }: ApplicationStatusProps) {
  const navigate = useNavigate();
  
  const submittedDate = new Date(application.created_at);
  const expectedDate = addDays(submittedDate, 3);
  
  if (application.status === 'pending') {
    return (
      <Card className="max-w-lg mx-auto border-gold/20">
        <CardContent className="pt-8 pb-6 space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">
              Bewerbung wird <span className="text-gold">geprüft</span>
            </h2>
            <p className="text-muted-foreground text-sm">
              Eingereicht am {format(submittedDate, 'dd. MMMM yyyy', { locale: de })}
            </p>
          </div>

          {/* Timeline */}
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-sm">
              Voraussichtlich bis <span className="font-semibold text-gold">{format(expectedDate, 'dd. MMMM', { locale: de })}</span>
            </p>
          </div>

          {/* What's happening */}
          <div className="p-4 rounded-xl border border-gold/10 bg-gold/5">
            <p className="text-sm font-medium mb-2 text-gold">Was passiert gerade?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Wir schauen uns dein Profil und deinen Content an. 
              Du erhältst eine Benachrichtigung, sobald wir entschieden haben.
            </p>
          </div>

          {/* Continue browsing */}
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

  if (application.status === 'rejected') {
    return (
      <Card className="max-w-lg mx-auto border-destructive/20">
        <CardContent className="pt-8 pb-6 space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">
              Bewerbung nicht erfolgreich
            </h2>
            <p className="text-muted-foreground text-sm">
              Leider können wir deine Bewerbung diesmal nicht annehmen.
            </p>
          </div>

          {/* Reason if provided */}
          {application.rejection_reason && (
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <p className="text-sm font-medium mb-1">Begründung:</p>
              <p className="text-sm text-muted-foreground">
                {application.rejection_reason}
              </p>
            </div>
          )}

          {/* Encouragement */}
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">
              Du kannst dich jederzeit erneut bewerben, wenn sich dein Profil weiterentwickelt hat.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={onReapply}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              Erneut bewerben
            </Button>
            <Button
              onClick={() => navigate('/feed')}
              variant="ghost"
              className="w-full"
            >
              Weiter stöbern
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Approved state (shouldn't normally show this component if approved)
  return (
    <Card className="max-w-lg mx-auto border-primary/20">
      <CardContent className="pt-8 pb-6 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">
            Willkommen im <span className="text-gold">Creator Studio</span>!
          </h2>
          <p className="text-muted-foreground">
            Du bist jetzt ein verifizierter Ryl Creator.
          </p>
        </div>
        <Button
          onClick={() => navigate('/studio')}
          className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
        >
          Zum Creator Studio
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}