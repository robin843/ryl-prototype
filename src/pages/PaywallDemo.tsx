import PaywallOverlay from "@/components/paywall/PaywallOverlay";
import episode2Cover from "@/assets/episode-2-cover.jpg";
import { toast } from "@/hooks/use-toast";

const PaywallDemo = () => {
  const handleSubscribe = () => {
    toast({
      title: "Abo-Flow",
      description: "Hier würde der Stripe Checkout öffnen",
    });
  };

  const handleLogin = () => {
    toast({
      title: "Login",
      description: "Hier würde die Login-Seite öffnen",
    });
  };

  return (
    <PaywallOverlay
      episodeTitle="Episode 2: Der Durchbruch"
      seriesTitle="Fashion Week Berlin"
      thumbnailUrl={episode2Cover}
      onSubscribe={handleSubscribe}
      onLogin={handleLogin}
      isLoggedIn={false}
    />
  );
};

export default PaywallDemo;
