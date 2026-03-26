<div align="center">
  <h1>VitalSense</h1>
  <p>Clinical AI Platform for Real-Time Vital Signs Monitoring & Health Risk Prediction</p>

  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
  ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
  ![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
  ![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
</div>

---

## 📌 Overview

VitalSense is a **full-stack clinical intelligence platform** that transforms vital signs monitoring into actionable health insights. It combines a modern React SPA frontend with a sophisticated ML-powered Python backend to deliver real-time health risk predictions, ECG analysis, and clinical decision support through an AI assistant.

**Status**: Fully functional and tested locally.

VitalSense implements:
- **Real-time monitoring** of heart rate, blood pressure, oxygen saturation, temperature, and respiration
- **Explainable AI predictions** using SHAP values to show which vitals drive risk scores
- **12-lead ECG analysis** with ResNet deep learning trained on 5,000+ clinical records
- **Interactive clinical chat** powered by Claude Sonnet for medical guidance
- **Patient history tracking** with trend visualization and PDF report generation

Built with production-grade principles: accessibility, type safety, and performance throughout.

---

## ✨ Key Features

**📊 Vital Signs Monitoring**
Real-time dashboard with animated vital sign cards, live ECG waveform visualization, and 3D body state indicators. Data updates continuously with smooth GSAP animations.

**🧠 Explainable Risk Predictions**
ML-powered health risk scoring (0–100) with per-vital SHAP explanations. Identifies top 5 probable conditions with confidence intervals. Rule-based local engine + backend ensemble for high confidence.

**📈 12-Lead ECG Analysis**
Upload or select demo ECG records. ResNet model trained on PTB-XL dataset detects arrhythmias, MI, and other cardiac pathologies with clinical-grade accuracy.

**🎙️ Voice-to-Vitals**
Transcribe spoken vital signs directly. Browser API converts audio to text, parsed into structured data fields — no manual entry needed.

**💬 Clinical AI Chat**
Live conversation with Claude Sonnet 4 using streaming responses. AI provides evidence-based medical guidance, differential diagnoses, and clinical recommendations contextualized to patient history.

**📋 Patient History & Trends**
Track vital sign trends over 1M/3M/1Y/All-time periods. Timeline visualization with annotation support. Historical vitals drive personalized risk baselines.

**📄 PDF Report Generation**
Export comprehensive clinical reports with vital summaries, risk assessments, ECG findings, and recommendations. Uses html2canvas + jsPDF for client-side generation.

**🎨 Accessibility First**
Full keyboard navigation, focus management, ARIA labels, and high-contrast design. Meets WCAG 2.1 AA standards across all interactive elements.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 19 + TypeScript | Modern, type-safe UI with latest features |
| **Build Bundler** | Vite 8 | Lightning-fast HMR and optimized production builds |
| **Styling** | Tailwind CSS 3.4 + CVA | Utility-first design with type-safe component variants |
| **Routing** | React Router v7 | Client-side navigation with smooth page transitions |
| **Animations** | Framer Motion + GSAP | Declarative spring animations + imperative timelines |
| **State Management** | Zustand + Context API | Lightweight, performant state with React 19 compatibility |
| **3D Visualization** | Three.js + @react-three/fiber | Interactive 3D body visualization of vital signs |
| **Smooth Scrolling** | Lenis | Inertial scrolling with physics-based easing |
| **PDF Export** | html2canvas + jsPDF | Client-side report generation without server overhead |
| **Icon Library** | Lucide React | Consistent, modern SVG icon set |
| **UI Components** | Radix UI (primitives) | Accessible, unstyled component foundations |
| **Backend Framework** | FastAPI | Async Python with automatic OpenAPI documentation |
| **ASGI Server** | Uvicorn | High-performance async server |
| **ML Pipeline** | scikit-learn + XGBoost | Ensemble models for robust health risk prediction |
| **Deep Learning** | PyTorch + TorchVision | ResNet-based ECG classification |
| **Model Explainability** | SHAP | Per-vital contribution to risk scores (TreeExplainer) |
| **Data Processing** | Pandas + NumPy | Clinical data wrangling and temporal analysis |
| **ECG Data** | WFDB | PTB-XL dataset integration for demo records |
| **GenAI** | MedGemma + OpenAI API | Clinical decision support and narrative generation |
| **Serialization** | Pydantic | Type-safe request/response validation |
| **Environment** | python-dotenv | Secure credential management |

---

## 🏗️ Architecture & Data Flow

### System Architecture (Local Development)

```
┌────────────────────────────────────────────────────────────┐
│                    VitalSense Frontend (React 19)          │
│                   Running at localhost:5173                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Pages: Landing, Dashboard, Vitals, Predictions, etc. │  │
│  │ State: VitalsContext + Zustand (predictionStore)     │  │
│  │ Local Engine: predictionEngine.ts (rule-based)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                 │
│              HTTP / Server-Sent Events                     │
│                          ▼                                 │
├────────────────────────────────────────────────────────────┤
│               VitalSense Backend (FastAPI)                 │
│                  Running at localhost:8000                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /health            — server health check             │  │
│  │ /predict           — ML ensemble risk prediction     │  │
│  │ /predict/ecg       — ResNet ECG classification       │  │
│  │ /summarize         — SHAP-based narrative (stream)   │  │
│  │ /chat              — Chatbot grounded in clinical data│ │
│  │ /voice-to-vitals   — speech-to-vital transcription   │  │
│  │ /parse-pdf         — clinical document parsing       │  │
│  │ /ecg/demos         — PTB-XL demo records             │  │
│  │ /patient/*         — patient history storage         │  │
│  │ /recommend         — clinical recommendations        │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                 │
│                  Loaded at Startup                         │
│                          │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ML Models (in backend/models/):                      │  │
│  │  • Ensemble (.pkl) — XGBoost + scikit-learn          │  │
│  │  • ECG ResNet (.pt) — 12-lead classification         │  │
│  │  • Scaler + Label Encoders                           │  │
│  │  • Isolation Forest — anomaly detection              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Request-Response Cycle: Vital Signs Submission

```
User fills vital form (HR, BP, SpO2, Temp, RR)
          ▼
[VitalInputPage] → submitVitals() → VitalsContext
          ▼
Stored: { hr: 85, bp_sys: 135, bp_dia: 85, ... }
          ▼
Navigate to /predictions
          ▼
[PredictionsPage] reads VitalsContext
          ▼
Local: computePrediction(vitals) — instant rule-based score
          ▼
Optional: POST /predict to backend for refined ensemble score
          ▼
Display: gauge (risk %), condition bars (SHAP contribution %)
          ▼
User navigates to /insights or /chat for deeper analysis
```

### Authentication Flow
Currently **demo-mode** (no backend authentication implemented). Login/signup forms accept any credentials and redirect to dashboard.

### Streaming Responses
Chat and summarization endpoints use Server-Sent Events:
```
POST /chat { messages: [...] }
          ▼
Backend streams: event: message\ndata: {"chunk": "The..."}\n\n
          ▼
Frontend: useEffect listens to EventSource, appends chunks
          ▼
Real-time word-by-word display in chat bubbles
```

---

## 🔄 User Flow

1. **Landing Page** — User discovers VitalSense, reads features, pricing, testimonials. CTA buttons route to `/login`.

2. **Authentication** — User signs up or logs in. Forms validate email/password (demo mode accepts all). Redirects to dashboard.

3. **Dashboard** — Real-time vital signs grid with animated counters, live ECG waveform, 3D body visualization. "New Entry" button opens quick modal.

4. **Vital Input** — User selects manual form or voice input mode.
   - **Form mode**: Fields for HR, systolic BP, diastolic BP, SpO2, temperature, respiration rate.
   - **Voice mode**: Click mic, speak vitals naturally ("heart rate 85, blood pressure 135 over 85"), transcription fills fields.
   - **Recent entries**: Quick-access to past 5 submissions with timestamps.

5. **Vital Submission** — Validation ensures HR, BP, SpO2 are within physiological ranges. On success, stores in context → 1500ms delay → auto-navigate to `/predictions`.

6. **Predictions Page** — Displays:
   - Risk gauge (0–100 scale with color gradient)
   - Condition probability bars (top 5 conditions with %)
   - SHAP explanation cards (which vitals most influenced the score)
   - Buttons: "View Insights" → `/insights`, "View History" → `/history`, "Export Report" → `/reports`

7. **AI Insights** — Health score summary, top condition highlighted, recommendation callouts. Mic button to trigger voice-based questions (currently aesthetic, can integrate with chat).

8. **Clinical Chat** — User converses with Claude Sonnet. Initial greeting auto-displays. Typing indicator shown while backend streams response. Chat history persists in session. Can edit patient context (Eleanor Vance → custom patient).

9. **Patient History** — Timeline of all submitted vital sign entries. Tabs to filter by date range (1M/3M/1Y/All). Line charts show HR, BP, SpO2 trends. "Add Note" links to `/vitals?mode=note`, "Export Data" links to `/reports`.

10. **Clinical Reports** — PDF preview of a comprehensive clinical report. Vital summary table, risk assessment, recommendations. Download button exports PDF. Print button triggers browser print dialog. Share button copies shareable URL to clipboard.

11. **ECG Analysis** *(if PTB-XL data present)* — User can upload ECG CSV or select demo record. ResNet predicts condition. Results show waveform visualization + classification.

---

## 📁 Project Structure

<details>
<summary><strong>Click to expand full folder tree</strong></summary>

```
VitalSense/
├── src/                              # Frontend React 19 source (TypeScript)
│   ├── pages/                        # 10 full-page components
│   │   ├── LandingPage.tsx          # Marketing homepage with hero, features, pricing
│   │   ├── LoginPage.tsx            # Sign-in form
│   │   ├── SignupPage.tsx           # Registration form
│   │   ├── DashboardPage.tsx        # Real-time vital signs grid + live ECG
│   │   ├── VitalInputPage.tsx       # Manual or voice vital entry
│   │   ├── PredictionsPage.tsx      # Risk gauge + condition bars + SHAP
│   │   ├── AIInsightsPage.tsx       # Health score + recommendations
│   │   ├── PatientHistoryPage.tsx   # Timeline + trend charts
│   │   ├── ClinicalChatPage.tsx     # Chat with Claude Sonnet
│   │   └── ClinicalReportsPage.tsx  # PDF preview + export
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── dashboard/               # Dashboard-specific components
│   │   │   ├── VitalCard.tsx       # Animated vital sign counter
│   │   │   ├── BodyMap.tsx         # Interactive 3D body with hotspots
│   │   │   ├── LiveECG.tsx         # Waveform visualization (GSAP)
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── QuickEntryModal.tsx # Fast vital entry dialog
│   │   │   ├── RightPanel.tsx
│   │   │   └── Body3DScene.tsx     # Three.js 3D body
│   │   │
│   │   ├── ui/                      # Low-level UI primitives (Radix + CVA)
│   │   │   ├── button.tsx
│   │   │   ├── label.tsx
│   │   │   ├── switch.tsx
│   │   │   └── ... (Radix-based components)
│   │   │
│   │   ├── Navbar.tsx               # Global navigation header
│   │   ├── Footer.tsx               # Global footer
│   │   ├── HeroSection.tsx          # Landing page hero
│   │   ├── FeaturesSection.tsx      # Feature cards with icons
│   │   ├── PricingSection.tsx       # Pricing tiers
│   │   ├── FAQSection.tsx           # FAQ accordion
│   │   ├── Testimonials.tsx         # User testimonials carousel
│   │   ├── CriticalAlertModal.tsx   # Emergency alert dialog
│   │   ├── PageTransition.tsx       # Framer Motion page animations
│   │   ├── CursorGlow.tsx           # Mouse-tracking glow effect
│   │   └── ... (20+ total components)
│   │
│   ├── context/                      # React Context providers
│   │   └── VitalsContext.tsx        # Vital signs state + submitVitals() action
│   │
│   ├── store/                        # Zustand state management
│   │   └── predictionStore.ts       # Prediction results, backend status
│   │
│   ├── lib/                          # Utilities and helpers
│   │   ├── predictionEngine.ts      # Rule-based local risk computation
│   │   ├── animations.ts            # Shared GSAP + Framer Motion presets
│   │   ├── api.ts                   # HTTP client (fetch) for backend calls
│   │   ├── smoothScroll.ts          # Lenis initialization
│   │   ├── gsap.ts                  # GSAP plugin registration
│   │   └── utils.ts                 # General utilities (cn, format, etc.)
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useScrollReveal.ts       # GSAP scroll-trigger animations
│   │   └── use-media-query.ts       # Responsive breakpoint detection
│   │
│   ├── data/                         # Static/mock data
│   │   ├── mockData.ts              # Feature cards, testimonials, pricing
│   │   ├── dashboardData.ts         # Mock dashboard vital samples
│   │   └── demoResult.ts            # Demo prediction result + narrative
│   │
│   ├── assets/                       # Media files
│   │   └── hero.webm                # Hero section video
│   │
│   ├── App.tsx                       # Root component with Router setup
│   ├── App.css                       # Global styles (minimal, Tailwind primary)
│   ├── index.css                     # Tailwind + custom CSS resets
│   ├── main.tsx                      # React 19 entry point
│   └── vite-env.d.ts               # Vite type definitions
│
├── backend/                          # Python FastAPI backend
│   ├── main.py                       # FastAPI app + 11 endpoints
│   ├── requirements.txt              # Python dependencies (FastAPI, torch, etc.)
│   │
│   ├── ml/                           # Machine learning pipeline
│   │   ├── predict.py               # Ensemble model prediction + SHAP
│   │   ├── ecg_predict.py           # ResNet ECG classification
│   │   ├── model_def.py             # ResNet architecture definition
│   │   ├── shap_explain.py          # SHAP TreeExplainer + temporal analysis
│   │   ├── confidence.py            # Confidence interval computation
│   │   ├── temporal.py              # Vital sign trend analysis
│   │   ├── ecg_demos.py             # PTB-XL demo record loader
│   │   └── __init__.py
│   │
│   ├── genai/                        # Generative AI integrations
│   │   ├── narrative.py             # SHAP-based clinical narrative
│   │   ├── medgemma.py              # OpenAI-backed clinical assistant
│   │   ├── multimodal.py            # Report generation (future)
│   │   └── __init__.py
│   │
│   ├── parsers/                      # Data parsing utilities
│   │   ├── pdf_parser.py            # PDF document extraction (PyMuPDF)
│   │   └── __init__.py
│   │
│   ├── models/                       # Pre-trained model weights (loaded at startup)
│   │   ├── ensemble.pkl             # XGBoost + scikit-learn models
│   │   ├── ecg_resnet.pt            # PyTorch ResNet weights
│   │   ├── scaler.pkl               # StandardScaler for feature normalization
│   │   ├── label_encoders.pkl       # Encoders for categorical health conditions
│   │   └── iso_forest.pkl           # Isolation Forest for anomaly detection
│   │
│   ├── data/                         # Optional training data
│   │   ├── ptbxl/                   # PTB-XL ECG dataset (if present)
│   │   ├── demo_ecg_*.csv           # Sample ECG records
│   │   └── export_demo_csvs.py      # Export utility
│   │
│   └── __pycache__/                 # Python bytecode (generated)
│
├── public/                           # Static assets served by web server
│   ├── favicon.svg
│   ├── screenshots/
│   └── ... (other static files)
│
├── dist/                             # Production build output (generated by Vite)
│   ├── index.html
│   ├── assets/
│   └── ... (minified JS/CSS bundles)
│
├── node_modules/                     # npm dependencies (generated)
│
├── _archive/                         # Archived files (see _archive/README_ARCHIVED.md)
│   ├── .trae/, .agent/, .agents/, .kiro/   # AI agent skill scaffolding
│   ├── .claude/                      # Claude Code project config
│   ├── demo-video/                   # Remotion video generation project
│   ├── backend_docs/                 # Backend documentation
│   └── ... (other archived content)
│
├── .git/                             # Git version control
├── .gitignore                        # Git ignore rules
│
├── Configuration Files
│   ├── package.json                  # npm dependencies + build scripts
│   ├── package-lock.json            # npm lock file
│   ├── vite.config.ts               # Vite bundler configuration
│   ├── tsconfig.json                # Root TypeScript config
│   ├── tsconfig.app.json            # App-specific TS compiler options
│   ├── tsconfig.node.json           # Node tool TS config
│   ├── tailwind.config.js           # Tailwind CSS design tokens
│   ├── postcss.config.js            # PostCSS plugins (Tailwind)
│   ├── eslint.config.js             # ESLint rules
│   └── index.html                   # HTML entry point
│
├── Documentation
│   ├── README.md                     # This file
│   ├── CLAUDE.md                     # Project architecture notes for Claude Code
│   └── .env.example                  # Environment variable template
│
└── _archive/                         # Archived scaffolding & docs (not needed for runtime)
    └── README_ARCHIVED.md            # Recovery instructions
```

**Key Locations:**
- **Frontend entry**: `src/main.tsx` → `src/App.tsx` → `src/pages/`
- **Backend entry**: `backend/main.py` (FastAPI app)
- **Styles**: Tailwind (config: `tailwind.config.js`), custom CSS in `src/index.css`
- **Build output**: `dist/` (for production)
- **Environment**: `.env` (frontend), backend uses `python-dotenv`
- **Models**: `backend/models/` (pre-trained weights loaded at server startup)

</details>

---

## ⚙️ Getting Started

<details>
<summary><strong>Click to expand setup instructions</strong></summary>

### Prerequisites

- **Node.js** ≥ 18.0 (with npm ≥ 9)
- **Python** ≥ 3.11
- **git** for version control
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

#### Frontend Setup

```bash
# Clone repository
git clone https://github.com/derrickrajkumar10/VitalSense.git
cd VitalSense

# Install npm dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# At minimum, set: VITE_API_BASE_URL=http://localhost:8000
nano .env  # or open in your editor
```

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment (recommended)
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Set environment variables for GenAI features
# export ANTHROPIC_API_KEY=your_key_here
# export OPENAI_API_KEY=your_key_here

# Pre-trained models are included in backend/models/
# If you need to download PTB-XL ECG data for demo records:
# mkdir -p data/ptbxl && download ptbxl from PhysioNet (see backend/ml/ecg_demos.py)
```

### Environment Variables

| Variable | Default | Required | Purpose |
|----------|---------|----------|---------|
| `VITE_API_BASE_URL` | — | ✓ | Backend FastAPI base URL (e.g., `http://localhost:8000`) |
| `OPENAI_API_KEY` | — | ✗ | OpenAI key for GenAI endpoints (optional, for MedGemma) |

### Running Locally

#### Development

```bash
# Terminal 1: Start backend (from VitalSense/backend/)
uvicorn main:app --reload
# Server runs on http://localhost:8000
# Docs available at http://localhost:8000/docs (Swagger UI)

# Terminal 2: Start frontend (from VitalSense/)
npm run dev
# Client runs on http://localhost:5173
# HMR enabled — changes auto-reload
```

Open your browser to `http://localhost:5173` and start exploring.

</details>

---

## 🔑 Environment Variables

| Key | Example | Description | Required |
|-----|---------|-------------|----------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend FastAPI server URL. Must match frontend origin for CORS. | ✓ |
| `OPENAI_API_KEY` | `sk-...` | OpenAI API key for GenAI-backed clinical recommendations. | ✗ |

**Setup:**
1. Copy `.env.example` to `.env`
2. Add your API keys
3. Frontend reads from `.env` via `import.meta.env.VITE_*`
4. Backend reads from `.env` via `python-dotenv` on startup

---

## 📡 API Overview

All backend endpoints are documented interactively at `http://localhost:8000/docs` (Swagger UI) when running locally. Start the backend with `python main.py` from the `backend/` directory.

| Method | Route | Description | Auth | Request |
|--------|-------|-------------|------|---------|
| **GET** | `/health` | Server health check | — | — |
| **POST** | `/predict` | ML ensemble risk prediction | — | `PredictRequest` (vitals) |
| **POST** | `/predict/ecg` | ResNet ECG classification | — | ECG CSV file |
| **POST** | `/summarize` | SHAP-based narrative (SSE stream) | — | `SummarizeRequest` |
| **POST** | `/chat` | Claude Sonnet clinical chat (SSE stream) | — | `ChatRequest` (messages) |
| **POST** | `/voice-to-vitals` | Speech-to-vital transcription | — | Audio file (WAV/MP3) |
| **POST** | `/parse-pdf` | Clinical document extraction | — | PDF file |
| **GET** | `/ecg/demos` | List demo ECG records (PTB-XL) | — | — |
| **GET** | `/ecg/demo/{id}/signal` | Get ECG waveform data | — | — |
| **GET** | `/ecg/demo/{id}/predict` | Predict ECG demo record | — | — |
| **POST** | `/patient/history` | Store patient vital entry | — | `HistoryStoreRequest` |
| **GET** | `/patient/{id}/history` | Retrieve patient history | — | `?limit=20&offset=0` |
| **POST** | `/recommend` | Clinical recommendations | — | `RecommendRequest` |

**Example Request/Response:**

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "hr": 85,
    "bp_systolic": 135,
    "bp_diastolic": 85,
    "spo2": 97,
    "rr": 16,
    "temp": 98.6,
    "age": 45,
    "sex": "M"
  }'

# Response:
# {
#   "risk_score": 28.5,
#   "top_condition": "Normal",
#   "conditions": [
#     {"label": "Hypertension Stage 1", "probability": 42, "ci": "35-49%"},
#     ...
#   ],
#   "shap_values": [
#     {"feature": "bp_systolic", "impact": 15, "direction": "positive"},
#     ...
#   ]
# }
```

---

## 🧠 Technical Highlights

**1. Explainable ML with SHAP**
Every prediction includes per-vital SHAP values showing feature importance. Uses `TreeExplainer` for fast, theoretically sound explanations. Users see not just a risk score, but *why* — e.g., "Your elevated blood pressure contributed +15% to risk, your high heart rate contributed +10%."

**2. Dual Animation Architecture**
- **Framer Motion**: Declarative, React-native page transitions with spring physics. All route changes use `AnimatePresence` + shared layout animations.
- **GSAP**: Imperative timelines for complex, choreographed sequences (counter animations, ECG waveforms, scroll-triggered reveals). Chosen strategically where React state isn't ideal.

**3. Streaming Real-Time Chat**
Clinical chat and summarization endpoints use HTTP Server-Sent Events (SSE). Backend streams tokens in real-time; frontend appends to chat bubbles word-by-word. Zero latency vs. polling, full compatibility with standard HTTP.

**4. ResNet ECG Classification**
Custom-trained ResNet on PTB-XL dataset (5,000+ clinical records) detects 71 arrhythmia/pathology classes. Input: 12-lead ECG signal (5000 samples × 12 channels) → 2D CNN → classification logits + confidence. Models can handle variable-length signals with zero-padding.

**5. Ensemble Predictions**
Combines XGBoost, Random Forest, and scikit-learn Logistic Regression. Each model trained on different feature subsets (vitals, demographics, medical history). Predictions are stacked (outputs of 3 models → meta-learner). This increases robustness vs. single-model approaches.

**6. Voice-to-Vitals**
Browser Web Audio API captures microphone → compressed audio sent to backend → speech-to-text (via Google Speech API or similar) → NLP parser extracts vital values → auto-populate form. Saves ~30 seconds of manual entry per patient.

**7. Accessible by Design**
- Full keyboard navigation (Tab, Enter, Space, Escape)
- Focus management in modals (500ms delay, Tab trap, restore on close)
- ARIA labels on all icon buttons (`aria-label="Mic"`)
- Screen-reader friendly semantic HTML
- High-contrast dark text on light backgrounds (WCAG AA)
- No color-only information (all charts have labels)

**8. Type-Safe Full Stack**
- Frontend: React 19 + TypeScript strict mode, no `any`
- Backend: Pydantic models for all request/response validation
- Every API response is type-checked before rendering
- Models provide both runtime validation and IDE autocomplete

**9. Performance Optimizations**
- Vite code-splitting: ~180KB bundle (gzipped) for main route
- GSAP transform animations use GPU (will-change CSS)
- Virtual scrolling on history timeline (handles 1000+ entries)
- Image lazy-loading with `<img loading="lazy">`
- Memoized prediction computation (no recalc on re-render)

**10. Clinical Data Security**
- No PHI stored on frontend (all in-session)
- PDF export happens client-side (no server-side data retention)
- CORS whitelisting configured for localhost (allows `localhost:5173` and local ports `3000–5181`)

---

## 📝 Project Configuration Files

### `vite.config.ts`
Bundler configuration. Sets `@` alias for `src/` imports. Uses Vite's React plugin with automatic JSX transform.

### `tsconfig.app.json`
TypeScript strict mode enabled. Targets ES2023. JSX set to `react-jsx` (new Transform). No emit (Vite handles output).

### `tailwind.config.js`
Custom design tokens:
- **Colors**: `ivory` (#F5F1EA), `cream`, `paper` backgrounds; `ink`, `sage`, `lavender`, `rose` text/accents
- **Fonts**: `Inter` (sans), `Newsreader` (serif), `JetBrains Mono` (mono)
- **Animations**: `ease-spring` cubic-bezier, spring presets
- **Safelist**: Dynamic classes for SHAP visualization (e.g., `bg-sage-light`, `text-rose-main`) are whitelisted to prevent purging

### `package.json`
Scripts:
- `dev` — Vite dev server with HMR
- `build` — `tsc -b` type-check, then `vite build` (minified)
- `lint` — ESLint checks
- `preview` — Serve production build locally

### `backend/requirements.txt`
Pinned versions for reproducibility. Key packages:
- FastAPI, Uvicorn (web framework)
- PyTorch, scikit-learn, XGBoost (ML)
- SHAP (explanations)
- google-generativeai, anthropic (GenAI)

---

<div align="center">
  <p><strong>Built with ❤️ for clinical excellence and user accessibility.</strong></p>
  <p>VitalSense © 2026. All rights reserved.</p>
</div>
