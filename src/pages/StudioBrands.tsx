import { ArrowLeft, Building2, Check, Clock, ExternalLink, Loader2, Search, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandLogo } from '@/components/studio/brands/BrandLogo';
import { useCreatorPartnerships } from '@/hooks/useCreatorPartnerships';
import { ProducerGuard } from '@/components/studio/ProducerGuard';
import { aspirationalBrands, type AspirationalBrand } from '@/data/aspirationalBrands';
function BrandCard({
  brand,
  status,
  onRequest,
  isRequesting,
}: {
  brand: {
    id: string;
    company_name: string;
    logo_url: string | null;
    industry: string | null;
    website_url: string | null;
  };
  status: string | null;
  onRequest: () => void;
  isRequesting: boolean;
}) {
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <Check className="w-3 h-3 mr-1" />
            Aktiv
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-gold/20 text-gold border-gold/30">
            <Clock className="w-3 h-3 mr-1" />
            Angefragt
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <X className="w-3 h-3 mr-1" />
            Abgelehnt
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="border-border/50 hover:border-gold/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {brand.logo_url ? (
            <BrandLogo
              src={brand.logo_url}
              alt={brand.company_name}
              websiteUrl={brand.website_url}
            className="object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-gold" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">
                  {brand.company_name}
                </h3>
                {brand.industry && (
                  <p className="text-xs text-muted-foreground">{brand.industry}</p>
                )}
              </div>
              {getStatusBadge()}
            </div>

            <div className="flex items-center gap-2 mt-3">
              {brand.website_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  asChild
                >
                  <a href={brand.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Website
                  </a>
                </Button>
              )}

              {!status && (
                <Button
                  variant="premium"
                  size="sm"
                  className="h-7 text-xs ml-auto"
                  onClick={onRequest}
                  disabled={isRequesting}
                >
                  {isRequesting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    'Partnerschaft anfragen'
                  )}
                </Button>
              )}

              {status === 'active' && (
                <span className="text-xs text-emerald-400 ml-auto">
                  Produkte dieser Brand können getaggt werden
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Aspirational Brand Card Component
function AspirationalBrandCard({ brand }: { brand: AspirationalBrand }) {
  return (
    <Card className="border-border/50 hover:border-gold/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <BrandLogo
            src={brand.logo_url}
            alt={brand.name}
            websiteUrl={brand.website_url}
            className="p-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">
                  {brand.name}
                </h3>
                <p className="text-xs text-muted-foreground">{brand.industry}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                asChild
              >
                <a href={brand.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Website
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StudioBrandsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    availableBrands,
    partnerships,
    isLoading,
    requestPartnership,
    getPartnershipStatus,
  } = useCreatorPartnerships();

  // Combine registered brands with aspirational brands
  const filteredRegisteredBrands = availableBrands.filter((brand) =>
    brand.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAspirationalBrands = aspirationalBrands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myPartnerships = partnerships.filter((p) => p.status === 'active');
  const pendingPartnerships = partnerships.filter((p) => p.status === 'pending');

  const totalBrandsCount = availableBrands.length + aspirationalBrands.length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/studio">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-lg">Brand Partnerschaften</h1>
            <p className="text-xs text-muted-foreground">
              Verbinde dich mit verifizierten Brands
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Brand suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
            <TabsTrigger value="all" className="text-xs">
              Alle Brands ({totalBrandsCount})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Aktiv ({myPartnerships.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">
              Angefragt ({pendingPartnerships.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            ) : (
              <>
                {/* Registered Brands Section */}
                {filteredRegisteredBrands.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Verifizierte Partner ({filteredRegisteredBrands.length})
                    </h3>
                    {filteredRegisteredBrands.map((brand) => (
                      <BrandCard
                        key={brand.id}
                        brand={brand}
                        status={getPartnershipStatus(brand.id)}
                        onRequest={() => requestPartnership.mutate(brand.id)}
                        isRequesting={requestPartnership.isPending}
                      />
                    ))}
                  </div>
                )}

                {/* Aspirational Brands Section */}
                {filteredAspirationalBrands.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Top Brands ({filteredAspirationalBrands.length})
                    </h3>
                    {filteredAspirationalBrands.map((brand) => (
                      <AspirationalBrandCard key={brand.id} brand={brand} />
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {filteredRegisteredBrands.length === 0 && filteredAspirationalBrands.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Keine Brands gefunden' : 'Noch keine Brands verfügbar'}
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-4 space-y-3">
            {myPartnerships.length === 0 ? (
              <div className="text-center py-12">
                <Check className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Noch keine aktiven Partnerschaften</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Frag bei Brands an, um Partnerschaften zu starten
                </p>
              </div>
            ) : (
              myPartnerships.map((p) =>
                p.brand ? (
                  <BrandCard
                    key={p.id}
                    brand={p.brand}
                    status="active"
                    onRequest={() => {}}
                    isRequesting={false}
                  />
                ) : null
              )
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-4 space-y-3">
            {pendingPartnerships.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Keine offenen Anfragen</p>
              </div>
            ) : (
              pendingPartnerships.map((p) =>
                p.brand ? (
                  <BrandCard
                    key={p.id}
                    brand={p.brand}
                    status="pending"
                    onRequest={() => {}}
                    isRequesting={false}
                  />
                ) : null
              )
            )}
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="border-gold/20 bg-gold/5">
          <CardContent className="p-4">
            <h4 className="font-medium text-gold text-sm mb-2">
              Was sind Brand Partnerschaften?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mit einer aktiven Partnerschaft kannst du Produkte dieser Brand in deinen Videos 
              taggen. Die Brand sieht deine Performance und du erhältst möglicherweise 
              bessere Provisionen oder exklusive Kampagnen.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function StudioBrands() {
  return (
    <ProducerGuard>
      <StudioBrandsContent />
    </ProducerGuard>
  );
}
