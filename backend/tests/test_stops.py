from fastapi.testclient import TestClient
from app.main import app


def test_stops_come_from_database_with_estimated_status():
    response = TestClient(app).get('/stops')
    assert response.status_code == 200
    stops = response.json()
    assert len(stops) == 10
    assert {s['slug'] for s in stops if s['kind'] == 'destination'} == {
        'maharagama', 'homagama', 'nugegoda', 'kottawa', 'colombo-fort', 'battaramulla', 'kaduwela'
    }
    assert all(s['data_status'] == 'estimated' and s['source'] for s in stops)
