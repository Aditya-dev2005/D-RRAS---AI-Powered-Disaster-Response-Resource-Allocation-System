"""
Thin wrapper around an OpenAI-compatible chat completion call, pointed at
OpenRouter by default (set OPENROUTER_BASE_URL / OPENROUTER_API_KEY /
OPENROUTER_MODEL in .env). Centralized here so both AI services share one
client and one error-handling path.
"""
from openai import OpenAI

from app.config import settings

_client: OpenAI | None = None


def get_ai_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=settings.OPENROUTER_API_KEY or "missing-key",
            base_url=settings.OPENROUTER_BASE_URL,
        )
    return _client


def chat_complete(system_prompt: str, user_prompt: str, max_tokens: int = 400) -> str:
    if not settings.OPENROUTER_API_KEY:
        raise RuntimeError(
            "OPENROUTER_API_KEY is not set. Add it to your .env file to enable AI features."
        )
    client = get_ai_client()
    response = client.chat.completions.create(
        model=settings.OPENROUTER_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=max_tokens,
        temperature=0.4,
    )
    return response.choices[0].message.content.strip()
