import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from '../lib/gsap';
import { pageVariants } from '../lib/animations';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { usePredictionStore } from '../store/predictionStore';
import type { LastSubmittedVitals, ShapEntry } from '../store/predictionStore';
import { getRecommendations } from '../lib/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildVitalsRows(v: LastSubmittedVitals) {
  const hrOk   = v.hr >= 60 && v.hr <= 100;
  const bpOk   = v.bp_systolic < 120;
  const bpElev = v.bp_systolic >= 120 && v.bp_systolic < 140;
  const spo2Ok = v.spo2 >= 95;
  const tempOk = v.temp >= 36.1 && v.temp <= 37.2;
  const rrOk   = v.rr >= 12 && v.rr <= 20;
  return [
    {
      dot: hrOk ? 'bg-sage-main' : 'bg-rose-main',
      label: 'Heart Rate', value: String(Math.round(v.hr)), unit: 'bpm',
      range: '60 – 100',
      status: hrOk ? 'Normal' : v.hr > 100 ? 'Elevated' : 'Low',
      badge: hrOk ? 'bg-sage-light text-sage-dark border-sage-dark/10' : 'bg-rose-light text-rose-dark border-rose-dark/20',
      valueClass: hrOk ? '' : 'text-rose-dark', rowClass: hrOk ? '' : 'bg-rose-light/5',
    },
    {
      dot: bpOk ? 'bg-sage-main' : 'bg-lavender-main',
      label: 'Blood Pressure', value: `${Math.round(v.bp_systolic)}/${Math.round(v.bp_diastolic)}`, unit: 'mmHg',
      range: '120/80',
      status: bpOk ? 'Normal' : bpElev ? 'Elevated' : 'High',
      badge: bpOk ? 'bg-sage-light text-sage-dark border-sage-dark/10' : 'bg-lavender-light text-lavender-dark border-lavender-dark/10',
      valueClass: '', rowClass: '',
    },
    {
      dot: spo2Ok ? 'bg-sage-main' : 'bg-rose-main',
      label: 'SpO₂', value: String(Math.round(v.spo2)), unit: '%',
      range: '95 – 100%',
      status: spo2Ok ? 'Normal' : 'Low',
      badge: spo2Ok ? 'bg-sage-light text-sage-dark border-sage-dark/10' : 'bg-rose-light text-rose-dark border-rose-dark/20',
      valueClass: spo2Ok ? '' : 'text-rose-dark', rowClass: spo2Ok ? '' : 'bg-rose-light/5',
    },
    {
      dot: tempOk ? 'bg-sage-main' : 'bg-amber-main',
      label: 'Temperature', value: v.temp.toFixed(1), unit: '°C',
      range: '36.1 – 37.2',
      status: tempOk ? 'Normal' : 'Elevated',
      badge: tempOk ? 'bg-sage-light text-sage-dark border-sage-dark/10' : 'bg-amber-light text-amber-dark border-amber-dark/10',
      valueClass: '', rowClass: '',
    },
    {
      dot: rrOk ? 'bg-sage-main' : 'bg-amber-main',
      label: 'Resp Rate', value: String(Math.round(v.rr)), unit: 'br/m',
      range: '12 – 20',
      status: rrOk ? 'Normal' : 'Abnormal',
      badge: rrOk ? 'bg-sage-light text-sage-dark border-sage-dark/10' : 'bg-amber-light text-amber-dark border-amber-dark/10',
      valueClass: '', rowClass: '',
    },
  ];
}

const POS_BARS = ['bg-rose-main/90', 'bg-amber-main/90', 'bg-rose-light border border-rose-dark/10'];
const NEG_BARS = ['bg-lavender-main/90', 'bg-sage-main/90'];
const POS_TEXT = ['text-rose-dark', 'text-amber-dark', 'text-rose-dark'];
const NEG_TEXT = ['text-lavender-dark', 'text-sage-dark'];

function buildShapBars(shap: ShapEntry[]) {
  let posIdx = 0, negIdx = 0;
  return shap.map(s => {
    const width = Math.min(Math.abs(s.shap_score) / 0.5 * 100, 100);
    const isPos = s.shap_score > 0;
    const bar  = isPos ? POS_BARS[Math.min(posIdx,   POS_BARS.length - 1)] : NEG_BARS[Math.min(negIdx,   NEG_BARS.length - 1)];
    const text = isPos ? POS_TEXT[Math.min(posIdx,   POS_TEXT.length - 1)] : NEG_TEXT[Math.min(negIdx,   NEG_TEXT.length - 1)];
    if (isPos) posIdx++; else negIdx++;
    return {
      label: s.display_name,
      width,
      dir: isPos ? 'pos' : 'neg',
      bar, text,
      display: `${s.shap_score > 0 ? '+' : ''}${(s.shap_score * 100).toFixed(0)}%`,
    };
  });
}

// ── Fallback data (shown when store is empty) ─────────────────────────────────

const FALLBACK_VITALS = [
  { dot: 'bg-sage-main',     label: 'Heart Rate',     value: '72',     unit: 'bpm',  range: '60 – 100',    status: 'Normal',  badge: 'bg-sage-light text-sage-dark border-sage-dark/10',         valueClass: '',             rowClass: '' },
  { dot: 'bg-lavender-main', label: 'Blood Pressure', value: '135/85', unit: 'mmHg', range: '120/80',       status: 'Elevated',badge: 'bg-lavender-light text-lavender-dark border-lavender-dark/10', valueClass: '',             rowClass: '' },
  { dot: 'bg-sage-main',     label: 'SpO₂',           value: '99',     unit: '%',    range: '95 – 100%',   status: 'Normal',  badge: 'bg-sage-light text-sage-dark border-sage-dark/10',         valueClass: '',             rowClass: '' },
  { dot: 'bg-sage-main',     label: 'Temperature',    value: '36.8',   unit: '°C',   range: '36.1 – 37.2', status: 'Normal',  badge: 'bg-sage-light text-sage-dark border-sage-dark/10',         valueClass: '',             rowClass: '' },
  { dot: 'bg-sage-main',     label: 'Resp Rate',      value: '14',     unit: 'br/m', range: '12 – 20',     status: 'Normal',  badge: 'bg-sage-light text-sage-dark border-sage-dark/10',         valueClass: '',             rowClass: '' },
  { dot: 'bg-rose-main',     label: 'ECG / HRV',      value: '42',     unit: 'ms',   range: '50 – 100',    status: 'Low',     badge: 'bg-rose-light text-rose-dark border-rose-dark/20',         valueClass: 'text-rose-dark', rowClass: 'bg-rose-light/5' },
];

const FALLBACK_SHAP = [
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
  const { result, lastVitals, narrative } = usePredictionStore();

  const TARGET_SCORE    = result ? Math.round(result.overall_risk_score * 100) : 78;
  const conditionName   = result?.primary_condition.name ?? 'Arrhythmia Event Risk';
  const conditionConf   = result ? Math.round(result.primary_condition.probability * 100) : 78;
  const reportDate      = result?.timestamp
    ? new Date(result.timestamp).toLocaleString()
    : 'Oct 25, 2023 at 08:42 AM PST';
  const summaryText     = narrative ||
    'Patient exhibits signs of mild irregular rhythm predominantly during nocturnal hours. ' +
    'Elevated resting heart rate and decreased HRV correlate with sympathetic dominance. ' +
    'Pattern analysis indicates high probability of early-stage Paroxysmal Atrial Fibrillation. ' +
    'No immediate signs of ischemia detected.';

  const vitalsData = lastVitals ? buildVitalsRows(lastVitals) : FALLBACK_VITALS;
  const shapData   = result?.shap?.length ? buildShapBars(result.shap.slice(0, 5)) : FALLBACK_SHAP;

  const [score, setScore] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{ label: string; badge: string; type: string }> | null>(null);

  useEffect(() => {
    if (!result) return;
    getRecommendations(
      lastVitals ?? {},
      result.conditions ?? [],
      result.shap ?? [],
      narrative || undefined,
    ).then(setRecommendations).catch(() => {/* use fallback */});
  }, [result?.timestamp]); // eslint-disable-line react-hooks/exhaustive-deps

  const gaugeRef   = useRef<SVGPathElement>(null);
  const ecgRef     = useRef<SVGPathElement>(null);
  const barRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const mainRef    = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!mainRef.current || pdfLoading) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(mainRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save('VitalSense-Report-Eleanor-Vance.pdf');
    } finally {
      setPdfLoading(false);
    }
  };

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
        gsap.to(gaugeRef.current, { strokeDashoffset: 283 * (1 - TARGET_SCORE / 100), duration: 1.9, delay: 0.55, ease: 'vitalize-soft' });
      }

      // Score counter
      const proxy = { val: 0 };
      gsap.to(proxy, {
        val: TARGET_SCORE, duration: 1.7, delay: 0.55, ease: 'vitalize-soft',
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

    });
    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-animate rec cards whenever recommendations data arrives
  useEffect(() => {
    const recCards = mainRef.current?.querySelectorAll('.rec-card');
    if (!recCards?.length) return;
    gsap.fromTo(recCards,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.09, duration: 0.45, ease: 'vitalize' }
    );
  }, [recommendations]);

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
            <p className="text-sm text-ink-muted">Eleanor Vance • Generated {reportDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="px-5 py-2.5 border border-black/10 bg-paper rounded-xl text-sm font-medium text-ink-main hover:bg-cream transition flex items-center gap-2 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </button>
            <button onClick={handleShare} className="px-5 py-2.5 border border-black/10 bg-paper rounded-xl text-sm font-medium text-ink-main hover:bg-cream transition flex items-center gap-2 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              {shareCopied ? 'Link Copied!' : 'Share'}
            </button>
            <button onClick={handleDownloadPDF} disabled={pdfLoading} className="px-6 py-2.5 bg-ink-main text-paper rounded-xl text-sm font-medium hover:bg-ink-main/90 transition shadow-[0_4px_14px_rgba(44,41,38,0.2)] flex items-center gap-2 disabled:opacity-60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {pdfLoading ? 'Generating…' : 'Download PDF'}
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
                <span>Date: {reportDate}</span>
              </div>
            </div>
          </div>

          <hr className="border-black/10"/>

          {/* ── Clinical Summary ── */}
          <section className="report-sec" style={{ opacity: 0 }}>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-4">Clinical Summary</h3>
            <div className="bg-ivory/60 p-6 rounded-2xl border-l-[3px] border-ink-soft">
              <p className="font-serif text-[20px] leading-relaxed text-ink-main italic whitespace-pre-line">
                "{summaryText}"
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
                  {vitalsData.map(row => (
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
                  {conditionName}
                </h4>
                <span className="bg-rose-light/60 text-rose-dark px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border border-rose-dark/10">
                  {conditionConf}% Confidence
                </span>
              </div>
            </section>

            {/* SHAP chart */}
            <section className="flex flex-col">
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-6">
                Factor Attribution (SHAP)
              </h3>
              <div className="flex-1 flex flex-col gap-3 justify-center">
                {shapData.map((b, i) => (
                  <div key={b.label} className="flex items-center gap-3 min-w-0">
                    <div className="w-24 font-mono text-[11px] text-ink-muted truncate text-right flex-shrink-0">{b.label}</div>
                    <div className="flex-1 min-w-0 bg-ivory rounded-full overflow-hidden h-[16px]">
                      <div
                        ref={el => { barRefs.current[i] = el; }}
                        className={`bar-fill h-full rounded-full ${b.bar}`}
                        style={{ width: `${b.width}%`, minWidth: '4px' }}
                      />
                    </div>
                    <div className={`w-10 font-mono text-[10px] font-bold flex-shrink-0 ${b.text}`}>
                      {b.display}
                    </div>
                  </div>
                ))}
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
              {(recommendations ?? RECOMMENDATIONS).map((r, i) => {
                const isReal = recommendations !== null;
                const type = isReal ? (r as { label: string; badge: string; type: string }).type : null;
                const colors = type === 'urgent'
                  ? { border: 'border-rose-dark/15', bg: 'bg-rose-light/10', hover: 'hover:bg-rose-light/20', iconBorder: 'border-rose-dark/10', iconText: 'text-rose-dark', badgeBorder: 'border-rose-dark/10', badgeText: 'text-rose-dark' }
                  : type === 'moderate'
                  ? { border: 'border-amber-dark/15', bg: 'bg-amber-light/10', hover: 'hover:bg-amber-light/20', iconBorder: 'border-amber-dark/10', iconText: 'text-amber-dark', badgeBorder: 'border-amber-dark/10', badgeText: 'text-amber-dark' }
                  : { border: 'border-sage-dark/15', bg: 'bg-sage-light/10', hover: 'hover:bg-sage-light/20', iconBorder: 'border-sage-dark/10', iconText: 'text-sage-dark', badgeBorder: 'border-sage-dark/10', badgeText: 'text-sage-dark' };
                const rc = isReal ? colors : (r as typeof RECOMMENDATIONS[0]);
                const icons = [
                  <svg key="a" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
                  <svg key="b" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                  <svg key="c" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
                ];
                return (
                  <div
                    key={r.label}
                    className={`rec-card flex flex-col gap-4 p-6 rounded-2xl border ${rc.border} ${rc.bg} ${rc.hover} transition-colors shadow-sm`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`w-10 h-10 rounded-xl bg-paper border ${rc.iconBorder} flex items-center justify-center ${rc.iconText} shadow-sm`}>
                        {isReal ? icons[i % 3] : (r as typeof RECOMMENDATIONS[0]).icon}
                      </div>
                      <div className={`bg-paper ${rc.badgeText} font-mono text-[9px] font-bold px-2.5 py-1.5 rounded-md shadow-sm border ${rc.badgeBorder} uppercase tracking-wider`}>
                        {r.badge}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-ink-main mt-1 leading-snug">{r.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

        </main>
      </div>
    </motion.div>
  );
}
