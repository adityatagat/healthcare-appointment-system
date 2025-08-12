from fastapi import APIRouter, HTTPException, status
from pydantic import ValidationError
from typing import List
import logging
from app.routers.fhir_models import FHIRCondition

router = APIRouter()
logger = logging.getLogger("medical-records-service")

from app.db import db
from bson import ObjectId

COLLECTION = db["conditions"]

def condition_bson_to_pydantic(doc):
    if not doc:
        return None
    doc = dict(doc)
    doc["id"] = str(doc.get("id") or doc.get("_id"))
    doc.pop("_id", None)
    return FHIRCondition(**doc)

@router.get("/", response_model=List[FHIRCondition])
async def list_conditions():
    logger.info("Listing all conditions (MongoDB)")
    docs = await COLLECTION.find().to_list(length=100)
    return [condition_bson_to_pydantic(doc) for doc in docs]

@router.get("/{condition_id}", response_model=FHIRCondition)
async def get_condition(condition_id: str):
    logger.info(f"Fetching condition {condition_id} (MongoDB)")
    doc = await COLLECTION.find_one({"id": condition_id})
    if not doc:
        logger.warning(f"Condition {condition_id} not found")
        raise HTTPException(status_code=404, detail="Condition not found")
    return condition_bson_to_pydantic(doc)

@router.post("/", response_model=FHIRCondition)
async def create_condition(condition: dict):
    logger.info(f"Creating condition (id: {condition.get('id', 'N/A')}) (MongoDB)")
    try:
        validated = FHIRCondition(**condition)
    except ValidationError as e:
        logger.error(f"FHIR Condition validation failed: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"FHIR Condition validation failed: {e.errors()}")
    exists = await COLLECTION.find_one({"id": validated.id})
    if exists:
        logger.warning(f"Condition {validated.id} already exists")
        raise HTTPException(status_code=400, detail="Condition already exists")
    doc = validated.model_dump()
    await COLLECTION.insert_one(doc)
    return validated

@router.put("/{condition_id}", response_model=FHIRCondition)
async def update_condition(condition_id: str, condition: dict):
    logger.info(f"Updating condition {condition_id} (MongoDB)")
    try:
        validated = FHIRCondition(**condition)
    except ValidationError as e:
        logger.error(f"FHIR Condition validation failed: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"FHIR Condition validation failed: {e.errors()}")
    result = await COLLECTION.replace_one({"id": condition_id}, validated.model_dump())
    if result.matched_count == 0:
        logger.warning(f"Condition {condition_id} not found for update")
        raise HTTPException(status_code=404, detail="Condition not found")
    return validated

@router.delete("/{condition_id}")
async def delete_condition(condition_id: str):
    logger.info(f"Deleting condition {condition_id} (MongoDB)")
    result = await COLLECTION.delete_one({"id": condition_id})
    if result.deleted_count == 0:
        logger.warning(f"Condition {condition_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Condition not found")
    return {"detail": "Condition deleted"}
