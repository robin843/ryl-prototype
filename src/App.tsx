import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { SheetProvider } from "@/contexts/SheetContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";
import { BottomNav } from "@/components/layout/BottomNav";

// Pages
import Landing from "./pages/Landing";
import Feed from "./pages/Feed";
import SeriesFeed from "./pages/SeriesFeed";
import Soaps from "./pages/Soaps";
import Watch from "./pages/Watch";
import Series from "./pages/Series";
import Profile from "./pages/Profile";
import Studio from "./pages/Studio";
import StudioAnalytics from "./pages/StudioAnalytics";

import Admin from "./pages/Admin";
import SeriesDetail from "./pages/SeriesDetail";

import Auth from "./pages/Auth";
import AuthLogin from "./pages/AuthLogin";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import ProducerTerms from "./pages/ProducerTerms";
import CreatorProfile from "./pages/CreatorProfile";
import SavedProducts from "./pages/SavedProducts";
import ProductDetail from "./pages/ProductDetail";
import WhyShopable from "./pages/WhyShopable";
import CheckoutSuccess from "./pages/CheckoutSuccess";

import Settings from "./pages/Settings";
import ShopableDemo from "./pages/ShopableDemo";
import JoinReferral from "./pages/JoinReferral";
import InviteReferral from "./pages/InviteReferral";

const queryClient = new QueryClient();

function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AuthModalProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SheetProvider>
              {/* Global AuthModal - appears as overlay anywhere in the app */}
              <AuthModal />
              <Routes>
                
                {/* START: Soaps overview is the root - PUBLIC, zero friction */}
                <Route path="/" element={<Soaps />} />
                <Route path="/soaps" element={<Soaps />} />
                <Route path="/feed" element={<Feed />} />
                
                {/* Landing moved to /about for those who want info */}
                <Route path="/about" element={<Landing />} />
                
                {/* Public routes - no auth required */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/login" element={<AuthLogin />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/why-shopable" element={<WhyShopable />} />
                <Route path="/impressum" element={<Impressum />} />
                <Route path="/datenschutz" element={<Datenschutz />} />
                <Route path="/agb" element={<AGB />} />
                <Route path="/producer-terms" element={<ProducerTerms />} />
                <Route path="/join/:code" element={<JoinReferral />} />
                <Route path="/invite/:code" element={<InviteReferral />} />
                <Route path="/checkout-success" element={<CheckoutSuccess />} />
                
                {/* Browse routes - PUBLIC, no auth gate */}
                <Route path="/watch" element={<Watch />} />
                <Route path="/watch/:episodeId" element={<Watch />} />
                <Route path="/series/:seriesId" element={<Series />} />
                <Route path="/series/:seriesId/watch" element={<SeriesFeed />} />
                <Route path="/creator/:creatorId" element={<CreatorProfile />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                
                {/* User-specific routes - require auth + onboarding */}
                <Route path="/profile" element={
                  <OnboardingGuard>
                    <Profile />
                  </OnboardingGuard>
                } />
                <Route path="/settings" element={
                  <OnboardingGuard>
                    <Settings />
                  </OnboardingGuard>
                } />
                <Route path="/saved" element={
                  <OnboardingGuard>
                    <SavedProducts />
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
                <Route path="/shopable-demo" element={<ShopableDemo />} />
                <Route path="/admin" element={
                  <OnboardingGuard>
                    <Admin />
                  </OnboardingGuard>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNav />
            </SheetProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthModalProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
}

export default App;