"""
Findings API endpoint with rich filtering support.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.scan import Finding
from app.api.scan import get_storage_service


router = APIRouter(prefix="/api/scans/{scan_id}/findings", tags=["findings"])


@router.get("", response_model=List[Finding])
async def get_findings(
    scan_id: str,
    confidence: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    component: Optional[str] = Query(None),
    mechanism: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    storage = get_storage_service()
    if not storage:
        raise HTTPException(status_code=500, detail="Storage service not initialized")
    res = storage.get_scan(scan_id)
    if not res:
        raise HTTPException(status_code=404, detail="Scan not found")

    findings = res.findings

    if confidence:
        findings = [f for f in findings if f.confidence.lower() == confidence.lower()]
    if category:
        findings = [f for f in findings if f.category.lower() == category.lower()]
    if component:
        findings = [f for f in findings if f.component.lower() == component.lower()]
    if mechanism:
        findings = [f for f in findings if mechanism.lower() in f.mechanism.lower()]
    if search:
        s = search.lower()
        findings = [
            f for f in findings
            if s in f.id.lower()
            or s in f.mechanism.lower()
            or s in (f.algorithm_variant or "").lower()
            or s in f.file.lower()
            or s in f.component.lower()
            or s in f.evidence.lower()
        ]

    return findings
