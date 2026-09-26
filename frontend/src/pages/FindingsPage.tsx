import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Input,
  Button,
  Badge,
  Card,
} from "@fluentui/react-components";
import { Search16Regular, Eye16Regular, Warning16Regular, Play16Filled } from "@fluentui/react-icons";
import type { Finding } from "../types";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { AlgorithmBadge } from "../components/AlgorithmBadge";
import { FindingDetailDrawer } from "./FindingDetailDrawer";

interface Props {
  findings: Finding[];
  onLoadDemo?: () => void;
  onOpenScanModal?: () => void;
}

export const FindingsPage: React.FC<Props> = ({ findings, onLoadDemo, onOpenScanModal }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [componentFilter, setComponentFilter] = useState("all");
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (findings.length === 0) {
    return (
      <Card style={{ padding: "48px 24px", textAlign: "center" }}>
        <Warning16Regular style={{ fontSize: "40px", color: "var(--colorBrandForeground1)", marginBottom: "12px" }} />
        <h3 style={{ margin: "0 0 8px 0" }}>No Cryptographic Findings Loaded</h3>
        <p style={{ color: "var(--colorNeutralForeground2)", maxWidth: "480px", margin: "0 auto 20px auto", fontSize: "13px" }}>
          Scan a local repository or load the built-in enterprise demo suite to discover cryptographic algorithms,
          AST patterns, token signings, and TLS configurations.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {onLoadDemo && (
            <Button appearance="primary" icon={<Play16Filled />} onClick={onLoadDemo}>
              Load Demo Findings
            </Button>
          )}
          {onOpenScanModal && (
            <Button appearance="outline" onClick={onOpenScanModal}>
              Scan Directory
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const categories = useMemo(() => Array.from(new Set(findings.map((f) => f.category))), [findings]);
  const components = useMemo(() => Array.from(new Set(findings.map((f) => f.component))), [findings]);

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (confidenceFilter !== "all" && f.confidence.toLowerCase() !== confidenceFilter.toLowerCase()) {
        return false;
      }
      if (categoryFilter !== "all" && f.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      if (componentFilter !== "all" && f.component.toLowerCase() !== componentFilter.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          f.id.toLowerCase().includes(term) ||
          f.mechanism.toLowerCase().includes(term) ||
          (f.algorithm_variant || "").toLowerCase().includes(term) ||
          f.file.toLowerCase().includes(term) ||
          f.component.toLowerCase().includes(term) ||
          f.evidence.toLowerCase().includes(term) ||
          f.concern.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [findings, confidenceFilter, categoryFilter, componentFilter, searchTerm]);

  const handleRowClick = (finding: Finding) => {
    setSelectedFinding(finding);
    setIsDrawerOpen(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Filters Bar */}
      <Card style={{ padding: "16px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <Input
            contentBefore={<Search16Regular />}
            placeholder="Search findings, algorithms, files, evidence..."
            value={searchTerm}
            onChange={(_, d) => setSearchTerm(d.value)}
            style={{ minWidth: "260px", flex: 1 }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>Confidence:</span>
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                border: "1px solid var(--colorNeutralStroke1)",
                background: "var(--colorNeutralBackground1)",
                color: "var(--colorNeutralForeground1)",
                fontSize: "13px",
              }}
            >
              <option value="all">All Confidence ({findings.length})</option>
              <option value="confirmed">Confirmed</option>
              <option value="likely">Likely</option>
              <option value="possible">Possible</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                border: "1px solid var(--colorNeutralStroke1)",
                background: "var(--colorNeutralBackground1)",
                color: "var(--colorNeutralForeground1)",
                fontSize: "13px",
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--colorNeutralForeground3)" }}>Component:</span>
            <select
              value={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                border: "1px solid var(--colorNeutralStroke1)",
                background: "var(--colorNeutralBackground1)",
                color: "var(--colorNeutralForeground1)",
                fontSize: "13px",
              }}
            >
              <option value="all">All Components</option>
              {components.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || confidenceFilter !== "all" || categoryFilter !== "all" || componentFilter !== "all") && (
            <Button
              appearance="subtle"
              size="small"
              onClick={() => {
                setSearchTerm("");
                setConfidenceFilter("all");
                setCategoryFilter("all");
                setComponentFilter("all");
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Findings Table */}
      <Card style={{ padding: "0px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ width: "130px" }}>Confidence</TableHeaderCell>
                <TableHeaderCell style={{ width: "180px" }}>Mechanism</TableHeaderCell>
                <TableHeaderCell style={{ width: "150px" }}>Usage</TableHeaderCell>
                <TableHeaderCell style={{ width: "160px" }}>Component</TableHeaderCell>
                <TableHeaderCell style={{ width: "200px" }}>File & Line</TableHeaderCell>
                <TableHeaderCell>Migration Concern</TableHeaderCell>
                <TableHeaderCell style={{ width: "80px", textAlign: "right" }}>Action</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFindings.map((f) => (
                <TableRow
                  key={f.id}
                  onClick={() => handleRowClick(f)}
                  style={{ cursor: "pointer", transition: "background 0.15s ease" }}
                >
                  <TableCell>
                    <ConfidenceBadge confidence={f.confidence} />
                  </TableCell>
                  <TableCell>
                    <div style={{ fontWeight: 600 }}>{f.mechanism}</div>
                    {f.algorithm_variant && f.algorithm_variant !== f.mechanism && (
                      <div style={{ marginTop: "4px" }}>
                        <AlgorithmBadge text={f.algorithm_variant} color="subtle" appearance="outline" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span style={{ fontSize: "13px" }}>{f.usage.replace("_", " ")}</span>
                    {f.is_indirect && (
                      <div style={{ marginTop: "3px" }}>
                        <Badge appearance="outline" color="warning" size="small">
                          Indirect
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <AlgorithmBadge text={f.component} color="brand" appearance="tint" />
                  </TableCell>
                  <TableCell>
                    <code style={{ fontSize: "12px" }}>
                      {f.file}:{f.line}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--colorNeutralForeground2)",
                        maxWidth: "420px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.concern}
                    </div>
                  </TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    <Button appearance="subtle" icon={<Eye16Regular />} size="small" aria-label="View Details" />
                  </TableCell>
                </TableRow>
              ))}

              {filteredFindings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ color: "var(--colorNeutralForeground3)" }}>
                      No cryptographic findings match these filter criteria.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Slide-over details drawer */}
      <FindingDetailDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        finding={selectedFinding}
      />
    </div>
  );
};
