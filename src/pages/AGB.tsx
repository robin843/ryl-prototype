import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

export default function AGB() {
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
          <h1 className="text-headline text-2xl">Allgemeine Geschäftsbedingungen</h1>
        </div>
        
        <div className="space-y-6 text-body text-muted-foreground">
          <section>
            <h2 className="text-foreground font-medium mb-2">§ 1 Geltungsbereich</h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge, die zwischen der Ryl GmbH 
              (nachfolgend „Anbieter") und dem Kunden über die Nutzung der Ryl-Plattform geschlossen werden.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">§ 2 Vertragsgegenstand</h2>
            <p>
              Gegenstand des Vertrages ist die Bereitstellung der Ryl-Plattform zur Nutzung von Video-Streaming-Diensten 
              mit integrierter Shopping-Funktionalität. Der genaue Leistungsumfang ergibt sich aus dem gewählten Abonnement.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">§ 3 Registrierung und Nutzerkonto</h2>
            <p>
              (1) Für die Nutzung der Plattform ist eine Registrierung erforderlich.<br />
              (2) Der Nutzer ist verpflichtet, wahrheitsgemäße Angaben zu machen und seine Zugangsdaten geheim zu halten.<br />
              (3) Die Weitergabe der Zugangsdaten an Dritte ist nicht gestattet.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">§ 4 Abonnements und Zahlungsbedingungen</h2>
            <p>
              (1) Die Nutzung bestimmter Inhalte setzt den Abschluss eines kostenpflichtigen Abonnements voraus.<br />
              (2) Die Abrechnung erfolgt monatlich oder jährlich im Voraus.<br />
              (3) Die Zahlung erfolgt über den Zahlungsdienstleister Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">§ 5 Widerrufsrecht</h2>
            <p>
              Verbraucher haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. 
              Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">§ 6 Kündigung</h2>
            <p>
              (1) Das Abonnement kann jederzeit zum Ende der jeweiligen Abrechnungsperiode gekündigt werden.<br />
              (2) Die Kündigung kann über das Nutzerkonto oder per E-Mail erfolgen.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">§ 7 Haftung</h2>
            <p>
              (1) Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit.<br />
              (2) Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">§ 8 Änderungen der AGB</h2>
            <p>
              Der Anbieter behält sich vor, diese AGB zu ändern. Änderungen werden dem Nutzer per E-Mail mitgeteilt. 
              Widerspricht der Nutzer nicht innerhalb von vier Wochen, gelten die Änderungen als akzeptiert.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">§ 9 Schlussbestimmungen</h2>
            <p>
              (1) Es gilt das Recht der Bundesrepublik Deutschland.<br />
              (2) Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>
          </section>

          <p className="text-xs text-muted-foreground mt-8">Stand: Januar 2026</p>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link to="/impressum" className="hover:text-gold transition-colors">
              Impressum
            </Link>
            <Link to="/datenschutz" className="hover:text-gold transition-colors">
              Datenschutz
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
