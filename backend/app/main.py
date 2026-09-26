"""
Main FastAPI entrypoint for PQC Migration & Crypto-Agility Scanner.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.storage import StorageService
from app.services.scan_service import ScanService
from app.api.scan import router as scan_router, init_services
from app.api.findings import router as findings_router
from app.api.dependencies import router as dependencies_router
from app.api.certificates import router as certificates_router
from app.api.migration import router as migration_router
from app.api.sandbox import router as sandbox_router
from app.api.reports import router as reports_router
from app.api.rules import router as rules_router


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
RULES_DIR = os.path.join(BASE_DIR, "rules")
DB_PATH = os.path.join(BASE_DIR, "scanner.db")
DEMO_REPO_DIR = os.path.join(BASE_DIR, "samples/demo-repository")

storage_service = StorageService(DB_PATH)
scan_service = ScanService(RULES_DIR, storage_service)
init_services(scan_service, storage_service)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-seed demo scan if database is empty
    scans = storage_service.list_scans()
    if not scans and os.path.exists(DEMO_REPO_DIR):
        try:
            print("Pre-seeding demo repository scan for immediate evaluation...")
            scan_service.run_scan(DEMO_REPO_DIR, scan_id="scan-demo-001")
            print("Demo scan pre-seeded successfully.")
        except Exception as e:
            print(f"Warning: Failed to pre-seed demo scan: {e}")
    yield


app = FastAPI(
    title="PQC Migration & Crypto-Agility Scanner API",
    description="Enterprise cryptographic inventory, dependency mapping, and crypto-agility platform.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router)
app.include_router(findings_router)
app.include_router(dependencies_router)
app.include_router(certificates_router)
app.include_router(migration_router)
app.include_router(sandbox_router)
app.include_router(reports_router)
app.include_router(rules_router)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "PQC Migration Scanner",
        "version": "1.0.0",
        "quantum_ready": True
    }
