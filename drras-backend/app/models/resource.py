import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func

from app.database import Base


class ResourceType(str, enum.Enum):
    FOOD = "food"
    WATER = "water"
    MEDICINE = "medicine"
    AMBULANCE = "ambulance"


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(ResourceType, name="resource_type"), nullable=False, index=True)
    city = Column(String(80), nullable=False, index=True)
    quantity_available = Column(Integer, default=0, nullable=False)
    unit = Column(String(20), default="units", nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
