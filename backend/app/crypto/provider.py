"""
CryptoProvider interface and abstract base class for crypto-agility.
Allows application code to swap between Classical, Hybrid, and PQC implementations
via pure configuration without modifying application logic.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple


class CryptoProvider(ABC):
    """Abstract crypto-agility provider protocol."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name: classical, hybrid, or pqc."""
        pass

    @property
    @abstractmethod
    def algorithm_name(self) -> str:
        """Cryptographic algorithm identifier."""
        pass

    @abstractmethod
    def sign(self, message: bytes) -> bytes:
        """Signs message bytes and returns signature bytes."""
        pass

    @abstractmethod
    def verify(self, message: bytes, signature: bytes) -> bool:
        """Verifies signature bytes against message bytes."""
        pass

    @abstractmethod
    def get_public_key_bytes(self) -> bytes:
        """Returns serialized public key bytes."""
        pass

    @abstractmethod
    def get_metadata(self) -> Dict[str, Any]:
        """Returns security parameters, sizes, and compatibility guidance."""
        pass
