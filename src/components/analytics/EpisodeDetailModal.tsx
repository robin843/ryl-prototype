import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Eye, ShoppingBag, DollarSign } from "lucide-react";

interface EpisodeStat {
  id: string;
  title: string;
  views: number;
  hotspotClicks: number;
  revenue: number;
  ctr: number;
}

interface EpisodeDetailModalProps {
  episode: EpisodeStat | null;
  timeRange: '7d' | '30d' | 'all';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EpisodeDetailModal({ episode, timeRange, open, onOpenChange }: EpisodeDetailModalProps) {
  if (!episode) return null;

  // Generate time series data based on selected timeRange
  // Since we only have aggregated data, we show the total as a single point or distribute evenly
  const generateChartData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const now = new Date();
    
    // If we only have aggregated totals, show as cumulative trend
    // For demo purposes, we'll show the data as a single aggregation point at "today"
    // In production, this would come from daily-aggregated backend data
    const data = [];
    
    // Create a simple visualization showing the total at the end
    // This represents "current state" since we don't have daily granularity
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Show zeros for past days and actual values for "today" (last point)
      // This creates a step-up visualization showing current totals
      const isLastDay = i === 0;
      
      data.push({
        date: date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        fullDate: date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        views: isLastDay ? episode.views : 0,
        purchases: isLastDay ? Math.round(episode.views * (episode.ctr === 100 ? 0 : episode.ctr / 100)) : 0,
        revenue: isLastDay ? episode.revenue / 100 : 0,
      });
    }
    
    return data;
  };

  const chartData = generateChartData();
  const hasData = episode.views > 0 || episode.revenue > 0;
  const hasSinglePoint = chartData.filter(d => d.views > 0 || d.revenue > 0).length <= 1;

  const formatCurrency = (value: number) => 
    value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{payload[0]?.payload?.fullDate}</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span>Views: {payload[0]?.value?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Käufe: {payload[1]?.value?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span>Umsatz: {formatCurrency(payload[2]?.value || 0)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">{episode.title}</DialogTitle>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Views</span>
            </div>
            <p className="text-lg font-semibold">{episode.views.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Hotspot-Klicks</span>
            </div>
            <p className="text-lg font-semibold">{episode.hotspotClicks.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs text-muted-foreground">Umsatz</span>
            </div>
            <p className="text-lg font-semibold">{formatCurrency(episode.revenue / 100)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          {!hasData ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>Noch keine Daten für diese Episode</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}€`}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      views: 'Views',
                      purchases: 'Käufe',
                      revenue: 'Umsatz (€)',
                    };
                    return labels[value] || value;
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  dot={hasSinglePoint}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="purchases" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={hasSinglePoint}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--gold))" 
                  strokeWidth={2}
                  dot={hasSinglePoint}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Zeitraum: {timeRange === '7d' ? 'Letzte 7 Tage' : timeRange === '30d' ? 'Letzte 30 Tage' : 'Gesamt'}
        </p>
      </DialogContent>
    </Dialog>
  );
}
