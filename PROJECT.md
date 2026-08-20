# PROJECT.md – Dienstplan Gemeinde

Lebendes Dokument. Wird von Claude Code am Session-Ende SELBSTSTÄNDIG
aktualisiert (Regel 3 der globalen CLAUDE.md).

_Zuletzt aktualisiert: 2026-08-20_

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
- **Vertretung: Josua** (festgelegt am 2026-08-15; vorher war Dominik
  angedacht). Stand 2026-08-20: **GitHub erledigt** – Collaborator mit
  Schreibrechten auf `poamoa/dienstplan` (Einladung angenommen) und auf dem
  privaten `poamoa/dienstplan-backups` (Einladung raus, Annahme offen). Der
  Account wurde vorher von Joel bestätigt. **Supabase-Einladung ebenfalls raus**
  (Joel im Dashboard). Offen ist damit nur noch der gemeinsame Passwortmanager.

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
1. **Josua die Zugänge geben** (er ist die Vertretung, steht seit 2026-08-15
   fest und ist in `README.md` eingetragen). Drei Dinge, sonst bleibt es ein
   Ein-Personen-Risiko:
   - ~~GitHub-Collaborator auf beiden Repos~~ – **erledigt 2026-08-20.**
     Öffentliches Repo angenommen, Einladung fürs private Backup-Repo raus.
   - ~~Supabase-Member im Projekt `kztbppgwgptyeqnxnoab`~~ – **erledigt
     2026-08-20**, Einladung von Joel verschickt.
   - **Offen: gemeinsamer Passwortmanager.** Empfehlung (2026-08-20):
     Bitwarden, kostenlose Organisation für 2 Benutzer, plattformunabhängig;
     Apple Passwords (geteilte Gruppe) nur, falls Josua auch Apple nutzt.
     Hinein gehören: Supabase-DB-Passwort und `service_role` key (beide hoch
     sensibel, ggf. im Dashboard neu erzeugen – laut Doku wurden sie nie
     gespeichert), das Team-Passwort der App (nach dem Rollout ohnehin bei ~32
     Leuten bekannt, nur zum Nachschlagen) sowie eine Orientierungsnotiz
     (Projekt-Ref, beide Repos, wo `BACKUP_DEPLOY_KEY` liegt).
2. **Rollout (Phase 6)** an alle ~32 Personen: URL + Team-Passwort verteilen,
   Handy-Kachel erklären. Bereichsleiter zusätzlich die Admin-Geste (5× auf den
   eigenen Namen tippen). Rechne mit 2–3 h.

Für DB-Änderungen künftig: Weg B (Supabase-Dashboard → SQL Editor → Skript aus
`sql/` einfügen → Run) hat gut funktioniert und braucht kein Secret. Lokal ist
KEIN DB-Zugang gespeichert (keine .env, kein ~/.pgpass, keine supabase-CLI);
für den psql-Weg müsste die Pooler-URI jedes Mal transient in die Session.

## Offene Entscheidungen
- [x] **Kill-Frage beantwortet (2026-08-15): ChurchTools o. Ä. kommt NICHT.**
      Das Projekt ist damit dauerhaft freigegeben – die Gemeinde bekommt keine
      Fremdlösung, die es ersetzen würde.
- [x] **Vertretung für GitHub- und Supabase-Zugang: Josua** (2026-08-15, in
      `README.md` eingetragen). Zugänge teilweise eingerichtet (Stand
      2026-08-20: öffentliches Repo ja, privates Backup-Repo + Supabase +
      Passwortmanager nein) – siehe „Nächster konkreter Schritt".
- [x] **GitHub-Account der Vertretung bestätigt** (2026-08-20, von Joel; das
      Profil selbst gibt nichts her). Beide Einladungen sind raus.
- [ ] **Welcher Passwortmanager?** Empfehlung Bitwarden (Free-Organisation,
      2 Benutzer). Bisher war im ganzen Projekt nie ein konkretes Tool genannt.
- [ ] **Welche Supabase-Rolle bekommt Josua?** Owner (kann alles, auch das
      Projekt löschen – dafür echter Bus-Faktor-Schutz) oder Administrator/
      Developer (Alltagsbetrieb ja, Org-Verwaltung nein). Er braucht dafür ein
      eigenes Supabase-Konto (kostenlos, Login per GitHub möglich).

## Letzte 20 % (Fertigstellung)
Eigener Posten, nicht wegoptimieren – hier bricht es bei Joel typischerweise ab:
- Testlauf mit 3 Personen + Nacharbeit: **4–6 h**
- Rollout (echte Namen, Passwort verteilen, Handy-Kacheln erklären): **2–3 h**
- Laufende Pflege: ~1 h/Monat (neue Termine, kleine Wünsche)

Faustregel: Bauen ist die Hälfte. Die andere Hälfte ist, 30 Ehrenamtliche dazu
zu bringen, es zu benutzen.

## Log (neueste zuerst)
- 2026-08-20 – Supabase-Einladung für die Vertretung verschickt (Joel im
  Dashboard). Von den drei Zugängen fehlt damit nur noch der gemeinsame
  Passwortmanager; Empfehlung Bitwarden Free-Organisation steht im „Nächsten
  konkreten Schritt".
- 2026-08-20 – GitHub-Zugang der Vertretung fertig: Account von Joel bestätigt,
  Einladung fürs öffentliche Repo angenommen, Einladung fürs private
  `dienstplan-backups` raus. Damit ist von den drei Zugängen der erste erledigt;
  offen sind Supabase und der Passwortmanager.
- 2026-08-20 – Josua als Collaborator (Schreibrechte) auf das **öffentliche**
  Repo `poamoa/dienstplan` eingeladen; Einladung ist offen, bis er sie annimmt.
  Das private `dienstplan-backups` bewusst ausgelassen: Der genannte Account ist
  ein leeres Profil, das sich nicht als Josuas verifizieren lässt, und im
  Backup-Repo liegen die Daten von 32 realen Personen. Nachziehen, sobald er den
  Username bestätigt.
- 2026-08-15 – Zwei offene Entscheidungen geschlossen: **ChurchTools o. Ä. kommt
  NICHT** (Kill-Frage endgültig beantwortet, Projekt dauerhaft freigegeben) und
  **Josua ist die Vertretung** (statt Dominik), in `README.md` eingetragen.
  Zugänge für ihn noch einzurichten.
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
