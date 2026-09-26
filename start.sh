#!/bin/bash
echo "========================================================"
echo "  Microsoft PQC Migration & Crypto-Agility Scanner"
echo "========================================================"

# Check requirements
python3 -m pip install -r backend/requirements.txt
cd frontend && npm install && cd ..

# Launch backend in background
export PYTHONPATH=".:backend"
python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Launch frontend
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend running (PID: $BACKEND_PID) -> http://127.0.0.1:8000"
echo "Frontend running (PID: $FRONTEND_PID) -> http://127.0.0.1:5173"
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT SIGTERM
wait
