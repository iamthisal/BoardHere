begin;
do $$ begin
  if (select count(*) from boardhere.time_buckets) <> 5 then raise exception 'Five buckets required'; end if;
  if exists (select from boardhere.journey_legs l where
    (select count(*) from boardhere.route_time_profile p where p.leg_id=l.id) <> 5) then
    raise exception 'Every leg needs every time bucket'; end if;
  if exists (select from boardhere.route_time_profile where data_status <> 'estimated') then
    raise exception 'Profiles must be estimated'; end if;
  if (select in_vehicle_multiplier from boardhere.route_time_profile
      where leg_id='maharagama-full-pickme-1' and bucket='weekday_morning_peak') <=
     (select in_vehicle_multiplier from boardhere.route_time_profile
      where leg_id='maharagama-full-pickme-1' and bucket='weekday_midday') then
    raise exception 'Peak taxi traffic should exceed midday'; end if;
end $$;
rollback;
