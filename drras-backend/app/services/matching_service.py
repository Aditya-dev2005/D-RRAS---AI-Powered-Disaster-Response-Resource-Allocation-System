"""
Volunteer Matching Engine - Greedy Matching.

Strategy:
  1. Sort PENDING/IN_PROGRESS emergency requests by priority_score (desc) -
     highest-priority disasters get first pick of volunteers.
  2. For each request, derive which skills it actually needs from its
     resource fields (e.g. medicine_needed > 0 -> needs a "doctor",
     ambulances_needed > 0 -> needs a "driver", population_affected large
     -> needs "rescue_worker", etc.).
  3. Greedily assign the first available volunteer in the SAME CITY with a
     matching skill, then mark that volunteer unavailable so they are not
     double-booked in the same pass.

This is the standard greedy-matching pattern: locally optimal choice
(closest, best-fit available volunteer) at each step, made once and never
revisited. It does not guarantee a globally optimal assignment (that would
be a max-weight bipartite matching / Hungarian-algorithm problem) but it
runs in O(n * m) and is easy to reason about and explain in an interview.
"""
from dataclasses import dataclass
from typing import Dict, List, Set

from app.models.emergency_request import EmergencyRequest
from app.models.volunteer import Volunteer, SkillType


@dataclass
class Assignment:
    request_id: int
    volunteer_id: int
    volunteer_name: str
    skill_type: str
    city: str


def _required_skills(req: EmergencyRequest) -> List[SkillType]:
    skills: List[SkillType] = []
    if req.medicine_needed > 0:
        skills.append(SkillType.DOCTOR)
    if req.ambulances_needed > 0:
        skills.append(SkillType.DRIVER)
    if req.population_affected >= 500:
        skills.append(SkillType.RESCUE_WORKER)
    if req.water_needed > 0 or req.food_needed > 0:
        skills.append(SkillType.ENGINEER)  # logistics / supply-line support
    if not skills:
        skills.append(SkillType.RESCUE_WORKER)  # default fallback need
    return skills


def greedy_match(
    requests: List[EmergencyRequest], volunteers: List[Volunteer]
) -> tuple[List[Assignment], List[int]]:
    """Returns (assignments, unmatched_request_ids)."""
    sorted_requests = sorted(requests, key=lambda r: r.priority_score, reverse=True)

    # Index available volunteers by (city, skill) for O(1) lookup.
    pool: Dict[tuple, List[Volunteer]] = {}
    for v in volunteers:
        if v.is_available:
            pool.setdefault((v.city.strip().lower(), v.skill_type), []).append(v)

    already_assigned: Set[int] = set()
    assignments: List[Assignment] = []
    unmatched: List[int] = []

    for req in sorted_requests:
        city_key = req.city.strip().lower()
        matched_this_request = False

        for skill in _required_skills(req):
            bucket = pool.get((city_key, skill), [])
            # Find first volunteer in bucket not already used in this pass.
            for v in bucket:
                if v.id in already_assigned:
                    continue
                assignments.append(
                    Assignment(
                        request_id=req.id,
                        volunteer_id=v.id,
                        volunteer_name=v.name,
                        skill_type=v.skill_type.value,
                        city=v.city,
                    )
                )
                already_assigned.add(v.id)
                matched_this_request = True
                break  # one volunteer of this skill is enough, move to next skill

        if not matched_this_request:
            unmatched.append(req.id)

    return assignments, unmatched
