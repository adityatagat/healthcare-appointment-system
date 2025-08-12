"""
Seed script to populate the in-memory medical records database for local development or integration testing.
"""
import asyncio
import sys
import os

# Ensure the parent directory is in sys.path for 'app' imports when run as a script
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/../'))
from app.db import db
from app.routers.fhir_models import FHIRMedicalRecord, FHIRIdentifier, FHIRReference, FHIRCodeableConcept

# Seed FHIR Observation records (Medical Records)
sample_records = [
    FHIRMedicalRecord(
        id="rec100",
        identifier=[FHIRIdentifier(system="http://hospital.org/medical-records", value="rec100")],
        status="final",
        code=FHIRCodeableConcept(text="Blood Pressure Observation"),
        subject=FHIRReference(reference="Patient/pat100", display="John Doe"),
        effectiveDateTime="2025-07-01T09:00:00+05:30",
        performer=[FHIRReference(reference="Practitioner/prov100", display="Dr. Smith")],
        valueString="Hypertension - Medication"
    ),
    FHIRMedicalRecord(
        id="rec101",
        identifier=[FHIRIdentifier(system="http://hospital.org/medical-records", value="rec101")],
        status="final",
        code=FHIRCodeableConcept(text="Blood Glucose Observation"),
        subject=FHIRReference(reference="Patient/pat101", display="Jane Roe"),
        effectiveDateTime="2025-07-02T10:30:00+05:30",
        performer=[FHIRReference(reference="Practitioner/prov101", display="Dr. Lee")],
        valueString="Diabetes - Insulin"
    ),
    FHIRMedicalRecord(
        id="rec102",
        identifier=[FHIRIdentifier(system="http://hospital.org/medical-records", value="rec102")],
        status="final",
        code=FHIRCodeableConcept(text="Peak Expiratory Flow"),
        subject=FHIRReference(reference="Patient/pat102", display="Sam Smith"),
        effectiveDateTime="2025-07-03T08:15:00+05:30",
        performer=[FHIRReference(reference="Practitioner/prov102", display="Dr. Patel")],
        valueString="Asthma - Inhaler"
    ),
]

# Seed FHIR Condition records
condition_records = [
    {
        "resourceType": "Condition",
        "id": "cond100",
        "code": {"text": "Diabetes Mellitus"},
        "subject": {"reference": "Patient/pat100", "display": "John Doe"},
        "clinicalStatus": {"text": "active"},
        "onsetDateTime": "2023-01-01T00:00:00+05:30"
    },
    {
        "resourceType": "Condition",
        "id": "cond101",
        "code": {"text": "Hypertension"},
        "subject": {"reference": "Patient/pat101", "display": "Jane Roe"},
        "clinicalStatus": {"text": "remission"},
        "onsetDateTime": "2022-05-10T00:00:00+05:30"
    }
]

# Seed FHIR Procedure records
procedure_records = [
    {
        "resourceType": "Procedure",
        "id": "proc100",
        "status": "completed",
        "code": {"text": "Appendectomy"},
        "subject": {"reference": "Patient/pat100", "display": "John Doe"},
        "performedDateTime": "2024-03-15T08:00:00+05:30",
        "performer": [{"reference": "Practitioner/prov100", "display": "Dr. Smith"}]
    },
    {
        "resourceType": "Procedure",
        "id": "proc101",
        "status": "completed",
        "code": {"text": "Coronary Bypass Surgery"},
        "subject": {"reference": "Patient/pat101", "display": "Jane Roe"},
        "performedDateTime": "2023-11-20T10:00:00+05:30",
        "performer": [{"reference": "Practitioner/prov101", "display": "Dr. Lee"}]
    }
]

async def seed_medical_records():
    # Observation (medical records)
    obs_collection = db["observations"]
    await obs_collection.delete_many({})
    obs_docs = [rec.model_dump() for rec in sample_records]
    if obs_docs:
        await obs_collection.insert_many(obs_docs)
    print(f"Seeded {len(obs_docs)} FHIR R4 medical records (Observation).")

    # Condition
    cond_collection = db["conditions"]
    await cond_collection.delete_many({})
    if condition_records:
        await cond_collection.insert_many(condition_records)
    print(f"Seeded {len(condition_records)} FHIR R4 Condition records.")

    # Procedure
    proc_collection = db["procedures"]
    await proc_collection.delete_many({})
    if procedure_records:
        await proc_collection.insert_many(procedure_records)
    print(f"Seeded {len(procedure_records)} FHIR R4 Procedure records.")

if __name__ == "__main__":
    asyncio.run(seed_medical_records())
