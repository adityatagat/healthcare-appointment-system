import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_crud_lifecycle_procedure():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create (FHIR-compliant)
        procedure = {
            "resourceType": "Procedure",
            "id": "proc1",
            "status": "completed",
            "code": {"text": "Appendectomy"},
            "subject": {"reference": "Patient/pat2", "display": "Test Patient 2"}
        }
        r = await client.post("/api/v1/procedures/", json=procedure)
        assert r.status_code == 200
        # Get
        r = await client.get("/api/v1/procedures/proc1")
        assert r.status_code == 200
        # List
        r = await client.get("/api/v1/procedures/")
        assert r.status_code == 200
        assert len(r.json()) >= 1
        # Update
        procedure["code"]["text"] = "Laparoscopic Appendectomy"
        r = await client.put("/api/v1/procedures/proc1", json=procedure)
        assert r.status_code == 200
        assert r.json()["code"]["text"] == "Laparoscopic Appendectomy"
        # Delete
        r = await client.delete("/api/v1/procedures/proc1")
        assert r.status_code == 200
        # Confirm delete
        r = await client.get("/api/v1/procedures/proc1")
        assert r.status_code == 404

@pytest.mark.asyncio
async def test_procedure_validation_error():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        bad_procedure = {"id": "badproc1"}
        r = await client.post("/api/v1/procedures/", json=bad_procedure)
        assert r.status_code == 422
        assert "FHIR Procedure validation failed" in r.json()["detail"]
