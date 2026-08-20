# 09 – Zugänge und Übergabe

Für die Vertretung und für jeden, der das Projekt später übernimmt.
Beantwortet zwei Fragen: **Welche Zugänge brauche ich?** und **Wie arbeite ich
damit, ohne Entwickler zu sein?**

In dieser Datei stehen **keine Passwörter und keine Schlüssel** – dieses Repo ist
öffentlich. Hier stehen nur Fundorte und Wege.

---

## Teil A – Die drei Zugänge

| # | Zugang | Wofür | Wer richtet ein |
|---|---|---|---|
| 1 | **GitHub-Konto**, Collaborator auf `poamoa/dienstplan` | App-Dateien, Workflows, Secrets | Joel |
| 2 | dasselbe Konto auf `poamoa/dienstplan-backups` (privat) | nächtliche Datenbank-Dumps | Joel |
| 3 | **Supabase-Konto**, Mitglied der Organisation mit Projekt `kztbppgwgptyeqnxnoab` | Datenbank, SQL-Editor, API-Keys, Team-Konto | Joel |

Für das Supabase-Konto reicht die kostenlose Anmeldung – am einfachsten per
GitHub-Login, dann ist es dasselbe Konto wie oben und ohne zusätzliches Passwort.

**Es gibt bewusst keinen gemeinsamen Passwortmanager** (entschieden 2026-08-21).
Wer diese drei Zugänge hat, braucht keinen: Der secret key ist im Dashboard
abrufbar, DB- und Team-Passwort sind dort zurücksetzbar. Nichts davon muss
irgendwo doppelt liegen – man muss nur die Abläufe kennen, und die stehen in
Teil B. Das Team-Passwort der App kennst du ohnehin als Nutzer; es ist bei rund
32 Leuten im Umlauf und kein echtes Geheimnis.

**Prüfliste – habe ich wirklich alles?** Alle drei müssen mit *Ja* beantwortbar
sein, sonst ist die Vertretung nur auf dem Papier vorhanden:

- [ ] Ich kann `poamoa/dienstplan` auf GitHub öffnen **und** einen Commit pushen.
- [ ] Ich kann `poamoa/dienstplan-backups` öffnen und sehe dort Dump-Dateien.
- [ ] Ich kann das Supabase-Projekt öffnen und im **SQL Editor** ein
      `select count(*) from personen;` ausführen.

---

## Teil B – Wo liegt was, und was ist wiederherstellbar

Grundregel, die viel Panik erspart: **Nichts davon ist unwiederbringlich.** Wer
Zugang 1–3 hat, kann jedes Geheimnis selbst neu erzeugen. Genau deshalb gibt es
keinen Passwortmanager – es gäbe nichts zu speichern, was nicht ohnehin
beschaffbar wäre. Was du stattdessen brauchst, ist die richtige Reihenfolge; die
steht in dieser Tabelle und der Warnung darunter.

| Sache | Wo | Auslesbar? | Wenn weg |
|---|---|---|---|
| Projekt-Ref, URL, publishable key | `config.js` im Repo | ja, öffentlich | steht im Repo |
| `service_role` / secret key | Supabase → Project Settings → API Keys | **ja, jederzeit** | dort neu erzeugen |
| Datenbank-Passwort | Supabase → Project Settings → Database | nein, nur zurücksetzen | siehe Warnung unten |
| Team-Passwort der App | Supabase → Authentication → Users → `team@gemeinde.de` | nein, nur neu setzen | kennst du als Nutzer; sonst neu setzen **und an alle ~32 Leute verteilen** |
| `BACKUP_DEPLOY_KEY` | GitHub-Secret in `poamoa/dienstplan` | nein (write-only) | neues SSH-Schlüsselpaar, siehe `docs/05` |
| `SUPABASE_DB_URL` | GitHub-Secret in `poamoa/dienstplan` | nein (write-only) | aus Pooler-URI + DB-Passwort neu bauen |

> ⚠️ **Falle beim DB-Passwort.** Es steckt im Secret `SUPABASE_DB_URL`, mit dem
> das nächtliche Backup läuft. Nach einem Reset ist das Secret veraltet und
> `backup.yml` schlägt fehl – **still**, es merkt niemand, bis das Backup
> gebraucht wird. Reihenfolge deshalb immer:
>
> 1. Supabase → Connect → **Session pooler** → URI kopieren, neues Passwort einsetzen
> 2. `gh secret set SUPABASE_DB_URL --repo poamoa/dienstplan`
> 3. `gh workflow run backup.yml --repo poamoa/dienstplan` und Ergebnis anschauen

Die Supabase-Oberfläche wird regelmäßig umgebaut; die Pfade sind Stand
2026-08. Wenn etwas nicht dort liegt, hilft die Suche im Dashboard.

---

## Teil C – Arbeiten mit Claude Code

Der Plan für die Zukunft: Wartung passiert **im Gespräch mit Claude Code**, nicht
durch Handarbeit im Code. Das funktioniert, weil dieses Repo alles enthält, was
Claude dafür wissen muss.

### Einmal einrichten

1. Repo klonen: `git clone https://github.com/poamoa/dienstplan.git`
2. Claude Code installieren.
3. **Claude Code immer in diesem Ordner starten.** Nur dann liest es die
   `CLAUDE.md` und die Skills unter `.claude/skills/`. Ohne das rät es.

### Was automatisch gilt

`CLAUDE.md` im Projektwurzelverzeichnis wird bei jedem Start mitgelesen. Darin
stehen die **eisernen Regeln** (nur Vornamen in der Datenbank, RLS bleibt an,
`service_role` key niemals in Dateien, kein Framework, Regeln sind Daten,
nichts löschen, DB-Änderungen nur als neues nummeriertes SQL-Skript, jede
Änderung ins Änderungslog). Du musst sie nicht auswendig kennen – aber wenn
Claude vorschlägt, eine davon zu brechen, ist das ein Stoppschild.

Fünf Skills stehen bereit:

| Skill | Wofür |
|---|---|
| `dienstplan-diagnose` | **Etwas ist kaputt.** Greift auch bei vager Beschreibung. |
| `dienstplan-wartung` | **Etwas soll geändert werden** – neue Bereiche, Regeln, Anzeige. |
| `/neues-jahr` | Jahresroutine – ⚠️ siehe Falle in Teil E |
| `/app-bauen` | Baut die App neu nach `docs/08`. Nur im Notfall. |
| `/setup` | Ersteinrichtung von Null. Braucht man nie wieder. |

Diagnose und Wartung greifen von selbst, wenn du das Problem beschreibst. Du
musst sie nicht aufrufen.

### Wie man gut promptet

- **Ziel beschreiben, nicht Lösung.** „Die Helfer beim Kinderdienst sollen sich
  ohne Präferenz eintragen können" ist besser als „ändere Zeile 400 in app.js".
  Claude kennt die Struktur, du kennst die Gemeinde.
- **Fehlermeldungen wörtlich einfügen** oder Screenshot. „Geht nicht" kostet drei
  Rückfragen.
- **Sagen, was du schon versucht hast**, sonst wird es wiederholt.
- **Nachfragen, wenn du etwas nicht verstehst.** Der Betreuer dieses Projekts ist
  ausdrücklich kein Entwickler; die `CLAUDE.md` weist Claude an, in einfachem
  Deutsch mit konkreten Klickpfaden zu erklären. Wenn eine Antwort nach Jargon
  klingt, verlang eine einfachere.
- **Am Ende um den Änderungslog-Eintrag bitten**, falls er nicht von selbst kommt
  (Regel 8). Ohne ihn ist die Arbeit nicht fertig.

### Wer macht was

Claude kann selbst: Dateien ändern, committen, pushen, GitHub-Secrets setzen,
Workflows starten, Logs lesen, SQL-Skripte schreiben.

**Du musst selbst machen** – dafür gibt es keinen Weg über die Kommandozeile:

- Alles im **Supabase-Dashboard**: SQL-Skripte ausführen, Passwörter zurücksetzen,
  Mitglieder einladen, Keys ansehen.
- Entscheidungen, die die Gemeinde betreffen (neue Bereiche, wer darf was).
- Das Ergebnis **im Browser anschauen**. Claude sieht die Seite nicht.

Der bewährte Weg für Datenbankänderungen („Weg B"): Claude schreibt ein neues
Skript in `sql/`, du kopierst es ins Supabase-Dashboard → SQL Editor → Run. Das
braucht kein Passwort in der Sitzung und hat bisher zuverlässig funktioniert.

### Die wichtigste Einschränkung

**Es gibt keine Testumgebung. Jede Änderung geht sofort live**, für alle ~32
Leute. Deshalb vor jedem Push:

1. `index.html` lokal im Browser öffnen (läuft auch von der Festplatte)
2. Anmeldung, „Meine Dienste", Selbsteintragung, Ampel einmal durchklicken
3. Privates Fenster ohne Anmeldung: es dürfen **keine** Daten sichtbar sein

Punkt 3 ist der wichtigste – er prüft, dass die Datenbank-Absicherung (RLS) noch
greift.

---

## Teil D – Fertige Prompts für typische Fälle

Wörtlich benutzbar. Claude zieht sich den Rest aus dem Repo.

| Situation | Prompt |
|---|---|
| Seite ist leer / Fehler | `Die Dienstplan-App zeigt nichts an. Fehlermeldung: "<wörtlich einfügen>". Bitte diagnostizieren.` |
| Neue Person | `Bitte <Vorname> als neue Person anlegen, Präferenzen: <Bereiche>. Gib mir das SQL für den Supabase-Editor.` |
| Person hört auf | `<Vorname> macht nicht mehr mit. Bitte inaktiv setzen – nicht löschen.` |
| Neuer Dienstbereich | `Wir brauchen einen neuen Bereich "<Name>", Mindestbesetzung <n>, Leiter nötig: ja/nein.` |
| Termine fürs neue Jahr | `Bitte die Termine für die nächste Saison anlegen. Achtung: 1. und 3. Sonntag, mit Winter- und Sommerpause – siehe sql/04 und die Altlast-Warnung in PROJECT.md.` |
| Team-Passwort wechseln | `Wir wollen das Team-Passwort wechseln. Führ mich durch die Schritte inklusive dem, was ich der Gemeinde schicken muss.` |
| Backup prüfen | `Läuft das nächtliche Backup noch? Bitte die letzten Workflow-Läufe prüfen und ins Backup-Repo schauen.` |
| Daten zurückholen | `Wir haben Daten verloren. Bitte den letzten Dump aus dienstplan-backups holen und mir erklären, wie ich ihn einspiele.` |
| Projekt pausiert | `Supabase sagt "project paused". Was jetzt?` |
| Einarbeitung | `Ich übernehme dieses Projekt. Verschaff mir einen Überblick: Was läuft hier, was muss ich regelmäßig tun, was ist gerade offen?` |

Der letzte ist der beste Einstieg für den ersten Tag.

---

## Teil E – Bekannte Fallen

- **`/neues-jahr` passt nicht mehr zum Rhythmus.** Der Skill legt *alle* Sonntage
  der nächsten 12 Monate an. Der reale Plan ist aber **1. und 3. Sonntag** mit
  Winter- und Sommerpause (siehe `sql/04`). Vor der nächsten Jahresplanung
  anpassen, sonst entstehen falsche Termine. Ebenso ist `docs/05` an der Stelle
  „Jährlich im Herbst … `sql/02_seed.sql`" veraltet.
- **DB-Passwort-Reset bricht das Backup**, siehe Warnung in Teil B.
- **Supabase pausiert kostenlose Projekte bei Inaktivität.** Dagegen läuft
  `keepalive.yml`. Wenn die App nach längerer Zeit tot ist, ist das der erste
  Verdacht – im Dashboard wieder aufwecken und prüfen, ob der Workflow noch läuft.
- **`ist_admin` ist nur Kosmetik.** Der Admin-Zugang ist eine versteckte Geste
  (5× auf den eigenen Namen tippen), kein echter Schutz. Bewusst so entschieden –
  wer das für Sicherheit hält, baut auf Sand.
- **Das Team-Passwort ist kein Geheimnis**, sondern eine Hürde gegen
  Zufallsbesucher. ~32 Leute kennen es. Echte Geheimnisse sind DB-Passwort und
  secret key.

---

## Teil F – Nicht ohne Rücksprache mit dem Betreuer

- Personen oder Termine **löschen** (es gibt `personen.aktiv` und
  `termine.abgesagt`)
- Das Datenmodell umbauen oder RLS-Policies lockern
- Ein Framework oder einen Build-Prozess einführen
- Das Supabase-Projekt oder eines der Repos löschen

---

## Verwandte Dokumente

- `docs/05-betrieb-wartung.md` – Routineaufgaben, Backup zurückspielen, Passwortwechsel
- `docs/02-datenmodell.md` – Tabellen und Besetzungsregeln
- `docs/07-aenderungslog.md` – was wann warum geändert wurde
- `PROJECT.md` – aktueller Stand und offene Punkte
