import pytest
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app



@pytest.mark.asyncio
async def test_list_seeded_records():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/records/")
        assert response.status_code == 200
        records = response.json()
        assert len(records) >= 3
        ids = [r["id"] for r in records]
        assert "rec100" in ids and "rec101" in ids and "rec102" in ids
        # FHIR compliance: check resourceType and key fields
        for rec in records:
            assert rec["resourceType"] == "Observation"
            assert "subject" in rec and "effectiveDateTime" in rec

@pytest.mark.asyncio
async def test_get_seeded_record():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/records/rec100")
        assert response.status_code == 200
        rec = response.json()
        assert rec["id"] == "rec100"
        assert rec["resourceType"] == "Observation"
        assert rec["subject"]["reference"].startswith("Patient/")
        assert rec["performer"][0]["reference"] == "Practitioner/prov100"
        assert rec["valueString"].startswith("Hypertension")

@pytest.mark.asyncio
async def test_delete_seeded_record():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.delete("/api/v1/records/rec100")
        assert response.status_code == 200
        resp = response.json()
        assert resp["detail"] == "Record deleted"
        # Confirm deletion
        response2 = await client.get("/api/v1/records/rec100")
        assert response2.status_code == 404
