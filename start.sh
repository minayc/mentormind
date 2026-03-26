#!/bin/bash
echo "Starting MentorMind..."

# Start backend in background
source .venv/bin/activate
python -m uvicorn backend.main:app --reload &

# Start frontend
cd frontend && npm run dev
