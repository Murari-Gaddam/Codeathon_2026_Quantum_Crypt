"""
Nginx / Web server configuration scanner for cryptographic mechanisms.
Inspects ssl_protocols, ssl_ciphers, ssl_certificate, etc.
"""

import re
from typing import List, Dict, Any


def scan_nginx_config(file_path: str, relative_path: str, component_name: str) -> List[Dict[str, Any]]:
    findings = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()

        for idx, line in enumerate(lines):
            line_num = idx + 1
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue

            if "ssl_protocols" in stripped:
                protocols = re.findall(r"TLSv1(?:\.[0-3])?", stripped)
                for proto in protocols:
                    concern = "Legacy TLS protocol enabled in Nginx. Lacks post-quantum key exchange." if proto in ["TLSv1", "TLSv1.1", "TLSv1.2"] else "TLS 1.3 enabled. Ready for hybrid PQC group negotiation."
                    findings.append({
                        "mechanism": f"Protocol ({proto})",
                        "algorithm_variant": proto,
                        "category": "tls",
                        "usage": "tls_termination",
                        "confidence": "confirmed",
                        "file": relative_path,
                        "line": line_num,
                        "column": line.find(proto) + 1,
                        "evidence": stripped,
                        "detection_rule": f"nginx-ssl-protocol-{proto.lower()}",
                        "component": component_name,
                        "protocol": proto,
                        "concern": concern,
                        "recommended_action": "Disable TLS 1.2 or enforce TLS 1.3 with hybrid PQC curve groups.",
                        "quantum_impact": "HNDL (Harvest Now, Decrypt Later) risks on recorded encrypted sessions.",
                        "is_indirect": False
                    })

            if "ssl_ciphers" in stripped:
                findings.append({
                    "mechanism": "Nginx Cipher Suites",
                    "algorithm_variant": "ECDHE-RSA / ECDHE-ECDSA",
                    "category": "tls",
                    "usage": "cipher_suite_negotiation",
                    "confidence": "confirmed",
                    "file": relative_path,
                    "line": line_num,
                    "column": line.find("ssl_ciphers") + 1,
                    "evidence": stripped,
                    "detection_rule": "nginx-ssl-ciphers",
                    "component": component_name,
                    "protocol": "TLS",
                    "concern": "Nginx TLS cipher suite list relies on classical ECDHE and RSA/ECDSA certificates.",
                    "recommended_action": "Configure hybrid post-quantum cipher suites and dual certificate chains.",
                    "quantum_impact": "Session keys decrypted retroactively by quantum adversaries.",
                    "is_indirect": False
                })

            if "ssl_certificate" in stripped and not "ssl_certificate_key" in stripped:
                findings.append({
                    "mechanism": "TLS Server Certificate",
                    "algorithm_variant": "X.509 Certificate",
                    "category": "certificate",
                    "usage": "tls_identity",
                    "confidence": "confirmed",
                    "file": relative_path,
                    "line": line_num,
                    "column": line.find("ssl_certificate") + 1,
                    "evidence": stripped,
                    "detection_rule": "nginx-ssl-certificate-path",
                    "component": component_name,
                    "protocol": "TLS",
                    "concern": "Certificate bound to reverse proxy. Requires inventory check of public key algorithm.",
                    "recommended_action": "Prepare hybrid or dual-certificate deployment (classical RSA/ECDSA + PQC ML-DSA).",
                    "quantum_impact": "Identity validation broken if classical signing key is derived.",
                    "is_indirect": False
                })

    except Exception as e:
        print(f"Error scanning Nginx config {file_path}: {e}")

    return findings
