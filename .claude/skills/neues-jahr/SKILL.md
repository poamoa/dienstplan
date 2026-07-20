---
name: neues-jahr
description: Jahresroutine des Dienstplans – legt die Sonntagstermine für die nächsten 12 Monate an und geht die Personenliste durch. Nutzen bei /neues-jahr, "Termine fürs nächste Jahr", "Sonntage anlegen" oder wenn sich der Nutzer über fehlende künftige Termine wundert.
---

# Jahresroutine

## Termine anlegen

Den Sonntags-Block aus `sql/02_seed.sql` ausführen – er ist idempotent und legt nur fehlende Sonntage der nächsten 12 Monate an:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -c "
insert into termine (datum)
select d::date from generate_series(current_date, current_date + interval '12 months', interval '1 day') d
where extract(isodow from d) = 7
on conflict (datum) do nothing;"
```

Ohne `psql`: denselben Befehl dem Nutzer für den Supabase SQL-Editor geben.

Kontrolle: `select max(datum) from termine;` sollte rund ein Jahr in der Zukunft liegen.

## Personen durchgehen

Den Nutzer fragen, ob jemand ausgeschieden oder neu dazugekommen ist. Ausgeschiedene per App (Verwaltung → Aktiv-Schalter) oder SQL auf `aktiv = false` – **nicht löschen**.

## Kurz-Check der Automatik

Bei der Gelegenheit unter GitHub → Actions prüfen: Backup und Keep-Alive der letzten Wochen grün? Liegt in `backups/` eine aktuelle Datei? (GitHub deaktiviert geplante Workflows nach 60 Tagen ohne Commit – ggf. „Enable workflow" klicken.)

## Abschluss

Eintrag in `docs/07-aenderungslog.md` („Jahresroutine JJJJ: Termine bis <Datum> angelegt, N Personen deaktiviert/angelegt").
