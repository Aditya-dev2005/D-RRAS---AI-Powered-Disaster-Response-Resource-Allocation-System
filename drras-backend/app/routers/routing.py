from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.routing import RouteResponse
from app.core.deps import get_current_user
from app.services import graph_service

router = APIRouter(prefix="/routing", tags=["Route Optimization"])


@router.get("/shortest", response_model=RouteResponse)
def shortest_route(
    source: str = Query(...),
    destination: str = Query(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Dijkstra's algorithm - minimizes raw distance, ignoring blocked roads."""
    try:
        path, distance, nodes_explored = graph_service.dijkstra(db, source, destination, safest=False)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return RouteResponse(
        source=source, destination=destination, path=path,
        total_distance_km=distance, algorithm="dijkstra_shortest", nodes_explored=nodes_explored,
    )


@router.get("/safest", response_model=RouteResponse)
def safest_route(
    source: str = Query(...),
    destination: str = Query(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Dijkstra variant that also penalizes high-traffic roads, trading distance for safety."""
    try:
        path, distance, nodes_explored = graph_service.dijkstra(db, source, destination, safest=True)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return RouteResponse(
        source=source, destination=destination, path=path,
        total_distance_km=distance, algorithm="dijkstra_safest", nodes_explored=nodes_explored,
    )


@router.get("/astar", response_model=RouteResponse)
def astar_route(
    source: str = Query(...),
    destination: str = Query(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """A* search guided by a haversine heuristic - typically explores fewer nodes than Dijkstra."""
    try:
        path, distance, nodes_explored = graph_service.astar(db, source, destination)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return RouteResponse(
        source=source, destination=destination, path=path,
        total_distance_km=distance, algorithm="astar", nodes_explored=nodes_explored,
    )
