import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  Button,
  Badge,
  Spinner,
} from "@fluentui/react-components";
import {
  ShieldTask16Regular,
  Bookmark16Regular,
  CheckmarkCircle16Regular,
} from "@fluentui/react-icons";
import { api } from "../services/api";
import type { CIComparisonResult, ScanResult } from "../types";

interface Props {
  scanResult: ScanResult | null;
}

export const SettingsPage: React.FC<Props> = ({ scanResult }) => {
  const [ciResult, setCiResult] = useState<CIComparisonResult | null>(null);
  const [isEvaluatingCI, setIsEvaluatingCI] = useState<boolean>(false);
  const [rules, setRules] = useState<Record<string, any>>({});
  const [baselineMsg, setBaselineMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getRules().then(setRules).catch(console.error);
  }, []);

  const handleEvaluateCI = async () => {
    if (!scanResult) return;
    setIsEvaluatingCI(true);
    try {
      const res = await api.evaluateCIPolicy(scanResult.summary.scan_id);
      setCiResult(res);
    } catch (e: any) {
      alert("CI Policy check failed: " + e.message);
    } finally {
      setIsEvaluatingCI(false);
    }
  };

  const handleSetBaseline = async () => {
    if (!scanResult) return;
    try {
      const res = await api.setBaseline(scanResult.summary.scan_id);
      setBaselineMsg(res.message);
      setTimeout(() => setBaselineMsg(null), 4000);
    } catch (e: any) {
      alert("Error setting baseline: " + e.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* CI Policy Evaluation Card */}
      <Card style={{ padding: "20px" }}>
        <CardHeader
          header={<h3 style={{ margin: 0, fontSize: "18px" }}>CI/CD Cryptographic Governance Policy</h3>}
          description="Evaluate current scan against enterprise cryptographic policies and compare against baseline."
        />

        <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
          <Button
            appearance="primary"
            icon={<ShieldTask16Regular />}
            disabled={!scanResult || isEvaluatingCI}
            onClick={handleEvaluateCI}
          >
            {isEvaluatingCI ? <Spinner size="tiny" label="Checking policy..." /> : "Evaluate Policy Check"}
          </Button>

          <Button
            appearance="outline"
            icon={<Bookmark16Regular />}
            disabled={!scanResult}
            onClick={handleSetBaseline}
          >
            Set Current Scan as Baseline
          </Button>
        </div>

        {baselineMsg && (
          <div style={{ color: "#107c41", fontSize: "13px", marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckmarkCircle16Regular /> {baselineMsg}
          </div>
        )}

        {ciResult && (
          <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>CI Policy Status:</span>
              <Badge
                appearance="filled"
                color={ciResult.status === "PASSED" ? "success" : ciResult.status === "WARNING" ? "warning" : "danger"}
              >
                {ciResult.status}
              </Badge>
              <span style={{ fontSize: "13px", color: "var(--colorNeutralForeground2)" }}>
                Policy: <strong>{ciResult.policy_name}</strong>
              </span>
            </div>

            <div style={{ fontSize: "13px", color: "var(--colorNeutralForeground1)" }}>
              {ciResult.summary_message}
            </div>

            {ciResult.violations.length > 0 && (
              <div style={{ background: "#fde7e9", border: "1px solid #f3d6d8", borderRadius: "6px", padding: "12px" }}>
                <strong style={{ color: "#a80000", fontSize: "13px" }}>Violations (Blocked Builds):</strong>
                <ul style={{ margin: "6px 0 0 0", paddingLeft: "20px", fontSize: "12px", color: "#a80000" }}>
                  {ciResult.violations.map((v, i) => (
                    <li key={i}>
                      <strong>{v.mechanism}</strong> at <code>{v.location}</code>: {v.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {ciResult.warnings.length > 0 && (
              <div style={{ background: "#fff4ce", border: "1px solid #fce183", borderRadius: "6px", padding: "12px" }}>
                <strong style={{ color: "#795e00", fontSize: "13px" }}>Warnings (Review Required):</strong>
                <ul style={{ margin: "6px 0 0 0", paddingLeft: "20px", fontSize: "12px", color: "#795e00" }}>
                  {ciResult.warnings.map((w, i) => (
                    <li key={i}>
                      <strong>{w.mechanism}</strong> at <code>{w.location}</code>: {w.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Rules Inspection Card */}
      <Card style={{ padding: "20px" }}>
        <CardHeader
          header={<h3 style={{ margin: 0, fontSize: "18px" }}>Active Rule Definitions</h3>}
          description="Data-driven cryptographic rules loaded from the repository's rules/ directory."
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginTop: "16px" }}>
          <div style={{ background: "var(--colorNeutralBackground3)", padding: "12px", borderRadius: "6px" }}>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>ALGORITHM RULES</div>
            <div style={{ fontSize: "20px", fontWeight: 700 }}>
              {(rules.algorithms as any[])?.length || 0}
            </div>
            <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground2)" }}>RSA, ECDSA, AES, ML-DSA, Kyber</div>
          </div>

          <div style={{ background: "var(--colorNeutralBackground3)", padding: "12px", borderRadius: "6px" }}>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>LIBRARY RULES</div>
            <div style={{ fontSize: "20px", fontWeight: 700 }}>
              {(rules.libraries as any[])?.length || 0}
            </div>
            <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground2)" }}>Python, Node, Java, Go libraries</div>
          </div>

          <div style={{ background: "var(--colorNeutralBackground3)", padding: "12px", borderRadius: "6px" }}>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>PROTOCOL RULES</div>
            <div style={{ fontSize: "20px", fontWeight: 700 }}>
              {(rules.protocols as any[])?.length || 0}
            </div>
            <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground2)" }}>TLS 1.0-1.3, JWT RS256, SSH</div>
          </div>

          <div style={{ background: "var(--colorNeutralBackground3)", padding: "12px", borderRadius: "6px" }}>
            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>CI POLICY RULES</div>
            <div style={{ fontSize: "20px", fontWeight: 700 }}>
              {rules.policies ? "Active" : "Loaded"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground2)" }}>Fail/warn gates configured</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
