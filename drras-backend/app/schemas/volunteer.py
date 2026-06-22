from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.models.volunteer import SkillType


class VolunteerCreate(BaseModel):
    name: str
    phone: str = Field(min_length=10, max_length=15)
    email: EmailStr
    skill_type: SkillType
    city: str


class VolunteerAvailabilityUpdate(BaseModel):
    is_available: bool


class VolunteerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: str
    email: EmailStr
    skill_type: SkillType
    city: str
    is_available: bool
    created_at: datetime
