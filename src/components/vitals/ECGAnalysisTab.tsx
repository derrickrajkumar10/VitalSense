import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from '../../lib/gsap'
import {
  fetchEcgDemos, fetchEcgDemoSignal, runEcgDemoPredict, runEcgFilePredict,
  type EcgDemo, type EcgSignalData, type EcgPredictionResult,
} from '../../lib/api'

// ── Class colour config ───────────────────────────────────────────────────────
const CLASS_CONFIG: Record<string, { bg: string; border: string; text: string; bar: string; dot: string }> = {
  NORM: { bg: 'bg-sage-light/40',     border: 'border-sage-dark/20',     text: 'text-sage-dark',     bar: 'bg-sage-main',     dot: 'bg-sage-main' },
  MI:   { bg: 'bg-rose-light/40',     border: 'border-rose-dark/20',     text: 'text-rose-dark',     bar: 'bg-rose-main',     dot: 'bg-rose-main' },
  STTC: { bg: 'bg-amber-light/40',    border: 'border-amber-dark/20',    text: 'text-amber-dark',    bar: 'bg-amber-main',    dot: 'bg-amber-main' },
  CD:   { bg: 'bg-lavender-light/40', border: 'border-lavender-dark/20', text: 'text-lavender-dark', bar: 'bg-lavender-main', dot: 'bg-lavender-main' },
  HYP:  { bg: 'bg-sand-light/40',     border: 'border-sand-dark/20',     text: 'text-ink-main',      bar: 'bg-sand-dark',     dot: 'bg-sand-dark' },
}

// ── Helper: convert signal array → SVG path string ───────────────────────────
function signalToPath(signal: number[], viewW: number, viewH: number): string {
  const step = Math.max(1, Math.floor(signal.length / 250))
  const samples = Array.from({ length: 250 }, (_, i) => signal[Math.min(i * step, signal.length - 1)])
  const min = Math.min(...samples)
  const max = Math.max(...samples)
  const range = max - min || 1
  const pad = viewH * 0.12
  const points = samples.map((v, i) => {
    const x = (i / 249) * viewW
    const y = pad + ((max - v) / range) * (viewH - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M${points.join(' L')}`
}

// ── Animated ECG loader line ──────────────────────────────────────────────────
function EcgLoaderLine() {
  return (
    <svg
      width="120"
      height="32"
      viewBox="0 0 120 32"
      fill="none"
      className="text-sage-main"
      aria-hidden="true"
    >
      <motion.polyline
        points="0,16 18,16 24,6 30,26 36,6 42,26 48,16 66,16 72,10 78,22 84,16 120,16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop', repeatDelay: 0.3 }}
      />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ECGAnalysisTab() {
  const [demos, setDemos]                   = useState<EcgDemo[]>([])
  const [selectedDemo, setSelectedDemo]     = useState<EcgDemo | null>(null)
  const [signalData, setSignalData]         = useState<EcgSignalData | null>(null)
  const [prediction, setPrediction]         = useState<EcgPredictionResult | null>(null)
  const [loadingSignal, setLoadingSignal]   = useState(false)
  const [loadingPredict, setLoadingPredict] = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [uploadedFile, setUploadedFile]     = useState<File | null>(null)
  const [isDragOver, setIsDragOver]         = useState(false)

  const svgRefs             = useRef<(SVGPathElement | null)[]>([])
  const fileInputRef        = useRef<HTMLInputElement>(null)
  const resultsRef          = useRef<HTMLDivElement>(null)
  const waveformContainerRef = useRef<HTMLDivElement>(null)

  // ── Load demos on mount ───────────────────────────────────────────────────
  useEffect(() => {
    fetchEcgDemos().then(setDemos).catch(() => setError('Could not load demo ECGs'))
  }, [])

  // ── Fetch signal + prediction when demo selected ──────────────────────────
  useEffect(() => {
    if (!selectedDemo) return
    setSignalData(null)
    setPrediction(null)
    setError(null)
    setLoadingSignal(true)
    setLoadingPredict(true)

    Promise.all([
      fetchEcgDemoSignal(selectedDemo.ecg_id),
      runEcgDemoPredict(selectedDemo.ecg_id),
    ]).then(([sig, pred]) => {
      setSignalData(sig)
      setPrediction(pred)
    }).catch(e => {
      setError((e as Error).message || 'Failed to load ECG data')
    }).finally(() => {
      setLoadingSignal(false)
      setLoadingPredict(false)
    })
  }, [selectedDemo])

  // ── GSAP stroke-draw animation when signal data arrives ───────────────────
  useEffect(() => {
    if (!signalData) return
    const timer = setTimeout(() => {
      svgRefs.current.forEach((path, i) => {
        if (!path) return
        try {
          const totalLength = path.getTotalLength()
          gsap.set(path, { strokeDasharray: totalLength, strokeDashoffset: totalLength })
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.inOut',
            delay: i * 0.07,
          })
        } catch {
          // SVG not yet in DOM
        }
      })
    }, 60)
    return () => clearTimeout(timer)
  }, [signalData])

  // ── Animate results panel in when prediction arrives ──────────────────────
  useEffect(() => {
    if (!prediction || !resultsRef.current) return
    gsap.fromTo(resultsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'vitalize-soft' }
    )
  }, [prediction])

  // ── File upload handler ───────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setUploadedFile(file)
    setSelectedDemo(null)
    setSignalData(null)
    setPrediction(null)
    setError(null)
    setLoadingPredict(true)
    try {
      const result = await runEcgFilePredict(file)
      setPrediction(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'ECG prediction failed')
    } finally {
      setLoadingPredict(false)
    }
  }, [])

  const isLoading = loadingSignal || loadingPredict

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ── Section 1: Header bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {/* ECG pulse icon */}
          <div className="w-9 h-9 rounded-xl bg-sage-light/50 border border-sage-dark/15 flex items-center justify-center text-sage-dark shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,12 6,12 9,4 12,20 15,8 18,12 22,12" />
            </svg>
          </div>
          <div>
            <h2 className="font-serif text-xl text-ink-main leading-tight">ECG Analysis</h2>
            <p className="font-mono text-[10px] text-ink-muted mt-0.5">12-Lead · 1D-ResNet · PTB-XL</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-sage-light/30 border border-sage-dark/15 rounded-full px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sage-main" />
          <span className="font-mono text-[10px] text-sage-dark">1D-ResNet · 21,799 PTB-XL records · AUC 0.925</span>
        </div>
      </div>

      {/* ── Section 2: Demo preset cards + upload zone ─────────────────────── */}
      <div className="flex flex-col gap-4">

        {/* Demo cards header */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">Demo Records</span>
          <div className="flex-1 h-px bg-black/5" />
        </div>

        {/* Horizontal scroll row of demo cards */}
        {demos.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {demos.map(demo => {
              const config = CLASS_CONFIG[demo.superclass] ?? CLASS_CONFIG.NORM
              return (
                <button
                  key={demo.ecg_id}
                  onClick={() => setSelectedDemo(demo)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left shrink-0
                    ${selectedDemo?.ecg_id === demo.ecg_id
                      ? `${config.bg} ${config.border} shadow-sm`
                      : 'bg-paper border-black/5 hover:border-black/10 hover:shadow-sm'
                    }`}
                >
                  <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                  <div>
                    <div className={`text-xs font-medium ${config.text}`}>{demo.superclass}</div>
                    <div className="text-[10px] text-ink-muted font-mono">{demo.label}</div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : !error ? (
          <div className="flex items-center gap-3 py-2">
            <div className="w-4 h-4 rounded-full border-2 border-sage-main/40 border-t-sage-main animate-spin" />
            <span className="font-mono text-[11px] text-ink-muted">Loading demo records…</span>
          </div>
        ) : null}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-black/5" />
          <span className="font-mono text-[10px] text-ink-soft">or upload your own</span>
          <div className="flex-1 h-px bg-black/5" />
        </div>

        {/* Drag-and-drop upload zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => { e.preventDefault(); setIsDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file) }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all
            ${isDragOver
              ? 'border-sage-dark/40 bg-sage-light/20 shadow-inner-soft'
              : uploadedFile
                ? 'border-sage-dark/25 bg-sage-light/10'
                : 'border-black/10 bg-ivory hover:border-black/20 hover:bg-cream'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />

          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
            ${isDragOver ? 'bg-sage-main/20 text-sage-dark' : 'bg-black/5 text-ink-muted'}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>

          {/* Text */}
          <div className="text-center">
            {uploadedFile ? (
              <>
                <p className="text-sm font-medium text-sage-dark">{uploadedFile.name}</p>
                <p className="text-[11px] text-ink-muted mt-0.5 font-mono">Click to replace</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-ink-main">Drop your 12-lead CSV here</p>
                <p className="text-[11px] text-ink-muted mt-1 font-mono">1000 rows × 12 columns · .csv</p>
              </>
            )}
          </div>
        </div>

        {/* Empty-state instructional text */}
        {!selectedDemo && !uploadedFile && !isLoading && (
          <p className="text-center text-[12px] text-ink-soft font-mono">
            Select a demo ECG or upload your own 12-lead CSV to begin analysis.
          </p>
        )}
      </div>

      {/* ── Error state ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3 bg-amber-light/40 border border-amber-dark/20 rounded-xl p-4"
          >
            <div className="w-5 h-5 rounded-full bg-amber-main/20 border border-amber-dark/20 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-dark">
                <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="text-sm text-amber-dark font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading state ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center gap-4 py-10"
          >
            <EcgLoaderLine />
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-sage-main/40 border-t-sage-main animate-spin" />
              <span className="font-mono text-[12px] text-ink-muted">Running ResNet inference…</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section 3: 12-Lead Waveform grid ───────────────────────────────── */}
      <AnimatePresence>
        {signalData && !isLoading && (
          <motion.div
            ref={waveformContainerRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">12-Lead Waveform</span>
              <div className="flex-1 h-px bg-black/5" />
              <span className="font-mono text-[10px] text-ink-soft">{signalData.fs} Hz</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {signalData.lead_names.map((leadName, i) => {
                const signal = signalData.signals[i] ?? []
                const pathD = signal.length > 0 ? signalToPath(signal, 200, 56) : ''
                return (
                  <div
                    key={leadName}
                    className="bg-paper rounded-xl border border-black/5 p-2 shadow-sm"
                  >
                    <div className="font-mono text-[10px] text-ink-muted mb-1">{leadName}</div>
                    <svg
                      width="100%"
                      height="56"
                      viewBox="0 0 200 56"
                      preserveAspectRatio="none"
                      aria-label={`${leadName} waveform`}
                    >
                      {/* Grid lines */}
                      <line x1="0" y1="18" x2="200" y2="18" stroke="#00000010" strokeWidth="0.5" />
                      <line x1="0" y1="38" x2="200" y2="38" stroke="#00000010" strokeWidth="0.5" />
                      {/* Signal path */}
                      {pathD && (
                        <path
                          ref={el => { svgRefs.current[i] = el }}
                          d={pathD}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-ink-main/70"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section 4: Results ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {prediction && !isLoading && (
          <div ref={resultsRef} style={{ opacity: 0 }}>

            {/* MI Alert banner */}
            {prediction.primary_finding.class === 'MI' && prediction.primary_finding.probability > 0.5 && (
              <div className="flex items-center gap-3 bg-rose-light/50 border border-rose-dark/25 rounded-xl p-4 mb-5">
                <div className="w-8 h-8 rounded-full bg-rose-main/20 border border-rose-dark/20 flex items-center justify-center shrink-0 animate-pulse">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-dark">
                    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-rose-dark">Possible Myocardial Infarction Detected</p>
                  <p className="text-xs text-rose-dark/70 mt-0.5">
                    Confidence: {(prediction.primary_finding.probability * 100).toFixed(1)}% · Recommend immediate clinical evaluation
                  </p>
                </div>
                <span className="font-mono text-[10px] bg-rose-main/15 text-rose-dark px-2 py-1 rounded-full shrink-0">CRITICAL</span>
              </div>
            )}

            {/* Findings header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">Classification Results</span>
              <div className="flex-1 h-px bg-black/5" />
              {(() => {
                const primaryConfig = CLASS_CONFIG[prediction.primary_finding.class] ?? CLASS_CONFIG.NORM
                return (
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${primaryConfig.bg} ${primaryConfig.border} ${primaryConfig.text}`}>
                    {prediction.primary_finding.label}
                  </span>
                )
              })()}
            </div>

            {/* Confidence bars */}
            <div className="flex flex-col gap-3 bg-paper rounded-xl border border-black/5 p-4 shadow-sm">
              {prediction.ecg_findings.map(finding => {
                const pct = Math.round(finding.probability * 100)
                const config = CLASS_CONFIG[finding.class] ?? CLASS_CONFIG.NORM
                return (
                  <div key={finding.class} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${config.dot} shrink-0`} />
                    <div className="w-16 shrink-0">
                      <span className={`font-mono text-[11px] font-medium ${config.text}`}>{finding.class}</span>
                    </div>
                    <div className="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${config.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <span className="font-mono text-xs text-ink-muted w-10 text-right shrink-0">{pct}%</span>
                  </div>
                )
              })}
            </div>

            {/* Model badge */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/5 flex-wrap">
              <span className="font-mono text-[10px] text-ink-soft uppercase tracking-wider">Model</span>
              <span className="font-mono text-[10px] text-ink-muted">1D-ResNet</span>
              <span className="text-ink-soft/40 text-[10px]">·</span>
              <span className="font-mono text-[10px] text-ink-muted">PTB-XL 21,799 records</span>
              <span className="text-ink-soft/40 text-[10px]">·</span>
              <span className="font-mono text-[10px] text-ink-muted">Macro-AUC 0.925</span>
              <span className="text-ink-soft/40 text-[10px]">·</span>
              <span className="font-mono text-[10px] text-sage-dark">{prediction.inference_time_ms}ms</span>
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* ── Model badge (shown even before prediction) ──────────────────────── */}
      {!prediction && (
        <div className="flex items-center gap-2 pt-4 border-t border-black/5 flex-wrap">
          <span className="font-mono text-[10px] text-ink-soft uppercase tracking-wider">Model</span>
          <span className="font-mono text-[10px] text-ink-muted">1D-ResNet</span>
          <span className="text-ink-soft/40 text-[10px]">·</span>
          <span className="font-mono text-[10px] text-ink-muted">PTB-XL 21,799 records</span>
          <span className="text-ink-soft/40 text-[10px]">·</span>
          <span className="font-mono text-[10px] text-ink-muted">Macro-AUC 0.925</span>
        </div>
      )}

    </div>
  )
}
