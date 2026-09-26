"""
Migration Planner for PQC Transition.
Generates prioritized migration checklist, validation gates (1-8),
and documents exact rationale for assigned priorities.
"""

from typing import List, Dict, Any
from app.schemas.scan import Finding, CertificateRecord, MigrationItem, ValidationGate


GATE_DEFINITIONS = [
    (1, "Inventory complete", "All cryptographic assets, public keys, and certificate paths identified and cataloged."),
    (2, "Library/provider compatibility", "Ensure runtime libraries and operating environments support chosen PQC or hybrid providers."),
    (3, "Unit/integration tests", "Validate that signing, verification, and encryption unit tests pass with new cryptographic keys."),
    (4, "Interoperability tests", "Verify external token consumers and client applications can parse and validate updated structures."),
    (5, "Performance tests", "Measure throughput, CPU latency, signature size expansion, and handshake overhead."),
    (6, "Security/configuration review", "Verify no secret material is committed, entropy sources are vetted, and configurations hardened."),
    (7, "Rollback test", "Demonstrate seamless fallback to classical configuration in the event of upstream client failure."),
    (8, "Production readiness review", "Sign-off from architecture, security engineering, and infrastructure operations.")
]


def create_default_validation_gates() -> List[ValidationGate]:
    return [
        ValidationGate(id=gid, name=name, description=desc, completed=(gid == 1))
        for gid, name, desc in GATE_DEFINITIONS
    ]


def generate_migration_plan(findings: List[Finding], certificates: List[CertificateRecord]) -> List[MigrationItem]:
    items: List[MigrationItem] = []
    item_counter = 1

    # 1. Critical Key Exchange / TLS items
    tls_findings = [f for f in findings if f.category == "tls" or "TLS" in f.mechanism]
    if tls_findings:
        items.append(MigrationItem(
            id=f"mig-{item_counter:03d}",
            priority="critical",
            priority_reason="High exposure to Harvest-Now-Decrypt-Later (HNDL) attacks. Classical TLS session keys recorded today can be decrypted once CRQC is available.",
            component="api-gateway",
            finding_id=tls_findings[0].id,
            mechanism="TLS 1.2 / Classical Key Exchange",
            reason_for_review="Public-facing reverse proxy negotiates classical ECDHE/RSA key exchange without post-quantum hybrid groups.",
            dependencies=["api-gateway", "nginx-ingress", "external-clients"],
            suggested_investigation="Upgrade server TLS configuration to TLS 1.3 and enable X25519MLKEM768 hybrid key exchange group.",
            compatibility_concerns=[
                "Legacy client compatibility with TLS 1.3 only",
                "Client-Hello message size increase with hybrid keys",
                "Middlebox interference with post-quantum extensions"
            ],
            validation_gates=create_default_validation_gates(),
            status="investigating",
            owner="Platform Engineering",
            notes="Requires staging environment TLS handshake probe."
        ))
        item_counter += 1

    # 2. Asymmetric RSA-2048 Token Signing in Auth Service
    rsa_findings = [f for f in findings if "RSA" in f.mechanism or "RS256" in (f.algorithm_variant or "")]
    if rsa_findings:
        items.append(MigrationItem(
            id=f"mig-{item_counter:03d}",
            priority="high",
            priority_reason="High dependency fan-out: changing token signing mechanism impacts token issuer and all downstream verifying microservices.",
            component="authentication-service",
            finding_id=rsa_findings[0].id,
            mechanism="RSA-2048 / RS256 JWT Signing",
            reason_for_review="Authentication tokens signed with classical RSA-2048. Digital signatures can be forged if private key is factored via Shor's algorithm.",
            dependencies=["authentication-service", "api-gateway", "user-service", "order-service"],
            suggested_investigation="Evaluate CryptoProvider agility abstraction to support Composite Hybrid Tokens (RS256 + ML-DSA-65) during multi-year transition.",
            compatibility_concerns=[
                "Header & token payload size increase (ML-DSA signatures are ~3.3 KB vs 256 bytes for RSA)",
                "HTTP header buffer limits on upstream reverse proxies",
                "JWT library support across diverse languages (Python, Node, Java)"
            ],
            validation_gates=create_default_validation_gates(),
            status="investigating",
            owner="Identity Security Team",
            notes="Sandbox testing demonstrated dual-provider signing capability."
        ))
        item_counter += 1

    # 3. Certificate Inventory Migration
    if certificates:
        classical_certs = [c for c in certificates if "RSA" in c.public_key_algorithm or "ECDSA" in c.public_key_algorithm]
        if classical_certs:
            items.append(MigrationItem(
                id=f"mig-{item_counter:03d}",
                priority="high",
                priority_reason="Public-key infrastructure trust anchors take significant lead time to reissue, distribute, and cross-certify.",
                component="pki-infrastructure",
                finding_id=classical_certs[0].id,
                mechanism=f"X.509 Leaf & CA ({classical_certs[0].public_key_algorithm})",
                reason_for_review=f"Certificates use classical public keys ({', '.join(set(c.public_key_algorithm for c in classical_certs))}).",
                dependencies=["api.enterprise.internal", "Corporate CA Trust Store", "mTLS Microservices"],
                suggested_investigation="Formulate Dual-Certificate deployment timeline (RFC 9310 / composite X.509 certs).",
                compatibility_concerns=[
                    "CA/Browser Forum standards compliance for PQC certificates",
                    "Hardware Security Module (HSM) support for ML-DSA keys",
                    "Legacy operating system trust store updates"
                ],
                validation_gates=create_default_validation_gates(),
                status="not-started",
                owner="SecOps / PKI Team",
                notes="Monitor NIST and CA/B forum draft guidance."
            ))
            item_counter += 1

    # 4. Broken Legacy Algorithms (Immediate review)
    legacy_findings = [f for f in findings if f.mechanism in ["SHA-1", "3DES", "DES", "MD5", "DSA"]]
    if legacy_findings:
        items.append(MigrationItem(
            id=f"mig-{item_counter:03d}",
            priority="immediate",
            priority_reason="Classically broken primitives violate current compliance baselines regardless of quantum computing.",
            component=legacy_findings[0].component,
            finding_id=legacy_findings[0].id,
            mechanism=legacy_findings[0].mechanism,
            reason_for_review=f"{legacy_findings[0].mechanism} has broken collision or cipher resistance.",
            dependencies=[legacy_findings[0].component],
            suggested_investigation="Replace immediately with SHA-256 or AES-256-GCM prior to PQC migration phase.",
            compatibility_concerns=[
                "Legacy database checksum compatibility",
                "Historical record verification"
            ],
            validation_gates=create_default_validation_gates(),
            status="not-started",
            owner="Application Lead",
            notes="Deprecated classical cryptographic hygiene."
        ))
        item_counter += 1

    # 5. Symmetric Encryption (AES-128 vs AES-256)
    aes_findings = [f for f in findings if "AES" in f.mechanism]
    if aes_findings:
        items.append(MigrationItem(
            id=f"mig-{item_counter:03d}",
            priority="medium",
            priority_reason="Grover's algorithm halves brute-force security. AES-128 drops to 64-bit quantum security; AES-256 remains 128-bit secure.",
            component="authentication-service",
            finding_id=aes_findings[0].id,
            mechanism="AES Symmetric Encryption",
            reason_for_review="Verify that all symmetric encryption keys are 256 bits in length and using authenticated modes (GCM).",
            dependencies=["authentication-service", "key-vault"],
            suggested_investigation="Enforce 256-bit key length policy across all cipher initializations.",
            compatibility_concerns=[
                "Storage re-encryption if migrating historical data from 128-bit keys",
                "Key management system API parameter validation"
            ],
            validation_gates=create_default_validation_gates(),
            status="not-started",
            owner="Data Security Team",
            notes="Standardize on AES-256-GCM."
        ))
        item_counter += 1

    return items
