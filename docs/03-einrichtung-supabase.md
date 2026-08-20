# 03 – Supabase einrichten

Zeitbedarf: ca. 20 Minuten. Keine Kreditkarte nötig.

## 1. Konto und Projekt

1. Auf [supabase.com](https://supabase.com) mit dem GitHub-Konto anmelden.
2. **New Project**:
   - Name: `dienstplan-gemeinde`
   - Datenbank-Passwort: erzeugen lassen und sicher notieren. Du brauchst es fürs Backup (Secret `SUPABASE_DB_URL`). Es ist nicht dasselbe wie das Team-Passwort. Kein Passwortmanager nötig – es lässt sich im Dashboard jederzeit zurücksetzen, danach aber das Secret nachziehen (siehe `docs/09`).
   - Region: **Frankfurt (eu-central-1)** – nächstgelegen und Daten bleiben in der EU.
3. Zwei bis drei Minuten warten.

## 2. Tabellen anlegen

Links **SQL Editor** → **New query**. Nacheinander, jeweils einfügen und **Run**:

1. Inhalt von `sql/01_schema.sql` → Tabellen und die Ansicht `v_besetzung`
2. Inhalt von `sql/02_seed.sql` → die sieben Bereiche, Testpersonen, Sonntage
3. Inhalt von `sql/03_rls.sql` → **Zugriffsschutz. Nicht überspringen.**

Kontrolle: Unter **Table Editor** stehen fünf Tabellen; `bereiche` enthält sieben Zeilen.

## 3. Team-Konto anlegen

Das ist das eine gemeinsame Login, das alle benutzen.

1. **Authentication** → **Providers** → **Email**: sicherstellen, dass Email aktiviert ist.
2. Bei **Confirm email** den Schalter **ausschalten** – sonst wartet das Konto auf eine Bestätigungsmail, die niemand bekommt.
3. **Authentication** → **Users** → **Add user** → **Create new user**:
   - E-Mail: z. B. `team@unsere-gemeinde.de` (muss nicht wirklich existieren, aber eine echte Adresse ist praktischer)
   - Passwort: etwas Merkbares, das man am Telefon durchgeben kann – z. B. drei Wörter mit Zahl: `Sonntag-Kaffee-7`
   - **Auto Confirm User** anhaken
4. Passwort notieren. **Dieses Passwort bekommen alle Mitarbeiter.**

## 4. Zugangsdaten für die App holen

**Project Settings** → **API**. Du brauchst zwei Werte:

| Wert | wohin |
|---|---|
| **Project URL** (`https://xxxx.supabase.co`) | in `config.js` |
| **anon public key** (langer Text) | in `config.js` |
| **Session-Pooler-Verbindung** (Knopf **Connect** → *Session pooler*) | für SQL-Ausführung und Backup |

⚠️ Der **`service_role` key** darf **niemals** in `config.js` oder ins Repo. Der hebelt allen Schutz aus. Er wird nur beim Backup gebraucht, dort als GitHub-Secret.

Der `anon public key` dagegen **darf** öffentlich sein – dafür ist er gemacht. Er allein gibt niemandem Zugriff, weil RLS Anonyme aussperrt. Genau deshalb ist Schritt 2.3 nicht optional.

## 5. Kontrolle des Schutzes

Im SQL Editor:

```sql
select tablename, rowsecurity from pg_tables where schemaname = 'public';
```

Bei allen fünf Tabellen muss `rowsecurity` auf `true` stehen. Wenn irgendwo `false` steht: `03_rls.sql` nochmal ausführen.

## 6. Erledigt-Haken

- [ ] Projekt in Frankfurt angelegt
- [ ] Datenbank-Passwort notiert (oder bewusst nicht – im Dashboard rücksetzbar)
- [ ] Alle drei SQL-Skripte gelaufen
- [ ] RLS-Prüfung zeigt überall `true`
- [ ] Team-Konto angelegt, Confirm-Email aus, Passwort notiert
- [ ] Project URL + anon key notiert
- [ ] `service_role` key **nirgends** in Dateien oder Commits (im Dashboard jederzeit abrufbar – keine Zweitkopie anlegen)

Weiter mit `04-einrichtung-github.md`.
