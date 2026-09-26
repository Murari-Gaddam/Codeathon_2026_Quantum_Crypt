"""
Certificates API endpoint.
"""

from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.scan import CertificateRecord
from app.api.scan import get_storage_service


router = APIRouter(prefix="/api/scans/{scan_id}/certificates", tags=["certificates"])


@router.get("", response_model=List[CertificateRecord])
async def get_certificates(scan_id: str):
    storage = get_storage_service()
    if not storage:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    res = storage.get_scan(scan_id)
    if not res:
        raise HTTPException(status_code=404, detail="Scan not found")
    return res.certificates
