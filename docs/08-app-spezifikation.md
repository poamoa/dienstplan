# 08 – App-Spezifikation (Vorgabe für /app-bauen)

Verbindliche Vorgabe für `index.html`, `app.css`, `app.js`. `config.js` entsteht im Setup.

## Technik

- Vanilla HTML/CSS/JS, kein Framework, kein Build. Supabase-Client per CDN:
  `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
- `config.js` wird vor `app.js` eingebunden und liefert `window.CONFIG`.
- Mobile-first: Basisbreite 360 px, alles per Daumen bedienbar, Schrift min. 16 px.
- Deutsch in Oberfläche und Fachbegriffen im Code (`bereich`, `einteilung`).
- Fehler niemals verschlucken: jede fehlgeschlagene Supabase-Operation zeigt eine rote Meldungsleiste mit verständlichem Text.

## Anmeldefluss

1. Ohne Session: nur Passwortfeld ("Team-Passwort") + Knopf. Die E-Mail des Team-Kontos steht fest in `app.js` (Konstante `TEAM_EMAIL`), Nutzer geben nur das Passwort ein. `supabase.auth.signInWithPassword`.
2. Mit Session, ohne gewählte Person: Namensliste (nur `personen.aktiv = true`, alphabetisch). Auswahl landet in `localStorage.dienstplan_person_id`.
3. Danach: App mit Fußzeile „Angemeldet als <Name> · wechseln · abmelden".

## Navigation

Drei Reiter unten (fixiert): **Meine Dienste** · **Eintragen** · **Plan**.
Ist die gewählte Person Admin (`personen.ist_admin`), erscheint ein vierter Reiter **Verwaltung**.

## Reiter 1: Meine Dienste

- Kommende eigene Einteilungen (ab heute), chronologisch: `So 26.07. · Kinderdienst Schulkinder` + Leiter-Abzeichen, falls `als_leiter`.
- Austragen-Knopf je Eintrag. Vorher `confirm`; wenn dadurch der Status des Bereichs auf rot fällt (per `v_besetzung` prüfen), lautet der Text: „Dadurch ist der Dienst unterbesetzt. Trotzdem austragen? Bitte sag deinem Bereichsleiter Bescheid."
- Leerzustand: „Du bist aktuell für keine Dienste eingetragen."

## Reiter 2: Eintragen

- Oben Hinweisleiste mit Link „Meine Präferenzen", öffnet ein Overlay: Checkbox je Bereich (+ Unter-Checkbox „kann leiten" nur bei Bereichen mit `braucht_leiter`), Auswahl „mache ich gern / geht auch" → Tabelle `praeferenzen`.
- Darunter die nächsten 8 Termine. Je Termin nur die Bereiche der eigenen Präferenzen, mit Status-Punkt (siehe Ampel) und Belegung „2/2 · Leiter fehlt".
- Knopf „Eintragen" (bei `braucht_leiter` und `kann_leiten`: Wahl „als Leiter / als Mitarbeiter") → Insert in `einteilungen` mit `quelle='selbst'`.
- Bereits eingetragen → Knopf wird „Austragen".
- Keine Präferenzen gesetzt → freundlicher Hinweis mit Link aufs Overlay statt leerer Seite.

## Reiter 3: Plan (für alle lesbar)

- Nächste 8 Termine als Karten. Pro Karte alle 7 Bereiche in `sortierung`-Reihenfolge: Kürzel, Namen der Eingeteilten (Leiter mit ★), Status-Punkt.
- Reine Leseansicht.

## Reiter 4: Verwaltung (nur Admin)

- **Ampelübersicht:** nächste 12 Termine, rote zuerst gruppiert („Braucht Aufmerksamkeit"), dann chronologisch alle.
- Termin antippen → Detail: je Bereich die Eingeteilten mit Entfernen-Knopf und ein „+ Person"-Dropdown. Sortierung des Dropdowns: passende Präferenz mit `gewichtung=1`, dann `gewichtung=2`, dann – abgetrennt mit Hinweis „ohne Präferenz" – alle übrigen Aktiven. Bereits an diesem Termin (egal welcher Bereich) Eingeteilte werden markiert („bereits im Aufbau"). Insert mit `quelle='admin'`.
- Bei `braucht_leiter`: Umschalter je Person „ist hier Leiter" (`als_leiter`).
- **Personen:** Liste, Anlegen (nur Name + Admin-Häkchen), Aktiv-Schalter. Kein Löschen.
- **Termine:** Sondertermin anlegen (Datum, Titel), Termin absagen (`abgesagt=true`).

## Ampel (überall gleich)

Aus `v_besetzung.status`: `rot` = ●, `gelb` = ●, `gruen` = ● (Farben s. u.). Zusätzlich Textform für Barrierefreiheit („unterbesetzt / knapp / besetzt") als `title` und daneben in Klein.

## Gestaltung

- Ruhig und hell: Hintergrund #f7f7f5, Karten weiß mit 12 px Radius und feinem Schatten, Akzentfarbe ein gedecktes Blau (#3b5b7c). Ampel: #c0392b / #d9a441 / #4a8c5c.
- Systemschrift (`system-ui`). Keine Icon-Bibliothek – Unicode (★ ● ＋) genügt.
- Kein Ladespinner-Zoo: eine dezente „Lade…"-Zeile pro Liste reicht.

## Datenzugriffe (Referenz)

- Termine + Status: `from('v_besetzung').select('*').gte('datum', heute)`
- Einteilungen mit Namen: `from('einteilungen').select('*, personen(name), bereiche(name,kuerzel), termine(datum,titel)')`
- Alles nach dem Schreiben neu laden – kein lokaler Zustandsabgleich, die Datenmengen sind winzig.

## Abnahmekriterien

1. Anmeldung mit Team-Passwort funktioniert; falsches Passwort → verständliche Meldung.
2. Ohne Anmeldung sind keinerlei Daten sichtbar (privates Fenster testen).
3. Selbsteintragung erscheint nach Neuladen bei „Meine Dienste" und im Plan.
4. Kinderdienst mit 2 Personen ohne Leiter → rot; mit Leiter + 1 → gelb; mit Leiter + 2 → grün.
5. Admin-Dropdown zeigt Präferenz-Personen zuerst.
6. Auf 360 px Breite nichts abgeschnitten, keine horizontale Scrollleiste.
7. Konsole ohne Fehler beim Durchklicken aller Reiter.
