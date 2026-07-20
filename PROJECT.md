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
Phase 0 abgeschlossen: Architektur entschieden, Doku 00–08 vollständig,
SQL-Skripte (Schema, Seed, RLS), Setup-Skript, GitHub-Workflows (Backup,
Keep-Alive) und fünf Projekt-Skills liegen vor.
**Die App selbst existiert noch nicht** – `index.html`, `app.css`, `app.js`,
`config.js` fehlen. Kein Supabase-Projekt, nichts online.

Am 2026-07-20 aus ZIP nach `~/projekte/dienstplan/` gelegt und als Git-Repo
initialisiert.

## Nächster konkreter Schritt
`/setup` im Projektordner ausführen (Phase 1). Braucht ~5 Min Browser-Login bei
Supabase; den Rest macht der Skill. Danach erst `/app-bauen`.

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
- 2026-07-20 – Projekt aus ZIP übernommen, `~/projekte/dienstplan/` angelegt,
  PROJECT.md ergänzt, Git-Repo initialisiert. Intake nachgeholt: GO als
  Eigenbedarfsprojekt.
