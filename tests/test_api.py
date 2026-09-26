"""
API integration tests for FastAPI endpoints.
"""

import os
import unittest
from fastapi.testclient import TestClient
from backend.app.main import app


class TestAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")

    def test_rules(self):
        res = self.client.get("/api/rules")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("algorithms", data)
        self.assertIn("protocols", data)
        self.assertIn("libraries", data)

    def test_demo_scan_and_findings(self):
        res = self.client.post("/api/scans", json={"use_demo": True})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        scan_id = data["summary"]["scan_id"]

        # Fetch findings
        findings_res = self.client.get(f"/api/scans/{scan_id}/findings")
        self.assertEqual(findings_res.status_code, 200)
        findings = findings_res.json()
        self.assertGreater(len(findings), 0)

        # Fetch dependencies
        dep_res = self.client.get(f"/api/scans/{scan_id}/dependencies")
        self.assertEqual(dep_res.status_code, 200)

        # Fetch certificates
        cert_res = self.client.get(f"/api/scans/{scan_id}/certificates")
        self.assertEqual(cert_res.status_code, 200)

        # Fetch migration plan
        mig_res = self.client.get(f"/api/scans/{scan_id}/migration")
        self.assertEqual(mig_res.status_code, 200)

        # Fetch report
        report_res = self.client.get(f"/api/scans/{scan_id}/report?format=html")
        self.assertEqual(report_res.status_code, 200)
        self.assertIn("PQC Migration", report_res.text)

    def test_sandbox_test(self):
        res = self.client.post("/api/sandbox/test", json={
            "provider": "hybrid",
            "algorithm": "Composite-ECDSA-MLDSA",
            "message": "Testing API sandbox execution"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["provider"], "hybrid")
        self.assertTrue(data["is_quantum_resistant"])


if __name__ == "__main__":
    unittest.main()
