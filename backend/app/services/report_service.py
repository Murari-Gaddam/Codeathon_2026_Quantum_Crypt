"""
Report Generation Service for PQC Migration Scanner.
Generates structured JSON reports and standalone printable Fluent-styled HTML executive reports.
Includes mandatory Limitations section and clear separation between observed evidence and inference.
"""

from typing import Dict, Any
from app.schemas.scan import ScanResult


def generate_html_report(result: ScanResult) -> str:
    summary = result.summary
    findings = result.findings
    certs = result.certificates
    plan = result.migration_plan
    limitations = result.limitations

    findings_rows = ""
    for f in findings:
        badge_class = "badge-confirmed" if f.confidence == "confirmed" else ("badge-likely" if f.confidence == "likely" else "badge-possible")
        evidence_type = "Inferred Dependency" if f.is_indirect else "Observed Direct Evidence"
        findings_rows += f"""
        <tr>
            <td><span class="badge {badge_class}">{f.confidence.upper()}</span></td>
            <td><strong>{f.mechanism}</strong><br><small style="color:#605e5c;">{f.algorithm_variant or ''}</small></td>
            <td><code>{f.file}:{f.line}</code></td>
            <td><span class="badge badge-neutral">{evidence_type}</span><br><code>{f.evidence}</code></td>
            <td>{f.component}</td>
            <td>{f.concern}</td>
        </tr>
        """

    cert_rows = ""
    for c in certs:
        cert_rows += f"""
        <tr>
            <td><strong>{c.subject}</strong></td>
            <td>{c.issuer}</td>
            <td><span class="badge badge-brand">{c.public_key_algorithm} ({c.key_size_bits or 'N/A'} bits)</span></td>
            <td>{c.signature_algorithm}</td>
            <td><code>{c.fingerprint_sha256[:23]}...</code></td>
            <td>{c.valid_to}</td>
        </tr>
        """

    migration_rows = ""
    for item in plan:
        p_class = "badge-critical" if item.priority in ["immediate", "critical"] else ("badge-warning" if item.priority == "high" else "badge-neutral")
        migration_rows += f"""
        <tr>
            <td><span class="badge {p_class}">{item.priority.upper()}</span></td>
            <td><strong>{item.mechanism}</strong><br><small>{item.component}</small></td>
            <td><strong>Reason:</strong> {item.priority_reason}<br><strong>Dependencies:</strong> {', '.join(item.dependencies)}</td>
            <td>{item.suggested_investigation}</td>
            <td><span class="badge badge-neutral">{item.status.upper()}</span></td>
        </tr>
        """

    limitations_list = "".join(f"<li>{lim}</li>" for lim in limitations)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PQC Migration Scanner - Cryptographic Inventory & Assessment Report</title>
    <style>
        :root {{
            --font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            --brand-primary: #0078d4;
            --text-primary: #242424;
            --text-secondary: #616161;
            --bg-page: #f5f5f5;
            --bg-card: #ffffff;
            --border: #e0e0e0;
            --success: #107c41;
            --warning: #795e00;
            --danger: #a80000;
        }}
        body {{
            font-family: var(--font-family);
            background: var(--bg-page);
            color: var(--text-primary);
            line-height: 1.5;
            margin: 0;
            padding: 24px;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: var(--bg-card);
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
            border: 1px solid var(--border);
        }}
        header {{
            border-bottom: 2px solid var(--brand-primary);
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        h1 {{
            margin: 0 0 8px 0;
            color: var(--brand-primary);
            font-size: 28px;
            font-weight: 600;
        }}
        .notice-banner {{
            background: #f0f6ff;
            border-left: 4px solid var(--brand-primary);
            padding: 12px 16px;
            margin: 20px 0;
            font-size: 14px;
        }}
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin: 24px 0;
        }}
        .stat-card {{
            background: #fafafa;
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 16px;
        }}
        .stat-value {{
            font-size: 28px;
            font-weight: 600;
            color: var(--brand-primary);
        }}
        .stat-label {{
            font-size: 13px;
            color: var(--text-secondary);
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0 32px 0;
            font-size: 13px;
        }}
        th, td {{
            text-align: left;
            padding: 10px 12px;
            border-bottom: 1px solid var(--border);
            vertical-align: top;
        }}
        th {{
            background: #f3f3f3;
            font-weight: 600;
        }}
        code {{
            font-family: 'Cascadia Code', Consolas, monospace;
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
        }}
        .badge {{
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }}
        .badge-confirmed {{ background: #dff6dd; color: #107c41; }}
        .badge-likely {{ background: #fff4ce; color: #795e00; }}
        .badge-possible {{ background: #f3f2f1; color: #605e5c; }}
        .badge-critical {{ background: #fde7e9; color: #a80000; }}
        .badge-warning {{ background: #fff4ce; color: #795e00; }}
        .badge-brand {{ background: #cce4f7; color: #004578; }}
        .badge-neutral {{ background: #edebe9; color: #323130; }}
        .limitations-box {{
            background: #fdf3f4;
            border: 1px solid #f3d6d8;
            padding: 20px;
            border-radius: 6px;
            margin-top: 30px;
        }}
        .limitations-box h3 {{
            margin-top: 0;
            color: #a80000;
        }}
        @media print {{
            body {{ background: #fff; padding: 0; }}
            .container {{ box-shadow: none; border: none; padding: 0; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>PQC Migration & Crypto-Agility Assessment Report</h1>
            <div style="font-size: 14px; color: var(--text-secondary);">
                Scan ID: <strong>{summary.scan_id}</strong> | Generated: <strong>{summary.timestamp}</strong> | Target: <code>{summary.target_path}</code>
            </div>
        </header>

        <div class="notice-banner">
            <strong>Security Baseline Notice:</strong> Cryptographic mechanisms detected in this scan represent static inventory findings.
            This report does not claim that a scan proves a system is quantum-safe. It is an inventory, dependency-mapping, migration-planning, and crypto-agility demonstration document.
        </div>

        <h2>Executive Summary</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">{summary.files_scanned}</div>
                <div class="stat-label">Files Scanned</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{summary.findings.get('total', 0)}</div>
                <div class="stat-label">Total Findings ({summary.findings.get('confirmed', 0)} Confirmed)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{summary.certificates}</div>
                <div class="stat-label">Certificates Cataloged</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{summary.migration_items}</div>
                <div class="stat-label">Migration Action Items</div>
            </div>
        </div>

        <h2>1. Cryptographic Inventory & Findings</h2>
        <p style="font-size:13px; color:var(--text-secondary);">
            Clear distinction between <strong>Observed Direct Evidence</strong> (direct AST calls/constants) and <strong>Inferred Dependency</strong> (wrappers/manifests).
        </p>
        <table>
            <thead>
                <tr>
                    <th>Confidence</th>
                    <th>Mechanism</th>
                    <th>Location</th>
                    <th>Evidence</th>
                    <th>Component</th>
                    <th>Migration Concern</th>
                </tr>
            </thead>
            <tbody>
                {findings_rows}
            </tbody>
        </table>

        <h2>2. Public-Key Certificate Inventory</h2>
        <table>
            <thead>
                <tr>
                    <th>Subject</th>
                    <th>Issuer</th>
                    <th>Public Key</th>
                    <th>Signature Algorithm</th>
                    <th>Fingerprint (SHA-256)</th>
                    <th>Valid Until</th>
                </tr>
            </thead>
            <tbody>
                {cert_rows}
            </tbody>
        </table>

        <h2>3. Recommended Migration Plan & Validation Gates</h2>
        <table>
            <thead>
                <tr>
                    <th>Priority</th>
                    <th>Mechanism / Component</th>
                    <th>Assessment & Dependencies</th>
                    <th>Suggested Investigation</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {migration_rows}
            </tbody>
        </table>

        <div class="limitations-box">
            <h3>4. Formal Limitations & Scope Boundaries</h3>
            <ul>
                {limitations_list}
            </ul>
        </div>
    </div>
</body>
</html>
    """
    return html
