import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  Star,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BrandGenreData, GenrePerformance } from '@/hooks/useBrandGenrePerformance';

interface BrandSafetyTabProps {
  data: BrandGenreData;
}

const genreEmojis: Record<string, string> = {
  'Drama': '🎭',
  'High School Drama': '🎓',
  'Romantik': '💕',
  'Comedy': '😂',
  'Krimi': '🔍',
  'Horror': '👻',
  'Thriller': '🔫',
  'Lifestyle': '✨',
  'Beauty': '💄',
  'Fashion': '👗',
  'Fitness': '💪',
  'Cooking': '🍳',
  'Travel': '✈️',
  'Sonstige': '📺',
};

const genreSentiments: Record<string, { label: string; color: string }> = {
  'Drama': { label: 'Emotional Engagement', color: 'text-blue-400' },
  'High School Drama': { label: 'Hohe Identifikation', color: 'text-purple-400' },
  'Romantik': { label: 'Positiv / Aspirational', color: 'text-pink-400' },
  'Comedy': { label: 'Feel-Good / Shareable', color: 'text-yellow-400' },
  'Krimi': { label: 'Spannung / Aufmerksamkeit', color: 'text-orange-400' },
  'Horror': { label: 'Intensiv / Polarisierend', color: 'text-red-400' },
  'Lifestyle': { label: 'Aspirational / Trust', color: 'text-emerald-400' },
  'Beauty': { label: 'Produktnah / Conversion-stark', color: 'text-pink-400' },
  'Fashion': { label: 'Visual / Trendsetter', color: 'text-violet-400' },
};

export function BrandSafetyTab({ data }: BrandSafetyTabProps) {
  const { genres, bestGenre, worstGenre, recommendation } = data;

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cents / 100);

  const formatNumber = (n: number) => new Intl.NumberFormat('de-DE').format(n);

  const maxConvRate = genres.length > 0 ? Math.max(...genres.map(g => g.conversionRate), 0.1) : 1;

  if (genres.length === 0) {
    return (
      <Card className="border-gold/20">
        <CardContent className="py-12 text-center">
          <Shield className="h-10 w-10 text-gold/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            Noch keine Genre-Daten verfügbar. Sobald deine Produkte in verschiedenen Serien platziert werden,
            siehst du hier, welche Genres am besten konvertieren.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recommendation Banner */}
      {recommendation && (
        <Card className="border-gold/30 bg-gradient-to-r from-gold/10 to-gold/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gold mb-1">Empfehlung</p>
              <p className="text-xs text-foreground/80">{recommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Genre Performance Grid */}
      <Card className="border-gold/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-gold" />
            Genre-Performance & Brand Fit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {genres.map((genre, index) => {
              const isBest = genre.genre === bestGenre;
              const isWorst = genre.genre === worstGenre && genres.length > 1;
              const emoji = genreEmojis[genre.genre] || '📺';
              const sentiment = genreSentiments[genre.genre];
              const barWidth = (genre.conversionRate / maxConvRate) * 100;

              return (
                <div
                  key={genre.genre}
                  className={cn(
                    'p-3 rounded-lg border transition-colors',
                    isBest
                      ? 'border-green-500/30 bg-green-500/5'
                      : isWorst
                      ? 'border-red-500/20 bg-red-500/5'
                      : 'border-border/30 bg-muted/10'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{genre.genre}</span>
                          {isBest && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-1.5">
                              <Star className="h-2.5 w-2.5 mr-0.5" />
                              Top
                            </Badge>
                          )}
                          {isWorst && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1.5">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                              Niedrig
                            </Badge>
                          )}
                        </div>
                        {sentiment && (
                          <p className={cn('text-[10px]', sentiment.color)}>
                            {sentiment.label}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-500">{formatCurrency(genre.revenue)}</div>
                      <div className="text-[10px] text-muted-foreground">{formatNumber(genre.conversions)} Sales</div>
                    </div>
                  </div>

                  {/* Conversion bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Conversion Rate</span>
                      <span className="font-medium">{genre.conversionRate.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          isBest ? 'bg-green-500' : isWorst ? 'bg-red-500/60' : 'bg-gold/60'
                        )}
                        style={{ width: `${Math.max(3, barWidth)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics row */}
                  <div className="flex gap-4 text-[10px] text-muted-foreground">
                    <span>{formatNumber(genre.impressions)} Impressionen</span>
                    <span>{formatNumber(genre.clicks)} Klicks</span>
                    <span>{genre.ctr.toFixed(1)}% CTR</span>
                    <span>Ø {formatCurrency(genre.avgOrderValue)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Brand Safety Score */}
      <Card className="border-gold/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            Brand Safety Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-green-500/30 flex items-center justify-center bg-green-500/10">
              <span className="text-xl font-bold text-green-500">A+</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Hohe Brand Safety</p>
              <p className="text-xs text-muted-foreground mt-1">
                Alle Creator-Inhalte werden vor Veröffentlichung geprüft. 
                Deine Produkte erscheinen nur in kuratierten Serien mit positiver Brand-Affinität.
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-500">✓ Kuratiert</Badge>
                <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-500">✓ Serie-only</Badge>
                <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-500">✓ Creator-geprüft</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
