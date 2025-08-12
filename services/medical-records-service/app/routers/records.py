from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import logging

router = APIRouter()
logger = logging.getLogger("medical-records-service")

from app.db import db
from bson import ObjectId

COLLECTION = db["observations"]

# Utility for BSON <-> Pydantic

def observation_bson_to_pydantic(doc):
    if not doc:
        return None
    doc = dict(doc)
    doc["id"] = str(doc.get("id") or doc.get("_id"))
    doc.pop("_id", None)
    return FHIRMedicalRecord(**doc)

from app.routers.fhir_models import FHIRMedicalRecord

# Replace all usages of MedicalRecord with FHIRMedicalRecord for FHIR R4 compliance.

from fastapi import status
from pydantic import ValidationError
from fastapi import Depends
from typing import List

from fastapi import BackgroundTasks

@router.get("/", response_model=List[FHIRMedicalRecord])
async def list_records():
    logger.info("Listing all medical records (MongoDB)")
    docs = await COLLECTION.find().to_list(length=100)
    return [observation_bson_to_pydantic(doc) for doc in docs]

@router.get("/{record_id}", response_model=FHIRMedicalRecord)
async def get_record(record_id: str):
    logger.info(f"Fetching record {record_id} (MongoDB)")
    doc = await COLLECTION.find_one({"id": record_id})
    if not doc:
        logger.warning(f"Record {record_id} not found")
        raise HTTPException(status_code=404, detail="Record not found")
    return observation_bson_to_pydantic(doc)

@router.post("/", response_model=FHIRMedicalRecord)
async def create_record(record: dict):
    logger.info(f"Creating record (id: {record.get('id', 'N/A')}) (MongoDB)")
    try:
        validated = FHIRMedicalRecord(**record)
    except ValidationError as e:
        logger.error(f"FHIR validation failed: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"FHIR R4 validation failed: {e.errors()}")
    exists = await COLLECTION.find_one({"id": validated.id})
    if exists:
        logger.warning(f"Record {validated.id} already exists")
        raise HTTPException(status_code=400, detail="Record already exists")
    doc = validated.model_dump()
    await COLLECTION.insert_one(doc)
    return validated

@router.put("/{record_id}", response_model=FHIRMedicalRecord)
async def update_record(record_id: str, record: dict):
    logger.info(f"Updating record {record_id} (MongoDB)")
    try:
        validated = FHIRMedicalRecord(**record)
    except ValidationError as e:
        logger.error(f"FHIR validation failed: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"FHIR R4 validation failed: {e.errors()}")
    result = await COLLECTION.replace_one({"id": record_id}, validated.model_dump())
    if result.matched_count == 0:
        logger.warning(f"Record {record_id} not found for update")
        raise HTTPException(status_code=404, detail="Record not found")
    return validated

@router.delete("/{record_id}")
async def delete_record(record_id: str):
    logger.info(f"Deleting record {record_id} (MongoDB)")
    result = await COLLECTION.delete_one({"id": record_id})
    if result.deleted_count == 0:
        logger.warning(f"Record {record_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Record not found")
    return {"detail": "Record deleted"}

@router.delete("/{record_id}")
def delete_record(record_id: str):
    logger.info(f"Deleting record {record_id}")
    if record_id not in medical_records_db:
        logger.warning(f"Record {record_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Record not found")
    del medical_records_db[record_id]
    return {"detail": "Record deleted"}
