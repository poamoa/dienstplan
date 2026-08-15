# PROJECT.md – Dienstplan Gemeinde

Lebendes Dokument. Wird von Claude Code am Session-Ende SELBSTSTÄNDIG
aktualisiert (Regel 3 der globalen CLAUDE.md).

_Zuletzt aktualisiert: 2026-08-15_

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

**Phase 5 (Testlauf) gestartet am 2026-07-21:** 32 echte Personen angelegt
(Bereichsleiter mit Präferenzen), Test-Personen gelöscht. Testlauf mit Joel + 2
Bereichsleitern, eine Woche, dann Rollout (Phase 6).

Entschieden (2026-07-21):
- **Admin-Modell bleibt weich** (Geste, kein echtes Gating). `ist_admin` ist nur
  noch kosmetisch. Kein Handlungsbedarf.
- **Vertretung: Dominik** vorgesehen – Joel klärt Zusage mit ihm. Danach
  einrichten: GitHub-Collaborator auf BEIDEN Repos (Claude kann das per
  GitHub-Username), Supabase-Member (Joel im Dashboard), Passwörter in den
  gemeinsamen Passwortmanager.

Offen:
- **Kinderdienst-Leiter** dünn (v. a. KiDi-K nur 2). Wird von den Leuten selbst
  nach Absprache nachgezogen (Präferenz „kann leiten"), keine Technik-Aufgabe.
- Viele Personen ohne Präferenzen – füllt sich per Selbstbedienung im Testlauf.
- **Technische Altlast: `/neues-jahr`-Skill passt nicht zum neuen Rhythmus.** Er
  legt *alle* Sonntage der nächsten 12 Monate an; der reale Plan ist aber 1./3.
  Sonntag mit Winter-/Sommerpause (siehe `sql/04`). Vor der nächsten Jahres-
  planung (Herbst 2027) anpassen, sonst erzeugt er falsche Termine. Auch
  `docs/05` („Jährlich im Herbst … `sql/02_seed.sql`") entsprechend korrigieren.

Umgebung: `psql` unter `/opt/homebrew/opt/libpq/bin/psql` (keg-only), `gh` hat
`workflow`-Scope. GitHub-Konto `poamoa`.

**Testlauf-Rückmeldungen (2026-07-27) ausgewertet und umgesetzt:**
- Leiter/Mitarbeiter-Dialog war unintuitiv (OK/Abbrechen) → echtes Sheet mit
  zwei beschrifteten Buttons. Erledigt in `app.js`/`app.css`, **am 2026-07-27
  deployt.**
- Neue Bereiche: „Kinderdienst Stationen" (Stationsaufsicht, Min 2),
  „Band & Sänger", „Helfer Kinderdienst", „Helfer Lobpreis". Die drei letzten
  sind optionale Pools „unbestimmter Anzahl": neues Konzept `bereiche.mit_ampel`
  = false → keine Ampel, nur wer dabei ist. Zweite Flag `offen_fuer_alle`: Helfer
  (Kinderdienst, Lobpreis) sind ohne Präferenz für jeden eintragbar; Band & Sänger
  bleibt präferenz-gesteuert. App-Code deployt; **DB-Teil am 2026-08-15
  nachgezogen** (`sql/05` gelaufen, im Browser geprüft) – damit ist die
  Testlauf-Nacharbeit vollständig erledigt.

## Nächster konkreter Schritt

**Stand 2026-08-15: technisch ist nichts mehr offen.** Alle Testlauf-Änderungen
sind live – App-Code seit 2026-07-28 auf GitHub Pages, der DB-Teil (`sql/05`)
heute im Supabase-SQL-Editor nachgezogen und im Browser geprüft. Damit ist
Phase 5 inhaltlich abgeschlossen.

**Nächster Schritt ist kein Code, sondern Gemeinde-Arbeit:**
1. **Vertretung mit Dominik klären** (Zusage einholen). Sobald zugesagt:
   GitHub-Collaborator auf BEIDEN Repos (macht Claude, braucht nur den
   GitHub-Usernamen), Supabase-Member (macht Joel im Dashboard), Passwörter in
   den gemeinsamen Passwortmanager. `README.md` unten eintragen.
2. **Kill-Frage stellen**: Kommt ChurchTools o. Ä. in der Gemeinde? Ein
   Gespräch, keine Stunde Code – aber vor dem Rollout beantworten.
3. **Rollout (Phase 6)** an alle ~32 Personen: URL + Team-Passwort verteilen,
   Handy-Kachel erklären. Bereichsleiter zusätzlich die Admin-Geste (5× auf den
   eigenen Namen tippen). Rechne mit 2–3 h.

Für DB-Änderungen künftig: Weg B (Supabase-Dashboard → SQL Editor → Skript aus
`sql/` einfügen → Run) hat gut funktioniert und braucht kein Secret. Lokal ist
KEIN DB-Zugang gespeichert (keine .env, kein ~/.pgpass, keine supabase-CLI);
für den psql-Weg müsste die Pooler-URI jedes Mal transient in die Session.

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
- 2026-08-15 – `sql/05` in der Live-DB ausgeführt (Weg B, Joel im
  Supabase-SQL-Editor): Spalten `mit_ampel`/`offen_fuer_alle` + 4 neue Bereiche
  (Stationen, Helfer KiDi, Band & Sänger, Helfer Lobpreis). Browser-Test ok.
  Damit ist die Testlauf-Nacharbeit komplett; offen ist nur noch
  Nicht-Technisches (Vertretung, Kill-Frage, Rollout).
- 2026-07-21 – 32 echte Personen angelegt (Bereichsleiter mit Präferenzen),
  Test-Personen gelöscht, Stand ins private Backup-Repo gesichert. Phase 5
  (Testlauf mit 3 Personen) gestartet.
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
