# Claude Code Handoff

## Paste This As Your First Message In Claude Code

You are working in the VitalSense repository.

The frontend already exists in `./src`. The backend does not exist yet and must be created under `./backend`.

Read these files first, in this exact order, before writing code:

1. `./codebase.md`
2. `./backend_docs/API_SPEC.md`
3. `./backend_docs/ML_SPEC.md`
4. `./backend_docs/FRONTEND_WIRING.md`
5. `./backend_docs/DEMO_DATA.md`
6. `./backend_docs/CODEBASE_CONTEXT.md`

Important corrections before you start:

- The real docs folder is `./backend_docs`, not `./docs`
- The repo currently uses `VitalsContext`, not Zustand
- Zustand is not installed yet and must be added if you follow the wiring plan
- Do not assume these exist unless you confirm them in code:
  - `/settings`
  - `/comparison`
  - `src/types/index.ts`
  - `NeuralCommandDock.tsx`
  - `body-map.png`
- The current chat page still uses a direct browser Anthropic call and should be replaced by backend-mediated streaming

Your job:

1. Create the `backend/` directory structure described in `ML_SPEC.md`
2. Add backend dependencies and env placeholders
3. Implement the FastAPI backend from `API_SPEC.md`
4. Build and save the ensemble artifacts needed for `/predict`
5. Implement graceful fallbacks for optional components:
   - Gemini unavailable
   - MedGemma unavailable
   - PTB-XL unavailable
6. Wire the frontend to the backend using the plan in `FRONTEND_WIRING.md`, but preserve the existing UI and styling
7. Replace local demo prediction flow with API-backed state
8. Replace direct browser Anthropic usage with backend chat streaming
9. Add demo fallback data from `DEMO_DATA.md`

Non-negotiable rules:

- Do not redesign the frontend
- Do not change CSS, layout, or animations unless fixing an actual bug
- Do not modify `LandingPage`, `LoginPage`, or `SignupPage` unless necessary for a real integration fix
- Do not break `LiveECG.tsx` or `CursorGlow.tsx`
- Prefer correct backend completion over partially implementing every optional ML feature
- If Gemini is unavailable, ship deterministic fallback behavior instead of failing
- If PTB-XL is unavailable, `/predict/ecg` must fail gracefully and never crash the server
- If a doc conflicts with the repo, trust the repo first and `codebase.md` second

Execution order:

### Step 0

Inspect the repo and produce a short implementation plan based on `codebase.md`.

### Step 1

Create `backend/` with the structure defined in `ML_SPEC.md`.

### Step 2

Create:

- `backend/requirements.txt`
- `backend/.env`
- `backend/main.py`
- backend subpackages under `ml/`, `genai/`, `parsers/`, and `models/`

### Step 3

Implement and run `backend/models/train_ensemble.py`.

This must save:

- `backend/models/ensemble.pkl`
- `backend/models/scaler.pkl`
- `backend/models/iso_forest.pkl`
- `backend/models/label_encoders.pkl`

Do not move on until the training script saves artifacts and prints real metrics.

### Step 4

Implement the core prediction pipeline and make `POST /predict` match `API_SPEC.md`.

This includes:

- hard-limit validation
- anomaly detection
- preprocessing/default filling
- ensemble voting
- SHAP output
- temporal trend output
- confidence output
- overall risk output

### Step 5

Implement:

- `GET /health`
- `POST /summarize` as SSE
- `POST /chat` as SSE
- `POST /parse-pdf`
- `POST /voice-to-vitals`
- patient history endpoints

### Step 6

Handle ECG:

- if PTB-XL is present, implement/train it
- if PTB-XL is absent, keep `/predict/ecg` explicit and graceful

### Step 7

Wire the frontend:

- install and add Zustand if needed
- create `src/store/predictionStore.ts`
- create `src/lib/api.ts`
- wire `VitalInputPage`
- wire `PredictionsPage`
- wire `AIInsightsPage`
- wire `ClinicalChatPage`
- wire dashboard trend/value consumers as specified
- keep the UI intact

### Step 8

Verification:

- verify `GET /health`
- verify `POST /predict`
- verify SSE format for `/summarize`
- verify SSE format for `/chat`
- verify PDF and voice routes
- run frontend lint
- run frontend build if the local environment allows it

If you hit a blocker, stop and state exactly which type:

- missing dataset
- missing API key
- missing dependency
- environment permission issue
- schema mismatch

Then fix what is fixable and continue.

Go.

## If Claude Code Gets Stuck

### If the backend docs seem inconsistent

Use `codebase.md` as the corrected source of truth and continue.

### If `zustand` is missing

Install it and proceed with the store migration from `VitalsContext` to API-backed prediction state.

### If `/predict` returns 500

Print the traceback, fix the failing layer, and do not proceed until the response matches `API_SPEC.md`.

### If SSE is malformed

Fix the stream to emit:

```text
data: {"token":"..."}

data: {"done":true,"full_text":"..."}

```

### If Gemini is unavailable

Implement:

- template-based narrative fallback for `/summarize`
- deterministic fallback chat response for `/chat`
- regex/PyMuPDF fallback for `/parse-pdf`

### If PTB-XL is unavailable

Keep `/predict/ecg` non-crashing and return a clear 422 or explicit unavailable response per the backend contract.

### If frontend build fails

Separate:

- repo code issues
- local environment issues

Do not invent fixes for environment-specific permission failures.
