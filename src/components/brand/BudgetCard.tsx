import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BudgetCardProps {
  budgetCents: number;
  spentCents: number;
  revenueCents: number;
  commissionRate: number;
  onAddBudget?: () => void;
}

export function BudgetCard({ 
  budgetCents, 
  spentCents, 
  revenueCents,
  commissionRate,
  onAddBudget 
}: BudgetCardProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const remainingBudget = budgetCents - spentCents;
  const usagePercent = budgetCents > 0 ? (spentCents / budgetCents) * 100 : 0;
  const roas = spentCents > 0 ? revenueCents / spentCents : 0;
  const netProfit = revenueCents - spentCents;

  // Determine status color based on remaining budget
  const getStatusColor = () => {
    if (remainingBudget <= 0) return 'text-red-500';
    if (usagePercent > 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Card className="border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-gold">
            <Wallet className="h-4 w-4" />
            Budget
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 text-xs border-gold/30 hover:bg-gold/10 hover:text-gold"
            onClick={onAddBudget}
          >
            <Plus className="h-3 w-3 mr-1" />
            Hinzufügen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Budget */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-muted-foreground">Verfügbar</span>
            <span className={cn("text-2xl font-bold", getStatusColor())}>
              {formatCurrency(remainingBudget)}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                usagePercent > 80 ? "bg-yellow-500" : "bg-gold"
              )}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>{formatCurrency(spentCents)} investiert</span>
            <span>{formatCurrency(budgetCents)} gesamt</span>
          </div>
        </div>

        {/* Revenue Attribution */}
        <div className="pt-3 border-t border-gold/10 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Umsatz generiert</span>
            <span className="font-semibold text-green-500">
              {formatCurrency(revenueCents)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>Plattform-Anteil ({commissionRate}%)</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px]">
                    <p className="text-xs">
                      Du zahlst nur {commissionRate}% auf generierten Umsatz. 
                      Keine Kosten für Views, Clicks oder Content.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-medium">
              {formatCurrency(spentCents)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t border-dashed border-gold/10">
            <span className="text-muted-foreground">Netto-Gewinn</span>
            <span className={cn(
              "font-bold",
              netProfit >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {formatCurrency(netProfit)}
            </span>
          </div>
        </div>

        {/* ROAS indicator */}
        {spentCents > 0 && (
          <div className={cn(
            "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium",
            roas >= 3 ? "bg-green-500/10 text-green-500" :
            roas >= 1 ? "bg-yellow-500/10 text-yellow-500" :
            "bg-red-500/10 text-red-500"
          )}>
            <TrendingUp className="h-4 w-4" />
            <span>ROAS: {roas.toFixed(2)}x</span>
            {roas >= 3 && <span className="text-xs">(Exzellent)</span>}
            {roas >= 1 && roas < 3 && <span className="text-xs">(Profitabel)</span>}
            {roas < 1 && <span className="text-xs">(Optimieren)</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
