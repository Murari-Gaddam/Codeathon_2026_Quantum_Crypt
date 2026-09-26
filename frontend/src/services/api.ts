import type { ScanResult, ScanSummary, Finding, CertificateRecord, DependencyGraph, MigrationItem, SandboxTestResponse, CIComparisonResult } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = {
  async listScans(): Promise<ScanSummary[]> {
    const res = await fetch(`${API_BASE}/api/scans`);
    if (!res.ok) throw new Error("Failed to fetch scans list");
    return res.json();
  },

  async getScan(scanId: string): Promise<ScanResult> {
    const res = await fetch(`${API_BASE}/api/scans/${scanId}`);
    if (!res.ok) throw new Error(`Failed to fetch scan ${scanId}`);
    return res.json();
  },

  async startScan(targetPath?: string, useDemo: boolean = false): Promise<ScanResult> {
    const res = await fetch(`${API_BASE}/api/scans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_path: targetPath, use_demo: useDemo }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Scan initiation failed" }));
      throw new Error(err.detail || "Scan initiation failed");
    }
    return res.json();
  },

  async uploadAndScan(file: File): Promise<ScanResult> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/scans/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload scan failed" }));
      throw new Error(err.detail || "Upload scan failed");
    }
    return res.json();
  },

  async getFindings(scanId: string, filterParams?: Record<string, string>): Promise<Finding[]> {
    const query = new URLSearchParams(filterParams).toString();
    const res = await fetch(`${API_BASE}/api/scans/${scanId}/findings?${query}`);
    if (!res.ok) throw new Error("Failed to fetch findings");
    return res.json();
  },

  async getDependencies(scanId: string): Promise<DependencyGraph> {
    const res = await fetch(`${API_BASE}/api/scans/${scanId}/dependencies`);
    if (!res.ok) throw new Error("Failed to fetch dependencies");
    return res.json();
  },

  async getCertificates(scanId: string): Promise<CertificateRecord[]> {
    const res = await fetch(`${API_BASE}/api/scans/${scanId}/certificates`);
    if (!res.ok) throw new Error("Failed to fetch certificates");
    return res.json();
  },

  async getMigrationPlan(scanId: string): Promise<MigrationItem[]> {
    const res = await fetch(`${API_BASE}/api/scans/${scanId}/migration`);
    if (!res.ok) throw new Error("Failed to fetch migration plan");
    return res.json();
  },

  async updateMigrationItem(scanId: string, itemId: string, itemData: Partial<MigrationItem>): Promise<MigrationItem> {
    const res = await fetch(`${API_BASE}/api/scans/${scanId}/migration/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: itemData.status,
        owner: itemData.owner,
        notes: itemData.notes,
        validation_gates: itemData.validation_gates,
      }),
    });
    if (!res.ok) throw new Error("Failed to update migration item");
    return res.json();
  },

  async runSandboxTest(params: {
    provider: string;
    algorithm: string;
    message: string;
    operation?: string;
  }): Promise<SandboxTestResponse> {
    const res = await fetch(`${API_BASE}/api/sandbox/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Provider test execution failed" }));
      throw new Error(err.detail || "Provider test execution failed");
    }
    return res.json();
  },

  async evaluateCIPolicy(scanId: string): Promise<CIComparisonResult> {
    const res = await fetch(`${API_BASE}/api/ci/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scan_id: scanId }),
    });
    if (!res.ok) throw new Error("Failed to evaluate CI policy");
    return res.json();
  },

  async setBaseline(scanId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/api/scans/${scanId}/baseline`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to register baseline");
    return res.json();
  },

  getReportDownloadUrl(scanId: string): string {
    return `${API_BASE}/api/scans/${scanId}/report/download`;
  },

  async getHtmlReport(scanId: string): Promise<string> {
    const res = await fetch(`${API_BASE}/api/scans/${scanId}/report?format=html`);
    if (!res.ok) throw new Error("Failed to fetch HTML report");
    return res.text();
  },

  async getRules(): Promise<Record<string, any>> {
    const res = await fetch(`${API_BASE}/api/rules`);
    if (!res.ok) throw new Error("Failed to fetch rules");
    return res.json();
  },

  async resetScans(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/api/scans/reset`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to reset scans");
    return res.json();
  }
};
