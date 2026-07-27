# 02 – Datenmodell

Fünf Tabellen. Bewusst wenige.

```
personen ──< praeferenzen >── bereiche
    │                            │
    └────< einteilungen >────────┘
                 │
              termine
```

## `personen`

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | uuid | Schlüssel |
| `name` | text | Anzeigename, z. B. "Anna M." – **keine weiteren Kontaktdaten** |
| `ist_admin` | bool | darf einteilen und verwalten |
| `aktiv` | bool | `false` = ausgeschieden. Wird nie gelöscht, sonst zerreißt die Historie |
| `erstellt_am` | timestamptz | |

## `bereiche`

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | uuid | |
| `name` | text | z. B. "Kinderdienst Schulkinder" |
| `kuerzel` | text | z. B. "KiDi-S", für die kompakte Handy-Ansicht |
| `min_personen` | int | Mindestbesetzung gesamt |
| `braucht_leiter` | bool | `true` bei beiden Kinderdiensten |
| `sortierung` | int | Reihenfolge in der Anzeige |

**Hier stellst du die Regeln ein.** Wenn Aufbau künftig 3 Leute braucht: `min_personen` auf 3 – kein Code.

## `praeferenzen`

| Feld | Typ | Bedeutung |
|---|---|---|
| `person_id` | uuid | |
| `bereich_id` | uuid | |
| `kann_leiten` | bool | Person ist in **diesem** Bereich als Leiter qualifiziert |
| `gewichtung` | int | 1 = mache ich gern, 2 = geht auch. Für die Sortierung der Admin-Vorschläge |

Schlüssel ist `(person_id, bereich_id)` – jede Kombination nur einmal.
Eine Zeile bedeutet: "Diese Person ist grundsätzlich für diesen Bereich vorgesehen." Keine Zeile = wird nicht vorgeschlagen.

## `termine`

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | uuid | |
| `datum` | date | eindeutig |
| `titel` | text | leer bei normalem Gottesdienst, sonst z. B. "Taufgottesdienst" |
| `notiz` | text | freier Hinweis für alle |
| `abgesagt` | bool | statt löschen |
| `braucht_dienste` | bool | `true` = normaler Termin mit Dienstplan/Ampel. `false` = reiner Info-/Sondertermin (Lobpreisabend, Leitertreffen, …): erscheint im Plan nur als Hinweis, taucht nicht in `v_besetzung` auf. Ergänzt in `sql/04`. |

## `einteilungen`

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | uuid | |
| `termin_id` | uuid | |
| `bereich_id` | uuid | |
| `person_id` | uuid | |
| `als_leiter` | bool | füllt diese Person hier die Leiterrolle? |
| `quelle` | text | `selbst` oder `admin` – damit man sieht, wer sich gemeldet hat |
| `erstellt_am` | timestamptz | |

Schlüssel: `(termin_id, bereich_id, person_id)` – niemand doppelt im selben Dienst.

## Die Besetzungsprüfung

Für jeden Termin × Bereich:

```
anzahl   = Zahl der Einteilungen
leiter_da = mindestens eine Einteilung mit als_leiter = true

rot   wenn anzahl < min_personen
      ODER (braucht_leiter = true UND leiter_da = false)
grün  wenn min_personen ≤ 1  (Ein-Personen-Dienst: Pflichtzahl = voll besetzt)
      ODER anzahl > min_personen
gelb  sonst = anzahl = min_personen bei mehrköpfigen Bereichen
      (erfüllt, aber ohne Puffer)
```

Ein Kinderdienst mit 3 Mitarbeitern, aber ohne Leiter, ist **rot**. Das ist der Fall, den A3 abfängt.

Ein-Personen-Dienste (Sprecher, Milch und Wasser, Lobpreisleitung) sind mit
ihrer einen Pflichtperson voll besetzt und daher **grün**, nicht gelb (Wunsch
aus dem Testlauf, 2026-07-27).

**Hinweis:** Diese Regel wird seit 2026-07-27 in der App (`statusVon()` in
`app.js`) gerechnet, nicht mehr über das `status`-Feld der View `v_besetzung`.
Die View liefert es weiter, die App ignoriert es. Ampel-Änderungen daher in
`statusVon()`, keine DB-Migration nötig.

## Bewusste Vereinfachungen

- **Keine Rollen-Tabelle.** `ist_admin` als Häkchen reicht bei 2–4 Bereichsleitern.
- **Keine Historie/Audit-Log.** Wer wann was geändert hat, wird nicht gespeichert. Bei Bedarf nachrüstbar.
- **Kein "Leiter" als eigene Person.** Leiter-Sein ist eine Eigenschaft der Präferenz – realistischer, weil dieselbe Person je Bereich anders qualifiziert ist.
- **`aktiv`-Flag statt Löschen.** Wer ausscheidet, verschwindet aus den Auswahllisten, aber alte Pläne bleiben lesbar.

## Änderungen am Datenmodell

Nicht in der Supabase-Oberfläche klicken. Stattdessen: neue Datei `sql/04_...sql` mit dem Änderungsbefehl anlegen, im Supabase-SQL-Editor ausführen, in `07-aenderungslog.md` eintragen. So bleibt nachvollziehbar, wie die Datenbank zu ihrem Zustand kam.
