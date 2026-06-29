# TrustLens AI 🛡️
**A zero-latency Web3 cybersecurity shield and heuristic phishing detector.**

### Problem Statement and Solution Overview
Modern phishing attacks no longer just steal passwords; they utilize malicious smart contracts and hidden DOM elements to drain Web3 wallets and hijack sessions. Traditional API-based scanners are too slow and vulnerable to rate limits. 

**TrustLens AI** is a proactive, hybrid cybersecurity agent. It features a zero-latency client-side Web3 scanner that instantly detects malicious blockchain signatures (e.g., `setApprovalForAll`) and insecure form hijackings locally. It is backed by a server-side SQLite Threat Intelligence Cache that operates in milliseconds, acting as an off-chain oracle to permanently register and block zero-day threats.

### Tech Stack
* **Frontend Dashboard:** React, Vite, Tailwind CSS
* **Extension Engine:** Chrome Manifest V3, Vanilla JS, DOM Heuristics
* **Backend Sentinel:** Python, FastAPI, SQLite (Threat Intelligence Cache)

### Installation and Setup Instructions
**1. Backend Setup (Local):**
```bash
cd trustlens-backend
pip install -r requirements.txt
uvicorn main:app --reload
```
**2. Extension Setup:**
* Open Chrome and navigate to `chrome://extensions/`
* Enable "Developer mode" in the top right.
* Click "Load unpacked" and select the `trustlens-extension` directory.

### AI Tools Disclosure Table
| Tool Used | Purpose | Section / Feature Applied To |
| :--- | :--- | :--- |
| Gemini | Architectural strategy & algorithm logic | Web3 DOM heuristic scanning rules |
| Antigravity | Code refactoring & implementation | Backend SQLite cache and extension popup UI |

### Team Members and Roles
* **Lakshya Malviya** - Lead Full-Stack Developer & Security Architect
* **Anuj Malviya** - Frontend Engineer & UI/UX Specialist
* **Ishan Tomar** - Security Extensions & Integration Engineer

### Screenshots & Demo Link
* **Demo Video:** [Insert YouTube/Drive Link Here]
* **Live Dashboard:** [https://trustlens-steel.vercel.app]
![TrustLens Dashboard](https://github.com/t00fan01/TrustLensAI-Enterprise/blob/bf90e710f9f3b5b2435ccd684f7142c7fd285484/7ab59eae-d8c0-4b44-9b29-de3744317f4a.jpeg)
