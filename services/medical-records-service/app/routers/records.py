from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import logging

router = APIRouter()
logger = logging.getLogger("medical-records-service")

# Example in-memory DB
medical_records_db = {}

class MedicalRecord(BaseModel):
    record_id: str
    patient_id: str
    provider_id: str
    diagnosis: str
    treatment: str
    date: str

@router.get("/", response_model=List[MedicalRecord])
def list_records():
    logger.info("Listing all medical records")
    return list(medical_records_db.values())

@router.get("/{record_id}", response_model=MedicalRecord)
def get_record(record_id: str):
    logger.info(f"Fetching record {record_id}")
    record = medical_records_db.get(record_id)
    if not record:
        logger.warning(f"Record {record_id} not found")
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@router.post("/", response_model=MedicalRecord)
def create_record(record: MedicalRecord):
    logger.info(f"Creating record {record.record_id}")
    if record.record_id in medical_records_db:
        logger.warning(f"Record {record.record_id} already exists")
        raise HTTPException(status_code=400, detail="Record already exists")
    medical_records_db[record.record_id] = record
    return record

@router.put("/{record_id}", response_model=MedicalRecord)
def update_record(record_id: str, record: MedicalRecord):
    logger.info(f"Updating record {record_id}")
    if record_id not in medical_records_db:
        logger.warning(f"Record {record_id} not found for update")
        raise HTTPException(status_code=404, detail="Record not found")
    medical_records_db[record_id] = record
    return record

@router.delete("/{record_id}")
def delete_record(record_id: str):
    logger.info(f"Deleting record {record_id}")
    if record_id not in medical_records_db:
        logger.warning(f"Record {record_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Record not found")
    del medical_records_db[record_id]
    return {"detail": "Record deleted"}
