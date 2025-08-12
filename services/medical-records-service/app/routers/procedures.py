from fastapi import APIRouter, HTTPException, status
from pydantic import ValidationError
from typing import List
import logging
from app.routers.fhir_models import FHIRProcedure

router = APIRouter()
logger = logging.getLogger("medical-records-service")

from app.db import db
from bson import ObjectId

COLLECTION = db["procedures"]

def procedure_bson_to_pydantic(doc):
    if not doc:
        return None
    doc = dict(doc)
    doc["id"] = str(doc.get("id") or doc.get("_id"))
    doc.pop("_id", None)
    return FHIRProcedure(**doc)

@router.get("/", response_model=List[FHIRProcedure])
async def list_procedures():
    logger.info("Listing all procedures (MongoDB)")
    docs = await COLLECTION.find().to_list(length=100)
    return [procedure_bson_to_pydantic(doc) for doc in docs]

@router.get("/{procedure_id}", response_model=FHIRProcedure)
async def get_procedure(procedure_id: str):
    logger.info(f"Fetching procedure {procedure_id} (MongoDB)")
    doc = await COLLECTION.find_one({"id": procedure_id})
    if not doc:
        logger.warning(f"Procedure {procedure_id} not found")
        raise HTTPException(status_code=404, detail="Procedure not found")
    return procedure_bson_to_pydantic(doc)

@router.post("/", response_model=FHIRProcedure)
async def create_procedure(procedure: dict):
    logger.info(f"Creating procedure (id: {procedure.get('id', 'N/A')}) (MongoDB)")
    try:
        validated = FHIRProcedure(**procedure)
    except ValidationError as e:
        logger.error(f"FHIR Procedure validation failed: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"FHIR Procedure validation failed: {e.errors()}")
    exists = await COLLECTION.find_one({"id": validated.id})
    if exists:
        logger.warning(f"Procedure {validated.id} already exists")
        raise HTTPException(status_code=400, detail="Procedure already exists")
    doc = validated.model_dump()
    await COLLECTION.insert_one(doc)
    return validated

@router.put("/{procedure_id}", response_model=FHIRProcedure)
async def update_procedure(procedure_id: str, procedure: dict):
    logger.info(f"Updating procedure {procedure_id} (MongoDB)")
    try:
        validated = FHIRProcedure(**procedure)
    except ValidationError as e:
        logger.error(f"FHIR Procedure validation failed: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"FHIR Procedure validation failed: {e.errors()}")
    result = await COLLECTION.replace_one({"id": procedure_id}, validated.model_dump())
    if result.matched_count == 0:
        logger.warning(f"Procedure {procedure_id} not found for update")
        raise HTTPException(status_code=404, detail="Procedure not found")
    return validated

@router.delete("/{procedure_id}")
async def delete_procedure(procedure_id: str):
    logger.info(f"Deleting procedure {procedure_id} (MongoDB)")
    result = await COLLECTION.delete_one({"id": procedure_id})
    if result.deleted_count == 0:
        logger.warning(f"Procedure {procedure_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Procedure not found")
    return {"detail": "Procedure deleted"}
