import { AppLayout } from "@/components/layout/AppLayout";

export default function Impressum() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background px-6 py-16 max-w-2xl mx-auto">
        <h1 className="text-headline text-2xl mb-8">Impressum</h1>
        
        <div className="space-y-6 text-body text-muted-foreground">
          <section>
            <h2 className="text-foreground font-medium mb-2">Angaben gemäß § 5 TMG</h2>
            <p>
              Ryl GmbH<br />
              Musterstraße 123<br />
              12345 Musterstadt<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Vertreten durch</h2>
            <p>Geschäftsführer: Max Mustermann</p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Kontakt</h2>
            <p>
              Telefon: +49 (0) 123 456789<br />
              E-Mail: info@ryl.app
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Registereintrag</h2>
            <p>
              Eintragung im Handelsregister<br />
              Registergericht: Amtsgericht Musterstadt<br />
              Registernummer: HRB 12345
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Umsatzsteuer-ID</h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              DE 123456789
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-medium mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>
              Max Mustermann<br />
              Musterstraße 123<br />
              12345 Musterstadt
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
      </div>
    </AppLayout>
  );
}
