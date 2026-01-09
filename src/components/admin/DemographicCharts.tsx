import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Users, UserCheck, TrendingUp } from "lucide-react";

interface AgeGroup {
  label: string;
  count: number;
  percentage: number;
}

interface GenderDistribution {
  gender: string;
  label: string;
  count: number;
  percentage: number;
}

interface RegistrationTimeline {
  date: string;
  count: number;
}

interface DemographicChartsProps {
  ageGroups: AgeGroup[];
  genderDistribution: GenderDistribution[];
  registrationTimeline: RegistrationTimeline[];
  totalWithAge: number;
  totalWithGender: number;
  totalUsers: number;
}

const GENDER_COLORS: Record<string, string> = {
  female: "hsl(330, 70%, 60%)",
  male: "hsl(210, 70%, 60%)",
  diverse: "hsl(270, 70%, 60%)",
  not_specified: "hsl(0, 0%, 60%)",
};

export function DemographicCharts({
  ageGroups,
  genderDistribution,
  registrationTimeline,
  totalWithAge,
  totalWithGender,
  totalUsers,
}: DemographicChartsProps) {
  const ageDataPercentage = Math.round((totalWithAge / totalUsers) * 100) || 0;
  const genderDataPercentage = Math.round((totalWithGender / totalUsers) * 100) || 0;

  return (
    <div className="space-y-6">
      {/* Data Coverage Info */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Alter erfasst</p>
                <p className="text-lg font-semibold">
                  {totalWithAge} / {totalUsers} ({ageDataPercentage}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Geschlecht erfasst</p>
                <p className="text-lg font-semibold">
                  {totalWithGender} / {totalUsers} ({genderDataPercentage}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Altersverteilung
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalWithAge === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Keine Altersdaten vorhanden
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ageGroups}>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number, name: string) => [
                      `${value} Nutzer`,
                      "Anzahl",
                    ]}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Geschlechterverteilung
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalWithGender === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Keine Geschlechterdaten vorhanden
              </div>
            ) : (
              <div className="flex items-center">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={genderDistribution.filter((g) => g.count > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {genderDistribution
                        .filter((g) => g.count > 0)
                        .map((entry) => (
                          <Cell
                            key={entry.gender}
                            fill={GENDER_COLORS[entry.gender] || "hsl(var(--muted))"}
                          />
                        ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value} Nutzer`, "Anzahl"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {genderDistribution.map((item) => (
                    <div key={item.gender} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            GENDER_COLORS[item.gender] || "hsl(var(--muted))",
                        }}
                      />
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium ml-auto">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registration Timeline */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Registrierungen (letzte 30 Tage)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registrationTimeline.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Keine Registrierungen in den letzten 30 Tagen
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={registrationTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}.${date.getMonth() + 1}`;
                  }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [`${value} Registrierungen`, ""]}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString("de-DE");
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
