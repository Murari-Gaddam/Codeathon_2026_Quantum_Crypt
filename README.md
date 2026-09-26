# PQC Migration & Crypto-Agility Scanner
 
Our project is a scanner that automatically checks codebases, configs, and certificates for outdated encryption that could be broken by future quantum computers, then guides teams toward safer, quantum-resistant alternatives.
 
- **What it does:** Scans code, config files, and certificates to find weak or outdated cryptography
- **Why it matters:** Quantum computers will eventually break today's common encryption methods
- **How it helps:** Pinpoints exactly where the risk is, maps what depends on it, and creates a clear upgrade plan
- **End goal:** Makes systems quantum-ready — secure today and prepared for tomorrow
## Features
 
- Scans Python, JavaScript/TypeScript, YAML, and Nginx config files for cryptographic usage
- Parses X.509 certificates to check keys, signature algorithms, and expiry — without touching private keys
- Reads dependency manifests (`requirements.txt`, `package.json`) to catch risky libraries
- Classifies every finding by confidence: Confirmed, Likely, Possible, or Unknown
- Maps how services, algorithms, protocols, and certificates depend on each other
- Generates a prioritized migration plan with validation checkpoints
- Includes a sandbox to compare Classical, Hybrid, and Pure Post-Quantum cryptography side by side (signature size, speed, etc.)
- Produces shareable reports of scan results
## Architecture
 
The project has four main parts working together:
 
1. **Frontend (React + TypeScript, Vite)** — dashboard where you trigger scans, browse findings, view dependency maps, and read reports.
2. **Backend (FastAPI)** — the API layer that receives requests, runs scans, stores results, and serves data to the frontend.
3. **Scanner Engine** — the core logic that actually reads through code, configs, manifests, and certificates using specialized sub-scanners for each file type.
4. **Crypto-Agility Sandbox** — an isolated environment where Classical, Hybrid, and Post-Quantum cryptographic providers can be tested and benchmarked against each other.
```
Browser (React UI)  ─┐
                      ├──▶  FastAPI Backend  ──▶  Scan Service ──▶ Scanner Engine ──▶ Classifier/Dependency Mapper/Migration Planner
CI / CLI Tool        ─┘                                │                              │
                                                         ▼                              ▼
                                                  SQLite Database              Sandbox (Classical / Hybrid / PQC)
```
 
Once a scan runs, findings are classified, dependencies are mapped, and a migration plan is generated — all stored in a local SQLite database and shown on the dashboard.
 
## Tech Stack
 
- **Backend:** Python, FastAPI, SQLite
- **Frontend:** React, TypeScript, Vite
- **Crypto:** Python `cryptography` library, custom Classical/Hybrid/PQC providers
- **Rules:** JSON-based rule sets for algorithms, protocols, libraries, and policies
## Project Structure
 
```
backend/     FastAPI app, scanner engine, crypto providers, analysis logic
frontend/    React dashboard (scans, findings, dependencies, sandbox, reports)
rules/       Detection rules for algorithms, protocols, libraries, and policies
samples/     Demo repository used for test scans
docs/        Architecture and threat model documentation
tests/       Backend test suite
```
 
## Getting Started (macOS/Linux)
 
```bash
# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
 
# Run backend (from project root)
export PYTHONPATH=".:backend"
backend/venv/bin/python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
 
# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```
 
Then open the frontend at `http://localhost:5173`.
 
### Windows
 
Use `setup-windows.bat` and `start-windows.bat` in the project root.
 
## API
 
- Health check: `GET /api/health`
- Full interactive API docs: `http://127.0.0.1:8000/docs` (once the backend is running)
 
