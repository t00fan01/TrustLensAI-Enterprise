from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import json
import os
from urllib.parse import urlparse
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "threat_cache.db"
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY")) if os.environ.get("GROQ_API_KEY") else None

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
    system_prompt = """You are a cybersecurity expert analyzing a website for phishing, social engineering, and malicious intent.
Analyze the provided URL and text content.
You MUST return your analysis strictly as a JSON object with this exact structure:
{
  "classification": "Safe" | "Warning" | "High Risk" | "Scam",
  "risk_score": <int 0-100>,
  "reasons": ["string", "string"]
}"""
    user_prompt = f"URL: {payload.url}\n\nContent:\n{payload.text_content}"

    ai_classification = "Warning"
    ai_risk_score = 50
    ai_reasons = ["Analysis failed or Groq API key missing."]

    if groq_client:
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model="llama-3.1-8b-instant",
                response_format={"type": "json_object"},
                temperature=0.2
            )
            response_text = chat_completion.choices[0].message.content
            result = json.loads(response_text)
            
            ai_classification = result.get("classification", "Warning")
            ai_risk_score = result.get("risk_score", 50)
            ai_reasons = result.get("reasons", ["Failed to parse AI reasons."])
        except Exception as e:
            print(f"Groq API call failed: {e}")
    
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