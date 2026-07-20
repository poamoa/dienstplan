---
name: dienstplan-diagnose
description: Fehlersuche bei der Gemeinde-Dienstplan-App (GitHub Pages + Supabase). Nutze diesen Skill sofort, wenn der Dienstplan nicht funktioniert — etwa bei "die Seite ist leer", "keiner sieht seine Dienste", "Fehler 401", "project paused", "meine Änderung kommt nicht an", "die Ampel ist falsch", "jemand hat aus Versehen was gelöscht", "das Backup läuft nicht" oder irgendeiner Fehlermeldung rund um Supabase, GitHub Pages oder die Diensteinteilung. Auch bei vager Beschreibung wie "irgendwas stimmt nicht mit dem Plan" greifen.
---

# Dienstplan – Fehlersuche

Wenn dieser Skill gebraucht wird, steht meist jemand unter Zeitdruck, weil am Sonntag der Plan hängt. Also: schnell zur wahrscheinlichsten Ursache, keine langen Vorreden.

## Zuerst fragen (kurz, maximal drei Punkte)

1. **Was genau siehst du?** Wörtliche Fehlermeldung, oder Screenshot.
2. **Betrifft es alle oder nur dich?** Ein Gerät = Cache oder Anmeldung. Alle = Datenbank oder Deployment.
3. **Was war die letzte Änderung?** Blick in `docs/07-aenderungslog.md`. Über 80 % der Fehler folgen unmittelbar auf eine Änderung.

## Die Verdächtigen, nach Häufigkeit

### 1. Supabase-Projekt pausiert

**Symptom:** Bei allen leer, Netzwerkfehler, im Dashboard steht „Project paused".
**Ursache:** Sieben Tage ohne Zugriff — der kostenlose Plan pausiert dann automatisch.
**Lösung:** Supabase-Dashboard → **Restore**. Nach ca. 30 Sekunden läuft es. Die Daten sind vollständig da, nichts geht verloren.
**Danach:** Unter GitHub → **Actions** prüfen, warum `keepalive.yml` nicht lief. Häufigster Grund: GitHub deaktiviert geplante Actions in Repos ohne Commits der letzten 60 Tage. Dann dort einmal **Enable workflow** klicken.

### 2. Fehler 401 / „permission denied" / keine Daten trotz Anmeldung

**Ursache A:** Nicht angemeldet — Sitzung abgelaufen. Abmelden, Team-Passwort neu eingeben.
**Ursache B:** RLS-Policies fehlen oder wurden überschrieben. Prüfen im SQL-Editor:

```sql
select tablename, rowsecurity from pg_tables where schemaname='public';
select tablename, policyname, roles, cmd from pg_policies where schemaname='public';
```

Wenn `rowsecurity` false ist oder Policies fehlen: `sql/03_rls.sql` erneut ausführen.
**Ursache C:** Eine neue Tabelle wurde ohne Policies angelegt. Dann ist sie für alle gesperrt.

### 3. Änderung ist auf GitHub, aber nicht in der App

Der Reihe nach prüfen:
1. GitHub → **Actions**: Ist das Pages-Deployment grün? Dauert ein bis zwei Minuten.
2. Hart neu laden: Strg+Shift+R (Desktop) bzw. Seite schließen und neu öffnen (Handy).
3. Falls es an der Handy-Kachel liegt: Kachel löschen und neu anlegen.

### 4. Ampel zeigt etwas Unerwartetes

Meist **kein** Fehler, sondern korrektes Verhalten. Die Regel aus `docs/02-datenmodell.md`:

- Ein Kinderdienst mit 5 Personen, aber **ohne** jemanden mit `als_leiter = true` ist **rot**. Das ist Absicht.
- **Gelb** heißt „Minimum erreicht, kein Puffer", nicht „Fehler".

Nachprüfen mit:
```sql
select * from v_besetzung where datum = 'JJJJ-MM-TT';
```

Wenn die Werte falsch aussehen: `bereiche.min_personen` und `bereiche.braucht_leiter` prüfen — dort wird die Regel eingestellt.

### 5. Jemand hat versehentlich Daten gelöscht

**Erst innehalten, nicht sofort ein Backup drüberbügeln.** Ein Voll-Restore vernichtet alles, was seit der Nacht passiert ist.

Besser:
1. Feststellen, **was genau** fehlt (welche Personen, welche Einteilungen).
2. Passende Datei aus `backups/` öffnen, die betreffenden `INSERT`-Zeilen herausziehen.
3. Nur diese Zeilen im SQL-Editor ausführen.

Ein Voll-Restore nur, wenn wirklich alles weg ist.

### 6. Backup-Action rot

Übliche Ursachen:
- `SUPABASE_DB_URL` falsch oder Datenbank-Passwort geändert → Secret mit frischer Session-Pooler-Verbindung aktualisieren (Supabase → Connect → Session pooler)
- Projekt war pausiert → erst restoren, dann Action manuell erneut starten

## Fehler finden, wenn nichts davon passt

Browser-Konsole öffnen lassen (Desktop: F12 → **Console**), Seite neu laden, rote Meldungen vorlesen lassen. Ebenso den Reiter **Network**: Welcher Aufruf schlägt fehl, mit welchem Status?

Das ist der schnellste Weg von „irgendwas ist kaputt" zu einer konkreten Ursache. Bitte dem Nutzer den Klickpfad nennen, nicht voraussetzen, dass er die Entwicklerwerkzeuge kennt.

## Nach der Reparatur

Zwei Dinge, immer:
1. **Eintrag in `docs/07-aenderungslog.md`** — was war kaputt, was hat geholfen. Beim nächsten Mal spart das die halbe Suche.
2. **Falls es eine strukturelle Ursache war** (fehlende Policy, kein Keep-Alive, falscher Wert), vorschlagen, wie es dauerhaft verhindert wird — nicht nur den Einzelfall flicken.

## Ton

Ruhig und konkret. Keine Schuldzuweisungen — wer „aus Versehen alles gelöscht" hat, weiß das selbst schon. Erst wieder zum Laufen bringen, dann über Ursachen reden.
