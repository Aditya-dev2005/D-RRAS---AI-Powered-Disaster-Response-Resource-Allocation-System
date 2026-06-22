from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.disaster import DisasterType, DisasterStatus


class DisasterCreate(BaseModel):
    name: str
    type: DisasterType
    severity: int = Field(ge=1, le=10)
    city: str
    description: Optional[str] = None


class DisasterUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[DisasterType] = None
    severity: Optional[int] = Field(default=None, ge=1, le=10)
    city: Optional[str] = None
    description: Optional[str] = None
    status: Optional[DisasterStatus] = None


class DisasterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: DisasterType
    severity: int
    city: str
    description: Optional[str]
    status: DisasterStatus
    created_at: datetime
    updated_at: Optional[datetime]
