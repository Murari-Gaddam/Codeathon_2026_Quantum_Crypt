import React, { useState } from "react";
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  Input,
  Badge,
} from "@fluentui/react-components";
import { Search16Regular } from "@fluentui/react-icons";
import type { Finding, CertificateRecord } from "../types";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  findings: Finding[];
  certificates: CertificateRecord[];
  onSelectFinding: (finding: Finding) => void;
}

export const GlobalSearch: React.FC<Props> = ({ open, onOpenChange, findings, certificates, onSelectFinding }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const term = searchTerm.toLowerCase().trim();

  const matchingFindings = term
    ? findings.filter(
        (f) =>
          f.id.toLowerCase().includes(term) ||
          f.mechanism.toLowerCase().includes(term) ||
          (f.algorithm_variant || "").toLowerCase().includes(term) ||
          f.file.toLowerCase().includes(term) ||
          f.component.toLowerCase().includes(term) ||
          (f.protocol || "").toLowerCase().includes(term)
      )
    : [];

  const matchingCerts = term
    ? certificates.filter(
        (c) =>
          c.subject.toLowerCase().includes(term) ||
          c.issuer.toLowerCase().includes(term) ||
          c.public_key_algorithm.toLowerCase().includes(term) ||
          c.fingerprint_sha256.toLowerCase().includes(term)
      )
    : [];

  const matchingComponents = term
    ? Array.from(new Set(findings.map((f) => f.component))).filter((c) => c.toLowerCase().includes(term))
    : [];

  return (
    <Dialog open={open} onOpenChange={(_, d) => onOpenChange(d.open)}>
      <DialogSurface style={{ maxWidth: "680px", maxHeight: "80vh", overflow: "hidden" }}>
        <DialogBody>
          <DialogTitle>Search Cryptographic Inventory</DialogTitle>
          <DialogContent style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            <Input
              contentBefore={<Search16Regular />}
              placeholder="Search algorithm, file, component, protocol, finding ID (e.g. RSA-2048, JWT, server.pem)..."
              value={searchTerm}
              onChange={(_, d) => setSearchTerm(d.value)}
              autoFocus
              style={{ width: "100%" }}
            />

            {term && (
              <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
                <span>Found:</span>
                <Badge appearance="tint" color="brand">{matchingFindings.length} findings</Badge>
                <Badge appearance="tint" color="informative">{matchingComponents.length} components</Badge>
                <Badge appearance="tint" color="subtle">{matchingCerts.length} certificates</Badge>
              </div>
            )}

            <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {matchingFindings.length > 0 && (
                <div>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--colorNeutralForeground3)", textTransform: "uppercase" }}>
                    Findings
                  </h4>
                  {matchingFindings.slice(0, 10).map((f) => (
                    <div
                      key={f.id}
                      onClick={() => {
                        onSelectFinding(f);
                        onOpenChange(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid var(--colorNeutralStroke2)",
                        borderRadius: "4px",
                        marginBottom: "6px",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "var(--colorNeutralBackground1)",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "13px" }}>
                          {f.id}: {f.mechanism} <span style={{ color: "var(--colorNeutralForeground3)", fontWeight: 400 }}>({f.algorithm_variant || f.category})</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
                          <code>{f.file}:{f.line}</code> · Component: <strong>{f.component}</strong>
                        </div>
                      </div>
                      <ConfidenceBadge confidence={f.confidence} />
                    </div>
                  ))}
                </div>
              )}

              {matchingCerts.length > 0 && (
                <div>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--colorNeutralForeground3)", textTransform: "uppercase" }}>
                    Certificates
                  </h4>
                  {matchingCerts.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid var(--colorNeutralStroke2)",
                        borderRadius: "4px",
                        marginBottom: "6px",
                        background: "var(--colorNeutralBackground1)",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "13px" }}>{c.subject}</div>
                      <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
                        {c.public_key_algorithm} ({c.key_size_bits || "N/A"} bits) · Sig: {c.signature_algorithm}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {term && matchingFindings.length === 0 && matchingCerts.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--colorNeutralForeground3)" }}>
                  No matching cryptographic findings or certificates found.
                </div>
              )}
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
