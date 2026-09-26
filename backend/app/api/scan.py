"""
Scan API endpoints.
Initiates repository scans, queries scan status, lists past scans, and manages baselines.
"""

import os
import shutil
import tempfile
import zipfile
from typing import Optional, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel
from app.schemas.scan import ScanResult, ScanSummary
from app.services.scan_service import ScanService
from app.services.storage import StorageService


router = APIRouter(prefix="/api/scans", tags=["scans"])


class StartScanRequest(BaseModel):
    target_path: Optional[str] = None
    use_demo: bool = False


# Dependency injector placeholders initialized in main
_scan_service: Optional[ScanService] = None
_storage_service: Optional[StorageService] = None


def init_services(scan_service: ScanService, storage_service: StorageService):
    global _scan_service, _storage_service
    _scan_service = scan_service
    _storage_service = storage_service


def get_storage_service() -> StorageService:
    return _storage_service


def get_scan_service() -> ScanService:
    return _scan_service


@router.post("", response_model=ScanResult)
async def create_scan(request: StartScanRequest):
    if not _scan_service:
        raise HTTPException(status_code=500, detail="Scan service not initialized")

    target = request.target_path
    if request.use_demo or not target:
        # Default to demo repository
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../samples/demo-repository"))
        target = base_dir

    if not os.path.exists(target):
        raise HTTPException(status_code=400, detail=f"Target path '{target}' does not exist.")

    try:
        result = _scan_service.run_scan(target)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan execution failed: {str(e)}")


@router.post("/upload", response_model=ScanResult)
async def upload_and_scan(file: UploadFile = File(...)):
    """
    Accepts uploaded repository archive (ZIP).
    Extracts into an isolated temporary workspace, runs the scan,
    and safely purges the temporary workspace immediately afterward.
    """
    if not _scan_service:
        raise HTTPException(status_code=500, detail="Scan service not initialized")

    if not file.filename.endswith((".zip", ".tar.gz", ".tar")):
        raise HTTPException(status_code=400, detail="Only .zip or archive files are accepted.")

    temp_dir = tempfile.mkdtemp(prefix="pqc_scan_workspace_")
    try:
        archive_path = os.path.join(temp_dir, file.filename)
        with open(archive_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Unpack
        extract_dir = os.path.join(temp_dir, "extracted")
        os.makedirs(extract_dir, exist_ok=True)

        if file.filename.endswith(".zip"):
            with zipfile.ZipFile(archive_path, "r") as zip_ref:
                # Security check against ZipSlip path traversal
                for member in zip_ref.namelist():
                    filename = os.path.basename(member)
                    # skip directories
                    if not filename:
                        continue
                    target_file = os.path.abspath(os.path.join(extract_dir, member))
                    if not target_file.startswith(os.path.abspath(extract_dir)):
                        raise HTTPException(status_code=400, detail="Malicious path traversal detected in archive.")
                zip_ref.extractall(extract_dir)

        result = _scan_service.run_scan(extract_dir)
        return result
    finally:
        # Clean up temporary isolation workspace
        shutil.rmtree(temp_dir, ignore_errors=True)


@router.get("", response_model=List[ScanSummary])
async def list_scans():
    if not _storage_service:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    return _storage_service.list_scans()


@router.get("/{scan_id}", response_model=ScanResult)
async def get_scan(scan_id: str):
    if not _storage_service:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    res = _storage_service.get_scan(scan_id)
    if not res:
        raise HTTPException(status_code=404, detail="Scan not found")
    return res


@router.post("/{scan_id}/baseline")
async def set_baseline(scan_id: str):
    if not _storage_service:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    res = _storage_service.get_scan(scan_id)
    if not res:
        raise HTTPException(status_code=404, detail="Scan not found")
    _storage_service.set_baseline(scan_id, res.model_dump_json())
    return {"message": f"Scan {scan_id} registered as governance baseline."}


@router.post("/reset")
async def reset_scans():
    """
    Resets all stored scans, baselines, and checklists to an empty zero state.
    """
    if not _storage_service:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    _storage_service.clear_all()
    return {"message": "All scan records and baselines cleared successfully. System reset to zero."}
