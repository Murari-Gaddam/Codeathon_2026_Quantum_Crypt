import React from "react";
import { Card, Badge } from "@fluentui/react-components";
import {
  Search16Regular,
  Tag16Regular,
  BranchFork16Regular,
  ArrowSwap16Regular,
  CheckmarkCircle16Regular,
  ChevronRight16Regular,
} from "@fluentui/react-icons";
import type { ScanResult } from "../types";

interface Props {
  scanResult: ScanResult | null;
  onNavigate: (tab: string) => void;
}

export const ArchitecturePipelineStepper: React.FC<Props> = ({ scanResult, onNavigate }) => {
  if (!scanResult) return null;

  const { summary } = scanResult;

  const steps = [
    {
      id: "detection",
      stepNumber: 1,
      title: "1. Detection",
      subtitle: `${summary.files_scanned} files inspected`,
      icon: Search16Regular,
      targetTab: "findings",
      badgeText: `${summary.findings.total} Raw Matches`,
      badgeColor: "brand" as const,
      description: "Static AST, config parsing, dependency manifests & X.509 cert extraction.",
    },
    {
      id: "classification",
      stepNumber: 2,
      title: "2. Classification",
      subtitle: `${summary.findings.confirmed} confirmed`,
      icon: Tag16Regular,
      targetTab: "findings",
      badgeText: "Confidence Filtered",
      badgeColor: "success" as const,
      description: "Evidence-based normalization separating confirmed usage from inferred references.",
    },
    {
      id: "dependency_analysis",
      stepNumber: 3,
      title: "3. Dependency Analysis",
      subtitle: `${summary.dependencies} relationships`,
      icon: BranchFork16Regular,
      targetTab: "dependencies",
      badgeText: "Graph Mapped",
      badgeColor: "informative" as const,
      description: "Bipartite graph mapping components to libraries, protocols, algorithms & certs.",
    },
    {
      id: "migration_planning",
      stepNumber: 4,
      title: "4. Migration Planning",
      subtitle: `${summary.migration_items} action items`,
      icon: ArrowSwap16Regular,
      targetTab: "migration",
      badgeText: "Prioritized",
      badgeColor: "warning" as const,
      description: "Priority assigned based on cryptographic role, exposure, and dependency fan-out.",
    },
    {
      id: "validation",
      stepNumber: 5,
      title: "5. Validation",
      subtitle: "8 Standard Gates",
      icon: CheckmarkCircle16Regular,
      targetTab: "migration",
      badgeText: "Gate Enforcement",
      badgeColor: "brand" as const,
      description: "Step-by-step verification from library compatibility to rollback rehearsal.",
    },
  ];

  return (
    <Card style={{ padding: "16px 20px", background: "var(--colorNeutralBackground1)", border: "1px solid var(--colorNeutralStroke1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--colorBrandForeground1)" }}>
            Architecture Principle (README Section 53)
          </div>
          <h3 style={{ margin: "2px 0 0 0", fontSize: "16px" }}>Cryptographic Analysis & Migration Pipeline</h3>
        </div>
        <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>
          Strict separation of detection, classification, dependency mapping, migration planning, and validation
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "10px" }}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              onClick={() => onNavigate(step.targetTab)}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "12px",
                borderRadius: "6px",
                background: "var(--colorNeutralBackground3)",
                border: "1px solid var(--colorNeutralStroke2)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--colorBrandStroke1)";
                e.currentTarget.style.background = "var(--colorNeutralBackground1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--colorNeutralStroke2)";
                e.currentTarget.style.background = "var(--colorNeutralBackground3)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "13px" }}>
                  <Icon style={{ color: "var(--colorBrandForeground1)" }} />
                  {step.title}
                </span>
                {idx < steps.length - 1 && (
                  <ChevronRight16Regular style={{ color: "var(--colorNeutralForeground4)" }} />
                )}
              </div>

              <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)", marginBottom: "8px" }}>
                {step.subtitle}
              </div>

              <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", lineHeight: 1.3, marginBottom: "10px" }}>
                {step.description}
              </div>

              <div style={{ marginTop: "auto" }}>
                <Badge appearance="tint" color={step.badgeColor} size="small">
                  {step.badgeText}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
