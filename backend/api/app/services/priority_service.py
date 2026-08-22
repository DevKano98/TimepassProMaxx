"""
score_severity(category, confidence, near_critical_infra) -> (score, level)

Per section 9, this formula-based approach is the only severity scoring
method for this version. No trained/logistic-regression model - that is an
explicit future task, not part of this build.

Formula:
  - Start from a base weight per hazard category (worse hazard types score higher).
  - Scale by detection confidence (a hazard we're less sure about is scored more
    conservatively).
  - Add a fixed bump if the incident is near critical infrastructure
    (hospitals, schools, main roads, etc).
  - Map the resulting 0-1 score to a discrete severity level.
"""
CATEGORY_BASE_WEIGHT: dict[str, float] = {
    "flooded_road": 0.9,
    "damaged_road": 0.7,
    "pothole": 0.5,
    "garbage_pile": 0.3,
}

CRITICAL_INFRA_BUMP = 0.15
DEFAULT_BASE_WEIGHT = 0.4


def score_severity(
    category: str,
    confidence: float,
    near_critical_infra: bool,
) -> tuple[float, str]:
    base_weight = CATEGORY_BASE_WEIGHT.get(category, DEFAULT_BASE_WEIGHT)
    confidence = max(0.0, min(1.0, confidence))

    score = base_weight * confidence
    if near_critical_infra:
        score += CRITICAL_INFRA_BUMP

    score = max(0.0, min(1.0, score))

    if score >= 0.75:
        level = "critical"
    elif score >= 0.55:
        level = "high"
    elif score >= 0.35:
        level = "medium"
    else:
        level = "low"

    return score, level
