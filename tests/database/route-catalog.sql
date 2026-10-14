begin;

-- All fixtures and the test role disappear when this transaction rolls back.
do $$
declare
  stop_a uuid;
  stop_b uuid;
  stop_c uuid;
  route uuid;
  pattern uuid;
  candidates integer;
begin
  insert into boardhere.stops (name, latitude, longitude)
    values ('Fixture A', 6.9, 79.9) returning id into stop_a;
  insert into boardhere.stops (name, latitude, longitude)
    values ('Fixture B', 6.9, 79.9) returning id into stop_b;
  insert into boardhere.stops (name, latitude, longitude)
    values ('Fixture C', 6.9, 79.9) returning id into stop_c;
  insert into boardhere.routes (code, name)
    values (gen_random_uuid()::text, 'Test-only route') returning id into route;
  insert into boardhere.route_patterns (route_id, name)
    values (route, 'Test direction') returning id into pattern;
  insert into boardhere.route_stops (pattern_id, sequence, stop_id, can_board)
    values (pattern, 1, stop_a, true), (pattern, 2, stop_b, false), (pattern, 3, stop_c, true);

  begin
    insert into boardhere.stops (name, latitude, longitude) values ('Invalid', 91, 79.9);
    raise exception 'Invalid coordinates were accepted';
  exception when check_violation then null;
  end;

  begin
    update boardhere.stops set verified_at = now() where id = stop_a;
    raise exception 'Verification without a source was accepted';
  exception when check_violation then null;
  end;

  begin
    insert into boardhere.route_stops (pattern_id, sequence, stop_id)
      values (pattern, 4, gen_random_uuid());
    raise exception 'A missing stop was accepted';
  exception when foreign_key_violation then null;
  end;

  begin
    insert into boardhere.route_stops (pattern_id, sequence, stop_id)
      values (pattern, 1, stop_b);
    raise exception 'A duplicate stop position was accepted';
  exception when unique_violation then null;
  end;

  begin
    insert into boardhere.fares (pattern_id, board_sequence, drop_sequence, amount_lkr, source, checked_at)
      values (pattern, 3, 1, 100, 'Fixture', now());
    raise exception 'A backwards fare was accepted';
  exception when check_violation then null;
  end;

  begin
    insert into boardhere.fares (pattern_id, board_sequence, drop_sequence, amount_lkr, source, checked_at)
      values (pattern, 1, 4, 100, 'Fixture', now());
    raise exception 'A fare to an unknown position was accepted';
  exception when foreign_key_violation then null;
  end;

  begin
    insert into boardhere.fares (pattern_id, board_sequence, drop_sequence, amount_lkr, source, checked_at)
      values (pattern, 1, 3, -100, 'Fixture', now());
    raise exception 'A negative fare was accepted';
  exception when check_violation then null;
  end;

  update boardhere.stops set verified_at = now(), verification_source = 'Test fixture'
    where id in (stop_a, stop_b, stop_c);
  update boardhere.route_patterns set verified_at = now(), verification_source = 'Test fixture'
    where id = pattern;

  select count(*) into candidates
    from boardhere.route_stops board
    join boardhere.route_stops target on target.pattern_id = board.pattern_id
    join boardhere.route_patterns p on p.id = board.pattern_id
    join boardhere.stops b on b.id = board.stop_id
    join boardhere.stops d on d.id = target.stop_id
    where target.stop_id = stop_c and board.pattern_id = pattern
      and board.sequence < target.sequence and board.can_board and target.can_alight
      and p.verified_at is not null and b.verified_at is not null and d.verified_at is not null;
  if candidates <> 1 then
    raise exception 'Expected only one upstream boardable candidate, got %', candidates;
  end if;

  insert into boardhere.fares (pattern_id, board_sequence, drop_sequence, amount_lkr, source, checked_at)
    values (pattern, 1, 3, 100, 'Fixture', now());
end;
$$;

create role boardhere_test_browser nologin;
set local role boardhere_test_browser;
do $$
begin
  begin
    perform * from boardhere.stops;
    raise exception 'A browser role could access backend tables';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

rollback;
