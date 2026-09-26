"""
Crypto-Agility Sandbox API endpoint.
Demonstrates provider swapping without changing consumer code.
Benchmarks key size, signature size, timing, and compatibility.
"""

import time
import base64
from fastapi import APIRouter, HTTPException
from app.schemas.scan import SandboxTestRequest, SandboxTestResponse
from app.crypto.classical import ClassicalProvider
from app.crypto.hybrid import HybridProvider
from app.crypto.pqc import PQCCapableProvider


router = APIRouter(prefix="/api/sandbox", tags=["sandbox"])


@router.post("/test", response_model=SandboxTestResponse)
async def test_crypto_provider(req: SandboxTestRequest):
    provider_name = req.provider.lower()
    msg_bytes = req.message.encode("utf-8")

    # Instantiate provider based on configuration
    if provider_name == "classical":
        provider = ClassicalProvider(algorithm=req.algorithm)
    elif provider_name == "hybrid":
        provider = HybridProvider(algorithm=req.algorithm or "Composite-ECDSA-MLDSA")
    elif provider_name in ["pqc", "pqc-capable"]:
        provider = PQCCapableProvider(algorithm=req.algorithm or "ML-DSA-65")
    else:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {req.provider}")

    meta = provider.get_metadata()
    start_time = time.perf_counter()

    try:
        # Perform operation: sign & verify
        signature = provider.sign(msg_bytes)
        is_verified = provider.verify(msg_bytes, signature)
        execution_time_ms = round((time.perf_counter() - start_time) * 1000, 3)

        if not is_verified:
            raise ValueError("Signature verification failed internal check.")

        pub_key_bytes = provider.get_public_key_bytes()

        # Build preview string
        sig_preview = base64.b64encode(signature[:32]).decode("ascii") + "..." if len(signature) > 32 else base64.b64encode(signature).decode("ascii")
        pub_preview = pub_key_bytes[:60].decode("ascii", errors="replace") + "..."

        return SandboxTestResponse(
            provider=provider.name,
            algorithm=provider.algorithm_name,
            operation=req.operation,
            status="success",
            execution_time_ms=execution_time_ms,
            message=req.message,
            signature_or_cipher_preview=sig_preview,
            public_key_preview=pub_preview,
            key_size_bytes=len(pub_key_bytes),
            signature_or_ciphertext_size_bytes=len(signature),
            is_quantum_resistant=meta["is_quantum_resistant"],
            compatibility_notes=meta["compatibility_notes"],
            interoperability_summary=meta["interoperability_summary"],
            rollback_strategy=meta["rollback_strategy"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Provider test execution error: {str(e)}")
