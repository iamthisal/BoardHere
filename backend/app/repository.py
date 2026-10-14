from . import database


def get_stops():
    return database.read("""
        select id, slug, name, latitude as lat, longitude as lng, kind, data_status, source
        from boardhere.stops where slug is not null order by kind, slug
    """)


def get_catalog(destination: str, now=None) -> dict:
    queries = {
        'stops': ("select id, slug, name, latitude as lat, longitude as lng, kind, data_status, source from boardhere.stops where slug is not null order by slug", ()),
        'options': ("""select o.* from boardhere.journey_options o join boardhere.stops s on s.id=o.destination_id
            where o.active and (s.slug=%s or s.id::text=%s) order by o.id""", (destination, destination)),
        'legs': ("""select l.*, r.name as service_label from boardhere.journey_legs l
            left join boardhere.route_patterns p on p.id=l.pattern_id left join boardhere.routes r on r.id=p.route_id
            order by l.option_id, l.sequence""", ()),
        'fares': ("select * from boardhere.fares order by pattern_id, board_sequence, drop_sequence", ()),
        'profiles': ("select * from boardhere.route_time_profile order by leg_id, bucket", ()),
        'route_stops': ("select * from boardhere.route_stops order by pattern_id, sequence", ()),
    }
    if now is not None:
        queries['reports'] = ("""select id, leg_id, crowd_level, reported_at, data_status, source
            from boardhere.crowd_reports where reported_at<=%s and reported_at>%s - interval '30 minutes'
            order by reported_at desc, id asc""", (now, now))
    return database.snapshot(queries)


def option_destination(option_id: str) -> str | None:
    rows = database.read("""select s.slug from boardhere.journey_options o
        join boardhere.stops s on s.id=o.destination_id where o.id=%s and o.active""", (option_id,))
    return rows[0]['slug'] if rows else None
