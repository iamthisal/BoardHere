from fastapi.testclient import TestClient
import pytest
from app.main import app

client = TestClient(app)
BODY = {'origin': {'lat': 6.952, 'lng': 79.879}, 'destination': 'maharagama',
        'preference': 'fastest', 'minutes_available': 90, 'now': '2026-10-14T08:00:00+05:30'}


def test_recommend_uses_database_and_returns_reproducible_context():
    response = client.post('/recommend', json=BODY)
    assert response.status_code == 200
    result = response.json()
    assert len(result['options']) == 4
    assert result['recommended_id'] == 'maharagama-pickme-hop'
    assert result['now'] == BODY['now']
    assert client.post('/recommend', json=BODY).json() == result


@pytest.mark.parametrize('change', [
    {'preference': 'invalid'}, {'minutes_available': 0}, {'origin': {'lat': 100, 'lng': 0}},
    {'now': '2026-10-14T08:00:00'}, {'unexpected': True},
])
def test_invalid_inputs_return_422(change):
    assert client.post('/recommend', json={**BODY, **change}).status_code == 422


def test_default_time_unknown_destination_and_empty_coverage():
    body = {k: v for k, v in BODY.items() if k != 'now'}
    assert client.post('/recommend', json=body).json()['now']
    assert client.post('/recommend', json={**BODY, 'destination': 'unknown'}).status_code == 404
    assert client.post('/recommend', json={**BODY, 'origin': {'lat': 0, 'lng': 0}}).json()['options'] == []
