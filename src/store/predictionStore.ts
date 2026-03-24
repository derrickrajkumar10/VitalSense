import { create } from 'zustand'

export interface Condition {
  name: string
  key: string
  probability: number
  severity: 'normal' | 'elevated' | 'critical'
  color: string
  description: string
}

export interface ShapEntry {
  feature: string
  display_name: string
  value: number | string
  shap_score: number
  direction: 'positive' | 'negative'
}

export interface ConfidenceResult {
  mean: number
  lower: number
  upper: number
  std: number
  label: 'High' | 'Moderate' | 'Low'
  n_bootstrap: number
}

export interface TrendDelta {
  vital: string
  display_name: string
  current: number
  delta: number
  direction: 'rising' | 'stable' | 'falling'
  rate_per_hour: number
}

export interface ECGFinding {
  class: string
  label: string
  probability: number
}

export interface PredictionResult {
  valid: boolean
  anomaly_score: number
  anomaly_flag: boolean
  conditions: Condition[]
  primary_condition: { name: string; probability: number; severity: string }
  shap: ShapEntry[]
  confidence: ConfidenceResult
  trend: TrendDelta[]
  ecg_findings: ECGFinding[] | null
  overall_risk_score: number
  overall_risk_label: string
  model_info: { ensemble_version: string; inference_time_ms: number; models_used?: string[]; training_dataset?: string; n_training_samples?: number }
  timestamp: string
  patient_id: string
  session_id?: string
}

export interface LastSubmittedVitals {
  hr: number
  bp_systolic: number
  bp_diastolic: number
  spo2: number
  rr: number
  temp: number
  age?: number
  sex?: string
  [key: string]: unknown
}

interface PredictionStore {
  result: PredictionResult | null
  lastVitals: LastSubmittedVitals | null
  isLoading: boolean
  error: string | null
  narrative: string
  narrativeLoading: boolean
  backendAvailable: boolean

  setPredictions: (result: PredictionResult) => void
  setLastVitals: (vitals: LastSubmittedVitals) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setNarrative: (text: string) => void
  setNarrativeLoading: (loading: boolean) => void
  setBackendAvailable: (available: boolean) => void
  clearAll: () => void
}

export const usePredictionStore = create<PredictionStore>((set) => ({
  result: null,
  lastVitals: null,
  isLoading: false,
  error: null,
  narrative: '',
  narrativeLoading: false,
  backendAvailable: true,

  setPredictions: (result) => set({ result, error: null }),
  setLastVitals: (vitals) => set({ lastVitals: vitals }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setNarrative: (narrative) => set({ narrative }),
  setNarrativeLoading: (narrativeLoading) => set({ narrativeLoading }),
  setBackendAvailable: (backendAvailable) => set({ backendAvailable }),
  clearAll: () => set({ result: null, lastVitals: null, error: null, narrative: '' }),
}))
