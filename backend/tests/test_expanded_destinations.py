from datetime import datetime
import os

import pytest
from fastapi.testclient import TestClient
from psycopg import connect

from app.main import app


client = TestClient(app)
DESTINATIONS = ('maharagama', 'homagama', 'nugegoda', 'kottawa', 'colombo-fort', 'battaramulla', 'kaduwela')
TIMES = (
    '2026-10-14T08:00:00+05:30',
    '2026-10-14T14:00:00+05:30',
    '2026-10-14T17:00:00+05:30',
    '2026-10-14T22:00:00+05:30',
    '2026-10-17T10:00:00+05:30',
)


@pytest.mark.parametrize('destination', DESTINATIONS)
@pytest.mark.parametrize('preference', ('cheapest', 'fastest', 'comfortable'))
@pytest.mark.parametrize('now', TIMES)
def test_every_destination_preference_and_time_bucket(destination, preference, now):
    response = client.post('/recommend', json={
        'origin': {'lat': 6.952, 'lng': 79.879},
        'destination': destination,
        'preference': preference,
        'minutes_available': 180,
        'now': now,
    })
    assert response.status_code == 200
    result = response.json()
    assert len(result['options']) == 4
    assert result['recommended_id'] == result['options'][0]['id']
    assert all(option['data_status'] == 'estimated' for option in result['options'])
    assert all(leg['data_status'] == 'estimated' for option in result['options'] for leg in option['legs'])


@pytest.mark.parametrize('destination', DESTINATIONS)
def test_each_destination_has_four_distinct_templates(destination):
    result = client.post('/recommend', json={
        'origin': {'lat': 6.952, 'lng': 79.879},
        'destination': destination,
        'preference': 'fastest',
        'minutes_available': 180,
        'now': datetime.fromisoformat('2026-10-14T14:00:00+05:30').isoformat(),
    }).json()
    assert {option['id'] for option in result['options']} == {
        f'{destination}-full-pickme', f'{destination}-two-buses',
        f'{destination}-pickme-hop', f'{destination}-walk-bus',
    }


def test_expanded_route_bus_leg_accepts_crowd_report():
    response = client.post('/crowd-reports', json={
        'leg_id': 'kaduwela-pickme-hop-2',
        'crowd_level': 'standing',
        'reported_at': '2026-10-14T14:00:00+05:30',
    })
    assert response.status_code == 201
    report_id = response.json()['id']
    try:
        latest = client.get('/crowd-reports/latest/kaduwela-pickme-hop-2', params={
            'now': '2026-10-14T14:10:00+05:30',
        })
        assert latest.status_code == 200
        assert latest.json()['report']['id'] == report_id
    finally:
        with connect(os.getenv('TEST_DATABASE_URL', 'postgresql://boardhere:boardhere_dev_only@db:5432/boardhere')) as conn:
            conn.execute('delete from boardhere.crowd_reports where id=%s', (report_id,))
