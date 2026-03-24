"""
Shared model architecture — must be importable by both train_ensemble.py and predict.py
so that pickle can resolve VitalsNet regardless of which module is __main__.
"""
import torch.nn as nn


class VitalsNet(nn.Module):
    def __init__(self, input_dim=16):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 64), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(64, 32),        nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(32, 1),         nn.Sigmoid(),
        )

    def forward(self, x):
        return self.net(x).squeeze(-1)
