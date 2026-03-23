import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from '../lib/gsap';
import { pageVariants } from '../lib/animations';
import { useVitals } from '../context/VitalsContext';
import { computePrediction } from '../lib/predictionEngine';

// Gauge constant
const GAUGE_TOTAL = 283;   // ≈ π × 90 (half-circle circumference)

// Bar style helpers for conditions
const barStyleForIndex = (i: number) => ({
  barCls:    i === 0 ? 'bg-rose-dark/80'    : i === 1 ? 'bg-amber-main'    : 'bg-ink-soft/50',
  textCls:   i === 0 ? 'text-rose-dark'     : i === 1 ? 'text-amber-dark'  : 'text-ink-main',
  borderCls: i === 0 ? 'border-rose-dark/20': i === 1 ? 'border-amber-dark/20' : 'border-black/5',
});

// SHAP color styles by position
const SHAP_RIGHT_STYLES = [
  { barCls: 'bg-rose-main/90',  labelCls: 'text-rose-dark'  },
  { barCls: 'bg-amber-main/90', labelCls: 'text-amber-dark' },
  { barCls: 'bg-rose-light',    labelCls: 'text-rose-dark'  },
];
const SHAP_LEFT_STYLES = [
  { barCls: 'bg-lavender-main/80', labelCls: 'text-lavender-dark' },
  { barCls: 'bg-sage-main/80',     labelCls: 'text-sage-dark'     },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function PredictionsPage() {
  const navigate = useNavigate();
  const { submittedVitals } = useVitals();
  const prediction = computePrediction(submittedVitals);

  // Derived from prediction
  const CONDITIONS = prediction.conditions.map((c, i) => ({
    ...c,
    ...barStyleForIndex(i),
    span: (i === prediction.conditions.length - 1 ? 2 : 1) as 1 | 2,
  }));
  const shapPos = prediction.shapValues.filter(s => s.dir === 'pos');
  const shapNeg = prediction.shapValues.filter(s => s.dir === 'neg');
  const SHAP_RIGHT = shapPos.slice(0, 3).map((s, i) => ({
    label: s.label, pct: s.pct, value: s.display,
    ...SHAP_RIGHT_STYLES[i] ?? SHAP_RIGHT_STYLES[2],
  }));
  const SHAP_LEFT = shapNeg.slice(0, 2).map((s, i) => ({
    label: s.label, pct: s.pct, value: s.display,
    ...SHAP_LEFT_STYLES[i] ?? SHAP_LEFT_STYLES[1],
  }));
  const GAUGE_SCORE  = prediction.riskScore;
  const GAUGE_OFFSET = +(GAUGE_TOTAL * (1 - GAUGE_SCORE / 100)).toFixed(2);

  const [loading,  setLoading]  = useState(true);
  const [score,    setScore]    = useState(0);

  // Loading veil refs
  const veilRef        = useRef<HTMLDivElement>(null);
  const scanPhaseRef   = useRef<HTMLDivElement>(null);
  const scanLine1Ref   = useRef<HTMLDivElement>(null);
  const scanLine2Ref   = useRef<HTMLDivElement>(null);
  const processRef     = useRef<HTMLDivElement>(null);

  // Content refs
  const contentRef     = useRef<HTMLDivElement>(null);
  const gaugePathRef   = useRef<SVGPathElement>(null);
  const condBarRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const shapRightRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const shapLeftRefs   = useRef<(HTMLDivElement | null)[]>([]);

  // ── Loading sequence ────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(processRef.current, { opacity: 0 });

      // Scan lines loop
      const scan1 = gsap.fromTo(scanLine1Ref.current,
        { y: '-110%' }, { y: '110vh', duration: 1.35, ease: 'none', repeat: -1 }
      );
      const scan2 = gsap.fromTo(scanLine2Ref.current,
        { y: '-110%' }, { y: '110vh', duration: 1.35, ease: 'none', repeat: -1, delay: 0.12 }
      );

      // Phase 1 → 2  (scan → spinner)
      gsap.delayedCall(1.0, () => {
        scan1.kill(); scan2.kill();
        gsap.timeline()
          .to(scanPhaseRef.current,  { opacity: 0, duration: 0.32 })
          .to(processRef.current,    { opacity: 1, duration: 0.38 }, '-=0.12');
      });

      // Phase 2 → done  (fade veil, reveal content)
      gsap.delayedCall(2.3, () => {
        gsap.to(veilRef.current, {
          opacity: 0, duration: 0.6, ease: 'power2.inOut',
          onComplete: () => setLoading(false),
        });
      });
    });

    return () => ctx.revert();
  }, []);

  // ── Reveal animations (after veil gone) ─────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // Stagger all marked reveal items
      const items = contentRef.current?.querySelectorAll<HTMLElement>('.ri');
      if (items?.length) {
        gsap.to(items, {
          opacity: 1, y: 0,
          duration: 0.75, stagger: 0.065, ease: 'vitalize',
          clearProps: 'transform',
        });
      }

      // Score counter
      const proxy = { val: 0 };
      gsap.to(proxy, {
        val: GAUGE_SCORE,
        duration: 2.4,
        delay: 0.4,
        ease: 'power2.out',
        onUpdate: () => setScore(Math.round(proxy.val)),
      });

      // Gauge arc
      gsap.fromTo(gaugePathRef.current,
        { attr: { strokeDashoffset: GAUGE_TOTAL } },
        { attr: { strokeDashoffset: GAUGE_OFFSET }, duration: 2.4, delay: 0.4, ease: 'vitalize-soft' }
      );

      // Condition bars
      condBarRefs.current.forEach((bar, i) => {
        if (!bar) return;
        gsap.fromTo(bar, { width: '0%' }, {
          width: `${CONDITIONS[i]?.pct ?? 0}%`,
          duration: 1.7, delay: 0.65 + i * 0.09, ease: 'vitalize-soft',
        });
      });

      // SHAP right bars
      shapRightRefs.current.forEach((bar, i) => {
        if (!bar) return;
        gsap.fromTo(bar, { width: '0%' }, {
          width: `${SHAP_RIGHT[i]?.pct ?? 0}%`,
          duration: 1.4, delay: 0.75 + i * 0.1, ease: 'vitalize',
        });
      });

      // SHAP left bars
      shapLeftRefs.current.forEach((bar, i) => {
        if (!bar) return;
        gsap.fromTo(bar, { width: '0%' }, {
          width: `${SHAP_LEFT[i]?.pct ?? 0}%`,
          duration: 1.4, delay: 0.75 + i * 0.1, ease: 'vitalize',
        });
      });
    });

    return () => ctx.revert();
  }, [loading, prediction.riskScore]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="bg-ivory text-ink-main font-sans w-screen h-screen overflow-hidden flex antialiased"
    >
      {/* ══ LOADING VEIL ═══════════════════════════════════════════════════ */}
      {loading && (
        <div ref={veilRef} className="fixed inset-0 z-50 bg-ivory flex items-center justify-center">

          {/* Phase 1 — Scan */}
          <div ref={scanPhaseRef} className="absolute inset-0 overflow-hidden">
            {/* Glow beam */}
            <div ref={scanLine1Ref} className="absolute left-0 right-0 h-36 bg-gradient-to-b from-transparent via-lavender-main/20 to-lavender-main/5 pointer-events-none" style={{ top: 0 }} />
            {/* Hair line */}
            <div ref={scanLine2Ref} className="absolute left-0 right-0 h-px bg-lavender-dark/30 pointer-events-none" style={{ top: 0, boxShadow: '0 0 10px rgba(106,96,138,0.35)' }} />
            {/* Logo */}
            <div className="flex items-center justify-center h-full">
              <div className="font-serif text-3xl text-ink-muted tracking-tight flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-soft">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                VitalSense
              </div>
            </div>
          </div>

          {/* Phase 2 — Process */}
          <div ref={processRef} className="flex flex-col items-center justify-center z-10">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-black/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-ink-main border-r-ink-main rounded-full animate-spin" />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-main absolute">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <p className="mt-6 font-mono text-xs uppercase tracking-widest text-ink-muted">
              Generating Predictive Model...
            </p>
          </div>
        </div>
      )}

      {/* ══ LEFT SIDEBAR ═══════════════════════════════════════════════════ */}
      <aside className="w-[260px] h-full bg-cream border-r border-black/5 flex flex-col shrink-0 z-20 shadow-[2px_0_20px_rgba(0,0,0,0.03)]">
        {/* Logo */}
        <div className="p-6 flex items-center gap-2 border-b border-black/5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <span className="font-serif text-xl font-medium tracking-tight">VitalSense</span>
        </div>

        {/* Patient chip */}
        <div className="px-5 py-5 ri" style={{ transform: 'translateY(20px)' }}>
          <div className="bg-paper rounded-xl p-4 shadow-card border border-black/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sand-light flex items-center justify-center text-ink-main font-serif font-medium shadow-inner-soft shrink-0">
              EV
            </div>
            <div>
              <h2 className="font-medium text-sm leading-snug">Eleanor Vance</h2>
              <p className="font-mono text-[10px] text-ink-muted mt-0.5 uppercase tracking-wider">MRN: 849-291-B</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 flex flex-col gap-0.5">
          {[
            { label: 'Dashboard',          path: '/dashboard', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>, icon2: <polyline points="9 22 9 12 15 12 15 22"/> },
            { label: 'Patient Records',    path: '/vitals',    icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></> },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-ink-muted hover:bg-black/5 hover:text-ink-main transition flex items-center gap-3 w-full text-left"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {item.icon}{item.icon2 ?? null}
              </svg>
              {item.label}
            </button>
          ))}

          {/* Active item */}
          <div className="px-4 py-2.5 rounded-lg text-sm font-medium bg-paper shadow-sm border border-black/5 text-ink-main flex items-center gap-3 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-ink-main rounded-r" />
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
            </svg>
            Prediction Analysis
          </div>

          <button
            onClick={() => navigate('/history')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-ink-muted hover:bg-black/5 hover:text-ink-main transition flex items-center gap-3 w-full text-left"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            History &amp; Trends
          </button>
        </nav>

        {/* Doctor footer */}
        <div className="p-5 border-t border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-paper border border-black/10 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-soft">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <div className="text-xs font-medium text-ink-main">Dr. A. Thorne</div>
              <div className="text-[10px] text-ink-muted">Cardiology</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ═══════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex overflow-hidden z-10" ref={contentRef}>

        {/* ── Centre scroll area ── */}
        <div className="flex-1 h-full overflow-y-auto p-8 flex flex-col gap-8">

          {/* Header */}
          <header className="ri" style={{ transform: 'translateY(20px)' }}>
            <h1 className="font-serif text-3xl text-ink-main tracking-tight mb-1">Risk Assessment Synthesis</h1>
            <p className="text-sm text-ink-muted">Generated from continuous telemetry and baseline history.</p>
          </header>

          {/* Risk Gauge */}
          <div className="ri relative w-full max-w-md mx-auto h-[220px] flex items-end justify-center" style={{ transform: 'translateY(20px)' }}>
            <svg viewBox="0 0 200 110" className="absolute inset-0 w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#849C76"/>
                  <stop offset="40%"  stopColor="#D9A05B"/>
                  <stop offset="100%" stopColor="#A85757"/>
                </linearGradient>
                <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur"/>
                  <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>
              </defs>
              {/* Track */}
              <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="14" strokeLinecap="round"/>
              {/* Tick marks */}
              <line x1="60"  y1="25" x2="65"  y2="33" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="140" y1="25" x2="135" y2="33" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" strokeLinecap="round"/>
              {/* Value arc */}
              <path
                ref={gaugePathRef}
                d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none"
                stroke="url(#gauge-grad)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={GAUGE_TOTAL}
                strokeDashoffset={GAUGE_TOTAL}
                filter="url(#gauge-glow)"
              />
            </svg>

            {/* Score label */}
            <div className="relative z-10 flex flex-col items-center pb-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-2 bg-paper/80 px-3 py-1 rounded-full border border-black/5 backdrop-blur-sm">
                Composite Risk
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-7xl text-ink-main tracking-tighter leading-none">{score}</span>
                <span className="text-xl font-medium text-ink-muted">/100</span>
              </div>
            </div>
          </div>

          {/* Primary alert */}
          <div className="ri bg-rose-light/30 border border-rose-dark/20 rounded-2xl p-6 shadow-sm relative overflow-hidden group" style={{ transform: 'translateY(20px)' }}>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-rose-main/20 to-transparent pointer-events-none" />
            <div className="flex items-start gap-5 relative z-10">
              <div className="w-14 h-14 rounded-full bg-paper shadow-sm flex items-center justify-center text-rose-dark shrink-0">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-3">
                  <h3 className="font-serif text-2xl font-medium text-ink-main">Arrhythmia Event Risk</h3>
                  <div className="bg-paper text-rose-dark px-3 py-1 rounded-md text-sm font-bold tracking-wide shadow-sm border border-rose-dark/10">
                    78% Confidence
                  </div>
                </div>
                <p className="text-sm text-ink-muted leading-relaxed max-w-xl">
                  Model detects a high probability pattern correlating with mild irregular rhythms within the next 24–48 hours. Requires clinical review.
                </p>
              </div>
            </div>
          </div>

          {/* Condition probability bars */}
          <div>
            <h3 className="ri font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-4 pl-1" style={{ transform: 'translateY(20px)' }}>
              Condition Probabilities
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {CONDITIONS.map((c, i) => (
                <div
                  key={c.label}
                  className={`ri bg-paper rounded-xl p-5 shadow-card border ${c.borderCls} ${c.span === 2 ? 'col-span-2' : ''}`}
                  style={{ transform: 'translateY(20px)' }}
                >
                  <div className="flex justify-between items-end mb-3">
                    <div className="font-medium text-ink-main text-sm">{c.label}</div>
                    <div className="flex flex-col items-end">
                      <span className={`font-serif text-xl leading-none mb-1 ${c.textCls}`}>{c.pct}%</span>
                      <span className="font-mono text-[9px] text-ink-soft uppercase tracking-wider">CI: {c.ci}</span>
                    </div>
                  </div>
                  <div className="w-full bg-ivory h-2.5 rounded-full overflow-hidden border border-black/5">
                    <div
                      ref={el => { condBarRefs.current[i] = el; }}
                      className={`h-full ${c.barCls} rounded-full`}
                      style={{ width: '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right panel ── */}
        <aside className="w-[420px] h-full bg-paper border-l border-black/5 flex flex-col shrink-0 z-20 overflow-y-auto shadow-[-8px_0_24px_rgba(0,0,0,0.02)]">
          <div className="p-8 flex flex-col gap-8">

            {/* SHAP Attribution */}
            <div className="ri" style={{ transform: 'translateY(20px)' }}>
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-6">
                Factor Attribution (SHAP)
              </h3>

              <div className="relative pb-7 border-b border-black/5">
                {/* Center axis */}
                <div className="absolute left-[50%] top-0 bottom-7 w-px bg-black/10 z-0" />
                <div className="absolute left-[50%] -translate-x-1/2 bottom-0 font-mono text-[9px] text-ink-soft">
                  Base Risk
                </div>

                <div className="flex flex-col gap-4 relative z-10">
                  {/* Right-facing bars (positive) */}
                  {SHAP_RIGHT.map((f, i) => (
                    <div key={f.label} className="flex items-center text-xs group">
                      <div className="w-24 font-mono text-ink-muted truncate pr-2 text-right text-[11px]">
                        {f.label}
                      </div>
                      <div className="flex-1 relative h-6 flex items-center">
                        <div
                          ref={el => { shapRightRefs.current[i] = el; }}
                          className={`absolute left-[50%] h-5 ${f.barCls} rounded-r shadow-sm flex items-center justify-end pr-1.5 overflow-hidden`}
                          style={{ width: '0%' }}
                        >
                          <span className={`font-mono text-[10px] ${f.labelCls} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                            {f.value}
                          </span>
                        </div>
                      </div>
                      <div className="w-10" />
                    </div>
                  ))}

                  {/* Left-facing bars (negative) */}
                  {SHAP_LEFT.map((f, i) => (
                    <div key={f.label} className="flex items-center text-xs group">
                      <div className="w-24" />
                      <div className="flex-1 relative h-6 flex items-center justify-end">
                        <div
                          ref={el => { shapLeftRefs.current[i] = el; }}
                          className={`absolute right-[50%] h-5 ${f.barCls} rounded-l shadow-sm flex items-center justify-start pl-1.5 overflow-hidden`}
                          style={{ width: '0%' }}
                        >
                          <span className={`font-mono text-[10px] ${f.labelCls} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                            {f.value}
                          </span>
                        </div>
                      </div>
                      <div className="w-24 font-mono text-ink-muted truncate pl-2 text-left text-[11px]">
                        {f.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Clinical Synthesis */}
            <div className="ri" style={{ transform: 'translateY(20px)' }}>
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-3 flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lavender-dark">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
                Clinical Synthesis
              </h3>
              <div className="bg-cream rounded-xl p-5 border border-black/5 shadow-inner-soft">
                <p className="text-[13px] text-ink-main leading-relaxed">
                  Patient exhibits signs of{' '}
                  <span className="bg-rose-light/60 text-rose-dark px-1.5 py-0.5 rounded font-medium">
                    mild irregular rhythm
                  </span>{' '}
                  predominantly during nocturnal hours. Elevated resting heart rate and decreased HRV correlate with{' '}
                  <span className="bg-amber-light/60 text-amber-dark px-1.5 py-0.5 rounded font-medium">
                    sympathetic dominance
                  </span>
                  . No immediate signs of ischemia, but prolonged stress indicators are present.
                </p>
              </div>
            </div>

            {/* Action Pathways */}
            <div className="ri" style={{ transform: 'translateY(20px)' }}>
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-4">
                Action Pathways
              </h3>
              <div className="flex flex-col gap-3">

                <ActionRow
                  label="Schedule 12-lead ECG"
                  badge="+24% Diagnostic"
                  rowBg="bg-rose-light/10 hover:bg-rose-light/30 border-rose-dark/10"
                  iconBg="text-rose-dark"
                  badgeBg="bg-paper text-rose-dark border border-black/5"
                  icon={<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>}
                />
                <ActionRow
                  label="Reduce sodium intake"
                  badge="-12% Risk"
                  rowBg="bg-ivory hover:bg-cream border-black/5"
                  iconBg="text-sage-dark"
                  badgeBg="bg-sage-light text-sage-dark border border-sage-dark/10"
                  icon={<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>}
                />
                <ActionRow
                  label="Guided breathing protocol"
                  badge="-18% Tone"
                  rowBg="bg-ivory hover:bg-cream border-black/5"
                  iconBg="text-lavender-dark"
                  badgeBg="bg-lavender-light text-lavender-dark border border-lavender-dark/10"
                  icon={<><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>}
                />
              </div>
            </div>

            {/* Export */}
            <button onClick={() => navigate('/reports')} className="ri w-full bg-ink-main text-paper py-3.5 rounded-xl font-medium text-sm shadow-[0_4px_14px_rgba(44,41,38,0.2)] hover:bg-ink-main/90 transition-all flex items-center justify-center gap-2" style={{ transform: 'translateY(20px)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              Export Clinical Report
            </button>

          </div>
        </aside>
      </main>
    </motion.div>
  );
}

// ── Small helper ──────────────────────────────────────────────────────────────
function ActionRow({
  label, badge, rowBg, iconBg, badgeBg, icon,
}: {
  label: string;
  badge: string;
  rowBg: string;
  iconBg: string;
  badgeBg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`flex items-center justify-between p-3.5 rounded-xl border ${rowBg} hover:transition cursor-pointer group`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-paper flex items-center justify-center ${iconBg} shadow-sm group-hover:scale-105 transition-transform`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </div>
        <span className="text-sm font-medium text-ink-main">{label}</span>
      </div>
      <div className={`font-mono text-[10px] font-bold px-2 py-1 rounded shadow-sm ${badgeBg}`}>
        {badge}
      </div>
    </div>
  );
}
