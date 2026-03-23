import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from '../lib/gsap';
import { pageVariants } from '../lib/animations';

// ── Data ──────────────────────────────────────────────────────────────────────

const VITALS_TABLE = [
  {
    dot: 'bg-sage-main', label: 'Heart Rate', value: '72', unit: 'bpm',
    range: '60 – 100', status: 'Normal',
    badge: 'bg-sage-light text-sage-dark border-sage-dark/10',
    valueClass: '',  rowClass: '',
  },
  {
    dot: 'bg-lavender-main', label: 'Blood Pressure', value: '135/85', unit: 'mmHg',
    range: '120/80', status: 'Elevated',
    badge: 'bg-lavender-light text-lavender-dark border-lavender-dark/10',
    valueClass: '',  rowClass: '',
  },
  {
    dot: 'bg-sage-main', label: 'SpO₂', value: '99', unit: '%',
    range: '95 – 100%', status: 'Normal',
    badge: 'bg-sage-light text-sage-dark border-sage-dark/10',
    valueClass: '',  rowClass: '',
  },
  {
    dot: 'bg-sage-main', label: 'Temperature', value: '36.8', unit: '°C',
    range: '36.1 – 37.2', status: 'Normal',
    badge: 'bg-sage-light text-sage-dark border-sage-dark/10',
    valueClass: '',  rowClass: '',
  },
  {
    dot: 'bg-sage-main', label: 'Resp Rate', value: '14', unit: 'br/m',
    range: '12 – 20', status: 'Normal',
    badge: 'bg-sage-light text-sage-dark border-sage-dark/10',
    valueClass: '',  rowClass: '',
  },
  {
    dot: 'bg-rose-main', label: 'ECG / HRV', value: '42', unit: 'ms',
    range: '50 – 100', status: 'Low',
    badge: 'bg-rose-light text-rose-dark border-rose-dark/20',
    valueClass: 'text-rose-dark', rowClass: 'bg-rose-light/5',
  },
];

const SHAP_BARS = [
  { label: 'Heart Rate Variability', width: 35, dir: 'pos', bar: 'bg-rose-main/90',    text: 'text-rose-dark',     display: '+22%' },
  { label: 'Stress Index',           width: 24, dir: 'pos', bar: 'bg-amber-main/90',   text: 'text-amber-dark',    display: '+15%' },
  { label: 'Current HR',             width: 16, dir: 'pos', bar: 'bg-rose-light border border-rose-dark/10', text: 'text-rose-dark', display: '+10%' },
  { label: 'Blood Pressure',         width:  8, dir: 'neg', bar: 'bg-lavender-main/90',text: 'text-lavender-dark', display: '-5%'  },
  { label: 'SpO₂ Level',             width: 13, dir: 'neg', bar: 'bg-sage-main/90',    text: 'text-sage-dark',     display: '-8%'  },
];

const RECOMMENDATIONS = [
  {
    border: 'border-rose-dark/15',    bg: 'bg-rose-light/10',     hover: 'hover:bg-rose-light/20',
    iconBorder: 'border-rose-dark/10', iconText: 'text-rose-dark',
    badgeBorder: 'border-rose-dark/10', badgeText: 'text-rose-dark',
    badge: '+24% Diagnostic', label: 'Schedule 12-lead ECG',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    border: 'border-sage-dark/15',    bg: 'bg-sage-light/10',     hover: 'hover:bg-sage-light/20',
    iconBorder: 'border-sage-dark/10', iconText: 'text-sage-dark',
    badgeBorder: 'border-sage-dark/10', badgeText: 'text-sage-dark',
    badge: '-12% Risk', label: 'Reduce sodium intake',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
    ),
  },
  {
    border: 'border-lavender-dark/15', bg: 'bg-lavender-light/20', hover: 'hover:bg-lavender-light/40',
    iconBorder: 'border-lavender-dark/10', iconText: 'text-lavender-dark',
    badgeBorder: 'border-lavender-dark/10', badgeText: 'text-lavender-dark',
    badge: '-18% Tone', label: 'Guided breathing protocol',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
      </svg>
    ),
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ClinicalReportsPage() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);

  const gaugeRef   = useRef<SVGPathElement>(null);
  const ecgRef     = useRef<SVGPathElement>(null);
  const barRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const mainRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'vitalize-soft' } });

      // Document sections cascade in
      if (mainRef.current) {
        const sections = mainRef.current.querySelectorAll('.report-sec');
        tl.fromTo(sections,
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.11, duration: 0.55 },
          0.15
        );
      }

      // Gauge arc
      if (gaugeRef.current) {
        gsap.set(gaugeRef.current, { strokeDasharray: 283, strokeDashoffset: 283 });
        gsap.to(gaugeRef.current, { strokeDashoffset: 62.26, duration: 1.9, delay: 0.55, ease: 'vitalize-soft' });
      }

      // Score counter
      const proxy = { val: 0 };
      gsap.to(proxy, {
        val: 78, duration: 1.7, delay: 0.55, ease: 'vitalize-soft',
        onUpdate() { setScore(Math.round(proxy.val)); },
      });

      // ECG path draw
      if (ecgRef.current) {
        const len = ecgRef.current.getTotalLength();
        gsap.set(ecgRef.current, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len });
        gsap.to(ecgRef.current, { strokeDashoffset: 0, duration: 2.6, delay: 0.9, ease: 'none' });
      }

      // SHAP bars grow from 0 → target
      barRefs.current.forEach((bar, i) => {
        if (bar) {
          gsap.from(bar, {
            width: '0%',
            duration: 0.85,
            delay: 0.65 + i * 0.09,
            ease: 'vitalize-soft',
            clearProps: 'width',
          });
        }
      });

      // Rec cards stagger
      const recCards = mainRef.current?.querySelectorAll('.rec-card');
      if (recCards) {
        gsap.fromTo(recCards,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.9, ease: 'vitalize' }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="w-full min-h-screen bg-ivory font-sans antialiased"
      style={{
        backgroundImage:
          "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTY2LCAxNTksIDE0OSwgMC4wNSkiLz48L3N2Zz4=')",
      }}
    >
      <div className="max-w-[1000px] mx-auto w-full py-16 px-8 flex flex-col gap-10">

        {/* ── PAGE HEADER ────────────────────────────────────────────────── */}
        <header className="flex justify-between items-end">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-ink-soft hover:text-ink-main transition mb-3 text-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Dashboard
            </button>
            <h1 className="font-serif text-3xl text-ink-main tracking-tight mb-2">Clinical Report</h1>
            <p className="text-sm text-ink-muted">Eleanor Vance • Generated Oct 25, 2023 at 08:42 AM PST</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 border border-black/10 bg-paper rounded-xl text-sm font-medium text-ink-main hover:bg-cream transition flex items-center gap-2 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </button>
            <button className="px-5 py-2.5 border border-black/10 bg-paper rounded-xl text-sm font-medium text-ink-main hover:bg-cream transition flex items-center gap-2 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Share
            </button>
            <button className="px-6 py-2.5 bg-ink-main text-paper rounded-xl text-sm font-medium hover:bg-ink-main/90 transition shadow-[0_4px_14px_rgba(44,41,38,0.2)] flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </button>
          </div>
        </header>

        {/* ── DOCUMENT CARD ──────────────────────────────────────────────── */}
        <main
          ref={mainRef}
          className="bg-cream rounded-3xl border border-black/5 p-16 flex flex-col gap-12 relative overflow-hidden"
          style={{ boxShadow: '0 24px 64px rgba(44,41,38,0.06), 0 8px 24px rgba(44,41,38,0.03)' }}
        >

          {/* ── Doc header ── */}
          <div className="report-sec flex justify-between items-start" style={{ opacity: 0 }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-main flex items-center justify-center text-paper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <span className="font-serif text-3xl font-medium tracking-tight text-ink-main">VitalSense</span>
            </div>
            <div className="text-right">
              <h2 className="font-serif text-3xl text-ink-main tracking-tight mb-2">Eleanor Vance</h2>
              <div className="font-mono text-xs text-ink-muted uppercase tracking-widest flex flex-col gap-1">
                <span>MRN: 849-291-B</span>
                <span>Date: Oct 25, 2023</span>
              </div>
            </div>
          </div>

          <hr className="border-black/10"/>

          {/* ── Clinical Summary ── */}
          <section className="report-sec" style={{ opacity: 0 }}>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-4">Clinical Summary</h3>
            <div className="bg-ivory/60 p-6 rounded-2xl border-l-[3px] border-ink-soft">
              <p className="font-serif text-[20px] leading-relaxed text-ink-main italic">
                "Patient exhibits signs of mild irregular rhythm predominantly during nocturnal hours.
                Elevated resting heart rate and decreased HRV correlate with sympathetic dominance.
                Pattern analysis indicates high probability of early-stage Paroxysmal Atrial Fibrillation.
                No immediate signs of ischemia detected."
              </p>
            </div>
          </section>

          {/* ── Vitals Table ── */}
          <section className="report-sec" style={{ opacity: 0 }}>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-4">Vitals Metrics</h3>
            <div className="border border-black/5 rounded-2xl overflow-hidden bg-paper shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-ivory/40 border-b border-black/5">
                  <tr>
                    {['Parameter', 'Value', 'Normal Range', 'Status'].map((h, i) => (
                      <th
                        key={h}
                        className={`font-mono text-[10px] uppercase tracking-widest text-ink-muted px-6 py-4 font-normal ${i === 3 ? 'text-right' : ''}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-sm">
                  {VITALS_TABLE.map(row => (
                    <tr key={row.label} className={`hover:bg-ivory/20 transition-colors group ${row.rowClass}`}>
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${row.dot} group-hover:scale-110 transition-transform`}/>
                          {row.label}
                        </div>
                      </td>
                      <td className={`px-6 py-4 font-serif text-xl ${row.valueClass}`}>
                        {row.value}{' '}
                        <span className="font-sans text-xs text-ink-muted font-normal">{row.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-ink-muted font-mono text-xs">{row.range}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`${row.badge} border px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Risk + SHAP ── */}
          <div className="report-sec grid grid-cols-2 gap-10" style={{ opacity: 0 }}>

            {/* Gauge */}
            <section className="flex flex-col border border-black/5 rounded-2xl p-8 bg-paper shadow-sm">
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-8 text-center">
                Risk Assessment
              </h3>
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="relative w-[180px] h-[90px] flex items-end justify-center overflow-hidden mb-6">
                  <svg viewBox="0 0 200 110" className="w-full h-full absolute inset-0">
                    <defs>
                      <linearGradient id="rpt-gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stopColor="#849C76"/>
                        <stop offset="50%"  stopColor="#D9A05B"/>
                        <stop offset="100%" stopColor="#A85757"/>
                      </linearGradient>
                    </defs>
                    <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="14" strokeLinecap="round"/>
                    <path
                      ref={gaugeRef}
                      d="M 10 100 A 90 90 0 0 1 190 100"
                      fill="none"
                      stroke="url(#rpt-gauge-grad)"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="relative z-10 flex items-baseline gap-1 pb-1">
                    <span className="font-serif text-[56px] text-rose-dark tracking-tighter leading-none">{score}</span>
                    <span className="text-base font-medium text-ink-muted">/100</span>
                  </div>
                </div>
                <h4 className="font-serif text-[22px] font-medium text-ink-main mb-3 text-center leading-tight">
                  Arrhythmia Event Risk
                </h4>
                <span className="bg-rose-light/60 text-rose-dark px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border border-rose-dark/10">
                  78% Confidence
                </span>
              </div>
            </section>

            {/* SHAP chart */}
            <section className="flex flex-col">
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-6">
                Factor Attribution (SHAP)
              </h3>
              <div className="relative pb-8 border-b border-black/5 flex-1 flex flex-col justify-center">
                {/* Centerline */}
                <div className="absolute left-[50%] top-0 bottom-8 w-px bg-black/10 z-0"/>
                {/* Base label */}
                <div className="absolute left-[50%] -translate-x-1/2 bottom-0 font-mono text-[9px] uppercase tracking-widest text-ink-soft">
                  Base Risk
                </div>

                <div className="flex flex-col gap-4 relative z-10">
                  {SHAP_BARS.map((b, i) => (
                    <div key={b.label} className="flex items-center text-xs group">
                      {b.dir === 'pos' ? (
                        <>
                          <div className="w-32 font-mono text-[11px] text-ink-muted truncate pr-3 text-right">{b.label}</div>
                          <div className="flex-1 relative h-[22px] flex items-center">
                            <div
                              ref={el => { barRefs.current[i] = el; }}
                              className={`bar-fill bar-positive ${b.bar} shadow-sm flex items-center justify-end pr-2 overflow-hidden`}
                              style={{ width: `${b.width}%` }}
                            >
                              <span className={`font-mono text-[9px] font-bold ${b.text} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                                {b.display}
                              </span>
                            </div>
                          </div>
                          <div className="w-16"/>
                        </>
                      ) : (
                        <>
                          <div className="w-16"/>
                          <div className="flex-1 relative h-[22px] flex items-center justify-end">
                            <div
                              ref={el => { barRefs.current[i] = el; }}
                              className={`bar-fill bar-negative ${b.bar} shadow-sm flex items-center justify-start pl-2 overflow-hidden`}
                              style={{ width: `${b.width}%` }}
                            >
                              <span className={`font-mono text-[9px] font-bold ${b.text} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                                {b.display}
                              </span>
                            </div>
                          </div>
                          <div className="w-32 font-mono text-[11px] text-ink-muted truncate pl-3 text-left">{b.label}</div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* ── ECG ── */}
          <section className="report-sec" style={{ opacity: 0 }}>
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">ECG Analysis (Lead II)</h3>
              <span className="text-[10px] font-mono text-ink-soft bg-paper border border-black/5 px-2.5 py-1 rounded-md shadow-sm">
                25 mm/s • 10 mm/mV
              </span>
            </div>
            <div
              className="w-full h-[180px] bg-[#FFFDFB] border border-rose-dark/15 rounded-2xl relative overflow-hidden"
              style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
            >
              {/* Grid */}
              <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                <defs>
                  <pattern id="rpt-ecg-sm" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(166,159,149,0.15)" strokeWidth="0.5"/>
                  </pattern>
                  <pattern id="rpt-ecg-lg" width="50" height="50" patternUnits="userSpaceOnUse">
                    <rect width="50" height="50" fill="url(#rpt-ecg-sm)"/>
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(166,159,149,0.3)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#rpt-ecg-lg)"/>
              </svg>
              {/* Waveform */}
              <svg viewBox="0 0 1000 180" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
                <path
                  ref={ecgRef}
                  fill="none"
                  stroke="#8A4B4B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M 0 90 L 20 90 C 30 80, 40 80, 50 90 L 60 90 L 65 100 L 75 30 L 80 110 L 85 90
                     L 110 90 C 130 75, 150 75, 170 90 L 250 90
                     L 260 90 C 270 80, 280 80, 290 90 L 300 90 L 305 100 L 315 30 L 320 110 L 325 90
                     L 350 90 C 370 75, 390 75, 410 90 L 460 90
                     L 470 90 C 475 85, 485 85, 490 90 L 500 90 L 505 100 L 515 30 L 520 110 L 525 90
                     L 550 90 C 570 75, 590 75, 610 90 L 740 90
                     L 750 90 C 760 80, 770 80, 780 90 L 790 90 L 795 100 L 805 30 L 810 110 L 815 90
                     L 840 90 C 860 75, 880 75, 900 90 L 1000 90"
                />
                <line x1="520" y1="150" x2="805" y2="150" stroke="#8A4B4B" strokeWidth="1.5" strokeDasharray="4 4"/>
                <text x="662" y="168" fontFamily="JetBrains Mono" fontSize="11" fontWeight="500" fill="#8A4B4B" textAnchor="middle" letterSpacing="0.05em">
                  Irregular R-R Interval Detected
                </text>
              </svg>
            </div>
          </section>

          {/* ── Recommendations ── */}
          <section className="report-sec" style={{ opacity: 0 }}>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-4">AI Recommendations</h3>
            <div className="grid grid-cols-3 gap-5">
              {RECOMMENDATIONS.map(r => (
                <div
                  key={r.label}
                  className={`rec-card flex flex-col gap-4 p-6 rounded-2xl border ${r.border} ${r.bg} ${r.hover} transition-colors shadow-sm`}
                  style={{ opacity: 0 }}
                >
                  <div className="flex justify-between items-start">
                    <div className={`w-10 h-10 rounded-xl bg-paper border ${r.iconBorder} flex items-center justify-center ${r.iconText} shadow-sm`}>
                      {r.icon}
                    </div>
                    <div className={`bg-paper ${r.badgeText} font-mono text-[9px] font-bold px-2.5 py-1.5 rounded-md shadow-sm border ${r.badgeBorder} uppercase tracking-wider`}>
                      {r.badge}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-ink-main mt-1 leading-snug">{r.label}</span>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>
    </motion.div>
  );
}
