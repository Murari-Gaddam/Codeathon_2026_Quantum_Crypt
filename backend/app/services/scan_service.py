"""
Scan orchestration service.
Safely processes repositories, parses cryptography, classifies findings,
maps dependencies, generates migration plans, and records limitations.
"""

import os
import uuid
import datetime
from typing import Optional, List, Dict, Any
from app.scanner.engine import ScannerEngine
from app.analysis.classifier import classify_and_normalize_findings
from app.analysis.dependency_mapper import build_dependency_graph
from app.analysis.migration_planner import generate_migration_plan
from app.schemas.scan import ScanResult, ScanSummary, Finding, CertificateRecord
from app.services.storage import StorageService


LIMITATIONS = [
    "Static analysis can miss runtime-generated cryptography and dynamic key construction.",
    "Reflection, eval(), and dynamic runtime imports can obscure cryptographic algorithm invocations.",
    "Native C/C++ libraries and pre-compiled binary modules may not be fully visible to source scanners.",
    "Indirect transitive dependencies may require deep package dependency resolution and lockfile analysis.",
    "Server configuration files can be overridden dynamically at runtime by container entrypoints or environment variables.",
    "A certificate inventory reveals public key parameters but does not expose ephemeral session keys or runtime cipher negotiation.",
    "A detected classical algorithm does not automatically imply vulnerability in every operational context (e.g. ephemeral non-secret hashing).",
    "Absence of a finding does not prove the absence of cryptographic usage in the target codebase.",
    "The scanner does NOT claim or prove that a scanned system is quantum-safe.",
    "This tool is an inventory, dependency-mapping, and migration-planning platform, and does not replace a formal security audit.",
    "All migration recommendations and provider switches require rigorous validation in a dedicated staging environment."
]


class ScanService:
    def __init__(self, rules_dir: str, storage: StorageService):
        self.rules_dir = rules_dir
        self.storage = storage
        self.engine = ScannerEngine(rules_dir)

    def run_scan(self, target_path: str, scan_id: Optional[str] = None) -> ScanResult:
        if not scan_id:
            scan_id = f"scan-{uuid.uuid4().hex[:8]}"

        now_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        # Untrusted target path validation: verify path exists
        if not os.path.exists(target_path):
            raise FileNotFoundError(f"Target path does not exist: {target_path}")

        # =========================================================================
        # 5-Stage Architecture Principle (README Section 53):
        # Detection -> Classification -> Dependency Analysis -> Migration Planning -> Validation
        # =========================================================================

        # Stage 1: Detection (Raw AST, config, manifest, and certificate parsing)
        raw_findings, certificates, files_scanned, warnings = self.engine.scan_directory(target_path)

        # Stage 2: Classification (Evidence-based confidence: confirmed, likely, possible, unknown)
        findings = classify_and_normalize_findings(raw_findings)

        # Stage 3: Dependency Analysis (Directed graph connecting services, protocols, algorithms & certs)
        graph = build_dependency_graph(findings, certificates)

        # Stage 4: Migration Planning (Prioritized tasks based on cryptographic role and exposure)
        migration_plan = generate_migration_plan(findings, certificates)

        # Stage 5: Validation (8 Standard Gates attached to each migration item)

        # Counts
        confirmed_count = sum(1 for f in findings if f.confidence == "confirmed")
        likely_count = sum(1 for f in findings if f.confidence == "likely")
        possible_count = sum(1 for f in findings if f.confidence == "possible")
        unknown_count = sum(1 for f in findings if f.confidence == "unknown")

        algs = sorted(list(set(f.algorithm_variant or f.mechanism for f in findings)))
        components = sorted(list(set(f.component for f in findings)))

        summary = ScanSummary(
            scan_id=scan_id,
            timestamp=now_str,
            target_path=target_path.replace("\\", "/"),
            status="completed",
            files_scanned=files_scanned,
            findings={
                "confirmed": confirmed_count,
                "likely": likely_count,
                "possible": possible_count,
                "unknown": unknown_count,
                "total": len(findings)
            },
            certificates=len(certificates),
            dependencies=len(graph.edges),
            migration_items=len(migration_plan),
            warnings=len(warnings),
            algorithms_detected=algs,
            components_detected=components
        )

        result = ScanResult(
            summary=summary,
            findings=findings,
            certificates=certificates,
            dependency_graph=graph,
            migration_plan=migration_plan,
            warnings=warnings,
            limitations=LIMITATIONS
        )

        self.storage.save_scan(result)
        return result
