-- 03_rls.sql
-- Zugriffsschutz (Row Level Security).
-- WICHTIG: Ohne dieses Skript kann jeder im Internet eure Daten lesen und ändern.
-- Ausführen nach 01_schema.sql.

-- Grundregel: Nur angemeldete Nutzer (= wer das Team-Passwort kennt)
-- dürfen überhaupt etwas sehen oder ändern. Anonyme Besucher: nichts.
-- Siehe docs/00-entscheidung-architektur.md, Abschnitt 3.

alter table personen     enable row level security;
alter table bereiche     enable row level security;
alter table praeferenzen enable row level security;
alter table termine      enable row level security;
alter table einteilungen enable row level security;

-- Lesen: alle Angemeldeten -------------------------------------------
create policy "lesen_angemeldet" on personen
  for select to authenticated using (true);
create policy "lesen_angemeldet" on bereiche
  for select to authenticated using (true);
create policy "lesen_angemeldet" on praeferenzen
  for select to authenticated using (true);
create policy "lesen_angemeldet" on termine
  for select to authenticated using (true);
create policy "lesen_angemeldet" on einteilungen
  for select to authenticated using (true);

-- Schreiben: alle Angemeldeten ---------------------------------------
-- Innerhalb des Teams unterscheiden wir nicht auf Datenbankebene, weil sich
-- alle ein Konto teilen. Die Admin-Funktionen sind in der App abgetrennt.
-- Das ist eine bewusste Entscheidung: Schutz gegen Fremde, nicht gegen Kollegen.
-- Wenn ihr echten Schutz pro Person braucht, siehe docs/06-roadmap.md (E-Mail-Login).

create policy "schreiben_angemeldet" on praeferenzen
  for all to authenticated using (true) with check (true);
create policy "schreiben_angemeldet" on einteilungen
  for all to authenticated using (true) with check (true);
create policy "schreiben_angemeldet" on termine
  for all to authenticated using (true) with check (true);
create policy "schreiben_angemeldet" on personen
  for all to authenticated using (true) with check (true);

-- bereiche bleibt absichtlich schreibgeschützt:
-- Die sieben Bereiche und ihre Regeln ändert man selten und dann bewusst
-- über ein SQL-Skript, nicht versehentlich per Klick.

-- Prüfen, ob es geklappt hat:
--   select tablename, rowsecurity from pg_tables where schemaname = 'public';
-- rowsecurity muss überall 'true' sein.
