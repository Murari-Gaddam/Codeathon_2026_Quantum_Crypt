"""
Classical Cryptographic Provider.
Implements standard RSA-PSS and ECDSA P-256 using vetted Python cryptography library.
"""

from typing import Dict, Any
from cryptography.hazmat.primitives.asymmetric import rsa, ec, padding
from cryptography.hazmat.primitives import hashes, serialization
from app.crypto.provider import CryptoProvider


class ClassicalProvider(CryptoProvider):
    def __init__(self, algorithm: str = "RSA-2048"):
        self._alg = algorithm
        self._key_size = 2048

        if "2048" in algorithm:
            self._key_size = 2048
            self._rsa_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
            self._ec_key = None
        elif "4096" in algorithm:
            self._key_size = 4096
            self._rsa_key = rsa.generate_private_key(public_exponent=65537, key_size=4096)
            self._ec_key = None
        elif "ECDSA" in algorithm or "P-256" in algorithm:
            self._key_size = 256
            self._rsa_key = None
            self._ec_key = ec.generate_private_key(ec.SECP256R1())
        else:
            self._key_size = 2048
            self._rsa_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
            self._ec_key = None

    @property
    def name(self) -> str:
        return "classical"

    @property
    def algorithm_name(self) -> str:
        return self._alg

    def sign(self, message: bytes) -> bytes:
        if self._rsa_key:
            return self._rsa_key.sign(
                message,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
        elif self._ec_key:
            return self._ec_key.sign(message, ec.ECDSA(hashes.SHA256()))
        raise ValueError("Uninitialized classical key")

    def verify(self, message: bytes, signature: bytes) -> bool:
        try:
            if self._rsa_key:
                self._rsa_key.public_key().verify(
                    signature,
                    message,
                    padding.PSS(
                        mgf=padding.MGF1(hashes.SHA256()),
                        salt_length=padding.PSS.MAX_LENGTH
                    ),
                    hashes.SHA256()
                )
                return True
            elif self._ec_key:
                self._ec_key.public_key().verify(
                    signature,
                    message,
                    ec.ECDSA(hashes.SHA256())
                )
                return True
        except Exception:
            return False
        return False

    def get_public_key_bytes(self) -> bytes:
        if self._rsa_key:
            return self._rsa_key.public_key().public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
        elif self._ec_key:
            return self._ec_key.public_key().public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
        return b""

    def get_metadata(self) -> Dict[str, Any]:
        return {
            "provider": "classical",
            "algorithm": self._alg,
            "key_size_bits": self._key_size,
            "signature_size_bytes": 256 if self._rsa_key else 64,
            "is_quantum_resistant": False,
            "compatibility_notes": [
                "Universal compatibility across all operating systems and browsers",
                "Supported by hardware crypto modules (HSM, TPM 2.0)",
                "Vulnerable to Shor's algorithm on a Cryptanalytically Relevant Quantum Computer (CRQC)"
            ],
            "interoperability_summary": "Legacy standard baseline. No special PQC headers or extensions required.",
            "rollback_strategy": "Serves as the ultimate fallback in hybrid deployment failure modes."
        }
