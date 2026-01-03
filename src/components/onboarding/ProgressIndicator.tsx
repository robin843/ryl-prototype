import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i === currentStep 
              ? "w-8 bg-gold" 
              : i < currentStep 
                ? "w-2 bg-gold/60" 
                : "w-2 bg-muted"
          )}
        />
      ))}
    </div>
  );
}
