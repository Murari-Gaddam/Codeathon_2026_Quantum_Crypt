"""
Core Scanner Engine for PQC Migration & Crypto-Agility Scanner.
Safely enumerates supported files, invokes specialized parsers, and produces normalized raw findings.
"""

import os
import json
from typing import List, Dict, Any, Tuple
from app.scanner.code.python_scanner import scan_python_file
from app.scanner.code.js_scanner import scan_js_file
from app.scanner.code.generic_code_scanner import scan_generic_code_file
from app.scanner.config.yaml_config_scanner import scan_yaml_config
from app.scanner.config.nginx_config_scanner import scan_nginx_config
from app.scanner.certificates.cert_scanner import parse_certificate_file
from app.scanner.dependencies.manifest_scanner import scan_manifest_file
from app.schemas.scan import CertificateRecord


class ScannerEngine:
    def __init__(self, rules_dir: str):
        self.rules_dir = rules_dir
        self.algorithm_rules = self._load_json(os.path.join(rules_dir, "algorithms.json"))
        self.library_rules = self._load_json(os.path.join(rules_dir, "libraries.json"))
        self.protocol_rules = self._load_json(os.path.join(rules_dir, "protocols.json"))

    def _load_json(self, path: str) -> List[Dict[str, Any]]:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading {path}: {e}")
        return []

    def _infer_component_name(self, relative_path: str) -> str:
        parts = relative_path.replace("\\", "/").split("/")
        if "auth" in relative_path.lower():
            return "authentication-service"
        if "gateway" in relative_path.lower() or "nginx" in relative_path.lower() or "proxy" in relative_path.lower():
            return "api-gateway"
        if "service" in parts or "services" in parts:
            for p in parts:
                if p not in ["src", "app", "services", "service"]:
                    return p.replace(".py", "").replace(".ts", "").replace(".js", "")
        if len(parts) > 1:
            return parts[0]
        return "core-application"

    def scan_directory(self, target_dir: str) -> Tuple[List[Dict[str, Any]], List[CertificateRecord], int, List[str]]:
        raw_findings: List[Dict[str, Any]] = []
        certificates: List[CertificateRecord] = []
        files_scanned = 0
        warnings: List[str] = []

        ignore_dirs = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build", ".next"}

        for root, dirs, files in os.walk(target_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith(".")]

            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, target_dir).replace("\\", "/")

                # Security check: skip files over 5MB to prevent memory exhaustion
                try:
                    file_size = os.path.getsize(file_path)
                    if file_size > 5 * 1024 * 1024:
                        warnings.append(f"Skipped oversized file (>5MB): {rel_path}")
                        continue
                except OSError:
                    continue

                files_scanned += 1
                comp_name = self._infer_component_name(rel_path)
                lower_file = file.lower()

                # Certificate files (.pem, .crt, .cer, .der)
                if lower_file.endswith((".pem", ".crt", ".cer", ".der")):
                    cert = parse_certificate_file(file_path, rel_path)
                    if cert:
                        certificates.append(cert)
                        raw_findings.append({
                            "mechanism": cert.public_key_algorithm,
                            "algorithm_variant": f"{cert.public_key_algorithm}-{cert.key_size_bits or ''}".rstrip("-"),
                            "category": "certificate",
                            "usage": "x509_certificate",
                            "confidence": "confirmed",
                            "file": rel_path,
                            "line": 1,
                            "column": 1,
                            "evidence": f"Subject: {cert.subject} | SigAlg: {cert.signature_algorithm}",
                            "detection_rule": "cert-x509-parser",
                            "component": comp_name,
                            "protocol": "TLS / X.509",
                            "concern": cert.migration_assessment,
                            "recommended_action": "Plan replacement with post-quantum or hybrid dual-certificate hierarchy.",
                            "quantum_impact": cert.quantum_impact,
                            "is_indirect": False
                        })
                    continue

                # Python files
                if lower_file.endswith(".py"):
                    findings = scan_python_file(file_path, rel_path, comp_name, self.algorithm_rules)
                    raw_findings.extend(findings)
                    continue

                # JS / TS files
                if lower_file.endswith((".js", ".jsx", ".ts", ".tsx", ".mjs")):
                    findings = scan_js_file(file_path, rel_path, comp_name, self.algorithm_rules)
                    raw_findings.extend(findings)
                    continue

                # Nginx configs
                if lower_file.endswith(".conf") or "nginx" in lower_file:
                    findings = scan_nginx_config(file_path, rel_path, comp_name)
                    raw_findings.extend(findings)
                    continue

                # YAML / JSON / .env configs
                if lower_file.endswith((".yaml", ".yml", ".json", ".env")) and lower_file not in ["package.json", "package-lock.json"]:
                    findings = scan_yaml_config(file_path, rel_path, comp_name)
                    raw_findings.extend(findings)
                    continue

                # Dependency manifests
                if lower_file in ["requirements.txt", "package.json", "pom.xml", "go.mod", "cargo.toml"]:
                    findings = scan_manifest_file(file_path, rel_path, comp_name, self.library_rules)
                    raw_findings.extend(findings)
                    continue

                # Generic code files (Go, Java, C/C++, Rust)
                if lower_file.endswith((".java", ".go", ".rs", ".c", ".cpp", ".cs")):
                    findings = scan_generic_code_file(file_path, rel_path, comp_name, self.algorithm_rules)
                    raw_findings.extend(findings)
                    continue

        return raw_findings, certificates, files_scanned, warnings
