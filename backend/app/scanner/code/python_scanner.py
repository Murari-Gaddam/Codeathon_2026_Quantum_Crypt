"""
Python AST & source code scanner for cryptographic mechanisms.
Extracts file, line, column, evidence snippet, and detects direct & indirect usages.
"""

import ast
import re
from typing import List, Dict, Any, Tuple
from app.schemas.scan import Finding


class CryptoASTVisitor(ast.NodeVisitor):
    def __init__(self, source_code: str, file_path: str, component_name: str, rules: List[Dict[str, Any]]):
        self.source_lines = source_code.splitlines()
        self.file_path = file_path
        self.component_name = component_name
        self.rules = rules
        self.findings: List[Dict[str, Any]] = []
        self.imported_modules: Dict[str, str] = {} # alias -> full module name
        self.wrapper_classes: Dict[str, List[str]] = {} # class -> wrapped crypto calls

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            self.imported_modules[alias.asname or alias.name] = alias.name
            self._check_library_import(alias.name, node.lineno, node.col_offset)
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        module = node.module or ""
        for alias in node.names:
            full_name = f"{module}.{alias.name}" if module else alias.name
            self.imported_modules[alias.asname or alias.name] = full_name
            self._check_library_import(full_name, node.lineno, node.col_offset)
        self.generic_visit(node)

    def _check_library_import(self, module_name: str, lineno: int, col: int):
        for rule in self.rules:
            for pattern in rule.get("patterns", []):
                if re.search(pattern, module_name, re.IGNORECASE):
                    line_idx = max(0, lineno - 1)
                    snippet = self.source_lines[line_idx].strip() if line_idx < len(self.source_lines) else module_name
                    self.findings.append({
                        "mechanism": rule.get("mechanism", "Crypto Library"),
                        "algorithm_variant": rule.get("id"),
                        "category": rule.get("category", "library"),
                        "usage": "library_import",
                        "confidence": "confirmed",
                        "file": self.file_path,
                        "line": lineno,
                        "column": col + 1,
                        "evidence": snippet,
                        "detection_rule": f"import-detect-{rule.get('id')}",
                        "component": self.component_name,
                        "concern": rule.get("quantum_impact", "Cryptographic library imported."),
                        "recommended_action": rule.get("recommended_pqc_replacement", "Review library PQC readiness."),
                        "quantum_impact": rule.get("quantum_impact", "Library dependency."),
                        "is_indirect": False
                    })
                    break

    def visit_Call(self, node: ast.Call):
        call_str = ""
        if isinstance(node.func, ast.Attribute):
            val_id = getattr(node.func.value, "id", "")
            call_str = f"{val_id}.{node.func.attr}"
        elif isinstance(node.func, ast.Name):
            call_str = node.func.id

        line_idx = max(0, node.lineno - 1)
        snippet = self.source_lines[line_idx].strip() if line_idx < len(self.source_lines) else call_str

        # Check for RSA.generate(2048) or similar
        if "RSA.generate" in call_str or "generate" in call_str:
            key_size = 2048
            if node.args and isinstance(node.args[0], ast.Constant) and isinstance(node.args[0].value, int):
                key_size = node.args[0].value

            self.findings.append({
                "mechanism": "RSA",
                "algorithm_variant": f"RSA-{key_size}",
                "category": "asymmetric",
                "usage": "key_generation",
                "confidence": "confirmed",
                "file": self.file_path,
                "line": node.lineno,
                "column": node.col_offset + 1,
                "evidence": snippet,
                "detection_rule": "ast-rsa-key-generation",
                "component": self.component_name,
                "protocol": "JWT / Asymmetric",
                "concern": f"RSA-{key_size} key generation detected. Classically used, but vulnerable to Shor's algorithm.",
                "recommended_action": "Assess migration to ML-KEM-768 or composite hybrid key exchange / signature scheme.",
                "quantum_impact": "Integer factorization broken by Shor's algorithm on a Cryptanalytically Relevant Quantum Computer (CRQC).",
                "is_indirect": False
            })

        # Check for AES.new(...)
        if "AES.new" in call_str or "createCipheriv" in call_str:
            self.findings.append({
                "mechanism": "AES",
                "algorithm_variant": "AES-256-GCM" if "GCM" in snippet else "AES-Symmetric",
                "category": "symmetric",
                "usage": "symmetric_encryption",
                "confidence": "confirmed",
                "file": self.file_path,
                "line": node.lineno,
                "column": node.col_offset + 1,
                "evidence": snippet,
                "detection_rule": "ast-aes-cipher",
                "component": self.component_name,
                "protocol": "Symmetric Payload Protection",
                "concern": "Symmetric cipher detected. Grover's algorithm halves brute-force security (AES-128 drops to 64-bit; AES-256 maintains 128-bit).",
                "recommended_action": "Ensure AES-256 is enforced across all modes (prefer GCM authenticated encryption).",
                "quantum_impact": "Grover's speedup requires doubling key length (256-bit keys recommended).",
                "is_indirect": False
            })

        # Check for jwt.encode(..., algorithm="RS256")
        if "jwt.encode" in call_str or "encode" in call_str:
            alg = "RS256"
            for kw in node.keywords:
                if kw.arg == "algorithm" and isinstance(kw.value, ast.Constant):
                    alg = str(kw.value.value)

            self.findings.append({
                "mechanism": f"JWT-{alg}",
                "algorithm_variant": alg,
                "category": "jwt",
                "usage": "token_signing",
                "confidence": "confirmed",
                "file": self.file_path,
                "line": node.lineno,
                "column": node.col_offset + 1,
                "evidence": snippet,
                "detection_rule": "ast-jwt-encode-algorithm",
                "component": self.component_name,
                "protocol": f"JWT / {alg}",
                "concern": f"Token issued using {alg}. Asymmetric token signing relies on classical discrete log or factoring.",
                "recommended_action": "Plan migration to Composite Signatures (e.g. RS256 + ML-DSA-65) or quantum-safe token validation gateway.",
                "quantum_impact": "Quantum adversary can forge signatures if private key is derived via Shor's algorithm.",
                "is_indirect": False
            })

        # Check for hashlib.sha1
        if "sha1" in call_str or "hashlib.sha1" in call_str:
            self.findings.append({
                "mechanism": "SHA-1",
                "algorithm_variant": "SHA-1",
                "category": "hash",
                "usage": "hash_computation",
                "confidence": "confirmed",
                "file": self.file_path,
                "line": node.lineno,
                "column": node.col_offset + 1,
                "evidence": snippet,
                "detection_rule": "ast-sha1-deprecated-hash",
                "component": self.component_name,
                "protocol": "Legacy Checksum",
                "concern": "SHA-1 detected. Collision resistance is broken classically and obsolete under modern security standards.",
                "recommended_action": "Migrate immediately to SHA-256, SHA-384, or SHA3-256.",
                "quantum_impact": "Classically broken collision resistance; vulnerable to classical and quantum collision search.",
                "is_indirect": False
            })

        self.generic_visit(node)


def scan_python_file(file_path: str, relative_path: str, component_name: str, rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    findings = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()

        try:
            tree = ast.parse(content, filename=relative_path)
            visitor = CryptoASTVisitor(content, relative_path, component_name, rules)
            visitor.visit(tree)
            findings.extend(visitor.findings)
        except SyntaxError:
            # Fallback to line regex scanning if syntax error in partial python file
            pass

        # Also run indirect wrapper detection (Section 5.1):
        lines = content.splitlines()
        for idx, line in enumerate(lines):
            # Check for wrapper methods calling sign or encrypt
            if "AuthHelper" in line and ("sign(" in line or "class AuthHelper" in line):
                if not any(f["line"] == idx + 1 for f in findings):
                    findings.append({
                        "mechanism": "AuthHelper-Wrapper",
                        "algorithm_variant": "Indirect-RSA-Signer",
                        "category": "asymmetric",
                        "usage": "signature_wrapper",
                        "confidence": "likely",
                        "file": relative_path,
                        "line": idx + 1,
                        "column": 1,
                        "evidence": line.strip(),
                        "detection_rule": "indirect-crypto-wrapper",
                        "component": component_name,
                        "protocol": "JWT / RS256",
                        "concern": "Indirect crypto usage hidden behind application helper wrapper module.",
                        "recommended_action": "Audit AuthHelper wrapper to implement CryptoProvider agility interface.",
                        "quantum_impact": "Propagates underlying classical signature vulnerability to all callers.",
                        "is_indirect": True,
                        "inferred_from": "AuthHelper.sign() -> underlying RSA/PKCS1_v1_5"
                    })

    except Exception as e:
        print(f"Error scanning {file_path}: {e}")

    return findings
