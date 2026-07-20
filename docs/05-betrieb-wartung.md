# 05 – Betrieb und Wartung

Der Teil, den man gern überspringt und der später wehtut.

## Einmalig einrichten: die zwei Automatiken

Beide liegen unter `.github/workflows/`. Sie brauchen vier Secrets im Repo:

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Name | Wert | Woher |
|---|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | anon public key | ebenda |
| `SUPABASE_DB_URL` | Session-Pooler-Verbindung (`postgresql://...pooler.supabase.com:5432/postgres`) | Supabase → Connect → **Session pooler**. Wichtig: den Pooler nehmen, nicht `db.xxxx...` – letzterer ist oft nur per IPv6 erreichbar und schlägt in GitHub Actions fehl. |

`scripts/setup.sh` bzw. der `/setup`-Skill setzen diese Secrets automatisch.

Danach unter **Actions** beide Workflows einmal manuell starten (**Run workflow**) und prüfen, dass sie grün durchlaufen.

- **keepalive.yml** – alle 3 Tage ein Ping, damit Supabase das Projekt nicht pausiert
- **backup.yml** – jede Nacht ein Export nach `backups/`, die letzten 30 bleiben liegen

> GitHub schaltet geplante Actions in Repos ab, in denen 60 Tage lang niemand etwas committet. Wenn ihr die App aktiv nutzt, fällt das nicht auf – aber es ist der Grund, warum die Quartals-Kontrolle unten wichtig ist.

## Wiederkehrende Aufgaben

| Wann | Was | Dauer |
|---|---|---|
| **Wöchentlich** (Bereichsleiter) | Rote Termine der nächsten 4 Wochen anschauen, Lücken füllen | 5 Min |
| **Quartalsweise** (technisch Verantwortlicher) | Unter **Actions** prüfen: laufen Backup und Keep-Alive grün? Liegen frische Dateien in `backups/`? | 5 Min |
| **Jährlich, im Herbst** | Termine fürs nächste Jahr anlegen: den Sonntags-Block aus `sql/02_seed.sql` erneut im SQL-Editor ausführen | 2 Min |
| **Jährlich** | Ausgeschiedene Personen auf `aktiv = false` setzen, neue anlegen | 10 Min |
| **Bei Bedarf** | Team-Passwort wechseln (siehe unten) | 5 Min |

## Team-Passwort wechseln

Fällig, wenn jemand im Streit geht oder das Passwort offensichtlich zu weit gestreut ist.

Supabase → **Authentication** → **Users** → das Team-Konto → **Reset password** bzw. neues Passwort setzen. Dann im Team neu verteilen. Die App fragt beim nächsten Öffnen erneut.

## Wenn etwas kaputt ist

Die häufigsten Fälle stehen in `.claude/skills/dienstplan-diagnose/SKILL.md`. Kurzfassung:

| Symptom | Wahrscheinliche Ursache |
|---|---|
| Seite lädt, aber keine Daten, Fehler 401 | Nicht angemeldet, oder RLS-Policies fehlen |
| Alles leer, Fehler „Project paused" | Supabase-Dashboard → Restore. Danach: warum lief das Keep-Alive nicht? |
| Änderung auf GitHub sichtbar, aber nicht in der App | Browser-Cache. Seite hart neu laden (Strg+Shift+R) |
| Jemand hat versehentlich alles gelöscht | Backup aus `backups/` einspielen, siehe unten |

## Backup zurückspielen

1. Neueste passende Datei aus `backups/` herunterladen.
2. Supabase → SQL Editor. **Zuerst** prüfen, was fehlt – meist reicht es, einzelne `INSERT`-Zeilen aus dem Backup zu kopieren.
3. Nur im Notfall komplett zurückspielen: Das überschreibt alles seit dem Backup-Zeitpunkt.

Wenn du unsicher bist: nichts überschreiben, sondern die Backup-Datei und die Frage in einen Claude-Chat mit dem Skill `dienstplan-diagnose` geben.

## Der wichtigste Punkt: Vertretung

Trage in der `README.md` **zwei Namen** ein. Ein Projekt, das nur eine Person versteht, ist ein Projekt mit Ablaufdatum.

Die Vertretung braucht:
- Zugriff aufs GitHub-Repo (als Collaborator)
- Zugriff aufs Supabase-Projekt (Organization → Members)
- Das Datenbank-Passwort im gemeinsamen Passwortmanager
- Diese Doku – die reicht, um alles neu aufzusetzen

## Was tun, wenn ihr das Projekt beerdigen wollt

Auch das gehört zu einem sauberen Plan. Der letzte Export in `backups/` ist eine simple SQL-Datei, aus der sich jederzeit eine Tabelle machen lässt. Niemand ist gefangen.
