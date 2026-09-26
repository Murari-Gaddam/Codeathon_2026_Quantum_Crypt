"""
Pydantic data schemas for PQC Migration Scanner.
Adheres strictly to the specification in README.md.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Finding(BaseModel):
    id: str
    mechanism: str
    algorithm_variant: Optional[str] = None
    category: str  # asymmetric, symmetric, hash, key_exchange, tls, jwt, library
    usage: str     # key_generation, signature_generation, token_signing, symmetric_encryption, key_exchange, etc.
    confidence: str # confirmed, likely, possible, unknown
    file: str
    line: int
    column: int = 1
    evidence: str
    detection_rule: str
    component: str
    protocol: Optional[str] = None
    status: str = "needs-review" # needs-review, reviewed, in-testing, migration-planned, completed
    concern: str
    recommended_action: str
    quantum_impact: str
    is_indirect: bool = False
    inferred_from: Optional[str] = None


class CertificateRecord(BaseModel):
    id: str
    file: str
    subject: str
    issuer: str
    valid_from: str
    valid_to: str
    is_expired: bool = False
    public_key_algorithm: str
    key_size_bits: Optional[int] = None
    signature_algorithm: str
    san_list: List[str] = Field(default_factory=list)
    fingerprint_sha256: str
    private_key_detected: bool = False
    migration_assessment: str
    quantum_impact: str


class DependencyNode(BaseModel):
    id: str
    label: str
    type: str  # application, service, library, protocol, algorithm, key, certificate, validation_gate
    status: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class DependencyEdge(BaseModel):
    id: str
    source: str
    target: str
    relationship: str  # imports, depends-on, configured-with, uses, signs-with, verifies-with, protected-by
    confidence: str = "confirmed"
    evidence: List[str] = Field(default_factory=list)


class DependencyGraph(BaseModel):
    nodes: List[DependencyNode] = Field(default_factory=list)
    edges: List[DependencyEdge] = Field(default_factory=list)


class ValidationGate(BaseModel):
    id: int
    name: str
    description: str
    completed: bool = False
    verified_by: Optional[str] = None
    verified_at: Optional[str] = None


class MigrationItem(BaseModel):
    id: str
    priority: str  # immediate, critical, high, medium, low, info
    priority_reason: str
    component: str
    finding_id: Optional[str] = None
    mechanism: str
    reason_for_review: str
    dependencies: List[str] = Field(default_factory=list)
    suggested_investigation: str
    compatibility_concerns: List[str] = Field(default_factory=list)
    validation_gates: List[ValidationGate] = Field(default_factory=list)
    status: str = "not-started"  # not-started, investigating, in-testing, blocked, ready-for-review, completed
    owner: str = "Unassigned"
    notes: str = ""


class ScanSummary(BaseModel):
    scan_id: str
    timestamp: str
    target_path: str
    status: str
    files_scanned: int
    findings: Dict[str, int]
    certificates: int
    dependencies: int
    migration_items: int
    warnings: int
    algorithms_detected: List[str] = Field(default_factory=list)
    components_detected: List[str] = Field(default_factory=list)


class ScanResult(BaseModel):
    summary: ScanSummary
    findings: List[Finding] = Field(default_factory=list)
    certificates: List[CertificateRecord] = Field(default_factory=list)
    dependency_graph: DependencyGraph = Field(default_factory=DependencyGraph)
    migration_plan: List[MigrationItem] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)


class SandboxTestRequest(BaseModel):
    provider: str  # classical, hybrid, pqc
    algorithm: str # RSA-PSS, ECDSA-P256, AES-256-GCM, Composite-ECDSA-MLDSA, ML-DSA-65, ML-KEM-768
    message: str = "Post-Quantum Cryptography Migration Payload"
    operation: str = "sign_and_verify" # sign_and_verify, key_exchange_encrypt


class SandboxTestResponse(BaseModel):
    provider: str
    algorithm: str
    operation: str
    status: str
    execution_time_ms: float
    message: str
    signature_or_cipher_preview: str
    public_key_preview: str
    key_size_bytes: int
    signature_or_ciphertext_size_bytes: int
    is_quantum_resistant: bool
    compatibility_notes: List[str]
    interoperability_summary: str
    rollback_strategy: str


class CIComparisonResult(BaseModel):
    passed: bool
    policy_name: str
    status: str  # PASSED, WARNING, FAILED
    violations: List[Dict[str, Any]] = Field(default_factory=list)
    warnings: List[Dict[str, Any]] = Field(default_factory=list)
    new_findings: List[Finding] = Field(default_factory=list)
    summary_message: str
