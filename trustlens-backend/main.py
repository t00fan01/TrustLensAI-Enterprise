import json
import os
import sqlite3
from urllib.parse import urlparse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import AsyncGroq
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
db_conn = sqlite3.connect(DB_FILE, check_same_thread=False)

def init_db():
    cursor = db_conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scan_cache (
            domain TEXT PRIMARY KEY,
            classification TEXT,
            risk_score INTEGER,
            reasons TEXT
        )
    """)
    db_conn.commit()

init_db()

groq_client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY")) if os.environ.get("GROQ_API_KEY") else None

class ScanRequest(BaseModel):
    url: str
    text_content: str
    has_login_forms: bool = False
    external_links_count: int = 0
    is_web3_active: bool = False

def get_domain(url_str: str) -> str:
    try:
        parsed = urlparse(url_str)
        return parsed.netloc.lower() if parsed.netloc else url_str.lower()
    except Exception:
        return url_str.lower()

@app.post("/analyze")
async def analyze_threat(payload: ScanRequest):
    domain = get_domain(payload.url)
    
    try:
        cursor = db_conn.cursor()
        cursor.execute("SELECT classification, risk_score, reasons FROM scan_cache WHERE domain = ?", (domain,))
        row = cursor.fetchone()
        if row:
            return {
                "classification": row[0],
                "risk_score": row[1],
                "reasons": json.loads(row[2])
            }
    except Exception:
        pass

    if not groq_client:
        return {
            "classification": "Warning",
            "risk_score": 50,
            "reasons": ["Analysis failed or Groq API key missing."]
        }

    system_prompt = """You are a cybersecurity expert analyzing a website for phishing, social engineering, and malicious intent.
Analyze the provided URL, text content, and DOM metadata.
CRITICAL INSTRUCTION: You must severely increase the risk score and classify as "High Risk" or "Scam" if has_login_forms is true on an unverified domain, or if suspicious Web3 activity (is_web3_active) is detected.
You MUST return your analysis strictly as a JSON object with this exact structure:
{
  "classification": "Safe" | "Warning" | "High Risk" | "Scam",
  "risk_score": <int 0-100>,
  "reasons": ["string", "string"]
}"""
    user_prompt = f"URL: {payload.url}\nMetadata: has_login_forms={payload.has_login_forms}, external_links_count={payload.external_links_count}, is_web3_active={payload.is_web3_active}\n\nContent:\n{payload.text_content}"

    try:
        chat_completion = await groq_client.chat.completions.create(
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
    except Exception:
        ai_classification = "Warning"
        ai_risk_score = 50
        ai_reasons = ["Groq API call failed."]

    try:
        cursor = db_conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO scan_cache (domain, classification, risk_score, reasons) VALUES (?, ?, ?, ?)",
            (domain, ai_classification, ai_risk_score, json.dumps(ai_reasons))
        )
        db_conn.commit()
    except Exception:
        pass

    return {
        "classification": ai_classification,
        "risk_score": ai_risk_score,
        "reasons": ai_reasons
    }