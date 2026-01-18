import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, Crown, CheckCircle } from "lucide-react";

interface UserStatsCardsProps {
  totalUsers: number;
  newUsersLast7Days: number;
  activeSubscriptions: number;
  completedOnboarding: number;
}

export function UserStatsCards({
  totalUsers,
  newUsersLast7Days,
  activeSubscriptions,
  completedOnboarding,
}: UserStatsCardsProps) {
  const stats = [
    {
      label: "Gesamtnutzer",
      value: totalUsers,
      icon: Users,
      color: "text-gold",
    },
    {
      label: "Neue Nutzer (7 Tage)",
      value: newUsersLast7Days,
      icon: UserPlus,
      color: "text-green-500",
    },
    {
      label: "Aktive Abos",
      value: activeSubscriptions,
      icon: Crown,
      color: "text-gold",
    },
    {
      label: "Onboarding abgeschlossen",
      value: completedOnboarding,
      icon: CheckCircle,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card/50 border-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gold/10 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
