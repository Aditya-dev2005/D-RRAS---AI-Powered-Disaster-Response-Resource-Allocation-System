from typing import List
from pydantic import BaseModel
from app.models.resource import ResourceType


class AllocationItem(BaseModel):
    request_id: int
    city: str
    quantity_allocated: int
    priority_score: int


class AllocationResponse(BaseModel):
    resource_type: ResourceType
    total_capacity: int
    capacity_used: int
    total_priority_value_served: int
    allocations: List[AllocationItem]
    unserved_request_ids: List[int]


class MatchAssignment(BaseModel):
    request_id: int
    volunteer_id: int
    volunteer_name: str
    skill_type: str
    city: str


class MatchResponse(BaseModel):
    total_assignments: int
    assignments: List[MatchAssignment]
    unmatched_request_ids: List[int]
