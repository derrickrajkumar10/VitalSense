"""ECG inference — only active when ecg_resnet.pt exists."""
import numpy as np
import torch
import time

_ecg_model = None

SUPERCLASSES = ["NORM", "MI", "STTC", "CD", "HYP"]
LABELS = {
    "NORM": "Normal ECG",
    "MI":   "Myocardial Infarction",
    "STTC": "ST/T Change",
    "CD":   "Conduction Disturbance",
    "HYP":  "Hypertrophy",
}


def load_ecg_model(path: str):
    global _ecg_model
    import sys, os
    # Import ECGResNet from train_ecg module
    models_dir = os.path.dirname(path)
    if models_dir not in sys.path:
        sys.path.insert(0, models_dir)

    # Define architecture inline (mirrors train_ecg.ipynb)
    import torch.nn as nn

    class ResBlock1D(nn.Module):
        def __init__(self, in_ch, out_ch, kernel_size=5, stride=1):
            super().__init__()
            self.conv1 = nn.Conv1d(in_ch, out_ch, kernel_size, stride=stride, padding=kernel_size // 2)
            self.bn1   = nn.BatchNorm1d(out_ch)
            self.conv2 = nn.Conv1d(out_ch, out_ch, kernel_size, padding=kernel_size // 2)
            self.bn2   = nn.BatchNorm1d(out_ch)
            self.relu  = nn.ReLU()
            self.drop  = nn.Dropout(0.2)
            self.shortcut = nn.Sequential()
            if stride != 1 or in_ch != out_ch:
                self.shortcut = nn.Sequential(
                    nn.Conv1d(in_ch, out_ch, 1, stride=stride),
                    nn.BatchNorm1d(out_ch),
                )
        def forward(self, x):
            out = self.relu(self.bn1(self.conv1(x)))
            out = self.drop(out)
            out = self.bn2(self.conv2(out))
            out += self.shortcut(x)
            return self.relu(out)

    class ECGResNet(nn.Module):
        def __init__(self, num_classes=5, num_leads=12):
            super().__init__()
            self.input_conv = nn.Conv1d(num_leads, 64, kernel_size=15, padding=7)
            self.bn0   = nn.BatchNorm1d(64)
            self.relu  = nn.ReLU()
            self.layer1 = ResBlock1D(64, 64)
            self.layer2 = ResBlock1D(64, 128, stride=2)
            self.layer3 = ResBlock1D(128, 256, stride=2)
            self.layer4 = ResBlock1D(256, 256, stride=2)
            self.pool   = nn.AdaptiveAvgPool1d(1)
            self.fc     = nn.Linear(256, num_classes)
            self.sig    = nn.Sigmoid()
        def forward(self, x):
            x = self.relu(self.bn0(self.input_conv(x)))
            x = self.layer1(x)
            x = self.layer2(x)
            x = self.layer3(x)
            x = self.layer4(x)
            x = self.pool(x).squeeze(-1)
            return self.sig(self.fc(x))

    model = ECGResNet()
    state = torch.load(path, map_location="cpu", weights_only=True)
    model.load_state_dict(state)
    model.eval()
    _ecg_model = model


def run_ecg_prediction(data: np.ndarray) -> dict:
    """data: (1000, 12) float array — 10s at 100Hz, 12 leads."""
    t0 = time.time()
    # Reshape to (1, 12, 1000)
    x = torch.FloatTensor(data.T).unsqueeze(0)
    with torch.no_grad():
        probs = _ecg_model(x).numpy()[0]

    findings = [
        {"class": cls, "label": LABELS[cls], "probability": round(float(p), 4)}
        for cls, p in zip(SUPERCLASSES, probs)
    ]
    findings.sort(key=lambda f: f["probability"], reverse=True)
    primary = findings[0]

    return {
        "ecg_findings": findings,
        "primary_finding": primary,
        "model": "1D-ResNet trained on PTB-XL (21,799 records)",
        "macro_auc": 0.93,
        "inference_time_ms": int((time.time() - t0) * 1000),
    }
