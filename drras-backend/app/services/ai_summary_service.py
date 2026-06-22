"""
AI Situation Summary.

Pulls a disaster + its linked emergency requests + relevant road blocks
from the DB, packages them into a compact prompt, and asks the LLM to
produce a short operational summary + recommendation - the same kind of
synthesis a duty officer would otherwise have to do by hand.
"""
from sqlalchemy.orm import Session

from app.models.disaster import Disaster
from app.models.emergency_request import EmergencyRequest, RequestStatus
from app.models.road_block import RoadBlock
from app.services.ai_client import chat_complete

SYSTEM_PROMPT = (
    "You are an emergency operations analyst. Given structured data about a disaster, "
    "its open resource requests, and nearby road conditions, write a concise 3-5 sentence "
    "situation summary for a relief coordinator. State the resource shortages in concrete "
    "numbers and give one clear, actionable recommendation. Do not invent data that wasn't given."
)


def generate_disaster_summary(db: Session, disaster: Disaster) -> str:
    requests = (
        db.query(EmergencyRequest)
        .filter(
            EmergencyRequest.disaster_id == disaster.id,
            EmergencyRequest.status != RequestStatus.RESOLVED,
        )
        .all()
    )

    total_food = sum(r.food_needed for r in requests)
    total_water = sum(r.water_needed for r in requests)
    total_medicine = sum(r.medicine_needed for r in requests)
    total_ambulances = sum(r.ambulances_needed for r in requests)
    total_population = sum(r.population_affected for r in requests)

    blocked_roads = (
        db.query(RoadBlock)
        .filter(
            RoadBlock.is_blocked.is_(True),
            (RoadBlock.city_from == disaster.city) | (RoadBlock.city_to == disaster.city),
        )
        .all()
    )

    data_lines = [
        f"Disaster: {disaster.name} ({disaster.type.value}), severity {disaster.severity}/10, "
        f"status: {disaster.status.value}, city: {disaster.city}",
        f"Open requests: {len(requests)}, population affected (sum): {total_population}",
        f"Unmet needs -> food: {total_food} units, water: {total_water} units, "
        f"medicine: {total_medicine} units, ambulances: {total_ambulances}",
        f"Blocked roads touching {disaster.city}: "
        + (", ".join(f"{r.city_from}<->{r.city_to}" for r in blocked_roads) or "none"),
    ]
    user_prompt = "\n".join(data_lines)

    return chat_complete(SYSTEM_PROMPT, user_prompt)
