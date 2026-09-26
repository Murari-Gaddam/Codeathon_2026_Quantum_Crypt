"""
Dependencies API endpoint returning graph nodes and edges.
"""

from fastapi import APIRouter, HTTPException
from app.schemas.scan import DependencyGraph
from app.api.scan import get_storage_service


router = APIRouter(prefix="/api/scans/{scan_id}/dependencies", tags=["dependencies"])


@router.get("", response_model=DependencyGraph)
async def get_dependencies(scan_id: str):
    storage = get_storage_service()
    if not storage:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    res = storage.get_scan(scan_id)
    if not res:
        raise HTTPException(status_code=404, detail="Scan not found")
    return res.dependency_graph
