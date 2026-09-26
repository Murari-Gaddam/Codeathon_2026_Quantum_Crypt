import React, { useState, useMemo } from "react";
import {
  Card,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Button,
  Input,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  TabList,
  Tab,
  Tooltip,
  ProgressBar,
} from "@fluentui/react-components";
import type { SelectTabData, SelectTabEvent } from "@fluentui/react-components";
import {
  Certificate16Regular,
  Eye16Regular,
  Key20Regular,
  Key16Regular,
  Search16Regular,
  Copy16Regular,
  Checkmark16Regular,
  ShieldCheckmark16Regular,
  Warning16Regular,
  LockClosed16Regular,
  GridDots20Regular,
  Table16Regular,
  Play16Filled,
} from "@fluentui/react-icons";
import type { CertificateRecord } from "../types";
import { AlgorithmBadge } from "../components/AlgorithmBadge";
import {
  parseDN,
  isSelfSigned,
  formatSigAlg,
  calculateExpiration,
  getQuantumAssessment,
} from "../utils/certUtils";

interface Props {
  certificates: CertificateRecord[];
  onLoadDemo?: () => void;
  onOpenScanModal?: () => void;
}

export const CertificatesPage: React.FC<Props> = ({
  certificates,
  onLoadDemo,
  onOpenScanModal,
}) => {
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);
  const [dialogTab, setDialogTab] = useState<string>("overview");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [algorithmFilter, setAlgorithmFilter] = useState<string>("all");
  const [validityFilter, setValidityFilter] = useState<string>("all");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Filtered certificates
  const filteredCerts = useMemo(() => {
    return certificates.filter((cert) => {
      const sub = parseDN(cert.subject);
      const iss = parseDN(cert.issuer);
      const term = searchTerm.toLowerCase().trim();

      if (term) {
        const matchesTerm =
          sub.cn.toLowerCase().includes(term) ||
          (sub.o && sub.o.toLowerCase().includes(term)) ||
          iss.cn.toLowerCase().includes(term) ||
          cert.file.toLowerCase().includes(term) ||
          cert.public_key_algorithm.toLowerCase().includes(term) ||
          cert.fingerprint_sha256.toLowerCase().includes(term);
        if (!matchesTerm) return false;
      }

      if (algorithmFilter !== "all") {
        if (!cert.public_key_algorithm.toLowerCase().includes(algorithmFilter.toLowerCase())) {
          return false;
        }
      }

      if (validityFilter !== "all") {
        const exp = calculateExpiration(cert.valid_to);
        if (validityFilter === "valid" && exp.isExpired) return false;
        if (validityFilter === "expired" && !exp.isExpired) return false;
      }

      return true;
    });
  }, [certificates, searchTerm, algorithmFilter, validityFilter]);

  // Executive summary counts
  const totalCount = certificates.length;
  const expiredCount = certificates.filter((c) => c.is_expired).length;
  const classicalAtRiskCount = certificates.filter(
    (c) => getQuantumAssessment(c.public_key_algorithm).isVulnerable
  ).length;
  const privateKeysDetected = certificates.filter((c) => c.private_key_detected).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Executive Summary Cards Banner */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "16px", borderLeft: "4px solid var(--colorBrandForeground1)" }}>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
            Total Certificates
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--colorBrandForeground1)", margin: "4px 0" }}>
            {totalCount}
          </div>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
            X.509 public certificates discovered
          </div>
        </Card>

        <Card style={{ padding: "16px", borderLeft: "4px solid #d13438" }}>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
            Quantum Susceptibility
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#d13438", margin: "4px 0" }}>
            {classicalAtRiskCount} <span style={{ fontSize: "14px", fontWeight: 500 }}>Classical</span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
            RSA / ECC keys vulnerable to Shor's algorithm
          </div>
        </Card>

        <Card style={{ padding: "16px", borderLeft: "4px solid #107c41" }}>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
            Validity Health
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#107c41", margin: "4px 0" }}>
            {totalCount - expiredCount} Active
          </div>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
            {expiredCount > 0 ? `${expiredCount} expired certificate(s)` : "All certificates within valid window"}
          </div>
        </Card>

        <Card style={{ padding: "16px", borderLeft: `4px solid ${privateKeysDetected > 0 ? "#b4009e" : "#107c41"}` }}>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 600, textTransform: "uppercase" }}>
            Private Key Exposure
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: privateKeysDetected > 0 ? "#b4009e" : "#107c41", margin: "4px 0" }}>
            {privateKeysDetected} In-Tree
          </div>
          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
            {privateKeysDetected > 0 ? "Requires key isolation to Azure Key Vault" : "No private keys committed"}
          </div>
        </Card>
      </div>

      {/* Control & Search Toolbar */}
      <Card style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "280px", alignItems: "center" }}>
            <Input
              contentBefore={<Search16Regular />}
              placeholder="Search by Common Name, Organization, Algorithm, or Path..."
              value={searchTerm}
              onChange={(_, d) => setSearchTerm(d.value)}
              style={{ minWidth: "280px", flex: 1 }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>Algorithm:</span>
              <select
                value={algorithmFilter}
                onChange={(e) => setAlgorithmFilter(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "1px solid var(--colorNeutralStroke1)",
                  background: "var(--colorNeutralBackground1)",
                  color: "var(--colorNeutralForeground1)",
                  fontSize: "13px",
                }}
              >
                <option value="all">All Algorithms</option>
                <option value="rsa">RSA</option>
                <option value="ecdsa">ECDSA</option>
                <option value="ml-dsa">ML-DSA / PQC</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>Status:</span>
              <select
                value={validityFilter}
                onChange={(e) => setValidityFilter(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "1px solid var(--colorNeutralStroke1)",
                  background: "var(--colorNeutralBackground1)",
                  color: "var(--colorNeutralForeground1)",
                  fontSize: "13px",
                }}
              >
                <option value="all">All Status</option>
                <option value="valid">Valid Only</option>
                <option value="expired">Expired Only</option>
              </select>
            </div>

            {(searchTerm || algorithmFilter !== "all" || validityFilter !== "all") && (
              <Button
                appearance="subtle"
                size="small"
                onClick={() => {
                  setSearchTerm("");
                  setAlgorithmFilter("all");
                  setValidityFilter("all");
                }}
              >
                Reset
              </Button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>View:</span>
            <Button
              appearance={viewMode === "cards" ? "primary" : "subtle"}
              size="small"
              icon={<GridDots20Regular />}
              onClick={() => setViewMode("cards")}
            >
              Cards
            </Button>
            <Button
              appearance={viewMode === "table" ? "primary" : "subtle"}
              size="small"
              icon={<Table16Regular />}
              onClick={() => setViewMode("table")}
            >
              Table
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content: Cards View vs Table View */}
      {certificates.length === 0 ? (
        <Card style={{ padding: "48px 24px", textAlign: "center" }}>
          <Certificate16Regular style={{ fontSize: "40px", color: "var(--colorBrandForeground1)", marginBottom: "12px" }} />
          <h3 style={{ margin: "0 0 8px 0" }}>No X.509 Public-Key Certificates Loaded</h3>
          <p style={{ color: "var(--colorNeutralForeground2)", maxWidth: "480px", margin: "0 auto 20px auto", fontSize: "13px" }}>
            Scan a repository containing TLS/SSL certificates, or load the built-in demo suite to inspect
            cryptographic parameters, validity, and post-quantum migration profiles.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            {onLoadDemo && (
              <Button appearance="primary" icon={<Play16Filled />} onClick={onLoadDemo}>
                Load Demo Certificates
              </Button>
            )}
            {onOpenScanModal && (
              <Button appearance="outline" onClick={onOpenScanModal}>
                Scan Directory
              </Button>
            )}
          </div>
        </Card>
      ) : filteredCerts.length === 0 ? (
        <Card style={{ padding: "40px 20px", textAlign: "center" }}>
          <p style={{ color: "var(--colorNeutralForeground3)", margin: 0 }}>
            No certificates match the selected search or filter criteria.
          </p>
        </Card>
      ) : viewMode === "cards" ? (
        /* Rich Modern Cards Grid View */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "16px" }}>
          {filteredCerts.map((cert) => {
            const subjectDN = parseDN(cert.subject);
            const issuerDN = parseDN(cert.issuer);
            const selfSigned = isSelfSigned(cert.subject, cert.issuer);
            const exp = calculateExpiration(cert.valid_to);
            const qAssessment = getQuantumAssessment(cert.public_key_algorithm);

            return (
              <Card
                key={cert.id}
                onClick={() => setSelectedCert(cert)}
                style={{
                  padding: "20px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  border: "1px solid var(--colorNeutralStroke1)",
                }}
                className="cert-card-hover"
              >
                {/* Header: Padlock, Domain/CN, and Badges */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: qAssessment.isVulnerable ? "rgba(209, 52, 56, 0.1)" : "rgba(16, 124, 65, 0.1)",
                        color: qAssessment.isVulnerable ? "#d13438" : "#107c41",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        flexShrink: 0,
                      }}
                    >
                      <LockClosed16Regular />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--colorNeutralForeground1)" }}>
                        {subjectDN.cn}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", marginTop: "2px" }}>
                        {subjectDN.o || "Independent Entity"} {subjectDN.location ? `· ${subjectDN.location}` : ""}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    {selfSigned ? (
                      <Badge appearance="tint" color="warning" size="small">
                        Self-Signed Root
                      </Badge>
                    ) : (
                      <Badge appearance="tint" color="brand" size="small">
                        CA: {issuerDN.cn}
                      </Badge>
                    )}
                    <Badge appearance="filled" color={exp.color} size="small">
                      {exp.badgeText}
                    </Badge>
                  </div>
                </div>

                {/* File Path Monospace Pill with Copy Action */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--colorNeutralBackground3)",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                >
                  <span style={{ color: "var(--colorNeutralForeground2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {cert.file}
                  </span>
                  <Tooltip content={copiedField === `path-${cert.id}` ? "Copied!" : "Copy Path"} relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={copiedField === `path-${cert.id}` ? <Checkmark16Regular /> : <Copy16Regular />}
                      onClick={(e) => handleCopy(cert.file, `path-${cert.id}`, e)}
                      aria-label="Copy Path"
                    />
                  </Tooltip>
                </div>

                {/* Key Cryptographic Attributes Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    background: "var(--colorNeutralBackground2)",
                    padding: "12px",
                    borderRadius: "6px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", marginBottom: "4px", textTransform: "uppercase" }}>
                      Public Key Spec
                    </div>
                    <AlgorithmBadge
                      text={`${cert.public_key_algorithm} ${cert.key_size_bits ? `(${cert.key_size_bits}b)` : ""}`}
                      color="brand"
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", marginBottom: "4px", textTransform: "uppercase" }}>
                      Signature Scheme
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--colorNeutralForeground1)" }}>
                      {formatSigAlg(cert.signature_algorithm)}
                    </div>
                  </div>
                </div>

                {/* Quantum Risk Alert Banner */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    background: qAssessment.isVulnerable ? "rgba(209, 52, 56, 0.08)" : "rgba(16, 124, 65, 0.08)",
                    border: `1px solid ${qAssessment.isVulnerable ? "rgba(209, 52, 56, 0.2)" : "rgba(16, 124, 65, 0.2)"}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                    {qAssessment.isVulnerable ? (
                      <Warning16Regular style={{ color: "#d13438" }} />
                    ) : (
                      <ShieldCheckmark16Regular style={{ color: "#107c41" }} />
                    )}
                    <span style={{ fontWeight: 600, color: qAssessment.isVulnerable ? "#d13438" : "#107c41" }}>
                      {qAssessment.threatType}
                    </span>
                  </div>
                  <Badge appearance="outline" color={qAssessment.isVulnerable ? "danger" : "success"} size="small">
                    {qAssessment.isVulnerable ? "Migration Target" : "PQC Safe"}
                  </Badge>
                </div>

                {/* In-tree Private Key Warning */}
                {cert.private_key_detected && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "rgba(180, 0, 158, 0.08)",
                      border: "1px solid rgba(180, 0, 158, 0.2)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#b4009e" }}>
                      <Key16Regular />
                      <strong>Private Key in Repository</strong>
                    </div>
                    <span style={{ fontSize: "11px", color: "#b4009e" }}>Move to Key Vault</span>
                  </div>
                )}

                {/* Footer with Fingerprint and Inspect Trigger */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "auto",
                    paddingTop: "8px",
                    borderTop: "1px solid var(--colorNeutralStroke2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <code style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>
                      SHA256: {cert.fingerprint_sha256.slice(0, 14)}...
                    </code>
                    <Tooltip
                      content={copiedField === `fp-${cert.id}` ? "Copied!" : "Copy SHA-256 Fingerprint"}
                      relationship="label"
                    >
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={copiedField === `fp-${cert.id}` ? <Checkmark16Regular /> : <Copy16Regular />}
                        onClick={(e) => handleCopy(cert.fingerprint_sha256, `fp-${cert.id}`, e)}
                        aria-label="Copy Fingerprint"
                      />
                    </Tooltip>
                  </div>

                  <Button appearance="secondary" size="small" icon={<Eye16Regular />} onClick={() => setSelectedCert(cert)}>
                    Inspect
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Structured Executive Table View (Clean, No Crammed LDAP Strings) */
        <Card style={{ padding: "0px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell style={{ width: "240px" }}>Common Name & Domain</TableHeaderCell>
                  <TableHeaderCell style={{ width: "170px" }}>Issuer</TableHeaderCell>
                  <TableHeaderCell style={{ width: "160px" }}>Public Key Spec</TableHeaderCell>
                  <TableHeaderCell style={{ width: "180px" }}>Signature Scheme</TableHeaderCell>
                  <TableHeaderCell style={{ width: "150px" }}>Validity Status</TableHeaderCell>
                  <TableHeaderCell style={{ width: "130px" }}>Private Key</TableHeaderCell>
                  <TableHeaderCell style={{ width: "90px", textAlign: "right" }}>Inspect</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCerts.map((cert) => {
                  const subjectDN = parseDN(cert.subject);
                  const issuerDN = parseDN(cert.issuer);
                  const selfSigned = isSelfSigned(cert.subject, cert.issuer);
                  const exp = calculateExpiration(cert.valid_to);
                  const qAssessment = getQuantumAssessment(cert.public_key_algorithm);

                  return (
                    <TableRow
                      key={cert.id}
                      onClick={() => setSelectedCert(cert)}
                      style={{ cursor: "pointer", transition: "background 0.15s ease" }}
                    >
                      <TableCell>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Certificate16Regular style={{ color: "var(--colorBrandForeground1)", flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--colorNeutralForeground1)" }}>
                              {subjectDN.cn}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>
                              {subjectDN.o || "Stand-alone"} {subjectDN.location ? `· ${subjectDN.location}` : ""}
                            </div>
                            <code style={{ fontSize: "11px", color: "var(--colorBrandForeground2)" }}>
                              {cert.file}
                            </code>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {selfSigned ? (
                          <div>
                            <Badge appearance="tint" color="warning" size="small">
                              Self-Signed
                            </Badge>
                            <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", marginTop: "2px" }}>
                              Root CA in repository
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontWeight: 500, fontSize: "13px" }}>{issuerDN.cn}</div>
                            {issuerDN.o && <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)" }}>{issuerDN.o}</div>}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <AlgorithmBadge
                            text={`${cert.public_key_algorithm} ${cert.key_size_bits ? `(${cert.key_size_bits}b)` : ""}`}
                            color="brand"
                          />
                          <span style={{ fontSize: "11px", color: qAssessment.isVulnerable ? "#d13438" : "#107c41" }}>
                            {qAssessment.isVulnerable ? "● Shor Vulnerable" : "● Quantum Safe"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div style={{ fontSize: "12px", fontWeight: 500 }}>
                          {formatSigAlg(cert.signature_algorithm)}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--colorNeutralForeground3)", marginTop: "2px" }}>
                          {cert.signature_algorithm}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div style={{ fontSize: "12px", fontWeight: 600 }}>
                          {exp.formattedDate}
                        </div>
                        <Badge appearance="tint" color={exp.color} size="small" style={{ marginTop: "3px" }}>
                          {exp.badgeText}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {cert.private_key_detected ? (
                          <Badge appearance="filled" color="warning" size="small" icon={<Key20Regular />}>
                            In-Tree Alert
                          </Badge>
                        ) : (
                          <Badge appearance="tint" color="subtle" size="small">
                            Public Only
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell style={{ textAlign: "right" }}>
                        <Button
                          appearance="subtle"
                          icon={<Eye16Regular />}
                          size="small"
                          aria-label="View Details"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCert(cert);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Comprehensive Certificate Detail Drawer / Modal Dialog */}
      <Dialog open={!!selectedCert} onOpenChange={(_, d) => !d.open && setSelectedCert(null)}>
        <DialogSurface style={{ maxWidth: "680px", width: "100%" }}>
          {selectedCert && (() => {
            const subjectDN = parseDN(selectedCert.subject);
            const issuerDN = parseDN(selectedCert.issuer);
            const selfSigned = isSelfSigned(selectedCert.subject, selectedCert.issuer);
            const exp = calculateExpiration(selectedCert.valid_to);
            const qAssessment = getQuantumAssessment(selectedCert.public_key_algorithm);

            return (
              <DialogBody>
                <DialogTitle>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Certificate16Regular style={{ color: "var(--colorBrandForeground1)", fontSize: "20px" }} />
                      <div>
                        <div style={{ fontSize: "18px", fontWeight: 700 }}>{subjectDN.cn}</div>
                        <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)", fontWeight: 400 }}>
                          {selectedCert.file}
                        </div>
                      </div>
                    </div>
                    <Badge appearance="filled" color={exp.color}>
                      {exp.badgeText}
                    </Badge>
                  </div>
                </DialogTitle>

                <DialogContent style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "14px" }}>
                  <TabList
                    selectedValue={dialogTab}
                    onTabSelect={(_: SelectTabEvent, d: SelectTabData) => setDialogTab(d.value as string)}
                  >
                    <Tab value="overview">Overview & Trust</Tab>
                    <Tab value="crypto">Cryptographic Specs</Tab>
                    <Tab value="migration">PQC Migration</Tab>
                    <Tab value="raw">Raw X.509 Attributes</Tab>
                  </TabList>

                  {/* Tab 1: Overview & Trust */}
                  {dialogTab === "overview" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px",
                          background: "var(--colorNeutralBackground3)",
                          padding: "16px",
                          borderRadius: "8px",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", textTransform: "uppercase" }}>
                            Subject Common Name (Domain)
                          </div>
                          <div style={{ fontWeight: 700, fontSize: "15px", marginTop: "2px" }}>
                            {subjectDN.cn}
                          </div>
                          {subjectDN.o && (
                            <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)", marginTop: "2px" }}>
                              {subjectDN.o}
                            </div>
                          )}
                          {subjectDN.location && (
                            <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", marginTop: "1px" }}>
                              {subjectDN.location}
                            </div>
                          )}
                        </div>

                        <div>
                          <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", textTransform: "uppercase" }}>
                            Issuer Authority
                          </div>
                          <div style={{ fontWeight: 700, fontSize: "15px", marginTop: "2px" }}>
                            {issuerDN.cn}
                          </div>
                          <div style={{ marginTop: "4px" }}>
                            {selfSigned ? (
                              <Badge appearance="tint" color="warning" size="small">
                                Self-Signed Certificate
                              </Badge>
                            ) : (
                              <Badge appearance="tint" color="brand" size="small">
                                Third-Party CA
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expiration Progress */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                          <span>Validity Window ({selectedCert.valid_from.split(" ")[0]} to {selectedCert.valid_to.split(" ")[0]})</span>
                          <strong>{exp.badgeText}</strong>
                        </div>
                        <ProgressBar
                          value={exp.isExpired ? 0 : Math.min(1, Math.max(0.05, exp.daysRemaining / 730))}
                          color={exp.color === "danger" ? "error" : exp.color}
                        />
                      </div>

                      {/* Private Key Status Warning */}
                      {selectedCert.private_key_detected ? (
                        <div
                          style={{
                            background: "rgba(209, 52, 56, 0.08)",
                            border: "1px solid rgba(209, 52, 56, 0.25)",
                            borderRadius: "8px",
                            padding: "14px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#d13438", fontWeight: 600 }}>
                            <Warning16Regular />
                            <span>Security Alert: Private Key File Discovered In-Tree</span>
                          </div>
                          <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
                            A corresponding private key file exists alongside this certificate in the repository. Private keys
                            should NEVER be committed to source code repositories. Migrate the private key to Azure Key Vault,
                            Azure Managed HSM, or Kubernetes Secrets immediately.
                          </p>
                        </div>
                      ) : (
                        <div
                          style={{
                            background: "var(--colorNeutralBackground3)",
                            borderRadius: "8px",
                            padding: "12px 14px",
                            fontSize: "12px",
                            color: "var(--colorNeutralForeground2)",
                          }}
                        >
                          <strong>Key Isolation:</strong> No matching private key file was found in source control. Certificate
                          conforms to public certificate isolation guidelines.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Cryptographic Specs */}
                  {dialogTab === "crypto" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div style={{ background: "var(--colorNeutralBackground3)", padding: "12px", borderRadius: "6px" }}>
                          <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", textTransform: "uppercase" }}>
                            Public Key Algorithm
                          </div>
                          <div style={{ fontWeight: 600, fontSize: "14px", marginTop: "4px" }}>
                            {selectedCert.public_key_algorithm}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)", marginTop: "2px" }}>
                            Key Size: <strong>{selectedCert.key_size_bits || "Standard"} bits</strong>
                          </div>
                        </div>

                        <div style={{ background: "var(--colorNeutralBackground3)", padding: "12px", borderRadius: "6px" }}>
                          <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", textTransform: "uppercase" }}>
                            Signature Algorithm
                          </div>
                          <div style={{ fontWeight: 600, fontSize: "14px", marginTop: "4px" }}>
                            {formatSigAlg(selectedCert.signature_algorithm)}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--colorNeutralForeground3)", marginTop: "2px" }}>
                            OID: <code>{selectedCert.signature_algorithm}</code>
                          </div>
                        </div>
                      </div>

                      {/* Fingerprints with One-Click Copy */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 600 }}>SHA-256 Fingerprint</span>
                          <Button
                            appearance="subtle"
                            size="small"
                            icon={copiedField === "modal-sha256" ? <Checkmark16Regular /> : <Copy16Regular />}
                            onClick={() => handleCopy(selectedCert.fingerprint_sha256, "modal-sha256")}
                          >
                            {copiedField === "modal-sha256" ? "Copied" : "Copy"}
                          </Button>
                        </div>
                        <code
                          style={{
                            fontSize: "12px",
                            display: "block",
                            padding: "10px",
                            background: "var(--colorNeutralBackground3)",
                            borderRadius: "6px",
                            wordBreak: "break-all",
                          }}
                        >
                          {selectedCert.fingerprint_sha256}
                        </code>
                      </div>

                      {/* Subject Alternative Names */}
                      {selectedCert.san_list && selectedCert.san_list.length > 0 && (
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                            Subject Alternative Names (SANs)
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {selectedCert.san_list.map((san) => (
                              <Badge key={san} appearance="outline">
                                {san}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Post-Quantum Migration Strategy */}
                  {dialogTab === "migration" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div
                        style={{
                          background: qAssessment.isVulnerable ? "rgba(209, 52, 56, 0.08)" : "rgba(16, 124, 65, 0.08)",
                          padding: "16px",
                          borderRadius: "8px",
                          border: `1px solid ${qAssessment.isVulnerable ? "rgba(209, 52, 56, 0.2)" : "rgba(16, 124, 65, 0.2)"}`,
                        }}
                      >
                        <div style={{ fontSize: "14px", fontWeight: 700, color: qAssessment.isVulnerable ? "#d13438" : "#107c41" }}>
                          {qAssessment.threatType}
                        </div>
                        <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "var(--colorNeutralForeground1)" }}>
                          {selectedCert.migration_assessment ||
                            "This public key certificate relies on classical mathematics vulnerable to cryptanalytic quantum algorithms (Shor's algorithm)."}
                        </p>
                      </div>

                      <div style={{ background: "var(--colorNeutralBackground3)", padding: "14px", borderRadius: "8px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--colorBrandForeground1)" }}>
                          Recommended Target Cryptosystem
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>
                          {qAssessment.recommendedPQC}
                        </div>
                        <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "var(--colorNeutralForeground2)" }}>
                          Replace or dual-sign using NIST FIPS 204 ML-DSA-65 (Dilithium) or implement Composite X.509
                          (ITU-T X.509 / IETF LAMPS) to maintain backwards compatibility while enabling post-quantum protection.
                        </p>
                      </div>

                      <div style={{ fontSize: "12px", color: "var(--colorNeutralForeground2)", lineHeight: 1.5 }}>
                        <strong>Validation Checklist:</strong>
                        <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                          <li>Verify client TLS stacks support larger certificate sizes (ML-DSA signatures are ~2.4KB vs RSA ~256B).</li>
                          <li>Confirm TLS 1.3 hybrid key exchange (X25519Kyber768) is active on the termination proxy.</li>
                          <li>Ensure certificate revocation lists (CRLs) and OCSP responders support quantum-safe signatures.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Raw X.509 Attributes */}
                  {dialogTab === "raw" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600 }}>Raw Subject Distinguished Name (DN)</span>
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={copiedField === "raw-sub" ? <Checkmark16Regular /> : <Copy16Regular />}
                          onClick={() => handleCopy(selectedCert.subject, "raw-sub")}
                        >
                          {copiedField === "raw-sub" ? "Copied" : "Copy"}
                        </Button>
                      </div>
                      <code
                        style={{
                          fontSize: "11px",
                          padding: "10px",
                          background: "var(--colorNeutralBackground3)",
                          borderRadius: "6px",
                          wordBreak: "break-all",
                          display: "block",
                        }}
                      >
                        {selectedCert.subject}
                      </code>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600 }}>Raw Issuer Distinguished Name (DN)</span>
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={copiedField === "raw-iss" ? <Checkmark16Regular /> : <Copy16Regular />}
                          onClick={() => handleCopy(selectedCert.issuer, "raw-iss")}
                        >
                          {copiedField === "raw-iss" ? "Copied" : "Copy"}
                        </Button>
                      </div>
                      <code
                        style={{
                          fontSize: "11px",
                          padding: "10px",
                          background: "var(--colorNeutralBackground3)",
                          borderRadius: "6px",
                          wordBreak: "break-all",
                          display: "block",
                        }}
                      >
                        {selectedCert.issuer}
                      </code>
                    </div>
                  )}
                </DialogContent>
              </DialogBody>
            );
          })()}
        </DialogSurface>
      </Dialog>
    </div>
  );
};

