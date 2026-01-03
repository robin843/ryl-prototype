import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Crown, Sparkles, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionTiers, getTierByProductId, SubscriptionTier } from '@/lib/subscriptionTiers';

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<{
    subscribed: boolean;
    productId?: string;
    subscriptionEnd?: string;
  } | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    // Check URL params for success/cancel
    if (searchParams.get('success') === 'true') {
      toast({
        title: 'Abo erfolgreich!',
        description: 'Dein Abonnement wurde erfolgreich aktiviert.',
      });
    } else if (searchParams.get('canceled') === 'true') {
      toast({
        title: 'Abgebrochen',
        description: 'Der Checkout wurde abgebrochen.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCheckingSubscription(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      
      setCurrentSubscription({
        subscribed: data.subscribed,
        productId: data.product_id,
        subscriptionEnd: data.subscription_end,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleSubscribe = async (tier: SubscriptionTier) => {
    try {
      setLoading(tier.id);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Anmeldung erforderlich',
          description: 'Bitte melde dich an, um ein Abo abzuschließen.',
          variant: 'destructive',
        });
        navigate('/profile');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: tier.priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Fehler',
        description: 'Checkout konnte nicht gestartet werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading('manage');
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: 'Fehler',
        description: 'Kundenportal konnte nicht geöffnet werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const userTiers = subscriptionTiers.filter(t => t.type === 'user');
  const producerTiers = subscriptionTiers.filter(t => t.type === 'producer');

  const currentTier = currentSubscription?.productId 
    ? getTierByProductId(currentSubscription.productId) 
    : null;

  const renderTierCard = (tier: SubscriptionTier) => {
    const isCurrentPlan = currentSubscription?.productId === tier.productId;
    
    return (
      <Card 
        key={tier.id} 
        className={`relative flex flex-col ${tier.popular ? 'border-gold shadow-lg shadow-gold/20' : ''} ${isCurrentPlan ? 'ring-2 ring-gold' : ''}`}
      >
        {tier.popular && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-primary-foreground">
            <Sparkles className="w-3 h-3 mr-1" />
            Beliebt
          </Badge>
        )}
        {isCurrentPlan && (
          <Badge className="absolute -top-3 right-4 bg-green-500 text-white">
            <Check className="w-3 h-3 mr-1" />
            Dein Plan
          </Badge>
        )}
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            {tier.type === 'producer' && tier.id === 'producer-enterprise' ? (
              <Building2 className="w-6 h-6 text-gold" />
            ) : tier.type === 'producer' ? (
              <Crown className="w-6 h-6 text-gold" />
            ) : (
              <Sparkles className="w-6 h-6 text-gold" />
            )}
          </div>
          <CardTitle className="text-xl">{tier.name}</CardTitle>
          <CardDescription>{tier.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="text-center mb-6">
            <span className="text-4xl font-bold">
              {tier.price.toLocaleString('de-DE', { minimumFractionDigits: tier.price % 1 !== 0 ? 2 : 0 })}€
            </span>
            <span className="text-muted-foreground">/Monat</span>
          </div>
          <ul className="space-y-3">
            {tier.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          {isCurrentPlan ? (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleManageSubscription}
              disabled={loading === 'manage'}
            >
              {loading === 'manage' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Abo verwalten
            </Button>
          ) : (
            <Button 
              className={`w-full ${tier.popular ? 'bg-gold hover:bg-gold/90 text-primary-foreground' : ''}`}
              onClick={() => handleSubscribe(tier)}
              disabled={loading === tier.id}
            >
              {loading === tier.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {tier.id === 'producer-enterprise' ? 'Kontakt aufnehmen' : 'Jetzt abonnieren'}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Preise & Abos</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Wähle deinen Plan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ob Zuschauer oder Creator – wir haben den perfekten Plan für dich.
          </p>
          {currentTier && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">
                Aktueller Plan: {currentTier.name}
              </span>
            </div>
          )}
        </div>

        {checkingSubscription ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : (
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="user">Für Zuschauer</TabsTrigger>
              <TabsTrigger value="producer">Für Producer</TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {userTiers.map(renderTierCard)}
              </div>
            </TabsContent>

            <TabsContent value="producer">
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {producerTiers.map(renderTierCard)}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* FAQ or additional info */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            Alle Preise inkl. MwSt. Jederzeit kündbar.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
