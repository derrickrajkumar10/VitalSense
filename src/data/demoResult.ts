import type { PredictionResult, LastSubmittedVitals } from '../store/predictionStore'

// ── Demo patient vitals ───────────────────────────────────────────────────────

export const DEMO_CRITICAL_VITALS: Record<string, unknown> = {
  hr: 108, bp_systolic: 168, bp_diastolic: 104,
  spo2: 93, rr: 22, temp: 37.9,
  age: 58, sex: 'M',
  chest_pain: 'typical_angina', cholesterol: 289,
  fasting_bs: true, rest_ecg: 'st_t_abnormality',
  max_hr: 142, exercise_angina: true,
  st_depression: 2.4, st_slope: 'flat',
  num_vessels: 2, thal: 'reversable_defect',
  patient_id: 'demo_critical', session_id: 'demo_session_critical',
}

export const DEMO_NORMAL_VITALS: Record<string, unknown> = {
  hr: 68, bp_systolic: 112, bp_diastolic: 74,
  spo2: 99, rr: 14, temp: 36.6,
  age: 34, sex: 'F',
  chest_pain: 'asymptomatic', cholesterol: 185,
  fasting_bs: false, rest_ecg: 'normal',
  max_hr: 162, exercise_angina: false,
  st_depression: 0.0, st_slope: 'upsloping',
  num_vessels: 0, thal: 'normal',
  patient_id: 'demo_normal', session_id: 'demo_session_normal',
}

export const DEMO_BORDERLINE_VITALS: Record<string, unknown> = {
  hr: 94, bp_systolic: 138, bp_diastolic: 88,
  spo2: 96, rr: 17, temp: 37.0,
  age: 47, sex: 'M',
  chest_pain: 'atypical_angina', cholesterol: 228,
  fasting_bs: false, rest_ecg: 'normal',
  max_hr: 154, exercise_angina: false,
  st_depression: 0.8, st_slope: 'flat',
  num_vessels: 0, thal: 'normal',
  patient_id: 'demo_borderline', session_id: 'demo_session_borderline',
}

// ── Demo result (used when backend is unreachable) ────────────────────────────

export const DEMO_CRITICAL_RESULT: PredictionResult = {
  valid: true,
  anomaly_score: 0.08,
  anomaly_flag: false,
  conditions: [
    {
      name: 'Hypertension Risk', key: 'hypertension',
      probability: 0.91, severity: 'critical', color: 'rose',
      description: 'Severely elevated blood pressure detected',
    },
    {
      name: 'Tachycardia', key: 'tachycardia',
      probability: 0.87, severity: 'critical', color: 'rose',
      description: 'Heart rate significantly above normal range',
    },
    {
      name: 'Arrhythmia Risk', key: 'arrhythmia',
      probability: 0.74, severity: 'elevated', color: 'amber',
      description: 'ST-T wave abnormality with elevated heart rate',
    },
    {
      name: 'Hypoxia Risk', key: 'hypoxia',
      probability: 0.68, severity: 'elevated', color: 'amber',
      description: 'SpO2 below clinical safe threshold',
    },
    {
      name: 'Bradycardia', key: 'bradycardia',
      probability: 0.02, severity: 'normal', color: 'sage',
      description: 'No evidence of bradycardia',
    },
  ],
  primary_condition: { name: 'Hypertension Risk', probability: 0.91, severity: 'critical' },
  shap: [
    { feature: 'bp_systolic',  display_name: 'Systolic BP',           value: 168, shap_score: 0.42,  direction: 'positive' },
    { feature: 'age',          display_name: 'Age',                   value: 58,  shap_score: 0.28,  direction: 'positive' },
    { feature: 'thal',         display_name: 'Thalassemia',           value: 'reversable_defect', shap_score: 0.24, direction: 'positive' },
    { feature: 'cholesterol',  display_name: 'Cholesterol',           value: 289, shap_score: 0.19,  direction: 'positive' },
    { feature: 'num_vessels',  display_name: 'Vessels (fluoroscopy)', value: 2,   shap_score: 0.17,  direction: 'positive' },
    { feature: 'spo2',         display_name: 'SpO2',                  value: 93,  shap_score: 0.14,  direction: 'positive' },
    { feature: 'hr',           display_name: 'Heart Rate',            value: 108, shap_score: 0.11,  direction: 'positive' },
  ],
  confidence: { mean: 0.91, lower: 0.86, upper: 0.96, std: 0.05, label: 'High', n_bootstrap: 50 },
  trend: [
    { vital: 'hr',          display_name: 'Heart Rate',  current: 108, delta: 14, direction: 'rising',  rate_per_hour: 5.2  },
    { vital: 'bp_systolic', display_name: 'Systolic BP', current: 168, delta: 18, direction: 'rising',  rate_per_hour: 6.8  },
    { vital: 'spo2',        display_name: 'SpO2',        current: 93,  delta: -4, direction: 'falling', rate_per_hour: -1.2 },
    { vital: 'rr',          display_name: 'Resp. Rate',  current: 22,  delta: 4,  direction: 'rising',  rate_per_hour: 1.4  },
    { vital: 'temp',        display_name: 'Temperature', current: 37.9, delta: 0.6, direction: 'rising', rate_per_hour: 0.2 },
  ],
  ecg_findings: [
    { class: 'MI',   label: 'Myocardial Infarction',   probability: 0.61 },
    { class: 'STTC', label: 'ST/T Change',              probability: 0.22 },
    { class: 'NORM', label: 'Normal ECG',               probability: 0.09 },
    { class: 'HYP',  label: 'Hypertrophy',              probability: 0.06 },
    { class: 'CD',   label: 'Conduction Disturbance',   probability: 0.02 },
  ],
  overall_risk_score: 0.88,
  overall_risk_label: 'High',
  model_info: {
    ensemble_version: '1.0',
    models_used: ['xgboost', 'random_forest', 'pytorch_nn'],
    training_dataset: 'UCI Heart Disease (Cleveland + Hungarian + Swiss), N=918',
    n_training_samples: 918,
    inference_time_ms: 94,
  },
  timestamp: '2026-03-23T10:30:00Z',
  patient_id: 'demo_critical',
  session_id: 'demo_session_critical',
}

export const DEMO_CRITICAL_VITALS_TYPED: LastSubmittedVitals = {
  hr: 108, bp_systolic: 168, bp_diastolic: 104,
  spo2: 93, rr: 22, temp: 37.9,
  age: 58, sex: 'M',
}

export const DEMO_CRITICAL_NARRATIVE = `This 58-year-old male patient is presenting with multiple critically elevated vital signs requiring immediate clinical attention. Blood pressure at 168/104 mmHg is in Stage 2 hypertension range, heart rate of 108 bpm indicates tachycardia, and SpO2 of 93% is below the clinically safe threshold of 95%.

The AI model identifies systolic blood pressure as the primary risk driver (SHAP contribution: +0.42), followed by patient age (+0.28) and a reversable thalassemia defect (+0.24). The combination of elevated cholesterol at 289 mg/dl, 2 vessels affected on fluoroscopy, and ST-T wave abnormality on ECG significantly compounds the cardiovascular risk profile. All four critical conditions — hypertension, tachycardia, arrhythmia, and hypoxia — show worsening trends over the last 5 readings.

Immediate recommended actions: Administer supplemental oxygen for SpO2 below 95%, obtain a 12-lead ECG to assess the ST-T findings, initiate antihypertensive therapy review, and consult cardiology urgently given the multi-system risk presentation with rising trend across all vital signs.`
