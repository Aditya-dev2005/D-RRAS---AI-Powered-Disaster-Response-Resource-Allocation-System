from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func

from app.database import Base


class RoadBlock(Base):
    """
    Doubles as the city-graph EDGE LIST consumed by the routing engine
    (Dijkstra / A*) AND as the dynamic road-block control table.
    Each row = one undirected road segment between two cities.
    """
    __tablename__ = "road_blocks"

    id = Column(Integer, primary_key=True, index=True)
    city_from = Column(String(80), nullable=False, index=True)
    city_to = Column(String(80), nullable=False, index=True)
    distance_km = Column(Float, nullable=False)
    traffic_level = Column(Integer, default=1, nullable=False)  # 1 (free) - 10 (jammed)
    is_blocked = Column(Boolean, default=False, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
