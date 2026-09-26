import React from "react";
import {
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Button,
  Divider,
  Badge,
} from "@fluentui/react-components";
import { Dismiss24Regular, ShieldKeyhole20Regular } from "@fluentui/react-icons";
import type { Finding } from "../types";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { AlgorithmBadge } from "../components/AlgorithmBadge";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finding: Finding | null;
}

export const FindingDetailDrawer: React.FC<Props> = ({ open, onOpenChange, finding }) => {
  if (!finding) return null;

  const defaultGates = [
    "Library & provider compatibility",
    "Consumer compatibility & token validation",
    "Key-management & secret rotation review",
    "Interoperability testing",
    "Performance & latency benchmark testing",
    "Rollback strategy rehearsal",
  ];

  return (
    <Drawer
      position="end"
      size="medium"
      open={open}
      onOpenChange={(_, data) => onOpenChange(data.open)}
      style={{ width: "540px", maxWidth: "92vw" }}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<Dismiss24Regular />}
              onClick={() => onOpenChange(false)}
            />
          }
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldKeyhole20Regular style={{ color: "var(--colorBrandForeground1)" }} />
            <span>Finding Details & Assessment</span>
          </div>
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody style={{ display: "flex", flexDirection: "column", gap: "20px", paddingBottom: "32px" }}>
        {/* Header with Title and Confidence */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", color: "var(--colorNeutralForeground1)" }}>
                {finding.mechanism}
              </h2>
              {finding.algorithm_variant && (
                <div style={{ marginTop: "4px" }}>
                  <AlgorithmBadge text={`Variant: ${finding.algorithm_variant}`} color="subtle" appearance="outline" />
                </div>
              )}
            </div>
            <ConfidenceBadge confidence={finding.confidence} />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
            <Badge appearance="tint" color="brand">{finding.category.toUpperCase()}</Badge>
            {finding.is_indirect && (
              <Badge appearance="outline" color="warning">
                Inferred Dependency
              </Badge>
            )}
            <Badge appearance="tint" color="informative">
              Component: {finding.component}
            </Badge>
          </div>
        </div>

        <Divider />

        {/* Stage 1: Detection */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Badge appearance="filled" color="brand" size="small">STAGE 1</Badge>
            <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>Detection Evidence</h4>
          </div>
          <div
            style={{
              background: "var(--colorNeutralBackground3)",
              border: "1px solid var(--colorNeutralStroke2)",
              borderRadius: "6px",
              padding: "12px",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--colorBrandForeground1)", marginBottom: "6px", fontWeight: 600 }}>
              <code>{finding.file}:{finding.line}</code> (col {finding.column})
            </div>
            <pre
              style={{
                margin: 0,
                fontFamily: "var(--code-font)",
                fontSize: "13px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                color: "var(--colorNeutralForeground1)",
              }}
            >
              {finding.evidence}
            </pre>
          </div>
          <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", marginTop: "6px" }}>
            Rule: <code>{finding.detection_rule}</code>
          </div>
        </div>

        {/* Stage 2: Classification */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Badge appearance="filled" color="success" size="small">STAGE 2</Badge>
            <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>Classification & Evidence Type</h4>
          </div>
          <div style={{ fontSize: "13px", lineHeight: 1.4, background: "var(--colorNeutralBackground1)", padding: "10px", borderRadius: "6px", border: "1px solid var(--colorNeutralStroke2)" }}>
            <div>
              <strong>Classification:</strong> {finding.confidence === "confirmed" ? "Confirmed Static Finding (Direct AST / Key Specification Match)" : "Likely / Possible Match (Contextual Reference)"}
            </div>
            <div style={{ marginTop: "4px", fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
              {finding.is_indirect ? "Indirect usage inferred through application wrapper or manifest dependency." : "Direct cryptographic mechanism invocation in source code or server configuration."}
            </div>
            {finding.is_indirect && finding.inferred_from && (
              <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--colorBrandForeground1)" }}>
                <strong>Trace:</strong> {finding.inferred_from}
              </div>
            )}
          </div>
        </div>

        {/* Stage 3: Dependency Analysis */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Badge appearance="filled" color="informative" size="small">STAGE 3</Badge>
            <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>Dependency & Context Analysis</h4>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
            <div style={{ background: "var(--colorNeutralBackground3)", padding: "8px 12px", borderRadius: "4px" }}>
              <div style={{ color: "var(--colorNeutralForeground3)" }}>Component</div>
              <div style={{ fontWeight: 600, fontSize: "13px", marginTop: "2px" }}>{finding.component}</div>
            </div>
            <div style={{ background: "var(--colorNeutralBackground3)", padding: "8px 12px", borderRadius: "4px" }}>
              <div style={{ color: "var(--colorNeutralForeground3)" }}>Usage Role</div>
              <div style={{ fontWeight: 600, fontSize: "13px", marginTop: "2px" }}>{finding.usage.replace("_", " ")}</div>
            </div>
            <div style={{ background: "var(--colorNeutralBackground3)", padding: "8px 12px", borderRadius: "4px" }}>
              <div style={{ color: "var(--colorNeutralForeground3)" }}>Protocol</div>
              <div style={{ fontWeight: 600, fontSize: "13px", marginTop: "2px" }}>{finding.protocol || "Direct API"}</div>
            </div>
            <div style={{ background: "var(--colorNeutralBackground3)", padding: "8px 12px", borderRadius: "4px" }}>
              <div style={{ color: "var(--colorNeutralForeground3)" }}>Category</div>
              <div style={{ fontWeight: 600, fontSize: "13px", marginTop: "2px" }}>{finding.category.toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* Stage 4: Migration Planning */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Badge appearance="filled" color="warning" size="small">STAGE 4</Badge>
            <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>Migration Planning Considerations</h4>
          </div>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>
              <strong>Migration Assessment:</strong> {finding.concern}
            </div>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
              <strong>Quantum Impact:</strong> {finding.quantum_impact}
            </div>
            <div style={{ fontSize: "12px", color: "var(--colorBrandForeground1)" }}>
              <strong>Suggested Action:</strong> {finding.recommended_action}
            </div>
          </div>
        </div>

        {/* Stage 5: Validation */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Badge appearance="filled" color="brand" size="small">STAGE 5</Badge>
            <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>Validation Gates (README Section 13)</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "var(--colorNeutralBackground3)", padding: "10px 14px", borderRadius: "6px" }}>
            {defaultGates.map((gate, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                <span style={{ color: "var(--colorBrandForeground1)" }}>□</span>
                <span>{gate}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        <div
          style={{
            background: "var(--colorNeutralBackground1)",
            borderLeft: "3px solid var(--colorBrandStroke1)",
            padding: "12px",
            fontSize: "12px",
            color: "var(--colorNeutralForeground2)",
            lineHeight: 1.4,
          }}
        >
          <strong>Security Communication Notice:</strong> Detection indicates cryptographic inventory evidence.
          It does not establish that the system is quantum-safe or that a migration is required in every deployment context.
        </div>
      </DrawerBody>
    </Drawer>
  );
};
