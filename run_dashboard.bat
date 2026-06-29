@echo off
cd trustlens-dashboard
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
echo Installing/updating dependencies...
venv\Scripts\python.exe -m pip install -r requirements.txt
echo Starting Streamlit Dashboard...
venv\Scripts\streamlit.exe run app.py
pause
