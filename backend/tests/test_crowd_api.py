from datetime import datetime, timedelta, timezone
import os
from psycopg import connect
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_reports_persist_and_latest_read_is_time_bounded():
    now = datetime.now(timezone.utc)
    ids = []
    try:
        for minutes in (40, 2):
            response = client.post('/crowd-reports', json={'leg_id':'maharagama-pickme-hop-2',
                'crowd_level':'standing', 'reported_at':(now-timedelta(minutes=minutes)).isoformat()})
            assert response.status_code == 201
            report = response.json(); ids.append(report['id'])
            assert report['data_status'] == 'estimated'
        latest = client.get('/crowd-reports/latest/maharagama-pickme-hop-2', params={'now':now.isoformat()}).json()
        assert latest['report']['id'] == ids[-1] and latest['fresh']
        assert client.post('/crowd-reports', json={'leg_id':'maharagama-full-pickme-1','crowd_level':'packed'}).status_code == 422
        assert client.post('/crowd-reports', json={'leg_id':'unknown','crowd_level':'seats_free'}).status_code == 422
        assert client.post('/crowd-reports', json={'leg_id':'maharagama-pickme-hop-2','crowd_level':'invalid'}).status_code == 422
        assert client.post('/crowd-reports', json={'leg_id':'maharagama-pickme-hop-2','crowd_level':'packed',
            'reported_at':(now+timedelta(days=1)).isoformat()}).status_code == 422
    finally:
        with connect(os.getenv('TEST_DATABASE_URL','postgresql://boardhere:boardhere_dev_only@db:5432/boardhere')) as conn:
            for id in ids:
                conn.execute('delete from boardhere.crowd_reports where id=%s',(id,))
