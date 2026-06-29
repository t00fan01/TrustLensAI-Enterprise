# 🛡️ Project Title

- **TrustLens AI**
- A context-aware cyber safety agent that detects zero-day phishing and social engineering attacks using intent-based heuristic evaluation.

---

# ⚠️ Problem Statement & Solution Overview

### Problem Statement
Traditional security tools rely on reactive blocklists of known malicious URLs, leaving users vulnerable to newly created (zero-day) phishing, Web3 wallet drainers, and KYC scams.

### Solution Overview
**TrustLens AI** utilizes a high-performance **Tiered Pipeline Architecture** for intent-based heuristic evaluation. It analyzes raw DOM metadata, flags local heuristics (like malicious Web3 signatures and form hijacking) in 0 milliseconds, and uses a contextual AI engine in real-time to identify psychological manipulation tactics, halting zero-day threats before they execute.

---

# 💻 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS |
| **Backend** | Python, FastAPI, SQLite |
| **AI / ML** | Groq LLaMA 3.1 |
| **Browser Extension** | Chrome Manifest V3, Vanilla JS |
| **Deployment** | Render (Backend API), Vercel (Frontend Site) |

---

# ⚙️ Installation & Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (3.9+)
- Google Chrome Browser

### 1. Clone Repository
```bash
git clone https://github.com/t00fan01/TrustLensAI-Enterprise.git
cd TrustLensAI-Enterprise
```

### 2. Install Dependencies

**Backend:**
```bash
cd trustlens-backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd ../trustlens-landing
npm install
```

### 3. Environment Variables
Create a `.env` file in the `trustlens-backend` directory and add your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Run Backend
Navigate to the `trustlens-backend` directory and start the server:
```bash
uvicorn main:app --reload
```

### 5. Run Frontend
Navigate to the `trustlens-landing` directory and start the development server:
```bash
npm run dev
```

### 6. Load Browser Extension (if applicable)
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Toggle **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the `trustlens-extension` folder from the cloned repository.

### 7. Run Project
Ensure both the backend API and frontend site are running concurrently. With the extension loaded, navigate to any unverified URL or trigger a Google search to see the active page scanning and Live Threat Scanner in action.

### Local Setup Instructions
For a quick local start on Windows environments, you can simply execute the provided batch scripts in the root directory:
- `run_backend.bat`
- `run_landing.bat`

---

# 🤖 AI Tools Disclosure

| Tool Used | Purpose | Section / Feature Applied To |
| :--- | :--- | :--- |
| **Groq LLaMA 3.1** | Core heuristic intent analysis | Backend API Threat Engine |
| **Antigravity (Gemini 3.1 Pro)** | Code optimization, refactoring, and AI integration | Full-Stack (Backend, Extension, Frontend) |

---

# 👥 Team Members & Roles

| Name | Role |
| :--- | :--- |
| **Lakshya Malviya** | Lead Full-Stack Developer & Security Architect |
| **Anuj Malviya** | Frontend Engineer & UI/UX Specialist |
| **Ishan Tomar** | Security Extensions & Integration Engineer |

---

# 📸 Screenshots / Demo

**Demo Link:** [https://trustlens-steel.vercel.app/](https://trustlens-steel.vercel.app/)

**Project Screenshots:** To be added
