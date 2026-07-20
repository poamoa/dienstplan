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
