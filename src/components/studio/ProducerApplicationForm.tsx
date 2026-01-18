import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ProducerApplicationFormProps {
  onSubmit: (data: {
    company_name: string;
    description: string;
    portfolio_url?: string;
  }) => Promise<void>;
}

export function ProducerApplicationForm({ onSubmit }: ProducerApplicationFormProps) {
  const navigate = useNavigate();
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
    <Card className="max-w-2xl mx-auto border-gold/20">
      <CardHeader>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-fit mb-2 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <CardTitle className="text-2xl text-center">
            Werde <span className="text-gold">Ryl Producer</span>
          </CardTitle>
          <Sparkles className="h-5 w-5 text-gold" />
        </div>
        <CardDescription className="text-center">
          Erstelle <span className="text-gold">Shopable-Videos</span> und verdiene mit deinem Content. Bewirb dich jetzt als verifizierter Producer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company_name" className="flex items-center gap-1">
              <span className="text-gold">•</span> Firmenname / Creator-Name <span className="text-gold">*</span>
            </Label>
            <Input
              id="company_name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Dein Unternehmen oder dein Creator-Name"
              className="border-gold/20 focus:border-gold focus:ring-gold/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              <span className="text-gold">•</span> Was möchtest du produzieren? <span className="text-gold">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibe deine Content-Ideen, Nische und warum du ein guter Ryl Producer wärst..."
              rows={4}
              className="border-gold/20 focus:border-gold focus:ring-gold/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio_url" className="flex items-center gap-1">
              <span className="text-gold">•</span> Portfolio / Social Media Link <span className="text-gold">*</span>
            </Label>
            <Input
              id="portfolio_url"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://instagram.com/deinprofil"
              className="border-gold/20 focus:border-gold focus:ring-gold/20"
              required
            />
          </div>

          <div className="flex items-start space-x-2 p-3 rounded-lg bg-gold/5 border border-gold/20">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
              className="data-[state=checked]:bg-gold data-[state=checked]:border-gold mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
              Ich akzeptiere die{' '}
              <Link to="/producer-terms" className="text-gold hover:underline" target="_blank">
                Nutzungsbedingungen für Ryl Producer
              </Link>{' '}
              und bestätige, dass ich berechtigt bin, Produkte zu bewerben.
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gold hover:bg-gold/90 text-black font-semibold" 
            disabled={isSubmitting}
          >
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
