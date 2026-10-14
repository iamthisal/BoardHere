begin;
do $$ begin
  if (select count(*) from boardhere.journey_options) <> 8 then raise exception 'Expected eight demo options'; end if;
  if (select sum(cost_lkr) from boardhere.journey_legs where option_id='maharagama-two-buses') <> 160 then raise exception 'Bus scenario total wrong'; end if;
  if (select sum(cost_lkr) from boardhere.journey_legs where option_id='maharagama-pickme-hop') <> 480 then raise exception 'Hop scenario total wrong'; end if;
  if exists (select from boardhere.journey_options where data_status <> 'estimated') then raise exception 'Demo options must be estimated'; end if;
  if exists (select from boardhere.stops where verified_at is not null) then raise exception 'Demo stops are not verified'; end if;
end $$;
rollback;
