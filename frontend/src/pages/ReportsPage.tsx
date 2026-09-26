import React from "react";
import {
  Card,
  Button,
  Badge,
  Divider,
} from "@fluentui/react-components";
import {
  DocumentArrowDown16Regular,
  Print16Regular,
  Document16Regular,
} from "@fluentui/react-icons";
import type { ScanResult } from "../types";
import { api } from "../services/api";

interface Props {
  scanResult: ScanResult | null;
}

export const ReportsPage: React.FC<Props> = ({ scanResult }) => {

  if (!scanResult) {
    return (
      <div style={{ textAlign: "center", padding: "64px 20px" }}>
        <Document16Regular style={{ fontSize: "40px", color: "var(--colorBrandForeground1)" }} />
        <h3>No Scan Results Available</h3>
        <p style={{ color: "var(--colorNeutralForeground2)" }}>Run a repository scan to generate an assessment report.</p>
      </div>
    );
  }

  const { summary, findings, certificates, migration_plan, limitations } = scanResult;

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scanResult, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pqc_report_${summary.scan_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadHTML = () => {
    window.open(api.getReportDownloadUrl(summary.scan_id), "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Action Header */}
      <Card style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px" }}>Cryptographic Inventory & Migration Assessment Report</h3>
            <div style={{ fontSize: "13px", color: "var(--colorNeutralForeground2)", marginTop: "4px" }}>
              Scan ID: <strong>{summary.scan_id}</strong> · Target: <code>{summary.target_path}</code> · Formatted for Technical Audit
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Button appearance="secondary" icon={<Print16Regular />} onClick={handlePrint}>
              Print Report
            </Button>
            <Button appearance="outline" icon={<DocumentArrowDown16Regular />} onClick={handleDownloadJSON}>
              Export JSON
            </Button>
            <Button appearance="primary" icon={<DocumentArrowDown16Regular />} onClick={handleDownloadHTML}>
              Download Standalone HTML
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Preview Document */}
      <Card style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Notice */}
        <div
          style={{
            background: "var(--colorNeutralBackground3)",
            borderLeft: "4px solid var(--colorBrandStroke1)",
            padding: "12px 16px",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          <strong>Security Communication Notice:</strong> Cryptographic mechanisms detected in this scan represent static inventory findings.
          This report does not claim that a scan proves a system is quantum-safe. It is an inventory, dependency-mapping, migration-planning, and crypto-agility demonstration document.
        </div>

        {/* Executive Summary */}
        <div>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "var(--colorNeutralForeground1)" }}>
            1. Executive Summary & Scope
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div style={{ background: "var(--colorNeutralBackground2)", padding: "12px", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>FILES SCANNED</div>
              <div style={{ fontSize: "20px", fontWeight: 700 }}>{summary.files_scanned}</div>
            </div>
            <div style={{ background: "var(--colorNeutralBackground2)", padding: "12px", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>CONFIRMED FINDINGS</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#107c41" }}>{summary.findings.confirmed}</div>
            </div>
            <div style={{ background: "var(--colorNeutralBackground2)", padding: "12px", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>LIKELY FINDINGS</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#795e00" }}>{summary.findings.likely}</div>
            </div>
            <div style={{ background: "var(--colorNeutralBackground2)", padding: "12px", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>PUBLIC CERTIFICATES</div>
              <div style={{ fontSize: "20px", fontWeight: 700 }}>{summary.certificates}</div>
            </div>
            <div style={{ background: "var(--colorNeutralBackground2)", padding: "12px", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>MIGRATION ACTION ITEMS</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#a80000" }}>{summary.migration_items}</div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Cryptographic Findings */}
        <div>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "var(--colorNeutralForeground1)" }}>
            2. Observed Evidence vs. Inferred Dependencies
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {findings.map((f) => (
              <div
                key={f.id}
                style={{
                  padding: "12px 16px",
                  border: "1px solid var(--colorNeutralStroke2)",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Badge appearance="tint" color={f.confidence === "confirmed" ? "success" : "warning"}>
                      {f.confidence.toUpperCase()}
                    </Badge>
                    <strong>{f.mechanism}</strong>
                    <span style={{ color: "var(--colorNeutralForeground3)" }}>({f.component})</span>
                  </div>
                  <Badge appearance="outline" color={f.is_indirect ? "warning" : "informative"}>
                    {f.is_indirect ? "Inferred Dependency" : "Observed Direct Evidence"}
                  </Badge>
                </div>
                <div style={{ marginTop: "6px" }}>
                  <code>{f.file}:{f.line}</code> · <code style={{ color: "var(--colorNeutralForeground1)" }}>{f.evidence}</code>
                </div>
                <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)", marginTop: "4px" }}>
                  <strong>Assessment:</strong> {f.concern}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* Public Certificate Inventory */}
        <div>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "var(--colorNeutralForeground1)" }}>
            3. Public-Key Certificate Inventory
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {certificates.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "12px 16px",
                  border: "1px solid var(--colorNeutralStroke2)",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                <div style={{ fontWeight: 600 }}>{c.subject}</div>
                <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)", marginTop: "2px" }}>
                  Issuer: {c.issuer} · Public Key: <strong>{c.public_key_algorithm} ({c.key_size_bits || "N/A"} bits)</strong> · Sig: {c.signature_algorithm}
                </div>
                <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", marginTop: "4px" }}>
                  SHA-256 Fingerprint: <code>{c.fingerprint_sha256}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* Migration Plan */}
        <div>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "var(--colorNeutralForeground1)" }}>
            4. Migration Checklist & Action Items
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {migration_plan.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "12px 16px",
                  border: "1px solid var(--colorNeutralStroke2)",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge appearance="filled" color={item.priority === "critical" || item.priority === "immediate" ? "danger" : "warning"}>
                    {item.priority.toUpperCase()}
                  </Badge>
                  <strong>{item.mechanism}</strong>
                  <span style={{ color: "var(--colorNeutralForeground3)" }}>({item.component})</span>
                  <Badge appearance="tint" color="informative" style={{ marginLeft: "auto" }}>
                    Status: {item.status.toUpperCase()}
                  </Badge>
                </div>
                <div style={{ marginTop: "4px", fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
                  <strong>Priority Reason:</strong> {item.priority_reason}
                </div>
                <div style={{ marginTop: "4px", fontSize: "12px" }}>
                  <strong>Investigation:</strong> {item.suggested_investigation}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* Limitations (README Section 30) */}
        <div style={{ background: "var(--colorNeutralBackground3)", padding: "20px", borderRadius: "6px" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "15px", color: "#a80000" }}>
            5. Formal Scope Limitations & Boundary Disclaimers
          </h3>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px", color: "var(--colorNeutralForeground2)", lineHeight: 1.6 }}>
            {limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
};
