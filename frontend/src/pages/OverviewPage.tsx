import React, { useState } from "react";
import {
  Card,
  CardHeader,
  Button,
  Badge,
  ProgressBar,
  Divider,
  Input,
} from "@fluentui/react-components";
import {
  Play16Filled,
  DocumentArrowDown16Regular,
  Shield16Regular,
  CheckmarkCircle16Regular,
  Warning16Regular,
  QuestionCircle16Regular,
  ArrowSwap16Regular,
  Eye16Regular,
  ArrowReset20Regular,
  FolderOpen16Regular,
  Flash20Filled,
  LockClosed16Regular,
  ArrowUpload16Regular,
} from "@fluentui/react-icons";
import type { ScanResult } from "../types";
import { AlgorithmBadge } from "../components/AlgorithmBadge";
import { ArchitecturePipelineStepper } from "../components/ArchitecturePipelineStepper";

interface Props {
  scanResult: ScanResult | null;
  onOpenScanModal: () => void;
  onNavigate: (tab: string) => void;
  onExportReport: () => void;
  onLoadDemo?: () => void;
  onResetDemo?: () => void;
  onScanPath?: (path: string) => Promise<void>;
  isScanning?: boolean;
}

export const OverviewPage: React.FC<Props> = ({
  scanResult,
  onOpenScanModal,
  onNavigate,
  onExportReport,
  onLoadDemo,
  onResetDemo,
  onScanPath,
  isScanning = false,
}) => {
  const [customPath, setCustomPath] = useState<string>("samples/demo-repository");

  // Handle path scanning from zero state
  const handleRunCustomScan = async () => {
    if (!customPath.trim()) return;
    if (onScanPath) {
      await onScanPath(customPath.trim());
    }
  };

  // If scanResult is null, render the Initial Zero State with assessment launchers
  if (!scanResult) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Zero State Executive Banner */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            background: "var(--colorNeutralBackground1)",
            padding: "20px 24px",
            borderRadius: "8px",
            border: "1px solid var(--colorNeutralStroke1)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Shield16Regular style={{ fontSize: "24px", color: "var(--colorBrandForeground1)" }} />
              <h2 style={{ margin: 0, fontSize: "22px", color: "var(--colorNeutralForeground1)" }}>
                Cryptographic Inventory & Migration Assessment
              </h2>
              <Badge appearance="tint" color="informative">Ready · Zero State</Badge>
            </div>
            <div style={{ fontSize: "13px", color: "var(--colorNeutralForeground2)", marginTop: "4px" }}>
              No repository actively loaded. Select a local directory, upload an archive, or run the built-in enterprise demo suite.
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {onLoadDemo && (
              <Button
                appearance="primary"
                icon={<Flash20Filled />}
                onClick={onLoadDemo}
                disabled={isScanning}
              >
                {isScanning ? "Running Demo..." : "Load Demo Suite"}
              </Button>
            )}
            <Button
              appearance="outline"
              icon={<FolderOpen16Regular />}
              onClick={onOpenScanModal}
              disabled={isScanning}
            >
              Scan Options
            </Button>
          </div>
        </div>

        {/* Initial Zero Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <Card style={{ padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
              Files Scanned
            </div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--colorNeutralForeground3)", margin: "4px 0" }}>
              0
            </div>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>
              No files analyzed yet
            </div>
          </Card>

          <Card style={{ padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
              Total Findings
            </div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--colorNeutralForeground3)", margin: "4px 0" }}>
              0
            </div>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>
              0 Confirmed · 0 Likely · 0 Possible
            </div>
          </Card>

          <Card style={{ padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
              Certificates
            </div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--colorNeutralForeground3)", margin: "4px 0" }}>
              0
            </div>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>
              X.509 certificates cataloged
            </div>
          </Card>

          <Card style={{ padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
              Dependencies Mapped
            </div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--colorNeutralForeground3)", margin: "4px 0" }}>
              0
            </div>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>
              Graph edges connected
            </div>
          </Card>

          <Card style={{ padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
              Action Items
            </div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--colorNeutralForeground3)", margin: "4px 0" }}>
              0
            </div>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>
              Migration checklist items
            </div>
          </Card>
        </div>

        {/* Assessment Launcher: Demo vs Custom File/Repo Selector */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Option A: Enterprise Demo Suite */}
          <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background: "rgba(0, 120, 212, 0.12)",
                  color: "#0078d4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                <Flash20Filled />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px" }}>Enterprise Demo Suite</h3>
                <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>
                  Pre-configured multi-tier cryptographic architecture
                </div>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "var(--colorNeutralForeground2)", margin: 0, lineHeight: 1.5 }}>
              Instantly loads a full enterprise repository demonstrating Python auth service with RSA-2048 and AES-256,
              Node.js JWT verifier, Nginx TLS proxy, dependency manifests, and genuine X.509 public certificates.
            </p>

            <div
              style={{
                background: "var(--colorNeutralBackground3)",
                padding: "12px",
                borderRadius: "6px",
                fontSize: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div>✓ <strong>31 Cryptographic Findings</strong> (AST, Regex, Indirect Inferences)</div>
              <div>✓ <strong>2 X.509 Certificates</strong> (RSA-2048 & ECDSA secp384r1)</div>
              <div>✓ <strong>49 Bipartite Dependency Edges</strong> (Components to Algorithms)</div>
              <div>✓ <strong>5 Prioritized Migration Checklist Items</strong> with 8 Validation Gates</div>
            </div>

            <Button
              appearance="primary"
              size="large"
              icon={<Play16Filled />}
              onClick={onLoadDemo}
              disabled={isScanning}
              style={{ marginTop: "auto" }}
            >
              {isScanning ? "Scanning Demo Suite..." : "⚡ Run Demo Assessment"}
            </Button>
          </Card>

          {/* Option B: Select Local Directory / File */}
          <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background: "rgba(16, 124, 65, 0.12)",
                  color: "#107c41",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                <FolderOpen16Regular />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px" }}>Select File or Repository</h3>
                <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>
                  Scan local source code, configs, or public certificates
                </div>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "var(--colorNeutralForeground2)", margin: 0, lineHeight: 1.5 }}>
              Enter a directory or repository path on your machine. The scanner will parse ASTs, evaluate configurations,
              and catalog certificates.
            </p>

            {/* Quick preset chips */}
            <div>
              <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", marginBottom: "6px", textTransform: "uppercase" }}>
                Quick Presets
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <Button
                  appearance="subtle"
                  size="small"
                  onClick={() => setCustomPath("samples/demo-repository")}
                >
                  samples/demo-repository
                </Button>
                <Button
                  appearance="subtle"
                  size="small"
                  onClick={() => setCustomPath(".")}
                >
                  . (Project Root)
                </Button>
                <Button
                  appearance="subtle"
                  size="small"
                  onClick={() => setCustomPath("samples/demo-repository/certificates")}
                >
                  certificates/
                </Button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Input
                value={customPath}
                onChange={(_, d) => setCustomPath(d.value)}
                placeholder="Enter path (e.g. ./samples/demo-repository)"
                style={{ flex: 1 }}
                disabled={isScanning}
              />
              <Button
                appearance="primary"
                icon={<Play16Filled />}
                onClick={handleRunCustomScan}
                disabled={isScanning || !customPath.trim()}
              >
                {isScanning ? "Scanning..." : "Scan Path"}
              </Button>
            </div>

            <div
              style={{
                marginTop: "auto",
                borderTop: "1px solid var(--colorNeutralStroke2)",
                paddingTop: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>
                Have an archive (.zip)?
              </span>
              <Button
                appearance="outline"
                size="small"
                icon={<ArrowUpload16Regular />}
                onClick={onOpenScanModal}
              >
                Upload Archive
              </Button>
            </div>
          </Card>
        </div>

        {/* Informational Guidance Footer */}
        <div
          style={{
            background: "var(--colorNeutralBackground1)",
            padding: "16px 20px",
            borderRadius: "8px",
            border: "1px solid var(--colorNeutralStroke1)",
            fontSize: "12px",
            color: "var(--colorNeutralForeground2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <strong>Architecture Principle (Section 53):</strong> Scanner strictly follows the 5-stage pipeline:
            Detection → Classification → Dependency Analysis → Migration Planning → Validation.
          </div>
          <Badge appearance="outline">v1.0.0 Ready</Badge>
        </div>
      </div>
    );
  }

  // Active Scan State
  const { summary, findings, migration_plan } = scanResult;
  const confirmedFindings = findings.filter((f) => f.confidence === "confirmed").length;
  const likelyFindings = findings.filter((f) => f.confidence === "likely").length;
  const possibleFindings = findings.filter((f) => f.confidence === "possible").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner & Quick Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          background: "var(--colorNeutralBackground1)",
          padding: "20px 24px",
          borderRadius: "8px",
          border: "1px solid var(--colorNeutralStroke1)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ margin: 0, fontSize: "22px", color: "var(--colorNeutralForeground1)" }}>
              Cryptographic Inventory Summary
            </h2>
            <Badge appearance="tint" color="success">Scan Active</Badge>
          </div>
          <div style={{ fontSize: "13px", color: "var(--colorNeutralForeground2)", marginTop: "4px" }}>
            Scan ID: <strong>{summary.scan_id}</strong> · Target: <code>{summary.target_path}</code> · Completed: {summary.timestamp}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {onResetDemo && (
            <Button
              appearance="subtle"
              icon={<ArrowReset20Regular />}
              onClick={onResetDemo}
            >
              Reset Demo
            </Button>
          )}
          <Button appearance="outline" icon={<Eye16Regular />} onClick={() => onNavigate("findings")}>
            Findings ({findings.length})
          </Button>
          <Button appearance="outline" icon={<LockClosed16Regular />} onClick={() => onNavigate("certificates")}>
            Certificates ({scanResult.certificates.length})
          </Button>
          <Button appearance="outline" icon={<ArrowSwap16Regular />} onClick={() => onNavigate("migration")}>
            Migration Plan
          </Button>
          <Button appearance="outline" icon={<DocumentArrowDown16Regular />} onClick={onExportReport}>
            Export
          </Button>
          <Button appearance="primary" icon={<Play16Filled />} onClick={onOpenScanModal}>
            New Scan
          </Button>
        </div>
      </div>

      {/* Architecture Principle Pipeline Stepper (Section 53) */}
      <ArchitecturePipelineStepper scanResult={scanResult} onNavigate={onNavigate} />

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
            Files Scanned
          </div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--colorBrandForeground1)", margin: "4px 0" }}>
            {summary.files_scanned}
          </div>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
            Source code, configs, manifests
          </div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
            Total Findings
          </div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--colorPaletteGreenForeground1)", margin: "4px 0" }}>
            {summary.findings.total}
          </div>
          <div style={{ fontSize: "12px", display: "flex", gap: "6px" }}>
            <span style={{ color: "#107c41" }}>● {confirmedFindings} Confirmed</span>
            <span style={{ color: "#795e00" }}>● {likelyFindings} Likely</span>
            <span style={{ color: "#605e5c" }}>● {possibleFindings} Possible</span>
          </div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
            Certificates
          </div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--colorBrandForeground1)", margin: "4px 0" }}>
            {summary.certificates}
          </div>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
            Public X.509 certs cataloged
          </div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
            Dependencies Mapped
          </div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--colorBrandForeground1)", margin: "4px 0" }}>
            {summary.dependencies}
          </div>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
            Graph relationships connected
          </div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
            Action Items
          </div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--colorPaletteRedForeground1)", margin: "4px 0" }}>
            {summary.migration_items}
          </div>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
            Prioritized migration gates
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Confidence & Categories + Detected Primitives */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Left: Findings by Confidence */}
        <Card style={{ padding: "20px" }}>
          <CardHeader
            header={<h3 style={{ margin: 0, fontSize: "16px" }}>Findings Confidence Distribution</h3>}
            description="Clear separation between confirmed static findings and inferred dependencies"
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckmarkCircle16Regular style={{ color: "#107c41" }} /> Confirmed Static Findings
                </span>
                <strong>{confirmedFindings}</strong>
              </div>
              <ProgressBar value={summary.findings.total ? confirmedFindings / summary.findings.total : 0} color="success" />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Warning16Regular style={{ color: "#795e00" }} /> Likely Findings (Context Match)
                </span>
                <strong>{likelyFindings}</strong>
              </div>
              <ProgressBar value={summary.findings.total ? likelyFindings / summary.findings.total : 0} color="warning" />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <QuestionCircle16Regular style={{ color: "#605e5c" }} /> Possible Matches
                </span>
                <strong>{possibleFindings}</strong>
              </div>
              <ProgressBar value={summary.findings.total ? possibleFindings / summary.findings.total : 0} />
            </div>
          </div>

          <Divider style={{ margin: "20px 0" }} />

          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)", lineHeight: 1.4 }}>
            <strong>Communication Notice:</strong> The scanner inventories detected mechanisms and identifies
            migration review items. It does not state that a scan proves a system is quantum-safe.
          </div>
        </Card>

        {/* Right: Detected Algorithms & Components */}
        <Card style={{ padding: "20px" }}>
          <CardHeader
            header={<h3 style={{ margin: 0, fontSize: "16px" }}>Detected Cryptographic Mechanisms</h3>}
            description="Cataloged primitives across code, configurations, and certificates"
          />
          <div style={{ marginTop: "12px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--colorNeutralForeground3)", textTransform: "uppercase" }}>
              Algorithms & Protocols
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
              {summary.algorithms_detected.map((alg) => (
                <AlgorithmBadge key={alg} text={alg} color="brand" />
              ))}
            </div>

            <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--colorNeutralForeground3)", textTransform: "uppercase" }}>
              Application Components
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {summary.components_detected.map((comp) => (
                <AlgorithmBadge key={comp} text={comp} color="informative" appearance="outline" />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Migration Checklist Highlights */}
      <Card style={{ padding: "20px" }}>
        <CardHeader
          header={<h3 style={{ margin: 0, fontSize: "16px" }}>Top Migration Action Items</h3>}
          description="Priority-ordered tasks generated from cryptographic inventory analysis"
          action={
            <Button appearance="subtle" icon={<ArrowSwap16Regular />} onClick={() => onNavigate("migration")}>
              View Full Plan
            </Button>
          }
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
          {migration_plan.slice(0, 3).map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderRadius: "6px",
                background: "var(--colorNeutralBackground3)",
                border: "1px solid var(--colorNeutralStroke2)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge appearance="filled" color={item.priority === "critical" || item.priority === "immediate" ? "danger" : "warning"}>
                    {item.priority.toUpperCase()}
                  </Badge>
                  <strong>{item.mechanism}</strong>
                  <span style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>({item.component})</span>
                </div>
                <div style={{ fontSize: "13px", color: "var(--colorNeutralForeground2)", marginTop: "4px" }}>
                  {item.reason_for_review}
                </div>
              </div>
              <Button appearance="secondary" size="small" onClick={() => onNavigate("migration")}>
                Review Gates
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

