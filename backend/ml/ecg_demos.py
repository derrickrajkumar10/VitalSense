"""ECG demo record loader — finds one PTB-XL record per superclass."""
import os
import ast
import numpy as np

# Will be populated by _load_demos()
DEMO_RECORDS: dict[str, dict] = {}  # superclass -> {ecg_id, filename_lr, age, sex, description}

# Stored when _load_demos is called so get_demo_signal / get_demo_prediction can find files
_data_dir: str = ""

SUPERCLASS_LABELS = {
    "NORM": "Normal ECG",
    "MI":   "Myocardial Infarction",
    "STTC": "ST/T Change",
    "CD":   "Conduction Disturbance",
    "HYP":  "Hypertrophy",
}

TARGET_SUPERCLASSES = set(SUPERCLASS_LABELS.keys())


def _load_demos(data_dir: str):
    """Parse ptbxl_database.csv + scp_statements.csv to find one record per superclass."""
    global DEMO_RECORDS, _data_dir
    _data_dir = data_dir

    import pandas as pd

    # ── Build code → superclass mapping from scp_statements.csv ──────────────
    scp_path = os.path.join(data_dir, "scp_statements.csv")
    scp_df = pd.read_csv(scp_path, index_col=0)
    # The index holds SCP code names (e.g. "NORM", "IMI", "LAFB")
    # The column is "diagnostic_class"
    code_to_superclass: dict[str, str] = {}
    for code, row in scp_df.iterrows():
        superclass = row.get("diagnostic_class", "")
        if isinstance(superclass, str) and superclass in TARGET_SUPERCLASSES:
            code_to_superclass[str(code)] = superclass

    # ── Scan ptbxl_database.csv for one high-confidence record per superclass ─
    db_path = os.path.join(data_dir, "ptbxl_database.csv")
    db_df = pd.read_csv(db_path, index_col="ecg_id")

    found: dict[str, dict] = {}  # superclass -> metadata dict

    for ecg_id, row in db_df.iterrows():
        if len(found) == len(TARGET_SUPERCLASSES):
            break

        # Parse scp_codes — stored as a string-encoded dict e.g. "{'NORM': 100.0}"
        try:
            scp_codes: dict = ast.literal_eval(str(row["scp_codes"]))
        except (ValueError, SyntaxError):
            continue

        # Sum probabilities per superclass
        superclass_probs: dict[str, float] = {}
        for code, prob in scp_codes.items():
            sc = code_to_superclass.get(str(code))
            if sc:
                superclass_probs[sc] = superclass_probs.get(sc, 0.0) + float(prob)

        if not superclass_probs:
            continue

        # Dominant superclass
        dominant_sc = max(superclass_probs, key=lambda k: superclass_probs[k])
        dominant_prob = superclass_probs[dominant_sc]

        if dominant_sc in found:
            continue  # already have one for this class

        if dominant_prob < 80:
            continue  # not confident enough

        found[dominant_sc] = {
            "ecg_id": int(ecg_id),
            "superclass": dominant_sc,
            "label": SUPERCLASS_LABELS[dominant_sc],
            "filename_lr": str(row["filename_lr"]),
            "age": float(row["age"]) if "age" in row.index and not pd.isna(row["age"]) else None,
            "sex": str(row["sex"]) if "sex" in row.index and not pd.isna(row["sex"]) else None,
            "description": SUPERCLASS_LABELS[dominant_sc],
        }

    DEMO_RECORDS.clear()
    DEMO_RECORDS.update(found)


def get_demo_list() -> list[dict]:
    """Return list of demo records for the /ecg/demos endpoint."""
    return [
        {
            "ecg_id": meta["ecg_id"],
            "superclass": meta["superclass"],
            "label": meta["label"],
            "age": meta.get("age"),
            "sex": meta.get("sex"),
            "description": meta.get("description"),
        }
        for meta in DEMO_RECORDS.values()
    ]


def _find_meta_by_ecg_id(ecg_id: int) -> dict:
    """Look up metadata dict by ecg_id. Raises KeyError if not found."""
    for meta in DEMO_RECORDS.values():
        if meta["ecg_id"] == ecg_id:
            return meta
    raise KeyError(f"No demo record with ecg_id={ecg_id}")


def _load_signal(ecg_id: int):
    """Internal helper: load WFDB record, return (p_signal, sig_name, fs)."""
    import wfdb

    meta = _find_meta_by_ecg_id(ecg_id)
    # filename_lr is like 'records100/00000/00001_lr' — no extension
    record_path = os.path.join(_data_dir, meta["filename_lr"])
    rec = wfdb.rdrecord(record_path)
    p_signal: np.ndarray = rec.p_signal  # shape (1000, 12)
    # Replace NaN with 0.0
    p_signal = np.nan_to_num(p_signal, nan=0.0)
    return p_signal, rec.sig_name, rec.fs


def get_demo_signal(ecg_id: int) -> dict:
    """Read WFDB record, return 12 leads as lists.

    Returns: {ecg_id, lead_names: list[str], signals: list[list[float]], fs: int}
    """
    p_signal, sig_name, fs = _load_signal(ecg_id)
    # p_signal shape (1000, 12) → transpose to (12, 1000), each row is one lead
    signals = [lead.tolist() for lead in p_signal.T]
    return {
        "ecg_id": ecg_id,
        "lead_names": list(sig_name),
        "signals": signals,
        "fs": int(fs),
    }


def get_demo_prediction(ecg_id: int) -> dict:
    """Read WFDB record and run inference."""
    from ml.ecg_predict import run_ecg_prediction

    p_signal, _sig_name, _fs = _load_signal(ecg_id)
    # Convert to float32 (1000, 12)
    data = p_signal.astype(np.float32)
    result = run_ecg_prediction(data)
    return result
