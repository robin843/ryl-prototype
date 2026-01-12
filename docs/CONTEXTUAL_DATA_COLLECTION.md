# Kontextuelle Datenerfassung - UX Flow & Trigger Conditions

## Grundprinzip

> "Daten sammeln, ohne dass es sich wie Datensammeln anfühlt."

Alter & Geschlecht sind **Kontextdaten** – keine Profildaten.
Sie werden situativ, einzeln und nur bei echtem Bedarf abgefragt.

---

## ALTER - Trigger Conditions

### Wann Alter abgefragt werden DARF

| Trigger | Condition | Aktion |
|---------|-----------|--------|
| 18+ Serie | `series.is_adult === true && !user.hasAgeData` | AgeVerificationSheet öffnen |
| 18+ Produkt | `product.is_restricted === true && !user.hasAgeData` | AgeVerificationSheet öffnen |
| Altersbeschränkter Checkout | Payment für Alkohol/Tabak | AgeVerificationSheet öffnen |

### Wann Alter NIEMALS abgefragt werden darf

- ❌ Beim App-Start
- ❌ Beim Feed-Laden
- ❌ Beim Serien-Klick (außer 18+ Content)
- ❌ Als Voraussetzung zum Weiterschauen
- ❌ Im Onboarding

### UX-Flow: Alter

```
User klickt auf 18+ Serie
    ↓
[AgeVerificationSheet - Bottom Sheet]
"Für diese Inhalte müssen wir dein Alter kennen."
"Wie alt bist du?"

[Unter 18] [18-24] [25-34] [35+]
    ↓
User tippt auf Bucket
    ↓
Speichern (async)
    ↓
Sheet schließt
    ↓
Content wird geladen (exakt gleicher Frame)
```

---

## PRÄFERENZ (statt Geschlecht) - Trigger Conditions

### Grundsatz

Geschlecht wird **NIE explizit** abgefragt.
Stattdessen: Shopping-Präferenz (algorithmisch wertvoller).

### Wann Präferenz abgefragt werden DARF

| Condition | Wert | Trigger |
|-----------|------|---------|
| Session-Zeit | `>= 5 Minuten` | Erforderlich |
| Vorherige Frage diese Session | `0` | Erforderlich |
| Bereits Präferenz bekannt | `false` | Erforderlich |
| Mindestens X Aktionen | Likes/Klicks/Watch-Time | Optional |

### Wann Präferenz NIEMALS abgefragt werden darf

- ❌ In den ersten 5 Minuten
- ❌ Wenn bereits eine Frage diese Session gestellt wurde
- ❌ Beim Serien-/Episode-Klick
- ❌ Während Video läuft
- ❌ Im Onboarding

### UX-Flow: Präferenz

```
User hat 5+ Minuten aktive Nutzung
    ↓
Natürliche Pause (z.B. nach Episode-Ende)
    ↓
[PreferenceSheet - Bottom Sheet]
"Für wen suchst du meist?"

[Für mich] [Für andere] [Beides]

[Überspringen - immer sichtbar]
    ↓
User tippt auf Option ODER überspringt
    ↓
Speichern (async) / Sheet schließt
    ↓
Feed läuft weiter (kein Reload)
```

---

## Bug-Liste (Definition of Failure)

### Kritische Bugs (Blocker)

| ID | Situation | Warum Bug |
|----|-----------|-----------|
| BUG-001 | Serie anklicken → Datenabfrage (außer 18+) | Unterbricht Flow ohne Grund |
| BUG-002 | Feed stoppt wegen Daten | Dopamin-Hit verhindert |
| BUG-003 | Mehrere Fragen hintereinander | Multi-Step = Onboarding |
| BUG-004 | Daten-Screen vor erstem Video | Kein Value vor Ask |
| BUG-005 | Alter + Geschlecht auf einem Screen | Kombinierte Abfrage verboten |
| BUG-006 | "Nur noch eine Frage"-Copy | Manipulative Sprache |

### UX-Warnungen (High Priority)

| ID | Situation | Risiko |
|----|-----------|--------|
| WARN-001 | Datenabfrage < 5 Min Session | Zu früh, User noch nicht investiert |
| WARN-002 | Fullscreen-Dialog statt Sheet | Zu invasiv |
| WARN-003 | Keine Skip-Option bei Präferenz | Pflicht-Gefühl |
| WARN-004 | Wort "Geschlecht" im UI | Zu persönlich |

---

## Champions-Test (Erfolgskriterium)

Nach jeder Datenabfrage muss diese Frage mit **NEIN** beantwortet werden:

> "Würde sich der User bewusst erinnern,
> gerade persönliche Daten eingegeben zu haben?"

- ✅ **Nein** → Perfekt umgesetzt
- ❌ **Ja** → UX zu laut → Überarbeiten

---

## Technische Integration

### Hook: `useContextualDataCollection`

```typescript
const {
  hasAgeData,
  hasPreferenceData,
  checkAgeForRestrictedContent,
  checkAgeForRestrictedProduct,
  checkPreferenceTrigger,
  recordAgeCollected,
  recordPreferenceCollected,
} = useContextualDataCollection();
```

### Komponenten

- `AgeVerificationSheet` - Bottom Sheet für Altersabfrage
- `PreferenceSheet` - Bottom Sheet für Shopping-Präferenz

### Datenbank

Speicherung in `profiles`:
- `age_at_signup` (number) - Alters-Bucket (minAge des Buckets)
- `gender` (string) - Umgewidmet für Präferenz: "self" | "gift" | "both"

---

## Metriken zur Validierung

Die Implementierung ist erfolgreich wenn:

1. Abbruchrate nicht messbar steigt
2. Feed-Session-Länge stabil bleibt
3. Commerce-Interaktionen nicht sinken
4. Kein User-Feedback wie:
   - "Warum fragt ihr das?"
   - "Warum jetzt?"
   - "Das ist mir zu persönlich"
