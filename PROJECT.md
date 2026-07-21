# PROJECT.md – Dienstplan Gemeinde

Lebendes Dokument. Wird von Claude Code am Session-Ende SELBSTSTÄNDIG
aktualisiert (Regel 3 der globalen CLAUDE.md).

_Zuletzt aktualisiert: 2026-07-21_

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

Erledigt (Phasen 0–4):
- App gebaut (`index.html`, `app.css`, `app.js`), Optik schlank/Apple.
- Supabase `kztbppgwgptyeqnxnoab` (Frankfurt): Schema, Seed, RLS. 0 Tabellen
  ohne RLS. Neuer Schlüsseltyp (`sb_publishable_` in config.js, `sb_secret_`
  nur transient fürs Team-Konto).
- Öffentliches Repo `poamoa/dienstplan`, GitHub Pages aktiv.
- Termin-Plan Sep 26–Jul 27 (1./3. Sonntag, Pausen, 13 Sondertermine),
  Sondertermine als Info ohne Ampel, Termine im Admin editierbar, versteckter
  Admin-Zugang (5× auf Namen).
- **Phase 4:** Keep-Alive aktiv; Backup läuft täglich in ein separates,
  **privates** Repo `poamoa/dienstplan-backups` (Deploy-Key `BACKUP_DEPLOY_KEY`,
  läuft nicht ab). Erster Dump liegt drin. Kein `backups/` im öffentlichen Repo.
- Sichtprüfung im Browser (Handy + Rechner) durch Joel: funktioniert.
- Gegen echte DB per API geprüft: Kriterium 1 (Login), 2 (ohne Login keine
  Daten), 4 (Ampelregel). Details im Änderungslog.

Offen:
- **Test-Personen** noch drin (Test Admin/Leiterin/Mitarbeiter) – vor Rollout
  durch echte Vornamen ersetzen.
- **Vertretung** für GitHub (beide Repos)/Supabase weiterhin nicht benannt.

Umgebung: `psql` unter `/opt/homebrew/opt/libpq/bin/psql` (keg-only), `gh` hat
`workflow`-Scope. GitHub-Konto `poamoa`.

## Nächster konkreter Schritt
Phasen 0–4 erledigt (App live, Termine, Backup+Keep-Alive aktiv). Offen bis zum
echten Rollout:
1. Test-Personen (Test Admin/Leiterin/Mitarbeiter) durch echte Vornamen ersetzen
   – im Adminbereich (5× auf Namen tippen) unter Personen.
2. Testlauf mit 3 Personen, 1 Woche (Phase 5), dann Rollout (Phase 6).
3. **Vertretung** benennen: Zugriff auf beide Repos (öffentlich + privates
   `dienstplan-backups`), Supabase, DB-Passwort im Passwortmanager.

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
- 2026-07-21 – Plan-Reiter: Filter nach Dienst (z. B. nur Kinderdienst über die
  kommenden Wochen), Auswahl pro Gerät gemerkt.
- 2026-07-21 – Phase 4 aktiviert: Keep-Alive + nächtliches Backup in privates
  Repo `dienstplan-backups` (Deploy-Key). Sichtprüfung Handy+Rechner ok.
- 2026-07-21 – Joel: Funktionsumfang vorerst ausreichend (dann doch Phase 4
  angegangen).
- 2026-07-20 – Termin-Plan Sep 26–Jul 27 generiert (1./3. Sonntag, Winter-/
  Sommerpause, 13 Sondertermine), Spalte `braucht_dienste` für Info-Termine,
  Termine im Admin editierbar, versteckter Admin-Zugang (5× auf Namen tippen).
  SQL + JS-Harness getestet, Browser-Sichtprüfung offen.
- 2026-07-20 – Overlay-Schließknopf grüner Haken statt grauem ×.
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
