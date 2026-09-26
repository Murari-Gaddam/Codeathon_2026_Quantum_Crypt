"""
Finding Classifier & Normalizer.
Enforces evidence-based confidence levels, sanitized security language,
and unique deterministic finding IDs.
"""

from typing import List, Dict, Any
from app.schemas.scan import Finding


def classify_and_normalize_findings(raw_findings: List[Dict[str, Any]]) -> List[Finding]:
    normalized: List[Finding] = []

    for idx, raw in enumerate(raw_findings):
        finding_id = f"finding-{idx+1:03d}"
        confidence = raw.get("confidence", "likely")
        if confidence not in ["confirmed", "likely", "possible", "unknown"]:
            confidence = "unknown"

        # Sanitize security messaging to adhere to README Section 1:
        # Never say "quantum disaster", "vulnerable", "insecure", "replace immediately" without context
        concern = raw.get("concern", "Cryptographic mechanism detected. Requires assessment.")
        concern = concern.replace("CRITICAL VULNERABILITY", "Requires migration assessment")
        concern = concern.replace("Quantum disaster", "Potential migration concern")

        f = Finding(
            id=finding_id,
            mechanism=raw.get("mechanism", "Unknown Mechanism"),
            algorithm_variant=raw.get("algorithm_variant"),
            category=raw.get("category", "asymmetric"),
            usage=raw.get("usage", "cryptographic_operation"),
            confidence=confidence,
            file=raw.get("file", ""),
            line=raw.get("line", 1),
            column=raw.get("column", 1),
            evidence=raw.get("evidence", ""),
            detection_rule=raw.get("detection_rule", "rule-default"),
            component=raw.get("component", "core-system"),
            protocol=raw.get("protocol"),
            status=raw.get("status", "needs-review"),
            concern=concern,
            recommended_action=raw.get("recommended_action", "Review during migration assessment."),
            quantum_impact=raw.get("quantum_impact", "Potential migration concern."),
            is_indirect=raw.get("is_indirect", False),
            inferred_from=raw.get("inferred_from")
        )
        normalized.append(f)

    return normalized
