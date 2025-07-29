from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "UP"

def test_crud_lifecycle():
    # Create
    record = {
        "record_id": "rec1",
        "patient_id": "pat1",
        "provider_id": "prov1",
        "diagnosis": "Flu",
        "treatment": "Rest",
        "date": "2025-07-29"
    }
    r = client.post("/api/v1/records/", json=record)
    assert r.status_code == 200
    # Get
    r = client.get("/api/v1/records/rec1")
    assert r.status_code == 200
    # List
    r = client.get("/api/v1/records/")
    assert r.status_code == 200
    assert len(r.json()) >= 1
    # Update
    record["diagnosis"] = "Cold"
    r = client.put("/api/v1/records/rec1", json=record)
    assert r.status_code == 200
    assert r.json()["diagnosis"] == "Cold"
    # Delete
    r = client.delete("/api/v1/records/rec1")
    assert r.status_code == 200
    # Confirm delete
    r = client.get("/api/v1/records/rec1")
    assert r.status_code == 404
