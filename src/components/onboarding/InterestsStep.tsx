import { useState } from 'react';
import { Theater, Laugh, Video, Shirt, Sparkles, Heart, ChefHat, Dumbbell, Smartphone, Music, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface InterestCategory {
  id: string;
  name: string;
  name_de: string;
  icon: string;
  sort_order: number;
}

interface InterestsStepProps {
  categories: InterestCategory[];
  selectedInterests: string[];
  onSave: (categoryIds: string[]) => Promise<void>;
  onNext: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Theater,
  Laugh,
  Video,
  Shirt,
  Sparkles,
  Heart,
  ChefHat,
  Dumbbell,
  Smartphone,
  Music,
};

export function InterestsStep({ categories, selectedInterests, onSave, onNext }: InterestsStepProps) {
  const [selected, setSelected] = useState<string[]>(selectedInterests);
  const [isSaving, setIsSaving] = useState(false);

  const toggleInterest = (categoryId: string) => {
    setSelected(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleContinue = async () => {
    if (selected.length < 3) return;
    
    setIsSaving(true);
    await onSave(selected);
    setIsSaving(false);
    onNext();
  };

  return (
    <div className="flex flex-col h-full px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-headline text-2xl mb-3">Was interessiert dich?</h1>
        <p className="text-body text-muted-foreground">
          Wähle mindestens 3 Kategorien, die dich interessieren.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {categories.map(category => {
            const IconComponent = iconMap[category.icon] || Sparkles;
            const isSelected = selected.includes(category.id);

            return (
              <button
                key={category.id}
                onClick={() => toggleInterest(category.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl",
                  "border-2 transition-all duration-200",
                  isSelected 
                    ? "bg-gold/10 border-gold" 
                    : "bg-card border-border hover:border-muted-foreground/50"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <IconComponent className={cn(
                  "w-8 h-8 transition-colors",
                  isSelected ? "text-gold" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}>
                  {category.name_de}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 space-y-3">
        <Button 
          onClick={handleContinue}
          disabled={selected.length < 3 || isSaving}
          className="w-full h-14 rounded-full bg-gold hover:bg-gold/90 text-primary-foreground font-medium"
        >
          {isSaving ? 'Speichern...' : `Weiter (${selected.length}/3 ausgewählt)`}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Du kannst das später in den Einstellungen ändern.
        </p>
      </div>
    </div>
  );
}
