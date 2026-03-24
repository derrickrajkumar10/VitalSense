"""Layer 5 — In-memory temporal trend store."""
from collections import defaultdict, deque

_patient_history: dict = defaultdict(lambda: deque(maxlen=5))

TREND_VITALS = ["hr", "bp_systolic", "spo2", "rr", "temp"]

DISPLAY_NAMES = {
    "hr":           "Heart Rate",
    "bp_systolic":  "Systolic BP",
    "spo2":         "SpO2",
    "rr":           "Resp. Rate",
    "temp":         "Temperature",
}


def store_reading(patient_id: str, vitals: dict, timestamp: str):
    _patient_history[patient_id].append({"vitals": vitals, "timestamp": timestamp})


def compute_trend(patient_id: str, current_vitals: dict) -> list:
    history = list(_patient_history[patient_id])

    if len(history) < 2:
        return [
            {
                "vital":        v,
                "display_name": DISPLAY_NAMES.get(v, v),
                "current":      current_vitals.get(v, 0),
                "delta":        0,
                "direction":    "stable",
                "rate_per_hour": 0.0,
            }
            for v in TREND_VITALS
            if v in current_vitals
        ]

    oldest = history[0]["vitals"]
    n = len(history)
    trends = []

    for vital in TREND_VITALS:
        if vital not in current_vitals:
            continue
        current = current_vitals[vital]
        old_val = oldest.get(vital, current)
        delta = current - old_val
        rate = delta / n  # simplified: change per reading

        if abs(delta) < 2:
            direction = "stable"
        elif delta > 0:
            direction = "rising"
        else:
            direction = "falling"

        trends.append({
            "vital":         vital,
            "display_name":  DISPLAY_NAMES.get(vital, vital),
            "current":       current,
            "delta":         round(delta, 2),
            "direction":     direction,
            "rate_per_hour": round(rate, 3),
        })

    return trends
