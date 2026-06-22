from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.resource import Resource, ResourceType
from app.models.user import User
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceOut
from app.core.deps import get_current_user, require_admin

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.post("/", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
def create_resource(
    payload: ResourceCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    resource = Resource(**payload.model_dump())
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


@router.get("/", response_model=List[ResourceOut])
def list_resources(
    type_filter: Optional[ResourceType] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Resource)
    if type_filter:
        query = query.filter(Resource.type == type_filter)
    if city:
        query = query.filter(Resource.city.ilike(f"%{city}%"))
    return query.all()


@router.put("/{resource_id}", response_model=ResourceOut)
def update_resource_quantity(
    resource_id: int,
    payload: ResourceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found.")
    resource.quantity_available = payload.quantity_available
    db.commit()
    db.refresh(resource)
    return resource
