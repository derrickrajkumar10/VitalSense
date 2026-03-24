"""Export real PTB-XL records as demo CSV files for the ECG upload demo."""
import pandas as pd
import ast
import os
import wfdb
import numpy as np

data_dir = os.path.join(os.path.dirname(__file__), "data", "ptbxl")
db = pd.read_csv(os.path.join(data_dir, "ptbxl_database.csv"), index_col="ecg_id")
scp = pd.read_csv(os.path.join(data_dir, "scp_statements.csv"), index_col=0)

# Build superclass map
code_to_sc = {}
for code, row in scp.iterrows():
    sc = str(row.get("diagnostic_class", ""))
    if sc in ("NORM", "MI", "STTC", "CD", "HYP"):
        code_to_sc[code] = sc

# Find best record per superclass (100% confident, from test fold 10)
targets = {"MI": None, "NORM": None}
found = {}

for ecg_id, row in db.iterrows():
    if len(found) == len(targets):
        break
    try:
        codes = ast.literal_eval(row["scp_codes"])
    except Exception:
        continue
    sc_probs: dict[str, float] = {}
    for code, prob in codes.items():
        sc = code_to_sc.get(code)
        if sc:
            sc_probs[sc] = sc_probs.get(sc, 0) + prob
    if not sc_probs:
        continue
    dominant = max(sc_probs, key=lambda k: sc_probs[k])
    if dominant in targets and dominant not in found and sc_probs[dominant] >= 100:
        found[dominant] = (ecg_id, row["filename_lr"])

out_dir = os.path.dirname(__file__)

for superclass, (ecg_id, filename_lr) in found.items():
    path = os.path.join(data_dir, filename_lr)
    rec = wfdb.rdrecord(path)
    sig = np.nan_to_num(rec.p_signal).astype(np.float32)  # (1000, 12)
    out_path = os.path.join(out_dir, f"demo_ecg_{superclass}.csv")
    np.savetxt(out_path, sig, delimiter=",", fmt="%.6f")
    print(f"Saved {superclass} | ecg_id={ecg_id} | {sig.shape} -> {out_path}")

print("Done.")
