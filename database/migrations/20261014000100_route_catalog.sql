begin;

-- Backend-only schema. Browser clients access route data through FastAPI.
create schema boardhere;
revoke all on schema boardhere from public;

create table boardhere.stops (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 160),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  boarding_notes text,
  verification_source text check (length(btrim(verification_source)) > 0),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  check ((verified_at is null) = (verification_source is null))
);

create table boardhere.routes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (length(btrim(code)) between 1 and 40),
  name text not null check (length(btrim(name)) between 1 and 160),
  created_at timestamptz not null default now()
);

-- Opposite directions and route variants have independent ordered stop lists.
create table boardhere.route_patterns (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references boardhere.routes(id),
  name text not null check (length(btrim(name)) between 1 and 160),
  verification_source text check (length(btrim(verification_source)) > 0),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (route_id, name),
  check ((verified_at is null) = (verification_source is null))
);

create table boardhere.route_stops (
  pattern_id uuid not null references boardhere.route_patterns(id) on delete cascade,
  sequence integer not null check (sequence > 0),
  stop_id uuid not null references boardhere.stops(id),
  can_board boolean not null default true,
  can_alight boolean not null default true,
  primary key (pattern_id, sequence)
);

create index route_stops_stop_pattern_index
  on boardhere.route_stops (stop_id, pattern_id);

-- A fare belongs to a boarding/drop-off pair, not a blanket price for a route.
create table boardhere.fares (
  pattern_id uuid not null,
  board_sequence integer not null,
  drop_sequence integer not null,
  amount_lkr numeric(10, 2) not null check (amount_lkr >= 0),
  source text not null check (length(btrim(source)) > 0),
  checked_at timestamptz not null,
  primary key (pattern_id, board_sequence, drop_sequence),
  check (board_sequence < drop_sequence),
  foreign key (pattern_id, board_sequence)
    references boardhere.route_stops (pattern_id, sequence) on delete cascade,
  foreign key (pattern_id, drop_sequence)
    references boardhere.route_stops (pattern_id, sequence) on delete cascade
);

revoke all on all tables in schema boardhere from public;

commit;
