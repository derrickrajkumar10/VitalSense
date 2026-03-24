const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function predictVitals(vitals: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vitals),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Prediction failed' }))
    throw new Error(err.detail || err.error || 'Prediction failed')
  }
  return res.json()
}

export async function parsePDF(file: File) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE_URL}/parse-pdf`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('PDF parsing failed')
  return res.json()
}

export async function voiceToVitals(audioBlob: Blob, mimeType: string) {
  const form = new FormData()
  form.append('audio', audioBlob, 'recording.webm')
  // Override content type header is set by browser for FormData
  void mimeType
  const res = await fetch(`${BASE_URL}/voice-to-vitals`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Voice parsing failed')
  return res.json()
}

export async function* streamNarrative(payload: object): AsyncGenerator<string> {
  const res = await fetch(`${BASE_URL}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok || !res.body) return
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6))
          if (data.token) yield data.token
          if (data.done) return
        } catch {
          // skip malformed chunk
        }
      }
    }
  }
}

export async function* streamChat(
  messages: Array<{ role: string; content: string }>,
  vitalsContext: object,
  predictionsContext: object,
): AsyncGenerator<string> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      vitals_context: vitalsContext,
      predictions_context: predictionsContext,
    }),
  })
  if (!res.ok || !res.body) return
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6))
          if (data.token) yield data.token
          if (data.done) return
        } catch {
          // skip malformed chunk
        }
      }
    }
  }
}

export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/health`)
  if (!res.ok) throw new Error('Backend unreachable')
  return res.json()
}

export async function storeHistory(patientId: string, predictionResult: object, timestamp: string) {
  const res = await fetch(`${BASE_URL}/patient/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_id: patientId, prediction_result: predictionResult, timestamp }),
  })
  if (!res.ok) return null
  return res.json()
}

export async function getHistory(patientId: string, limit = 20) {
  const res = await fetch(`${BASE_URL}/patient/${patientId}/history?limit=${limit}`)
  if (!res.ok) return { records: [] as HistoryRecord[], total: 0 }
  return res.json() as Promise<{ records: HistoryRecord[]; total: number }>
}

export interface HistoryRecord {
  record_id: string
  timestamp: string
  overall_risk_score: number
  overall_risk_label: string
  primary_condition: string
  vitals: { hr: number; bp_systolic: number; bp_diastolic: number; spo2: number; rr: number; temp: number }
}

export async function getRecommendations(vitals: object, conditions: object[], shap: object[], narrative?: string) {
  const res = await fetch(`${BASE_URL}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vitals, conditions, shap, narrative: narrative || '' }),
  })
  if (!res.ok) return null
  return res.json() as Promise<Array<{ label: string; badge: string; type: 'urgent' | 'moderate' | 'routine' }>>
}

// ── ECG Analysis types ────────────────────────────────────────────────────────
export interface EcgDemo {
  ecg_id: number
  superclass: string
  label: string
  age: number
  sex: string
  description: string
}

export interface EcgSignalData {
  ecg_id: number
  lead_names: string[]
  signals: number[][]  // [12 leads][1000 samples]
  fs: number
}

export interface EcgFinding {
  class: string
  label: string
  probability: number
}

export interface EcgPredictionResult {
  ecg_findings: EcgFinding[]
  primary_finding: EcgFinding
  model: string
  macro_auc: number
  inference_time_ms: number
}

// ── ECG API functions ─────────────────────────────────────────────────────────
export async function fetchEcgDemos(): Promise<EcgDemo[]> {
  const res = await fetch(`${BASE_URL}/ecg/demos`)
  if (!res.ok) throw new Error('Failed to load demo records')
  const data = await res.json()
  return data.demos
}

export async function fetchEcgDemoSignal(ecgId: number): Promise<EcgSignalData> {
  const res = await fetch(`${BASE_URL}/ecg/demo/${ecgId}/signal`)
  if (!res.ok) throw new Error('Failed to load ECG signal')
  return res.json()
}

export async function runEcgDemoPredict(ecgId: number): Promise<EcgPredictionResult> {
  const res = await fetch(`${BASE_URL}/ecg/demo/${ecgId}/predict`)
  if (!res.ok) throw new Error('ECG prediction failed')
  return res.json()
}

export async function runEcgFilePredict(file: File): Promise<EcgPredictionResult> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE_URL}/predict/ecg`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'ECG prediction failed' }))
    throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail))
  }
  return res.json()
}
