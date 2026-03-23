# CLAUDE_CODE_HANDOFF.md
# The exact prompt to paste into Claude Code

---

## PASTE THIS AS YOUR FIRST MESSAGE IN CLAUDE CODE:

---

You are building the complete backend and wiring the frontend for VitalSense, a clinical AI vitals analysis platform. All context is in the /docs folder. Read all 5 documents before writing a single line of code.

**Step 0 — Read all docs first:**
Read these files in order:
1. docs/CODEBASE_CONTEXT.md
2. docs/API_SPEC.md
3. docs/ML_SPEC.md
4. docs/FRONTEND_WIRING.md
5. docs/DEMO_DATA.md

**Step 1 — Set up backend structure:**
Create the backend/ directory structure exactly as specified in ML_SPEC.md.
Create requirements.txt with all dependencies listed.
Create .env with placeholder keys.

**Step 2 — Train ML models:**
Write and run backend/models/train_ensemble.py.
This must:
- Download UCI Heart Disease dataset using ucimlrepo
- Train XGBoost + RandomForest + PyTorch NN for all 5 conditions
- Train IsolationForest for anomaly detection
- Save ensemble.pkl, scaler.pkl, iso_forest.pkl, label_encoders.pkl to backend/models/
- Print accuracy and AUC scores after training

Do not proceed to Step 3 until models are saved and accuracy is printed.

**Step 3 — Build FastAPI backend:**
Build backend/main.py and all supporting files in backend/ml/, backend/genai/, backend/parsers/.
Implement all endpoints from API_SPEC.md.
Run the server and verify GET /health returns 200.

**Step 4 — Test prediction endpoint:**
Run the curl command from DEMO_DATA.md for the critical patient.
Verify the response matches the expected schema in API_SPEC.md.
Fix any errors before proceeding.

**Step 5 — Wire frontend:**
Create src/store/predictionStore.ts as specified in FRONTEND_WIRING.md.
Create src/lib/api.ts as specified.
Wire VitalInputPage, PredictionsPage, AIInsightsPage, ClinicalChatPage, DashboardSidebar.
Add the 3 preset patient buttons to VitalInputPage.
Create src/data/demoResult.ts with the demo fallback data from DEMO_DATA.md.

**Step 6 — Train ECG model (if time allows):**
Write backend/models/train_ecg.py.
Check if backend/data/ptbxl/ exists. If it does, train the 1D-ResNet.
If not, create a stub that returns graceful error from /predict/ecg.

**Step 7 — Final verification:**
Run npm run build — must pass with 0 errors.
Run npx tsc --noEmit — must pass with 0 TypeScript errors.
Make one full round-trip: submit critical patient vitals from VitalInputPage, verify PredictionsPage shows real data.

**Critical rules:**
- Do NOT change any CSS, colors, animations, or component layouts
- Do NOT touch LandingPage, LoginPage, SignupPage
- Do NOT modify LiveECG.tsx or CursorGlow.tsx
- The frontend design is complete and final — only add data wiring
- If you hit an error, fix it before moving to the next step
- If Gemini API is unreachable, implement a rule-based narrative fallback (simple string template)
- If PTB-XL data is missing, /predict/ecg must return a graceful 422, not crash the server

Go.

---

## IF CLAUDE CODE GETS STUCK — FOLLOW-UP PROMPTS:

**If models didn't train:**
> The models didn't save. Re-run train_ensemble.py and show me the printed accuracy scores before continuing.

**If /predict returns 500:**
> The /predict endpoint is returning 500. Show me the full traceback and fix it. Do not move on until curl returns the expected JSON schema.

**If frontend has TypeScript errors:**
> Run npx tsc --noEmit and fix every error shown. Do not add // @ts-ignore — fix the actual types.

**If narrative isn't streaming:**
> The /summarize SSE stream isn't working. Test it with the curl command from DEMO_DATA.md and show me the raw output. Fix the SSE format to match: data: {"token": "word"}\n\n

**If PDF upload doesn't work:**
> Test /parse-pdf with a sample PDF. If Gemini Embedding 2 API is unavailable, fall back to PyMuPDF regex extraction only. Never crash — always return partial results.
