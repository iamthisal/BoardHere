begin;

-- Synthetic, unverified demo catalog additions. These are illustrative journeys,
-- not claims about real Sri Lankan bus services, schedules, alignments, or fares.
insert into boardhere.stops (id, slug, name, latitude, longitude, kind, data_status, source) values
('10000000-0000-0000-0000-000000000006', 'nugegoda', 'Nugegoda drop-off', 6.865, 79.899, 'destination', 'estimated', 'Approximate illustrative demo coordinate; unverified'),
('10000000-0000-0000-0000-000000000007', 'kottawa', 'Kottawa drop-off', 6.841, 79.965, 'destination', 'estimated', 'Approximate illustrative demo coordinate; unverified'),
('10000000-0000-0000-0000-000000000008', 'colombo-fort', 'Colombo Fort drop-off', 6.934, 79.842, 'destination', 'estimated', 'Approximate illustrative demo coordinate; unverified'),
('10000000-0000-0000-0000-000000000009', 'battaramulla', 'Battaramulla drop-off', 6.902, 79.919, 'destination', 'estimated', 'Approximate illustrative demo coordinate; unverified'),
('10000000-0000-0000-0000-000000000010', 'kaduwela', 'Kaduwela drop-off', 6.931, 79.984, 'destination', 'estimated', 'Approximate illustrative demo coordinate; unverified')
on conflict (id) do update set slug=excluded.slug, name=excluded.name, latitude=excluded.latitude,
 longitude=excluded.longitude, kind=excluded.kind, data_status='estimated', source=excluded.source;

insert into boardhere.routes (id, code, name, data_status, source) values
('10000000-0000-0000-0000-000000000013', 'DEMO-NUGEGODA', 'Nugegoda synthetic demo corridor', 'estimated', 'Illustrative route invented for this demo; unverified'),
('10000000-0000-0000-0000-000000000014', 'DEMO-KOTTAWA', 'Kottawa synthetic demo corridor', 'estimated', 'Illustrative route invented for this demo; unverified'),
('10000000-0000-0000-0000-000000000015', 'DEMO-FORT', 'Colombo Fort synthetic demo corridor', 'estimated', 'Illustrative route invented for this demo; unverified'),
('10000000-0000-0000-0000-000000000016', 'DEMO-BATTARAMULLA', 'Battaramulla synthetic demo corridor', 'estimated', 'Illustrative route invented for this demo; unverified'),
('10000000-0000-0000-0000-000000000017', 'DEMO-KADUWELA', 'Kaduwela synthetic demo corridor', 'estimated', 'Illustrative route invented for this demo; unverified')
on conflict (id) do update set name=excluded.name, data_status='estimated', source=excluded.source;

insert into boardhere.route_patterns (id, route_id, name) values
('10000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000013', 'Synthetic direction towards Nugegoda (estimated)'),
('10000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000014', 'Synthetic direction towards Kottawa (estimated)'),
('10000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000015', 'Synthetic direction towards Colombo Fort (estimated)'),
('10000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000016', 'Synthetic direction towards Battaramulla (estimated)'),
('10000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000017', 'Synthetic direction towards Kaduwela (estimated)')
on conflict (id) do update set name=excluded.name;

insert into boardhere.route_stops (pattern_id, sequence, stop_id) values
('10000000-0000-0000-0000-000000000023',1,'10000000-0000-0000-0000-000000000002'),('10000000-0000-0000-0000-000000000023',2,'10000000-0000-0000-0000-000000000003'),('10000000-0000-0000-0000-000000000023',3,'10000000-0000-0000-0000-000000000006'),
('10000000-0000-0000-0000-000000000024',1,'10000000-0000-0000-0000-000000000002'),('10000000-0000-0000-0000-000000000024',2,'10000000-0000-0000-0000-000000000003'),('10000000-0000-0000-0000-000000000024',3,'10000000-0000-0000-0000-000000000007'),
('10000000-0000-0000-0000-000000000025',1,'10000000-0000-0000-0000-000000000002'),('10000000-0000-0000-0000-000000000025',2,'10000000-0000-0000-0000-000000000003'),('10000000-0000-0000-0000-000000000025',3,'10000000-0000-0000-0000-000000000008'),
('10000000-0000-0000-0000-000000000026',1,'10000000-0000-0000-0000-000000000002'),('10000000-0000-0000-0000-000000000026',2,'10000000-0000-0000-0000-000000000003'),('10000000-0000-0000-0000-000000000026',3,'10000000-0000-0000-0000-000000000009'),
('10000000-0000-0000-0000-000000000027',1,'10000000-0000-0000-0000-000000000002'),('10000000-0000-0000-0000-000000000027',2,'10000000-0000-0000-0000-000000000003'),('10000000-0000-0000-0000-000000000027',3,'10000000-0000-0000-0000-000000000010')
on conflict (pattern_id, sequence) do update set stop_id=excluded.stop_id;

insert into boardhere.fares (pattern_id, board_sequence, drop_sequence, amount_lkr, source, checked_at, data_status) values
('10000000-0000-0000-0000-000000000023',1,3,70,'Synthetic demo fare; unverified','2026-10-14T00:00:00+05:30','estimated'),('10000000-0000-0000-0000-000000000023',2,3,60,'Synthetic demo fare; unverified','2026-10-14T00:00:00+05:30','estimated'),
('10000000-0000-0000-0000-000000000024',1,3,110,'Synthetic demo fare; unverified','2026-10-14T00:00:00+05:30','estimated'),('10000000-0000-0000-0000-000000000024',2,3,90,'Synthetic demo fare; unverified','2026-10-14T00:00:00+05:30','estimated'),
('10000000-0000-0000-0000-000000000025',1,3,70,'Synthetic demo fare; unverified','2026-10-14T00:00:00+05:30','estimated'),('10000000-0000-0000-0000-000000000025',2,3,60,'Synthetic demo fare; unverified','2026-10-14T00:00:00+05:30','estimated'),
('10000000-0000-0000-0000-000000000026',1,3,75,'Synthetic demo fare; unverified','2026-10-14T00:00:00+05:30','estimated'),('10000000-0000-0000-0000-000000000026',2,3,65,'Synthetic demo fare; unverified','2026-10-14T00:00:00+05:30','estimated'),
('10000000-0000-0000-0000-000000000027',1,3,110,'Synthetic demo fare; unverified','2026-10-14T00:00:00+05:30','estimated'),('10000000-0000-0000-0000-000000000027',2,3,95,'Synthetic demo fare; unverified','2026-10-14T00:00:00+05:30','estimated')
on conflict (pattern_id, board_sequence, drop_sequence) do update set amount_lkr=excluded.amount_lkr, source=excluded.source, checked_at=excluded.checked_at, data_status='estimated';

insert into boardhere.journey_options (id, destination_id, title, source)
select slug || suffix, id, title, 'Synthetic illustrative journey template; unverified demo data'
from boardhere.stops cross join (values
 ('-full-pickme','Full PickMe (estimated)'),('-two-buses','Two buses (estimated)'),
 ('-pickme-hop','PickMe hop + bus (estimated)'),('-walk-bus','Walk + bus (estimated)')) as templates(suffix,title)
where slug in ('nugegoda','kottawa','colombo-fort','battaramulla','kaduwela')
on conflict (id) do update set destination_id=excluded.destination_id, title=excluded.title, source=excluded.source, data_status='estimated', active=true;

-- Full taxi legs.
insert into boardhere.journey_legs (id,option_id,sequence,mode,from_stop_id,to_stop_id,pattern_id,cost_lkr,base_minutes,origin_based,source)
select slug||'-full-pickme-1',slug||'-full-pickme',1,'taxi',null,id,null,cost,minutes,true,'Synthetic taxi estimate; not a quote or booking'
from boardhere.stops join (values
 ('nugegoda',850::numeric,32::numeric),('kottawa',1250,50),('colombo-fort',650,25),('battaramulla',750,30),('kaduwela',1150,48)
) as taxi_values(slug_value,cost,minutes) on slug=slug_value
on conflict (id) do update set cost_lkr=excluded.cost_lkr,base_minutes=excluded.base_minutes,source=excluded.source,data_status='estimated';

-- Two-bus templates: walk to Orugodawatta, feeder to Borella, then destination corridor.
insert into boardhere.journey_legs (id,option_id,sequence,mode,from_stop_id,to_stop_id,pattern_id,cost_lkr,base_minutes,origin_based,source)
select slug||suffix,slug||'-two-buses',sequence,mode,from_id::uuid,to_id::uuid,pattern_id::uuid,cost,minutes,origin_based,'Synthetic illustrative journey leg; unverified'
from boardhere.stops cross join lateral (values
 ('-two-buses-1',1,'walk',null,'10000000-0000-0000-0000-000000000002',null,0::numeric,0::numeric,true),
 ('-two-buses-2',2,'bus','10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000021',80,20,false),
 ('-two-buses-3',3,'bus','10000000-0000-0000-0000-000000000003',id::text,
   case slug when 'nugegoda' then '10000000-0000-0000-0000-000000000023' when 'kottawa' then '10000000-0000-0000-0000-000000000024' when 'colombo-fort' then '10000000-0000-0000-0000-000000000025' when 'battaramulla' then '10000000-0000-0000-0000-000000000026' else '10000000-0000-0000-0000-000000000027' end,
   0,case slug when 'nugegoda' then 22 when 'kottawa' then 42 when 'colombo-fort' then 24 when 'battaramulla' then 25 else 44 end,false)
) legs(suffix,sequence,mode,from_id,to_id,pattern_id,cost,minutes,origin_based)
where slug in ('nugegoda','kottawa','colombo-fort','battaramulla','kaduwela')
on conflict (id) do update set cost_lkr=excluded.cost_lkr,base_minutes=excluded.base_minutes,source=excluded.source,data_status='estimated';

-- Taxi hop to Borella, then bus.
insert into boardhere.journey_legs (id,option_id,sequence,mode,from_stop_id,to_stop_id,pattern_id,cost_lkr,base_minutes,origin_based,source)
select slug||suffix,slug||'-pickme-hop',sequence,mode,from_id::uuid,to_id::uuid,pattern_id::uuid,cost,minutes,origin_based,'Synthetic illustrative journey leg; unverified'
from boardhere.stops cross join lateral (values
 ('-pickme-hop-1',1,'taxi',null,'10000000-0000-0000-0000-000000000003',null,400::numeric,12::numeric,true),
 ('-pickme-hop-2',2,'bus','10000000-0000-0000-0000-000000000003',id::text,
   case slug when 'nugegoda' then '10000000-0000-0000-0000-000000000023' when 'kottawa' then '10000000-0000-0000-0000-000000000024' when 'colombo-fort' then '10000000-0000-0000-0000-000000000025' when 'battaramulla' then '10000000-0000-0000-0000-000000000026' else '10000000-0000-0000-0000-000000000027' end,
   0,case slug when 'nugegoda' then 22 when 'kottawa' then 42 when 'colombo-fort' then 24 when 'battaramulla' then 25 else 44 end,false)
) legs(suffix,sequence,mode,from_id,to_id,pattern_id,cost,minutes,origin_based)
where slug in ('nugegoda','kottawa','colombo-fort','battaramulla','kaduwela')
on conflict (id) do update set cost_lkr=excluded.cost_lkr,base_minutes=excluded.base_minutes,source=excluded.source,data_status='estimated';

-- Walk to the nearest valid upstream stop, then take the destination corridor bus.
insert into boardhere.journey_legs (id,option_id,sequence,mode,from_stop_id,to_stop_id,pattern_id,cost_lkr,base_minutes,origin_based,source)
select slug||suffix,slug||'-walk-bus',sequence,mode,from_id::uuid,to_id::uuid,pattern_id::uuid,cost,minutes,origin_based,'Synthetic illustrative journey leg; unverified'
from boardhere.stops cross join lateral (values
 ('-walk-bus-1',1,'walk',null,'10000000-0000-0000-0000-000000000002',null,0::numeric,0::numeric,true),
 ('-walk-bus-2',2,'bus','10000000-0000-0000-0000-000000000002',id::text,
   case slug when 'nugegoda' then '10000000-0000-0000-0000-000000000023' when 'kottawa' then '10000000-0000-0000-0000-000000000024' when 'colombo-fort' then '10000000-0000-0000-0000-000000000025' when 'battaramulla' then '10000000-0000-0000-0000-000000000026' else '10000000-0000-0000-0000-000000000027' end,
   0,case slug when 'nugegoda' then 37 when 'kottawa' then 57 when 'colombo-fort' then 39 when 'battaramulla' then 40 else 59 end,false)
) legs(suffix,sequence,mode,from_id,to_id,pattern_id,cost,minutes,origin_based)
where slug in ('nugegoda','kottawa','colombo-fort','battaramulla','kaduwela')
on conflict (id) do update set cost_lkr=excluded.cost_lkr,base_minutes=excluded.base_minutes,source=excluded.source,data_status='estimated';

insert into boardhere.route_time_profile (leg_id,bucket,in_vehicle_multiplier,wait_minutes,crowd_level,source)
select l.id,b.id,
 case when l.mode='walk' then 1.0
      when b.id='weekday_morning_peak' then case when l.id like '%full-pickme%' then 1.9 when l.id like '%pickme-hop%' and l.mode='taxi' then 1.2 when l.id like '%pickme-hop%' then 1.1 else 1.5 end
      when b.id='weekday_evening_peak' then case when l.id like '%full-pickme%' then 2.0 when l.id like '%pickme-hop%' and l.mode='taxi' then 1.4 when l.id like '%pickme-hop%' then 1.3 else 1.7 end
      when b.id='night' then 0.85 when b.id='weekend' then case when l.mode='taxi' then 1.1 else 1.05 end else 1.0 end,
 case when l.mode='walk' then 0 when l.mode='taxi' then case when b.id like '%peak' then 6 else 4 end
      when b.id='weekday_morning_peak' then 12 when b.id='weekday_evening_peak' then 15 when b.id='night' then 20 when b.id='weekend' then 10 else 8 end,
 case when l.mode<>'bus' then 'not_applicable' when b.id like '%peak' then 'packed' when b.id='weekend' then 'standing' else 'seats_free' end,
 'Hand-set synthetic demo profile; not a measured schedule or traffic observation'
from boardhere.journey_legs l cross join boardhere.time_buckets b
where split_part(l.option_id,'-',1) in ('nugegoda','kottawa','colombo','battaramulla','kaduwela')
on conflict (leg_id,bucket) do update set in_vehicle_multiplier=excluded.in_vehicle_multiplier,
 wait_minutes=excluded.wait_minutes,crowd_level=excluded.crowd_level,source=excluded.source,data_status='estimated';

commit;
