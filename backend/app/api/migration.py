"""
Migration plan and validation gates API endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.schemas.scan import MigrationItem, ValidationGate
from app.api.scan import get_storage_service


router = APIRouter(prefix="/api/scans/{scan_id}/migration", tags=["migration"])


class UpdateMigrationItemRequest(BaseModel):
    status: str
    owner: str
    notes: str
    validation_gates: List[ValidationGate]


@router.get("", response_model=List[MigrationItem])
async def get_migration_plan(scan_id: str):
    storage = get_storage_service()
    if not storage:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    res = storage.get_scan(scan_id)
    if not res:
        raise HTTPException(status_code=404, detail="Scan not found")
    return res.migration_plan


@router.put("/{item_id}", response_model=MigrationItem)
async def update_migration_item(scan_id: str, item_id: str, req: UpdateMigrationItemRequest):
    storage = get_storage_service()
    if not storage:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    res = storage.get_scan(scan_id)
    if not res:
        raise HTTPException(status_code=404, detail="Scan not found")

    target_item = None
    for item in res.migration_plan:
        if item.id == item_id:
            item.status = req.status
            item.owner = req.owner
            item.notes = req.notes
            item.validation_gates = req.validation_gates
            target_item = item
            break

    if not target_item:
        raise HTTPException(status_code=404, detail="Migration item not found")

    storage.update_migration_item(
        scan_id=scan_id,
        item_id=item_id,
        status=req.status,
        owner=req.owner,
        notes=req.notes,
        gates=[g.model_dump() for g in req.validation_gates]
    )

    return target_item
