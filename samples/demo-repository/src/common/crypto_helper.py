"""
Common Cryptographic Helper Module.
Wraps core cryptographic primitives for application microservices.
Demonstrates indirect crypto usage through application wrapper modules.
"""

import hashlib
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256


class AuthHelper:
    """Application helper wrapper calling underlying crypto libraries."""

    def __init__(self, private_key_pem: bytes):
        self.key = RSA.import_key(private_key_pem)

    def sign(self, message: bytes) -> bytes:
        """
        Signs message payload using PKCS#1 v1.5 with SHA-256.
        Application components call this helper instead of invoking RSA directly.
        """
        hasher = SHA256.new(message)
        signer = pkcs1_15.new(self.key)
        return signer.sign(hasher)

    def compute_legacy_checksum(self, data: bytes) -> str:
        """
        Computes SHA-1 hash for legacy data deduplication.
        Potential migration concern: SHA-1 collision resistance is broken.
        """
        return hashlib.sha1(data).hexdigest()
