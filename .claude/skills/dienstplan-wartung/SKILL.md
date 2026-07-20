---
name: dienstplan-wartung
description: Änderungen an der Gemeinde-Dienstplan-App (GitHub Pages + Supabase) planen und umsetzen. Nutze diesen Skill immer, wenn es um den Dienstplan, die Diensteinteilung, Dienstbereiche wie Kinderdienst/Aufbau/Abbau/Lobpreisleitung/Sprecher/Milch und Wasser, Präferenzen von Mitarbeitern, Besetzungsregeln, die Ampel-Anzeige, neue Funktionen oder Änderungen an index.html/app.js/app.css/config.js oder an den Tabellen personen, bereiche, praeferenzen, termine, einteilungen geht — auch wenn der Nutzer nur beiläufig "kannst du mal eben..." fragt und das Projekt nicht namentlich nennt.
---

# Dienstplan – Wartung und Änderungen

Dieser Skill hilft dabei, an einer bestehenden, laufenden App zu arbeiten. Das ist etwas anderes als etwas Neues zu bauen: Es gibt echte Nutzer, echte Daten und eine Struktur, die aus guten Gründen so ist, wie sie ist.

## Zuerst: Kontext lesen

Vor jeder Änderung diese Dateien im Projekt lesen (der Nutzer hat sie meist im Projekt oder lädt sie hoch):

- `docs/00-entscheidung-architektur.md` — warum die Architektur so aussieht
- `docs/02-datenmodell.md` — Tabellen und Regeln
- `docs/07-aenderungslog.md` — was zuletzt passiert ist

Wenn diese Dateien nicht vorliegen: danach fragen, statt zu raten. Eine Änderung ohne Kenntnis des Datenmodells erzeugt Folgeschäden.

## Die Grundpfeiler – nicht ohne ausdrückliche Zustimmung antasten

Diese Punkte sind bewusst entschieden. Sie sind änderbar, aber nur bewusst und mit Eintrag im Änderungslog:

1. **Nur Vornamen in der Datenbank.** Keine Telefonnummern, Adressen, Geburtsdaten, Fotos. Die Datensparsamkeit ersetzt einen Teil der Zugriffssicherung. Wenn jemand um ein Feld „Telefonnummer" bittet: darauf hinweisen und nachfragen, ob das wirklich sein muss.
2. **RLS bleibt an.** Wenn eine neue Tabelle entsteht, braucht sie sofort Policies analog zu `sql/03_rls.sql`. Eine Tabelle ohne RLS ist im Internet frei lesbar und beschreibbar.
3. **Der `service_role` key gehört nie in Client-Code oder ins Repo.** Nur `anon key` in `config.js`.
4. **Kein Build-Prozess.** Kein npm, kein Bundler, kein React. Wer die App pflegt, ist kein Vollzeit-Entwickler. Alles läuft über CDN-Einbindung und normale Dateien.
5. **Regeln stehen in Daten, nicht im Code.** Mindestbesetzung und Leiterpflicht liegen in der Tabelle `bereiche`. Wenn jemand eine Regeländerung will, prüfe zuerst, ob ein Wert in der Datenbank reicht.
6. **Nichts löschen, deaktivieren.** `personen.aktiv = false`, `termine.abgesagt = true`. Löschen zerreißt die Historie.
7. **Vier Dateien.** `index.html`, `app.css`, `app.js`, `config.js`. Neue Dateien nur, wenn `app.js` unübersichtlich wird — dann sauber trennen und in `docs/00` begründen.

## Ablauf einer Änderung

### 1. Ist es überhaupt eine Code-Änderung?

Sehr oft nicht. Prüfe in dieser Reihenfolge:

| Wunsch | Lösung |
|---|---|
| „Aufbau braucht jetzt 3 Leute" | `bereiche.min_personen` ändern — SQL, kein Code |
| „Neue Person" / „X ist ausgeschieden" | Über die App-Oberfläche, gar keine Änderung |
| „Sprecher soll auch einen Leiter brauchen" | `bereiche.braucht_leiter = true` |
| „Neuer Dienstbereich Technik" | Zeile in `bereiche` — kein Code, weil die App die Bereiche dynamisch lädt |
| „Termine fürs nächste Jahr" | Sonntags-Block aus `sql/02_seed.sql` erneut ausführen |

Wenn eine dieser Antworten passt: das sagen und den Nutzer nicht in eine Programmieraufgabe schicken.

### 2. Umfang ehrlich einschätzen

Sag klar, was eine Änderung nach sich zieht. Ein Beispiel: „Kalender-Export" klingt klein, braucht aber eine iCal-Erzeugung und eine Download-Funktion — machbar, aber eine Stunde, nicht fünf Minuten. Kleinreden hilft niemandem.

Wenn der Wunsch auf der „Bewusst nie"-Liste in `docs/06-roadmap.md` steht: darauf hinweisen und fragen, ob die Entscheidung bewusst revidiert werden soll.

### 3. Datenbankänderungen als neues Skript

Niemals in der Supabase-Oberfläche klicken lassen. Stattdessen eine neue nummerierte Datei:

```
sql/04_aufbau_min3.sql
sql/05_tabelle_abwesenheiten.sql
```

Jedes Skript muss **mehrfach ausführbar** sein (`if not exists`, `on conflict do nothing`), weil erfahrungsgemäß unklar bleibt, ob es schon lief.

### 4. Code ändern

- Deutsche Beschriftungen, deutsche Variablennamen bei Fachbegriffen (`bereich`, `einteilung`) — das Team liest den Code irgendwann mit.
- Erst Handy, dann Desktop. Die meisten öffnen die App unterwegs.
- Fehler müssen sichtbar sein. Ein stiller `catch` führt dazu, dass jemand denkt, er sei eingetragen, und niemand kommt.
- Nach jeder Änderung: kann ein Kinderdienst noch ohne Leiter grün werden? Das ist der Fehler, der wehtut.

### 5. Änderungslog

**Immer** einen Eintrag in `docs/07-aenderungslog.md` vorschlagen — Datum, wer, was, warum, Folgen. Ohne diesen Schritt ist die Arbeit nicht fertig.

### 6. Was der Nutzer danach tun muss

Am Ende in einfachen Worten auflisten:
1. Diese Dateien auf GitHub ersetzen
2. Dieses SQL-Skript im Supabase SQL-Editor ausführen
3. So prüfst du, dass es geklappt hat: (konkreter Klickpfad)
4. So machst du es rückgängig, falls es schiefgeht

Punkt 4 nie vergessen. Es gibt keine Testumgebung — jede Änderung geht direkt auf das System, mit dem am Sonntag geplant wird.

## Ton

Der Nutzer ist technisch interessiert, aber kein Entwickler, und macht das ehrenamtlich neben allem anderen. Also: keine Fachbegriffe ohne Erklärung, keine langen Ausführungen, konkrete Klickpfade statt „konfiguriere die Policy entsprechend". Und wenn eine Idee mehr Ärger macht als Nutzen: das sagen, freundlich und mit Begründung.
