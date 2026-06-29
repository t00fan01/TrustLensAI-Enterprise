<div align="center">
  
  <!-- Make sure your logo path here is correct based on your repo -->
  <img src="assets/logo.png" alt="TrustLens AI Logo" width="150">

  <h1>TrustLens AI 🛡️</h1>

  <strong>A zero-latency Web3 cybersecurity shield and heuristic phishing detector.</strong>

</div>
<br>
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
<h2 align="center">📸 Project Screenshots</h2>

<p align="center">
  <img src="IMAGE_LINK_1" width="45%" />
  <img src="IMAGE_LINK_2" width="45%" />
</p>

<p align="center">
  <img src="IMAGE_LINK_3" width="45%" />
  <img src="IMAGE_LINK_4" width="45%" />
</p>
