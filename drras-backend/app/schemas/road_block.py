from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class RoadBlockCreate(BaseModel):
    city_from: str
    city_to: str
    distance_km: float = Field(gt=0)
    traffic_level: int = Field(default=1, ge=1, le=10)
    is_blocked: bool = False


class RoadBlockTrafficUpdate(BaseModel):
    traffic_level: int = Field(ge=1, le=10)


class RoadBlockOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    city_from: str
    city_to: str
    distance_km: float
    traffic_level: int
    is_blocked: bool
    updated_at: datetime
