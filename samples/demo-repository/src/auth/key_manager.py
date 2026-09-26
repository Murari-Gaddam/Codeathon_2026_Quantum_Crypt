"""
Authentication Key Management Service.
Handles asymmetric key generation for signing sessions and symmetric key storage.
"""

import os
from Crypto.PublicKey import RSA
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.Random import get_random_bytes


class KeyManager:
    """Manages cryptographic keys for authentication and token issuance."""

    def __init__(self, key_store_path: str = "/tmp/keystore"):
        self.key_store_path = key_store_path
        self._symmetric_master_key = os.getenv("MASTER_ENCRYPTION_KEY", None)

    def generate_symmetric_key(self) -> bytes:
        """Generate a 256-bit AES key for symmetric payload protection."""
        return get_random_bytes(32)

    def encrypt_payload(self, data: bytes, key: bytes) -> tuple:
        """Encrypt payload using AES-256-GCM authenticated cipher."""
        cipher = AES.new(key, AES.MODE_GCM)
        ciphertext, tag = cipher.encrypt_and_digest(data)
        return cipher.nonce, tag, ciphertext

    def decrypt_payload(self, nonce: bytes, tag: bytes, ciphertext: bytes, key: bytes) -> bytes:
        """Decrypt payload using AES-GCM."""
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        return cipher.decrypt_and_verify(ciphertext, tag)

    def generate_signing_keypair(self):
        """
        Generate asymmetric key pair for token issuance.
        Used by authentication-service to produce RS256 JWT tokens.
        Generated keys are formatted as PEM and registered in session context.
        """
        # Key generation parameters: 2048-bit modulus
        # RSA-2048 generation
        private_key = RSA.generate(2048)
        public_key = private_key.publickey()
        return private_key, public_key
