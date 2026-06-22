from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.disaster import Disaster
from app.models.user import User
from app.schemas.ai import AISummaryResponse, AIAssistantQuery, AIAssistantResponse
from app.core.deps import get_current_user
from app.services.ai_summary_service import generate_disaster_summary
from app.services.ai_assistant_service import answer_question

router = APIRouter(prefix="/ai", tags=["AI Disaster Intelligence"])


@router.get("/summary/{disaster_id}", response_model=AISummaryResponse)
def get_disaster_summary(
    disaster_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    disaster = db.query(Disaster).filter(Disaster.id == disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster not found.")

    try:
        summary = generate_disaster_summary(db, disaster)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    return AISummaryResponse(disaster_id=disaster.id, disaster_name=disaster.name, summary=summary)


@router.post("/assistant", response_model=AIAssistantResponse)
def ask_assistant(
    payload: AIAssistantQuery, db: Session = Depends(get_db), _: User = Depends(get_current_user)
):
    try:
        answer = answer_question(db, payload.question)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    return AIAssistantResponse(question=payload.question, answer=answer)
