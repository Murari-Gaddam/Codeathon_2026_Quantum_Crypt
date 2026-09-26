"""
X.509 Certificate Scanner.
Parses public certificates using vetted Python cryptography library.
Extracts Subject, Issuer, Validity, Public Key Algorithm, Key Size, Signature Algorithm,
SANs, SHA-256 fingerprint, and checks private key existence (NEVER exposing key material).
"""

import os
import hashlib
from typing import List, Optional, Tuple
from cryptography import x509
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, ec, dsa, ed25519, ed448
from app.schemas.scan import CertificateRecord


def parse_certificate_file(file_path: str, relative_path: str) -> Optional[CertificateRecord]:
    try:
        with open(file_path, "rb") as f:
            cert_data = f.read()

        cert = None
        # Try PEM first
        try:
            cert = x509.load_pem_x509_certificate(cert_data)
        except Exception:
            # Try DER
            try:
                cert = x509.load_der_x509_certificate(cert_data)
            except Exception:
                return None

        # Check for private key file in same directory or embedded
        private_key_detected = False
        if b"PRIVATE KEY" in cert_data:
            private_key_detected = True
        else:
            base_name = os.path.splitext(file_path)[0]
            for ext in [".key", ".pem", ".pk8"]:
                if os.path.exists(base_name + ext) and base_name + ext != file_path:
                    try:
                        with open(base_name + ext, "rb") as kf:
                            if b"PRIVATE KEY" in kf.read():
                                private_key_detected = True
                                break
                    except Exception:
                        pass

        # Public key info
        pub_key = cert.public_key()
        pub_alg = "Unknown"
        key_size: Optional[int] = None
        quantum_impact = "Classical asymmetric public key vulnerable to Shor's algorithm."
        migration_assessment = "Requires migration assessment. Public key vulnerable to quantum factorization/discrete log."

        if isinstance(pub_key, rsa.RSAPublicKey):
            pub_alg = "RSA"
            key_size = pub_key.key_size
            if key_size < 2048:
                migration_assessment = "Critical: RSA key size below 2048 bits is deprecated classically and vulnerable to CRQC."
            else:
                migration_assessment = f"RSA-{key_size} is classically accepted but vulnerable to Shor's algorithm on a quantum computer."
            quantum_impact = "Integer factorization vulnerable to Shor's algorithm."
        elif isinstance(pub_key, ec.EllipticCurvePublicKey):
            pub_alg = f"ECDSA ({pub_key.curve.name})"
            key_size = pub_key.curve.key_size
            migration_assessment = f"Elliptic Curve ({pub_key.curve.name}) is vulnerable to Shor's algorithm for discrete logarithms."
            quantum_impact = "Elliptic curve discrete logarithm broken by Shor's algorithm."
        elif isinstance(pub_key, ed25519.Ed25519PublicKey):
            pub_alg = "Ed25519"
            key_size = 256
            migration_assessment = "Curve25519 signature algorithm vulnerable to Shor's discrete logarithm attack."
            quantum_impact = "Vulnerable to Shor's algorithm."
        elif isinstance(pub_key, ed448.Ed448PublicKey):
            pub_alg = "Ed448"
            key_size = 448
            migration_assessment = "Curve448 signature algorithm vulnerable to Shor's discrete logarithm attack."
            quantum_impact = "Vulnerable to Shor's algorithm."

        # Signature algorithm
        sig_alg_name = cert.signature_algorithm_oid._name if hasattr(cert.signature_algorithm_oid, "_name") else str(cert.signature_algorithm_oid)

        # SANs
        san_list = []
        try:
            san_ext = cert.extensions.get_extension_for_oid(x509.ExtensionOID.SUBJECT_ALTERNATIVE_NAME)
            for name in san_ext.value:
                san_list.append(str(name.value))
        except x509.ExtensionNotFound:
            pass

        # SHA-256 fingerprint
        fingerprint = cert.fingerprint(hashes.SHA256()).hex().upper()
        formatted_fp = ":".join(fingerprint[i:i+2] for i in range(0, len(fingerprint), 2))

        # Check expiration
        import datetime
        now = datetime.datetime.now(datetime.timezone.utc)
        is_expired = cert.not_valid_after_utc < now

        cert_id = f"cert-{hashlib.md5(relative_path.encode()).hexdigest()[:8]}"

        return CertificateRecord(
            id=cert_id,
            file=relative_path,
            subject=cert.subject.rfc4514_string(),
            issuer=cert.issuer.rfc4514_string(),
            valid_from=cert.not_valid_before_utc.strftime("%Y-%m-%d %H:%M:%S UTC"),
            valid_to=cert.not_valid_after_utc.strftime("%Y-%m-%d %H:%M:%S UTC"),
            is_expired=is_expired,
            public_key_algorithm=pub_alg,
            key_size_bits=key_size,
            signature_algorithm=sig_alg_name,
            san_list=san_list,
            fingerprint_sha256=formatted_fp,
            private_key_detected=private_key_detected,
            migration_assessment=migration_assessment,
            quantum_impact=quantum_impact
        )
    except Exception as e:
        print(f"Error parsing certificate {file_path}: {e}")
        return None
