-- 05_bereiche_helfer.sql
-- Erweiterung aus dem Testlauf (2026-07-27): zusätzliche Dienstbereiche und
-- zwei neue Bereichs-Eigenschaften. Einmalig im Supabase SQL-Editor ausführen.
-- Läuft gefahrlos mehrfach.
--
-- mit_ampel = false       -> Bereich ohne Über-/Unterbesetzung. Die App zeigt
--                            keine Ampel und kein "x/min", nur wer dabei ist.
--                            Für Rollen mit unbestimmter Anzahl (Band, Helfer).
-- offen_fuer_alle = true   -> jeder kann sich eintragen, OHNE vorher eine
--                            Präferenz zu setzen; erscheint auch nicht in der
--                            Präferenz-Liste. Für allgemeine Helfer.
--                            false = nur wer die Präferenz gesetzt hat.

-- 1) Neue Spalten -------------------------------------------------------
alter table bereiche
  add column if not exists mit_ampel boolean not null default true;
alter table bereiche
  add column if not exists offen_fuer_alle boolean not null default false;

-- 2) Neue Bereiche aus den Testlauf-Rückmeldungen -----------------------
--    name, kuerzel, min_personen, braucht_leiter, sortierung, mit_ampel, offen_fuer_alle
insert into bereiche (name, kuerzel, min_personen, braucht_leiter, sortierung, mit_ampel, offen_fuer_alle) values
  -- #1: Stationsaufsicht Kinderdienst – echter Bedarf (Min 2, mit Ampel),
  --     präferenz-gesteuert wie ein normaler Dienst
  ('Kinderdienst Stationen', 'Station', 2, false, 25, true,  false),
  -- #4: allgemeine Helfer Kinderdienst – ohne Rolle, offen für alle, ohne Ampel
  ('Helfer Kinderdienst',    'H-KiDi',  0, false, 26, false, true),
  -- #2: Band & Sänger – unbestimmte Anzahl, ohne Ampel, ABER nur mit Präferenz
  --     (nicht jeder ist Musiker)
  ('Band & Sänger',          'Band',    0, false, 55, false, false),
  -- #4: allgemeine Helfer Lobpreis – ohne Rolle, offen für alle, ohne Ampel
  ('Helfer Lobpreis',        'H-Lob',   0, false, 56, false, true)
on conflict (name) do nothing;

-- Falls du Namen/Werte angepasst hast und den Block erneut fährst:
-- 'on conflict do nothing' schützt vor Duplikaten, ändert Bestehendes NICHT.
-- Einzelne Werte gezielt korrigieren, z. B.:
--   update bereiche set offen_fuer_alle = true, mit_ampel = false
--   where name = 'Helfer Kinderdienst';
