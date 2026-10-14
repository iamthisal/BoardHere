from datetime import datetime
from fastapi import HTTPException
from psycopg import connect
from psycopg.rows import dict_row
from .config import database_url
from . import database
from .models import CrowdReportRequest


def add_report(request: CrowdReportRequest, now: datetime):
    stamp = request.reported_at or now
    if stamp > now:
        raise HTTPException(422, 'A crowd report cannot be dated in the future')
    with connect(database_url(), row_factory=dict_row, connect_timeout=3) as conn:
        rows = conn.execute("""insert into boardhere.crowd_reports (leg_id, crowd_level, reported_at)
            select id, %s, %s from boardhere.journey_legs where id=%s and mode='bus'
            returning id, leg_id, crowd_level, reported_at, data_status, source""",
            (request.crowd_level, stamp, request.leg_id)).fetchall()
        if not rows:
            raise HTTPException(422, 'Choose an existing bus leg')
    return rows[0]


def latest_report(leg_id: str, now: datetime):
    bus = database.read("select id from boardhere.journey_legs where id=%s and mode='bus'", (leg_id,))
    if not bus:
        raise HTTPException(404, 'Unknown bus leg')
    rows = database.read("""select id, leg_id, crowd_level, reported_at, data_status, source
        from boardhere.crowd_reports where leg_id=%s and reported_at<=%s
        order by reported_at desc, id asc limit 1""", (leg_id, now))
    if not rows:
        return {'report': None, 'fresh': False}
    return {'report': rows[0], 'fresh': (now-rows[0]['reported_at']).total_seconds() < 1800}
