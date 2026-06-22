from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.emergency_request import EmergencyRequest, RequestStatus
from app.models.volunteer import Volunteer
from app.models.user import User
from app.schemas.allocation import MatchResponse, MatchAssignment
from app.core.deps import get_current_user
from app.services.matching_service import greedy_match

router = APIRouter(prefix="/matching", tags=["Volunteer Matching"])


@router.post("/run", response_model=MatchResponse)
def run_volunteer_matching(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """
    Greedy matching of available volunteers to open (pending / in-progress)
    emergency requests, highest priority first.
    """
    requests = (
        db.query(EmergencyRequest)
        .filter(EmergencyRequest.status != RequestStatus.RESOLVED)
        .all()
    )
    volunteers = db.query(Volunteer).filter(Volunteer.is_available.is_(True)).all()

    assignments, unmatched = greedy_match(requests, volunteers)

    return MatchResponse(
        total_assignments=len(assignments),
        assignments=[
            MatchAssignment(
                request_id=a.request_id, volunteer_id=a.volunteer_id,
                volunteer_name=a.volunteer_name, skill_type=a.skill_type, city=a.city,
            )
            for a in assignments
        ],
        unmatched_request_ids=unmatched,
    )
