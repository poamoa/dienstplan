# PROJECT.md – Dienstplan Gemeinde

Lebendes Dokument. Wird von Claude Code am Session-Ende SELBSTSTÄNDIG
aktualisiert (Regel 3 der globalen CLAUDE.md).

_Zuletzt aktualisiert: 2026-07-20_

## Ziel & Kernnutzen
Die Diensteinteilung der Gemeinde (Kinderdienst, Aufbau, Technik, …) läuft
statt über Zettel und WhatsApp über eine Web-App, in der jeder seine eigenen
Dienste sieht und sich selbst einträgt.

## Intake-Ergebnis
- Entscheidung: **GO** am 2026-07-20 – Vorarbeit (Phase 0) war bereits fertig,
  Gate lief verkürzt auf Basis von `docs/00`–`08`.
- Kategorie: **Eigenbedarf / Ehrenamt – ausdrücklich KEIN Monetarisierungsprojekt.**
  Es zahlt niemand und es soll niemand zahlen. Damit belegt es nicht den Slot
  für ein Einkommensprojekt, konkurriert aber sehr wohl um dieselbe Zeit.
- Minimaler Kern: Anmeldung + "Meine Dienste" als reine Leseansicht. Wenn das
  Team das nicht öffnet, tragen sie sich auch nicht selbst ein – dann ist der
  Rest egal.
- Zeitbudget: 2–4 h/Woche · Zielhorizont: Testlauf (Phase 5) in 3–4 Wochen
- Kill-Frage (vor dem Bauen klären): **Kommt in der Gemeinde absehbar
  ChurchTools o. Ä.?** Wenn ja, ist das Projekt tot (siehe `docs/06`,
  "Bewusst nie"). Diese Frage kostet ein Gespräch, nicht eine Stunde Code.

## Aktueller Stand
Phase 0 abgeschlossen. Am 2026-07-20 aus ZIP nach `~/projekte/dienstplan/`
gelegt, Git-Repo initialisiert, zwei Commits.

**App gebaut, aber ungetestet.** `index.html`, `app.css`, `app.js` sind fertig
nach `docs/08`, alle vier Reiter inklusive Admin-Einteilung und Präferenz-
Overlay. Gestaltung auf Joels Wunsch schlank/Apple umgestellt, Vorgabe in
`docs/08` entsprechend nachgezogen.

Was noch fehlt und den Fortschritt begrenzt:
- **Kein Supabase-Projekt.** `config.js` ist eine leere Vorlage, die App zeigt
  ohne sie einen Hinweis statt der Anmeldung.
- **Kein Kriterium gegen echte Daten geprüft.** Belegt sind nur Nr. 6 (360 px)
  und Nr. 4 gegen eine nachgebaute Ampel-Logik in einer Vorschau mit erfundenen
  Daten. Die Anmeldung (Nr. 1), der RLS-Test ohne Anmeldung (Nr. 2) und die
  Dropdown-Sortierung (Nr. 5) sind komplett ungeprüft.

Vorbereitet ist: `gh` hat jetzt den `workflow`-Scope (sonst scheitert der Push
der Workflow-Dateien), `psql` liegt unter `/opt/homebrew/opt/libpq/bin/psql`
(keg-only, nicht im PATH).

## Nächster konkreter Schritt
Supabase-Projekt im Browser anlegen (Frankfurt, Name `dienstplan-gemeinde`) und
Project URL, anon key und Session-Pooler-URL bereitlegen. Danach läuft `/setup`
in einem Rutsch durch; direkt anschließend die sieben Abnahmekriterien echt
durchklicken.

## Offene Entscheidungen
- [ ] Kill-Frage: ChurchTools o. Ä. in Planung? (Gespräch in der Gemeinde)
- [ ] Wer ist die **Vertretung** für GitHub- und Supabase-Zugang? (`README.md`
      unten, aktuell leer – ohne das ist es ein Ein-Personen-Risiko)

## Letzte 20 % (Fertigstellung)
Eigener Posten, nicht wegoptimieren – hier bricht es bei Joel typischerweise ab:
- Testlauf mit 3 Personen + Nacharbeit: **4–6 h**
- Rollout (echte Namen, Passwort verteilen, Handy-Kacheln erklären): **2–3 h**
- Laufende Pflege: ~1 h/Monat (neue Termine, kleine Wünsche)

Faustregel: Bauen ist die Hälfte. Die andere Hälfte ist, 30 Ehrenamtliche dazu
zu bringen, es zu benutzen.

## Log (neueste zuerst)
- 2026-07-20 – App gebaut (`index.html`, `app.css`, `app.js`), Gestaltung auf
  schlank/Apple umgestellt und `docs/08` nachgezogen. Ungetestet gegen echte
  Daten – bewusst vorgezogen, weil Supabase auf später verschoben wurde.
  `gh`-Scope `workflow` ergänzt, `libpq` installiert.
- 2026-07-20 – Projekt aus ZIP übernommen, `~/projekte/dienstplan/` angelegt,
  PROJECT.md ergänzt, Git-Repo initialisiert. Intake nachgeholt: GO als
  Eigenbedarfsprojekt.
