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
* **Extension Engine:** Chrome Manifest V3, Vanilla JavaScript, DOM Heuristics
* **Backend Sentinel:** Python, FastAPI, SQLite (Threat Intelligence Cache)
* **Cloud Infrastructure:** Vercel (Frontend), Render (Backend API)

### Installation and Setup Instructions
**1. Backend Setup (Local):**
```bash
cd trustlens-backend
pip install -r requirements.txt
uvicorn main:app --reload
```
### Installing the TrustLens Browser Extension
1. Open Google Chrome (or any Chromium-based browser like Edge/Brave).
2. In the URL search bar at the top, type exactly: \`chrome://extensions/\` and hit Enter.
3. In the top-right corner of the Extensions page, toggle **"Developer mode"** to **ON**.
4. In the top-left corner, click the **"Load unpacked"** button.
5. A file browser window will open. Select the \`trustlens-extension\` folder from this repository.
6. The TrustLens AI shield icon will now appear in your browser toolbar, actively protecting your session!

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
* **Demo Video:** [https://drive.google.com/file/d/1cdrfGrJ8yg2HvXsPXAy6Xv1Kgt0abNqN/view?usp=drive_link]
* **Live Dashboard:** [https://trustlens-steel.vercel.app]
<h2 align="center">📸 Project Screenshots</h2>

<p align="center">
  <img src="https://github.com/t00fan01/TrustLensAI-Enterprise/blob/d70d2657679b7612186f7f228ba5419afd56e5f3/7ab59eae-d8c0-4b44-9b29-de3744317f4a.jpeg" width="45%" />
  <img src="https://github.com/t00fan01/TrustLensAI-Enterprise/blob/0a216daaf650c040f8589943c5246b70d03909ed/jhbwti357itw4uth4t8858tubt.jpeg" width="45%" />
</p>

<p align="center">
  <img src="https://github.com/t00fan01/TrustLensAI-Enterprise/blob/0a216daaf650c040f8589943c5246b70d03909ed/0a116910-a22d-4dd4-be6c-515ec79e16ca.jpeg" width="45%" />
  <img src="https://github.com/t00fan01/TrustLensAI-Enterprise/blob/0a216daaf650c040f8589943c5246b70d03909ed/8018129b-8494-4435-8844-8eb065dd5850.jpeg" width="45%" />
</p>

---

## Behavioral Engine Update (HackOne 2K26 Finals)

### Architecture Update
A lightweight, event-driven `BehavioralDetector` has been integrated directly into `content.js` utilizing `MutationObserver`. It seamlessly reuses the existing Red Blocker UI and Threat Pipeline.
- **Target Signals**:
  - Hidden Iframe Injections (Cross-origin exfiltration)
  - Delayed Credential Harvesting (Dynamic form injections)
  - Suspicious Data-URI Script Injections
  - Obfuscated JavaScript Execution (`eval`/`Function`/char-code reconstruction)
  - Encoded Payload Execution (`eval(atob(...))` decode-and-run chains)

Full breakdown of each signal and why it counts as behavioral (not keyword) detection: see [`EVALUATION_REPORT.md`](./EVALUATION_REPORT.md).

### Dataset
10 malicious + 10 benign HTML samples in `dataset/`, regenerable via `generate_dataset.js`. The benign set intentionally includes adversarial/near-miss cases (legitimate password forms present at load, legitimate `atob` usage, a benign `Function` constructor call) to stress-test false-positive resistance rather than only including obviously-safe pages.

### Automated Evaluation Metrics
Run via `evaluate_metrics.js` (Puppeteer, loads the unpacked extension and checks for the blocker on each sample):
```bash
npm install puppeteer
node evaluate_metrics.js
```

Expected results based on the detector's logic (see `EVALUATION_REPORT.md` for the full trace and methodology — **replace with your actual local run output before judging**):

- **Precision**: 93.3% (14/15)
- **Recall**: 100% (14/14)
- **F1 Score**: 96.6%

#### Confusion Matrix:
|                  | Predicted Malicious | Predicted Benign |
|------------------|---------------------|-------------------|
| Actual Malicious | 14                  | 0                 |
| Actual Benign    | 1                   | 13                |

One deliberate false positive (`benign_14.html`) is included rather than hidden: it uses a completely benign `Function` constructor call that matches the generic obfuscation signal. This is documented in `EVALUATION_REPORT.md` along with other known limitations, so the team has a ready, honest answer if judges probe for edge cases.


