from typing import List
from pydantic import BaseModel


class RouteResponse(BaseModel):
    source: str
    destination: str
    path: List[str]
    total_distance_km: float
    algorithm: str
    nodes_explored: int
