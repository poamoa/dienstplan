-- 02_seed.sql
-- Startdaten: die sieben Dienstbereiche + Sonntagstermine.
-- Ausführen nach 01_schema.sql.

-- Die sieben Bereiche --------------------------------------------------
-- min_personen und braucht_leiter hier anpassen, wenn sich eure Regeln ändern.
insert into bereiche (name, kuerzel, min_personen, braucht_leiter, sortierung) values
  ('Kinderdienst Schulkinder',        'KiDi-S',  2, true,  10),
  ('Kinderdienst Kindergartenkinder', 'KiDi-K',  2, true,  20),
  ('Aufbau',                          'Aufbau',  2, false, 30),
  ('Abbau',                           'Abbau',   2, false, 40),
  ('Lobpreisleitung',                 'Lobpr.',  1, false, 50),
  ('Sprecher',                        'Sprecher',1, false, 60),
  ('Milch und Wasser',                'M&W',     1, false, 70)
on conflict (name) do nothing;

-- Hinweis zu den Kinderdiensten:
-- min_personen = 2 und braucht_leiter = true ergeben zusammen
-- "1 Leiter + mindestens 1 Mitarbeiter". Genau die geforderte Regel.

-- Beispielpersonen -----------------------------------------------------
-- Zum Testen. Später über die App pflegen. Diese drei danach löschen.
insert into personen (name, ist_admin) values
  ('Test Admin',       true),
  ('Test Leiterin',    false),
  ('Test Mitarbeiter', false)
on conflict (name) do nothing;

-- Sonntage der nächsten 12 Monate anlegen ------------------------------
-- Läuft beliebig oft, legt nur fehlende Termine an.
insert into termine (datum)
select d::date
from generate_series(
       current_date,
       current_date + interval '12 months',
       interval '1 day'
     ) as d
where extract(isodow from d) = 7   -- 7 = Sonntag
on conflict (datum) do nothing;

-- Diesen Block einmal im Jahr erneut ausführen (siehe docs/05-betrieb-wartung.md),
-- oder als Admin einzelne Sondertermine über die App anlegen.
