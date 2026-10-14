from fastapi.testclient import TestClient
from app.main import app
from test_recommend import BODY

client = TestClient(app)


def test_explain_matches_recommendation_for_same_context():
    result = client.post('/recommend', json=BODY).json()
    option = result['options'][0]
    params = {'origin_lat': BODY['origin']['lat'], 'origin_lng': BODY['origin']['lng'],
        'preference': BODY['preference'], 'minutes_available': BODY['minutes_available'], 'now': BODY['now']}
    response = client.get(f"/explain/{option['id']}", params=params)
    assert response.status_code == 200
    explanation = response.json()
    assert explanation['criteria'] == option['score_breakdown']
    assert explanation['score'] == option['score']
    assert explanation['now'] == result['now']
    assert client.get('/explain/unknown').status_code == 404
    assert client.get(f"/explain/{option['id']}", params={'now': '2026-10-14T08:00:00'}).status_code == 422
