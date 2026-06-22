import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class DisasterType(str, enum.Enum):
    FLOOD = "flood"
    EARTHQUAKE = "earthquake"
    FIRE = "fire"
    HURRICANE = "hurricane"
    TORNADO = "tornado"
    TSUNAMI = "tsunami"
    OTHER = "other"


class DisasterStatus(str, enum.Enum):
    ACTIVE = "active"
    CONTAINED = "contained"
    RESOLVED = "resolved"


class Disaster(Base):
    __tablename__ = "disasters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    type = Column(Enum(DisasterType, name="disaster_type"), nullable=False, index=True)
    severity = Column(Integer, nullable=False)  # 1 (low) - 10 (catastrophic)
    city = Column(String(80), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(
        Enum(DisasterStatus, name="disaster_status"),
        default=DisasterStatus.ACTIVE,
        nullable=False,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    requests = relationship(
        "EmergencyRequest", back_populates="disaster", cascade="all, delete-orphan"
    )
