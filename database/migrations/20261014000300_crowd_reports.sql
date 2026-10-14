begin;
grant insert (leg_id, crowd_level, reported_at) on boardhere.crowd_reports to boardhere_api;
commit;
