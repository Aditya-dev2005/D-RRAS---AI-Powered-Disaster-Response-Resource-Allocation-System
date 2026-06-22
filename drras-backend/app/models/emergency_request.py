import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(Integer, primary_key=True, index=True)
    disaster_id = Column(
        Integer, ForeignKey("disasters.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requester_name = Column(String(100), nullable=False)
    phone = Column(String(15), nullable=False)
    city = Column(String(80), nullable=False, index=True)
    location = Column(String(200), nullable=False)

    population_affected = Column(Integer, default=0, nullable=False)
    food_needed = Column(Integer, default=0, nullable=False)
    water_needed = Column(Integer, default=0, nullable=False)
    medicine_needed = Column(Integer, default=0, nullable=False)
    ambulances_needed = Column(Integer, default=0, nullable=False)

    priority_score = Column(Integer, default=0, nullable=False, index=True)
    status = Column(
        Enum(RequestStatus, name="request_status"),
        default=RequestStatus.PENDING,
        nullable=False,
        index=True,
    )
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    disaster = relationship("Disaster", back_populates="requests")
