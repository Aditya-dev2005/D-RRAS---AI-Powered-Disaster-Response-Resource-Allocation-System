from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.resource import ResourceType


class ResourceCreate(BaseModel):
    type: ResourceType
    city: str
    quantity_available: int = Field(ge=0)
    unit: str = "units"


class ResourceUpdate(BaseModel):
    quantity_available: int = Field(ge=0)


class ResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: ResourceType
    city: str
    quantity_available: int
    unit: str
    updated_at: datetime
