-- 01_schema.sql
-- Ausführen im Supabase SQL-Editor. Einmalig.
-- Legt die fünf Tabellen an. Siehe docs/02-datenmodell.md.

create extension if not exists "pgcrypto";

-- Personen -------------------------------------------------------------
create table if not exists personen (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  ist_admin   boolean not null default false,
  aktiv       boolean not null default true,
  erstellt_am timestamptz not null default now()
);

-- Dienstbereiche -------------------------------------------------------
create table if not exists bereiche (
  id             uuid primary key default gen_random_uuid(),
  name           text not null unique,
  kuerzel        text not null,
  min_personen   int  not null default 1 check (min_personen >= 0),
  braucht_leiter boolean not null default false,
  sortierung     int  not null default 0
);

-- Präferenzen ----------------------------------------------------------
create table if not exists praeferenzen (
  person_id  uuid not null references personen(id) on delete cascade,
  bereich_id uuid not null references bereiche(id) on delete cascade,
  kann_leiten boolean not null default false,
  gewichtung int not null default 1 check (gewichtung in (1,2)),
  primary key (person_id, bereich_id)
);

-- Termine --------------------------------------------------------------
create table if not exists termine (
  id       uuid primary key default gen_random_uuid(),
  datum    date not null unique,
  titel    text,
  notiz    text,
  abgesagt boolean not null default false
);

-- Einteilungen ---------------------------------------------------------
create table if not exists einteilungen (
  id          uuid primary key default gen_random_uuid(),
  termin_id   uuid not null references termine(id)  on delete cascade,
  bereich_id  uuid not null references bereiche(id) on delete cascade,
  person_id   uuid not null references personen(id) on delete cascade,
  als_leiter  boolean not null default false,
  quelle      text not null default 'selbst' check (quelle in ('selbst','admin')),
  erstellt_am timestamptz not null default now(),
  unique (termin_id, bereich_id, person_id)
);

-- Indizes für die häufigen Abfragen ------------------------------------
create index if not exists idx_einteilungen_termin  on einteilungen(termin_id);
create index if not exists idx_einteilungen_person  on einteilungen(person_id);
create index if not exists idx_termine_datum        on termine(datum);

-- Komfort-Ansicht: Besetzungsstand je Termin und Bereich ---------------
-- Liefert direkt die Ampel-Logik aus docs/02, damit die App nicht rechnen muss.
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
group by t.id, t.datum, b.id, b.name, b.min_personen, b.braucht_leiter, b.sortierung
order by t.datum, b.sortierung;
