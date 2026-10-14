begin;

-- All coordinates, route alignments, costs and timings are unverified demo estimates.
insert into boardhere.stops (id, slug, name, latitude, longitude, kind, data_status, source) values
('10000000-0000-0000-0000-000000000001', 'orion-city', 'Orion City / Orugodawatta', 6.952, 79.879, 'origin', 'estimated', 'Approximate demo coordinate; not field-verified'),
('10000000-0000-0000-0000-000000000002', 'orugodawatta', 'Orugodawatta boarding point', 6.951, 79.883, 'boarding', 'estimated', 'Approximate demo coordinate; not field-verified'),
('10000000-0000-0000-0000-000000000003', 'borella', 'Borella transfer point', 6.916, 79.878, 'boarding', 'estimated', 'Approximate demo coordinate; not field-verified'),
('10000000-0000-0000-0000-000000000004', 'maharagama', 'Maharagama drop-off', 6.848, 79.926, 'destination', 'estimated', 'Approximate demo coordinate; not field-verified'),
('10000000-0000-0000-0000-000000000005', 'homagama', 'Homagama drop-off', 6.843, 79.998, 'destination', 'estimated', 'Approximate demo coordinate; not field-verified')
on conflict (id) do update set slug=excluded.slug, name=excluded.name, latitude=excluded.latitude,
 longitude=excluded.longitude, kind=excluded.kind, data_status='estimated', source=excluded.source;

insert into boardhere.routes (id, code, name, data_status, source) values
('10000000-0000-0000-0000-000000000011', 'DEMO-FEEDER', 'Demo feeder bus (estimated)', 'estimated', 'User scenario: first of two buses; route not verified'),
('10000000-0000-0000-0000-000000000012', 'DEMO-138', '138 corridor (estimated demo alignment)', 'estimated', 'User scenario: 138 to Homagama; boarding alignment is unverified')
on conflict (id) do update set name=excluded.name, data_status='estimated', source=excluded.source;

insert into boardhere.route_patterns (id, route_id, name) values
('10000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000011', 'Demo feeder towards Borella (estimated)'),
('10000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000012', 'Demo direction towards Maharagama and Homagama (estimated)')
on conflict (id) do update set name=excluded.name;
insert into boardhere.route_stops (pattern_id, sequence, stop_id) values
('10000000-0000-0000-0000-000000000021', 1, '10000000-0000-0000-0000-000000000002'), ('10000000-0000-0000-0000-000000000021', 2, '10000000-0000-0000-0000-000000000003'),
('10000000-0000-0000-0000-000000000022', 1, '10000000-0000-0000-0000-000000000002'), ('10000000-0000-0000-0000-000000000022', 2, '10000000-0000-0000-0000-000000000003'),
('10000000-0000-0000-0000-000000000022', 3, '10000000-0000-0000-0000-000000000004'), ('10000000-0000-0000-0000-000000000022', 4, '10000000-0000-0000-0000-000000000005')
on conflict (pattern_id, sequence) do update set stop_id=excluded.stop_id;

insert into boardhere.fares (pattern_id, board_sequence, drop_sequence, amount_lkr, source, checked_at, data_status) values
('10000000-0000-0000-0000-000000000021', 1, 2, 80, 'User demo scenario, unverified', '2026-10-14T00:00:00+05:30', 'estimated'),
('10000000-0000-0000-0000-000000000022', 1, 3, 80, 'User demo scenario, unverified', '2026-10-14T00:00:00+05:30', 'estimated'),
('10000000-0000-0000-0000-000000000022', 2, 3, 80, 'User demo scenario, unverified', '2026-10-14T00:00:00+05:30', 'estimated'),
('10000000-0000-0000-0000-000000000022', 1, 4, 80, 'Hand-set Homagama demo fare, unverified', '2026-10-14T00:00:00+05:30', 'estimated'),
('10000000-0000-0000-0000-000000000022', 2, 4, 80, 'Hand-set Homagama demo fare, unverified', '2026-10-14T00:00:00+05:30', 'estimated')
on conflict (pattern_id, board_sequence, drop_sequence) do update set amount_lkr=excluded.amount_lkr, source=excluded.source, data_status='estimated';

insert into boardhere.journey_options (id, destination_id, title, source) values
('maharagama-full-pickme', '10000000-0000-0000-0000-000000000004', 'Full PickMe (estimated)', 'User scenario plus hand-set unverified demo estimates'),
('maharagama-two-buses', '10000000-0000-0000-0000-000000000004', 'Two buses (estimated)', 'User scenario plus hand-set unverified demo estimates'),
('maharagama-pickme-hop', '10000000-0000-0000-0000-000000000004', 'PickMe hop + bus (estimated)', 'User scenario plus hand-set unverified demo estimates'),
('maharagama-walk-bus', '10000000-0000-0000-0000-000000000004', 'Walk + bus (estimated)', 'User scenario plus hand-set unverified demo estimates')
on conflict (id) do update set title=excluded.title, source=excluded.source, data_status='estimated';
insert into boardhere.journey_options (id, destination_id, title, source) values
('homagama-full-pickme', '10000000-0000-0000-0000-000000000005', 'Full PickMe (estimated)', 'User scenario plus hand-set unverified demo estimates'),
('homagama-two-buses', '10000000-0000-0000-0000-000000000005', 'Two buses (estimated)', 'User scenario plus hand-set unverified demo estimates'),
('homagama-pickme-hop', '10000000-0000-0000-0000-000000000005', 'PickMe hop + bus (estimated)', 'User scenario plus hand-set unverified demo estimates'),
('homagama-walk-bus', '10000000-0000-0000-0000-000000000005', 'Walk + bus (estimated)', 'User scenario plus hand-set unverified demo estimates')
on conflict (id) do update set title=excluded.title, source=excluded.source, data_status='estimated';

insert into boardhere.journey_legs (id, option_id, sequence, mode, from_stop_id, to_stop_id, pattern_id, cost_lkr, base_minutes, origin_based, source) values
('maharagama-full-pickme-1','maharagama-full-pickme',1,'taxi',null,'10000000-0000-0000-0000-000000000004',null,1000,40,true,'Hand-set demo estimate; taxi costs from user scenario'),
('maharagama-two-buses-1','maharagama-two-buses',1,'walk',null,'10000000-0000-0000-0000-000000000002',null,0,0,true,'Hand-set demo estimate; taxi costs from user scenario'),
('maharagama-two-buses-2','maharagama-two-buses',2,'bus','10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000021',80,20,false,'Hand-set demo estimate; taxi costs from user scenario'),
('maharagama-two-buses-3','maharagama-two-buses',3,'bus','10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000022',80,32,false,'Hand-set demo estimate; taxi costs from user scenario'),
('maharagama-pickme-hop-1','maharagama-pickme-hop',1,'taxi',null,'10000000-0000-0000-0000-000000000003',null,400,12,true,'Hand-set demo estimate; taxi costs from user scenario'),
('maharagama-pickme-hop-2','maharagama-pickme-hop',2,'bus','10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000022',80,32,false,'Hand-set demo estimate; taxi costs from user scenario'),
('maharagama-walk-bus-1','maharagama-walk-bus',1,'walk',null,'10000000-0000-0000-0000-000000000002',null,0,0,true,'Hand-set demo estimate; taxi costs from user scenario'),
('maharagama-walk-bus-2','maharagama-walk-bus',2,'bus','10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000022',80,55,false,'Hand-set demo estimate; taxi costs from user scenario'),
('homagama-full-pickme-1','homagama-full-pickme',1,'taxi',null,'10000000-0000-0000-0000-000000000005',null,1000,55,true,'Hand-set demo estimate; taxi costs from user scenario'),
('homagama-two-buses-1','homagama-two-buses',1,'walk',null,'10000000-0000-0000-0000-000000000002',null,0,0,true,'Hand-set demo estimate; taxi costs from user scenario'),
('homagama-two-buses-2','homagama-two-buses',2,'bus','10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000021',80,20,false,'Hand-set demo estimate; taxi costs from user scenario'),
('homagama-two-buses-3','homagama-two-buses',3,'bus','10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000022',80,47,false,'Hand-set demo estimate; taxi costs from user scenario'),
('homagama-pickme-hop-1','homagama-pickme-hop',1,'taxi',null,'10000000-0000-0000-0000-000000000003',null,400,12,true,'Hand-set demo estimate; taxi costs from user scenario'),
('homagama-pickme-hop-2','homagama-pickme-hop',2,'bus','10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000022',80,47,false,'Hand-set demo estimate; taxi costs from user scenario'),
('homagama-walk-bus-1','homagama-walk-bus',1,'walk',null,'10000000-0000-0000-0000-000000000002',null,0,0,true,'Hand-set demo estimate; taxi costs from user scenario'),
('homagama-walk-bus-2','homagama-walk-bus',2,'bus','10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000022',80,70,false,'Hand-set demo estimate; taxi costs from user scenario')
on conflict (id) do update set cost_lkr=excluded.cost_lkr, base_minutes=excluded.base_minutes, source=excluded.source, data_status='estimated';
commit;

