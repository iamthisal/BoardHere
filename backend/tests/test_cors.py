from fastapi.testclient import TestClient
from app.main import app


def test_local_frontend_preflight_allowed_and_unknown_origin_denied():
    client = TestClient(app)
    headers = {'Origin': 'http://localhost:5173', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'}
    response = client.options('/recommend', headers=headers)
    assert response.status_code == 200
    assert response.headers['access-control-allow-origin'] == headers['Origin']
    assert client.options('/recommend', headers={**headers, 'Origin': 'https://unknown.example'}).status_code == 400
