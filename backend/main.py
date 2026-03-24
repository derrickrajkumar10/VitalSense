import os
import time
import uuid
import json
import asyncio
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# ── Model state ──────────────────────────────────────────────────────────────
_state: dict[str, Any] = {
    "models_loaded": False,
    "ensemble_ready": False,
    "ecg_model_ready": False,
    "gemini_connected": False,
    "medgemma_loaded": False,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Load ensemble ─────────────────────────────────────────────────────
    try:
        from ml.predict import load_models
        load_models()
        _state["models_loaded"] = True
        _state["ensemble_ready"] = True
        print("✓ Ensemble loaded")
    except Exception as e:
        print(f"✗ Ensemble not loaded: {e}")

    # ── Load ECG model (optional) ─────────────────────────────────────────
    ecg_path = os.path.join(os.path.dirname(__file__), "models", "ecg_resnet.pt")
    if os.path.exists(ecg_path):
        try:
            from ml.ecg_predict import load_ecg_model
            load_ecg_model(ecg_path)
            _state["ecg_model_ready"] = True
            print("✓ ECG model loaded")
        except Exception as e:
            print(f"✗ ECG model failed: {e}")
    else:
        print("⚠ ECG model not found — /predict/ecg will return 503")

    # ── Connect OpenAI ────────────────────────────────────────────────────
    openai_key = os.environ.get("OPENAI_API_KEY", "")
    if openai_key:
        try:
            from openai import AsyncOpenAI  # noqa: F401
            _state["gemini_connected"] = True
            print("✓ OpenAI connected")
        except Exception as e:
            print(f"✗ OpenAI connection failed: {e}")
    else:
        print("⚠ OPENAI_API_KEY not set — GenAI endpoints will use fallback")

    # ── MedGemma (OpenAI-backed clinical assistant) ───────────────────────
    try:
        from genai.medgemma import is_available
        if is_available():
            _state["medgemma_loaded"] = True
            print("✓ MedGemma (OpenAI) ready")
        else:
            print("⚠ MedGemma unavailable — OpenAI key not set")
    except Exception as e:
        print(f"⚠ MedGemma skipped: {e}")

    yield


app = FastAPI(title="VitalSense API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
        "http://localhost:5180",
        "http://localhost:5181",
        "http://localhost:3000",
        "https://vitalsense.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Error helpers ─────────────────────────────────────────────────────────────
def api_error(status: int, error: str, detail: str):
    raise HTTPException(status_code=status, detail={"error": error, "detail": detail})


# ── Schemas ───────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    hr: float
    bp_systolic: float
    bp_diastolic: float
    spo2: float
    rr: float
    temp: float
    age: float | None = None
    sex: str | None = None
    chest_pain: str | None = None
    cholesterol: float | None = None
    fasting_bs: bool | None = None
    rest_ecg: str | None = None
    max_hr: float | None = None
    exercise_angina: bool | None = None
    st_depression: float | None = None
    st_slope: str | None = None
    num_vessels: int | None = None
    thal: str | None = None
    patient_id: str | None = "anonymous"
    session_id: str | None = None


class SummarizeRequest(BaseModel):
    vitals: dict
    conditions: list
    shap: list
    trend: list
    patient_context: dict = {}


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    vitals_context: dict = {}
    predictions_context: dict = {}


class HistoryStoreRequest(BaseModel):
    patient_id: str
    prediction_result: dict
    timestamp: str


class RecommendRequest(BaseModel):
    vitals: dict
    conditions: list
    shap: list
    narrative: str = ''


# ── In-memory patient history store ──────────────────────────────────────────
_patient_history: dict[str, list] = {}


# ── /health ───────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "models_loaded": _state["models_loaded"],
        "ensemble_ready": _state["ensemble_ready"],
        "ecg_model_ready": _state["ecg_model_ready"],
        "gemini_connected": _state["gemini_connected"],
        "medgemma_loaded": _state["medgemma_loaded"],
    }


# ── /predict ──────────────────────────────────────────────────────────────────
@app.post("/predict")
async def predict(req: PredictRequest):
    if not _state["ensemble_ready"]:
        api_error(503, "Models not loaded", "Ensemble is still loading. Retry in a moment.")

    from ml.predict import run_prediction
    try:
        result = run_prediction(req.model_dump())
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail={"valid": False, "error": str(e), "detail": str(e)})
    except Exception as e:
        api_error(500, "Prediction failed", str(e))


# ── /predict/ecg ──────────────────────────────────────────────────────────────
@app.post("/predict/ecg")
async def predict_ecg(file: UploadFile = File(...)):
    if not _state["ecg_model_ready"]:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "ECG model unavailable",
                "detail": (
                    "PTB-XL model not trained. Download the dataset from "
                    "https://physionet.org/content/ptb-xl/1.0.3/ into backend/data/ptbxl/ "
                    "and run models/train_ecg.ipynb."
                ),
            },
        )
    try:
        import numpy as np
        from ml.ecg_predict import run_ecg_prediction
        contents = await file.read()
        import io
        data = np.genfromtxt(io.StringIO(contents.decode()), delimiter=",")
        if data.ndim != 2 or data.shape[1] != 12 or data.shape[0] != 1000:
            raise HTTPException(
                status_code=422,
                detail={
                    "error": "Invalid ECG format",
                    "detail": f"Expected 12 columns × 1000 rows. Got {data.shape[1] if data.ndim==2 else '?'} columns × {data.shape[0] if data.ndim>=1 else '?'} rows.",
                },
            )
        return run_ecg_prediction(data)
    except HTTPException:
        raise
    except Exception as e:
        api_error(500, "ECG inference failed", str(e))


# ── /summarize (SSE) ──────────────────────────────────────────────────────────
@app.post("/summarize")
async def summarize(req: SummarizeRequest):
    from genai.narrative import generate_narrative_stream

    async def event_stream():
        full = ""
        try:
            async for token in generate_narrative_stream(
                req.vitals, req.conditions, req.shap, req.trend, req.patient_context
            ):
                full += token
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield f"data: {json.dumps({'done': True, 'full_text': full})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


# ── /chat (SSE) ───────────────────────────────────────────────────────────────
@app.post("/chat")
async def chat(req: ChatRequest):
    from genai.narrative import generate_chat_stream

    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    async def event_stream():
        full = ""
        try:
            async for token in generate_chat_stream(
                messages, req.vitals_context, req.predictions_context
            ):
                full += token
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield f"data: {json.dumps({'done': True, 'full_text': full})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


# ── /parse-pdf ────────────────────────────────────────────────────────────────
@app.post("/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            api_error(422, "File too large", "PDF must be under 10MB.")
        from parsers.pdf_parser import parse_pdf_vitals
        result = await parse_pdf_vitals(contents)
        return result
    except HTTPException:
        raise
    except Exception as e:
        api_error(500, "PDF parsing failed", str(e))


# ── /voice-to-vitals ──────────────────────────────────────────────────────────
@app.post("/voice-to-vitals")
async def voice_to_vitals(audio: UploadFile = File(...)):
    try:
        contents = await audio.read()
        if len(contents) > 5 * 1024 * 1024:
            api_error(422, "File too large", "Audio must be under 5MB.")
        mime_type = audio.content_type or "audio/webm"
        from genai.multimodal import voice_to_vitals as _voice
        result = await _voice(contents, mime_type)
        return result
    except HTTPException:
        raise
    except Exception as e:
        api_error(500, "Voice parsing failed", str(e))


# ── /recommend ────────────────────────────────────────────────────────────────
@app.post("/recommend")
async def recommend(req: RecommendRequest):
    try:
        from genai.narrative import generate_recommendations
        return await generate_recommendations(req.vitals, req.conditions, req.shap, req.narrative)
    except Exception as e:
        api_error(500, "Recommendation failed", str(e))


# ── /patient/history (store) ──────────────────────────────────────────────────
@app.post("/patient/history")
async def store_history(req: HistoryStoreRequest):
    record_id = f"rec_{uuid.uuid4().hex[:8]}"
    entry = {
        "record_id": record_id,
        "timestamp": req.timestamp,
        "prediction_result": req.prediction_result,
        "overall_risk_score": req.prediction_result.get("overall_risk_score"),
        "overall_risk_label": req.prediction_result.get("overall_risk_label"),
        "primary_condition": (
            req.prediction_result.get("primary_condition", {}).get("name")
            if isinstance(req.prediction_result.get("primary_condition"), dict)
            else req.prediction_result.get("primary_condition")
        ),
        "vitals": {
            k: req.prediction_result.get(k)
            for k in ("hr", "bp_systolic", "bp_diastolic", "spo2", "rr", "temp")
        },
    }
    if req.patient_id not in _patient_history:
        _patient_history[req.patient_id] = []
    _patient_history[req.patient_id].append(entry)
    return {"stored": True, "record_id": record_id}


# ── /patient/{id}/history (fetch) ─────────────────────────────────────────────
@app.get("/patient/{patient_id}/history")
async def get_history(patient_id: str, limit: int = 20, offset: int = 0):
    records = _patient_history.get(patient_id, [])
    sliced = records[offset: offset + limit]
    return {"patient_id": patient_id, "records": sliced, "total": len(records)}
