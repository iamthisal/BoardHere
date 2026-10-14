begin;
do $$ begin
  if (select count(*) from boardhere.journey_options) <> 28 then raise exception 'Expected 28 demo options'; end if;
  if exists (select destination_id from boardhere.journey_options group by destination_id having count(*) <> 4) then raise exception 'Every destination needs four templates'; end if;
  if (select sum(cost_lkr) from boardhere.journey_legs where option_id='maharagama-two-buses') <> 160 then raise exception 'Bus scenario total wrong'; end if;
  if (select sum(cost_lkr) from boardhere.journey_legs where option_id='maharagama-pickme-hop') <> 480 then raise exception 'Hop scenario total wrong'; end if;
  if exists (select from boardhere.journey_options where data_status <> 'estimated') then raise exception 'Demo options must be estimated'; end if;
  if exists (select from boardhere.stops where verified_at is not null) then raise exception 'Demo stops are not verified'; end if;
  if exists (select from boardhere.journey_legs l left join boardhere.journey_options o on o.id=l.option_id where o.id is null) then raise exception 'Orphan journey leg'; end if;
  if exists (select from boardhere.journey_legs where mode='bus' and (from_stop_id is null or pattern_id is null)) then raise exception 'Incomplete bus leg'; end if;
  if exists (
    select from boardhere.journey_legs l
    where l.mode='bus' and not exists (
      select from boardhere.route_stops b join boardhere.route_stops d on d.pattern_id=b.pattern_id
      where b.pattern_id=l.pattern_id and b.stop_id=l.from_stop_id and d.stop_id=l.to_stop_id
        and b.sequence<d.sequence and b.can_board and d.can_alight
    )
  ) then raise exception 'Invalid bus direction or stop relationship'; end if;
  if exists (
    select from boardhere.journey_legs l
    where l.mode='bus' and not exists (
      select from boardhere.route_stops b join boardhere.route_stops d on d.pattern_id=b.pattern_id
      join boardhere.fares f on f.pattern_id=b.pattern_id and f.board_sequence=b.sequence and f.drop_sequence=d.sequence
      where b.pattern_id=l.pattern_id and b.stop_id=l.from_stop_id and d.stop_id=l.to_stop_id and b.sequence<d.sequence
    )
  ) then raise exception 'Bus leg missing fare'; end if;
end $$;
rollback;
