import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const mainPages = ["/", "/soaps", "/profile", "/studio", "/auth"];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isMainPage = mainPages.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {!isMainPage && (
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-card transition-colors"
          aria-label="Zurück"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <main>{children}</main>
    </div>
  );
}
