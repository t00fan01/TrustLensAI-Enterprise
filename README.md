# TrustLens AI
A context-aware cyber safety agent that detects zero-day phishing and social engineering attacks using intent-based heuristic evaluation.

### 1. Problem Statement & Solution Overview
**Problem:** Traditional security tools rely on reactive blocklists of known malicious URLs, leaving users vulnerable to newly created (zero-day) phishing and KYC scams.
**Solution:** TrustLens AI utilizes intent-based heuristic evaluation. It analyzes the raw DOM and contextual language of a webpage in real-time to identify psychological manipulation tactics, halting threats before they execute.

### 2. Tech Stack
* **Frontend:** React, Vite, Tailwind CSS
* **Extension:** Chrome Manifest V3, Vanilla JS
* **Backend:** Python, FastAPI, Render (Cloud)

### 3. Installation and Setup Instructions
**Web Dashboard:**
1. Clone the repository or download the ZIP.
2. Run `npm install` in the `trustlens-landing` directory.
3. Run `npm run dev` to launch the local interface.

**Chrome Extension:**
1. Download `trustlens-extension.zip` from our live portal.
2. Extract the folder.
3. Go to `chrome://extensions` and enable Developer Mode.
4. Click "Load unpacked" and select the extracted folder.

### 4. AI Tools Disclosure Table
| Tool Used | Purpose | Section / Feature Applied To |
| :--- | :--- | :--- |
| Gemini / LLaMA 3.1 | Core heuristic analysis | Backend intent-evaluation engine |
| Cursor / Antigravity | Code formatting & refactoring | React component styling and code cleanup |

### 5. Team Members & Roles
* **[LAKSHYA]** - Lead Full-Stack Developer & Security Architect
* **[ANUJ MALVIYA ]** - [Data Base]
* **[Ishan Singh ]** - [ML Model]

### 6. Screenshots & Demo Link
* **Live Portal:** [https://aladin-smoky.vercel.app/]
