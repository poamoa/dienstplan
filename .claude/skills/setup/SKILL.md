---
name: setup
description: Führt die komplette Ersteinrichtung des Gemeinde-Dienstplans durch (Supabase-Datenbank, Team-Konto, config.js, GitHub-Repo, GitHub Pages, Secrets, Backup- und Keep-Alive-Workflows). Nutzen, wenn der Nutzer /setup eingibt, das Projekt neu aufsetzen, einrichten, installieren oder deployen will, oder wenn setup.sh fehlgeschlagen ist.
---

# Ersteinrichtung durchführen

Ziel: Vom leeren Zustand zu einer laufenden App-Grundlage, mit so wenig Handarbeit wie möglich. Der Nutzer ist kein Entwickler – führe ihn Schritt für Schritt und erkläre in einfachem Deutsch, was gerade passiert.

## Ablauf

### 1. Vorbedingungen prüfen

Prüfe `git`, `gh`, `psql`, `curl`. Fehlt etwas, biete an, es zu installieren (je nach Betriebssystem: winget/apt/brew), und erkläre in einem Satz, wofür es gebraucht wird. `psql` ist verzichtbar (Fallback: SQL-Editor im Browser), `gh` ist stark empfohlen.

### 2. Das einzige Manuelle: Supabase-Projekt

Wenn noch kein Supabase-Projekt existiert, leite den Nutzer an (Browser):
1. supabase.com → mit GitHub anmelden → **New Project**, Name `dienstplan-gemeinde`, Region **Frankfurt**, Datenbank-Passwort generieren lassen und in den Passwortmanager legen
2. Danach vier Werte kopieren lassen:
   - **Project URL** und **anon public key** (Settings → API)
   - **Session-Pooler-Verbindung** (Connect-Knopf → Session pooler; `postgresql://postgres.<ref>:...@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`)
   - **service_role key** (Settings → API) – nur temporär für Schritt 4, danach nirgends speichern

Wichtig: Immer die **Pooler**-Verbindung verwenden, nicht `db.<ref>.supabase.co` – letztere ist häufig nur per IPv6 erreichbar und schlägt lokal wie in GitHub Actions fehl.

### 3. Skript oder Schritt-für-Schritt

Bevorzugt: `bash scripts/setup.sh` ausführen und den Nutzer die abgefragten Werte eingeben lassen.

Wenn das Skript nicht läuft (z. B. Windows ohne Bash-Umgebung) oder mittendrin scheitert, führe die Schritte selbst aus – sie sind alle idempotent:

```bash
# Datenbank (dreimal, in Reihenfolge)
psql "<POOLER_URL>" -v ON_ERROR_STOP=1 -f sql/01_schema.sql
psql "<POOLER_URL>" -v ON_ERROR_STOP=1 -f sql/02_seed.sql
psql "<POOLER_URL>" -v ON_ERROR_STOP=1 -f sql/03_rls.sql
# Kontrolle: muss 0 ergeben
psql "<POOLER_URL>" -t -c "select count(*) from pg_tables where schemaname='public' and rowsecurity=false;"
```

```bash
# Team-Konto (service_role key vom Nutzer erfragen, NIE in eine Datei schreiben)
curl -X POST "<PROJECT_URL>/auth/v1/admin/users" \
  -H "apikey: <SERVICE_ROLE>" -H "Authorization: Bearer <SERVICE_ROLE>" \
  -H "Content-Type: application/json" \
  -d '{"email":"team@gemeinde.de","password":"<TEAMPASS>","email_confirm":true}'
```

Dann `config.js` schreiben (nur URL + anon key), committen, `gh repo create dienstplan --public --source=. --push`, Pages per `gh api -X POST repos/<owner>/dienstplan/pages -f "source[branch]=main" -f "source[path]=/"`, Secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_DB_URL` per `gh secret set`, beide Workflows per `gh workflow run` starten.

Ohne `psql`: Inhalt der drei SQL-Dateien anzeigen und den Nutzer sie im Supabase SQL-Editor ausführen lassen.

### 4. Abnahme

Nicht mit "fertig" enden, sondern gemeinsam prüfen:
1. Beide Workflows unter Actions grün?
2. Pages-URL lädt?
3. **Sicherheitstest:** privates Fenster ohne Anmeldung → keine Daten sichtbar. Wenn doch: sofort `sql/03_rls.sql` erneut ausführen, das ist ein echtes Problem.
4. Falls `index.html` noch nicht existiert: auf `/app-bauen` hinweisen.

### 5. Abschluss

- Eintrag in `docs/07-aenderungslog.md` schreiben (Datum, was eingerichtet wurde)
- README-Checkliste abhaken (Phasen 1, 3, 4)
- Dem Nutzer die drei Dinge nennen, die er sicher verwahren muss: Datenbank-Passwort, Team-Passwort, und dass der service_role key nirgends gespeichert wurde

## Sicherheitsregeln für diesen Skill

- Der `service_role` key darf in keiner Datei, keinem Commit und keiner Ausgabe landen, die gespeichert wird. Nach Gebrauch die Shell-Variable leeren.
- Vor jedem `git push` prüfen: `git grep -l "service_role"` muss leer sein (abgesehen von Doku-Erwähnungen).
- Kein `--force`-Push, keine Löschungen bestehender Repos ohne Rückfrage.
