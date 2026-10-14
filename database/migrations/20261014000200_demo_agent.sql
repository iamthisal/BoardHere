begin;

alter table boardhere.stops add column if not exists slug text unique;
alter table boardhere.stops add column if not exists kind text not null default 'boarding'
  check (kind in ('origin', 'boarding', 'destination'));
alter table boardhere.stops add column if not exists data_status text not null default 'estimated'
  check (data_status in ('estimated', 'verified'));
alter table boardhere.stops add column if not exists source text not null default 'Unverified entry';
alter table boardhere.routes add column if not exists data_status text not null default 'estimated'
  check (data_status in ('estimated', 'verified'));
alter table boardhere.routes add column if not exists source text not null default 'Unverified entry';
alter table boardhere.fares add column if not exists data_status text not null default 'estimated'
  check (data_status in ('estimated', 'verified'));

create table if not exists boardhere.journey_options (
  id text primary key,
  destination_id uuid not null references boardhere.stops(id),
  title text not null,
  data_status text not null default 'estimated' check (data_status in ('estimated', 'verified')),
  source text not null,
  active boolean not null default true
);

create table if not exists boardhere.journey_legs (
  id text primary key,
  option_id text not null references boardhere.journey_options(id) on delete cascade,
  sequence integer not null check (sequence > 0),
  mode text not null check (mode in ('walk', 'taxi', 'bus')),
  from_stop_id uuid references boardhere.stops(id),
  to_stop_id uuid not null references boardhere.stops(id),
  pattern_id uuid references boardhere.route_patterns(id),
  cost_lkr numeric(10,2) not null check (cost_lkr >= 0),
  base_minutes numeric(10,2) not null check (base_minutes >= 0),
  origin_based boolean not null default false,
  data_status text not null default 'estimated' check (data_status in ('estimated', 'verified')),
  source text not null,
  unique (option_id, sequence),
  check (mode <> 'bus' or pattern_id is not null)
);

create table if not exists boardhere.time_buckets (
  id text primary key check (id in ('weekday_morning_peak', 'weekday_midday',
    'weekday_evening_peak', 'night', 'weekend')),
  description text not null
);

create table if not exists boardhere.route_time_profile (
  leg_id text not null references boardhere.journey_legs(id) on delete cascade,
  bucket text not null references boardhere.time_buckets(id),
  in_vehicle_multiplier numeric(8,3) not null check (in_vehicle_multiplier > 0),
  wait_minutes numeric(8,2) not null check (wait_minutes >= 0),
  crowd_level text not null check (crowd_level in ('seats_free', 'standing', 'packed', 'not_applicable')),
  data_status text not null default 'estimated' check (data_status in ('estimated', 'verified')),
  source text not null,
  primary key (leg_id, bucket)
);

create table if not exists boardhere.crowd_reports (
  id uuid primary key default gen_random_uuid(),
  leg_id text not null references boardhere.journey_legs(id),
  crowd_level text not null check (crowd_level in ('seats_free', 'standing', 'packed')),
  reported_at timestamptz not null,
  data_status text not null default 'estimated' check (data_status = 'estimated'),
  source text not null default 'Unverified passenger report'
);
create index if not exists crowd_reports_latest on boardhere.crowd_reports (leg_id, reported_at desc, id);

do $$ begin
  if not exists (select from pg_roles where rolname = 'boardhere_api') then
    create role boardhere_api login password 'boardhere_api_dev_only';
  end if;
end $$;
grant usage on schema boardhere to boardhere_api;
grant select on all tables in schema boardhere to boardhere_api;
revoke all on all tables in schema boardhere from public;
commit;
