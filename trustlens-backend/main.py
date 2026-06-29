from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import json
from urllib.parse import urlparse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "threat_cache.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scan_cache (
            domain TEXT PRIMARY KEY,
            classification TEXT,
            risk_score INTEGER,
            reasons TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

class ScanRequest(BaseModel):
    url: str
    text_content: str

def get_domain(url_str: str) -> str:
    try:
        parsed = urlparse(url_str)
        return parsed.netloc.lower() if parsed.netloc else url_str.lower()
    except Exception:
        return url_str.lower()

@app.post("/analyze")
async def analyze_threat(payload: ScanRequest):
    domain = get_domain(payload.url)
    
    # 1. DATABASE CACHE LOOKUP (Instantaneous Execution)
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT classification, risk_score, reasons FROM scan_cache WHERE domain = ?", (domain,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "classification": row[0],
                "risk_score": row[1],
                "reasons": json.loads(row[2])
            }
    except Exception as e:
        print(f"Cache lookup failed: {e}")

    # 2. SEAMLESS FALLBACK TO AI CALL (If domain isn't cached yet)
    # [Insert your current processing or Groq inference code here]
    # For example purposes, let's look at a mock processed variable set:
    ai_classification = "Safe" 
    ai_risk_score = 12
    ai_reasons = ["Verified transaction structure", "No credential harvesting signs identified."]
    
    # 3. WRITE RESULT TO DATABASE TO ACCELERATE FUTURE VISITS
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO scan_cache (domain, classification, risk_score, reasons) VALUES (?, ?, ?, ?)",
            (domain, ai_classification, ai_risk_score, json.dumps(ai_reasons))
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Cache write failed: {e}")

    return {
        "classification": ai_classification,
        "risk_score": ai_risk_score,
        "reasons": ai_reasons
    }