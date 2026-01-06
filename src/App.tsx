import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";
import { BottomNav } from "@/components/layout/BottomNav";

// Pages
import Landing from "./pages/Landing";
import Feed from "./pages/Feed";
import Soaps from "./pages/Soaps";
import Watch from "./pages/Watch";
import Series from "./pages/Series";
import Profile from "./pages/Profile";
import Studio from "./pages/Studio";
import StudioAnalytics from "./pages/StudioAnalytics";
import Admin from "./pages/Admin";
import SeriesDetail from "./pages/SeriesDetail";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import PaywallDemo from "./pages/PaywallDemo";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import ProducerTerms from "./pages/ProducerTerms";
import CreatorProfile from "./pages/CreatorProfile";
import SavedProducts from "./pages/SavedProducts";
import ProductDetail from "./pages/ProductDetail";
import WhyShopable from "./pages/WhyShopable";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/why-shopable" element={<WhyShopable />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/agb" element={<AGB />} />
            <Route path="/producer-terms" element={<ProducerTerms />} />
            
            {/* Protected routes - require auth + onboarding */}
            <Route path="/feed" element={
              <OnboardingGuard>
                <Feed />
              </OnboardingGuard>
            } />
            <Route path="/soaps" element={
              <OnboardingGuard>
                <Soaps />
              </OnboardingGuard>
            } />
            <Route path="/watch" element={
              <OnboardingGuard>
                <Watch />
              </OnboardingGuard>
            } />
            <Route path="/watch/:episodeId" element={
              <OnboardingGuard>
                <Watch />
              </OnboardingGuard>
            } />
            <Route path="/series/:seriesId" element={
              <OnboardingGuard>
                <Series />
              </OnboardingGuard>
            } />
            <Route path="/profile" element={
              <OnboardingGuard>
                <Profile />
              </OnboardingGuard>
            } />
            <Route path="/saved" element={
              <OnboardingGuard>
                <SavedProducts />
              </OnboardingGuard>
            } />
            <Route path="/creator/:creatorId" element={
              <OnboardingGuard>
                <CreatorProfile />
              </OnboardingGuard>
            } />
            <Route path="/product/:productId" element={
              <OnboardingGuard>
                <ProductDetail />
              </OnboardingGuard>
            } />
            <Route path="/studio" element={
              <OnboardingGuard>
                <Studio />
              </OnboardingGuard>
            } />
            <Route path="/studio/series/:seriesId" element={
              <OnboardingGuard>
                <SeriesDetail />
              </OnboardingGuard>
            } />
            <Route path="/studio/analytics" element={
              <OnboardingGuard>
                <StudioAnalytics />
              </OnboardingGuard>
            } />
            <Route path="/pricing" element={
              <OnboardingGuard>
                <Pricing />
              </OnboardingGuard>
            } />
            <Route path="/paywall-demo" element={
              <OnboardingGuard>
                <PaywallDemo />
              </OnboardingGuard>
            } />
            <Route path="/admin" element={
              <OnboardingGuard>
                <Admin />
              </OnboardingGuard>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;