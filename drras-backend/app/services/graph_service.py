"""
Route Optimization Engine.

Builds an in-memory weighted, undirected graph from the `road_blocks` table
(each row = one city-to-city edge) and exposes:

  - dijkstra(...)      -> classic shortest path by raw distance
  - safest_path(...)   -> Dijkstra variant that also penalizes traffic, so the
                           "safest" route trades a bit of distance for less congestion
  - astar(...)          -> A* search using haversine (straight-line) distance
                           as an admissible heuristic, over the same graph

Blocked edges (`is_blocked = True`) are excluded from the graph entirely,
which is how dynamic road-block handling is realized: re-running any of the
three functions after a block/unblock automatically reroutes.
"""
import heapq
import math
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from app.models.road_block import RoadBlock

# Approximate lat/lon (degrees) for known Indian cities used as the A* heuristic.
# A* falls back to a heuristic of 0 (degrades gracefully to Dijkstra) for any
# city not present here, so unknown cities never break correctness.
CITY_COORDINATES: Dict[str, Tuple[float, float]] = {
    "delhi": (28.7041, 77.1025),
    "mumbai": (19.0760, 72.8777),
    "bangalore": (12.9716, 77.5946),
    "kolkata": (22.5726, 88.3639),
    "chennai": (13.0827, 80.2707),
    "noida": (28.5355, 77.3910),
    "hyderabad": (17.3850, 78.4867),
    "pune": (18.5204, 73.8567),
    "ahmedabad": (23.0225, 72.5714),
    "jaipur": (26.9124, 75.7873),
    "lucknow": (26.8467, 80.9462),
    "patna": (25.5941, 85.1376),
}

EARTH_RADIUS_KM = 6371.0


def _normalize(city: str) -> str:
    return city.strip().lower()


def haversine_km(city_a: str, city_b: str) -> float:
    """Straight-line distance between two known cities; 0.0 if either is unknown."""
    a = CITY_COORDINATES.get(_normalize(city_a))
    b = CITY_COORDINATES.get(_normalize(city_b))
    if not a or not b:
        return 0.0
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(min(1.0, math.sqrt(h)))


@dataclass
class Edge:
    to: str
    distance_km: float
    traffic_level: int


def build_graph(db: Session, include_blocked: bool = False) -> Dict[str, List[Edge]]:
    """Loads all road segments into an adjacency list. Excludes blocked roads unless asked for."""
    query = db.query(RoadBlock)
    if not include_blocked:
        query = query.filter(RoadBlock.is_blocked.is_(False))

    graph: Dict[str, List[Edge]] = {}
    for road in query.all():
        a, b = _normalize(road.city_from), _normalize(road.city_to)
        graph.setdefault(a, []).append(Edge(b, road.distance_km, road.traffic_level))
        graph.setdefault(b, []).append(Edge(a, road.distance_km, road.traffic_level))
    return graph


def _reconstruct_path(parent: Dict[str, Optional[str]], dest: str) -> List[str]:
    path = []
    node: Optional[str] = dest
    while node is not None:
        path.append(node)
        node = parent.get(node)
    path.reverse()
    return path


def dijkstra(
    db: Session, source: str, destination: str, safest: bool = False
) -> Tuple[List[str], float, int]:
    """
    Dijkstra's shortest-path algorithm using a binary heap priority queue.
    If `safest=True`, edge weight is distance * (1 + traffic_level / 5),
    so congested roads cost more even if they are physically shorter.

    Returns (path_as_city_list, total_distance_km, nodes_explored).
    Raises ValueError if no path exists.
    """
    source, destination = _normalize(source), _normalize(destination)
    graph = build_graph(db)

    if source not in graph or destination not in graph:
        raise ValueError(f"Unknown city in network: '{source}' or '{destination}'")

    dist: Dict[str, float] = {source: 0.0}
    parent: Dict[str, Optional[str]] = {source: None}
    visited = set()
    pq: List[Tuple[float, str]] = [(0.0, source)]
    nodes_explored = 0

    while pq:
        d, u = heapq.heappop(pq)
        if u in visited:
            continue
        visited.add(u)
        nodes_explored += 1

        if u == destination:
            break
        if d > dist.get(u, math.inf):
            continue

        for edge in graph.get(u, []):
            weight = edge.distance_km * (1 + edge.traffic_level / 5) if safest else edge.distance_km
            new_dist = d + weight
            if new_dist < dist.get(edge.to, math.inf):
                dist[edge.to] = new_dist
                parent[edge.to] = u
                heapq.heappush(pq, (new_dist, edge.to))

    if destination not in dist:
        raise ValueError(f"No route exists between '{source}' and '{destination}' "
                          f"(possibly cut off by road blocks).")

    path = _reconstruct_path(parent, destination)
    # Report the *actual* travelled distance (raw km), not the safety-weighted cost.
    raw_distance = _path_raw_distance(graph, path)
    return path, raw_distance, nodes_explored


def _path_raw_distance(graph: Dict[str, List[Edge]], path: List[str]) -> float:
    total = 0.0
    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        for edge in graph.get(u, []):
            if edge.to == v:
                total += edge.distance_km
                break
    return round(total, 2)


def astar(db: Session, source: str, destination: str) -> Tuple[List[str], float, int]:
    """
    A* search: like Dijkstra but guided by a haversine-distance heuristic
    towards the destination, which lets it skip exploring nodes that are
    obviously moving away from the goal. Falls back to Dijkstra-equivalent
    behaviour for cities missing from CITY_COORDINATES (heuristic = 0).
    """
    source, destination = _normalize(source), _normalize(destination)
    graph = build_graph(db)

    if source not in graph or destination not in graph:
        raise ValueError(f"Unknown city in network: '{source}' or '{destination}'")

    g_score: Dict[str, float] = {source: 0.0}
    parent: Dict[str, Optional[str]] = {source: None}
    visited = set()

    def h(city: str) -> float:
        return haversine_km(city, destination)

    pq: List[Tuple[float, str]] = [(h(source), source)]
    nodes_explored = 0

    while pq:
        _, u = heapq.heappop(pq)
        if u in visited:
            continue
        visited.add(u)
        nodes_explored += 1

        if u == destination:
            break

        for edge in graph.get(u, []):
            tentative_g = g_score[u] + edge.distance_km
            if tentative_g < g_score.get(edge.to, math.inf):
                g_score[edge.to] = tentative_g
                parent[edge.to] = u
                f_score = tentative_g + h(edge.to)
                heapq.heappush(pq, (f_score, edge.to))

    if destination not in g_score:
        raise ValueError(f"No route exists between '{source}' and '{destination}' "
                          f"(possibly cut off by road blocks).")

    path = _reconstruct_path(parent, destination)
    return path, round(g_score[destination], 2), nodes_explored
