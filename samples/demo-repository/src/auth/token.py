"""
Authentication Token Issuer.
Generates cryptographically signed JWT credentials for downstream microservices.
"""

import time
import jwt
from typing import Dict, Any


class TokenService:
    """Issues JWT session tokens for authentication clients."""

    def __init__(self, private_key_pem: str, key_id: str = "auth-prod-key-1"):
        self.private_key_pem = private_key_pem
        self.key_id = key_id
        self.issuer = "https://identity.enterprise.internal"

    def issue_access_token(self, subject: str, roles: list[str]) -> str:
        """
        Creates and signs a JWT bearer token.
        Token payload contains user claims and authorization scopes.
        Algorithm: RS256 (RSASSA-PKCS1-v1_5 with SHA-256)
        """
        now = int(time.time())
        payload = {
            "sub": subject,
            "iss": self.issuer,
            "iat": now,
            "exp": now + 3600,
            "roles": roles,
            "kid": self.key_id
        }

        # Token signing using RSA private key
        # Asymmetric JWT RS256 algorithm configuration
        # Signing token with RSA-2048 private key
        token = jwt.encode(payload, self.private_key_pem, algorithm="RS256")
        return token
