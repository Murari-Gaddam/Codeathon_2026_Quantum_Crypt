import React, { useState } from "react";
import {
  Card,
  CardHeader,
  Button,
  Badge,
  Textarea,
  Field,
  Spinner,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@fluentui/react-components";
import { Beaker16Regular, Play16Filled, CheckmarkCircle16Regular } from "@fluentui/react-icons";
import { api } from "../services/api";
import type { SandboxTestResponse } from "../types";

export const SandboxPage: React.FC = () => {
  const [provider, setProvider] = useState<string>("classical");
  const [algorithm, setAlgorithm] = useState<string>("RSA-2048");
  const [message, setMessage] = useState<string>("Enterprise Authentication Bearer Claims Payload 2026");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<SandboxTestResponse | null>(null);

  const handleRunTest = async () => {
    setIsLoading(true);
    try {
      const res = await api.runSandboxTest({
        provider,
        algorithm,
        message,
        operation: "sign_and_verify",
      });
      setTestResult(res);
    } catch (e: any) {
      alert("Sandbox test error: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSelect = (p: string) => {
    setProvider(p);
    if (p === "classical") {
      setAlgorithm("RSA-2048");
    } else if (p === "hybrid") {
      setAlgorithm("Composite-ECDSA-MLDSA");
    } else {
      setAlgorithm("ML-DSA-65");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Intro notice */}
      <Card style={{ padding: "20px" }}>
        <CardHeader
          header={<h3 style={{ margin: 0, fontSize: "18px" }}>Crypto-Agility Sandbox Demonstration</h3>}
          description="Test swapping between Classical, Hybrid, and Post-Quantum cryptographic providers via pure configuration."
        />
        <div style={{ fontSize: "13px", color: "var(--colorNeutralForeground2)", marginTop: "8px", lineHeight: 1.5 }}>
          The application layer calls a standard <code>CryptoProvider</code> interface without needing to know which
          underlying cryptographic primitive is selected. This allows zero-code-change transitions between classical
          RSA/ECDSA, composite hybrid dual-keys, and pure post-quantum lattice primitives (NIST FIPS 204).
        </div>
      </Card>

      {/* Two Columns: Test Controls & Results */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Left: Configuration & Input */}
        <Card style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4 style={{ margin: 0, fontSize: "16px" }}>Provider Configuration</h4>

          <Field label="Active Cryptographic Provider">
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                appearance={provider === "classical" ? "primary" : "secondary"}
                onClick={() => handleProviderSelect("classical")}
              >
                Classical Provider
              </Button>
              <Button
                appearance={provider === "hybrid" ? "primary" : "secondary"}
                onClick={() => handleProviderSelect("hybrid")}
              >
                Hybrid Provider
              </Button>
              <Button
                appearance={provider === "pqc" ? "primary" : "secondary"}
                onClick={() => handleProviderSelect("pqc")}
              >
                PQC Provider
              </Button>
            </div>
          </Field>

          <Field label="Algorithm Profile">
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid var(--colorNeutralStroke1)",
                background: "var(--colorNeutralBackground1)",
                color: "var(--colorNeutralForeground1)",
                fontSize: "13px",
              }}
            >
              {provider === "classical" && (
                <>
                  <option value="RSA-2048">RSA-2048 (PSS Padding)</option>
                  <option value="RSA-4096">RSA-4096 (PSS Padding)</option>
                  <option value="ECDSA-P256">ECDSA (secp256r1 curve)</option>
                </>
              )}
              {provider === "hybrid" && (
                <>
                  <option value="Composite-ECDSA-MLDSA">Composite Dual: ECDSA P-256 + ML-DSA-65</option>
                </>
              )}
              {provider === "pqc" && (
                <>
                  <option value="ML-DSA-65">ML-DSA-65 (NIST FIPS 204 / Dilithium3)</option>
                </>
              )}
            </select>
          </Field>

          <Field label="Test Message Payload">
            <Textarea
              rows={3}
              value={message}
              onChange={(_, d) => setMessage(d.value)}
              placeholder="Enter message to sign and verify..."
            />
          </Field>

          <Button
            appearance="primary"
            icon={<Play16Filled />}
            size="large"
            disabled={isLoading}
            onClick={handleRunTest}
          >
            {isLoading ? <Spinner size="tiny" label="Executing Cryptographic Provider..." /> : "Execute Sign & Verify Test"}
          </Button>

          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>
            * Sandbox executes in-memory ephemeral operations using vetted libraries. No production keys or secrets are involved.
          </div>
        </Card>

        {/* Right: Execution Output */}
        <Card style={{ padding: "20px" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>Execution Benchmark & Validation</h4>

          {testResult ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckmarkCircle16Regular style={{ color: "#107c41", fontSize: "20px" }} />
                  <strong>Operation Succeeded</strong>
                </div>
                <Badge appearance="tint" color="success">
                  Latency: {testResult.execution_time_ms} ms
                </Badge>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "var(--colorNeutralBackground3)", padding: "12px", borderRadius: "6px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>Provider</div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>{testResult.provider.toUpperCase()}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>Algorithm</div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>{testResult.algorithm}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>Public Key Size</div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>{testResult.key_size_bytes} bytes</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>Signature Size</div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>{testResult.signature_or_ciphertext_size_bytes} bytes</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", marginBottom: "4px" }}>
                  Public Key Preview
                </div>
                <code style={{ fontSize: "11px", display: "block", background: "var(--colorNeutralBackground3)", padding: "6px", borderRadius: "4px", wordBreak: "break-all" }}>
                  {testResult.public_key_preview}
                </code>
              </div>

              <div>
                <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", marginBottom: "4px" }}>
                  Signature / Cipher Preview
                </div>
                <code style={{ fontSize: "11px", display: "block", background: "var(--colorNeutralBackground3)", padding: "6px", borderRadius: "4px", wordBreak: "break-all" }}>
                  {testResult.signature_or_cipher_preview}
                </code>
              </div>

              <div style={{ fontSize: "12px" }}>
                <strong>Interoperability Summary:</strong>
                <p style={{ margin: "4px 0 0 0", color: "var(--colorNeutralForeground2)" }}>
                  {testResult.interoperability_summary}
                </p>
              </div>

              <div style={{ fontSize: "12px" }}>
                <strong>Rollback Strategy:</strong>
                <p style={{ margin: "4px 0 0 0", color: "var(--colorNeutralForeground2)" }}>
                  {testResult.rollback_strategy}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--colorNeutralForeground3)" }}>
              <Beaker16Regular style={{ fontSize: "36px", marginBottom: "8px" }} />
              <div>Select a provider configuration and click <strong>Execute Sign & Verify Test</strong> to benchmark performance and examine signature size expansion.</div>
            </div>
          )}
        </Card>
      </div>

      {/* Comparison Reference Matrix (Section 5.2) */}
      <Card style={{ padding: "20px" }}>
        <CardHeader
          header={<h3 style={{ margin: 0, fontSize: "16px" }}>Architectural Comparison: Classical vs. Hybrid vs. Pure PQC</h3>}
          description="Quantitative engineering trade-offs regarding signature size, bandwidth overhead, and backward compatibility"
        />

        <div style={{ overflowX: "auto", marginTop: "12px" }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Deployment Model</TableHeaderCell>
                <TableHeaderCell>Representative Scheme</TableHeaderCell>
                <TableHeaderCell>Public Key Size</TableHeaderCell>
                <TableHeaderCell>Signature Size</TableHeaderCell>
                <TableHeaderCell>Quantum Resistance</TableHeaderCell>
                <TableHeaderCell>Downstream Consumer Compatibility</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><strong>Classical</strong></TableCell>
                <TableCell>RSA-2048 / ECDSA P-256</TableCell>
                <TableCell>270B / 91B</TableCell>
                <TableCell>256B / 64B</TableCell>
                <TableCell><Badge appearance="tint" color="danger">Vulnerable to Shor's</Badge></TableCell>
                <TableCell>Universal across 100% of legacy clients and hardware modules</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Classical + PQC Hybrid</strong></TableCell>
                <TableCell>Composite ECDSA + ML-DSA-65</TableCell>
                <TableCell>~2,043 bytes</TableCell>
                <TableCell>~3,380 bytes</TableCell>
                <TableCell><Badge appearance="tint" color="success">Dual-Defense Protected</Badge></TableCell>
                <TableCell>Permits graceful dual-validation rollout; larger HTTP header buffers needed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Pure PQC Capable</strong></TableCell>
                <TableCell>ML-DSA-65 (NIST FIPS 204)</TableCell>
                <TableCell>1,952 bytes</TableCell>
                <TableCell>3,309 bytes</TableCell>
                <TableCell><Badge appearance="filled" color="success">Full Post-Quantum Safe</Badge></TableCell>
                <TableCell>Requires all clients and microservices to support modern PQC libraries</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
