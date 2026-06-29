@echo off
cd trustlens-backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
echo Installing/updating dependencies...
venv\Scripts\python.exe -m pip install -r requirements.txt
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
venv\Scripts\uvicorn.exe main:app --reload
pause
