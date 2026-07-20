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
**Live und benutzbar:** https://poamoa.github.io/dienstplan/
Team-Passwort nicht hier notieren (Repo ist öffentlich) – im Passwortmanager.

Erledigt am 2026-07-20 (Phasen 0–3):
- App gebaut (`index.html`, `app.css`, `app.js`), Optik schlank/Apple.
- Supabase `kztbppgwgptyeqnxnoab` (Frankfurt): Schema, Seed, RLS. 0 Tabellen
  ohne RLS. Neuer Schlüsseltyp (`sb_publishable_` in config.js, `sb_secret_`
  nur transient fürs Team-Konto).
- Öffentliches Repo `poamoa/dienstplan`, GitHub Pages aktiv.
- Gegen echte DB per API geprüft: Kriterium 1 (Login), 2 (ohne Login keine
  Daten), 4 (Kinderdienst ohne Leiter → rot, mit → gelb). Details im
  Änderungslog.

Offen:
- **Sichtprüfung im Browser** (Kriterien 3, 5, 6, 7) – nur Joel kann klicken.
- **Phase 4 (Backup/Keep-Alive):** Workflows bewusst **deaktiviert**, damit sie
  ohne Secrets keine Fehlermails senden. Vor Rollout: Secrets setzen und
  `gh workflow enable backup.yml keepalive.yml`. Ohne Backup kein echter
  Team-Rollout.
- **Vertretung** für GitHub/Supabase weiterhin nicht benannt.

Umgebung: `psql` unter `/opt/homebrew/opt/libpq/bin/psql` (keg-only), `gh` hat
`workflow`-Scope.

## Nächster konkreter Schritt
Joel klickt die Live-Seite auf dem Handy durch (anmelden → Anna M. → alle vier
Reiter). Gefundene Punkte hier melden. Danach: Phase 4 (Backup) aktivieren,
bevor echte Namen rein.

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
- 2026-07-20 – Live gegangen: Supabase eingerichtet (Schema/Seed/RLS),
  Team-Konto, öffentliches Repo + GitHub Pages. Kernregel und Login gegen echte
  DB geprüft. Workflows (Backup/Keep-Alive) deaktiviert bis Secrets gesetzt.
- 2026-07-20 – App gebaut (`index.html`, `app.css`, `app.js`), Gestaltung auf
  schlank/Apple umgestellt und `docs/08` nachgezogen. Ungetestet gegen echte
  Daten – bewusst vorgezogen, weil Supabase auf später verschoben wurde.
  `gh`-Scope `workflow` ergänzt, `libpq` installiert.
- 2026-07-20 – Projekt aus ZIP übernommen, `~/projekte/dienstplan/` angelegt,
  PROJECT.md ergänzt, Git-Repo initialisiert. Intake nachgeholt: GO als
  Eigenbedarfsprojekt.
