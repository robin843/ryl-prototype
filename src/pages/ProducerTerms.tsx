import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProducerTerms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-8 px-4">
        <Link to="/studio">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Bewerbung
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">
          <span className="text-gold">Nutzungsbedingungen</span> für Ryl Producer
        </h1>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">
              <span className="text-gold mr-2">1.</span>Geltungsbereich
            </h2>
            <p className="text-muted-foreground">
              Diese Nutzungsbedingungen gelten für alle Personen und Unternehmen, die als verifizierte 
              Producer auf der Ryl-Plattform Inhalte erstellen und veröffentlichen möchten. Mit der 
              Bewerbung als Producer erklärst du dich mit diesen Bedingungen einverstanden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              <span className="text-gold mr-2">2.</span>Voraussetzungen
            </h2>
            <p className="text-muted-foreground">
              Um als Ryl Producer tätig zu werden, musst du:
            </p>
            <ul className="list-none text-muted-foreground mt-2 space-y-1">
              <li className="flex items-start gap-2"><span className="text-gold">•</span>Mindestens 18 Jahre alt sein</li>
              <li className="flex items-start gap-2"><span className="text-gold">•</span>Über die erforderlichen Rechte an den von dir erstellten Inhalten verfügen</li>
              <li className="flex items-start gap-2"><span className="text-gold">•</span>Die Berechtigung haben, die von dir beworbenen Produkte zu vermarkten</li>
              <li className="flex items-start gap-2"><span className="text-gold">•</span>Wahrheitsgemäße Angaben in deiner Bewerbung machen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              <span className="text-gold mr-2">3.</span>Inhaltsrichtlinien
            </h2>
            <p className="text-muted-foreground">
              Als Producer verpflichtest du dich, nur Inhalte zu erstellen, die:
            </p>
            <ul className="list-none text-muted-foreground mt-2 space-y-1">
              <li className="flex items-start gap-2"><span className="text-gold">•</span>Keine Urheberrechte Dritter verletzen</li>
              <li className="flex items-start gap-2"><span className="text-gold">•</span>Keine irreführende Werbung oder falsche Produktversprechen enthalten</li>
              <li className="flex items-start gap-2"><span className="text-gold">•</span>Keine diskriminierenden, beleidigenden oder illegalen Inhalte beinhalten</li>
              <li className="flex items-start gap-2"><span className="text-gold">•</span>Den geltenden Werberichtlinien und Kennzeichnungspflichten entsprechen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              <span className="text-gold mr-2">4.</span>Shopable-Produkte
            </h2>
            <p className="text-muted-foreground">
              Bei der Verknüpfung von Produkten in deinen Videos stellst du sicher, dass:
            </p>
            <ul className="list-none text-muted-foreground mt-2 space-y-1">
              <li className="flex items-start gap-2"><span className="text-gold">•</span>Alle Produktinformationen korrekt und aktuell sind</li>
              <li className="flex items-start gap-2"><span className="text-gold">•</span>Die Preisangaben der Realität entsprechen</li>
              <li className="flex items-start gap-2"><span className="text-gold">•</span>Du berechtigt bist, diese Produkte zu bewerben</li>
              <li className="flex items-start gap-2"><span className="text-gold">•</span>Die Produkte legal erhältlich und versendbar sind</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              <span className="text-gold mr-2">5.</span>Vergütung
            </h2>
            <p className="text-muted-foreground">
              Die Vergütung erfolgt auf Basis der vereinbarten Konditionen. Details zur Vergütungsstruktur 
              werden nach erfolgreicher Verifizierung als Producer mitgeteilt. Auszahlungen erfolgen 
              über die von dir angegebenen Zahlungsinformationen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              <span className="text-gold mr-2">6.</span>Kündigung und Sperrung
            </h2>
            <p className="text-muted-foreground">
              Ryl behält sich das Recht vor, den Producer-Status zu widerrufen oder Accounts zu sperren, 
              wenn gegen diese Nutzungsbedingungen verstoßen wird oder die Inhaltsrichtlinien nicht 
              eingehalten werden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              <span className="text-gold mr-2">7.</span>Haftung
            </h2>
            <p className="text-muted-foreground">
              Du haftest für alle Inhalte, die du auf der Plattform veröffentlichst. Ryl übernimmt keine 
              Haftung für Schäden, die durch von dir erstellte Inhalte oder beworbene Produkte entstehen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              <span className="text-gold mr-2">8.</span>Datenschutz
            </h2>
            <p className="text-muted-foreground">
              Die Verarbeitung deiner personenbezogenen Daten erfolgt gemäß unserer{' '}
              <Link to="/datenschutz" className="text-gold hover:underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              <span className="text-gold mr-2">9.</span>Änderungen
            </h2>
            <p className="text-muted-foreground">
              Ryl behält sich vor, diese Nutzungsbedingungen jederzeit zu ändern. Über wesentliche 
              Änderungen wirst du rechtzeitig informiert.
            </p>
          </section>

          <section className="pt-4 border-t border-gold/30">
            <p className="text-sm text-muted-foreground">
              Stand: <span className="text-gold">Januar 2026</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
