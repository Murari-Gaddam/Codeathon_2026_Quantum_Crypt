"""
JavaScript / TypeScript static scanner for cryptographic mechanisms.
Extracts line, column, snippet, and confidence.
"""

import re
from typing import List, Dict, Any


def scan_js_file(file_path: str, relative_path: str, component_name: str, rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    findings = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()

        for idx, line in enumerate(lines):
            line_num = idx + 1
            stripped = line.strip()
            if not stripped or stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
                continue

            # Check for JWT RS256/ES256 validation or signing
            if "algorithms:" in stripped or "algorithm:" in stripped:
                match = re.search(r"['\"](RS256|RS384|RS512|ES256|ES384|ES512|PS256|HS256)['\"]", stripped)
                if match:
                    alg = match.group(1)
                    findings.append({
                        "mechanism": f"JWT-{alg}",
                        "algorithm_variant": alg,
                        "category": "jwt",
                        "usage": "token_verification" if "verify" in "".join(lines[max(0, idx-4):idx+2]) else "token_signing",
                        "confidence": "confirmed",
                        "file": relative_path,
                        "line": line_num,
                        "column": line.find(alg) + 1,
                        "evidence": stripped,
                        "detection_rule": "js-jwt-algorithm-spec",
                        "component": component_name,
                        "protocol": f"JWT / {alg}",
                        "concern": f"Downstream consumer verifies {alg} tokens. Requires public key of issuer. Vulnerable to Shor's algorithm.",
                        "recommended_action": "Implement crypto-agility validation gateway supporting composite dual-tokens during PQC migration.",
                        "quantum_impact": "Integer factorization or ECC discrete logarithm quantum vulnerability.",
                        "is_indirect": False
                    })

            # Check for crypto library imports
            if ("import" in stripped or "require(" in stripped) and ("jsonwebtoken" in stripped or "jose" in stripped or "node-forge" in stripped or "crypto" in stripped):
                col = max(1, line.find("jsonwebtoken") or line.find("jose") or line.find("crypto"))
                lib_name = "jsonwebtoken" if "jsonwebtoken" in stripped else ("jose" if "jose" in stripped else "node:crypto")
                findings.append({
                    "mechanism": f"Library ({lib_name})",
                    "algorithm_variant": lib_name,
                    "category": "library",
                    "usage": "library_import",
                    "confidence": "confirmed",
                    "file": relative_path,
                    "line": line_num,
                    "column": col + 1,
                    "evidence": stripped,
                    "detection_rule": "js-library-import",
                    "component": component_name,
                    "concern": f"Cryptographic library '{lib_name}' imported in application layer.",
                    "recommended_action": "Assess library readiness for PQC and composite algorithms.",
                    "quantum_impact": "Dependency surface.",
                    "is_indirect": False
                })

            # Check for createHash / SHA-256
            if "createHash(" in stripped:
                hash_match = re.search(r"createHash\(['\"]([^'\"]+)['\"]\)", stripped)
                hash_name = hash_match.group(1).upper() if hash_match else "SHA-256"
                findings.append({
                    "mechanism": hash_name,
                    "algorithm_variant": hash_name,
                    "category": "hash",
                    "usage": "hash_computation",
                    "confidence": "confirmed",
                    "file": relative_path,
                    "line": line_num,
                    "column": line.find("createHash") + 1,
                    "evidence": stripped,
                    "detection_rule": "js-crypto-createhash",
                    "component": component_name,
                    "concern": f"Hash function {hash_name} used for data integrity/hashing.",
                    "recommended_action": "SHA-256/SHA-384 remains quantum-resilient against collision search.",
                    "quantum_impact": "Grover's algorithm minimally impacts 256-bit collision security (2^128 work factor).",
                    "is_indirect": False
                })

    except Exception as e:
        print(f"Error scanning JS file {file_path}: {e}")

    return findings
