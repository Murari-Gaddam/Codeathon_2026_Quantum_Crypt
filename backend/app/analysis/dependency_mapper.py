"""
Cryptographic Dependency Mapper.
Constructs a directed graph representing components, libraries, protocols, algorithms, and certificates.
"""

from typing import List, Dict, Set
from app.schemas.scan import Finding, CertificateRecord, DependencyGraph, DependencyNode, DependencyEdge


def build_dependency_graph(findings: List[Finding], certificates: List[CertificateRecord]) -> DependencyGraph:
    nodes_dict: Dict[str, DependencyNode] = {}
    edges: List[DependencyEdge] = []
    edge_keys: Set[str] = set()

    def add_node(node_id: str, label: str, node_type: str, status: str = "Discovered", details: dict = None):
        if node_id not in nodes_dict:
            nodes_dict[node_id] = DependencyNode(
                id=node_id,
                label=label,
                type=node_type,
                status=status,
                details=details or {}
            )

    def add_edge(src: str, tgt: str, rel: str, conf: str = "confirmed", ev: str = ""):
        key = f"{src}->{tgt}:{rel}"
        if key not in edge_keys:
            edge_keys.add(key)
            edges.append(DependencyEdge(
                id=f"edge-{len(edges)+1}",
                source=src,
                target=tgt,
                relationship=rel,
                confidence=conf,
                evidence=[ev] if ev else []
            ))

    # Add components found
    components = set(f.component for f in findings)
    for comp in components:
        add_node(f"comp-{comp}", comp, "service", "Discovered", {"component": comp})

    # Add certificates
    for cert in certificates:
        cert_node_id = f"cert-{cert.id}"
        add_node(cert_node_id, f"Cert: {cert.subject[:25]}", "certificate", "Discovered", {
            "subject": cert.subject,
            "issuer": cert.issuer,
            "pub_key": cert.public_key_algorithm,
            "fingerprint": cert.fingerprint_sha256
        })
        # If server cert, link to api-gateway
        if "api.enterprise" in cert.subject or "localhost" in cert.san_list:
            add_edge("comp-api-gateway", cert_node_id, "protected-by", "confirmed", cert.file)

    # Process findings
    for f in findings:
        comp_id = f"comp-{f.component}"
        alg_variant = f.algorithm_variant or f.mechanism
        alg_node_id = f"alg-{alg_variant.lower().replace(' ', '-').replace('/', '-')}"

        add_node(alg_node_id, alg_variant, "algorithm", "Discovered", {
            "mechanism": f.mechanism,
            "category": f.category,
            "quantum_impact": f.quantum_impact
        })

        # Protocols
        if f.protocol:
            proto_node_id = f"proto-{f.protocol.lower().replace(' ', '-').replace('/', '-')}"
            add_node(proto_node_id, f.protocol, "protocol", "Discovered", {"protocol": f.protocol})
            add_edge(comp_id, proto_node_id, "configured-with", f.confidence, f"{f.file}:{f.line}")
            add_edge(proto_node_id, alg_node_id, "uses", f.confidence, f"{f.file}:{f.line}")
        else:
            rel = "uses"
            if "signing" in f.usage:
                rel = "signs-with"
            elif "verification" in f.usage:
                rel = "verifies-with"
            add_edge(comp_id, alg_node_id, rel, f.confidence, f"{f.file}:{f.line}")

        # Check library usage
        if f.category == "library" or "Library" in f.mechanism:
            lib_node_id = f"lib-{alg_variant.lower()}"
            add_node(lib_node_id, alg_variant, "library", "Discovered", {"library": alg_variant})
            add_edge(comp_id, lib_node_id, "imports", f.confidence, f"{f.file}:{f.line}")

    # Connect token validation relationship between api-gateway and authentication-service
    if "comp-api-gateway" in nodes_dict and "comp-authentication-service" in nodes_dict:
        add_edge("comp-api-gateway", "comp-authentication-service", "depends-on", "confirmed", "JWT Token Validation Contract")

    return DependencyGraph(nodes=list(nodes_dict.values()), edges=edges)
