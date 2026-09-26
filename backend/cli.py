"""
Command-Line Interface for PQC Migration Scanner & CI Integration.
Supports automated repo scanning, baseline generation, and policy enforcement in CI pipelines.
"""

import sys
import os
import json
import argparse

# Add parent directory to sys.path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.services.storage import StorageService
from app.services.scan_service import ScanService
from app.services.report_service import generate_html_report


def main():
    parser = argparse.ArgumentParser(description="PQC Migration Scanner CLI & CI Policy Checker")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Scan command
    scan_parser = subparsers.add_parser("scan", help="Scan a repository for cryptographic mechanisms")
    scan_parser.add_argument("target", help="Path to repository or directory to scan")
    scan_parser.add_argument("--rules", default=os.path.join(os.path.dirname(__file__), "../rules"), help="Rules directory")
    scan_parser.add_argument("--baseline", help="Path to baseline scan JSON file for regression check")
    scan_parser.add_argument("--policy", help="Path to policy configuration JSON file")
    scan_parser.add_argument("--output-json", help="Path to save output JSON report")
    scan_parser.add_argument("--output-html", help="Path to save output HTML report")
    scan_parser.add_argument("--fail-on-violation", action="store_true", help="Exit with code 1 if policy fails")

    args = parser.parse_args()

    if args.command == "scan":
        rules_dir = os.path.abspath(args.rules)
        storage = StorageService(os.path.join(os.path.dirname(__file__), "../scanner.db"))
        scan_svc = ScanService(rules_dir, storage)

        print(f"[*] Starting PQC Migration scan on: {args.target}")
        result = scan_svc.run_scan(os.path.abspath(args.target))

        print(f"[+] Scan completed.")
        print(f"    Files scanned: {result.summary.files_scanned}")
        print(f"    Total findings: {result.summary.findings['total']} (Confirmed: {result.summary.findings['confirmed']}, Likely: {result.summary.findings['likely']}, Possible: {result.summary.findings['possible']})")
        print(f"    Certificates: {result.summary.certificates}")
        print(f"    Dependencies: {result.summary.dependencies}")
        print(f"    Migration items: {result.summary.migration_items}")

        # Check policy
        policies_file = args.policy or os.path.join(rules_dir, "policies.json")
        policy_data = {}
        if os.path.exists(policies_file):
            with open(policies_file, "r", encoding="utf-8") as pf:
                policy_data = json.load(pf)

        deprecated_algs = set(policy_data.get("deprecated_algorithms", ["DES", "3DES", "RC4", "MD5", "SHA-1", "DSA"]))
        violations = []
        for f in result.findings:
            if f.mechanism.upper() in deprecated_algs:
                violations.append(f"{f.mechanism} at {f.file}:{f.line}")

        if violations:
            print("\n[!] CRYPTO POLICY VIOLATION:")
            for v in violations:
                print(f"    - {v}")
            if args.fail_on_violation:
                sys.exit(1)
        else:
            print("\n[+] Crypto policy check passed. No deprecated algorithms introduced.")

        if args.output_json:
            with open(args.output_json, "w", encoding="utf-8") as jf:
                json.dump(result.model_dump(), jf, indent=2)
            print(f"[+] Saved JSON report to: {args.output_json}")

        if args.output_html:
            html = generate_html_report(result)
            with open(args.output_html, "w", encoding="utf-8") as hf:
                hf.write(html)
            print(f"[+] Saved HTML report to: {args.output_html}")


if __name__ == "__main__":
    main()
