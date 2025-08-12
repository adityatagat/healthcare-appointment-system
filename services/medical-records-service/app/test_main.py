import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "UP"

@pytest.mark.asyncio
async def test_crud_lifecycle_fhir():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create (FHIR-compliant)
        record = {
            "resourceType": "Observation",
            "id": "rec1",
            "identifier": [{"system": "http://hospital.org/medical-records", "value": "rec1"}],
            "status": "final",
            "code": {"text": "Test Observation"},
            "subject": {"reference": "Patient/pat1", "display": "Test Patient"},
            "effectiveDateTime": "2025-07-29T10:00:00+05:30",
            "performer": [{"reference": "Practitioner/prov1", "display": "Dr. Test"}],
            "valueString": "Flu - Rest"
        }
        r = await client.post("/api/v1/records/", json=record)
        assert r.status_code == 200
        # Get
        r = await client.get("/api/v1/records/rec1")
        assert r.status_code == 200
        # List
        r = await client.get("/api/v1/records/")
        assert r.status_code == 200
        assert len(r.json()) >= 1
        # Update
        record["valueString"] = "Cold - Rest"
        r = await client.put("/api/v1/records/rec1", json=record)
        assert r.status_code == 200
        assert r.json()["valueString"] == "Cold - Rest"
        # Delete
        r = await client.delete("/api/v1/records/rec1")
        assert r.status_code == 200
        # Confirm delete
        r = await client.get("/api/v1/records/rec1")
        assert r.status_code == 404

@pytest.mark.asyncio
async def test_fhir_validation_error():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Missing required FHIR fields (should fail)
        bad_record = {"id": "bad1"}
        r = await client.post("/api/v1/records/", json=bad_record)
        assert r.status_code == 422
        assert "FHIR R4 validation failed" in r.json()["detail"]
