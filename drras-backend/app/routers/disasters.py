from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.disaster import Disaster, DisasterStatus
from app.models.user import User
from app.schemas.disaster import DisasterCreate, DisasterUpdate, DisasterOut
from app.core.deps import get_current_user, require_admin

router = APIRouter(prefix="/disasters", tags=["Disasters"])


@router.post("/", response_model=DisasterOut, status_code=status.HTTP_201_CREATED)
def create_disaster(
    payload: DisasterCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    disaster = Disaster(**payload.model_dump())
    db.add(disaster)
    db.commit()
    db.refresh(disaster)
    return disaster


@router.get("/", response_model=List[DisasterOut])
def list_disasters(
    status_filter: Optional[DisasterStatus] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Disaster)
    if status_filter:
        query = query.filter(Disaster.status == status_filter)
    if city:
        query = query.filter(Disaster.city.ilike(f"%{city}%"))
    return query.order_by(Disaster.severity.desc()).all()


@router.get("/{disaster_id}", response_model=DisasterOut)
def get_disaster(disaster_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    disaster = db.query(Disaster).filter(Disaster.id == disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found.")
    return disaster


@router.put("/{disaster_id}", response_model=DisasterOut)
def update_disaster(
    disaster_id: int,
    payload: DisasterUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    disaster = db.query(Disaster).filter(Disaster.id == disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(disaster, field, value)

    db.commit()
    db.refresh(disaster)
    return disaster


@router.delete("/{disaster_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_disaster(disaster_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    disaster = db.query(Disaster).filter(Disaster.id == disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found.")
    db.delete(disaster)
    db.commit()
