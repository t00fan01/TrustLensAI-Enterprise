import os
import json
import sqlite3
import math
import asyncio
import random
from datetime import datetime, timezone
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = FastAPI(title="TrustLensAI Backend")
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "https://aladin-tawny.vercel.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "trustlens_security.db"

def init_db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS system_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id TEXT,
            amount REAL,
            timestamp TEXT,
            is_flagged INTEGER DEFAULT 0,
            is_scanned INTEGER DEFAULT 0,
            ai_analysis TEXT
        )
    ''')
    conn.commit()
    conn.close()

def calculate_z_score(current_amount: float, all_amounts: List[float]) -> float:
    if len(all_amounts) < 2:
        return 0.0
    
    mean = sum(all_amounts) / len(all_amounts)
    variance = sum((x - mean) ** 2 for x in all_amounts) / len(all_amounts)
    std_dev = math.sqrt(variance)
    
    if std_dev == 0:
        return 0.0
        
    return (current_amount - mean) / std_dev

async def mock_transaction_generator():
    while True:
        await asyncio.sleep(5)
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Inject 5-10 normal transactions
            num_normals = random.randint(5, 10)
            for _ in range(num_normals):
                account_id = f"ACC_{random.randint(1000, 9999)}"
                amount = round(random.uniform(10.0, 500.0), 2)
                timestamp = datetime.now(timezone.utc).isoformat()
                cursor.execute('''
                    INSERT INTO system_transactions (account_id, amount, timestamp)
                    VALUES (?, ?, ?)
                ''', (account_id, amount, timestamp))
                
            # Randomly inject a massive anomaly (10% chance per cycle)
            if random.random() < 0.10:
                account_id = f"ACC_{random.randint(1000, 9999)}_SUS"
                amount = round(random.uniform(50000.0, 150000.0), 2)
                timestamp = datetime.now(timezone.utc).isoformat()
                cursor.execute('''
                    INSERT INTO system_transactions (account_id, amount, timestamp)
                    VALUES (?, ?, ?)
                ''', (account_id, amount, timestamp))
                print(f"[*] Injected massive anomalous transaction: ${amount} for {account_id}")

            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Mock generator error: {e}")

async def guardian_loop():
    while True:
        await asyncio.sleep(3)
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Fetch all historical amounts to calculate mean/stddev natively
            cursor.execute('SELECT amount FROM system_transactions WHERE is_scanned = 1')
            history = cursor.fetchall()
            historical_amounts = [row[0] for row in history]
            
            # Fetch unscanned transactions
            cursor.execute('SELECT id, account_id, amount, timestamp FROM system_transactions WHERE is_scanned = 0')
            unscanned = cursor.fetchall()
            
            for row in unscanned:
                tx_id, account_id, amount, timestamp = row
                
                # Check anomaly
                z_score = calculate_z_score(amount, historical_amounts)
                is_flagged = 1 if abs(z_score) > 3.0 else 0
                ai_analysis = None
                
                if is_flagged:
                    print(f"[!] Anomaly detected! Z-score: {z_score:.2f}, Amount: ${amount}")
                    
                    system_prompt = """
                    You are an elite financial cybersecurity AI. Analyze this anomalous transaction.
                    Respond ONLY with a JSON object matching this structure:
                    {
                      "threat_level": "<High, Critical>",
                      "action_recommended": "<Freeze Account, Block IP, etc>",
                      "reasoning": "<Short explanation>"
                    }
                    """
                    user_prompt = f"Transaction Details:\nAccount: {account_id}\nAmount: ${amount}\nTime: {timestamp}\nZ-Score: {z_score:.2f}"
                    
                    try:
                        chat_completion = client.chat.completions.create(
                            messages=[
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt}
                            ],
                            model="llama-3.1-8b-instant",
                            response_format={"type": "json_object"},
                            temperature=0.2,
                        )
                        ai_analysis = chat_completion.choices[0].message.content
                    except Exception as e:
                        print(f"Guardian AI Error: {e}")
                        ai_analysis = json.dumps({"threat_level": "Critical", "action_recommended": "Manual Review", "reasoning": "AI timeout during anomaly analysis."})
                
                # Update record
                cursor.execute('''
                    UPDATE system_transactions 
                    SET is_scanned = 1, is_flagged = ?, ai_analysis = ? 
                    WHERE id = ?
                ''', (is_flagged, ai_analysis, tx_id))
                
                # Add to local historical amounts for the next iteration in this cycle
                historical_amounts.append(amount)

            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Guardian loop error: {e}")

@app.on_event("startup")
async def startup_event():
    init_db()
    asyncio.create_task(mock_transaction_generator())
    asyncio.create_task(guardian_loop())

class URLRequest(BaseModel):
    url: str
    text_content: str = ""

class RiskResponse(BaseModel):
    risk_score: int
    classification: str
    reasons: List[str]

@app.post("/analyze", response_model=RiskResponse)
async def analyze_content(request: URLRequest):
    if not request.text_content and not request.url:
        raise HTTPException(status_code=400, detail="No content provided")

    system_prompt = """
    You are an elite cybersecurity AI. Analyze the provided text/URL for phishing, scams, or fraud.
    Respond ONLY with a valid JSON object matching this exact structure, nothing else:
    {
      "risk_score": <integer between 0 and 100>,
      "classification": "<Safe, Warning, or Scam>",
      "reasons": ["<reason 1>", "<reason 2>"]
    }
    """

    user_prompt = f"URL: {request.url}\nPage Text: {request.text_content}"

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.1-8b-instant", 
            response_format={"type": "json_object"}, 
            temperature=0.2, 
        )
        
        ai_response = json.loads(chat_completion.choices[0].message.content)
        
        return RiskResponse(
            risk_score=ai_response["risk_score"],
            classification=ai_response["classification"],
            reasons=ai_response["reasons"]
        )
        
    except Exception as e:
        print(f"AI Error: {e}")
        return RiskResponse(risk_score=50, classification="Warning", reasons=["AI Analysis timed out."])

@app.get("/api/transactions")
async def get_transactions():
    try:
        conn = sqlite3.connect(DB_PATH, timeout=10)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, account_id, amount, timestamp, is_flagged, ai_analysis 
            FROM system_transactions 
            ORDER BY id DESC LIMIT 20
        ''')
        rows = cursor.fetchall()
        
        transactions = []
        for row in rows:
            ai_data = None
            if row[5]:
                try:
                    ai_data = json.loads(row[5])
                except Exception:
                    pass
            
            transactions.append({
                "id": row[0],
                "account_id": row[1],
                "amount": row[2],
                "timestamp": row[3],
                "is_flagged": row[4],
                "ai_analysis": ai_data
            })
            
        conn.close()
        return transactions
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/")
async def root():
    return {"message": "TrustLensAI Engine is Online"}