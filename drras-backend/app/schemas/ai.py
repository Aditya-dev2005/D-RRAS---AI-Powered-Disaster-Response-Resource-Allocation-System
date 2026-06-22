from pydantic import BaseModel


class AISummaryResponse(BaseModel):
    disaster_id: int
    disaster_name: str
    summary: str


class AIAssistantQuery(BaseModel):
    question: str


class AIAssistantResponse(BaseModel):
    question: str
    answer: str
