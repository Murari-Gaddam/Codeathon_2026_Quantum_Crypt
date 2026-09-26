"""
Rules and CI policy evaluation API endpoints.
"""

import os
import json
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.schemas.scan import CIComparisonResult, Finding
from app.api.scan import get_storage_service


router = APIRouter(prefix="/api", tags=["rules_and_ci"])


class CIEvaluateRequest(BaseModel):
    scan_id: str


@router.get("/rules")
async def get_rules():
    rules_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../rules"))
    res = {}
    for name in ["algorithms.json", "libraries.json", "protocols.json", "policies.json"]:
        p = os.path.join(rules_dir, name)
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                res[name.replace(".json", "")] = json.load(f)
    return res


@router.post("/ci/evaluate", response_model=CIComparisonResult)
async def evaluate_ci_policy(req: CIEvaluateRequest):
    storage = get_storage_service()
    if not storage:
        raise HTTPException(status_code=500, detail="Storage not initialized")

    current_scan = storage.get_scan(req.scan_id)
    if not current_scan:
        raise HTTPException(status_code=404, detail="Current scan not found")

    rules_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../rules"))
    policies_file = os.path.join(rules_dir, "policies.json")
    policy_data = {}
    if os.path.exists(policies_file):
        with open(policies_file, "r", encoding="utf-8") as f:
            policy_data = json.load(f)

    deprecated_algs = set(policy_data.get("deprecated_algorithms", ["DES", "3DES", "RC4", "MD5", "SHA-1", "DSA"]))
    violations = []
    warnings = []

    # Check for deprecated algorithms
    for f in current_scan.findings:
        if f.mechanism.upper() in deprecated_algs:
            violations.append({
                "rule": "newly_introduced_deprecated_algorithm",
                "finding_id": f.id,
                "mechanism": f.mechanism,
                "location": f"{f.file}:{f.line}",
                "message": f"Deprecated algorithm '{f.mechanism}' violates enterprise cryptographic policy."
            })

    # Compare against baseline if available
    baseline_data = storage.get_baseline()
    new_findings: List[Finding] = []

    if baseline_data:
        baseline_evidence = {f"{bf.get('file')}:{bf.get('mechanism')}" for bf in baseline_data.get("findings", [])}
        for f in current_scan.findings:
            key = f"{f.file}:{f.mechanism}"
            if key not in baseline_evidence:
                new_findings.append(f)
                warnings.append({
                    "rule": "new_crypto_dependency",
                    "finding_id": f.id,
                    "mechanism": f.mechanism,
                    "location": f"{f.file}:{f.line}",
                    "message": f"New cryptographic mechanism detected: {f.mechanism} at {f.file}:{f.line}. Review required."
                })
    else:
        # If no baseline, treat all high/critical findings as review items
        for f in current_scan.findings:
            if f.confidence == "confirmed" and f.category in ["asymmetric", "tls"]:
                warnings.append({
                    "rule": "review_required",
                    "finding_id": f.id,
                    "mechanism": f.mechanism,
                    "location": f"{f.file}:{f.line}",
                    "message": f"{f.mechanism} detected at {f.file}:{f.line}. Requires migration assessment."
                })

    status = "PASSED"
    passed = True
    if violations:
        status = "FAILED"
        passed = False
    elif warnings:
        status = "WARNING"
        passed = True

    summary = f"CI Crypto Policy check: {status}. {len(violations)} violation(s), {len(warnings)} warning(s)."

    return CIComparisonResult(
        passed=passed,
        policy_name=policy_data.get("policy_name", "enterprise-pqc-governance"),
        status=status,
        violations=violations,
        warnings=warnings,
        new_findings=new_findings,
        summary_message=summary
    )
