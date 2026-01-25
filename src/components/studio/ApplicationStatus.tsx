import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { ProducerApplication } from '@/hooks/useProducerApplication';

interface ApplicationStatusProps {
  application: ProducerApplication;
  onReapply?: () => void;
}

export function ApplicationStatus({ application, onReapply }: ApplicationStatusProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      title: 'Bewerbung wird geprüft',
      description: 'Unser Team prüft deine Bewerbung. Du erhältst eine Benachrichtigung, sobald wir eine Entscheidung getroffen haben.',
    },
    approved: {
      icon: CheckCircle,
      color: 'bg-green-500/10 text-green-500 border-green-500/20',
      title: 'Bewerbung genehmigt!',
      description: 'Willkommen bei Ryl! Du kannst jetzt das Producer Studio nutzen.',
    },
    rejected: {
      icon: XCircle,
      color: 'bg-red-500/10 text-red-500 border-red-500/20',
      title: 'Bewerbung abgelehnt',
      description: application.rejection_reason || 'Deine Bewerbung konnte leider nicht genehmigt werden. Du kannst dich erneut bewerben.',
    },
  };

  const config = statusConfig[application.status];
  const StatusIcon = config.icon;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-4 rounded-full ${config.color}`}>
            <StatusIcon className="h-8 w-8" />
          </div>
        </div>
        <CardTitle className="text-2xl">{config.title}</CardTitle>
        <CardDescription className="text-base">
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="outline" className={config.color}>
              {application.status === 'pending' && 'In Prüfung'}
              {application.status === 'approved' && 'Genehmigt'}
              {application.status === 'rejected' && 'Abgelehnt'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Firmenname</span>
            <span className="text-sm font-medium">{application.company_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Eingereicht am</span>
            <span className="text-sm font-medium">
              {new Date(application.created_at).toLocaleDateString('de-DE')}
            </span>
          </div>
          {application.reviewed_at && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Geprüft am</span>
              <span className="text-sm font-medium">
                {new Date(application.reviewed_at).toLocaleDateString('de-DE')}
              </span>
            </div>
          )}
        </div>

        {/* Reapply button for rejected applications */}
        {application.status === 'rejected' && onReapply && (
          <Button 
            onClick={onReapply} 
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Erneut bewerben
          </Button>
        )}
      </CardContent>
    </Card>
  );
}