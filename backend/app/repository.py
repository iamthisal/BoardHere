from . import database


def get_stops():
    return database.read("""
        select id, slug, name, latitude as lat, longitude as lng, kind, data_status, source
        from boardhere.stops where slug is not null order by kind, slug
    """)


def get_catalog(destination: str) -> dict:
    return database.snapshot({
        'stops': ("select id, slug, name, latitude as lat, longitude as lng, kind, data_status, source from boardhere.stops where slug is not null order by slug", ()),
        'options': ("""select o.* from boardhere.journey_options o join boardhere.stops s on s.id=o.destination_id
            where o.active and (s.slug=%s or s.id::text=%s) order by o.id""", (destination, destination)),
        'legs': ("select * from boardhere.journey_legs order by option_id, sequence", ()),
        'profiles': ("select * from boardhere.route_time_profile order by leg_id, bucket", ()),
        'route_stops': ("select * from boardhere.route_stops order by pattern_id, sequence", ()),
    })


def option_destination(option_id: str) -> str | None:
    rows = database.read("""select s.slug from boardhere.journey_options o
        join boardhere.stops s on s.id=o.destination_id where o.id=%s and o.active""", (option_id,))
    return rows[0]['slug'] if rows else None
