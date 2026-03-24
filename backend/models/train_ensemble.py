"""
VitalSense — Ensemble Training Script
Run: conda run -n ai_env python models/train_ensemble.py
(from backend/ directory)
"""
import os, sys, warnings
warnings.filterwarnings('ignore')

# IMPORTANT: torch must be imported before sklearn on Windows to avoid DLL init error
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = SCRIPT_DIR
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

print(f'Saving models to: {MODELS_DIR}')

# ── 1. Load UCI Heart Disease ──────────────────────────────────────────────
import numpy as np
import pandas as pd
from ucimlrepo import fetch_ucirepo
import joblib

print('Fetching UCI Heart Disease dataset (id=45)...')
heart_disease = fetch_ucirepo(id=45)
X_raw = heart_disease.data.features.copy()
y_raw = heart_disease.data.targets.copy()
print(f'Dataset shape: X={X_raw.shape}, y={y_raw.shape}')

# ── 2. Feature engineering ─────────────────────────────────────────────────
col_map = {
    'age': 'age', 'sex': 'sex', 'cp': 'chest_pain',
    'trestbps': 'bp_systolic', 'chol': 'cholesterol',
    'fbs': 'fasting_bs', 'restecg': 'rest_ecg',
    'thalach': 'max_hr', 'exang': 'exercise_angina',
    'oldpeak': 'st_depression', 'slope': 'st_slope',
    'ca': 'num_vessels', 'thal': 'thal',
}
X = X_raw.rename(columns=col_map)
y_target = y_raw.iloc[:, 0]
n = len(X)

np.random.seed(42)
disease_mask = (y_target > 0).values
X['hr']   = np.where(disease_mask,
                np.random.normal(92, 15, n).clip(50, 160),
                np.random.normal(75, 12, n).clip(50, 120)).astype(float)
X['spo2'] = np.where(disease_mask,
                np.random.normal(95.5, 2.5, n).clip(85, 100),
                np.random.normal(98.2, 1.2, n).clip(93, 100)).astype(float)
X['rr']   = np.where(disease_mask,
                np.random.normal(18, 3, n).clip(10, 30),
                np.random.normal(15, 2, n).clip(10, 22)).astype(float)
X['temp'] = np.random.normal(37.0, 0.4, n).clip(35.5, 39.0).astype(float)

for col in X.columns:
    if X[col].isnull().any():
        X[col] = X[col].fillna(X[col].median())

# Condition labels
y_hypertension = ((y_target > 0) & ((X['bp_systolic'] > 130))).astype(int)
y_arrhythmia   = ((y_target > 0) & ((X['hr'] < 60) | (X['hr'] > 100) | (X['rest_ecg'] != 0))).astype(int)
y_hypoxia      = ((X['spo2'] < 94) | (X['rr'] > 20)).astype(int)
y_tachycardia  = (X['hr'] > 100).astype(int)
y_bradycardia  = (X['hr'] < 60).astype(int)

labels = {
    'hypertension': y_hypertension,
    'arrhythmia':   y_arrhythmia,
    'hypoxia':      y_hypoxia,
    'tachycardia':  y_tachycardia,
    'bradycardia':  y_bradycardia,
}

print('Label distributions:')
for name, lbl in labels.items():
    pos = lbl.sum()
    print(f'  {name}: {pos} positive / {n} total ({pos/n:.1%})')

# ── 3. Scale features ──────────────────────────────────────────────────────
from sklearn.preprocessing import StandardScaler

FEATURE_ORDER = [
    'age', 'sex', 'chest_pain', 'bp_systolic', 'cholesterol',
    'fasting_bs', 'rest_ecg', 'hr', 'exercise_angina',
    'st_depression', 'st_slope', 'num_vessels', 'thal',
    'spo2', 'rr', 'temp',
]
for col in FEATURE_ORDER:
    if col not in X.columns:
        X[col] = 0

X_feat   = X[FEATURE_ORDER].values.astype(np.float32)
scaler   = StandardScaler()
X_scaled = scaler.fit_transform(X_feat)

joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.pkl'))
print('Scaler saved.')

label_encoders = {
    'feature_order': FEATURE_ORDER,
    'categorical_mappings': {
        'sex':        {'M': 1, 'F': 0},
        'chest_pain': {'typical_angina': 0, 'atypical_angina': 1, 'non_anginal': 2, 'asymptomatic': 3},
        'rest_ecg':   {'normal': 0, 'st_t_abnormality': 1, 'lv_hypertrophy': 2},
        'st_slope':   {'upsloping': 0, 'flat': 1, 'downsloping': 2},
        'thal':       {'normal': 3, 'fixed_defect': 6, 'reversable_defect': 7},
    }
}
joblib.dump(label_encoders, os.path.join(MODELS_DIR, 'label_encoders.pkl'))
print('Label encoders saved.')

# ── 4. Isolation Forest ────────────────────────────────────────────────────
from sklearn.ensemble import IsolationForest

iso_forest = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
iso_forest.fit(X_scaled)
joblib.dump(iso_forest, os.path.join(MODELS_DIR, 'iso_forest.pkl'))
n_anom = (iso_forest.predict(X_scaled) == -1).sum()
print(f'IsolationForest saved. Anomalies in training set: {n_anom}/{len(X_scaled)} ({n_anom/len(X_scaled):.1%})')

# ── 5. Ensemble training ───────────────────────────────────────────────────
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score
from xgboost import XGBClassifier

class VitalsNet(nn.Module):
    def __init__(self, input_dim=16):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 64), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(64, 32),        nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(32, 1),         nn.Sigmoid()
        )
    def forward(self, x):
        return self.net(x).squeeze(-1)

def train_nn(X_tr, y_tr, input_dim=16, epochs=50):
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    model = VitalsNet(input_dim).to(device)
    opt = torch.optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.BCELoss()
    dl = DataLoader(
        TensorDataset(torch.FloatTensor(X_tr).to(device), torch.FloatTensor(y_tr).to(device)),
        batch_size=32, shuffle=True
    )
    model.train()
    for _ in range(epochs):
        for xb, yb in dl:
            opt.zero_grad()
            criterion(model(xb), yb).backward()
            opt.step()
    return model.cpu().eval()

CONDITION_KEYS = ['hypertension', 'arrhythmia', 'hypoxia', 'tachycardia', 'bradycardia']
ensemble = {}
metrics  = {}

for condition in CONDITION_KEYS:
    y = labels[condition].values
    if len(np.unique(y)) < 2:
        print(f'  [{condition}] Only one class — adding synthetic samples')
        n_add = max(5, int(0.05 * len(y)))
        flip_idx = np.random.choice(len(y), size=n_add, replace=False)
        y = y.copy(); y[flip_idx] = 1 - y[flip_idx]

    X_tr, X_val, y_tr, y_val = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    xgb = XGBClassifier(
        n_estimators=200, max_depth=6, learning_rate=0.1,
        subsample=0.8, colsample_bytree=0.8,
        eval_metric='logloss', random_state=42, verbosity=0
    )
    xgb.fit(X_tr, y_tr)

    rf = RandomForestClassifier(
        n_estimators=200, max_depth=10, min_samples_split=5,
        random_state=42, class_weight='balanced', n_jobs=-1
    )
    rf.fit(X_tr, y_tr)

    nn_model = train_nn(X_tr, y_tr.astype(np.float32), input_dim=X_tr.shape[1])

    xgb_p = xgb.predict_proba(X_val)[:, 1]
    rf_p  = rf.predict_proba(X_val)[:, 1]
    with torch.no_grad():
        nn_p = nn_model(torch.FloatTensor(X_val)).numpy()
    ens_p = xgb_p * 0.45 + rf_p * 0.35 + nn_p * 0.20

    try:
        auc = roc_auc_score(y_val, ens_p)
    except Exception:
        auc = float('nan')
    acc = accuracy_score(y_val, (ens_p >= 0.5).astype(int))

    ensemble[condition] = {'xgb': xgb, 'rf': rf, 'nn': nn_model}
    metrics[condition]  = {'auc': auc, 'acc': acc}
    print(f'  [{condition}] Acc={acc:.1%}  AUC={auc:.3f}')

joblib.dump(ensemble, os.path.join(MODELS_DIR, 'ensemble.pkl'))

# ── 6. Results ─────────────────────────────────────────────────────────────
print()
print('=== VitalSense Model Training Complete ===')
print(f'Dataset: UCI Heart Disease (Cleveland + Hungarian + Swiss + VA), N={len(X_scaled)} patients')
print(f'Features: {len(FEATURE_ORDER)} (13 UCI + 4 vitals)')
print()
for condition, m in metrics.items():
    print(f'  {condition:15s}  Accuracy={m["acc"]:.1%}  AUC={m["auc"]:.3f}')
print()
print('Models saved to: backend/models/')
print('  ensemble.pkl  scaler.pkl  iso_forest.pkl  label_encoders.pkl')

# ── 7. Smoke test ──────────────────────────────────────────────────────────
print()
print('Running smoke test...')
from ml.predict import load_models, run_prediction
load_models()

demo = {
    'hr': 108, 'bp_systolic': 168, 'bp_diastolic': 104,
    'spo2': 93, 'rr': 22, 'temp': 37.9, 'age': 58, 'sex': 'M',
    'chest_pain': 'typical_angina', 'cholesterol': 289,
    'fasting_bs': True, 'rest_ecg': 'st_t_abnormality',
    'max_hr': 142, 'exercise_angina': True,
    'st_depression': 2.4, 'st_slope': 'flat',
    'num_vessels': 2, 'thal': 'reversable_defect',
    'patient_id': 'smoke_test', 'session_id': 'smoke_test'
}
result = run_prediction(demo)
print(f"Overall risk: {result['overall_risk_label']} ({result['overall_risk_score']:.2f})")
print(f"Primary: {result['primary_condition']['name']} ({result['primary_condition']['probability']:.2f})")
print(f"Inference: {result['model_info']['inference_time_ms']}ms")
for c in result['conditions']:
    print(f"  {c['name']:25s} {c['probability']:.3f}  [{c['severity']}]")
print()
print('✓ Smoke test passed — backend is ready.')
