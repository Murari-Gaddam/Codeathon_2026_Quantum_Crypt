# PQC Migration & Crypto-Agility Scanner
<<<<<<< HEAD

## Antigravity Project Specification

A security engineering platform that scans a sample repository, service configuration, dependency manifests, and certificate inventory to identify cryptographic mechanisms and protocol dependencies that may need attention during a transition to post-quantum cryptography (PQC).

The product must **not** claim that a scan proves a system is quantum-safe. It is an inventory, dependency-mapping, migration-planning, and crypto-agility demonstration tool.

---

# 1. Project Overview

## Project name

**PQC Migration & Crypto-Agility Scanner**

Suggested product label in the UI:

**PQC Migration Scanner**

Short description:

> Inventory cryptography. Map dependencies. Plan migration. Test crypto-agility.

## Problem being solved

Organizations can have cryptographic mechanisms spread across application code, configuration files, certificates, dependencies, authentication systems, and network protocols.

The project helps a developer or security engineer answer:

- Where is cryptography being used?
- Which algorithms, key sizes, libraries, certificates, and protocols are involved?
- Which application components depend on them?
- Which findings are confirmed and which are uncertain?
- What should be reviewed first?
- What compatibility and testing work is required?
- Can the application's crypto implementation be changed through a configurable provider interface?

## Important security communication rule

The scanner must never display language such as:

- "This system is quantum-safe."
- "This scan proves the system is quantum-safe."
- "RSA found = system is vulnerable."
- "Replace every RSA key immediately."

Instead, use language such as:

- "Cryptographic mechanism detected."
- "Potential migration concern."
- "Requires assessment."
- "Confirmed static finding."
- "Possible match."
- "Compatibility review required."
- "Scan coverage is incomplete."

---

# 2. Users

Primary users:

1. Security engineers
2. Application developers
3. DevSecOps engineers
4. Platform/infrastructure engineers
5. Security students and researchers demonstrating migration concepts

Secondary users:

- Technical leads
- Architects
- Auditors reviewing an inventory
- Engineering teams preparing a migration plan

The interface should assume that the user understands software/security basics but should not require specialist PQC knowledge to understand the findings.

---

# 3. Main User Goal

The main user goal is:

> Scan a codebase and quickly understand where cryptography is used, what depends on it, what needs review, and how to validate a migration.

Primary flow:

```text
Upload / select repository
        ↓
Run scan
        ↓
Review findings
        ↓
Inspect evidence
        ↓
Explore dependencies
        ↓
Review migration checklist
        ↓
Test provider configuration in sandbox
        ↓
Export report
```

---

# 4. Core Features

## Required features

### 4.1 Repository scanner

Scan:

- Python
- JavaScript
- TypeScript
- Java
- Go
- JSON
- YAML/YAML
- TOML
- XML
- `.env` samples
- Dockerfiles
- dependency manifests
- server configuration
- certificate files

The scanner should be extensible so additional languages can be added later.

### 4.2 Cryptographic inventory

Detect, where evidence exists:

- Algorithms
- Key sizes
- Hash functions
- Digital signatures
- Key exchange mechanisms
- Certificates
- TLS references
- SSH references
- JWT/JWS algorithms
- Cryptographic libraries
- Package/dependency references
- Configuration references

Initial algorithm coverage should include representative mechanisms such as:

- RSA
- ECDSA
- ECDH
- DH
- DSA
- AES
- 3DES
- SHA-1
- SHA-256
- SHA-384
- SHA-512
- Ed25519
- Ed448
- TLS versions
- JWT algorithms such as RS256, ES256, PS256

PQC algorithms must be represented as migration/provider options only when supported by vetted libraries and the chosen implementation. Do not implement cryptographic algorithms from scratch.

### 4.3 Evidence

Every finding should contain, when available:

```text
File
Line
Column
Detected mechanism
Evidence snippet
Detection rule
Confidence
Usage category
```

Example:

```text
RSA-2048
src/auth/key_manager.py:42

Evidence:
private_key = RSA.generate(2048)

Confidence:
Confirmed

Usage:
Asymmetric key generation
```

### 4.4 Configuration scanner

Inspect configuration for:

- TLS versions
- Cipher suites
- Certificate paths
- Key paths
- Signature algorithms
- JWT configuration
- SSH configuration
- Crypto provider configuration
- Environment-variable references
- Library configuration

### 4.5 Certificate inventory

Parse certificate metadata using established certificate libraries/tools.

Record:

- Subject
- Issuer
- Validity period
- Public-key algorithm
- Public-key size/parameters where available
- Signature algorithm
- SANs
- Fingerprint
- File location

Never expose private key material in the report.

### 4.6 Dependency inventory

Map cryptographic mechanisms to application components.

Example:

```text
Authentication service
        ↓
JWT
        ↓
RS256
        ↓
RSA-2048
```

Another example:

```text
API gateway
        ↓
TLS
        ↓
server certificate
        ↓
ECDSA P-256
```

### 4.7 Finding classification

Use clear categories:

- Confirmed
- Likely
- Possible
- Unknown / needs review

Do not treat a text match as proof of actual runtime usage.

### 4.8 Migration checklist

Generate a checklist from the inventory.

Each item should contain:

```text
Priority
Component
Finding
Reason for review
Dependencies
Suggested investigation
Compatibility concerns
Validation gate
Status
```

Priority should be based on documented project rules such as:

- cryptographic role
- algorithm category
- key size
- protocol dependency
- exposure
- confidence
- dependency fan-out
- migration complexity

The UI must explain why a priority was assigned.

### 4.9 Report generation

Generate:

- JSON report
- HTML report
- Optional PDF report

The report must contain a limitations section.

---

# 5. Bonus Features

## 5.1 Indirect crypto detection

Detect crypto usage hidden behind:

- wrapper functions
- helper modules
- imported packages
- dependency manifests
- configuration aliases
- common framework APIs

Example:

```text
Application
    ↓
AuthHelper.sign()
    ↓
JWT library
    ↓
RS256
    ↓
RSA
```

The scanner should distinguish:

```text
Direct evidence
```

from:

```text
Inferred dependency
```

Inference must never be presented as confirmed runtime behavior.

## 5.2 Hybrid deployment model

Provide a high-level model for:

```text
Classical
Classical + PQC hybrid
PQC-capable
```

The product should focus on interoperability questions rather than declaring an algorithm or architecture universally correct.

Example concerns:

- Client support
- Server support
- Library support
- Protocol negotiation
- Certificate compatibility
- Message-size changes
- Performance
- Key-management changes
- Rollback strategy

## 5.3 CI integration

Add a GitHub Actions workflow.

Example policy:

```text
Pull request
    ↓
Crypto scanner
    ↓
Compare against baseline
    ↓
New crypto dependency?
    ↓
Deprecated configuration?
    ↓
Fail / warn according to policy
```

Example output:

```text
Crypto policy check

New finding:
RS256 usage detected in auth/token.py:38

Policy:
Review required

CI status:
WARNING
```

The CI system should support configurable policies instead of hard-coding failure for every finding.

## 5.4 Migration graph

Display:

```text
Component
   ↓
Library
   ↓
Protocol
   ↓
Cryptographic mechanism
   ↓
Certificate / key
   ↓
Migration validation gate
```

Suggested graph states:

- Discovered
- Reviewed
- Migration planned
- Test environment
- Compatibility validated
- Production candidate
- Completed

These are workflow states, not claims about security status.

---

# 6. Visual Design

## Design direction

**Fluent 2 / Microsoft-style enterprise security application**

Style:

- Professional
- Clean
- Modern
- Corporate
- Technical
- Information-dense but not crowded
- Subtle
- Trustworthy
- Developer-tool oriented

Do not make it look like a generic cybersecurity dashboard.

Avoid:

- Neon green hacker aesthetics
- Huge gradient blobs
- Excessive glassmorphism
- Random glowing borders
- Excessive rounded cards
- Giant hero sections
- Decorative 3D graphics
- Unnecessary animations
- Repetitive card grids
- Excessive shadows

The interface should feel like a serious engineering tool.

Fluent 2 uses neutral, shared, and brand palettes and recommends semantic colors for status information. Use the Fluent token system rather than scattering hard-coded colors throughout the UI.

---

# 7. Fluent Theme

Use the official Fluent UI React component system.

Preferred frontend library:

```text
@fluentui/react-components
```

Use:

```tsx
<FluentProvider theme={webLightTheme}>
```

and:

```tsx
<FluentProvider theme={webDarkTheme}>
```

The theme must be token-driven.

Do not manually recreate Fluent components if an existing Fluent component is suitable.

Use Fluent components for:

- Buttons
- Inputs
- Tabs
- Navigation
- Dialogs
- Tooltips
- Badges
- Tables
- Menus
- Cards
- Toasts
- Dropdowns
- Switches
- Progress indicators

---

# 8. Microsoft / Fluent Color System

Primary UI color direction:

**Fluent blue**

Use Fluent brand tokens as the primary accent.

Recommended semantic mapping:

| Role | Fluent direction |
|---|---|
| Primary action | Brand |
| Links | Brand foreground |
| Selected navigation | Brand |
| Confirmed / healthy | Success |
| Review / attention | Warning |
| Critical / error | Danger |
| Informational | Brand / neutral |
| Main background | Neutral background |
| Surface | Neutral background |
| Border | Neutral stroke |
| Main text | Neutral foreground |
| Secondary text | Neutral foreground 2 |

Do not use semantic status colors as decoration.

Status should also include text/icons so meaning is not communicated by color alone.

If raw fallback values are required outside Fluent tokens, use the project's centralized theme file. Never place arbitrary color values inside individual components.

---

# 9. Typography

Use:

```css
font-family:
  "Segoe UI",
  "Segoe UI Variable",
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  sans-serif;
```

For code/evidence:

```css
font-family:
  "Cascadia Code",
  "Cascadia Mono",
  Consolas,
  monospace;
```

Use Fluent's web type ramp.

Recommended product mapping:

| UI role | Size | Weight |
|---|---:|---|
| Display | 40px | Semibold |
| Page title | 32px | Semibold |
| Section title | 24px | Semibold |
| Subsection | 20px | Semibold |
| Body | 14px | Regular |
| Body strong | 14px | Semibold |
| Caption | 12px | Regular |
| Code | 13–14px | Regular |

Avoid all-caps headings.

Use sentence case.

Keep text left aligned unless there is a clear reason not to.

---

# 10. UI Complexity

Complexity level:

**4 / 5 — Advanced**

Reason:

This is an engineering/security analysis application with:

- tables
- filters
- graphs
- code evidence
- dependency relationships
- reports
- configuration
- scan history
- sandbox controls

However, complexity must come from useful functionality rather than decoration.

---

# 11. Main Application Layout

Desktop:

```text
┌─────────────────────────────────────────────────────────────┐
│ Logo / Product name                  Search   Theme  User  │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│ Overview     │              Main content                    │
│ Findings     │                                              │
│ Dependencies │                                              │
│ Certificates│                                              │
│ Migration    │                                              │
│ Sandbox      │                                              │
│ Reports      │                                              │
│ Settings     │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

Use a compact Fluent navigation rail/sidebar.

Do not overload the sidebar.

Mobile:

```text
Top bar
   ↓
Page content
   ↓
Bottom / menu navigation
```

Tables should become scrollable or transform into stacked detail views.

---

# 12. Main Screens

## 12.1 Overview

Show:

- Last scan
- Files scanned
- Findings
- Confirmed findings
- Possible findings
- Algorithms detected
- Certificates
- Dependencies
- Migration items
- New findings since baseline

Primary action:

**Scan repository**

Secondary actions:

- View findings
- View migration plan
- Export report

Avoid turning the overview into a wall of KPI cards.

---

## 12.2 Findings

Table columns:

```text
Confidence
Mechanism
Usage
Component
File
Line
Concern
Status
```

Filters:

- Confidence
- Algorithm
- Language
- File
- Component
- Protocol
- Certificate
- Status
- Priority

Clicking a finding opens a detail panel.

---

# 13. Finding Detail

Example:

```text
RSA-2048

Confirmed finding

Authentication service

Evidence
────────────────────────────────
src/auth/key_manager.py:42

private_key = RSA.generate(2048)
────────────────────────────────

Usage
Asymmetric key generation

Dependencies
Authentication service
JWT service

Related protocol
JWT / RS256

Migration consideration
Requires assessment

Validation gates
□ Library compatibility
□ Consumer compatibility
□ Key-management review
□ Interoperability testing
□ Performance testing
```

Include a clear note:

> Detection indicates cryptographic inventory evidence. It does not establish that the system is quantum-safe or that a migration is required in every deployment context.

---

# 14. Dependency Graph

Use an interactive graph.

Preferred library:

```text
Cytoscape.js
```

Nodes:

- Application
- Service
- Library
- Protocol
- Algorithm
- Key
- Certificate

Edges:

- imports
- depends-on
- configured-with
- uses
- signs-with
- verifies-with
- protected-by

Interactions:

- click node
- highlight dependencies
- filter by type
- zoom
- pan
- reset
- show path

Do not make the graph the only way to understand dependencies. Every relationship must also be available as accessible text/table data.

---

# 15. Migration Planner

Main view:

```text
Migration plan

1. Review authentication crypto
2. Review certificate inventory
3. Check protocol/library compatibility
4. Identify consumers
5. Create test configuration
6. Test classical + PQC/hybrid options
7. Validate interoperability
8. Measure performance
9. Prepare rollback
10. Update production configuration
```

Each item has:

```text
Owner
Status
Dependencies
Evidence
Validation gate
Notes
```

Possible statuses:

- Not started
- Investigating
- In testing
- Blocked
- Ready for review
- Completed

---

# 16. Crypto-Agility Sandbox

The sandbox is a demonstration environment.

It must not implement custom cryptographic primitives.

Use vetted libraries.

Architecture:

```text
Application
     ↓
CryptoProvider interface
     ↓
┌───────────────┬────────────────┬───────────────┐
│ Classical     │ PQC-capable    │ Hybrid        │
│ Provider      │ Provider       │ Provider       │
└───────────────┴────────────────┴───────────────┘
```

Example interface:

```python
class CryptoProvider(Protocol):
    def sign(self, message: bytes) -> bytes:
        ...

    def verify(
        self,
        message: bytes,
        signature: bytes
    ) -> bool:
        ...
```

Provider selection should be configuration-driven:

```json
{
  "provider": "classical",
  "algorithm": "rsa"
}
```

or:

```json
{
  "provider": "hybrid"
}
```

The application layer should not need to know which implementation is selected.

The sandbox must be isolated from production secrets and real private keys.

---

# 17. Security Rules

Never:

- Generate or store real user private keys.
- Upload private keys to the server.
- Log private key material.
- Commit secrets.
- Store API keys in frontend code.
- Execute arbitrary uploaded code.
- Treat uploaded repositories as trusted.
- Execute package installation from a scanned repository automatically.

Repository scanning must be treated as processing untrusted input.

Recommended isolation:

```text
Upload
  ↓
Temporary workspace
  ↓
Sandboxed scanner process
  ↓
Resource limits
  ↓
Read-only scan where possible
  ↓
Structured findings
  ↓
Delete temporary workspace
```

Do not execute repository code just to inspect it.

---

# 18. Technical Stack

## Frontend

```text
React
TypeScript
Vite
@fluentui/react-components
Cytoscape.js
```

Reason:

- Strong component model
- Good TypeScript support
- Fast development
- Fluent UI integration
- Suitable for an interactive security dashboard

## Backend

```text
Python
FastAPI
Pydantic
SQLite
```

Reason:

Python is well suited to static analysis, certificate parsing, dependency inspection, and security tooling.

## Scanner

Initial:

```text
Python AST
Tree-sitter where multi-language parsing is required
Regex/rule engine for configuration and text evidence
```

Do not depend on regex alone for source-code analysis when structured parsing is practical.

## Certificate parsing

Use established libraries/tools such as:

```text
cryptography
OpenSSL
```

Do not write ASN.1/X.509 parsing from scratch.

## Reports

```text
JSON
HTML
PDF (optional)
```

## CI

```text
GitHub Actions
```

---

# 19. Backend Architecture

```text
FastAPI
   │
   ├── Scan API
   │
   ├── Findings API
   │
   ├── Dependency API
   │
   ├── Certificate API
   │
   ├── Migration API
   │
   ├── Sandbox API
   │
   └── Report API
            │
            ↓
        Application services
            │
     ┌──────┴────────┐
     ↓               ↓
 Scanner engine   Rule engine
     │               │
     └──────┬────────┘
            ↓
      Normalized findings
            ↓
      Dependency mapper
            ↓
      Migration planner
            ↓
           SQLite
```

---

# 20. Suggested Project Structure

```text
pqc-migration-scanner/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   │   ├── overview/
│   │   │   ├── findings/
│   │   │   ├── dependencies/
│   │   │   ├── certificates/
│   │   │   ├── migration/
│   │   │   ├── sandbox/
│   │   │   └── reports/
│   │   ├── theme/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── scanner/
│   │   │   ├── code/
│   │   │   ├── config/
│   │   │   ├── certificates/
│   │   │   └── dependencies/
│   │   ├── analysis/
│   │   │   ├── classifier.py
│   │   │   ├── dependency_mapper.py
│   │   │   └── migration_planner.py
│   │   ├── crypto/
│   │   │   ├── provider.py
│   │   │   ├── classical.py
│   │   │   ├── pqc.py
│   │   │   └── hybrid.py
│   │   └── reports/
│   └── requirements.txt
│
├── rules/
│   ├── algorithms.json
│   ├── libraries.json
│   ├── protocols.json
│   └── policies.json
│
├── samples/
│   └── demo-repository/
│
├── tests/
│   ├── scanner/
│   ├── analysis/
│   ├── api/
│   └── frontend/
│
├── .github/
│   └── workflows/
│       └── crypto-policy.yml
│
├── docs/
│   ├── architecture.md
│   └── threat-model.md
│
├── README.md
└── .gitignore
```

---

# 21. Data Model

## Finding

```json
{
  "id": "finding-001",
  "mechanism": "RSA",
  "algorithm_variant": "RSA-2048",
  "category": "asymmetric",
  "usage": "key_generation",
  "confidence": "confirmed",
  "file": "src/auth/key_manager.py",
  "line": 42,
  "column": 18,
  "evidence": "RSA.generate(2048)",
  "component": "authentication-service",
  "protocol": "JWT",
  "status": "needs-review"
}
```

## Dependency

```json
{
  "source": "authentication-service",
  "relationship": "uses",
  "target": "RSA-2048",
  "evidence": [
    "src/auth/key_manager.py:42"
  ],
  "confidence": "confirmed"
}
```

## Certificate

```json
{
  "file": "certificates/server.pem",
  "subject": "example.internal",
  "issuer": "Example CA",
  "public_key_algorithm": "ECDSA",
  "signature_algorithm": "SHA256withECDSA",
  "fingerprint": "...",
  "private_key_detected": false
}
```

---

# 22. Rule Engine

Rules should be data-driven.

Example:

```json
{
  "id": "rsa-key-generation",
  "language": "python",
  "patterns": [
    "RSA.generate"
  ],
  "mechanism": "RSA",
  "usage": "key_generation",
  "confidence": "confirmed",
  "evidence_required": true
}
```

A second rule may represent an uncertain text match:

```json
{
  "id": "rsa-text-reference",
  "patterns": [
    "RSA"
  ],
  "mechanism": "RSA",
  "confidence": "possible",
  "evidence_required": true
}
```

This prevents the system from treating every string match as real crypto usage.

---

# 23. Scan Pipeline

```text
1. Receive repository
2. Validate archive/path
3. Create isolated temporary workspace
4. Enumerate supported files
5. Detect languages
6. Parse source files
7. Scan configuration
8. Inspect dependency manifests
9. Parse certificates
10. Normalize findings
11. Assign confidence
12. Map dependencies
13. Generate migration items
14. Store scan result
15. Render dashboard
16. Export report
```

---

# 24. Confidence Model

Use evidence-based confidence.

### Confirmed

The scanner found a structured or highly specific match showing actual cryptographic API/configuration usage.

### Likely

Strong evidence exists but runtime behavior cannot be established statically.

### Possible

A pattern or symbol matches, but it may be unrelated.

### Unknown

The scanner has insufficient evidence.

Never silently convert:

```text
Possible → Confirmed
```

---

# 25. Migration Planning Model

Migration planning should consider:

```text
Finding
  +
Usage
  +
Dependencies
  +
Protocol
  +
Certificate
  +
Library support
  +
Compatibility
  +
Testing requirements
```

Example:

```text
RSA-2048
   ↓
JWT signing
   ↓
5 services consume token
   ↓
Check all token consumers
   ↓
Check library/provider support
   ↓
Test interoperability
   ↓
Test rollback
```

Dependency fan-out should be visible because changing a shared mechanism may affect multiple components.

---

# 26. Compatibility Risks

The report should consider:

- Unsupported algorithms
- Older clients
- Older libraries
- Protocol negotiation
- Certificate support
- Key-management systems
- Token consumers
- Message-size changes
- Performance changes
- Hardware acceleration
- Configuration differences
- Rollback requirements
- Test environment differences

These are review points, not automatic conclusions.

---

# 27. Validation Gates

Every migration item should be connected to validation gates.

Example:

```text
Gate 1
Inventory complete
      ↓
Gate 2
Library/provider compatibility
      ↓
Gate 3
Unit/integration tests
      ↓
Gate 4
Interoperability tests
      ↓
Gate 5
Performance tests
      ↓
Gate 6
Security/configuration review
      ↓
Gate 7
Rollback test
      ↓
Gate 8
Production readiness review
```

---

# 28. Sandbox UX

The sandbox should have:

```text
Provider
[ Classical ▼ ]

Algorithm
[ RSA ▼ ]

Message
[ Hello PQC ]

Run test

Result
✓ Operation completed

Provider
Classical

Algorithm
RSA

Execution time
...

Compatibility notes
...
```

If a hybrid/PQC provider is available through a vetted library:

```text
Provider
[ Hybrid ▼ ]
```

The UI should clearly label the sandbox as a demonstration environment.

---

# 29. Reports

Report structure:

```text
Executive summary
↓
Scan scope
↓
Coverage
↓
Cryptographic inventory
↓
Findings
↓
Dependency inventory
↓
Certificates
↓
Migration checklist
↓
Compatibility risks
↓
Validation plan
↓
Limitations
```

The report must clearly distinguish:

```text
Observed evidence
```

from:

```text
Inference
```

and:

```text
Recommended investigation
```

---

# 30. Limitations

The report must explicitly state that:

- Static analysis can miss runtime-generated cryptography.
- Reflection and dynamic imports can hide usage.
- Native libraries may not be fully visible.
- Indirect dependencies may require package/dependency analysis.
- Configuration can be overridden at runtime.
- A certificate inventory does not reveal every cryptographic operation.
- A detected algorithm does not automatically mean it is insecure in every context.
- Absence of a finding does not prove absence of cryptographic usage.
- The scanner does not prove quantum safety.
- The scanner does not replace a formal security assessment.
- Migration recommendations require validation in the target environment.

---

# 31. Responsive Design

Required:

- Mobile
- Tablet
- Laptop
- Desktop
- Large screens

Desktop is the primary experience because this is a developer/security tool.

Mobile must remain usable for:

- scan status
- findings summary
- finding details
- migration checklist
- reports

Large tables should use intentional horizontal scrolling or a responsive alternative.

Do not simply shrink desktop UI.

---

# 32. Light and Dark Mode

Both modes are required.

Use Fluent theme tokens.

The theme toggle should:

- switch immediately
- preserve user preference
- respect system preference initially
- maintain readable charts
- maintain readable code blocks
- preserve focus visibility
- maintain status-color contrast

Do not implement dark mode as:

```css
background: black;
color: white;
```

Every surface and semantic state should use the appropriate theme token.

---

# 33. Accessibility

Target:

**WCAG 2.2 AA-level practices where applicable.**

Requirements:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Accessible names
- Labels
- Tooltips where useful
- Screen-reader-friendly status updates
- Color contrast
- Non-color status indicators
- Reduced motion
- Accessible tables
- Accessible graph alternative
- Logical heading order

Use Fluent's accessibility patterns rather than inventing custom interaction behavior.

---

# 34. Animation

Motion level:

**2 / 5 — Subtle**

Use motion for:

- Page transitions
- Panel expansion
- Filter changes
- Scan progress
- Graph focus
- Toasts
- Loading states

Avoid:

- Constant animation
- Floating elements
- Decorative particles
- Large parallax
- Glowing effects

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

---

# 35. Navigation

Primary navigation:

```text
Overview
Findings
Dependencies
Certificates
Migration
Sandbox
Reports
Settings
```

Optional top-level scan action:

**New scan**

Global utilities:

- Search
- Theme
- Help
- Scan status

---

# 36. Search

Global search should support:

- Algorithm
- File
- Component
- Finding ID
- Certificate
- Protocol
- Library

Example:

```text
Search: RSA-2048
```

Results:

```text
3 findings
2 components
1 certificate
```

---

# 37. Real-World UI States

Implement:

### Loading

```text
Scanning repository...
42% complete
```

### Empty

```text
No cryptographic findings

Run a scan or change your filters.
```

### Error

```text
Scan could not be completed

Reason:
Unsupported archive or unreadable file.

Action:
Try another repository
```

### Success

```text
Scan completed

47 files scanned
18 findings discovered
```

### No results

```text
No findings match these filters.
```

### Partial scan

```text
Scan completed with warnings

Some files could not be parsed.
View limitations.
```

---

# 38. Content Style

Use simple, technical language.

Prefer:

```text
Confirmed finding
```

over:

```text
Critical security vulnerability!!!
```

Prefer:

```text
Potential migration concern
```

over:

```text
Quantum disaster
```

Prefer:

```text
Review required
```

over:

```text
Unsafe
```

Do not use fear-based security messaging.

---

# 39. Design System

Centralize:

```text
colors
typography
spacing
radii
elevation
icons
buttons
inputs
tables
badges
dialogs
navigation
notifications
loading states
empty states
error states
```

Use Fluent tokens wherever possible.

Do not create separate styles for each page.

---

# 40. Iconography

Use Fluent System Icons.

Suggested icons:

```text
Overview       Grid
Findings       Warning / Shield
Dependencies   Branch
Certificates   Certificate
Migration      Arrow Swap
Sandbox        Beaker
Reports        Document
Settings       Settings
Search         Search
```

Icons must support the label rather than replace important text.

---

# 41. Performance

Optimize for:

- Large repositories
- Many findings
- Large dependency graphs
- Long evidence snippets
- Repeated scans

Use:

- Pagination
- Virtualized tables when necessary
- Lazy-loaded pages
- Background scan jobs
- Incremental result updates
- Cached rule metadata

Do not load the entire repository into the browser.

---

# 42. Security Architecture

Uploaded repositories are untrusted.

Scanner execution must be isolated.

Recommended:

```text
Browser
  ↓
FastAPI
  ↓
Scan job queue
  ↓
Isolated scanner worker
  ↓
Read-only temporary workspace
  ↓
Findings
  ↓
Database
```

No arbitrary code execution.

No automatic `pip install`, `npm install`, Maven build, Go build, or Docker execution from uploaded repositories.

---

# 43. API Endpoints

Suggested API:

```text
=======
 
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
>>>>>>> 088581aa695ca95b06397e033b09b17275694fb1
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
<<<<<<< HEAD

---

# 44. Example Scan Response

```json
{
  "scan_id": "scan-001",
  "status": "completed",
  "files_scanned": 47,
  "findings": {
    "confirmed": 13,
    "likely": 2,
    "possible": 3
  },
  "certificates": 3,
  "dependencies": 12,
  "migration_items": 9,
  "warnings": 1
}
```

---

# 45. Demo Repository

Create a controlled demo repository containing examples of:

```text
Python
    RSA key generation
    AES encryption

JavaScript
    JWT configuration

YAML
    TLS configuration

Nginx
    TLS protocol configuration

Certificate
    Public certificate metadata

Dependency manifest
    Cryptography-related packages

Wrapper
    Application helper calling a crypto library
```

The demo repository should contain no real secrets.

---

# 46. Demo Story

The final demonstration should take approximately 5–8 minutes.

### Step 1

Open the dashboard.

### Step 2

Upload/select the demo repository.

### Step 3

Start scan.

### Step 4

Show scan progress.

### Step 5

Open findings.

### Step 6

Click an RSA finding.

Show:

- File
- Line
- Evidence
- Confidence
- Component
- Dependencies

### Step 7

Open dependency graph.

Show:

```text
Auth service
 → JWT
 → RS256
 → RSA-2048
```

### Step 8

Open migration planner.

Show validation gates.

### Step 9

Open sandbox.

Change provider configuration.

### Step 10

Show the same application-level interface working with a different provider configuration.

### Step 11

Export report.

### Step 12

Show limitations.

---

# 47. CI Policy

Example:

```yaml
crypto_policy:
  fail_on:
    - newly_introduced_deprecated_algorithm
  warn_on:
    - possible_crypto_match
    - new_crypto_dependency
    - unsupported_configuration
  baseline:
    file: .crypto-baseline.json
```

CI should compare the new scan with the baseline.

Example:

```text
Crypto policy check

New cryptographic dependency detected:
package: example-crypto-library

Status:
WARNING

Reason:
Dependency requires security review.
```

---

# 48. Testing Strategy

## Unit tests

Test:

- Rule matching
- Confidence classification
- Key-size extraction
- Protocol extraction
- Certificate parsing
- Dependency mapping
- Migration checklist generation

## Integration tests

Test:

```text
Repository
 ↓
Scanner
 ↓
Findings
 ↓
Dependency graph
 ↓
Migration plan
 ↓
Report
```

## UI tests

Test:

- Navigation
- Filtering
- Finding details
- Theme switch
- Keyboard navigation
- Responsive layouts

## Security tests

Test:

- Malicious archive names
- Path traversal
- Oversized files
- Unsupported files
- Malformed certificates
- Malicious configuration content
- Resource exhaustion
- Secret leakage in logs

---

# 49. Acceptance Criteria

The project is ready for demonstration when:

- [ ] A repository can be scanned.
- [ ] Source files are inspected.
- [ ] Configuration files are inspected.
- [ ] Dependencies are inventoried.
- [ ] Certificates can be parsed.
- [ ] Findings contain file/line evidence where available.
- [ ] Findings have confidence levels.
- [ ] Dependencies are mapped.
- [ ] A migration checklist is generated.
- [ ] Confirmed and uncertain findings are clearly separated.
- [ ] A crypto provider interface exists.
- [ ] The provider can be changed through configuration.
- [ ] Only vetted cryptographic libraries are used.
- [ ] A sandbox demonstration works.
- [ ] Reports can be exported.
- [ ] CI can detect new findings.
- [ ] Light/dark mode works.
- [ ] Responsive layouts work.
- [ ] Keyboard navigation works.
- [ ] No private keys or secrets are exposed.
- [ ] Limitations are visible in the report.
- [ ] The product never claims that a scan proves quantum safety.

---

# 50. Antigravity Build Instructions

## Before coding

Treat this README as the product specification.

Do not ask the user to answer the original 18-question design questionnaire again. The decisions have already been made here.

If a major technical/product decision is genuinely missing, ask **one question at a time** before making that major change.

For small implementation decisions, use professional judgment.

## During coding

Work incrementally:

```text
1. Project setup
2. Fluent design system
3. Application shell
4. Scanner engine
5. Findings
6. Dependencies
7. Certificates
8. Migration planner
9. Sandbox
10. Reports
11. CI
12. Testing
```

After each major stage:

- Run tests
- Fix errors
- Check the UI
- Keep the code modular
- Avoid unnecessary dependencies

Do not build everything as one giant component.

---

# 51. Recommended Frontend Components

```text
AppShell
Sidebar
TopBar
PageHeader
ScanButton
ScanProgress
StatSummary
FindingTable
FindingDetail
EvidenceViewer
ConfidenceBadge
AlgorithmBadge
DependencyGraph
DependencyTable
CertificateTable
MigrationChecklist
MigrationItem
ValidationGate
CryptoProviderSelector
SandboxPanel
ReportPreview
ThemeToggle
GlobalSearch
Toast
EmptyState
ErrorState
LoadingState
```

---

# 52. Recommended Backend Services

```text
ScanService
RepositoryService
CodeScanner
ConfigScanner
CertificateScanner
DependencyScanner
RuleEngine
FindingClassifier
DependencyMapper
MigrationPlanner
CryptoProviderService
ReportService
PolicyService
```

Keep business logic out of API route handlers where possible.

---

# 53. Important Architecture Principle

Separate these concepts:

```text
Detection
    ↓
Classification
    ↓
Dependency analysis
    ↓
Migration planning
    ↓
Validation
```

Do not combine them into one rule.

For example:

```text
RSA detected
```

does not automatically mean:

```text
Migration required immediately
```

The system should preserve the evidence and let the analysis layer add context.

---

# 54. Final Product Positioning

The product is:

> A cryptographic inventory and migration-planning assistant with a crypto-agility demonstration.

It is not:

- A quantum computer simulator
- A proof of quantum safety
- A replacement for a security audit
- A custom cryptography library
- A vulnerability scanner that declares every classical algorithm unsafe
- A production key-management system

---

# 55. Final Quality Checklist

Before final delivery, verify:

## UX

- [ ] Main action is obvious
- [ ] Scan flow is clear
- [ ] Findings are easy to inspect
- [ ] Evidence is easy to understand
- [ ] Dependency relationships are understandable
- [ ] Migration steps are actionable

## UI

- [ ] Fluent 2 visual language
- [ ] Consistent Fluent components
- [ ] Microsoft-style blue brand accent
- [ ] Semantic status colors
- [ ] Segoe UI typography
- [ ] Clean hierarchy
- [ ] No unnecessary decoration

## Theme

- [ ] Light mode
- [ ] Dark mode
- [ ] Theme persistence
- [ ] Accessible contrast

## Responsive

- [ ] Mobile
- [ ] Tablet
- [ ] Laptop
- [ ] Desktop
- [ ] Large display

## Accessibility

- [ ] Keyboard navigation
- [ ] Focus states
- [ ] Semantic HTML
- [ ] Labels
- [ ] Screen-reader support
- [ ] Color is not the only status indicator
- [ ] Reduced motion

## Security

- [ ] Uploaded repositories treated as untrusted
- [ ] No arbitrary code execution
- [ ] No private key exposure
- [ ] No secrets in frontend
- [ ] No secrets in logs
- [ ] Resource limits
- [ ] Path traversal protection

## Scanner

- [ ] Code scanning
- [ ] Configuration scanning
- [ ] Dependency scanning
- [ ] Certificate inventory
- [ ] Line-level evidence
- [ ] Confidence classification
- [ ] Dependency mapping
- [ ] Migration checklist

## Crypto-agility

- [ ] Provider interface
- [ ] Configuration-driven selection
- [ ] Vetted crypto libraries
- [ ] Sandboxed demonstration
- [ ] No custom cryptographic primitives

## Reporting

- [ ] JSON
- [ ] HTML
- [ ] Optional PDF
- [ ] Limitations
- [ ] Compatibility risks
- [ ] Testing steps
- [ ] Clear distinction between evidence and inference

---

# 56. Design References

The visual system should follow Fluent 2 principles and tokens rather than copying any individual Microsoft product.

Reference areas:

- Fluent 2 color system
- Fluent 2 typography
- Fluent 2 design tokens
- Fluent 2 accessibility guidance
- Fluent system iconography
- Fluent React components

Use the official Fluent documentation as the source of truth when implementation details conflict with this README.

---

# 57. Final Product Principle

Build a tool that feels like a real internal Microsoft-style security engineering product:

**Clear evidence.  
Clear dependencies.  
Clear migration work.  
No exaggerated security claims.**

The product should make complex cryptographic inventory easier to understand without pretending that static analysis can prove more than it actually can.
=======
 
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
>>>>>>> 088581aa695ca95b06397e033b09b17275694fb1
