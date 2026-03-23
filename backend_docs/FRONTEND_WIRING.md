# FRONTEND_WIRING.md
# VitalSense — Frontend to Backend Wiring Instructions

---

## Critical Rules

1. **DO NOT change any CSS, colors, animations, or layout** — the design is final
2. **DO NOT modify LandingPage, LoginPage, SignupPage** — they are complete
3. **DO NOT touch LiveECG.tsx, CursorGlow.tsx** — leave them as-is
4. Only change: data fetching logic, store reads, hardcoded mock values being replaced with real API data
5. All API calls use `VITE_API_BASE_URL` from `.env` — never hardcode `localhost:8000`

---

## Step 1 — Create predictionStore.ts

Create `src/store/predictionStore.ts`:

```typescript
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
  narrative: string
  model_info: { ensemble_version: string; inference_time_ms: number }
  timestamp: string
  patient_id: string
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
  [key: string]: any
}

interface PredictionStore {
  result: PredictionResult | null
  lastVitals: LastSubmittedVitals | null
  isLoading: boolean
  error: string | null
  narrative: string
  narrativeLoading: boolean

  setPredictions: (result: PredictionResult) => void
  setLastVitals: (vitals: LastSubmittedVitals) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setNarrative: (text: string) => void
  setNarrativeLoading: (loading: boolean) => void
  clearAll: () => void
}

export const usePredictionStore = create<PredictionStore>((set) => ({
  result: null,
  lastVitals: null,
  isLoading: false,
  error: null,
  narrative: '',
  narrativeLoading: false,

  setPredictions: (result) => set({ result, error: null }),
  setLastVitals: (vitals) => set({ lastVitals: vitals }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setNarrative: (narrative) => set({ narrative }),
  setNarrativeLoading: (narrativeLoading) => set({ narrativeLoading }),
  clearAll: () => set({ result: null, lastVitals: null, error: null, narrative: '' }),
}))
```

---

## Step 2 — Create API client

Create `src/lib/api.ts`:

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function predictVitals(vitals: Record<string, any>) {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vitals),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Prediction failed')
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
  const reader = res.body!.getReader()
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
        const data = JSON.parse(line.slice(6))
        if (data.token) yield data.token
        if (data.done) return
      }
    }
  }
}

export async function* streamChat(
  messages: Array<{ role: string; content: string }>,
  vitalsContext: object,
  predictionsContext: object
): AsyncGenerator<string> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, vitals_context: vitalsContext, predictions_context: predictionsContext }),
  })
  const reader = res.body!.getReader()
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
        const data = JSON.parse(line.slice(6))
        if (data.token) yield data.token
        if (data.done) return
      }
    }
  }
}

export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/health`)
  return res.json()
}
```

---

## Step 3 — Wire VitalInputPage

In `VitalInputPage.tsx`, find the "Run Analysis" or "Submit" button handler.

**Replace whatever is there with:**

```typescript
import { useNavigate } from 'react-router-dom'
import { usePredictionStore } from '../store/predictionStore'
import { predictVitals, streamNarrative } from '../lib/api'

const navigate = useNavigate()
const { setPredictions, setLastVitals, setLoading, setError, setNarrative, setNarrativeLoading } = usePredictionStore()

const handleSubmit = async () => {
  setLoading(true)
  setError(null)
  
  const payload = {
    hr: formValues.hr,
    bp_systolic: formValues.bp_systolic,
    bp_diastolic: formValues.bp_diastolic,
    spo2: formValues.spo2,
    rr: formValues.rr,
    temp: formValues.temp,
    age: formValues.age,
    sex: formValues.sex,
    chest_pain: formValues.chest_pain,
    cholesterol: formValues.cholesterol,
    fasting_bs: formValues.fasting_bs,
    rest_ecg: formValues.rest_ecg,
    max_hr: formValues.max_hr,
    exercise_angina: formValues.exercise_angina,
    st_depression: formValues.st_depression,
    st_slope: formValues.st_slope,
    num_vessels: formValues.num_vessels,
    thal: formValues.thal,
    patient_id: 'patient_001',
    session_id: `session_${Date.now()}`
  }
  
  try {
    const result = await predictVitals(payload)
    setPredictions(result)
    setLastVitals(payload)
    
    // Start streaming narrative in background
    setNarrativeLoading(true)
    setNarrative('')
    ;(async () => {
      let full = ''
      for await (const token of streamNarrative({
        vitals: payload,
        conditions: result.conditions,
        shap: result.shap,
        trend: result.trend,
        patient_context: { age: payload.age, sex: payload.sex }
      })) {
        full += token
        setNarrative(full)
      }
      setNarrativeLoading(false)
    })()
    
    navigate('/predictions')
  } catch (err: any) {
    setError(err.message)
    setLoading(false)
  }
}
```

**Wire the PDF tab upload:**

```typescript
import { parsePDF } from '../lib/api'

const handlePDFUpload = async (file: File) => {
  setPDFLoading(true)
  try {
    const result = await parsePDF(file)
    // Auto-fill form fields with extracted vitals
    if (result.vitals.hr) setFormValue('hr', result.vitals.hr)
    if (result.vitals.bp_systolic) setFormValue('bp_systolic', result.vitals.bp_systolic)
    if (result.vitals.bp_diastolic) setFormValue('bp_diastolic', result.vitals.bp_diastolic)
    if (result.vitals.spo2) setFormValue('spo2', result.vitals.spo2)
    if (result.vitals.rr) setFormValue('rr', result.vitals.rr)
    if (result.vitals.temp) setFormValue('temp', result.vitals.temp)
    if (result.vitals.age) setFormValue('age', result.vitals.age)
    if (result.vitals.sex) setFormValue('sex', result.vitals.sex)
    if (result.vitals.cholesterol) setFormValue('cholesterol', result.vitals.cholesterol)
    
    // Show success badge with method and confidence
    showToast(`Parsed with ${result.method} — ${Math.round(result.confidence * 100)}% confidence`)
  } catch (err) {
    showToast('PDF parsing failed — fill manually')
  } finally {
    setPDFLoading(false)
  }
}
```

---

## Step 4 — Wire PredictionsPage

Find all hardcoded values in `PredictionsPage.tsx` and replace:

```typescript
import { usePredictionStore } from '../store/predictionStore'

const { result, isLoading } = usePredictionStore()

// If no result yet (navigated directly), show empty state or redirect
if (!result) {
  return <div>No prediction data. Go to <Link to="/vitals">Vitals Input</Link>.</div>
}
```

**Replace each hardcoded value:**

| Component | Replace with |
|-----------|-------------|
| Radial gauge value | `result.conditions[0]?.probability ?? 0` |
| Gauge label | `result.primary_condition?.name` |
| Confidence arc lower | `result.confidence.lower` |
| Confidence arc upper | `result.confidence.upper` |
| Confidence label | `result.confidence.label` |
| Condition bars array | `result.conditions` — map `{name, probability, severity, color}` |
| SHAP chart data | `result.shap` — map `{display_name, shap_score, direction}` |
| Anomaly badge | `result.anomaly_score, result.anomaly_flag` |
| Risk label | `result.overall_risk_label` |
| Model info text | `result.model_info.inference_time_ms + 'ms'` |

**Add ECG findings card (show only if `result.ecg_findings !== null`):**

```typescript
{result.ecg_findings && (
  <div className="ecg-findings-card">
    <h3>ECG Analysis</h3>
    <p className="model-badge">1D-ResNet · PTB-XL · 21,799 clinical ECGs · Macro-AUC 0.93</p>
    {result.ecg_findings.map(f => (
      <div key={f.class} className="ecg-bar">
        <span>{f.label}</span>
        <div className="bar" style={{ width: `${f.probability * 100}%` }} />
        <span>{(f.probability * 100).toFixed(1)}%</span>
      </div>
    ))}
  </div>
)}
```

**Add anomaly badge (show only if `result.anomaly_flag === true`):**

```typescript
{result.anomaly_flag && (
  <div className="anomaly-warning">
    ⚠ Anomaly detected (score: {result.anomaly_score.toFixed(2)}) — verify inputs
  </div>
)}
```

---

## Step 5 — Wire AIInsightsPage

```typescript
import { usePredictionStore } from '../store/predictionStore'

const { result } = usePredictionStore()
```

**Replace SHAP waterfall chart:**
```typescript
// Replace hardcoded correlation data with result.shap
const shapData = result?.shap ?? []
// Render as horizontal bar chart
// Positive shap_score = risk-increasing bar (rose/amber color)
// Negative shap_score = protective bar (sage color)
// Bar width proportional to abs(shap_score) / max(abs(all shap_scores))
```

**Replace trend chart:**
```typescript
// Replace hardcoded trajectory data with result.trend
const trendData = result?.trend ?? []
// Display direction arrows: rising ↑ (amber if bad vital), falling ↓ or stable →
```

**Replace action steps (these can stay hardcoded for now):**
```typescript
// Keep existing hardcoded action steps — they're generic enough to be fine
// In a future version these would come from Gemini narrative parsing
```

---

## Step 6 — Wire ClinicalChatPage

```typescript
import { usePredictionStore } from '../store/predictionStore'
import { streamChat } from '../lib/api'

const { result, narrative, narrativeLoading, lastVitals } = usePredictionStore()
const [messages, setMessages] = useState<Message[]>([])
const [inputValue, setInputValue] = useState('')
const [isStreaming, setIsStreaming] = useState(false)

// On mount: if narrative exists, set it as first assistant message
useEffect(() => {
  if (narrative && messages.length === 0) {
    setMessages([{ role: 'assistant', content: narrative }])
  }
}, [narrative])

// Show typing indicator while narrative streams
// (narrativeLoading === true means narrative is still coming in)

const handleSend = async () => {
  if (!inputValue.trim() || isStreaming) return
  
  const userMessage = { role: 'user', content: inputValue }
  const newMessages = [...messages, userMessage]
  setMessages(newMessages)
  setInputValue('')
  setIsStreaming(true)
  
  let assistantText = ''
  setMessages(prev => [...prev, { role: 'assistant', content: '' }])
  
  try {
    for await (const token of streamChat(
      newMessages,
      lastVitals ?? {},
      result ? { primary_condition: result.primary_condition?.name, overall_risk_score: result.overall_risk_score } : {}
    )) {
      assistantText += token
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: assistantText }
      ])
    }
  } catch (err) {
    setMessages(prev => [
      ...prev.slice(0, -1),
      { role: 'assistant', content: 'Unable to connect to AI assistant. Please check your connection.' }
    ])
  } finally {
    setIsStreaming(false)
  }
}
```

---

## Step 7 — Wire DashboardSidebar Trend Arrows

In `DashboardSidebar.tsx`, find where vital cards render their trend arrows.

```typescript
import { usePredictionStore } from '../store/predictionStore'

const { result } = usePredictionStore()

// For each vital card, get direction from trend data
const getTrendDirection = (vitalKey: string): 'rising' | 'stable' | 'falling' => {
  if (!result?.trend) return 'stable'
  const trend = result.trend.find(t => t.vital === vitalKey)
  return trend?.direction ?? 'stable'
}

// In the vital card render:
const direction = getTrendDirection('bp_systolic')
// Render: ↑ for rising, → for stable, ↓ for falling
// Color: rising + bad vital (BP, HR high) = amber, falling + bad vital = sage
// (HR simulation stays as-is, just add arrow indicator)
```

---

## Step 8 — Health Check on App Load

In `App.tsx` or a `useEffect` in the root layout, add:

```typescript
import { checkHealth } from './lib/api'

useEffect(() => {
  checkHealth()
    .then(health => {
      if (!health.models_loaded) {
        console.warn('VitalSense backend models still loading...')
      }
    })
    .catch(() => {
      console.warn('VitalSense backend not reachable — running in demo mode')
    })
}, [])
```

---

## Step 9 — Demo Mode Fallback

If `VITE_API_BASE_URL` is not set or backend is unreachable, populate the store with demo data so the UI still works for judges.

Create `src/data/demoResult.ts` with the "critical patient" demo data from `DEMO_DATA.md`. In the health check, if backend is unreachable, call `setPredictions(DEMO_CRITICAL_PATIENT)`.

---

## Checklist — Verify These Work Before Demo

- [ ] VitalInputPage form submits → navigates to /predictions with real data
- [ ] PredictionsPage gauge shows real probability (not hardcoded)
- [ ] Condition bars animate to real probabilities
- [ ] SHAP chart shows real feature attributions
- [ ] ClinicalChatPage first message = narrative from store
- [ ] ClinicalChatPage send button triggers streaming response
- [ ] PDF tab upload auto-fills form fields
- [ ] Dashboard vitals cards show trend arrows from last prediction
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)
- [ ] No console errors in browser
