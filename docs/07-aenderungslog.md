# 07 – Änderungslog

Jede Änderung an App, Datenbank oder Regeln hier eintragen. Neueste oben.
Dauert 20 Sekunden und beantwortet später die Frage „warum ist das so?".

Format:

```
## JJJJ-MM-TT – Kurzbeschreibung
- Wer: Name
- Was: was konkret geändert wurde (Datei, Tabelle, Wert)
- Warum: der Auslöser
- Folgen: worauf man achten muss
```

## 2026-08-15 – `sql/05` in der Live-Datenbank ausgeführt

- **Wer:** Joel (Supabase-Dashboard → SQL Editor), angeleitet von Claude
- **Was:** `sql/05_bereiche_helfer.sql` gegen die Produktiv-DB gefahren. Neue
  Spalten `bereiche.mit_ampel` und `bereiche.offen_fuer_alle`; vier neue
  Bereiche: Kinderdienst Stationen (`Station`, Min 2, mit Ampel),
  Helfer Kinderdienst (`H-KiDi`), Band & Sänger (`Band`),
  Helfer Lobpreis (`H-Lob`).
- **Warum:** Der App-Code dafür war seit 2026-07-28 live und lag dormant, weil
  die Spalten/Bereiche in der DB fehlten. Damit ist die Nacharbeit aus dem
  Testlauf komplett.
- **Getestet:** Vorher/nachher per REST-API geprüft – die Abfrage auf
  `mit_ampel` lief vorher auf „column does not exist", danach fehlerfrei.
  Anonym (ohne Login) liefern `bereiche` und `personen` weiterhin `[]`, RLS
  greift also auch auf den neuen Spalten. Joel hat die App im Browser
  durchgeklickt: Helfer-Pools ohne Präferenz eintragbar, Band & Sänger nur mit
  Präferenz, Pools ohne Ampel, Stationen mit Ampel.
- **Deployt:** Kein Push nötig – App-Code war bereits draußen; geprüft, dass die
  live ausgelieferte `app.js` mit der lokalen übereinstimmt.
- **Folgen:** Neue Bereiche erben die RLS-Policies der Tabelle `bereiche`,
  kein zusätzliches SQL nötig. Namen/Kürzel sind nur noch per `update`
  änderbar (`on conflict (name) do nothing` fasst Bestehendes nicht an).

## 2026-07-28 – Ein-Personen-Dienste werden grün statt gelb

- **Wer:** Joel, mit Claude
- **Was:** Neue Funktion `statusVon(zeile)` in `app.js` berechnet den Ampelstatus
  jetzt im Frontend (nicht mehr aus `v_besetzung.status`). Neue Regel:
  Bereiche mit `min_personen ≤ 1` sind bei erfüllter Pflichtzahl **grün**;
  mehrköpfige Bereiche bleiben bei genau Minimum gelb. `ampel()` und die
  „rot"-Gruppierung (`adminAmpel`) nutzen `statusVon()`.
- **Warum:** Testlauf-Wunsch – Sprecher und Milch & Wasser (je Min 1) zeigten
  mit ihrer einen Person gelb, obwohl voll besetzt.
- **Getestet:** Syntax (JavaScriptCore) + 13 Unit-Tests gegen die extrahierte
  `statusVon` (Ein-Personen-, mehrköpfig, Leiterpflicht, Überbesetzung).
- **Deployt:** Am 2026-07-28 gepusht (GitHub Pages). Rein Frontend, keine DB.
- **Folgen:** Ampel-Logik lebt jetzt im Code, nicht in der View. Künftige
  Änderungen in `statusVon()`. `v_besetzung.status` wird nicht mehr gelesen.

## 2026-07-27 – Testlauf-Rückmeldungen: Buttons + neue Bereiche

- **Wer:** Joel, mit Claude
- **Was:**
  1. `app.js` `selbstEintragen`: der native `confirm()`-Dialog
     (OK = Leiter / Abbrechen = Mitarbeiter) ersetzt durch das vorhandene
     iOS-Sheet mit zwei beschrifteten Buttons „Als Leiter eintragen" /
     „Als Mitarbeiter eintragen" (neue Funktionen `rolleWaehlen`,
     `eintragSpeichern`; `.knopf.zweit` in `app.css`).
  2. Konzept „optionaler Pool ohne Ampel": neue Spalte `bereiche.mit_ampel`
     (`sql/05_bereiche_helfer.sql`). Bei `mit_ampel = false` zeigt die App
     keine Ampel und kein „x/min", nur wer dabei ist. `ampel()` und
     `belegungText()` nehmen jetzt den Bereich mit; `austragen` und die
     „rot"-Gruppierung im Plan überspringen solche Pools.
  3. Vier neue Bereiche (SQL): „Kinderdienst Stationen" (Min 2, mit Ampel),
     „Helfer Kinderdienst", „Band & Sänger", „Helfer Lobpreis" (je Min 0,
     ohne Ampel).
  4. Zweite Bereichs-Flag `bereiche.offen_fuer_alle`: `true` → der Bereich wird
     jedem in „Eintragen" angeboten, ohne Präferenz, und erscheint nicht in der
     Präferenz-Liste. Gesetzt für „Helfer Kinderdienst" und „Helfer Lobpreis".
     „Band & Sänger" bleibt `false` (nur Musiker mit Präferenz). `tabEintragen`
     nimmt offene Pools in `meineBereiche` auf; `overlayOeffnen` überspringt sie.
- **Warum:** Rückmeldungen aus dem Testlauf (Phase 5): Leiter/Mitarbeiter-Dialog
  unintuitiv; Bedarf an Stationsaufsicht, Band & Sängern und allgemeinen
  Helfern (Lobpreis, Kinderdienst) mit unbestimmter Anzahl.
- **Getestet:** Syntax mit JavaScriptCore kompiliert; `ampel`/`belegungText` in
  10 Unit-Tests gegen die aus der Datei extrahierten Funktionen (inkl. Fall
  „alte DB ohne Spalte" → normale Ampel). Interaktive Sichtprüfung (Login →
  Eintragen) bleibt bei Joel.
- **Deployt:** Am 2026-07-27 nach Freigabe gepusht (GitHub Pages). Der Button-Fix
  ist damit live. Die `mit_ampel`-Renderlogik ist rückwärtskompatibel und bleibt
  dormant, bis `sql/05` gelaufen ist.
- **Folgen:** `sql/05_bereiche_helfer.sql` noch im Supabase SQL-Editor ausführen –
  erst dann existieren die neuen Bereiche/Pools. Ohne die Spalte behandelt die
  App alles wie `mit_ampel = true` (unkritisch).

## 2026-07-21 – Plan-Reiter: Filter nach Dienst

- **Wer:** Joel, mit Claude
- **Was:** Oben im Plan-Reiter eine Auswahl „Alle Dienste" / einzelner Bereich.
  Bei gewähltem Bereich zeigt jede Terminkarte nur diesen Dienst (Belegung +
  Ampel), Sondertermine werden ausgeblendet. Auswahl pro Gerät gemerkt
  (`localStorage`). Plan lädt jetzt 12 statt 8 Termine voraus.
- **Warum:** Wunsch Joel – z. B. ein Kinderdienst-Leiter will nur seine Dienste
  über die kommenden Wochen sehen, nicht alle 7 Bereiche pro Termin.
- **Getestet:** JS-Harness: ungefiltert alle Bereiche + Sondertermine, gefiltert
  nur der gewählte Dienst, 0 Info-Karten. Browser-Sichtprüfung offen (Joel).

---

## 2026-07-21 – Phase 4: Keep-Alive + Backup aktiv (Backup in privates Repo)

- **Wer:** Joel, mit Claude
- **Was:**
  - Keep-Alive aktiviert (Secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`), Testlauf grün.
  - Backup umgebaut: schreibt in ein **separates, privates** Repo
    `poamoa/dienstplan-backups` statt in dieses (öffentliche) Repo. Zugriff über
    einen **Deploy-Key** (Secret `BACKUP_DEPLOY_KEY`), der nicht abläuft. Secret
    `SUPABASE_DB_URL` (Session-Pooler) gesetzt. Testlauf grün, erster Dump liegt
    im privaten Repo (`backups/dienstplan-2026-07-21.sql`).
  - Workflow installiert `postgresql-client-17` und ruft
    `/usr/lib/postgresql/17/bin/pg_dump` direkt auf (Runner-Default ist 16,
    Server 17 → sonst „server version mismatch").
- **Warum:** Dieses Repo ist öffentlich (Pages). Ein DB-Export enthält alle
  Vornamen + Dienstplan und darf nicht öffentlich werden. Deploy-Key statt PAT,
  weil der nicht erneuert werden muss (Wunsch Joel).
- **Getestet:** Beide Workflows grün. Kontrolliert, dass KEIN `backups/`-Ordner
  im öffentlichen Repo liegt und der Dump nur im privaten Repo ist.
- **Folgen:** Phase 4 erledigt. Backup-Repo ist Teil des Systems – Vertretung
  braucht auch dort Zugriff (siehe `docs/05`). Damit ist der Weg frei für echte
  Namen (Phase 6).

---

## 2026-07-20 – Termin-Plan 2026/27, Sondertermine, editierbare Termine, versteckter Admin

- **Wer:** Joel, mit Claude
- **Was:**
  - `sql/04_termine_2026_27.sql`: Spalte `termine.braucht_dienste` (Info-Termine
    ohne Ampel), `v_besetzung` filtert diese aus. Plan Sep 2026–Jul 2027
    generiert: 1./3. Sonntag je Monat (19 reguläre Treffen), Winterpause ab
    1. Advent (29.11.2026) bis Neustart 17.1.2027, Sommerpausenabschluss als
    letzter Termin (25.7.2027). 13 Sondertermine (Lobpreisabende ~2-monatlich,
    Leitertreffen ~3-monatlich, Weihnachtsfeier 12.12., Fasten-/Gebetswoche
    25.1.). Alte Seed-Sonntage entfernt (inkl. 2 Test-Termine vor Plan-Beginn).
  - App: Sondertermine erscheinen als schlanke Info-Karte (Plan + Verwaltung),
    nicht im „Eintragen". Admin kann Termine **bearbeiten** (Datum/Titel/Info-Flag)
    und beim Anlegen als „nur Info" markieren.
  - **Versteckter Admin-Zugang:** 5× auf den eigenen Namen in der Fußzeile tippen
    schaltet den Verwaltung-Reiter pro Gerät frei (`localStorage`), Knopf zum
    Verbergen. `ist_admin` steuert die Sichtbarkeit nicht mehr.
- **Warum:** Wunsch von Joel – realer Jahresplan statt wöchentlicher Seed-Sonntage,
  Sondertermine ohne unsinnige Dienst-Ampel, Datum nachträglich korrigierbar,
  Admin nicht für jeden sichtbar.
- **Getestet:** SQL gegen echte DB (19 regulär / 13 Info, `v_besetzung` ohne
  Info-Termine, erster Sonntag liefert 7 Bereiche). App-Renderpfade im
  JS-Harness (Login → Admin → alle Reiter inkl. Info-Karte und Bearbeiten-Modus)
  fehlerfrei. **Noch offen:** Sichtprüfung im Browser durch Joel.
- **Annahmen (editierbar):** Rhythmus = 1./3. Sonntag; falls euer Takt versetzt
  ist, per „Bearbeiten" verschieben. Sondertermin-Daten sind Platzhalter.

---

## 2026-07-20 – Overlay-Schließknopf: grüner Haken statt grauem ×

- **Wer:** Joel, mit Claude
- **Was:** In `index.html`/`app.css` den Schließknopf oben rechts in den Overlays
  (Präferenzen, Admin-Termindetail) von grauem × auf gefüllten grünen Kreis mit
  weißem Haken (✓) geändert, aria-label auf „Fertig – Änderungen sind gespeichert".
- **Warum:** Das × fühlte sich nach Verwerfen an. Die Änderungen werden aber
  ohnehin sofort gespeichert; der Haken kommuniziert Bestätigung statt Abbruch.
- **Folgen:** Betrifft beide Overlays (gemeinsamer Knopf `#overlay-zu`). Die
  Fehlerleiste behält bewusst ihr × (echtes Verwerfen).

---

## 2026-07-20 – Live gegangen: Supabase eingerichtet, auf GitHub Pages online (Phasen 1 + 3)

- **Wer:** Joel, mit Claude
- **Was:**
  - Supabase-Projekt `kztbppgwgptyeqnxnoab` (Frankfurt). Schema, Seed (7 Bereiche,
    3 Testpersonen, 52 Sonntage) und RLS eingespielt. Kontrolle: 0 Tabellen ohne RLS.
  - Neuer Supabase-Schlüsseltyp: `config.js` enthält den `sb_publishable_…`-Key
    (ersetzt den alten anon key). Team-Konto über den `sb_secret_…`-Key angelegt
    (ersetzt service_role), Schlüssel wurde nicht gespeichert.
  - Team-Konto `team@gemeinde.de`; Passwort im Passwortmanager (nicht im Repo).
  - Öffentliches Repo `poamoa/dienstplan`, GitHub Pages aktiv:
    **https://poamoa.github.io/dienstplan/**
  - Zwei App-Bugfixes committet: leere Fehlerleiste (`.fehler[hidden]`) und
    `localStorage`-Absicherung.
- **Warum:** Joel wollte direkt die echte Seite hosten statt einer Vorschau.
  Hosting auf GitHub Pages war ohnehin als Phase 3 geplant.
- **Getestet (gegen die echte Datenbank, per API):**
  - Ohne Anmeldung Personen lesen → `[]`, nichts sichtbar (Kriterium 2).
  - Login mit Team-Passwort → Token (Kriterium 1). Altes Passwort abgelehnt.
  - Kernregel (Kriterium 4) gegen `v_besetzung`: Kinderdienst 2 Personen ohne
    Leiter → rot; mit Leiter → gelb. Testdaten danach entfernt.
  - Pages liefert index.html/app.css/app.js/config.js alle mit HTTP 200.
- **Noch offen / bewusst zurückgestellt:**
  - **Phase 4 (Backup + Keep-Alive):** Beide Workflows sind **deaktiviert**,
    damit sie ohne Secrets keine Fehlermails erzeugen. Vor Rollout (Phase 6):
    GitHub-Secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_DB_URL` setzen
    und `gh workflow enable backup.yml keepalive.yml`.
  - Sichtprüfung im Browser (Kriterien 3, 5, 6, 7) steht noch aus – nur Joel kann
    klicken.
  - In Supabase: `Confirm email` sollte für das Team-Konto irrelevant sein (per
    Admin-API mit `email_confirm` angelegt); bei Login-Problemen dort prüfen.

---

## 2026-07-20 – App gebaut (Phase 2), Gestaltung auf schlank/Apple umgestellt

- **Wer:** Joel, mit Claude
- **Was:** `index.html`, `app.css`, `app.js` nach `docs/08` gebaut; `config.js`
  als leere Vorlage angelegt. Gestaltungsabschnitt in `docs/08` neu geschrieben:
  keine Schatten mehr, Haarlinien statt Rahmen, Hintergrund #f2f2f7, Akzent
  #0a6cc4, Ampel abgedunkelt (#d1362b/#b57a00/#2f855a), Reiterleiste mit Blur.
- **Warum:** Joel wollte eine deutlich schlankere Optik in Richtung Apple. Die
  alte Vorgabe (weiche Schatten, #3b5b7c) wurde ersetzt statt übergangen, damit
  Doku und Code nicht auseinanderlaufen.
- **Folgen:** **Phase 2 ist noch NICHT abgehakt.** Der Code ist gegen keine
  echte Datenbank gelaufen – es gab noch kein Supabase-Projekt. Von den sieben
  Abnahmekriterien ist bisher nur Nr. 6 (360 px, kein horizontales Scrollen)
  belegt, dazu Nr. 4 gegen eine nachgebaute Ampel-Logik in einer Vorschau mit
  erfundenen Daten. Nach `/setup` müssen alle sieben Kriterien echt geprüft
  werden, besonders Nr. 1, 2 und 5.
- **Abweichung von der Spezifikation:** `TEAM_EMAIL` steht als Konstante in
  `app.js` (wie in `docs/08` vorgesehen) und bewusst NICHT in `config.js` –
  `scripts/setup.sh` überschreibt `config.js` vollständig, der Wert würde dort
  stillschweigend verlorengehen.

---

## 2026-07-15 – Projekt aufgesetzt

- **Wer:** (Name eintragen), mit Claude
- **Was:** Dokumentation, Datenmodell, SQL-Skripte, Workflows für Backup und Keep-Alive angelegt
- **Warum:** Diensteinteilung lief über Tabellen und war unübersichtlich
- **Folgen:** Phase 1 (Supabase aufsetzen) steht an, siehe `06-roadmap.md`

---

<!--
Beispiel, wie ein späterer Eintrag aussieht:

## 2026-11-03 – Aufbau braucht jetzt 3 Personen

- Wer: Anna
- Was: `bereiche.min_personen` für "Aufbau" von 2 auf 3 gesetzt (sql/04_aufbau_min3.sql)
- Warum: Die neue Bühne ist zu zweit nicht zu stemmen
- Folgen: Mehrere bestehende Termine stehen jetzt auf rot – das ist korrekt, nicht kaputt
-->
