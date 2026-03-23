# CODEBASE_CONTEXT.md
# VitalSense — Full Codebase Context for Claude Code

---

## Project Overview

VitalSense is a React + Vite + TypeScript clinical AI platform.
The frontend is COMPLETE and already built. Do NOT redesign or restyle any existing pages.
Your job is to build the backend, create the Zustand prediction store, and wire the frontend to real API data.

---

## Tech Stack

### Frontend (already built — do not change structure)
- React 19 + Vite + TypeScript
- React Router v7
- Tailwind CSS with custom design tokens
- Framer Motion + GSAP + Lenis (all configured)
- Zustand for state management
- Custom fonts: Inter, Newsreader, JetBrains Mono

### Backend (to be built)
- Python 3.11+
- FastAPI + Uvicorn
- scikit-learn, xgboost, shap, torch, joblib
- google-generativeai (Gemini API)
- transformers + bitsandbytes (MedGemma local)
- pymupdf, python-multipart
- wfdb (PTB-XL ECG data loading)

---

## Full Frontend File Tree

```
src/
├── main.tsx
├── App.tsx
├── index.css
├── assets/
│   └── body-map.png
├── components/
│   ├── LiveECG.tsx              # GSAP animated PQRST waveform — DO NOT TOUCH
│   ├── BodyMap.tsx              # SVG hotspots + tabs + zoom
│   ├── DashboardSidebar.tsx     # Live HR simulation, vitals cards, appointments
│   ├── RightPanel.tsx           # Scan thumbnails, severity dots, doctor attribution
│   ├── VitalCard.tsx            # GSAP counter animation
│   ├── CriticalAlertModal.tsx   # GSAP entrance/exit modal
│   ├── CursorGlow.tsx           # Mouse tracking glow effect
│   ├── QuickEntryModal.tsx      # Quick vitals entry from dashboard
│   └── NeuralCommandDock.tsx    # Neural command dock bottom nav
├── pages/
│   ├── LandingPage.tsx          # Public landing — DO NOT TOUCH
│   ├── LoginPage.tsx            # Auth — DO NOT TOUCH
│   ├── SignupPage.tsx           # Auth — DO NOT TOUCH
│   ├── DashboardPage.tsx        # Main dashboard with body map
│   ├── VitalInputPage.tsx       # Vitals entry — Manual/Voice/CSV/PDF tabs
│   ├── PredictionsPage.tsx      # Results — gauge, condition bars, SHAP chart
│   ├── AIInsightsPage.tsx       # Insights — trajectory chart, correlation, actions
│   ├── PatientHistoryPage.tsx   # Timeline and trend charts
│   ├── ClinicalChatPage.tsx     # Chat interface + PDF report preview
│   ├── ClinicalReportsPage.tsx  # Full clinical report layout
│   └── SettingsPage.tsx         # Settings
├── store/
│   └── (predictionStore.ts — TO BE CREATED by you)
├── data/
│   ├── mockData.ts              # Landing page static data — DO NOT TOUCH
│   └── dashboardData.ts         # Dashboard static data — DO NOT TOUCH
└── types/
    └── index.ts                 # All TypeScript interfaces
```

---

## Existing TypeScript Interfaces (from types/index.ts)

```typescript
export interface AlertData {
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  vitals?: VitalReading[]
  timestamp: string
}

export interface VitalReading {
  name: string
  value: number | string
  unit: string
  status: 'normal' | 'elevated' | 'critical' | 'low'
}

export interface HotspotData {
  id: string
  organ: string
  top: string
  left: string
  width: string
  height: string
  vitals: VitalReading[]
  status: 'normal' | 'elevated' | 'critical'
}

export interface ScanData {
  id: string
  type: string
  date: string
  thumbnail: string
  severity: 'normal' | 'elevated' | 'critical'
  doctor: string
}

export interface AppointmentData {
  id: string
  doctor: string
  specialty: string
  date: string
  time: string
  type: 'in-person' | 'virtual'
}

export interface PatientData {
  id: string
  name: string
  age: number
  sex: 'M' | 'F'
  dob: string
  bloodType: string
  allergies: string[]
  conditions: string[]
}
```

---

## Design Tokens (Tailwind custom colors — do not hardcode hex values)

```
Background:   ivory (#F5F1EA), cream (#FAF7F2), paper (#FFFFFF)
Text:         ink.main (#2C2926), ink.muted (#7A746D), ink.soft (#A69F95)
Accents:      sage (#63755A), lavender (#6A608A), rose (#8A4B4B)
              sand (#A69580), amber (#B88222)
Severity:     critical = rose, elevated = amber, normal = sage
```

---

## React Router Routes

```typescript
/              → LandingPage
/login         → LoginPage
/signup        → SignupPage
/dashboard     → DashboardPage
/vitals        → VitalInputPage
/predictions   → PredictionsPage
/insights      → AIInsightsPage
/history       → PatientHistoryPage
/chat          → ClinicalChatPage
/reports       → ClinicalReportsPage
/settings      → SettingsPage
/comparison    → PatientComparisonPage (stub exists)
```

---

## VitalInputPage — Form Fields

The form has these input fields. These are the keys you will POST to the backend:

### Basic Vitals (always collected)
```
hr            number   Heart rate (bpm)          normal: 60–100
bp_systolic   number   Systolic BP (mmHg)         normal: 90–120
bp_diastolic  number   Diastolic BP (mmHg)        normal: 60–80
spo2          number   Blood oxygen (%)           normal: 95–100
rr            number   Respiratory rate (br/min)  normal: 12–20
temp          number   Body temperature (°C)      normal: 36.1–37.2
```

### Advanced Clinical Fields (shown in "Advanced" accordion)
```
age           number   Patient age
sex           string   "M" or "F"
chest_pain    string   "typical_angina" | "atypical_angina" | "non_anginal" | "asymptomatic"
cholesterol   number   Serum cholesterol (mg/dl)
fasting_bs    boolean  Fasting blood sugar > 120 mg/dl
rest_ecg      string   "normal" | "st_t_abnormality" | "lv_hypertrophy"
max_hr        number   Maximum heart rate achieved
exercise_angina boolean Exercise induced angina
st_depression number   ST depression (0–6)
st_slope      string   "upsloping" | "flat" | "downsloping"
num_vessels   number   Number of major vessels (0–3)
thal          string   "normal" | "fixed_defect" | "reversable_defect"
```

---

## PredictionsPage — UI Component Map

These components exist and are hardcoded. You will replace hardcoded values with real store data:

```
RadialGauge           ← conditions[0].probability (0–1 float)
ConfidenceArc         ← confidence.lower, confidence.upper (arcs around gauge)
ConditionBars         ← conditions[] array (name, probability, severity)
ShapWaterfallChart    ← shap[] array (feature, value, shap_score)
AnomalyBadge          ← anomaly_score, valid
ECGFindingsCard       ← ecg_findings[] (class, probability) — show if present
```

---

## DashboardSidebar — Vitals Cards

Currently simulates HR with Gaussian random walk every 3s.
After wiring: trend arrows on each vital card should come from `predictionStore.trend[].direction`.
The live simulation stays for HR only. Other vitals use last prediction's values.

---

## ClinicalChatPage — Chat Interface

- Already has a chat UI with message bubbles, input box, send button
- First message on page load should be auto-populated with `predictionStore.narrative`
- Subsequent user messages go to `POST /chat` as SSE stream
- The typing indicator (three dots) is already built — trigger it while SSE streams

---

## Existing GSAP Animations — DO NOT BREAK

- `LiveECG.tsx` uses GSAP timeline for PQRST waveform — do not import or modify
- `VitalCard.tsx` uses GSAP counter animation on mount — preserve the animation
- `CriticalAlertModal.tsx` uses GSAP for entrance/exit — do not touch
- All page transitions use Framer Motion `AnimatePresence` — preserve

---

## Environment Variables

Frontend `.env`:
```
VITE_API_BASE_URL=http://localhost:8000
```

Backend `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
MEDGEMMA_MODEL_PATH=./models/medgemma-4b-it
PORT=8000
```

---

## File Naming Conventions

- React components: PascalCase `.tsx`
- Utilities/stores: camelCase `.ts`
- Python files: snake_case `.py`
- Saved models: snake_case `.pkl` / `.pt`

---

## What Is Already Working (Do Not Break)

1. All 15 pages render without errors
2. Navigation between all routes works
3. Live ECG animation plays on DashboardPage
4. Body map hotspots are clickable
5. CriticalAlertModal fires when vitals exceed thresholds
6. VitalInputPage has 4 working tabs (Manual, Voice, CSV, PDF) — UI only, not wired
7. All GSAP/Framer Motion animations play correctly
8. Lenis smooth scroll is active on landing page

---

## CORS Configuration Required

Backend must allow:
```python
origins = ["http://localhost:5173", "http://localhost:3000", "https://vitalsense.vercel.app"]
```
