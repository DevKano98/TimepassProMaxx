"""
generate_ticket(incident_data) -> {"title", "summary", "recommended_action",
"department", "public_alert"}

Calls Groq's OpenAI-compatible chat completion endpoint with a prompt built
from the incident data, requests JSON output, and parses it. Malformed JSON
is retried once; if it still fails, falls back to a templated ticket instead
of crashing the request (per section 3's ticket_service description).
"""
import json
from typing import Any

import httpx

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

_SYSTEM_PROMPT = (
    "You are a municipal operations assistant for a civic-issue reporting platform. "
    "Given structured data about a reported infrastructure hazard, produce a work ticket. "
    "Respond with ONLY a JSON object with exactly these keys: "
    '"title" (short string), "summary" (1-3 sentences), '
    '"recommended_action" (1-2 sentences, actionable), '
    '"department" (a short department name such as "Roads & Public Works", '
    '"Sanitation", or "Water & Drainage"), and '
    '"public_alert" (1 sentence suitable for showing to citizens). '
    "Do not include any text outside the JSON object."
)


def _build_user_prompt(incident_data: dict[str, Any]) -> str:
    return (
        "Incident data:\n"
        f"{json.dumps(incident_data, default=str, indent=2)}\n\n"
        "Generate the ticket JSON now."
    )


def _call_groq(incident_data: dict[str, Any]) -> str:
    response = httpx.post(
        f"{settings.GROQ_BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
        json={
            "model": settings.GROQ_MODEL,
            "messages": [
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": _build_user_prompt(incident_data)},
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
        },
        timeout=20.0,
    )
    response.raise_for_status()
    payload = response.json()
    return payload["choices"][0]["message"]["content"]


_REQUIRED_KEYS = {"title", "summary", "recommended_action", "department", "public_alert"}


def _parse_ticket_json(raw: str) -> dict[str, str]:
    parsed = json.loads(raw)
    if not _REQUIRED_KEYS.issubset(parsed.keys()):
        raise ValueError(f"Missing keys in LLM ticket response: {parsed.keys()}")
    return {key: str(parsed[key]) for key in _REQUIRED_KEYS}


def _fallback_ticket(incident_data: dict[str, Any]) -> dict[str, str]:
    category = incident_data.get("category", "issue")
    ward = incident_data.get("ward", "the reported area")
    return {
        "title": f"{category.replace('_', ' ').title()} reported in {ward}",
        "summary": (
            f"A {category.replace('_', ' ')} was reported in {ward}. "
            "Automated ticket generation was unavailable, so this is a templated summary."
        ),
        "recommended_action": "Dispatch a field team to inspect and assess the reported hazard.",
        "department": "General Public Works",
        "public_alert": f"We are aware of a reported {category.replace('_', ' ')} in {ward} and are reviewing it.",
    }


def generate_ticket(incident_data: dict[str, Any]) -> dict[str, str]:
    for attempt in range(2):
        try:
            raw = _call_groq(incident_data)
            return _parse_ticket_json(raw)
        except (json.JSONDecodeError, ValueError, KeyError) as exc:
            logger.warning("Groq ticket JSON malformed on attempt %d: %s", attempt + 1, exc)
        except Exception as exc:
            logger.warning("Groq ticket generation request failed on attempt %d: %s", attempt + 1, exc)

    logger.error("Falling back to templated ticket for incident: %s", incident_data)
    return _fallback_ticket(incident_data)
