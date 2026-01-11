import { Link } from "react-router-dom";
import { Home, Play, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-4xl font-headline text-gold tracking-wider">ryl</h1>
      </div>

      {/* 404 Message */}
      <div className="space-y-4 mb-8">
        <p className="text-8xl font-bold text-gold/20">404</p>
        <h2 className="text-2xl font-headline text-foreground">
          Diese Seite existiert nicht
        </h2>
        <p className="text-muted-foreground max-w-sm">
          Die gesuchte Seite wurde nicht gefunden. Vielleicht wurde sie verschoben oder gelöscht.
        </p>
      </div>

      {/* Navigation Options */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Button asChild className="flex-1 bg-gold hover:bg-gold/90 text-gold-foreground">
          <Link to="/feed" className="flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Zum Feed
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 border-gold/30 hover:bg-gold/10">
          <Link to="/soaps" className="flex items-center justify-center gap-2">
            <Play className="w-4 h-4" />
            Serien
          </Link>
        </Button>
      </div>

      {/* Back Link */}
      <button 
        onClick={() => window.history.back()}
        className="mt-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück zur vorherigen Seite
      </button>

      {/* Footer */}
      <div className="absolute bottom-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ryl. Alle Rechte vorbehalten.
      </div>
    </div>
  );
};

export default NotFound;
