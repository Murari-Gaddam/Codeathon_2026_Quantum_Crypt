"""
Dependency manifest scanner.
Parses requirements.txt, package.json, pom.xml, go.mod for cryptographic libraries.
"""

import os
import json
import re
from typing import List, Dict, Any


def scan_manifest_file(file_path: str, relative_path: str, component_name: str, library_rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    findings = []
    file_name = os.path.basename(file_path).lower()

    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()

        if file_name == "requirements.txt":
            for idx, line in enumerate(lines):
                line_num = idx + 1
                stripped = line.strip()
                if not stripped or stripped.startswith("#"):
                    continue

                for lib in library_rules:
                    if lib.get("language") != "python":
                        continue
                    for pkg in lib.get("package_names", []):
                        if stripped.lower().startswith(pkg.lower()):
                            findings.append({
                                "mechanism": f"Dependency ({lib.get('name')})",
                                "algorithm_variant": stripped,
                                "category": "library",
                                "usage": "dependency_manifest",
                                "confidence": "confirmed",
                                "file": relative_path,
                                "line": line_num,
                                "column": 1,
                                "evidence": stripped,
                                "detection_rule": f"manifest-python-{pkg}",
                                "component": component_name,
                                "concern": f"Python cryptographic dependency '{pkg}' declared in manifest. {lib.get('pqc_status')}",
                                "recommended_action": lib.get("migration_guidance", "Assess PQC compatibility."),
                                "quantum_impact": "Application dependency surface.",
                                "is_indirect": True,
                                "inferred_from": f"Manifest package: {stripped}"
                            })

        elif file_name == "package.json":
            try:
                data = json.loads("".join(lines))
                deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                for idx, line in enumerate(lines):
                    line_num = idx + 1
                    for lib in library_rules:
                        if lib.get("language") not in ["javascript", "typescript"]:
                            continue
                        for pkg in lib.get("package_names", []):
                            if f'"{pkg}"' in line:
                                version = deps.get(pkg, "")
                                findings.append({
                                    "mechanism": f"Dependency ({lib.get('name')})",
                                    "algorithm_variant": f"{pkg}@{version}",
                                    "category": "library",
                                    "usage": "dependency_manifest",
                                    "confidence": "confirmed",
                                    "file": relative_path,
                                    "line": line_num,
                                    "column": line.find(pkg) + 1,
                                    "evidence": line.strip(),
                                    "detection_rule": f"manifest-node-{pkg}",
                                    "component": component_name,
                                    "concern": f"Node.js cryptographic dependency '{pkg}' declared in package.json. {lib.get('pqc_status')}",
                                    "recommended_action": lib.get("migration_guidance", "Assess PQC compatibility."),
                                    "quantum_impact": "Dependency surface.",
                                    "is_indirect": True,
                                    "inferred_from": f"Manifest dependency: {pkg}@{version}"
                                })
            except Exception as je:
                pass

    except Exception as e:
        print(f"Error scanning manifest {file_path}: {e}")

    return findings
