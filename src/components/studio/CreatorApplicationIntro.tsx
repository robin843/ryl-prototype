import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Users, TrendingUp, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreatorApplicationIntroProps {
  onContinue: () => void;
}

export function CreatorApplicationIntro({ onContinue }: CreatorApplicationIntroProps) {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: ShoppingBag,
      title: 'Shopable Videos',
      description: 'Verlinke Produkte direkt in deinen Videos',
    },
    {
      icon: TrendingUp,
      title: 'Verdiene mit',
      description: 'Provision für jeden Verkauf über deine Inhalte',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Werde Teil einer kuratierten Creator-Community',
    },
  ];

  return (
    <Card className="max-w-lg mx-auto border-gold/20">
      <CardHeader className="text-center pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-fit mb-4 -ml-2 self-start"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="h-6 w-6 text-gold" />
        </div>
        
        <CardTitle className="text-2xl">
          Werde Teil der <span className="text-gold">Ryl Creator Community</span>
        </CardTitle>
        
        <CardDescription className="text-base mt-3">
          Du erstellst Content, der inspiriert? Bewirb dich als Ryl Creator 
          und verdiene mit deinen Videos. Wir prüfen jede Bewerbung persönlich — 
          für eine Community, die zusammenpasst.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Benefits */}
        <div className="space-y-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-start gap-3 p-3 rounded-xl bg-gold/5 border border-gold/10"
            >
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                <benefit.icon className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="font-medium text-sm">{benefit.title}</p>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Curated Badge */}
        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-muted/50">
          <Badge variant="outline" className="border-gold/30 text-gold bg-gold/5">
            Curated Community
          </Badge>
          <span className="text-xs text-muted-foreground">
            Wir wählen Creator sorgfältig aus
          </span>
        </div>

        {/* CTA */}
        <Button
          onClick={onContinue}
          className="w-full bg-gold hover:bg-gold/90 text-black font-semibold h-12"
        >
          Jetzt bewerben
        </Button>
      </CardContent>
    </Card>
  );
}
