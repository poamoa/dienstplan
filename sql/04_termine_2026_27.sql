-- 04_termine_2026_27.sql
-- Termin-Plan September 2026 bis Juli 2027.
-- Regeln: 1. und 3. Sonntag je Monat (14-Tage-Takt, nie 5. Sonntag),
-- Winterpause ab 1. Advent (29.11.2026) bis Neustart 17.1.2027,
-- Sommerpausenabschluss als letzter Termin im Juli 2027.
-- Sondertermine (Lobpreisabend, Leitertreffen, Weihnachtsfeier, Fasten-/Gebets-
-- woche, Sommerpausenabschluss) sind Info-Termine ohne Dienstplan-Ampel.
--
-- Idempotent: mehrfach ausführbar. Reguläre Testsonntage des Seeds werden
-- entfernt (sofern ohne Einteilungen), der Plan wird gesetzt/aktualisiert.
-- Ausführen nach 01–03. Voraussetzung: Spalte braucht_dienste (siehe unten).

-- 1) Spalte für Info-Termine ohne Dienstplan --------------------------------
alter table termine add column if not exists braucht_dienste boolean not null default true;

-- 2) Besetzungs-Ansicht: Info-Termine ausschließen --------------------------
create or replace view v_besetzung as
select
  t.id            as termin_id,
  t.datum,
  b.id            as bereich_id,
  b.name          as bereich,
  b.min_personen,
  b.braucht_leiter,
  count(e.id)                                        as anzahl,
  bool_or(coalesce(e.als_leiter, false))             as leiter_da,
  case
    when count(e.id) < b.min_personen                                   then 'rot'
    when b.braucht_leiter and not bool_or(coalesce(e.als_leiter,false)) then 'rot'
    when count(e.id) = b.min_personen                                   then 'gelb'
    else 'gruen'
  end as status
from termine t
cross join bereiche b
left join einteilungen e
       on e.termin_id = t.id and e.bereich_id = b.id
where t.abgesagt = false
  and t.braucht_dienste = true            -- Info-Termine tauchen hier nicht auf
group by t.id, t.datum, b.id, b.name, b.min_personen, b.braucht_leiter, b.sortierung
order by t.datum, b.sortierung;

-- 3) Alte Seed-Sonntage entfernen, die nicht im Plan stehen -----------------
--    Termine mit Einteilungen bleiben unangetastet (Sicherheitsnetz).
delete from termine t
where t.datum not in ('2026-09-06', '2026-09-15', '2026-09-20', '2026-09-25', '2026-10-04', '2026-10-18', '2026-11-01', '2026-11-15', '2026-11-20', '2026-12-08', '2026-12-12', '2027-01-17', '2027-01-22', '2027-01-25', '2027-02-07', '2027-02-21', '2027-03-07', '2027-03-09', '2027-03-21', '2027-03-26', '2027-04-04', '2027-04-18', '2027-05-02', '2027-05-16', '2027-05-21', '2027-06-06', '2027-06-08', '2027-06-20', '2027-07-04', '2027-07-18', '2027-07-23', '2027-07-25')
  and not exists (select 1 from einteilungen e where e.termin_id = t.id);

-- 4) Plan setzen (einfügen oder Titel/Info-Flag aktualisieren) --------------
insert into termine (datum, titel, braucht_dienste) values
  ('2026-09-06', null, true),
  ('2026-09-15', 'Leitertreffen', false),
  ('2026-09-20', null, true),
  ('2026-09-25', 'Lobpreisabend', false),
  ('2026-10-04', null, true),
  ('2026-10-18', null, true),
  ('2026-11-01', null, true),
  ('2026-11-15', null, true),
  ('2026-11-20', 'Lobpreisabend', false),
  ('2026-12-08', 'Leitertreffen', false),
  ('2026-12-12', 'Weihnachtsfeier', false),
  ('2027-01-17', null, true),
  ('2027-01-22', 'Lobpreisabend', false),
  ('2027-01-25', 'Fasten- & Gebetswoche (bis 31.1.)', false),
  ('2027-02-07', null, true),
  ('2027-02-21', null, true),
  ('2027-03-07', null, true),
  ('2027-03-09', 'Leitertreffen', false),
  ('2027-03-21', null, true),
  ('2027-03-26', 'Lobpreisabend', false),
  ('2027-04-04', null, true),
  ('2027-04-18', null, true),
  ('2027-05-02', null, true),
  ('2027-05-16', null, true),
  ('2027-05-21', 'Lobpreisabend', false),
  ('2027-06-06', null, true),
  ('2027-06-08', 'Leitertreffen', false),
  ('2027-06-20', null, true),
  ('2027-07-04', null, true),
  ('2027-07-18', null, true),
  ('2027-07-23', 'Lobpreisabend', false),
  ('2027-07-25', 'Sommerpausenabschluss', false)
on conflict (datum) do update
  set titel = excluded.titel,
      braucht_dienste = excluded.braucht_dienste;
