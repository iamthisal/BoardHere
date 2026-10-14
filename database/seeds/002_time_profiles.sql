begin;
insert into boardhere.time_buckets (id, description) values
('weekday_morning_peak', 'Weekdays 07:00 inclusive to 09:00 exclusive, Asia/Colombo'),
('weekday_midday', 'Weekdays 09:00 inclusive to 16:30 exclusive, Asia/Colombo'),
('weekday_evening_peak', 'Weekdays 16:30 inclusive to 19:00 exclusive, Asia/Colombo'),
('night', 'Weekdays 19:00 inclusive to 07:00 exclusive, Asia/Colombo'),
('weekend', 'All Saturday and Sunday, Asia/Colombo; takes precedence over night')
on conflict (id) do update set description=excluded.description;

insert into boardhere.route_time_profile
  (leg_id, bucket, in_vehicle_multiplier, wait_minutes, crowd_level, source)
select l.id, b.id,
  case
    when l.mode='walk' then 1.0
    when b.id='weekday_morning_peak' then
      case when l.id like '%full-pickme%' then 1.9
           when l.id like '%pickme-hop%' and l.mode='taxi' then 1.2
           when l.id like '%pickme-hop%' and l.mode='bus' then 1.1 else 1.5 end
    when b.id='weekday_evening_peak' then
      case when l.id like '%full-pickme%' then 2.0
           when l.id like '%pickme-hop%' and l.mode='taxi' then 1.4
           when l.id like '%pickme-hop%' and l.mode='bus' then 1.3 else 1.7 end
    when b.id='night' then 0.85
    when b.id='weekend' then case when l.mode='taxi' then 1.1 else 1.05 end
    else 1.0 end,
  case
    when l.mode='walk' then 0
    when l.mode='taxi' then case when b.id like '%peak' then 6 else 4 end
    when b.id='weekday_morning_peak' then 12
    when b.id='weekday_evening_peak' then 15
    when b.id='night' then 20
    when b.id='weekend' then 10 else 8 end,
  case when l.mode <> 'bus' then 'not_applicable'
       when b.id like '%peak' then 'packed'
       when b.id='weekend' then 'standing' else 'seats_free' end,
  'Hand-set estimated (rule-based) demo profile, not measured traffic or schedule'
from boardhere.journey_legs l cross join boardhere.time_buckets b
where l.option_id like 'maharagama-%' or l.option_id like 'homagama-%'
on conflict (leg_id, bucket) do update set
  in_vehicle_multiplier=excluded.in_vehicle_multiplier, wait_minutes=excluded.wait_minutes,
  crowd_level=excluded.crowd_level, source=excluded.source, data_status='estimated';
commit;
