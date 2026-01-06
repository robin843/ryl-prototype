import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ProducerApplicationFormProps {
  onSubmit: (data: {
    company_name: string;
    description: string;
    portfolio_url?: string;
  }) => Promise<void>;
}

export function ProducerApplicationForm({ onSubmit }: ProducerApplicationFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast.error('Bitte akzeptiere die Nutzungsbedingungen');
      return;
    }

    if (!companyName.trim() || !description.trim()) {
      toast.error('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        company_name: companyName.trim(),
        description: description.trim(),
        portfolio_url: portfolioUrl.trim() || undefined,
      });
      toast.success('Bewerbung erfolgreich eingereicht!');
    } catch (err) {
      console.error('Error submitting application:', err);
      toast.error('Fehler beim Einreichen der Bewerbung');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Werde Ryl Producer</CardTitle>
        <CardDescription>
          Erstelle Shopable-Videos und verdiene mit deinem Content. Bewirb dich jetzt als verifizierter Producer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company_name">Firmenname / Creator-Name *</Label>
            <Input
              id="company_name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Dein Unternehmen oder dein Creator-Name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Was möchtest du produzieren? *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibe deine Content-Ideen, Nische und warum du ein guter Ryl Producer wärst..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio_url">Portfolio / Social Media Link *</Label>
            <Input
              id="portfolio_url"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://instagram.com/deinprofil"
              required
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
              Ich akzeptiere die{' '}
              <Link to="/producer-terms" className="text-primary hover:underline" target="_blank">
                Nutzungsbedingungen für Ryl Producer
              </Link>{' '}
              und bestätige, dass ich berechtigt bin, Produkte zu bewerben.
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird eingereicht...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Bewerbung einreichen
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
