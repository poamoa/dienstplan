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
