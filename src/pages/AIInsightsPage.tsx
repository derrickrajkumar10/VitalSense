import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from '../lib/gsap';
import { pageVariants } from '../lib/animations';
import { useVitals } from '../context/VitalsContext';
import { computePrediction } from '../lib/predictionEngine';

const POP_BARS = [
  { label: 'Heart Rate Efficiency',   pct: 78, percentile: '78th Percentile', barCls: 'bg-sage-main',  textCls: 'text-sage-dark',  hasMarker: false },
  { label: 'Blood Pressure Baseline', pct: 82, percentile: '82nd Percentile', barCls: 'bg-amber-main', textCls: 'text-amber-dark', hasMarker: true  },
];

const ACTION_STEPS = [
  {
    label:       'Monitor Monday BP spikes closely',
    priority:    'High Priority',
    badgeCls:    'bg-rose-light text-rose-dark border-rose-dark/10',
    iconHoverBorder: 'group-hover:border-rose-dark/30',
    iconHoverText:   'group-hover:text-rose-dark',
    icon: (
      <>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </>
    ),
  },
  {
    label:       'Schedule follow-up ECG within 14 days',
    priority:    'Medium Priority',
    badgeCls:    'bg-amber-light text-amber-dark border-amber-dark/10',
    iconHoverBorder: 'group-hover:border-amber-dark/30',
    iconHoverText:   'group-hover:text-amber-dark',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </>
    ),
  },
  {
    label:       'Continue current beta-blocker dosage',
    priority:    'Low Priority',
    badgeCls:    'bg-sage-light text-sage-dark border-sage-dark/10',
    iconHoverBorder: 'group-hover:border-sage-dark/30',
    iconHoverText:   'group-hover:text-sage-dark',
    icon: (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </>
    ),
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AIInsightsPage() {
  const navigate = useNavigate();
  const prediction = computePrediction(useVitals().submittedVitals);
  const HEALTH_SCORE = prediction.riskScore;

  const [loading, setLoading] = useState(true);
  const [score,   setScore]   = useState(0);
  const [micActive, setMicActive] = useState(false);

  // Veil refs
  const veilRef      = useRef<HTMLDivElement>(null);
  const scanPhaseRef = useRef<HTMLDivElement>(null);
  const scanLine1Ref = useRef<HTMLDivElement>(null);
  const scanLine2Ref = useRef<HTMLDivElement>(null);
  const processRef   = useRef<HTMLDivElement>(null);

  // Content refs
  const contentRef   = useRef<HTMLDivElement>(null);
  const chartPathRef = useRef<SVGPathElement>(null);
  const chartAreaRef = useRef<SVGPathElement>(null);
  const sparklineRef = useRef<SVGPathElement>(null);
  const endDotRef    = useRef<SVGCircleElement>(null);
  const ringRef      = useRef<HTMLDivElement>(null);
  const popBarRefs   = useRef<(HTMLDivElement | null)[]>([]);

  // ── Loading sequence ─────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(processRef.current, { opacity: 0 });

      const scan1 = gsap.fromTo(scanLine1Ref.current,
        { y: '-110%' }, { y: '110vh', duration: 1.15, ease: 'none', repeat: -1 }
      );
      const scan2 = gsap.fromTo(scanLine2Ref.current,
        { y: '-110%' }, { y: '110vh', duration: 1.15, ease: 'none', repeat: -1, delay: 0.1 }
      );

      gsap.delayedCall(0.9, () => {
        scan1.kill(); scan2.kill();
        gsap.timeline()
          .to(scanPhaseRef.current, { opacity: 0, duration: 0.28 })
          .to(processRef.current,   { opacity: 1, duration: 0.34 }, '-=0.1');
      });

      gsap.delayedCall(2.0, () => {
        gsap.to(veilRef.current, {
          opacity: 0, duration: 0.55, ease: 'power2.inOut',
          onComplete: () => setLoading(false),
        });
      });
    });
    return () => ctx.revert();
  }, []);

  // ── Reveal + content animations ──────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // Stagger all .ri items
      const items = contentRef.current?.querySelectorAll<HTMLElement>('.ri');
      if (items?.length) {
        gsap.to(items, {
          opacity: 1, y: 0,
          duration: 0.78, stagger: 0.07, ease: 'vitalize',
          clearProps: 'transform',
        });
      }

      // Score counter
      const proxy = { val: 0 };
      gsap.to(proxy, {
        val: HEALTH_SCORE,
        duration: 2.3, delay: 0.3, ease: 'power2.out',
        onUpdate: () => setScore(Math.round(proxy.val)),
      });


      // Chart path draw
      if (chartPathRef.current) {
        const len = chartPathRef.current.getTotalLength();
        gsap.set(chartPathRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(chartPathRef.current, {
          strokeDashoffset: 0,
          duration: 2.1, delay: 0.45, ease: 'vitalize-soft',
        });
      }

      // Area fade
      gsap.fromTo(chartAreaRef.current,
        { opacity: 0 },
        { opacity: 0.2, duration: 1.4, delay: 1.3, ease: 'power2.out' }
      );

      // Endpoint dot entrance + pulse
      if (endDotRef.current) {
        gsap.set(endDotRef.current, { transformOrigin: 'center', scale: 0 });
        gsap.to(endDotRef.current, {
          scale: 1, duration: 0.4, delay: 2.3, ease: 'back.out(2.5)',
          onComplete: () => {
            gsap.to(endDotRef.current, {
              scale: 1.55, opacity: 0.45, duration: 0.85,
              ease: 'sine.inOut', yoyo: true, repeat: -1,
            });
          },
        });
      }

      // Sparkline draw
      if (sparklineRef.current) {
        const len = sparklineRef.current.getTotalLength();
        gsap.set(sparklineRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(sparklineRef.current, {
          strokeDashoffset: 0,
          duration: 1.5, delay: 0.9, ease: 'vitalize',
        });
      }

      // Ring wind-up to 45°
      gsap.fromTo(ringRef.current,
        { rotation: -20 },
        { rotation: 45, duration: 1.6, delay: 0.65, ease: 'vitalize-soft' }
      );

      // Population bars
      popBarRefs.current.forEach((bar, i) => {
        if (!bar) return;
        gsap.fromTo(bar, { width: '0%' }, {
          width: `${POP_BARS[i].pct}%`,
          duration: 1.7, delay: 0.8 + i * 0.14, ease: 'vitalize-soft',
        });
      });

      // Action row hover micro-interactions via GSAP
      const rows = contentRef.current?.querySelectorAll('.action-row');
      rows?.forEach(row => {
        const icon = row.querySelector('.action-icon') as HTMLElement;
        row.addEventListener('mouseenter', () => {
          gsap.to(row, { x: 4, duration: 0.25, ease: 'power2.out' });
          if (icon) gsap.to(icon, { scale: 1.12, duration: 0.25, ease: 'back.out(2)' });
        });
        row.addEventListener('mouseleave', () => {
          gsap.to(row, { x: 0, duration: 0.3, ease: 'power2.out' });
          if (icon) gsap.to(icon, { scale: 1, duration: 0.25, ease: 'power2.out' });
        });
      });
    });
    return () => ctx.revert();
  }, [loading, HEALTH_SCORE]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="bg-ivory text-ink-main font-sans w-screen h-screen overflow-hidden flex flex-col antialiased"
    >
      {/* ══ LOADING VEIL ════════════════════════════════════════════════════ */}
      {loading && (
        <div ref={veilRef} className="fixed inset-0 z-50 bg-ivory flex items-center justify-center">
          {/* Phase 1 — scan */}
          <div ref={scanPhaseRef} className="absolute inset-0 overflow-hidden">
            <div ref={scanLine1Ref} className="absolute left-0 right-0 h-36 bg-gradient-to-b from-transparent via-sage-main/20 to-sage-main/5 pointer-events-none" style={{ top: 0 }} />
            <div ref={scanLine2Ref} className="absolute left-0 right-0 h-px bg-sage-dark/25 pointer-events-none" style={{ top: 0, boxShadow: '0 0 10px rgba(99,117,90,0.3)' }} />
            <div className="flex items-center justify-center h-full">
              <div className="font-serif text-3xl text-ink-muted tracking-tight flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-soft">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                VitalSense
              </div>
            </div>
          </div>
          {/* Phase 2 — spinner */}
          <div ref={processRef} className="flex flex-col items-center justify-center z-10">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-black/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-sage-dark border-r-sage-main rounded-full animate-spin" />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-main absolute">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <p className="mt-6 font-mono text-xs uppercase tracking-widest text-ink-muted">
              Generating AI Insights…
            </p>
          </div>
        </div>
      )}

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header className="h-20 bg-cream/90 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-8 shrink-0 z-20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <span className="font-serif text-xl font-medium tracking-tight">VitalSense</span>
        </div>

        {/* Nav tabs */}
        <nav className="flex items-center gap-1 bg-paper p-1 rounded-lg border border-black/5 shadow-sm">
          {[
            { label: 'Overview',         path: '/dashboard'   },
            { label: 'Prediction Analysis', path: '/predictions' },
            { label: 'Patient Records',  path: '/vitals'      },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="px-4 py-2 rounded-md text-sm font-medium text-ink-muted hover:text-ink-main hover:bg-ivory transition"
            >
              {item.label}
            </button>
          ))}
          <button className="px-4 py-2 rounded-md text-sm font-medium bg-sand-light/60 text-ink-main shadow-inner-soft">
            AI Insights
          </button>
        </nav>

        {/* Patient + mic */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-black/10">
            <div className="w-10 h-10 rounded-full bg-sand-light flex items-center justify-center text-ink-main font-serif font-medium shadow-inner-soft">
              EV
            </div>
            <div>
              <h2 className="font-medium text-sm leading-snug">Eleanor Vance</h2>
              <p className="font-mono text-[10px] text-ink-muted mt-0.5 uppercase tracking-wider">MRN: 849-291-B</p>
            </div>
          </div>
          <button
            onClick={() => setMicActive(prev => !prev)}
            aria-label={micActive ? 'Stop voice input' : 'Start voice input'}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-main/30 ${
              micActive
                ? 'bg-rose-light border-rose-dark/30 text-rose-dark animate-pulse'
                : 'bg-paper border-black/5 text-ink-muted hover:text-ink-main hover:bg-cream'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ══ MAIN SCROLL ═════════════════════════════════════════════════════ */}
      <main
        ref={contentRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          backgroundImage: "url(\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTY2LCAxNTksIDE0OSwgMC4wNSkiLz48L3N2Zz4=\")",
        }}
      >
        <div className="w-full max-w-[1400px] mx-auto px-8 py-10 flex flex-col gap-8 pb-16">

          {/* Page heading */}
          <div className="ri flex justify-between items-end" style={{ transform: 'translateY(20px)' }}>
            <div>
              <h1 className="font-serif text-4xl text-ink-main tracking-tight mb-2">AI Insights</h1>
              <p className="text-sm text-ink-muted">Actionable intelligence generated from continuous telemetry.</p>
            </div>
            <div className="text-right">
              <div className="font-mono text-[11px] uppercase tracking-widest text-ink-muted bg-paper px-3 py-1.5 rounded-md border border-black/5 shadow-sm inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sage-main animate-pulse" />
                Last updated: Oct 25, 2023 at 09:14 AM
              </div>
            </div>
          </div>

          {/* ── Health trajectory chart ─────────────────────────────────────── */}
          <div className="ri bg-paper rounded-2xl p-8 shadow-card border border-black/5 flex flex-col gap-6" style={{ transform: 'translateY(20px)' }}>
            <div className="flex justify-between items-center">
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage-dark">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Overall Health Trajectory (30 Days)
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-3xl text-ink-main tabular-nums">{score}</span>
                <span className="text-xs text-ink-muted font-medium mb-1">/ 100</span>
              </div>
            </div>

            <div className="w-full h-[200px] relative">
              <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="ai-sage-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%"   stopColor="#63755A" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#63755A" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* Grid */}
                <line x1="0" y1="50"  x2="1000" y2="50"  stroke="rgba(166,159,149,0.15)" strokeWidth="1" strokeDasharray="4 4"/>
                <line x1="0" y1="100" x2="1000" y2="100" stroke="rgba(166,159,149,0.15)" strokeWidth="1" strokeDasharray="4 4"/>
                <line x1="0" y1="150" x2="1000" y2="150" stroke="rgba(166,159,149,0.15)" strokeWidth="1" strokeDasharray="4 4"/>
                {/* Area */}
                <path
                  ref={chartAreaRef}
                  d="M 0 150 C 200 160, 300 120, 500 110 S 700 80, 1000 40 L 1000 200 L 0 200 Z"
                  fill="url(#ai-sage-gradient)"
                  style={{ opacity: 0 }}
                />
                {/* Line */}
                <path
                  ref={chartPathRef}
                  d="M 0 150 C 200 160, 300 120, 500 110 S 700 80, 1000 40"
                  fill="none"
                  stroke="#63755A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Endpoint */}
                <g transform="translate(1000,40)">
                  <circle ref={endDotRef} cx="0" cy="0" r="6" fill="#63755A" />
                  <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
                </g>
              </svg>
            </div>

            <div className="bg-sage-light/20 border border-sage-dark/10 p-5 rounded-xl flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-paper shadow-sm border border-sage-dark/10 flex items-center justify-center text-sage-dark shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <p className="font-serif text-lg leading-relaxed text-ink-main italic">
                "Patient showing consistent improvement in cardiovascular stability with significantly reduced nocturnal arrhythmia episodes over the observed period."
              </p>
            </div>
          </div>

          {/* ── 3-column metric cards ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Top Risk Factor */}
            <div className="ri bg-paper rounded-2xl p-8 shadow-card border border-black/5 flex flex-col gap-5" style={{ transform: 'translateY(20px)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-light/40 border border-amber-dark/10 flex items-center justify-center text-amber-dark">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">Top Risk Factor</h3>
              </div>
              <div>
                <h4 className="font-serif text-[22px] text-ink-main leading-tight mb-2">{prediction.topCondition}</h4>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Algorithmic analysis flags a pattern of elevated systolic readings consistently occurring during evening hours (18:00 – 22:00).
                </p>
              </div>
            </div>

            {/* Most Improved */}
            <div className="ri bg-paper rounded-2xl p-8 shadow-card border border-black/5 flex flex-col gap-5" style={{ transform: 'translateY(20px)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sage-light/40 border border-sage-dark/10 flex items-center justify-center text-sage-dark">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                  </svg>
                </div>
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">Most Improved Vital</h3>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <h4 className="font-medium text-ink-main">Heart Rate Variability</h4>
                <div className="flex items-end justify-between mt-4">
                  <span className="font-serif text-4xl text-sage-dark">+24%</span>
                  <div className="w-24 h-12 relative opacity-80">
                    <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                      <path
                        ref={sparklineRef}
                        d="M 0 35 L 20 30 L 40 32 L 60 15 L 80 20 L 100 5"
                        fill="none"
                        stroke="#63755A"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="100" cy="5" r="3" fill="#63755A"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Predictive Alert */}
            <div className="ri bg-paper rounded-2xl p-8 shadow-card border border-black/5 flex flex-col gap-5" style={{ transform: 'translateY(20px)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lavender-light/40 border border-lavender-dark/10 flex items-center justify-center text-lavender-dark">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="m8.5 10 2 2 4-4"/>
                  </svg>
                </div>
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">Predictive Alert</h3>
              </div>
              <div className="flex-1 flex items-center bg-cream rounded-xl p-5 border border-black/5">
                <p className="text-[15px] font-medium text-ink-main leading-relaxed">
                  Expected stabilization in{' '}
                  <span className="text-lavender-dark">SpO2 levels</span>{' '}
                  within 7 days based on current treatment trajectory.
                </p>
              </div>
            </div>
          </div>

          {/* ── 2-column cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Correlation Detected */}
            <div className="ri bg-paper rounded-2xl p-8 shadow-card border border-black/5 flex flex-col gap-6" style={{ transform: 'translateY(20px)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sand-light/40 border border-sand-dark/10 flex items-center justify-center text-sand-dark">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">Correlation Detected</h3>
              </div>
              <div className="flex gap-5">
                <div className="flex-1">
                  <h4 className="font-serif text-[22px] text-ink-main leading-tight mb-3">Blood Pressure spikes 12% on Mondays</h4>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Pattern analysis over 90 days reveals a consistent, statistically significant elevation in both systolic and diastolic pressure at the start of the week.
                  </p>
                </div>
                <div className="w-24 shrink-0 flex items-center justify-center">
                  <div
                    ref={ringRef}
                    className="w-full aspect-square rounded-full border-[6px] border-ivory border-t-sand-dark border-r-sand-dark flex items-center justify-center bg-cream"
                    style={{ transform: 'rotate(45deg)' }}
                  >
                    <span className="font-mono text-sm font-bold text-sand-dark" style={{ transform: 'rotate(-45deg)' }}>
                      +12%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Population Comparison */}
            <div className="ri bg-paper rounded-2xl p-8 shadow-card border border-black/5 flex flex-col gap-6" style={{ transform: 'translateY(20px)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ink-main/5 border border-ink-main/10 flex items-center justify-center text-ink-main">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">Population Comparison</h3>
                </div>
                <span className="text-[10px] font-mono bg-ivory border border-black/5 px-2 py-1 rounded text-ink-muted">
                  Demographic: 45F
                </span>
              </div>

              <div className="flex flex-col gap-5 mt-2">
                {POP_BARS.map((bar, i) => (
                  <div key={bar.label}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium text-ink-main">{bar.label}</span>
                      <span className={`font-mono text-[11px] ${bar.textCls} font-bold`}>{bar.percentile}</span>
                    </div>
                    <div className="w-full bg-ivory h-2.5 rounded-full overflow-hidden border border-black/5">
                      <div
                        ref={el => { popBarRefs.current[i] = el; }}
                        className={`h-full ${bar.barCls} rounded-full relative`}
                        style={{ width: '0%' }}
                      >
                        {bar.hasMarker && (
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-amber-dark rounded-r-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── AI Recommended Next Steps ───────────────────────────────────── */}
          <div className="ri bg-paper rounded-2xl p-8 shadow-card border border-black/5 flex flex-col gap-6" style={{ transform: 'translateY(20px)' }}>
            <div className="flex items-center gap-3 pb-4 border-b border-black/5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">AI Recommended Next Steps</h3>
            </div>

            <div className="flex flex-col gap-3">
              {ACTION_STEPS.map((step, i) => (
                <div
                  key={i}
                  className="action-row flex items-center justify-between p-4 rounded-xl border border-black/5 bg-ivory hover:bg-cream cursor-pointer group transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={`action-icon w-8 h-8 rounded bg-paper flex items-center justify-center shadow-sm border border-black/5 transition-colors duration-200 ${step.iconHoverBorder}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors duration-200 ${step.iconHoverText}`}>
                        {step.icon}
                      </svg>
                    </div>
                    <span className="font-medium text-[15px] text-ink-main">{step.label}</span>
                  </div>
                  <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${step.badgeCls}`}>
                    {step.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </motion.div>
  );
}
