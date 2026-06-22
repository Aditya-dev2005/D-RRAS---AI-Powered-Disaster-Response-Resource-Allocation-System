from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.road_block import RoadBlock
from app.models.user import User
from app.schemas.road_block import RoadBlockCreate, RoadBlockTrafficUpdate, RoadBlockOut
from app.core.deps import get_current_user, require_admin

router = APIRouter(prefix="/roadblocks", tags=["Road Network"])


@router.post("/", response_model=RoadBlockOut, status_code=status.HTTP_201_CREATED)
def create_road_segment(
    payload: RoadBlockCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    """Adds a new edge to the city graph (e.g. when a new route is mapped)."""
    road = RoadBlock(**payload.model_dump())
    db.add(road)
    db.commit()
    db.refresh(road)
    return road


@router.get("/", response_model=List[RoadBlockOut])
def list_road_segments(
    blocked_only: bool = False, db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    query = db.query(RoadBlock)
    if blocked_only:
        query = query.filter(RoadBlock.is_blocked.is_(True))
    return query.all()


@router.patch("/{road_id}/block", response_model=RoadBlockOut)
def block_road(road_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    road = db.query(RoadBlock).filter(RoadBlock.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road segment not found.")
    road.is_blocked = True
    db.commit()
    db.refresh(road)
    return road


@router.patch("/{road_id}/unblock", response_model=RoadBlockOut)
def unblock_road(road_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    road = db.query(RoadBlock).filter(RoadBlock.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road segment not found.")
    road.is_blocked = False
    db.commit()
    db.refresh(road)
    return road


@router.patch("/{road_id}/traffic", response_model=RoadBlockOut)
def set_traffic_level(
    road_id: int,
    payload: RoadBlockTrafficUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    road = db.query(RoadBlock).filter(RoadBlock.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road segment not found.")
    road.traffic_level = payload.traffic_level
    db.commit()
    db.refresh(road)
    return road
