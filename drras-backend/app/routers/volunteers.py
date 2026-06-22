from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.volunteer import Volunteer, SkillType
from app.models.user import User
from app.schemas.volunteer import VolunteerCreate, VolunteerAvailabilityUpdate, VolunteerOut
from app.core.deps import get_current_user, require_admin

router = APIRouter(prefix="/volunteers", tags=["Volunteers"])


@router.post("/", response_model=VolunteerOut, status_code=status.HTTP_201_CREATED)
def register_volunteer(
    payload: VolunteerCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    volunteer = Volunteer(**payload.model_dump())
    db.add(volunteer)
    db.commit()
    db.refresh(volunteer)
    return volunteer


@router.get("/", response_model=List[VolunteerOut])
def list_volunteers(
    skill: Optional[SkillType] = None,
    city: Optional[str] = None,
    available_only: bool = False,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Volunteer)
    if skill:
        query = query.filter(Volunteer.skill_type == skill)
    if city:
        query = query.filter(Volunteer.city.ilike(f"%{city}%"))
    if available_only:
        query = query.filter(Volunteer.is_available.is_(True))
    return query.all()


@router.patch("/{volunteer_id}/availability", response_model=VolunteerOut)
def update_availability(
    volunteer_id: int,
    payload: VolunteerAvailabilityUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found.")
    volunteer.is_available = payload.is_available
    db.commit()
    db.refresh(volunteer)
    return volunteer
