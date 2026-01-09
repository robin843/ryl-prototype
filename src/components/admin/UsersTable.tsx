import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { UserDetailDialog } from "./UserDetailDialog";

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

interface Subscription {
  user_id: string;
  status: string;
  user_tier: "none" | "basic" | "premium" | null;
  producer_tier: "none" | "basic" | "studio" | "enterprise" | null;
}

interface UsersTableProps {
  profiles: Profile[];
  rolesMap: Map<string, string[]>;
  subscriptionsMap: Map<string, Subscription>;
}

const ITEMS_PER_PAGE = 10;

const genderLabels: Record<string, string> = {
  female: "Weiblich",
  male: "Männlich",
  diverse: "Divers",
  not_specified: "K.A.",
};

const roleLabels: Record<string, string> = {
  user: "Nutzer",
  verified_producer: "Producer",
  brand: "Brand",
  admin: "Admin",
};

export function UsersTable({ profiles, rolesMap, subscriptionsMap }: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const filteredProfiles = useMemo(() => {
    if (!search.trim()) return profiles;
    const searchLower = search.toLowerCase();
    return profiles.filter(
      (p) =>
        p.display_name?.toLowerCase().includes(searchLower) ||
        p.user_id.toLowerCase().includes(searchLower)
    );
  }, [profiles, search]);

  const paginatedProfiles = useMemo(() => {
    const start = page * ITEMS_PER_PAGE;
    return filteredProfiles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProfiles, page]);

  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Nutzer suchen..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nutzer</TableHead>
              <TableHead>Alter</TableHead>
              <TableHead>Geschlecht</TableHead>
              <TableHead>Rollen</TableHead>
              <TableHead>Registriert</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Keine Nutzer gefunden
                </TableCell>
              </TableRow>
            ) : (
              paginatedProfiles.map((profile) => {
                const roles = rolesMap.get(profile.user_id) || [];
                return (
                  <TableRow
                    key={profile.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => setSelectedUser(profile)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {profile.display_name?.charAt(0)?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {profile.display_name || "Unbenannt"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {profile.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {profile.age_at_signup !== null ? profile.age_at_signup : "-"}
                    </TableCell>
                    <TableCell>
                      {profile.gender ? genderLabels[profile.gender] || profile.gender : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {roles.map((role) => (
                          <Badge
                            key={role}
                            variant={role === "admin" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {roleLabels[role] || role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(profile.created_at), "dd.MM.yy", { locale: de })}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredProfiles.length} Nutzer gefunden
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Seite {page + 1} von {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <UserDetailDialog
        profile={selectedUser}
        roles={selectedUser ? rolesMap.get(selectedUser.user_id) || [] : []}
        subscription={selectedUser ? subscriptionsMap.get(selectedUser.user_id) : undefined}
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      />
    </div>
  );
}
