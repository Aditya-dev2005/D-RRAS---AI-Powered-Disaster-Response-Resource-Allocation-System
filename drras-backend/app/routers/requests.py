from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.disaster import Disaster
from app.models.emergency_request import EmergencyRequest, RequestStatus
from app.models.user import User
from app.schemas.emergency_request import (
    EmergencyRequestCreate,
    EmergencyRequestStatusUpdate,
    EmergencyRequestOut,
)
from app.core.deps import get_current_user, require_admin

router = APIRouter(prefix="/requests", tags=["Emergency Requests"])


def calculate_priority_score(disaster: Disaster, population_affected: int) -> int:
    """
    Deterministic priority scoring (0-100), inspired by the original D-RRAS
    AI-priority heuristic: disaster severity dominates, population affected
    adds a capped bonus.
    """
    score = disaster.severity * 7  # severity 1-10 -> up to 70
    score += min(population_affected // 20, 30)  # capped bonus, up to 30
    return min(score, 100)


@router.post("/", response_model=EmergencyRequestOut, status_code=status.HTTP_201_CREATED)
def create_request(
    payload: EmergencyRequestCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    disaster = db.query(Disaster).filter(Disaster.id == payload.disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Referenced disaster does not exist.")

    priority = calculate_priority_score(disaster, payload.population_affected)

    req = EmergencyRequest(**payload.model_dump(), priority_score=priority)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("/", response_model=List[EmergencyRequestOut])
def list_requests(
    status_filter: Optional[RequestStatus] = None,
    disaster_id: Optional[int] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(EmergencyRequest)
    if status_filter:
        query = query.filter(EmergencyRequest.status == status_filter)
    if disaster_id:
        query = query.filter(EmergencyRequest.disaster_id == disaster_id)
    if city:
        query = query.filter(EmergencyRequest.city.ilike(f"%{city}%"))
    return query.order_by(EmergencyRequest.priority_score.desc()).all()


@router.get("/{request_id}", response_model=EmergencyRequestOut)
def get_request(request_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    return req


@router.patch("/{request_id}/status", response_model=EmergencyRequestOut)
def update_request_status(
    request_id: int,
    payload: EmergencyRequestStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    req.status = payload.status
    db.commit()
    db.refresh(req)
    return req


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(request_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    db.delete(req)
    db.commit()
