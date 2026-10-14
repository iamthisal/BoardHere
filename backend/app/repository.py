from . import database


def get_stops():
    return database.read("""
        select id, slug, name, latitude as lat, longitude as lng, kind, data_status, source
        from boardhere.stops where slug is not null order by kind, slug
    """)
