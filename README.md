# PQC Migration & Crypto-Agility Scanner

A tool that scans codebases for cryptographic usage (algorithms, protocols, libraries, certificates) and helps plan migration to post-quantum cryptography (PQC).

## What it does

- Scans source code, config files, dependency manifests, and certificates for cryptographic usage
- Flags classical (quantum-vulnerable) algorithms and protocols
- Maps dependencies and generates a crypto-agility / migration plan
- Provides a sandbox to test hybrid/PQC alternatives
- Generates reports summarizing findings

## Tech Stack

- **Backend:** Python (FastAPI)
- **Frontend:** React + TypeScript (Vite)
- **Rules:** JSON-based rule sets for algorithms, protocols, libraries, and policies

## Project Structure

```
backend/     FastAPI app, scanner engine, crypto analysis
frontend/    React dashboard (scans, findings, dependencies, reports)
rules/       Detection rules for algorithms, protocols, libraries, policies
samples/     Demo repository used for test scans
docs/        Architecture and threat model docs
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

Health check: `GET /api/health`

Full API docs available at `http://127.0.0.1:8000/docs` once the backend is running.
