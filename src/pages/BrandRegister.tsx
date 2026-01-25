import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Building2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const INDUSTRIES = [
  'Fashion & Bekleidung',
  'Beauty & Kosmetik',
  'Lifestyle',
  'Tech & Elektronik',
  'Food & Getränke',
  'Sport & Fitness',
  'Home & Living',
  'Automotive',
  'Finanzen',
  'Andere',
];

export default function BrandRegister() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);

  const isSetupMode = useMemo(() => searchParams.get('setup') === '1', [searchParams]);
  const isAuthenticatedSetup = isSetupMode && !!user;
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: '',
    website: '',
    contactEmail: '',
  });

  // In setup mode we already have an authenticated user; use their email as default.
  useEffect(() => {
    if (!isAuthenticatedSetup) return;
    const email = user?.email ?? '';
    if (!email) return;
    setFormData(prev => ({
      ...prev,
      email,
      contactEmail: prev.contactEmail || email,
    }));
  }, [isAuthenticatedSetup, user?.email]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      let userId: string;
      let primaryEmail: string;

      if (isAuthenticatedSetup && user) {
        // Setup flow for users that already exist (e.g. signed up before but brand account missing)
        userId = user.id;
        primaryEmail = user.email || formData.email;
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwörter stimmen nicht überein');
          return;
        }

        if (formData.password.length < 6) {
          toast.error('Passwort muss mindestens 6 Zeichen lang sein');
          return;
        }

        // 1. Create auth user (redirect back here to finish setup)
        const redirectUrl = `${window.location.origin}/brand/register?setup=1`;
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Benutzer konnte nicht erstellt werden');

        // If email confirmation is enabled, we may not have a session yet and cannot create the brand row.
        if (!authData.session) {
          setStep('success');
          toast.success('Fast fertig: Bitte bestätige deine E-Mail und kehre dann hierher zurück, um die Brand-Registrierung abzuschließen.');
          navigate('/brand/login');
          return;
        }

        userId = authData.user.id;
        primaryEmail = authData.user.email || formData.email;
      }

      // 2. Create brand account
      const { error: brandError } = await supabase
        .from('brand_accounts')
        .insert({
          user_id: userId,
          company_name: formData.companyName,
          industry: formData.industry || null,
          website_url: formData.website || null,
          contact_email: formData.contactEmail || primaryEmail,
          status: 'pending',
        });

      if (brandError) throw brandError;

      // 3. Add brand role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'brand',
        });

      if (roleError) {
        console.error('Role error:', roleError);
      }

      setStep('success');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registrierung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gold">Registrierung erfolgreich!</h2>
            <p className="text-muted-foreground mb-6">
              {isSetupMode
                ? 'Bitte schließe die Brand-Registrierung ab (falls du eine Bestätigungs-E-Mail erhalten hast: erst bestätigen, dann einloggen).'
                : 'Dein Brand-Konto wurde erstellt und wird nun überprüft. Du erhältst eine Benachrichtigung, sobald dein Konto aktiviert wurde.'}
            </p>
            <Button onClick={() => navigate('/brand/login')} className="w-full bg-gold hover:bg-gold/90 text-primary-foreground">
              Zum Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-16 relative">
      {/* Top-left back button */}
      <Link
        to="/"
        className="absolute top-4 left-6 inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Startseite
      </Link>

      <div className="w-full max-w-md mx-auto mt-12">
        <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-gold" />
            </div>
            <CardTitle className="text-2xl text-gold">Brand Registrierung</CardTitle>
            <CardDescription>
              Erstelle ein Brand-Konto für dein Unternehmen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-foreground">Firmenname *</Label>
                <Input
                  id="companyName"
                  placeholder="Dein Unternehmen GmbH"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  required
                  className="border-gold/20 focus:border-gold/50 focus:ring-gold/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-foreground">Branche</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleChange('industry', value)}
                >
                  <SelectTrigger className="border-gold/20 focus:border-gold/50 focus:ring-gold/20">
                    <SelectValue placeholder="Wähle eine Branche" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-foreground">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://deine-marke.de"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="border-gold/20 focus:border-gold/50 focus:ring-gold/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="brand@beispiel.de"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required={!isAuthenticatedSetup}
                  disabled={isAuthenticatedSetup}
                  className="border-gold/20 focus:border-gold/50 focus:ring-gold/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-foreground">Kontakt-E-Mail (falls abweichend)</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="kontakt@beispiel.de"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="border-gold/20 focus:border-gold/50 focus:ring-gold/20"
                />
              </div>

              {!isAuthenticatedSetup && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Passwort *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      required
                      minLength={6}
                      className="border-gold/20 focus:border-gold/50 focus:ring-gold/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">Passwort bestätigen *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      required
                      className="border-gold/20 focus:border-gold/50 focus:ring-gold/20"
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrieren...
                  </>
                ) : (
                  'Brand-Konto erstellen'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Bereits ein Brand-Konto? </span>
              <Link to="/brand/login" className="text-gold hover:underline">
                Jetzt anmelden
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
