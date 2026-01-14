import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function Datenschutz() {
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
          <h1 className="text-headline text-2xl">Datenschutzerklärung</h1>
        </div>
        
        <div className="space-y-6 text-body text-muted-foreground">
          <section>
            <h2 className="text-foreground font-medium mb-2">1. Datenschutz auf einen Blick</h2>
            <h3 className="text-foreground text-sm font-medium mt-4 mb-2">Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, 
              wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">2. Verantwortliche Stelle</h2>
            <p>
              Robin Streiff & Ivo Streiff<br />
              Kirchgasse<br />
              8272 Ermatingen<br />
              Schweiz<br />
              Telefon: +41 77 486 79 40 / +41 76 204 98 71<br />
              E-Mail: robin@shopable.one / ivo@shopable.one
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">3. Datenerfassung auf dieser Website</h2>
            <h3 className="text-foreground text-sm font-medium mt-4 mb-2">Cookies</h3>
            <p>
              Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Textdateien und richten auf Ihrem Endgerät 
              keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft 
              (permanente Cookies) auf Ihrem Endgerät gespeichert.
            </p>
            
            <h3 className="text-foreground text-sm font-medium mt-4 mb-2">Server-Log-Dateien</h3>
            <p>
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, 
              die Ihr Browser automatisch an uns übermittelt.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">4. Ihre Rechte</h2>
            <p>Sie haben jederzeit das Recht:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Auskunft über Ihre gespeicherten personenbezogenen Daten zu erhalten</li>
              <li>Berichtigung unrichtiger Daten zu verlangen</li>
              <li>Löschung Ihrer Daten zu verlangen</li>
              <li>Die Einschränkung der Verarbeitung zu verlangen</li>
              <li>Datenübertragbarkeit zu verlangen</li>
              <li>Widerspruch gegen die Verarbeitung einzulegen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">5. Zahlungsdienstleister</h2>
            <h3 className="text-foreground text-sm font-medium mt-4 mb-2">Stripe</h3>
            <p>
              Für Zahlungsabwicklungen nutzen wir den Dienst Stripe. Anbieter ist die Stripe Payments Europe, Ltd., 
              1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">6. Kontakt</h2>
            <p>
              Bei Fragen zum Datenschutz erreichen Sie uns unter:<br />
              E-Mail: robin@shopable.one / ivo@shopable.one
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link to="/impressum" className="hover:text-gold transition-colors">
              Impressum
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
