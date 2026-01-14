import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function Impressum() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background px-6 py-8 max-w-2xl mx-auto pb-32">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/feed" 
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-headline text-2xl">Impressum</h1>
        </div>
        
        <div className="space-y-6 text-body text-muted-foreground">
          <section>
            <h2 className="text-foreground font-medium mb-2">Angaben gemäß § 5 DDG</h2>
            <p>
              Robin Streiff & Ivo Streiff<br />
              Kirchgasse<br />
              8272 Ermatingen<br />
              Schweiz
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Vertreten durch</h2>
            <p>Robin Streiff & Ivo Streiff</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Kontakt</h2>
            <p>
              Telefon: +41 77 486 79 40 / +41 76 204 98 71<br />
              E-Mail: robin@shopable.one / ivo@shopable.one
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Verantwortlich für den Inhalt</h2>
            <p>
              Robin Streiff & Ivo Streiff<br />
              Kirchgasse<br />
              8272 Ermatingen<br />
              Schweiz
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline ml-1">
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="mt-2">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link to="/datenschutz" className="hover:text-gold transition-colors">
              Datenschutz
            </Link>
            <Link to="/agb" className="hover:text-gold transition-colors">
              AGB
            </Link>
            <Link to="/about" className="hover:text-gold transition-colors">
              Über Ryl
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ryl. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
