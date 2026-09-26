"""
Generic multi-language source code scanner for Java, Go, Rust, C/C++, etc.
Uses rule engine to scan text evidence with accurate line and column tracking.
"""

import os
import re
from typing import List, Dict, Any


def scan_generic_code_file(file_path: str, relative_path: str, component_name: str, rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    findings = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()

        for idx, line in enumerate(lines):
            line_num = idx + 1
            stripped = line.strip()
            if not stripped or stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
                continue

            for rule in rules:
                for pattern in rule.get("patterns", []):
                    match = re.search(pattern, line)
                    if match:
                        findings.append({
                            "mechanism": rule.get("mechanism", "Cryptographic Mechanism"),
                            "algorithm_variant": rule.get("id"),
                            "category": rule.get("category", "asymmetric"),
                            "usage": rule.get("migration_role", "cryptographic_operation"),
                            "confidence": "likely",
                            "file": relative_path,
                            "line": line_num,
                            "column": match.start() + 1,
                            "evidence": stripped,
                            "detection_rule": f"generic-rule-{rule.get('id')}",
                            "component": component_name,
                            "concern": rule.get("quantum_impact", "Cryptographic mechanism detected."),
                            "recommended_action": rule.get("recommended_pqc_replacement", "Evaluate migration to post-quantum alternatives."),
                            "quantum_impact": rule.get("quantum_impact", "Potential migration concern."),
                            "is_indirect": False
                        })
                        break
    except Exception as e:
        print(f"Error scanning generic code {file_path}: {e}")

    return findings
