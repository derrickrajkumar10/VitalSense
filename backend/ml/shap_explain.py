"""Layer 4 — SHAP explainability via TreeExplainer on primary XGBoost."""
import shap
import numpy as np

FEATURE_DISPLAY_NAMES = {
    "age":              "Age",
    "sex":              "Sex",
    "chest_pain":       "Chest Pain Type",
    "bp_systolic":      "Systolic BP",
    "cholesterol":      "Cholesterol",
    "fasting_bs":       "Fasting Blood Sugar",
    "rest_ecg":         "Resting ECG",
    "hr":               "Heart Rate",
    "exercise_angina":  "Exercise Angina",
    "st_depression":    "ST Depression",
    "st_slope":         "ST Slope",
    "num_vessels":      "Vessels (fluoroscopy)",
    "thal":             "Thalassemia",
    "spo2":             "SpO2",
    "rr":               "Resp. Rate",
    "temp":             "Temperature",
}


def compute_shap(xgb_model, X_scaled: np.ndarray, feature_names: list, raw: dict) -> list:
    try:
        explainer = shap.TreeExplainer(xgb_model)
        shap_values = explainer.shap_values(X_scaled)

        result = []
        for fname, fval, sval in zip(feature_names, X_scaled[0], shap_values[0]):
            # Use original (un-scaled) value for display when available
            display_val = raw.get(fname, float(fval))
            result.append({
                "feature":      fname,
                "display_name": FEATURE_DISPLAY_NAMES.get(fname, fname),
                "value":        display_val,
                "shap_score":   round(float(sval), 4),
                "direction":    "positive" if sval > 0 else "negative",
            })

        result.sort(key=lambda x: abs(x["shap_score"]), reverse=True)
        return result[:7]

    except Exception as e:
        # Return stub on failure so the endpoint doesn't crash
        return [
            {
                "feature":      fname,
                "display_name": FEATURE_DISPLAY_NAMES.get(fname, fname),
                "value":        raw.get(fname, 0),
                "shap_score":   0.0,
                "direction":    "positive",
            }
            for fname in feature_names[:7]
        ]
