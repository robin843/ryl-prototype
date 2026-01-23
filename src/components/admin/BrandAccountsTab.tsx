import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Building2, 
  Search, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink,
  Loader2,
  Ban,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

interface BrandAccount {
  id: string;
  user_id: string;
  company_name: string;
  logo_url: string | null;
  website_url: string | null;
  industry: string | null;
  contact_email: string | null;
  status: string;
  verified_at: string | null;
  created_at: string;
}

export function BrandAccountsTab() {
  const [brands, setBrands] = useState<BrandAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<BrandAccount | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('brand_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Fehler beim Laden der Brand-Konten');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleStatusChange = async (brand: BrandAccount, newStatus: string) => {
    setActionLoading(true);
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'active' && !brand.verified_at) {
        updateData.verified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('brand_accounts')
        .update(updateData)
        .eq('id', brand.id);

      if (error) throw error;

      setBrands(prev => prev.map(b => 
        b.id === brand.id 
          ? { ...b, status: newStatus, verified_at: updateData.verified_at as string || b.verified_at }
          : b
      ));

      const statusLabels: Record<string, string> = {
        active: 'aktiviert',
        pending: 'auf ausstehend gesetzt',
        suspended: 'gesperrt',
      };

      toast.success(`${brand.company_name} wurde ${statusLabels[newStatus]}`);
      setSelectedBrand(null);
    } catch (error) {
      console.error('Error updating brand status:', error);
      toast.error('Fehler beim Aktualisieren des Status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aktiv
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Ausstehend
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <Ban className="w-3 h-3 mr-1" />
            Gesperrt
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.contact_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: brands.length,
    active: brands.filter(b => b.status === 'active').length,
    pending: brands.filter(b => b.status === 'pending').length,
    suspended: brands.filter(b => b.status === 'suspended').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <Building2 className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-serif text-primary">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Gesamt</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-serif">{stats.active}</p>
            <p className="text-xs text-muted-foreground">Aktiv</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-serif">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Ausstehend</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <Ban className="w-5 h-5 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-serif">{stats.suspended}</p>
            <p className="text-xs text-muted-foreground">Gesperrt</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Brand suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {filteredBrands.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-border/50 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {searchQuery ? 'Keine Brands gefunden' : 'Keine Brand-Konten vorhanden'}
          </p>
        </div>
      ) : (
        <Card className="border-border/50">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unternehmen</TableHead>
                  <TableHead>Branche</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registriert</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {brand.logo_url ? (
                            <img
                              src={brand.logo_url}
                              alt={brand.company_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium">{brand.company_name}</span>
                          {brand.website_url && (
                            <a
                              href={brand.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {brand.industry || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {brand.contact_email || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(brand.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(brand.created_at).toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedBrand(brand)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Details anzeigen
                          </DropdownMenuItem>
                          {brand.status !== 'active' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(brand, 'active')}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              Aktivieren
                            </DropdownMenuItem>
                          )}
                          {brand.status !== 'suspended' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(brand, 'suspended')}
                              className="text-destructive"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Sperren
                            </DropdownMenuItem>
                          )}
                          {brand.status === 'suspended' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(brand, 'pending')}>
                              <Clock className="h-4 w-4 mr-2 text-amber-500" />
                              Auf Ausstehend setzen
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedBrand} onOpenChange={() => setSelectedBrand(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {selectedBrand?.company_name}
            </DialogTitle>
            <DialogDescription>
              Brand-Konto Details und Verwaltung
            </DialogDescription>
          </DialogHeader>

          {selectedBrand && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedBrand.status)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground">Branche</p>
                  <p className="font-medium">{selectedBrand.industry || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kontakt-E-Mail</p>
                  <p className="font-medium">{selectedBrand.contact_email || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registriert am</p>
                  <p className="font-medium">
                    {new Date(selectedBrand.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
                {selectedBrand.verified_at && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Verifiziert am</p>
                    <p className="font-medium">
                      {new Date(selectedBrand.verified_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                )}
                {selectedBrand.website_url && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Website</p>
                    <a
                      href={selectedBrand.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {selectedBrand.website_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedBrand?.status !== 'active' && (
              <Button
                onClick={() => handleStatusChange(selectedBrand!, 'active')}
                disabled={actionLoading}
                className="w-full sm:w-auto"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Aktivieren
              </Button>
            )}
            {selectedBrand?.status !== 'suspended' && (
              <Button
                variant="destructive"
                onClick={() => handleStatusChange(selectedBrand!, 'suspended')}
                disabled={actionLoading}
                className="w-full sm:w-auto"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Ban className="h-4 w-4 mr-2" />
                )}
                Sperren
              </Button>
            )}
            {selectedBrand?.status === 'suspended' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange(selectedBrand!, 'pending')}
                disabled={actionLoading}
                className="w-full sm:w-auto"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Clock className="h-4 w-4 mr-2" />
                )}
                Entsperren
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
