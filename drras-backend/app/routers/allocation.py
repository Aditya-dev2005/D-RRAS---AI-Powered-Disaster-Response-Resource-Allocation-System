from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.emergency_request import EmergencyRequest, RequestStatus
from app.models.resource import ResourceType
from app.models.user import User
from app.schemas.allocation import AllocationResponse, AllocationItem
from app.core.deps import get_current_user
from app.services.knapsack_service import KnapsackItem, solve_knapsack

router = APIRouter(prefix="/allocation", tags=["Resource Allocation"])

# Maps a ResourceType to the matching column on EmergencyRequest.
_RESOURCE_FIELD = {
    ResourceType.FOOD: "food_needed",
    ResourceType.WATER: "water_needed",
    ResourceType.MEDICINE: "medicine_needed",
    ResourceType.AMBULANCE: "ambulances_needed",
}


@router.post("/optimize", response_model=AllocationResponse)
def optimize_allocation(
    resource_type: ResourceType = Query(...),
    capacity: int = Query(..., gt=0, description="Total units of this resource available to dispatch"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    0/1 Knapsack resource allocation: pick which PENDING requests to fully
    serve with a limited supply of one resource, maximizing total priority
    value served.
    """
    field_name = _RESOURCE_FIELD[resource_type]
    pending = (
        db.query(EmergencyRequest)
        .filter(EmergencyRequest.status == RequestStatus.PENDING)
        .all()
    )

    items = [
        KnapsackItem(
            request_id=r.id, city=r.city, weight=getattr(r, field_name), value=r.priority_score
        )
        for r in pending
        if getattr(r, field_name) > 0
    ]

    selected, total_value, capacity_used = solve_knapsack(items, capacity)
    selected_ids = {it.request_id for it in selected}
    unserved = [it.request_id for it in items if it.request_id not in selected_ids]

    return AllocationResponse(
        resource_type=resource_type,
        total_capacity=capacity,
        capacity_used=capacity_used,
        total_priority_value_served=total_value,
        allocations=[
            AllocationItem(
                request_id=it.request_id, city=it.city, quantity_allocated=it.weight,
                priority_score=it.value,
            )
            for it in selected
        ],
        unserved_request_ids=unserved,
    )
