-- 05_bereiche_helfer.sql
-- Erweiterung aus dem Testlauf (2026-07-27): zusätzliche Dienstbereiche und
-- das Konzept "optionaler Pool ohne Ampel" (unbestimmte Anzahl an Helfern).
-- Einmalig im Supabase SQL-Editor ausführen. Läuft gefahrlos mehrfach.
--
-- mit_ampel = false  ->  Bereich ohne Über-/Unterbesetzung. Die App zeigt keine
--                        Ampel und kein "x/min", nur wer dabei ist. Für Rollen
--                        mit unbestimmter Anzahl (Band, allgemeine Helfer).

-- 1) Neue Spalte: trägt der Bereich eine Ampel? --------------------------
alter table bereiche
  add column if not exists mit_ampel boolean not null default true;

-- 2) Neue Bereiche aus den Testlauf-Rückmeldungen ------------------------
--    name, kuerzel, min_personen, braucht_leiter, sortierung, mit_ampel
insert into bereiche (name, kuerzel, min_personen, braucht_leiter, sortierung, mit_ampel) values
  -- #1: Stationsaufsicht im Kinderdienst – echter Bedarf, daher mit Ampel (Min 2)
  ('Kinderdienst Stationen', 'Station', 2, false, 25, true),
  -- #4: allgemeine Helfer Kinderdienst (beide Gruppen), ohne feste Rolle
  ('Helfer Kinderdienst',    'H-KiDi',  0, false, 26, false),
  -- #2: Band & Sänger – unbestimmte Anzahl
  ('Band & Sänger',          'Band',    0, false, 55, false),
  -- #4: allgemeine Helfer Lobpreis
  ('Helfer Lobpreis',        'H-Lob',   0, false, 56, false)
on conflict (name) do nothing;

-- Falls du oben Namen/Kürzel angepasst hast und den Block erneut fährst:
-- 'on conflict do nothing' schützt vor Duplikaten, ändert aber Bestehendes NICHT.
-- Zum Korrigieren einzelner Werte gezielt updaten, z. B.:
--   update bereiche set kuerzel = 'Band', min_personen = 0, mit_ampel = false
--   where name = 'Band & Sänger';
