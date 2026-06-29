# Project title and one-line description
**TrustLens AI**  
A context-aware cyber safety agent that detects zero-day phishing and Web3 drainer threats in real-time using a hybrid heuristic and LLM pipeline.

# Problem statement and solution overview
Modern phishing attacks and malicious Web3 smart contracts bypass traditional static blocklists. Our solution is a 'Silent Guardian' tiered pipeline: local DOM heuristics instantly catch Web3 wallet drainers and form hijacking in 0ms, while a SQLite cache and Groq LLaMA 3.1 backend provide deep, sub-second contextual intent analysis.

# Tech stack
- **Frontend:** React, Vite, Tailwind CSS
- **Extension:** Chrome Manifest V3, Vanilla JS
- **Backend:** Python, FastAPI, SQLite, Groq API (LLaMA 3.1)

# Installation and setup instructions

1. **Load Browser Extension:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" in the top right.
   - Click "Load unpacked" and select the `trustlens-extension` directory.
2. **Run Backend Locally:**
   - Navigate to the `trustlens-backend` directory.
   - Install dependencies: `pip install -r requirements.txt`
   - Start the server: `uvicorn main:app --reload`
3. **Frontend Dashboard:**
   - The live dashboard is deployed at: [https://trustlens-steel.vercel.app](https://trustlens-steel.vercel.app)

# AI Tools Disclosure Table

| Tool Used | Purpose | Section / Feature Applied To |
|-----------|----------|------------------------------|
| Gemini | Architectural strategy, UI design, and hybrid ML logic | Overall Architecture & Dashboard |
| Antigravity | Code generation, rapid refactoring, and bfcache bug fixing | Backend API & Extension content.js |

# Team members and roles

| Name | Role |
|------|------|
| Lakshya Malviya | Lead Full-Stack Developer & Security Architect |
| Anuj Malviya | Frontend Engineer & UI/UX Specialist |
| Ishan Tomar | Security Extensions & Integration Engineer |

# Screenshots and/or demo link

**Demo Link:** [https://trustlens-steel.vercel.app](https://trustlens-steel.vercel.app)

![Dashboard Screenshot](link)
![Search Threat Scan Screenshot](link)
![Warning Notification Screenshot](link)
![Deceptive Site Blocker Screenshot](link)
