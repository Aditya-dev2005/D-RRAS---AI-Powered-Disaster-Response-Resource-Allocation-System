"""
Application entrypoint. Wires together the database, all routers, and
exposes a /health endpoint for container orchestration / load balancer checks.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import (
    auth, disasters, requests, resources, volunteers,
    roadblocks, routing, allocation, matching, ai,
)

# Creates all tables that don't already exist. For a project at this scale,
# this replaces a full migration tool (e.g. Alembic) while staying simple
# and fully reproducible from the models alone.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI-powered disaster response platform combining graph routing "
        "(Dijkstra / A*), 0/1 knapsack resource allocation, greedy volunteer "
        "matching, and LLM-based situational intelligence."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(disasters.router)
app.include_router(requests.router)
app.include_router(resources.router)
app.include_router(volunteers.router)
app.include_router(roadblocks.router)
app.include_router(routing.router)
app.include_router(allocation.router)
app.include_router(matching.router)
app.include_router(ai.router)


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": settings.APP_NAME}
