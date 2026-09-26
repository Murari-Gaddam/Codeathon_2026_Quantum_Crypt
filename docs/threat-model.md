# Threat Model & Security Boundaries

## 1. Untrusted Input Handling

Repositories uploaded or selected for scanning are treated as **untrusted input**.

### Threat Mitigations:
1. **No Code Execution**: Scanners perform static text and AST analysis only. Neither `npm install`, `pip install`, `make`, nor Docker builds are executed during scanning.
2. **Path Traversal Protection (ZipSlip)**: When expanding uploaded archive files, member file paths are strictly canonicalized and validated to ensure they cannot write outside the temporary workspace.
3. **Resource Bounds**: Files exceeding 5MB are safely skipped to avoid memory exhaustion and denial of service.
4. **Isolated Workspaces**: Uploaded archives are unpacked into temporary scratch directories and unconditionally deleted upon scan completion.

## 2. Cryptographic Key Material Protection

1. **Zero Private Key Exposure**: Private keys found in certificates or PEM files are flagged solely as boolean indicators (`private_key_detected: true`). The scanner never reads, logs, stores, or transmits private key parameters.
2. **Demo & Sandbox Isolation**: The sandbox environment generates ephemeral in-memory keys purely for latency, size, and compatibility demonstrations.
3. **No Unvetted Primitives**: All cryptographic mechanisms in the backend and sandbox rely strictly on vetted standard implementations (`cryptography` library / NIST FIPS 203 & 204 parameters).
