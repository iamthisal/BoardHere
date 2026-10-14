begin;
do $$ begin
  if to_regclass('boardhere.journey_options') is null
    or to_regclass('boardhere.route_time_profile') is null
    or to_regclass('boardhere.crowd_reports') is null then
    raise exception 'Demo tables missing';
  end if;
  if has_table_privilege('boardhere_api', 'boardhere.journey_options', 'INSERT') then
    raise exception 'API role must not edit catalog';
  end if;
  begin
    insert into boardhere.time_buckets values ('invalid', 'Invalid bucket');
    raise exception 'Unknown bucket accepted';
  exception when check_violation then null; end;
end $$;
rollback;
