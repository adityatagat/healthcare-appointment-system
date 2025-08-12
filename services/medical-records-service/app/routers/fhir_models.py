from pydantic import BaseModel, Field
from typing import List, Optional

class FHIRIdentifier(BaseModel):
    system: Optional[str] = Field(None, example="http://hospital.org/medical-records")
    value: str

class FHIRReference(BaseModel):
    reference: str
    display: Optional[str] = None

class FHIRCodeableConcept(BaseModel):
    coding: Optional[List[dict]] = None
    text: Optional[str] = None

class FHIRPeriod(BaseModel):
    start: Optional[str] = None
    end: Optional[str] = None

class FHIRResourceMeta(BaseModel):
    versionId: Optional[str] = None
    lastUpdated: Optional[str] = None

from typing import Literal

class FHIRMedicalRecord(BaseModel):
    resourceType: Literal["Observation"] = "Observation"
    id: str
    meta: Optional[FHIRResourceMeta] = None
    identifier: Optional[List[FHIRIdentifier]] = None
    status: str = Field(default="final", json_schema_extra={"example": "final"})
    category: Optional[List[FHIRCodeableConcept]] = None
    code: FHIRCodeableConcept
    subject: FHIRReference  # Patient
    effectiveDateTime: str
    performer: Optional[List[FHIRReference]] = None  # Providers
    valueString: Optional[str] = None  # e.g. diagnosis/treatment summary
    note: Optional[List[dict]] = None

class FHIRCondition(BaseModel):
    resourceType: Literal["Condition"] = "Condition"
    id: str
    meta: Optional[FHIRResourceMeta] = None
    identifier: Optional[List[FHIRIdentifier]] = None
    clinicalStatus: Optional[FHIRCodeableConcept] = None
    verificationStatus: Optional[FHIRCodeableConcept] = None
    category: Optional[List[FHIRCodeableConcept]] = None
    severity: Optional[FHIRCodeableConcept] = None
    code: FHIRCodeableConcept
    subject: FHIRReference
    onsetDateTime: Optional[str] = None
    abatementDateTime: Optional[str] = None
    recorder: Optional[FHIRReference] = None
    asserter: Optional[FHIRReference] = None
    note: Optional[List[dict]] = None

class FHIRProcedure(BaseModel):
    resourceType: Literal["Procedure"] = "Procedure"
    id: str
    meta: Optional[FHIRResourceMeta] = None
    identifier: Optional[List[FHIRIdentifier]] = None
    status: str = Field(default="completed", json_schema_extra={"example": "completed"})
    category: Optional[FHIRCodeableConcept] = None
    code: FHIRCodeableConcept
    subject: FHIRReference
    performedDateTime: Optional[str] = None
    performer: Optional[List[FHIRReference]] = None
    reasonCode: Optional[List[FHIRCodeableConcept]] = None
    note: Optional[List[dict]] = None
