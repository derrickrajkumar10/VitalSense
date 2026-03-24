# ECG Model Report

## Summary

- Model: 1D-ResNet ECG classifier for PTB-XL diagnostic superclasses
- Classes: `NORM`, `MI`, `STTC`, `CD`, `HYP`
- Dataset: PTB-XL `1.0.3`
- Signal source used: `records100` (100 Hz)
- Test split: PTB-XL `strat_fold == 10`
- Decision threshold for binary metrics: `0.5`
- Saved model: `backend/models/ecg_resnet.pt`
- Model file size: `5,791,093` bytes
- Model file timestamp: `2026-03-24 01:55:00`

## Training Run

- Device: `cuda`
- Training samples: `17,418`
- Validation samples: `2,183`
- Test samples: `2,198`
- Total PTB-XL ECGs used: `21,799`
- Model parameters: `1,436,357`
- Best validation macro-AUC: `0.9309`
- Final test macro-AUC: `0.925`

### Epoch snapshots

- Epoch 1/50: loss `0.3464`, val_AUC `0.8939`, best `0.8939`
- Epoch 10/50: loss `0.2378`, val_AUC `0.9286`, best `0.9286`
- Epoch 20/50: loss `0.2003`, val_AUC `0.9236`, best `0.9309`
- Epoch 30/50: loss `0.1466`, val_AUC `0.9256`, best `0.9309`
- Epoch 40/50: loss `0.1447`, val_AUC `0.9250`, best `0.9309`
- Epoch 50/50: loss `0.1437`, val_AUC `0.9253`, best `0.9309`

## Test Metrics

### Overall

- Subset accuracy: `0.6146`
- Label accuracy: `0.8873`
- F1 micro: `0.7732`
- F1 macro: `0.7399`
- Sensitivity macro: `0.7213`
- Specificity macro: `0.9290`
- Test macro-AUC: `0.925`

### Per class

| Class | Positives | Accuracy | F1 | Sensitivity | Specificity |
|---|---:|---:|---:|---:|---:|
| `NORM` | 963 | 0.8785 | 0.8616 | 0.8629 | 0.8907 |
| `MI` | 550 | 0.8735 | 0.7327 | 0.6927 | 0.9339 |
| `STTC` | 521 | 0.8831 | 0.7582 | 0.7735 | 0.9171 |
| `CD` | 496 | 0.8940 | 0.7470 | 0.6935 | 0.9524 |
| `HYP` | 262 | 0.9072 | 0.6000 | 0.5840 | 0.9509 |

## Metric Notes

- `Subset accuracy` is exact-match accuracy across all 5 labels for a sample.
- `Label accuracy` is the mean binary accuracy across all class decisions.
- `Sensitivity` is `TP / (TP + FN)`.
- `Specificity` is `TN / (TN + FP)`.
- `F1 micro` aggregates all TP/FP/FN across classes before scoring.
- `F1 macro` averages per-class F1 equally across the 5 classes.

## Evaluation Context

- Training notebook: `backend/models/train_ecg.ipynb`
- Evaluation used the saved weights from `backend/models/ecg_resnet.pt`
- Metrics were computed on the held-out PTB-XL test fold with threshold `0.5`
- The saved model was also successfully loaded by the backend ECG inference path

