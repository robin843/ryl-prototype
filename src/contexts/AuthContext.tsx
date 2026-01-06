import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getTierByProductId, SubscriptionTier } from '@/lib/subscriptionTiers';

interface SubscriptionStatus {
  subscribed: boolean;
  productId: string | null;
  priceId: string | null;
  subscriptionEnd: string | null;
  tier: SubscriptionTier | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionStatus;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    subscribed: false,
    productId: null,
    priceId: null,
    subscriptionEnd: null,
    tier: null,
  });

  const checkSubscription = async (currentSession: Session | null) => {
    if (!currentSession) {
      setSubscription({
        subscribed: false,
        productId: null,
        priceId: null,
        subscriptionEnd: null,
        tier: null,
      });
      return;
    }

    try {
      // Always get a fresh session to avoid expired token errors
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const tokenToUse = freshSession?.access_token || currentSession.access_token;

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      const tier = data.product_id ? getTierByProductId(data.product_id) : null;

      setSubscription({
        subscribed: data.subscribed || false,
        productId: data.product_id || null,
        priceId: data.price_id || null,
        subscriptionEnd: data.subscription_end || null,
        tier: tier || null,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const refreshSubscription = async () => {
    // Get fresh session before checking
    const { data: { session: freshSession } } = await supabase.auth.getSession();
    await checkSubscription(freshSession);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);

        // Defer subscription check to avoid deadlock
        if (newSession) {
          setTimeout(() => {
            checkSubscription(newSession);
          }, 0);
        } else {
          setSubscription({
            subscribed: false,
            productId: null,
            priceId: null,
            subscriptionEnd: null,
            tier: null,
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);

      if (existingSession) {
        checkSubscription(existingSession);
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  // Periodic subscription refresh (every 60 seconds)
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      checkSubscription(session);
    }, 60000);

    return () => clearInterval(interval);
  }, [session]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSubscription({
      subscribed: false,
      productId: null,
      priceId: null,
      subscriptionEnd: null,
      tier: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        subscription,
        signUp,
        signIn,
        signOut,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
