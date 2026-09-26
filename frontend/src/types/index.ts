export type ConfidenceLevel = "confirmed" | "likely" | "possible" | "unknown";

export type FindingStatus = "needs-review" | "reviewed" | "in-testing" | "migration-planned" | "completed";

export type PriorityLevel = "immediate" | "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  id: string;
  mechanism: string;
  algorithm_variant?: string;
  category: string;
  usage: string;
  confidence: ConfidenceLevel;
  file: string;
  line: number;
  column: number;
  evidence: string;
  detection_rule: string;
  component: string;
  protocol?: string;
  status: FindingStatus;
  concern: string;
  recommended_action: string;
  quantum_impact: string;
  is_indirect: boolean;
  inferred_from?: string;
}

export interface CertificateRecord {
  id: string;
  file: string;
  subject: string;
  issuer: string;
  valid_from: string;
  valid_to: string;
  is_expired: boolean;
  public_key_algorithm: string;
  key_size_bits?: number;
  signature_algorithm: string;
  san_list: string[];
  fingerprint_sha256: string;
  private_key_detected: boolean;
  migration_assessment: string;
  quantum_impact: string;
}

export interface DependencyNode {
  id: string;
  label: string;
  type: string;
  status?: string;
  details?: Record<string, any>;
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  confidence: string;
  evidence: string[];
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface ValidationGate {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  verified_by?: string;
  verified_at?: string;
}

export interface MigrationItem {
  id: string;
  priority: PriorityLevel;
  priority_reason: string;
  component: string;
  finding_id?: string;
  mechanism: string;
  reason_for_review: string;
  dependencies: string[];
  suggested_investigation: string;
  compatibility_concerns: string[];
  validation_gates: ValidationGate[];
  status: string;
  owner: string;
  notes: string;
}

export interface ScanSummary {
  scan_id: string;
  timestamp: string;
  target_path: string;
  status: string;
  files_scanned: number;
  findings: {
    confirmed: number;
    likely: number;
    possible: number;
    unknown: number;
    total: number;
  };
  certificates: number;
  dependencies: number;
  migration_items: number;
  warnings: number;
  algorithms_detected: string[];
  components_detected: string[];
}

export interface ScanResult {
  summary: ScanSummary;
  findings: Finding[];
  certificates: CertificateRecord[];
  dependency_graph: DependencyGraph;
  migration_plan: MigrationItem[];
  warnings: string[];
  limitations: string[];
}

export interface SandboxTestResponse {
  provider: string;
  algorithm: string;
  operation: string;
  status: string;
  execution_time_ms: number;
  message: string;
  signature_or_cipher_preview: string;
  public_key_preview: string;
  key_size_bytes: number;
  signature_or_ciphertext_size_bytes: number;
  is_quantum_resistant: boolean;
  compatibility_notes: string[];
  interoperability_summary: string;
  rollback_strategy: string;
}

export interface CIComparisonResult {
  passed: boolean;
  policy_name: string;
  status: "PASSED" | "WARNING" | "FAILED";
  violations: Array<{ rule: string; finding_id: string; mechanism: string; location: string; message: string }>;
  warnings: Array<{ rule: string; finding_id: string; mechanism: string; location: string; message: string }>;
  new_findings: Finding[];
  summary_message: string;
}
