import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  birthdate: string | null;
  gender: string | null;
  age_at_signup: number | null;
  created_at: string;
  onboarding_completed_at: string | null;
}

interface UserRole {
  user_id: string;
  role: "user" | "verified_producer" | "brand" | "admin";
}

interface Subscription {
  user_id: string;
  status: string;
  user_tier: "none" | "basic" | "premium" | null;
  producer_tier: "none" | "basic" | "studio" | "enterprise" | null;
}

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

interface DemographicStats {
  ageGroups: AgeGroup[];
  genderDistribution: GenderDistribution[];
  registrationTimeline: RegistrationTimeline[];
  totalWithAge: number;
  totalWithGender: number;
}

interface AdminStats {
  totalUsers: number;
  newUsersLast7Days: number;
  activeSubscriptions: number;
  completedOnboarding: number;
}

export function useAdminProfiles() {
  return useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useAdminUserRoles() {
  return useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (error) throw error;
      return data as UserRole[];
    },
  });
}

export function useAdminSubscriptions() {
  return useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("user_id, status, user_tier, producer_tier");

      if (error) throw error;
      return data as Subscription[];
    },
  });
}

export function useAdminStats(profiles: Profile[] | undefined) {
  const stats: AdminStats = {
    totalUsers: 0,
    newUsersLast7Days: 0,
    activeSubscriptions: 0,
    completedOnboarding: 0,
  };

  if (!profiles) return stats;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  stats.totalUsers = profiles.length;
  stats.newUsersLast7Days = profiles.filter(
    (p) => new Date(p.created_at) >= sevenDaysAgo
  ).length;
  stats.completedOnboarding = profiles.filter(
    (p) => p.onboarding_completed_at !== null
  ).length;

  return stats;
}

export function useDemographicStats(profiles: Profile[] | undefined): DemographicStats {
  const defaultStats: DemographicStats = {
    ageGroups: [],
    genderDistribution: [],
    registrationTimeline: [],
    totalWithAge: 0,
    totalWithGender: 0,
  };

  if (!profiles) return defaultStats;

  // Age groups
  const ageGroups: Record<string, number> = {
    "13-17": 0,
    "18-24": 0,
    "25-34": 0,
    "35-44": 0,
    "45-54": 0,
    "55+": 0,
  };

  let totalWithAge = 0;
  profiles.forEach((p) => {
    if (p.age_at_signup !== null) {
      totalWithAge++;
      const age = p.age_at_signup;
      if (age >= 13 && age <= 17) ageGroups["13-17"]++;
      else if (age >= 18 && age <= 24) ageGroups["18-24"]++;
      else if (age >= 25 && age <= 34) ageGroups["25-34"]++;
      else if (age >= 35 && age <= 44) ageGroups["35-44"]++;
      else if (age >= 45 && age <= 54) ageGroups["45-54"]++;
      else if (age >= 55) ageGroups["55+"]++;
    }
  });

  const ageGroupsArray: AgeGroup[] = Object.entries(ageGroups).map(([label, count]) => ({
    label,
    count,
    percentage: totalWithAge > 0 ? Math.round((count / totalWithAge) * 100) : 0,
  }));

  // Gender distribution
  const genderCounts: Record<string, number> = {
    female: 0,
    male: 0,
    diverse: 0,
    not_specified: 0,
  };

  const genderLabels: Record<string, string> = {
    female: "Weiblich",
    male: "Männlich",
    diverse: "Divers",
    not_specified: "Keine Angabe",
  };

  let totalWithGender = 0;
  profiles.forEach((p) => {
    if (p.gender) {
      totalWithGender++;
      if (genderCounts[p.gender] !== undefined) {
        genderCounts[p.gender]++;
      }
    }
  });

  const genderDistribution: GenderDistribution[] = Object.entries(genderCounts).map(
    ([gender, count]) => ({
      gender,
      label: genderLabels[gender] || gender,
      count,
      percentage: totalWithGender > 0 ? Math.round((count / totalWithGender) * 100) : 0,
    })
  );

  // Registration timeline (last 30 days)
  const registrationMap: Record<string, number> = {};
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  profiles.forEach((p) => {
    const date = new Date(p.created_at);
    if (date >= thirtyDaysAgo) {
      const dateStr = date.toISOString().split("T")[0];
      registrationMap[dateStr] = (registrationMap[dateStr] || 0) + 1;
    }
  });

  const registrationTimeline: RegistrationTimeline[] = Object.entries(registrationMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return {
    ageGroups: ageGroupsArray,
    genderDistribution,
    registrationTimeline,
    totalWithAge,
    totalWithGender,
  };
}

export function getUserRolesMap(roles: UserRole[] | undefined): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (!roles) return map;

  roles.forEach((r) => {
    const existing = map.get(r.user_id) || [];
    existing.push(r.role);
    map.set(r.user_id, existing);
  });

  return map;
}

export function getSubscriptionsMap(
  subscriptions: Subscription[] | undefined
): Map<string, Subscription> {
  const map = new Map<string, Subscription>();
  if (!subscriptions) return map;

  subscriptions.forEach((s) => {
    map.set(s.user_id, s);
  });

  return map;
}
