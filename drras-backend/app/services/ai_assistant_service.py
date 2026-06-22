"""
AI Operations Assistant.

A lightweight "context-stuffing" RAG: at this data scale (single deployment,
a handful of active disasters) there is no need for a vector DB - we just
serialize the current state of disasters, top pending requests, blocked
roads, and resource levels into the prompt, and let the model answer
natural-language questions strictly from that context.
"""
from sqlalchemy.orm import Session

from app.models.disaster import Disaster
from app.models.emergency_request import EmergencyRequest, RequestStatus
from app.models.resource import Resource
from app.models.road_block import RoadBlock
from app.services.ai_client import chat_complete

SYSTEM_PROMPT = (
    "You are an operations assistant for a disaster-response platform. Answer the "
    "user's question using ONLY the structured context provided below. If the answer "
    "cannot be determined from the context, say so explicitly instead of guessing. "
    "Be concise and reference concrete city names / numbers from the context."
)


def _build_context(db: Session) -> str:
    disasters = db.query(Disaster).all()
    pending_requests = (
        db.query(EmergencyRequest)
        .filter(EmergencyRequest.status == RequestStatus.PENDING)
        .order_by(EmergencyRequest.priority_score.desc())
        .limit(20)
        .all()
    )
    resources = db.query(Resource).all()
    blocked_roads = db.query(RoadBlock).filter(RoadBlock.is_blocked.is_(True)).all()

    lines = ["DISASTERS:"]
    for d in disasters:
        lines.append(f"- #{d.id} {d.name} | type={d.type.value} | severity={d.severity}/10 "
                      f"| city={d.city} | status={d.status.value}")

    lines.append("\nTOP PENDING EMERGENCY REQUESTS (by priority):")
    for r in pending_requests:
        lines.append(
            f"- req#{r.id} city={r.city} priority={r.priority_score} "
            f"food={r.food_needed} water={r.water_needed} medicine={r.medicine_needed} "
            f"ambulances={r.ambulances_needed} population={r.population_affected}"
        )

    lines.append("\nRESOURCE STOCK LEVELS:")
    for res in resources:
        lines.append(f"- {res.type.value} in {res.city}: {res.quantity_available} {res.unit}")

    lines.append("\nCURRENTLY BLOCKED ROADS:")
    if blocked_roads:
        for rb in blocked_roads:
            lines.append(f"- {rb.city_from} <-> {rb.city_to} (traffic level {rb.traffic_level}/10)")
    else:
        lines.append("- none")

    return "\n".join(lines)


def answer_question(db: Session, question: str) -> str:
    context = _build_context(db)
    user_prompt = f"CONTEXT:\n{context}\n\nQUESTION:\n{question}"
    return chat_complete(SYSTEM_PROMPT, user_prompt, max_tokens=300)
