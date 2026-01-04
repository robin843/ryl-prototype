import { AppLayout } from "@/components/layout/AppLayout";

export default function Datenschutz() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background px-6 py-16 max-w-2xl mx-auto">
        <h1 className="text-headline text-2xl mb-8">Datenschutzerklärung</h1>
        
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
              Ryl GmbH<br />
              Musterstraße 123<br />
              12345 Musterstadt<br />
              E-Mail: datenschutz@ryl.app
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
              E-Mail: datenschutz@ryl.app
            </p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
