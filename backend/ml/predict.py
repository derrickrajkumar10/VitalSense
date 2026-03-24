"""
Main prediction pipeline — Layers 1, 2, 4, 5, 6.
"""
import os
import sys
import time
import joblib
import numpy as np
from datetime import datetime, timezone

# ── Pickle fix: VitalsNet was defined in __main__ during training.
# Register it in __main__ so joblib.load can resolve the class reference.
import torch  # must be first on Windows (DLL load order)
from ml.model_def import VitalsNet as _VitalsNet
import __main__ as _main_module
if not hasattr(_main_module, 'VitalsNet'):
    _main_module.VitalsNet = _VitalsNet

# ── Globals ───────────────────────────────────────────────────────────────────
_ensemble = None
_scaler = None
_iso_forest = None
_label_encoders = None

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

# ── Hard physiological limits ─────────────────────────────────────────────────
HARD_LIMITS = {
    "hr":           (10, 300),
    "bp_systolic":  (50, 300),
    "bp_diastolic": (20, 200),
    "spo2":         (50, 100),
    "rr":           (2,  60),
    "temp":         (30.0, 45.0),
    "age":          (0,  120),
    "cholesterol":  (50, 700),
}

# ── Feature defaults (medians from UCI Heart Disease) ─────────────────────────
FEATURE_DEFAULTS = {
    "age": 54,
    "sex": 1,
    "chest_pain": 1,
    "cholesterol": 200,
    "fasting_bs": 0,
    "rest_ecg": 0,
    "max_hr": 150,
    "exercise_angina": 0,
    "st_depression": 0.0,
    "st_slope": 0,
    "num_vessels": 0,
    "thal": 3,
}

CATEGORICAL_MAPPINGS = {
    "sex":           {"M": 1, "F": 0},
    "chest_pain":    {"typical_angina": 0, "atypical_angina": 1, "non_anginal": 2, "asymptomatic": 3},
    "rest_ecg":      {"normal": 0, "st_t_abnormality": 1, "lv_hypertrophy": 2},
    "st_slope":      {"upsloping": 0, "flat": 1, "downsloping": 2},
    "thal":          {"normal": 3, "fixed_defect": 6, "reversable_defect": 7},
}

FEATURE_ORDER = [
    "age", "sex", "chest_pain", "bp_systolic", "cholesterol",
    "fasting_bs", "rest_ecg", "hr", "exercise_angina",
    "st_depression", "st_slope", "num_vessels", "thal",
    "spo2", "rr", "temp",
]

CONDITION_META = {
    "hypertension": {
        "name": "Hypertension Risk",
        "descriptions": {
            "critical": "Severely elevated blood pressure detected",
            "elevated": "Blood pressure above normal range",
            "normal": "Blood pressure within normal range",
        },
    },
    "arrhythmia": {
        "name": "Arrhythmia Risk",
        "descriptions": {
            "critical": "Significant heart rhythm abnormality detected",
            "elevated": "ST-T wave abnormality with elevated heart rate",
            "normal": "Heart rhythm within acceptable range",
        },
    },
    "hypoxia": {
        "name": "Hypoxia Risk",
        "descriptions": {
            "critical": "Critical oxygen saturation — immediate intervention needed",
            "elevated": "SpO2 below clinical safe threshold",
            "normal": "Oxygen saturation adequate",
        },
    },
    "tachycardia": {
        "name": "Tachycardia",
        "descriptions": {
            "critical": "Heart rate significantly above normal range",
            "elevated": "Heart rate moderately elevated",
            "normal": "Heart rate borderline elevated",
        },
    },
    "bradycardia": {
        "name": "Bradycardia",
        "descriptions": {
            "critical": "Heart rate critically low",
            "elevated": "Heart rate below normal range",
            "normal": "Heart rate not abnormally low",
        },
    },
}

CONDITION_ORDER = ["hypertension", "arrhythmia", "hypoxia", "tachycardia", "bradycardia"]

ANOMALY_SCORE_MIN = -0.5
ANOMALY_SCORE_MAX = 0.5


def load_models():
    global _ensemble, _scaler, _iso_forest, _label_encoders
    _ensemble      = joblib.load(os.path.join(MODELS_DIR, "ensemble.pkl"))
    _scaler        = joblib.load(os.path.join(MODELS_DIR, "scaler.pkl"))
    _iso_forest    = joblib.load(os.path.join(MODELS_DIR, "iso_forest.pkl"))
    _label_encoders = joblib.load(os.path.join(MODELS_DIR, "label_encoders.pkl"))


def _get_severity(prob: float) -> str:
    if prob >= 0.70:
        return "critical"
    if prob >= 0.45:
        return "elevated"
    return "normal"


def _get_color(severity: str) -> str:
    return {"critical": "rose", "elevated": "amber", "normal": "sage"}[severity]


def _encode_features(raw: dict) -> np.ndarray:
    """Encode and fill a flat feature vector in FEATURE_ORDER."""
    encoded = {}

    # Basic vitals (always present)
    for key in ("hr", "bp_systolic", "bp_diastolic", "spo2", "rr", "temp"):
        encoded[key] = float(raw[key])

    # Categorical fields
    for field, mapping in CATEGORICAL_MAPPINGS.items():
        val = raw.get(field)
        if val is None:
            encoded[field] = FEATURE_DEFAULTS[field]
        elif isinstance(val, str):
            encoded[field] = mapping.get(val, FEATURE_DEFAULTS[field])
        else:
            encoded[field] = float(val)

    # Remaining numeric optional fields
    for field in ("age", "cholesterol", "max_hr", "st_depression", "num_vessels"):
        val = raw.get(field)
        encoded[field] = float(val) if val is not None else float(FEATURE_DEFAULTS[field])

    # Booleans
    for field in ("fasting_bs", "exercise_angina"):
        val = raw.get(field)
        encoded[field] = int(bool(val)) if val is not None else FEATURE_DEFAULTS[field]

    return np.array([[encoded[f] for f in FEATURE_ORDER]], dtype=np.float32)


def run_prediction(raw: dict) -> dict:
    t0 = time.time()

    # ── Layer 1a: Hard-limit check ────────────────────────────────────────
    for field, (lo, hi) in HARD_LIMITS.items():
        val = raw.get(field)
        if val is None:
            continue
        val = float(val)
        if not (lo <= val <= hi):
            raise ValueError(
                f"HR value of {val} is outside physiologically possible range. Please verify inputs."
                if field == "hr"
                else f"{field} value of {val} is outside physiologically possible range ({lo}–{hi})."
            )

    X_raw = _encode_features(raw)
    X_scaled = _scaler.transform(X_raw)

    # ── Layer 1b: Isolation Forest ────────────────────────────────────────
    iso_score_raw = float(_iso_forest.decision_function(X_scaled)[0])
    is_anomaly = _iso_forest.predict(X_scaled)[0] == -1
    # Normalise to 0–1 (higher = more anomalous)
    anomaly_score = float(np.clip(
        1 - (iso_score_raw - ANOMALY_SCORE_MIN) / (ANOMALY_SCORE_MAX - ANOMALY_SCORE_MIN),
        0.0, 1.0
    ))

    if is_anomaly and anomaly_score > 0.85:
        raise ValueError(
            "Physiologically implausible values detected. Please verify inputs."
        )

    # ── Layer 2: Ensemble soft voting ─────────────────────────────────────
    import torch
    conditions_out = []
    probs_map = {}

    for condition_key in CONDITION_ORDER:
        models = _ensemble[condition_key]
        xgb_prob = float(models["xgb"].predict_proba(X_scaled)[0][1])
        rf_prob  = float(models["rf"].predict_proba(X_scaled)[0][1])

        # PyTorch NN
        nn_model = models["nn"]
        nn_model.eval()
        with torch.no_grad():
            x_t = torch.FloatTensor(X_scaled)
            nn_prob = float(nn_model(x_t).item())

        prob = xgb_prob * 0.45 + rf_prob * 0.35 + nn_prob * 0.20
        probs_map[condition_key] = {"xgb": xgb_prob, "rf": rf_prob, "nn": nn_prob, "ensemble": prob}

        severity = _get_severity(prob)
        meta = CONDITION_META[condition_key]
        conditions_out.append({
            "name": meta["name"],
            "key": condition_key,
            "probability": round(prob, 4),
            "severity": severity,
            "color": _get_color(severity),
            "description": meta["descriptions"][severity],
        })

    # Sort by probability descending
    conditions_out.sort(key=lambda c: c["probability"], reverse=True)
    primary = conditions_out[0]

    # ── Layer 4: SHAP ─────────────────────────────────────────────────────
    from ml.shap_explain import compute_shap
    primary_key = primary["key"]
    shap_values = compute_shap(
        _ensemble[primary_key]["xgb"],
        X_scaled,
        FEATURE_ORDER,
        raw,
    )

    # ── Layer 5: Temporal trends ──────────────────────────────────────────
    from ml.temporal import compute_trend, store_reading
    patient_id = raw.get("patient_id", "anonymous")
    vitals_for_trend = {k: raw[k] for k in ("hr", "bp_systolic", "spo2", "rr", "temp")}
    trend = compute_trend(patient_id, vitals_for_trend)
    store_reading(patient_id, vitals_for_trend, datetime.now(timezone.utc).isoformat())

    # ── Layer 6: Bootstrap confidence ─────────────────────────────────────
    from ml.confidence import bootstrap_confidence
    confidence = bootstrap_confidence(
        _ensemble[primary_key]["xgb"],
        X_scaled,
    )

    # ── Overall risk ──────────────────────────────────────────────────────
    overall_risk_score = round(
        sum(c["probability"] * (3 if c["severity"] == "critical" else 2 if c["severity"] == "elevated" else 1)
            for c in conditions_out) /
        sum(3 if c["severity"] == "critical" else 2 if c["severity"] == "elevated" else 1
            for c in conditions_out),
        4
    )
    if overall_risk_score >= 0.70:
        overall_risk_label = "High"
    elif overall_risk_score >= 0.40:
        overall_risk_label = "Moderate"
    else:
        overall_risk_label = "Low"

    inference_ms = int((time.time() - t0) * 1000)

    return {
        "valid": True,
        "anomaly_score": round(anomaly_score, 4),
        "anomaly_flag": bool(is_anomaly),
        "conditions": conditions_out,
        "primary_condition": {
            "name": primary["name"],
            "probability": primary["probability"],
            "severity": primary["severity"],
        },
        "shap": shap_values,
        "confidence": confidence,
        "trend": trend,
        "ecg_findings": None,
        "overall_risk_score": overall_risk_score,
        "overall_risk_label": overall_risk_label,
        "model_info": {
            "ensemble_version": "1.0",
            "models_used": ["xgboost", "random_forest", "pytorch_nn"],
            "training_dataset": "UCI Heart Disease (Cleveland + Hungarian + Swiss)",
            "n_training_samples": 918,
            "inference_time_ms": inference_ms,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "patient_id": patient_id,
        "session_id": raw.get("session_id", ""),
    }
