# VitalSense Codebase And Backend Handoff

## Purpose

This file is the working handoff for finishing the VitalSense backend and wiring the frontend to it. It is written against the repository as it exists now, not against assumptions in older docs.

Use this as the primary session bootstrap for Claude Code. The backend spec lives in [`backend_docs/`](./backend_docs), but some of those docs drift from the actual repo. This file resolves that drift first so implementation can proceed without wasting cycles.

## Repo Reality

- Project root: `vitalsense/`
- Frontend exists and is the only implemented app today.
- Backend does not exist yet. There is no tracked `backend/` directory in the repo.
- Backend planning/spec docs do exist in `vitalsense/backend_docs/`.
- This is a React 19 + Vite + TypeScript SPA.
- The current app is a polished prototype with local/demo logic, not a real full-stack product yet.

## Verified Current State

- `npm run lint` passes in the current repo.
- `npm run build` does not complete in this environment because Vite config loading fails with `spawn EPERM` before bundling. That is an environment/process issue here, not a confirmed TypeScript regression.
- Git inspection is blocked in this sandbox by `safe.directory` ownership rules, so do not rely on git status from this session unless that is fixed locally.
- `.env.example` only contains `VITE_ANTHROPIC_API_KEY`; it does not yet define `VITE_API_BASE_URL`.
- `zustand` is referenced in the backend wiring docs but is not currently installed in [`package.json`](./package.json).

## Actual Frontend Architecture

### Routing

Current routes in [`src/App.tsx`](./src/App.tsx):

- `/` -> `LandingPage`
- `/login` -> `LoginPage`
- `/signup` -> `SignupPage`
- `/dashboard` -> `DashboardPage`
- `/vitals` -> `VitalInputPage`
- `/predictions` -> `PredictionsPage`
- `/insights` -> `AIInsightsPage`
- `/history` -> `PatientHistoryPage`
- `/chat` -> `ClinicalChatPage`
- `/reports` -> `ClinicalReportsPage`
- `*` -> inline `NotFound`

There is no active `/settings` or `/comparison` route in the real app.

### Current State/Data Flow

- [`src/context/VitalsContext.tsx`](./src/context/VitalsContext.tsx) is the current app-level store.
- `VitalsContext` stores only locally submitted vitals.
- [`src/lib/predictionEngine.ts`](./src/lib/predictionEngine.ts) computes demo predictions entirely in the browser.
- `PredictionsPage` and `AIInsightsPage` currently depend on `useVitals()` plus `computePrediction()`.
- `ClinicalChatPage` currently calls Anthropic directly from the browser using `VITE_ANTHROPIC_API_KEY`.
- Dashboard data is largely static from [`src/data/dashboardData.ts`](./src/data/dashboardData.ts).
- Marketing content is static from [`src/data/mockData.ts`](./src/data/mockData.ts).

### Files That Backend Work Will Affect

- [`src/pages/VitalInputPage.tsx`](./src/pages/VitalInputPage.tsx)
- [`src/pages/PredictionsPage.tsx`](./src/pages/PredictionsPage.tsx)
- [`src/pages/AIInsightsPage.tsx`](./src/pages/AIInsightsPage.tsx)
- [`src/pages/ClinicalChatPage.tsx`](./src/pages/ClinicalChatPage.tsx)
- [`src/components/dashboard/DashboardSidebar.tsx`](./src/components/dashboard/DashboardSidebar.tsx)
- [`src/App.tsx`](./src/App.tsx)

### Files That Should Mostly Stay Untouched

Per repo intent and backend docs:

- `LandingPage`
- `LoginPage`
- `SignupPage`
- `LiveECG.tsx`
- `CursorGlow.tsx`
- CSS/layout/animation styling unless fixing a bug

## Backend Docs Inventory

These are the actual backend planning docs present in [`backend_docs/`](./backend_docs):

- [`backend_docs/CODEBASE_CONTEXT.md`](./backend_docs/CODEBASE_CONTEXT.md)
- [`backend_docs/API_SPEC.md`](./backend_docs/API_SPEC.md)
- [`backend_docs/ML_SPEC.md`](./backend_docs/ML_SPEC.md)
- [`backend_docs/FRONTEND_WIRING.md`](./backend_docs/FRONTEND_WIRING.md)
- [`backend_docs/DEMO_DATA.md`](./backend_docs/DEMO_DATA.md)
- [`backend_docs/CLAUDE_CODE_HANDOFF.md`](./backend_docs/CLAUDE_CODE_HANDOFF.md)

## Doc Drift You Must Correct Before Coding

These mismatches matter:

- `CLAUDE_CODE_HANDOFF.md` says to read from `docs/`, but the real folder is `backend_docs/`.
- `CLAUDE_CODE_HANDOFF.md` says “read all 5 documents,” but there are 6 files in `backend_docs/`.
- `CODEBASE_CONTEXT.md` mentions files and routes that do not exist now:
  - `src/types/index.ts`
  - `NeuralCommandDock.tsx`
  - `body-map.png`
  - `/settings`
  - `/comparison`
- `CODEBASE_CONTEXT.md` assumes Zustand is part of the stack already, but `zustand` is missing from [`package.json`](./package.json).
- The real frontend currently uses `VitalsContext`, not Zustand.
- The real frontend already contains direct browser Anthropic integration, which should be removed in favor of backend-mediated chat.

When docs conflict, use this priority:

1. Actual repo code
2. `API_SPEC.md`
3. `ML_SPEC.md`
4. `FRONTEND_WIRING.md`
5. `DEMO_DATA.md`
6. Older descriptive docs like `CODEBASE_CONTEXT.md`

## What The Backend Must Deliver

Per [`backend_docs/API_SPEC.md`](./backend_docs/API_SPEC.md), the backend must implement:

- `GET /health`
- `POST /predict`
- `POST /predict/ecg`
- `POST /summarize` as SSE
- `POST /chat` as SSE
- `POST /parse-pdf`
- `POST /voice-to-vitals`
- `POST /patient/history`
- `GET /patient/{patient_id}/history`

The backend must also:

- Load trained ML artifacts from `backend/models/`
- Handle hard-limit validation and anomaly detection
- Return prediction conditions, SHAP explanations, confidence intervals, trend deltas, overall risk, and model info
- Gracefully degrade when optional components are missing:
  - no MedGemma
  - no PTB-XL ECG model
  - Gemini unavailable

## ML / Inference Scope

Per [`backend_docs/ML_SPEC.md`](./backend_docs/ML_SPEC.md), the target stack is:

- Isolation Forest anomaly gate
- XGBoost + RandomForest + shallow PyTorch NN ensemble
- SHAP on the primary condition’s XGBoost model
- In-memory temporal trend store
- Bootstrap confidence calibration
- Gemini narrative generation
- Gemini multimodal extraction for PDF/audio
- Optional PTB-XL ECG ResNet

This is ambitious. If time becomes a constraint, the minimum acceptable backend for product completion is:

1. `GET /health`
2. `POST /predict`
3. `POST /summarize`
4. `POST /chat`
5. `POST /parse-pdf`
6. `POST /voice-to-vitals`
7. in-memory patient history
8. graceful stub for `/predict/ecg` if no PTB-XL model exists

## Frontend To Backend Gap Map

### Vital Input

Current:

- `VitalInputPage` submits to `VitalsContext`
- No network call
- PDF/voice tabs are UI-first, not backend-driven

Required:

- Replace submission path with `POST /predict`
- Add `src/store/predictionStore.ts`
- Add `src/lib/api.ts`
- Add background narrative streaming from `POST /summarize`
- Wire PDF upload to `POST /parse-pdf`
- Wire voice/audio flow to `POST /voice-to-vitals`
- Add preset demo patient loaders from [`backend_docs/DEMO_DATA.md`](./backend_docs/DEMO_DATA.md)

### Predictions / Insights

Current:

- `PredictionsPage` and `AIInsightsPage` use `computePrediction()` locally

Required:

- Replace local rule engine output with `predictionStore.result`
- Keep existing UI shell, animations, and layout
- Render condition bars, SHAP data, confidence, anomaly, trend, ECG findings from backend response

### Chat

Current:

- `ClinicalChatPage` calls Anthropic directly from the browser

Required:

- Remove direct browser LLM usage
- Replace with streamed `POST /chat`
- Seed first assistant message from streamed or stored narrative

### Dashboard

Current:

- Sidebar/right panel/dashboard visuals are mostly static

Required:

- At minimum, use latest prediction trend/value data where `FRONTEND_WIRING.md` expects it
- Preserve the current UI and animation behavior

## Backend Directory To Create

Per spec, create:

```text
backend/
  main.py
  requirements.txt
  .env
  models/
    train_ensemble.py
    train_ecg.py
    ensemble.pkl
    scaler.pkl
    iso_forest.pkl
    label_encoders.pkl
    ecg_resnet.pt
  ml/
    __init__.py
    predict.py
    shap_explain.py
    temporal.py
    confidence.py
  genai/
    __init__.py
    narrative.py
    medgemma.py
    multimodal.py
  parsers/
    __init__.py
    pdf_parser.py
  data/
    ptbxl/
```

## Recommended Execution Order

### Phase 0: Fix Session Assumptions

- Read `backend_docs/` from the real path, not `/docs`
- Accept that the frontend still uses `VitalsContext`
- Install missing frontend dependency: `zustand`
- Add `VITE_API_BASE_URL` support to frontend env handling

### Phase 1: Backend Scaffold

- Create `backend/`
- Add `requirements.txt`
- Add `.env` template
- Create FastAPI app with CORS, health endpoint, error schema, and startup model loading

### Phase 2: Ensemble Training

- Implement `backend/models/train_ensemble.py`
- Train and save:
  - `ensemble.pkl`
  - `scaler.pkl`
  - `iso_forest.pkl`
  - `label_encoders.pkl`
- Print real training metrics required by the ML spec

### Phase 3: Core Prediction Pipeline

- Implement hard-limit checks
- Implement anomaly gate
- Implement feature preprocessing/defaults
- Implement ensemble soft voting
- Implement severity mapping
- Implement SHAP for primary condition
- Implement temporal trend generation
- Implement bootstrap confidence
- Implement `POST /predict`

### Phase 4: GenAI And Multimodal

- Implement streamed narrative endpoint
- Implement streamed chat endpoint
- Implement PDF parsing
- Implement voice-to-vitals
- Add graceful fallbacks if Gemini is unavailable

### Phase 5: Optional ECG

- If PTB-XL dataset is present, implement/train ECG model
- If not present, keep `/predict/ecg` graceful and explicit

### Phase 6: Frontend Wiring

- Add Zustand store
- Add API client
- Replace `VitalsContext` usage in predictions/insights/chat flows
- Keep visual design untouched
- Add backend health-check on app load
- Add demo fallback using `DEMO_DATA.md`

### Phase 7: Verification

- Validate `GET /health`
- Validate `POST /predict` against schema
- Validate SSE format for `POST /summarize` and `POST /chat`
- Validate PDF/audio endpoints
- Run frontend lint
- Run frontend build locally outside this restricted sandbox if needed

## Claude Code Session Bootstrap

Paste this as the first message in Claude Code, adjusted to the real folder paths:

```text
You are working in the VitalSense repo. The frontend already exists in ./src and the backend has not been created yet.

Read these files first, in this exact order:
1. ./codebase.md
2. ./backend_docs/API_SPEC.md
3. ./backend_docs/ML_SPEC.md
4. ./backend_docs/FRONTEND_WIRING.md
5. ./backend_docs/DEMO_DATA.md
6. ./backend_docs/CODEBASE_CONTEXT.md

Critical corrections:
- The real docs folder is ./backend_docs, not ./docs
- The repo currently uses VitalsContext, not Zustand
- Zustand is not installed yet and must be added
- Do not assume /settings, /comparison, src/types/index.ts, NeuralCommandDock.tsx, or body-map.png exist

Your job:
1. Create the backend/ structure from ML_SPEC.md
2. Implement the FastAPI backend from API_SPEC.md
3. Train/save the ensemble artifacts required for /predict
4. Stub or implement /predict/ecg safely depending on PTB-XL availability
5. Add frontend wiring from FRONTEND_WIRING.md, but only for data flow and state, not styling
6. Replace direct browser Anthropic usage with backend chat streaming
7. Add demo fallback data from DEMO_DATA.md

Rules:
- Do not redesign the frontend
- Do not modify LandingPage, LoginPage, SignupPage unless fixing a real bug
- Do not break LiveECG.tsx or CursorGlow.tsx
- Prefer finishing the backend correctly over partially wiring every optional endpoint
- If Gemini is unavailable, ship a deterministic fallback instead of failing
- If PTB-XL is unavailable, keep /predict/ecg non-crashing and explicit
- Report blockers immediately when they are dataset, credential, or environment related

Before writing code, produce a short implementation plan based on codebase.md.
```

## Practical Backend Acceptance Criteria

- `backend/` exists with the structure above
- `GET /health` returns backend readiness flags
- `POST /predict` returns the schema from `API_SPEC.md`
- `POST /predict` handles median/default values for optional clinical fields
- `POST /predict` rejects physiologically impossible inputs with 422
- `POST /summarize` streams valid SSE
- `POST /chat` streams valid SSE
- `POST /parse-pdf` never crashes on a bad PDF
- `POST /voice-to-vitals` never crashes on malformed audio
- `/predict/ecg` is either functional or gracefully unavailable
- Frontend prediction pages read from API-backed store instead of `computePrediction()`
- `ClinicalChatPage` no longer exposes direct browser Anthropic calls

## High-Risk Areas

- `FRONTEND_WIRING.md` assumes a cleaner app state shape than the current repo actually has
- Training all ML layers exactly as written may be time-consuming and environment-sensitive
- Gemini and MedGemma are optional in practice even though the docs describe them as part of the target system
- PTB-XL is not bundled in the repo
- Build verification inside this sandbox is limited by the Vite `spawn EPERM` issue

## Recommended First Commands For Claude Code

Run these first:

```bash
ls
ls backend_docs
cat codebase.md
cat backend_docs/API_SPEC.md
cat backend_docs/ML_SPEC.md
cat backend_docs/FRONTEND_WIRING.md
cat backend_docs/DEMO_DATA.md
cat package.json
rg "useVitals|computePrediction|anthropic" src
```

Then start implementation in this order:

```bash
mkdir backend
mkdir backend/models backend/ml backend/genai backend/parsers backend/data
```

## Final Notes

- The backend docs are useful, but they are not perfectly in sync with the repo.
- This file is meant to be the corrected source of truth for finishing the backend from this exact checkout.
- If you update the repo substantially, update this file too so the next Claude session does not inherit stale assumptions.
