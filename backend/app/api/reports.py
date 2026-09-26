"""
Report generation and download API endpoints.
"""

from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import HTMLResponse, JSONResponse
from app.services.report_service import generate_html_report
from app.api.scan import get_storage_service


router = APIRouter(prefix="/api/scans/{scan_id}/report", tags=["reports"])


@router.get("")
async def get_report(scan_id: str, format: str = Query("html")):
    storage = get_storage_service()
    if not storage:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    res = storage.get_scan(scan_id)
    if not res:
        raise HTTPException(status_code=404, detail="Scan not found")

    if format.lower() == "json":
        return JSONResponse(content=res.model_dump())

    html_content = generate_html_report(res)
    return HTMLResponse(content=html_content)


@router.get("/download")
async def download_report(scan_id: str):
    storage = get_storage_service()
    if not storage:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    res = storage.get_scan(scan_id)
    if not res:
        raise HTTPException(status_code=404, detail="Scan not found")

    html_content = generate_html_report(res)
    headers = {"Content-Disposition": f"attachment; filename=pqc_report_{scan_id}.html"}
    return Response(content=html_content, media_type="text/html", headers=headers)
