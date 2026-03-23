import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from '../lib/gsap';
import { pageVariants } from '../lib/animations';

// ── Data ──────────────────────────────────────────────────────────────────────
const TIMELINE = [
  { year: '2024', entries: [
    { date: 'January 12', type: 'Routine Checkup', selected: false },
  ]},
  { year: '2023', entries: [
    { date: 'December 05', type: 'Follow-up Consult',     selected: false },
    { date: 'October 24',  type: 'Comprehensive Panel',   selected: true  },
    { date: 'September 18',type: 'Telemetry Review',      selected: false },
    { date: 'July 02',     type: 'Post-Op Check',         selected: false },
    { date: 'April 15',    type: 'Baseline Admission',    selected: false },
  ]},
];

const SELECTED_VITALS = [
  { label: 'Heart Rate',    value: '78',      unit: 'bpm',   color: 'bg-sage-light/40',    text: 'text-sage-dark',    icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/> },
  { label: 'Blood Pressure',value: '132/88',  unit: 'mmHg',  color: 'bg-lavender-light/40',text: 'text-lavender-dark',icon: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/> },
  { label: 'SpO2',          value: '98',      unit: '%',     color: 'bg-ink-soft/10',      text: 'text-ink-main',     icon: <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/> },
  { label: 'Temperature',   value: '36.8',    unit: '°C',    color: 'bg-sand-light/40',    text: 'text-sand-dark',    icon: <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/> },
  { label: 'Resp Rate',     value: '16',      unit: 'br/m',  color: 'bg-sage-light/40',    text: 'text-sage-dark',    icon: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></> },
  { label: 'ECG / HRV',    value: '42',      unit: 'ms',    color: 'bg-lavender-light/40',text: 'text-lavender-dark',icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/> },
];

const TREND_CARDS = [
  {
    label: 'Heart Rate', value: '72', unit: 'bpm avg', note: 'Consistent with 6-month baseline.',
    status: 'Stable', statusCls: 'bg-sand-light/80 text-ink-main', statusDir: 'right',
    valueCls: 'text-ink-main', border: 'border-black/5', bg: 'bg-ivory',
    icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>, iconBg: 'bg-sage-light/50', iconText: 'text-sage-dark',
    accentBar: null,
  },
  {
    label: 'Blood Pressure', value: '132/88', unit: 'mmHg avg', note: 'Upward trend noted over past 4 weeks.',
    status: 'Elevated', statusCls: 'bg-rose-light text-rose-dark border border-rose-dark/10', statusDir: 'up',
    valueCls: 'text-rose-dark', border: 'border-rose-dark/10', bg: 'bg-rose-light/10',
    icon: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>, iconBg: 'bg-lavender-light/50', iconText: 'text-lavender-dark',
    accentBar: 'bg-rose-dark/40',
    noteCls: 'text-rose-dark/70',
  },
  {
    label: 'ECG / HRV', value: '54', unit: 'ms avg', note: '+12% increase since intervention plan.',
    status: 'Improving', statusCls: 'bg-sage-main/30 text-sage-dark border border-sage-dark/10', statusDir: 'up',
    valueCls: 'text-sage-dark', border: 'border-sage-dark/10', bg: 'bg-sage-light/10',
    icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>, iconBg: 'bg-sage-light/50', iconText: 'text-sage-dark',
    accentBar: 'bg-sage-main/60',
    noteCls: 'text-sage-dark/70',
  },
  {
    label: 'SpO2', value: '98', unit: '% avg', note: 'Maintaining optimal oxygenation levels.',
    status: 'Stable', statusCls: 'bg-sand-light/80 text-ink-main', statusDir: 'right',
    valueCls: 'text-ink-main', border: 'border-black/5', bg: 'bg-ivory',
    icon: <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>, iconBg: 'bg-ink-soft/10', iconText: 'text-ink-main',
    accentBar: null,
  },
  {
    label: 'Resp Rate', value: '15', unit: 'br/m avg', note: 'Normal resting rhythm observed.',
    status: 'Stable', statusCls: 'bg-sand-light/80 text-ink-main', statusDir: 'right',
    valueCls: 'text-ink-main', border: 'border-black/5', bg: 'bg-ivory',
    icon: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>, iconBg: 'bg-sage-light/50', iconText: 'text-sage-dark',
    accentBar: null,
  },
  {
    label: 'Temperature', value: '36.7', unit: '°C avg', note: 'No significant variances detected.',
    status: 'Stable', statusCls: 'bg-sand-light/80 text-ink-main', statusDir: 'right',
    valueCls: 'text-ink-main', border: 'border-black/5', bg: 'bg-ivory',
    icon: <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>, iconBg: 'bg-sand-light/50', iconText: 'text-sand-dark',
    accentBar: null,
  },
];

// Chart paths
const PATH_SPO2 = 'M0 60 L 100 58 L 200 62 L 300 55 L 400 65 L 500 60 L 600 58 L 700 64 L 800 55 L 900 60 L 1000 58';
const PATH_BP   = 'M0 120 C 150 110, 200 180, 350 140 S 450 90, 550 120 S 700 170, 850 110 S 950 140, 1000 130';
const PATH_HR   = 'M0 200 C 100 190, 150 250, 250 220 S 400 180, 500 240 S 650 190, 750 230 S 900 180, 1000 210';

// ── Component ─────────────────────────────────────────────────────────────────
export default function PatientHistoryPage() {
  const navigate = useNavigate();
  const [activeRange, setActiveRange] = useState('1Y');
  const [selectedEntry, setSelectedEntry] = useState('October 24');

  const contentRef   = useRef<HTMLDivElement>(null);
  const timelineRef  = useRef<HTMLDivElement>(null);
  const chartHRRef   = useRef<SVGPathElement>(null);
  const chartBPRef   = useRef<SVGPathElement>(null);
  const chartSpO2Ref = useRef<SVGPathElement>(null);
  const trendRefs    = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger .ri items
      const items = contentRef.current?.querySelectorAll<HTMLElement>('.ri');
      if (items?.length) {
        gsap.to(items, {
          opacity: 1, y: 0,
          duration: 0.72, stagger: 0.065, ease: 'vitalize',
          clearProps: 'transform',
        });
      }

      // Timeline entries slide in from left
      const tItems = timelineRef.current?.querySelectorAll<HTMLElement>('.tl-item');
      if (tItems?.length) {
        gsap.fromTo(tItems,
          { opacity: 0, x: -18 },
          { opacity: 1, x: 0, duration: 0.55, stagger: 0.07, delay: 0.25, ease: 'vitalize' }
        );
      }

      // Chart paths draw
      ([
        [chartHRRef,   0   ],
        [chartBPRef,   0.18],
        [chartSpO2Ref, 0.36],
      ] as [React.RefObject<SVGPathElement>, number][]).forEach(([ref, extra]) => {
        const el = ref.current;
        if (!el) return;
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(el, {
          strokeDashoffset: 0,
          duration: 2.2, delay: 0.55 + extra, ease: 'vitalize-soft',
        });
      });

      // Trend cards stagger
      gsap.fromTo(trendRefs.current.filter(Boolean),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, delay: 0.4, ease: 'vitalize' }
      );
    });
    return () => ctx.revert();
  }, []);

  const StatusIcon = ({ dir }: { dir: string }) =>
    dir === 'right' ? (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
      </svg>
    ) : (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
      </svg>
    );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="bg-ivory text-ink-main font-sans w-screen h-screen overflow-hidden flex flex-col antialiased"
    >
      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header className="h-20 bg-cream/90 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-8 shrink-0 z-20">
        {/* Logo + patient */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <span className="font-serif text-xl font-medium tracking-tight">VitalSense</span>
          </div>
          <div className="h-5 w-px bg-black/10" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sand-light flex items-center justify-center text-ink-main font-serif font-medium text-sm shadow-inner-soft">EV</div>
            <div>
              <h2 className="font-medium text-sm leading-snug">Eleanor Vance</h2>
              <p className="font-mono text-[10px] text-ink-muted mt-0.5 uppercase tracking-wider">MRN: 849-291-B</p>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex items-center gap-1 bg-paper p-1 rounded-lg border border-black/5 shadow-sm">
          {[
            { label: 'Overview',     path: '/dashboard'   },
            { label: 'Predictions',  path: '/predictions' },
            { label: 'AI Insights',  path: '/insights'    },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)}
              className="px-4 py-2 rounded-md text-sm font-medium text-ink-muted hover:text-ink-main hover:bg-ivory transition">
              {item.label}
            </button>
          ))}
          <button className="px-4 py-2 rounded-md text-sm font-medium bg-sand-light/50 text-ink-main shadow-inner-soft">
            History &amp; Trends
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-full bg-paper border border-black/5 flex items-center justify-center text-ink-muted hover:text-ink-main hover:bg-cream transition shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>
          <button className="w-9 h-9 rounded-full bg-paper border border-black/5 flex items-center justify-center text-ink-muted hover:text-ink-main hover:bg-cream transition shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ══ BODY ════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex overflow-hidden">

        {/* ── LEFT TIMELINE SIDEBAR ──────────────────────────────────────── */}
        <aside className="w-[400px] h-full bg-cream/30 border-r border-black/5 flex flex-col shrink-0 overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          {/* Sticky header */}
          <div className="p-7 pb-4 border-b border-black/5 bg-cream/60 backdrop-blur-sm">
            <h3 className="font-serif text-2xl text-ink-main tracking-tight mb-1">Timeline History</h3>
            <p className="text-xs text-ink-muted">Complete longitudinal vitals record</p>
          </div>

          {/* Scrollable timeline */}
          <div className="flex-1 overflow-y-auto px-7 py-6 relative" ref={timelineRef}>
            {/* Gradient vertical line */}
            <div className="absolute left-[52px] top-6 bottom-6 w-px timeline-line pointer-events-none" />

            <div className="relative z-10 flex flex-col">
              {TIMELINE.map(({ year, entries }) => (
                <div key={year}>
                  {/* Year marker */}
                  <div className="tl-item relative flex items-center mb-6 mt-2" style={{ opacity: 0 }}>
                    <div className="absolute left-5 w-10 h-px bg-ink-soft/25" />
                    <div className="ml-14 font-serif text-xl font-medium text-ink-main tracking-tight">{year}</div>
                  </div>

                  {entries.map(entry => {
                    const isSelected = selectedEntry === entry.date;
                    return isSelected ? (
                      /* ── Selected entry card ── */
                      <div key={entry.date} className="tl-item relative flex flex-col mb-7 mt-1" style={{ opacity: 0 }}>
                        {/* Larger node */}
                        <div className="absolute left-[17px] top-6 w-3.5 h-3.5 rounded-full bg-sand-dark border-2 border-cream ring-4 ring-sand-light/50 z-10" />

                        <div className="ml-11 bg-paper rounded-xl shadow-card border border-black/5 overflow-hidden">
                          {/* Accent bar */}
                          <div className="absolute left-11 top-0 bottom-0 w-1.5 bg-sand-dark rounded-l-xl pointer-events-none" />

                          <div className="pl-5 pr-5 pt-4 pb-4 border-b border-black/5 bg-cream/20 flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-[15px] text-ink-main">{entry.date}</h4>
                              <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wider mt-0.5">{entry.type}</p>
                            </div>
                            <span className="bg-sand-light/60 text-sand-dark text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                              Selected
                            </span>
                          </div>

                          <div className="p-4 grid grid-cols-2 gap-3">
                            {SELECTED_VITALS.map(v => (
                              <div key={v.label} className="flex items-start gap-2.5">
                                <div className={`w-7 h-7 rounded ${v.color} flex items-center justify-center ${v.text} shrink-0`}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {v.icon}
                                  </svg>
                                </div>
                                <div>
                                  <div className="text-[9px] font-mono text-ink-muted uppercase tracking-wider mb-0.5">{v.label}</div>
                                  <div className="font-medium text-[13px] text-ink-main flex items-baseline gap-1">
                                    {v.value} <span className="text-[9px] text-ink-soft font-normal">{v.unit}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ── Collapsed entry row ── */
                      <motion.div
                        key={entry.date}
                        whileHover={{ x: 2 }}
                        onClick={() => setSelectedEntry(entry.date)}
                        className="tl-item relative flex items-center gap-4 mb-5 cursor-pointer group"
                        style={{ opacity: 0 }}
                      >
                        <div className="absolute left-5 w-2.5 h-2.5 rounded-full bg-ink-soft/50 border-2 border-cream group-hover:bg-sand-dark transition-colors duration-200" />
                        <div className="ml-[52px] flex items-center justify-between w-full pb-2 border-b border-black/[0.06] group-hover:border-black/10 transition-colors">
                          <div>
                            <h4 className="font-medium text-sm text-ink-main group-hover:text-ink-main">{entry.date}</h4>
                            <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wider mt-0.5">{entry.type}</p>
                          </div>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-soft group-hover:text-ink-main transition-colors duration-200">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
        <section
          ref={contentRef}
          className="flex-1 overflow-y-auto p-9 flex flex-col gap-7"
          style={{
            backgroundImage: "url(\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTY2LCAxNTksIDE0OSwgMC4wNSkiLz48L3N2Zz4=\")",
          }}
        >
          {/* Page heading */}
          <div className="ri flex items-end justify-between" style={{ transform: 'translateY(20px)' }}>
            <div>
              <h1 className="font-serif text-3xl text-ink-main tracking-tight mb-1.5">Longitudinal Analysis</h1>
              <p className="text-sm text-ink-muted">12-month trajectory of primary vital indicators.</p>
            </div>
            <div className="flex gap-2.5">
              <button className="px-4 py-2 border border-black/10 rounded-lg text-sm font-medium text-ink-main bg-paper hover:bg-cream transition shadow-sm flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export Data
              </button>
              <button className="px-4 py-2 bg-ink-main text-paper rounded-lg text-sm font-medium hover:bg-ink-main/90 transition shadow-sm">
                Add Note
              </button>
            </div>
          </div>

          {/* ── MULTI-LINE CHART CARD ─────────────────────────────────────── */}
          <div className="ri bg-paper rounded-2xl shadow-soft border border-black/5 p-7 flex flex-col" style={{ transform: 'translateY(20px)' }}>

            {/* Legend + range tabs */}
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-5">
                {[
                  { label: 'Heart Rate',            dot: 'bg-sage-main',    ring: 'ring-sage-main/20 hover:ring-sage-main/50'    },
                  { label: 'Blood Pressure (Sys)',  dot: 'bg-lavender-dark',ring: 'ring-lavender-dark/20 hover:ring-lavender-dark/50' },
                  { label: 'SpO2',                  dot: 'bg-sand-dark',    ring: 'ring-sand-dark/20 hover:ring-sand-dark/50'    },
                ].map(({ label, dot, ring }) => (
                  <div key={label} className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-2.5 h-2.5 rounded-full ${dot} ring-2 ${ring} transition`} />
                    <span className="text-sm font-medium text-ink-main">{label}</span>
                  </div>
                ))}
              </div>

              {/* Range tabs */}
              <div className="flex items-center gap-1 bg-cream p-1 rounded-lg border border-black/5">
                {['1M','3M','1Y','ALL'].map(r => (
                  <button
                    key={r}
                    onClick={() => setActiveRange(r)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                      activeRange === r
                        ? 'bg-paper text-ink-main shadow-sm border border-black/5'
                        : 'text-ink-muted hover:text-ink-main'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart area */}
            <div className="relative w-full h-[300px] bg-ivory/40 rounded-xl border border-black/5 mb-5 group overflow-visible">
              {/* Hover crosshair + tooltip */}
              <div className="absolute left-[54%] top-0 bottom-0 w-px bg-ink-soft/25 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />
              <div className="absolute left-[calc(54%-90px)] top-[70px] bg-paper shadow-float border border-black/5 rounded-xl p-3 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-[9px] font-mono text-ink-muted uppercase tracking-widest mb-2 pb-1.5 border-b border-black/5">Oct 24, 2023</div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-5 text-[11px]">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sage-main"/>&nbsp;HR</span>
                    <span className="font-semibold text-ink-main">78 bpm</span>
                  </div>
                  <div className="flex items-center justify-between gap-5 text-[11px]">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-lavender-dark"/>&nbsp;BP</span>
                    <span className="font-semibold text-rose-dark">132 mmHg</span>
                  </div>
                </div>
                {/* Arrow */}
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-paper" />
              </div>

              <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Grid lines */}
                {[40,100,160,220,280].map(y => (
                  <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(166,159,149,0.15)" strokeWidth="1" strokeDasharray="4 4"/>
                ))}
                {/* Y-axis labels */}
                {[['140',40],['120',100],['100',160],['80',220],['60',280]].map(([v,y]) => (
                  <text key={v} x="-14" y={+y+4} fontFamily="JetBrains Mono" fontSize="10" fill="#A69F95" textAnchor="end">{v}</text>
                ))}

                {/* Chart bg halos (readability) */}
                <path d={PATH_SPO2} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d={PATH_BP}   fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d={PATH_HR}   fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>

                {/* Actual chart lines */}
                <path ref={chartSpO2Ref} d={PATH_SPO2} fill="none" stroke="#DBCBB9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path ref={chartBPRef}   d={PATH_BP}   fill="none" stroke="#6A608A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path ref={chartHRRef}   d={PATH_HR}   fill="none" stroke="#63755A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

                {/* Anomaly pulse dots */}
                <g transform="translate(540,115)">
                  <circle cx="0" cy="0" r="5" fill="#8A4B4B" className="pulse-dot"/>
                  <circle cx="0" cy="0" r="3" fill="#FFFFFF"/>
                  <circle cx="0" cy="0" r="1.5" fill="#8A4B4B"/>
                </g>
                <g transform="translate(480,238)">
                  <circle cx="0" cy="0" r="5" fill="#8A4B4B" className="pulse-dot"/>
                  <circle cx="0" cy="0" r="3" fill="#FFFFFF"/>
                  <circle cx="0" cy="0" r="1.5" fill="#8A4B4B"/>
                </g>
              </svg>
            </div>

            {/* Mini scrubber */}
            <div className="relative w-full h-11 bg-ivory rounded-lg border border-black/5 overflow-hidden select-none">
              {/* Mini path overview */}
              <svg viewBox="0 0 1000 44" className="w-full h-full absolute inset-0 opacity-35" preserveAspectRatio="none">
                <path d="M0 10 L 200 12 L 400 8 L 600 15 L 800 10 L 1000 12" fill="none" stroke="#DBCBB9" strokeWidth="1"/>
                <path d="M0 22 C 200 18, 300 34, 500 24 S 700 28, 1000 18" fill="none" stroke="#6A608A" strokeWidth="1.5"/>
                <path d="M0 34 C 150 28, 250 44, 450 34 S 750 38, 1000 34" fill="none" stroke="#63755A" strokeWidth="1"/>
              </svg>
              {/* Selected window */}
              <div className="absolute left-[20%] right-[30%] top-0 bottom-0 bg-sand-light/50 border-l-2 border-r-2 border-sand-dark/60 hover:bg-sand-light/70 transition-colors cursor-grab">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-5 bg-paper border border-black/10 rounded-full shadow-sm flex items-center justify-center cursor-ew-resize">
                  <div className="w-0.5 h-2.5 bg-ink-soft/40 rounded-full"/>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-5 bg-paper border border-black/10 rounded-full shadow-sm flex items-center justify-center cursor-ew-resize">
                  <div className="w-0.5 h-2.5 bg-ink-soft/40 rounded-full"/>
                </div>
              </div>
              {/* Dimmed regions */}
              <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-paper/55 pointer-events-none"/>
              <div className="absolute right-0 top-0 bottom-0 w-[30%] bg-paper/55 pointer-events-none"/>
            </div>

            {/* Month labels */}
            <div className="flex justify-between px-1 mt-2 text-[10px] font-mono text-ink-muted uppercase tracking-wider">
              {['Jan','Mar','May','Jul','Sep','Nov'].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>

          {/* ── VITAL TRENDS GRID ─────────────────────────────────────────── */}
          <div className="ri bg-paper rounded-2xl shadow-soft border border-black/5 p-7" style={{ transform: 'translateY(20px)' }}>
            <h3 className="font-serif text-xl font-medium text-ink-main tracking-tight mb-6">Vital Trends &amp; Trajectory</h3>
            <div className="grid grid-cols-3 gap-4">
              {TREND_CARDS.map((card, i) => (
                <div
                  key={card.label}
                  ref={el => { trendRefs.current[i] = el; }}
                  className={`relative p-5 rounded-xl border ${card.border} ${card.bg} flex flex-col gap-3 overflow-hidden`}
                  style={{ opacity: 0 }}
                >
                  {card.accentBar && (
                    <div className={`absolute right-0 top-0 bottom-0 w-1 ${card.accentBar} rounded-r-xl`}/>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded ${card.iconBg} flex items-center justify-center ${card.iconText}`}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {card.icon}
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-ink-main">{card.label}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${card.statusCls} px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider`}>
                      <StatusIcon dir={card.statusDir}/>
                      {card.status}
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className={`text-2xl font-serif ${card.valueCls} leading-none`}>{card.value}</span>
                    <span className="text-xs text-ink-muted mb-0.5">{card.unit}</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${card.noteCls ?? 'text-ink-soft'}`}>{card.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* bottom padding */}
          <div className="h-4" />
        </section>
      </main>
    </motion.div>
  );
}
