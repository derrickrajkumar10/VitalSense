# API_SPEC.md
# VitalSense — Complete Backend API Contract

---

## Base URL

Development: `http://localhost:8000`
Production:  `https://vitalsense-api.up.railway.app`

---

## Global Rules

- All responses are JSON unless noted as SSE
- All endpoints must handle CORS for frontend origins
- All 4xx/5xx errors return `{ "error": string, "detail": string }`
- Request bodies are JSON unless noted as `multipart/form-data`
- All probability values are floats between 0.0 and 1.0
- All endpoints must respond within 10 seconds (except SSE streams)

---

## Endpoints

---

### GET /health

Health check. Called by frontend on app load to verify backend is alive.

**Response 200:**
```json
{
  "status": "ok",
  "models_loaded": true,
  "ensemble_ready": true,
  "ecg_model_ready": true,
  "gemini_connected": true,
  "medgemma_loaded": false
}
```

Note: `medgemma_loaded` can be false — it's optional and heavy. Never block startup on it.

---

### POST /predict

Main prediction endpoint. Runs all 8 ML layers in sequence.

**Request body:**
```json
{
  "hr": 88,
  "bp_systolic": 145,
  "bp_diastolic": 92,
  "spo2": 96,
  "rr": 18,
  "temp": 37.1,
  "age": 54,
  "sex": "M",
  "chest_pain": "typical_angina",
  "cholesterol": 240,
  "fasting_bs": false,
  "rest_ecg": "normal",
  "max_hr": 142,
  "exercise_angina": true,
  "st_depression": 1.4,
  "st_slope": "flat",
  "num_vessels": 1,
  "thal": "reversable_defect",
  "patient_id": "patient_001",
  "session_id": "session_xyz"
}
```

All advanced clinical fields are optional. If absent, use median values from training data as fallback. Basic vitals (hr, bp_systolic, bp_diastolic, spo2, rr, temp) are required.

**Response 200:**
```json
{
  "valid": true,
  "anomaly_score": 0.12,
  "anomaly_flag": false,

  "conditions": [
    {
      "name": "Hypertension Risk",
      "key": "hypertension",
      "probability": 0.78,
      "severity": "elevated",
      "color": "amber",
      "description": "Elevated blood pressure pattern detected"
    },
    {
      "name": "Arrhythmia Risk",
      "key": "arrhythmia",
      "probability": 0.31,
      "severity": "normal",
      "color": "sage",
      "description": "Heart rhythm within acceptable range"
    },
    {
      "name": "Hypoxia Risk",
      "key": "hypoxia",
      "probability": 0.15,
      "severity": "normal",
      "color": "sage",
      "description": "Oxygen saturation adequate"
    },
    {
      "name": "Tachycardia",
      "key": "tachycardia",
      "probability": 0.22,
      "severity": "normal",
      "color": "sage",
      "description": "Heart rate borderline elevated"
    },
    {
      "name": "Bradycardia",
      "key": "bradycardia",
      "probability": 0.04,
      "severity": "normal",
      "color": "sage",
      "description": "Heart rate not abnormally low"
    }
  ],

  "primary_condition": {
    "name": "Hypertension Risk",
    "probability": 0.78,
    "severity": "elevated"
  },

  "shap": [
    { "feature": "bp_systolic", "display_name": "Systolic BP", "value": 145, "shap_score": 0.34, "direction": "positive" },
    { "feature": "age", "display_name": "Age", "value": 54, "shap_score": 0.21, "direction": "positive" },
    { "feature": "cholesterol", "display_name": "Cholesterol", "value": 240, "shap_score": 0.18, "direction": "positive" },
    { "feature": "thal", "display_name": "Thal", "value": "reversable_defect", "shap_score": 0.15, "direction": "positive" },
    { "feature": "spo2", "display_name": "SpO2", "value": 96, "shap_score": -0.09, "direction": "negative" },
    { "feature": "hr", "display_name": "Heart Rate", "value": 88, "shap_score": 0.07, "direction": "positive" },
    { "feature": "rr", "display_name": "Resp. Rate", "value": 18, "shap_score": -0.04, "direction": "negative" }
  ],

  "confidence": {
    "mean": 0.78,
    "lower": 0.71,
    "upper": 0.85,
    "std": 0.07,
    "label": "High",
    "n_bootstrap": 50
  },

  "trend": [
    { "vital": "hr", "display_name": "Heart Rate", "current": 88, "delta": 4, "direction": "rising", "rate_per_hour": 2.1 },
    { "vital": "bp_systolic", "display_name": "Systolic BP", "current": 145, "delta": 8, "direction": "rising", "rate_per_hour": 3.5 },
    { "vital": "spo2", "display_name": "SpO2", "current": 96, "delta": -1, "direction": "falling", "rate_per_hour": -0.4 },
    { "vital": "rr", "display_name": "Resp. Rate", "current": 18, "delta": 0, "direction": "stable", "rate_per_hour": 0.0 },
    { "vital": "temp", "display_name": "Temperature", "current": 37.1, "delta": 0.1, "direction": "stable", "rate_per_hour": 0.05 }
  ],

  "ecg_findings": null,

  "overall_risk_score": 0.64,
  "overall_risk_label": "Moderate",

  "model_info": {
    "ensemble_version": "1.0",
    "models_used": ["xgboost", "random_forest", "pytorch_nn"],
    "training_dataset": "UCI Heart Disease (Cleveland + Hungarian + Swiss)",
    "n_training_samples": 918,
    "inference_time_ms": 87
  },

  "timestamp": "2026-03-23T10:30:00Z",
  "patient_id": "patient_001",
  "session_id": "session_xyz"
}
```

**Response 422 (anomaly detected — physiologically implausible inputs):**
```json
{
  "valid": false,
  "anomaly_score": 0.94,
  "anomaly_flag": true,
  "error": "Physiologically implausible values detected",
  "detail": "HR value of 450 is outside physiologically possible range. Please verify inputs."
}
```

---

### POST /predict/ecg

ECG-specific prediction. Called when user uploads an ECG CSV file.

**Request body:** `multipart/form-data`
- `file`: CSV file with 12 columns (one per lead) × 1000 rows (10s at 100Hz)

**Response 200:**
```json
{
  "ecg_findings": [
    { "class": "NORM", "label": "Normal ECG", "probability": 0.12 },
    { "class": "MI", "label": "Myocardial Infarction", "probability": 0.61 },
    { "class": "STTC", "label": "ST/T Change", "probability": 0.18 },
    { "class": "CD", "label": "Conduction Disturbance", "probability": 0.07 },
    { "class": "HYP", "label": "Hypertrophy", "probability": 0.02 }
  ],
  "primary_finding": { "class": "MI", "label": "Myocardial Infarction", "probability": 0.61 },
  "model": "1D-ResNet trained on PTB-XL (21,799 records)",
  "macro_auc": 0.93,
  "inference_time_ms": 1840
}
```

**Response 422 (wrong CSV format):**
```json
{
  "error": "Invalid ECG format",
  "detail": "Expected 12 columns × 1000 rows. Got 2 columns × 500 rows."
}
```

---

### POST /summarize

Generates a clinical narrative using Gemini 2.5 Flash. Returns SSE stream.

**Request body:**
```json
{
  "vitals": {
    "hr": 88, "bp_systolic": 145, "bp_diastolic": 92,
    "spo2": 96, "rr": 18, "temp": 37.1
  },
  "conditions": [...],
  "shap": [...],
  "trend": [...],
  "patient_context": {
    "age": 54, "sex": "M", "name": "Patient"
  }
}
```

**Response:** `text/event-stream` (SSE)
```
data: {"token": "Based"}
data: {"token": " on"}
data: {"token": " the"}
...
data: {"done": true, "full_text": "Based on the current vitals..."}
```

Full narrative structure (Gemini must produce this):
- Paragraph 1: Current patient status in plain English
- Paragraph 2: Key risk factors identified, which vitals are driving them
- Paragraph 3: Recommended immediate actions for the care team

Total length: 150–250 words. Clinical but readable. No jargon.

---

### POST /chat

Multi-turn chat with MedGemma (local) or Gemini Flash fallback. SSE stream.

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "What does the elevated systolic BP mean?" }
  ],
  "vitals_context": {
    "hr": 88, "bp_systolic": 145, "bp_diastolic": 92,
    "spo2": 96, "rr": 18, "temp": 37.1
  },
  "predictions_context": {
    "primary_condition": "Hypertension Risk",
    "overall_risk_score": 0.64
  }
}
```

**Response:** `text/event-stream` (SSE)
```
data: {"token": "Elevated"}
data: {"token": " systolic"}
...
data: {"done": true}
```

System prompt for chat: You are VitalSense AI, a clinical assistant. You have access to the patient's current vitals and ML predictions. Answer questions clearly, cite specific vital values when relevant, and always recommend consulting a physician for diagnosis.

---

### POST /parse-pdf

Parses a medical PDF report and extracts vitals. Uses Gemini Embedding 2 + PyMuPDF.

**Request body:** `multipart/form-data`
- `file`: PDF file (max 10MB)

**Response 200:**
```json
{
  "vitals": {
    "hr": 76,
    "bp_systolic": 128,
    "bp_diastolic": 82,
    "spo2": 98,
    "rr": 15,
    "temp": 36.8,
    "cholesterol": 210,
    "age": 48,
    "sex": "F"
  },
  "fields_found": ["hr", "bp_systolic", "bp_diastolic", "cholesterol", "age", "sex"],
  "fields_missing": ["spo2", "rr", "temp"],
  "confidence": 0.87,
  "method": "gemini-embedding-2 + pymupdf-regex",
  "raw_text_preview": "Patient: Jane Smith, Age: 48..."
}
```

**Response 422 (not a medical report):**
```json
{
  "error": "Unable to parse medical data",
  "detail": "Document does not appear to contain vital sign measurements.",
  "vitals": {},
  "confidence": 0.0
}
```

---

### POST /voice-to-vitals

Converts voice recording to structured vitals using Gemini 2.5 Flash audio input.

**Request body:** `multipart/form-data`
- `audio`: WebM/MP3/WAV file (max 5MB, max 30 seconds)

**Response 200:**
```json
{
  "vitals": {
    "hr": 88,
    "bp_systolic": 140,
    "bp_diastolic": 90,
    "spo2": 97
  },
  "transcript": "Heart rate 88, blood pressure 140 over 90, oxygen saturation 97 percent",
  "fields_found": ["hr", "bp_systolic", "bp_diastolic", "spo2"],
  "confidence": 0.92
}
```

---

### POST /patient/history

Stores a prediction result for a patient session (in-memory SQLite).

**Request body:**
```json
{
  "patient_id": "patient_001",
  "prediction_result": { ...full /predict response... },
  "timestamp": "2026-03-23T10:30:00Z"
}
```

**Response 200:**
```json
{ "stored": true, "record_id": "rec_abc123" }
```

---

### GET /patient/{patient_id}/history

Returns last N prediction records for a patient.

**Query params:** `?limit=20&offset=0`

**Response 200:**
```json
{
  "patient_id": "patient_001",
  "records": [
    {
      "record_id": "rec_abc123",
      "timestamp": "2026-03-23T10:30:00Z",
      "overall_risk_score": 0.64,
      "overall_risk_label": "Moderate",
      "primary_condition": "Hypertension Risk",
      "vitals": { "hr": 88, "bp_systolic": 145, ... }
    }
  ],
  "total": 1
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 422  | Validation error (bad input, anomaly detected, wrong file format) |
| 500  | Internal error (model inference failed, Gemini API unreachable) |
| 503  | Models not loaded yet (startup in progress) |

---

## SSE Stream Format

All streaming endpoints use this exact format:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"token": "word"}\n\n
data: {"token": "word"}\n\n
data: {"done": true, "full_text": "complete text"}\n\n
```

Frontend reads this with `EventSource` or `fetch` + `ReadableStream`.

---

## Startup Sequence

On `uvicorn main:app --host 0.0.0.0 --port 8000`:

1. Load `models/ensemble.pkl` (XGBoost + RF + NN)
2. Load `models/scaler.pkl`
3. Load `models/ecg_resnet.pt` (if file exists — optional)
4. Initialize Gemini API client (test connectivity)
5. Attempt to load MedGemma (optional — log warning if not found, continue)
6. Set all `*_ready` flags in health check
7. Begin accepting requests

Total startup time target: under 10 seconds (without MedGemma), under 60 seconds (with MedGemma).
