import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'other', label: 'Andere', icon: '🌐' },
];

const CATEGORIES = [
  { id: 'fashion', label: 'Fashion', icon: '👗' },
  { id: 'beauty', label: 'Beauty', icon: '💄' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '✨' },
  { id: 'food', label: 'Food', icon: '🍳' },
  { id: 'tech', label: 'Tech', icon: '📱' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
];

interface CreatorApplicationFormProps {
  onSubmit: (data: {
    company_name: string;
    description: string;
    portfolio_url?: string;
    primary_platform?: string;
    content_categories?: string[];
  }) => Promise<void>;
  onBack: () => void;
}

export function CreatorApplicationForm({ onSubmit, onBack }: CreatorApplicationFormProps) {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [profileUrl, setProfileUrl] = useState('');
  const [note, setNote] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((c) => c !== categoryId);
      }
      if (prev.length >= 2) {
        toast.error('Maximal 2 Kategorien auswählen');
        return prev;
      }
      return [...prev, categoryId];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast.error('Bitte akzeptiere die Nutzungsbedingungen');
      return;
    }

    if (!selectedPlatform) {
      toast.error('Bitte wähle deine Haupt-Plattform');
      return;
    }

    if (!profileUrl.trim()) {
      toast.error('Bitte gib deinen Profil-Link an');
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('Bitte wähle mindestens eine Kategorie');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use platform as company_name for simpler form, note as description
      const platformLabel = PLATFORMS.find(p => p.id === selectedPlatform)?.label || selectedPlatform;
      
      await onSubmit({
        company_name: `${platformLabel} Creator`,
        description: note.trim() || 'Keine zusätzlichen Infos',
        portfolio_url: profileUrl.trim(),
        primary_platform: selectedPlatform,
        content_categories: selectedCategories,
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
    <Card className="max-w-lg mx-auto border-gold/20">
      <CardHeader className="pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-fit mb-2 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <CardTitle className="text-xl">
          Creator <span className="text-gold">Bewerbung</span>
        </CardTitle>
        <CardDescription>
          Erzähl uns kurz von dir. Dauert nur 1 Minute.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-1">
              <span className="text-gold">1.</span> Deine Haupt-Plattform
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border transition-all text-left',
                    selectedPlatform === platform.id
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-border hover:border-gold/30'
                  )}
                >
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-sm font-medium">{platform.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profile URL */}
          <div className="space-y-2">
            <Label htmlFor="profile_url" className="flex items-center gap-1">
              <span className="text-gold">2.</span> Dein Profil-Link
            </Label>
            <Input
              id="profile_url"
              type="url"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://instagram.com/deinprofil"
              className="border-gold/20 focus:border-gold focus:ring-gold/20"
            />
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label className="flex items-center gap-1">
              <span className="text-gold">3.</span> Content-Kategorien <span className="text-muted-foreground text-xs">(max. 2)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm transition-all',
                    selectedCategories.includes(category.id)
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-border hover:border-gold/30'
                  )}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="flex items-center gap-1">
              <span className="text-gold">4.</span> Kurze Notiz <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 280))}
              placeholder="Warum möchtest du bei Ryl dabei sein?"
              rows={2}
              className="border-gold/20 focus:border-gold focus:ring-gold/20 resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {note.length}/280
            </p>
          </div>

          {/* Terms */}
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
                Nutzungsbedingungen für Ryl Creator
              </Link>
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gold hover:bg-gold/90 text-black font-semibold h-12" 
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
