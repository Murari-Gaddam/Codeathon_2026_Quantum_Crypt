"""
Unit and integration tests for Scanner engine, rule matcher, certificate parser, and classifier.
"""

import os
import unittest
from backend.app.services.storage import StorageService
from backend.app.services.scan_service import ScanService
from backend.app.crypto.classical import ClassicalProvider
from backend.app.crypto.hybrid import HybridProvider
from backend.app.crypto.pqc import PQCCapableProvider


class TestPQCScanner(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        cls.rules_dir = os.path.join(cls.base_dir, "rules")
        cls.demo_repo = os.path.join(cls.base_dir, "samples/demo-repository")
        cls.storage = StorageService(os.path.join(cls.base_dir, "test_scanner.db"))
        cls.scan_service = ScanService(cls.rules_dir, cls.storage)

    def test_demo_repository_scan(self):
        """Test full scan pipeline on demo repository."""
        result = self.scan_service.run_scan(self.demo_repo)

        # 1. Check scan summary
        self.assertGreater(result.summary.files_scanned, 0)
        self.assertGreater(result.summary.findings["total"], 0)
        self.assertGreater(result.summary.findings["confirmed"], 0)
        self.assertGreaterEqual(result.summary.certificates, 2)
        self.assertGreater(result.summary.dependencies, 0)
        self.assertGreater(result.summary.migration_items, 0)

        # 2. Check RSA finding at key_manager.py line 42
        rsa_findings = [f for f in result.findings if f.mechanism == "RSA" and f.usage == "key_generation" and "key_manager.py" in f.file]
        self.assertTrue(len(rsa_findings) > 0, "Expected RSA finding in key_manager.py")
        self.assertEqual(rsa_findings[0].line, 42, "Expected RSA finding on line 42")
        self.assertEqual(rsa_findings[0].confidence, "confirmed")

        # 3. Check JWT RS256 finding at token.py line 38
        jwt_findings = [f for f in result.findings if "RS256" in (f.algorithm_variant or "") and "token.py" in f.file]
        self.assertTrue(len(jwt_findings) > 0, "Expected RS256 finding in token.py")
        self.assertEqual(jwt_findings[0].line, 38, "Expected RS256 finding on line 38")

        # 4. Check Indirect crypto detection (AuthHelper wrapper)
        indirect_findings = [f for f in result.findings if f.is_indirect and "AuthHelper" in f.mechanism]
        self.assertTrue(len(indirect_findings) > 0, "Expected indirect AuthHelper wrapper finding")

        # 5. Check Certificate parsing
        self.assertTrue(len(result.certificates) >= 2)
        server_certs = [c for c in result.certificates if "server.pem" in c.file]
        self.assertTrue(len(server_certs) > 0)
        self.assertFalse(server_certs[0].private_key_detected)
        self.assertIn("RSA", server_certs[0].public_key_algorithm)

        # 6. Check Limitations included
        self.assertTrue(len(result.limitations) >= 8)

    def test_classical_provider(self):
        """Test Classical CryptoProvider (RSA & ECDSA)."""
        provider = ClassicalProvider(algorithm="RSA-2048")
        msg = b"Unit test payload"
        sig = provider.sign(msg)
        self.assertTrue(provider.verify(msg, sig))
        self.assertFalse(provider.verify(b"tampered", sig))
        self.assertEqual(provider.get_metadata()["is_quantum_resistant"], False)

    def test_hybrid_provider(self):
        """Test Hybrid CryptoProvider (Composite Dual Signature)."""
        provider = HybridProvider()
        msg = b"Hybrid composite test payload"
        sig = provider.sign(msg)
        self.assertTrue(provider.verify(msg, sig))
        self.assertFalse(provider.verify(b"tampered", sig))
        self.assertEqual(provider.get_metadata()["is_quantum_resistant"], True)

    def test_pqc_provider(self):
        """Test Pure PQC Provider (ML-DSA-65 / Dilithium)."""
        provider = PQCCapableProvider()
        msg = b"Post quantum test payload"
        sig = provider.sign(msg)
        self.assertTrue(provider.verify(msg, sig))
        self.assertFalse(provider.verify(b"tampered", sig))
        self.assertEqual(len(sig), 3309)
        self.assertEqual(provider.get_metadata()["is_quantum_resistant"], True)

    @classmethod
    def tearDownClass(cls):
        test_db = os.path.join(cls.base_dir, "test_scanner.db")
        if os.path.exists(test_db):
            try:
                os.remove(test_db)
            except OSError:
                pass


if __name__ == "__main__":
    unittest.main()
