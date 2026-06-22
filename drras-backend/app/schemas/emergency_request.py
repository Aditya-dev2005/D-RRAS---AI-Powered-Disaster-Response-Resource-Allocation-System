from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.emergency_request import RequestStatus


class EmergencyRequestCreate(BaseModel):
    disaster_id: int
    requester_name: str
    phone: str = Field(min_length=10, max_length=15)
    city: str
    location: str
    population_affected: int = Field(default=0, ge=0)
    food_needed: int = Field(default=0, ge=0)
    water_needed: int = Field(default=0, ge=0)
    medicine_needed: int = Field(default=0, ge=0)
    ambulances_needed: int = Field(default=0, ge=0)
    comments: Optional[str] = None


class EmergencyRequestStatusUpdate(BaseModel):
    status: RequestStatus


class EmergencyRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    disaster_id: int
    requester_name: str
    phone: str
    city: str
    location: str
    population_affected: int
    food_needed: int
    water_needed: int
    medicine_needed: int
    ambulances_needed: int
    priority_score: int
    status: RequestStatus
    comments: Optional[str]
    created_at: datetime
