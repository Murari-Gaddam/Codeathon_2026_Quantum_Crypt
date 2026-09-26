"""
YAML / JSON / .env configuration scanner for cryptographic parameters.
Inspects TLS versions, cipher suites, certificate paths, JWT settings, etc.
"""

import re
import yaml
import json
from typing import List, Dict, Any


def scan_yaml_config(file_path: str, relative_path: str, component_name: str) -> List[Dict[str, Any]]:
    findings = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()

        for idx, line in enumerate(lines):
            line_num = idx + 1
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue

            # TLS Version detection
            if "min_version:" in stripped or "max_version:" in stripped or "tls_version:" in stripped:
                match = re.search(r"['\"]?(TLSv1\.[0-3])['\"]?", stripped)
                if match:
                    tls_ver = match.group(1)
                    confidence = "confirmed"
                    status = "deprecated" if tls_ver in ["TLSv1.0", "TLSv1.1"] else ("legacy_supported" if tls_ver == "TLSv1.2" else "modern")
                    concern = "Legacy TLS version enabled. Does not support PQC key exchange groups." if tls_ver in ["TLSv1.0", "TLSv1.1", "TLSv1.2"] else "TLS 1.3 enabled. Needs hybrid PQC key exchange configuration."
                    findings.append({
                        "mechanism": f"Protocol ({tls_ver})",
                        "algorithm_variant": tls_ver,
                        "category": "tls",
                        "usage": "tls_configuration",
                        "confidence": confidence,
                        "file": relative_path,
                        "line": line_num,
                        "column": line.find(tls_ver) + 1,
                        "evidence": stripped,
                        "detection_rule": f"config-tls-version-{tls_ver.lower().replace('.', '')}",
                        "component": component_name,
                        "protocol": tls_ver,
                        "concern": concern,
                        "recommended_action": "Configure hybrid PQC key exchange (e.g. X25519+ML-KEM-768). Mandate TLS 1.3.",
                        "quantum_impact": "Classical TLS key exchange vulnerable to Harvest-Now-Decrypt-Later (HNDL) attacks.",
                        "is_indirect": False
                    })

            # Cipher suites detection
            if "cipher_suites:" in stripped or "TLS_ECDHE" in stripped or "AES_256_GCM" in stripped:
                ciphers = re.findall(r"TLS_[A-Z0-9_]+", stripped)
                for c in ciphers:
                    findings.append({
                        "mechanism": "Cipher Suite",
                        "algorithm_variant": c,
                        "category": "tls",
                        "usage": "cipher_suite_negotiation",
                        "confidence": "confirmed",
                        "file": relative_path,
                        "line": line_num,
                        "column": line.find(c) + 1,
                        "evidence": stripped,
                        "detection_rule": "config-cipher-suite",
                        "component": component_name,
                        "protocol": "TLS",
                        "concern": f"Cipher suite {c} detected. Employs classical key exchange (ECDHE / RSA).",
                        "recommended_action": "Add post-quantum hybrid key encapsulation suites.",
                        "quantum_impact": "Key exchange session keys can be cracked retroactively by CRQC.",
                        "is_indirect": False
                    })

            # JWT algorithm in config
            if "algorithm:" in stripped and ("RS256" in stripped or "ES256" in stripped or "HS256" in stripped):
                match = re.search(r"['\"]?([R|E|H|P]S\d{3})['\"]?", stripped)
                if match:
                    alg = match.group(1)
                    findings.append({
                        "mechanism": f"JWT-{alg}",
                        "algorithm_variant": alg,
                        "category": "jwt",
                        "usage": "token_configuration",
                        "confidence": "confirmed",
                        "file": relative_path,
                        "line": line_num,
                        "column": line.find(alg) + 1,
                        "evidence": stripped,
                        "detection_rule": "config-jwt-algorithm",
                        "component": component_name,
                        "protocol": f"JWT / {alg}",
                        "concern": f"Configured JWT signing algorithm {alg}.",
                        "recommended_action": "Plan migration to composite hybrid token verification.",
                        "quantum_impact": "Asymmetric algorithm vulnerable to Shor's algorithm.",
                        "is_indirect": False
                    })

            # Certificate / Key file paths
            if "certificate_path:" in stripped or "ssl_certificate" in stripped:
                findings.append({
                    "mechanism": "Certificate Reference",
                    "algorithm_variant": "X.509 Path",
                    "category": "certificate",
                    "usage": "certificate_binding",
                    "confidence": "confirmed",
                    "file": relative_path,
                    "line": line_num,
                    "column": 1,
                    "evidence": stripped,
                    "detection_rule": "config-certificate-reference",
                    "component": component_name,
                    "protocol": "TLS / X.509",
                    "concern": "Explicit certificate path configured. Public key parameters must be inventoried.",
                    "recommended_action": "Inspect certificate inventory for classical RSA/ECDSA public keys.",
                    "quantum_impact": "Identity spoofing and TLS interception if CA or leaf keys are broken.",
                    "is_indirect": False
                })

    except Exception as e:
        print(f"Error scanning config file {file_path}: {e}")

    return findings
