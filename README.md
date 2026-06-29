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

* **Lakshya Malviya** — *Lead Full-Stack Developer & Security Architect*
  * **Responsibilities:** Designed the core two-tiered hybrid anomaly detection architecture. Built the Python FastAPI server infrastructure, local rolling Z-Score statistical matrix, and bulletproofed database concurrency controls. Handled production environment configuration and deployment across isolated Render nodes.

* **Anuj Malviya** — *Frontend Engineer & UI/UX Specialist*
  * **Responsibilities:** Developed the responsive React web application and landing interface using Vite and Tailwind CSS. Built the live-polling transaction feed panel and mapped glassmorphism-styled warning themes. Optimized frontend state handlers to cleanly display asynchronous AI threat mitigation reports without layout shifts.

* **Ishan Tomar** — *Security Extensions & Integration Engineer*
  * **Responsibilities:** Engineered the Chrome Manifest V3 extension core script logic, background workers, and DOM-based layout injection. Designed the high z-index active content-blurring interstitial blocker system. Facilitated robust cross-origin resource sharing (CORS) security handshakes between the extension client and active APIs.


### 6. Screenshots & Demo Link
* **Live Portal:** [https://trustlens-steel.vercel.app/]
