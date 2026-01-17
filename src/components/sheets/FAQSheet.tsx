import { HelpCircle, ChevronRight, Mail, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    id: "usage",
    title: "Nutzung",
    items: [
      {
        question: "Wie finde ich Produkte im Video?",
        answer: "Produkte erscheinen als kleine Markierungen im Video. Tippe darauf, um Details zu sehen.",
      },
      {
        question: "Bleibt das Video offen, wenn ich ein Produkt antippe?",
        answer: "Ja. Das Video pausiert kurz, damit du das Produkt in Ruhe ansehen kannst. Danach läuft es weiter.",
      },
      {
        question: "Kann ich Produkte für später speichern?",
        answer: "Ja. Tippe auf das Lesezeichen-Symbol, um ein Produkt zu speichern. Du findest es dann in deinem Profil.",
      },
    ],
  },
  {
    id: "purchase",
    title: "Kauf & Vertrauen",
    items: [
      {
        question: "Wie funktioniert der Kauf?",
        answer: "Du wirst sicher zu einem externen Shop weitergeleitet, wo du den Kauf abschließen kannst.",
      },
      {
        question: "Ist der Kauf sicher?",
        answer: "Ja. Alle Zahlungen werden über sichere, etablierte Zahlungsanbieter abgewickelt.",
      },
      {
        question: "Wer verkauft die Produkte?",
        answer: "Die Produkte werden von den jeweiligen Marken oder Händlern verkauft, nicht von Ryl.",
      },
      {
        question: "Wie funktionieren Rückgaben?",
        answer: "Rückgaben laufen direkt über den jeweiligen Shop. Die Rückgabebedingungen findest du dort.",
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      {
        question: "Ich habe mein Passwort vergessen",
        answer: "Tippe auf der Anmeldeseite auf \"Passwort vergessen\" und folge den Anweisungen in der E-Mail.",
      },
      {
        question: "Wie ändere ich meinen Benutzernamen?",
        answer: "Gehe zu Einstellungen und tippe auf deinen Benutzernamen, um ihn zu ändern.",
      },
      {
        question: "Wie lösche ich meinen Account?",
        answer: "In den Einstellungen findest du ganz unten die Option, deinen Account dauerhaft zu löschen.",
      },
    ],
  },
  {
    id: "creator",
    title: "Creator",
    items: [
      {
        question: "Wie werde ich Producer?",
        answer: "Du kannst dich direkt in der App bewerben. Gehe dazu über dein Profil zum Creator Studio.",
      },
    ],
  },
];

export function FAQSheet({ isOpen, onClose }: FAQSheetProps) {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] bg-card/98 backdrop-blur-xl border-t border-border/50">
        <DrawerHeader className="relative pb-2">
          <DrawerClose className="absolute right-4 top-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
            <X className="w-4 h-4" />
          </DrawerClose>
          <DrawerTitle className="text-lg font-semibold">Häufige Fragen</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-8 overflow-y-auto">
          {/* Intro */}
          <p className="text-sm text-muted-foreground mb-6">
            Hier findest du Antworten auf häufige Fragen rund um Ryl.
          </p>

          {/* FAQ Categories */}
          <div className="space-y-6">
            {faqData.map((category) => (
              <div key={category.id}>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  {category.title}
                </h3>
                <Accordion type="single" collapsible className="space-y-1">
                  {category.items.map((item, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`${category.id}-${index}`}
                      className="border-none"
                    >
                      <AccordionTrigger className="py-3 px-4 rounded-xl bg-muted/30 hover:bg-muted/50 hover:no-underline text-left text-sm font-normal [&[data-state=open]]:rounded-b-none [&[data-state=open]]:bg-muted/50">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-2 bg-muted/30 rounded-b-xl text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-8 pt-6 border-t border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Kontakt</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Du hast eine Frage, die hier nicht beantwortet wird?
            </p>
            <a 
              href="mailto:robin@shopable.one"
              className="inline-flex items-center gap-2 text-sm text-foreground hover:text-gold transition-colors"
            >
              robin@shopable.one
              <ChevronRight className="w-4 h-4" />
            </a>
            <p className="text-xs text-muted-foreground mt-3">
              Wir melden uns in der Regel innerhalb von 24–48 Stunden.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border/30">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
              <Link to="/impressum" onClick={onClose} className="hover:text-foreground">
                Impressum
              </Link>
              <span>•</span>
              <Link to="/datenschutz" onClick={onClose} className="hover:text-foreground">
                Datenschutz
              </Link>
              <span>•</span>
              <Link to="/agb" onClick={onClose} className="hover:text-foreground">
                AGB
              </Link>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
