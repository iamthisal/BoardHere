from fastapi.testclient import TestClient
from psycopg import OperationalError
from app.main import app
from app import database

client = TestClient(app)


def test_health_connects_to_real_postgres():
    assert client.get("/health").json() == {"status": "ok", "database": "connected"}


def test_database_error_does_not_leak_credentials(monkeypatch):
    def fail(*args):
        raise OperationalError("private credential")
    monkeypatch.setattr(database, "read", fail)
    response = client.get("/health")
    assert response.status_code == 503
    assert "private" not in response.text
