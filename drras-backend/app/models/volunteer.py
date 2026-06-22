import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func

from app.database import Base


class SkillType(str, enum.Enum):
    DOCTOR = "doctor"
    DRIVER = "driver"
    ENGINEER = "engineer"
    RESCUE_WORKER = "rescue_worker"


class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(15), nullable=False)
    email = Column(String(120), nullable=False)
    skill_type = Column(Enum(SkillType, name="skill_type"), nullable=False, index=True)
    city = Column(String(80), nullable=False, index=True)
    is_available = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
