import pytest
from app.db import db
from app.seed_data import seed_medical_records

@pytest.fixture(autouse=True, scope="function")
async def mongo_clean_and_seed():
    await db["observations"].delete_many({})
    await db["conditions"].delete_many({})
    await db["procedures"].delete_many({})
    await seed_medical_records()
    yield
    await db["observations"].delete_many({})
    await db["conditions"].delete_many({})
    await db["procedures"].delete_many({})
