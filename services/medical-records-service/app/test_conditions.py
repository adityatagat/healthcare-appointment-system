import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_crud_lifecycle_condition():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create (FHIR-compliant)
        condition = {
            "resourceType": "Condition",
            "id": "cond1",
            "code": {"text": "Diabetes"},
            "subject": {"reference": "Patient/pat1", "display": "Test Patient"}
        }
        r = await client.post("/api/v1/conditions/", json=condition)
        assert r.status_code == 200
        # Get
        r = await client.get("/api/v1/conditions/cond1")
        assert r.status_code == 200
        # List
        r = await client.get("/api/v1/conditions/")
        assert r.status_code == 200
        assert len(r.json()) >= 1
        # Update
        condition["code"]["text"] = "Type 2 Diabetes"
        r = await client.put("/api/v1/conditions/cond1", json=condition)
        assert r.status_code == 200
        assert r.json()["code"]["text"] == "Type 2 Diabetes"
        # Delete
        r = await client.delete("/api/v1/conditions/cond1")
        assert r.status_code == 200
        # Confirm delete
        r = await client.get("/api/v1/conditions/cond1")
        assert r.status_code == 404

@pytest.mark.asyncio
async def test_condition_validation_error():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        bad_condition = {"id": "badcond1"}
        r = await client.post("/api/v1/conditions/", json=bad_condition)
        assert r.status_code == 422
        assert "FHIR Condition validation failed" in r.json()["detail"]
