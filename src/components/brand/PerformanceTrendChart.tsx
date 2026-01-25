import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface TrendDataPoint {
  date: string;
  spend: number;
  revenue: number;
}

interface PerformanceTrendChartProps {
  data: TrendDataPoint[];
}

// Gold color from design system
const GOLD_COLOR = 'hsl(45, 93%, 58%)';
const GREEN_COLOR = 'hsl(145, 63%, 49%)';

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    
    return (
      <div className="bg-card border border-gold/20 rounded-lg p-3 shadow-lg">
        <div className="text-xs text-muted-foreground mb-2">{label}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-semibold">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <Card className="border-gold/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gold" />
            <span>Spend vs. Revenue</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Noch keine Daten verfügbar
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gold/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gold" />
          <span>Spend vs. Revenue</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 15%)" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: 'hsl(0, 0%, 60%)' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(0, 0%, 15%)' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(0, 0%, 60%)' }}
                tickFormatter={formatCurrency}
                tickLine={false}
                axisLine={{ stroke: 'hsl(0, 0%, 15%)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
                iconSize={8}
              />
              <Line 
                type="monotone" 
                dataKey="spend" 
                name="Spend"
                stroke={GOLD_COLOR}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: GOLD_COLOR }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Revenue"
                stroke={GREEN_COLOR}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: GREEN_COLOR }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
