# PQC Migration & Crypto-Agility Scanner
 
> Inventory cryptography. Map dependencies. Plan migration. Test crypto-agility.
 
A security engineering platform that scans a repository, its configuration, dependency manifests, and certificates to identify cryptographic mechanisms and protocol dependencies that may need attention during a transition to post-quantum cryptography (PQC).
 
**This tool does not claim to prove a system is quantum-safe.** It is an inventory, dependency-mapping, migration-planning, and crypto-agility demonstration tool — not a vulnerability scanner, not a quantum-safety certifier, and not a replacement for a formal security audit.
 
---
 
## What it does
 
Cryptography in a real system is scattered across application code, config files, certificates, dependencies, and network protocols. This tool helps answer:
 
- Where is cryptography used, and in which algorithms, key sizes, libraries, and protocols?
- Which application components depend on it?
- Which findings are confirmed vs. uncertain?
- What should be reviewed first, and what testing/compatibility work does it need?
- Can the crypto implementation be swapped out through a configurable provider interface?
**Who it's for:** security engineers, application developers, DevSecOps/platform engineers, and students or researchers exploring PQC migration concepts.
 
## Communication principle
 
The product intentionally avoids alarmist or overconfident language. It never says things like *"this system is quantum-safe"* or *"replace every RSA key immediately."* Instead it uses calibrated language: **Confirmed static finding**, **Potential migration concern**, **Requires assessment**, **Scan coverage is incomplete**. Detection is kept separate from judgment — the tool preserves evidence and lets a human decide what it means.
 
## User flow
 
```
Upload / select repository → Run scan → Review findings → Inspect evidence
→ Explore dependencies → Review migration checklist → Test provider config in sandbox → Export report
```
 
---
 
## Core features
 
- **Repository scanner** — Python, JavaScript, TypeScript, Java, Go, JSON, YAML, TOML, XML, `.env` samples, Dockerfiles, dependency manifests, and server config; built to be extensible to more languages.
- **Cryptographic inventory** — detects algorithms, key sizes, hash functions, signatures, key exchange, certificates, TLS/SSH references, and JWT/JWS algorithms (RSA, ECDSA, ECDH, DH, DSA, AES, 3DES, SHA family, Ed25519/Ed448, TLS versions, RS256/ES256/PS256, etc.).
- **Evidence-backed findings** — every finding records file, line, column, mechanism, snippet, detection rule, confidence, and usage category.
- **Configuration & certificate scanning** — TLS versions, cipher suites, cert/key paths, JWT/SSH config, and full certificate metadata (subject, issuer, validity, public-key algorithm/size, SANs, fingerprint) — private key material is never exposed.
- **Dependency mapping** — links mechanisms to the services that use them (e.g. `Auth service → JWT → RS256 → RSA-2048`).
- **Confidence classification** — every finding is labeled Confirmed / Likely / Possible / Unknown, since a text match is never treated as proof of runtime behavior.
- **Migration checklist** — auto-generated, prioritized by cryptographic role, key size, protocol dependency, exposure, confidence, and complexity, with the reasoning shown in the UI.
- **Reporting** — JSON, HTML, and optional PDF exports, always including a limitations section.
## Bonus features
 
- **Indirect crypto detection** — traces usage hidden behind wrapper functions, helper modules, and framework APIs, clearly distinguishing *direct evidence* from *inferred dependency*.
- **Hybrid deployment modeling** — classical / classical+PQC-hybrid / PQC-capable, focused on interoperability trade-offs rather than declaring one architecture universally correct.
- **CI integration** — a GitHub Actions workflow that scans pull requests, diffs against a baseline, and warns/fails according to a configurable policy (not a hard-coded fail-on-everything rule).
- **Migration graph** — a visual workflow (Discovered → Reviewed → Migration planned → Test environment → Compatibility validated → Production candidate → Completed) representing process state, not a security claim.
- **Crypto-agility sandbox** — a `CryptoProvider` interface with swappable classical / PQC / hybrid providers (via vetted libraries only — no custom crypto primitives) to demonstrate agility live.
---
 
## Tech stack
 
| Layer | Choices |
|---|---|
| Frontend | React, TypeScript, Vite, `@fluentui/react-components`, Cytoscape.js (dependency graph) |
| Backend | Python, FastAPI, Pydantic, SQLite |
| Scanning | Python AST + Tree-sitter for structured parsing, rule/regex engine for config & text evidence |
| Certificates | `cryptography` / OpenSSL (no custom X.509/ASN.1 parsing) |
| Reports | JSON, HTML, optional PDF |
| CI | GitHub Actions |
 
**Design system:** Fluent 2 (Microsoft-style enterprise UI) — token-driven light/dark themes, Segoe UI typography, semantic status colors, no neon/glassmorphism/decorative styling.
 
## Architecture
 
```
FastAPI: Scan / Findings / Dependency / Certificate / Migration / Sandbox / Report APIs
        → Application services
        → Scanner engine + Rule engine
        → Normalized findings → Dependency mapper → Migration planner
        → SQLite
```
 
Detection, classification, dependency analysis, migration planning, and validation are kept as **separate layers** — a detected algorithm (e.g. RSA) never automatically implies a migration verdict; the analysis layer adds that context on top of preserved evidence.
 
## Project structure
 
```
pqc-migration-scanner/
├── frontend/        # React + Fluent UI app (overview, findings, dependencies, certs, migration, sandbox, reports)
├── backend/         # FastAPI app: api/, models/, scanner/, analysis/, crypto/, reports/
├── rules/           # algorithms.json, libraries.json, protocols.json, policies.json
├── samples/         # demo-repository/ (no real secrets)
├── tests/           # scanner, analysis, api, frontend tests
├── .github/workflows/crypto-policy.yml
└── docs/            # architecture.md, threat-model.md
```
 
## API
 
```
POST   /api/scans
GET    /api/scans
GET    /api/scans/{id}
GET    /api/scans/{id}/findings
GET    /api/scans/{id}/dependencies
GET    /api/scans/{id}/certificates
GET    /api/scans/{id}/migration
GET    /api/scans/{id}/report
POST   /api/sandbox/test
GET    /api/rules
GET    /api/health
```
 
---
 
## Known limitations
 
The tool is explicit — in-app and in every report — about what it can't do:
 
- Static analysis can miss runtime-generated or reflection/dynamic-import-based cryptography.
- Native libraries and overridable runtime config may not be fully visible.
- A certificate inventory doesn't reveal every cryptographic operation in the system.
- A detected algorithm isn't automatically insecure in every context, and absence of a finding doesn't prove absence of usage.
- It does **not** prove quantum safety and does **not** replace a formal security assessment.
- Migration recommendations still require validation in the target environment.
## What this is not
 
A quantum computer simulator · a proof of quantum safety · a replacement for a security audit · a custom cryptography library · a scanner that declares every classical algorithm unsafe · a production key-management system.
 
## Quality bar / acceptance criteria (summary)
 
- Full scan pipeline: repo → source/config/dependency/certificate scanning → evidence-backed findings with confidence levels → dependency mapping → migration checklist → exportable report.
- Crypto-agility sandbox with a real, config-driven provider interface (vetted libraries only).
- CI can detect new/changed cryptographic findings against a baseline.
- Accessible, responsive UI with light/dark mode and keyboard navigation.
- No private keys, secrets, or arbitrary code execution — uploaded repositories are treated as untrusted input.
---
 
## Status
 
This README reflects the product specification used to guide implementation. See `docs/architecture.md` and `docs/threat-model.md` for deeper design detail as the project develops.
