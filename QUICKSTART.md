# 🚀 Quick Start Guide: PQC Migration & Crypto-Agility Scanner

Welcome! This repository contains the **Microsoft Post-Quantum Cryptography (PQC) Migration & Crypto-Agility Scanner** application, featuring a **FastAPI backend** and a **React 19 + Fluent UI frontend**.

Follow these instructions to run the application on your computer.

---

## 📋 Prerequisites

Make sure you have the following installed:
1. **Python 3.10+** (verify in terminal with `python --version`)
2. **Node.js 18+ & npm** (verify in terminal with `node --version` and `npm --version`)

---

## ⚡ Option 1: Automatic 1-Click Launch (Windows)

1. Extract the downloaded `.zip` file into a folder.
2. **First Time Setup:** Double-click [`setup-windows.bat`](setup-windows.bat) to install backend and frontend dependencies.
3. **Run Application:** Double-click [`start-windows.bat`](start-windows.bat).
   - This starts the FastAPI backend on `http://127.0.0.1:8000`
   - Starts the Vite frontend on `http://127.0.0.1:5173`
   - Automatically opens your web browser to the dashboard!

---

## 💻 Option 2: Manual Terminal Commands (Windows, macOS, Linux)

If you prefer running commands manually in your terminal:

### Step 1: Install Dependencies
Open your terminal in the extracted project root directory:

```bash
# Install Python backend dependencies
python -m pip install -r backend/requirements.txt

# Install Frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Start the Backend (Terminal 1)
In the project root directory, run:

- **Windows (PowerShell):**
  ```powershell
  $env:PYTHONPATH=".;backend"
  python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
  ```
- **macOS / Linux:**
  ```bash
  export PYTHONPATH=".:backend"
  python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
  ```

### Step 3: Start the Frontend (Terminal 2)
In a **new** terminal window, navigate to the `frontend/` directory and run:

```bash
cd frontend
npm run dev
```

### Step 4: Open in Your Browser
Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🎯 How to Use the Dashboard

1. **Clean Initial State:** When you open the dashboard, it starts in a clean zero state with all metrics initialized to zero.
2. **⚡ Load Built-in Demo Suite:**
   - Click the blue **"⚡ Run Demo Assessment"** (or **"Load Demo"** in the top navigation bar).
   - Instantly analyzes the enterprise demo repository, populating 31 cryptographic findings, 2 public certificates, 49 dependency edges, and 5 prioritized migration gates!
3. **📁 Scan Any Local Folder or Repository:**
   - Enter or click any path preset (e.g. `samples/demo-repository` or your own project folder path) and click **"Scan Path"**.
4. **🔄 Reset Demo Anytime:**
   - Click the **"Reset Demo"** button in the header bar or overview banner to reset all counters and views back to zero state.
5. **Inspect Certificates & Findings:**
   - Use the navigation bar on the left to switch between **Overview**, **Findings**, **Dependencies (Graph & Table)**, **Certificates (Card & Table views)**, **Migration Planner**, **Sandbox**, and **Reports**.

---

## 🧪 Running Unit & Integration Tests

From the project root:

```bash
# Python Backend Tests (8 test suites)
python -m unittest discover tests

# Frontend TypeScript Build Validation
cd frontend
npm run build
```
