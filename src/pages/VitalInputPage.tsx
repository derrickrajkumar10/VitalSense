import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { pageVariants } from '../lib/animations';
import { gsap } from '../lib/gsap';
import CriticalAlertModal from '../components/CriticalAlertModal';
import type { AlertData } from '../components/CriticalAlertModal';
import { useVitals } from '../context/VitalsContext';

// ── Types ────────────────────────────────────────────────────────────────────
type TabId = 'manual' | 'voice' | 'csv' | 'pdf';
type ProfileKey = 'healthy' | 'prediabetic' | 'cardiac';

interface VitalValues {
  hr: string;
  bp: string;
  spo2: string;
  temp: string;
  resp: string;
  hrv: string;
}

// ── Constants ────────────────────────────────────────────────────────────────
const PRESETS: Record<ProfileKey, VitalValues> = {
  healthy:     { hr: '68',  bp: '115/75', spo2: '99', temp: '36.6', resp: '14', hrv: '75' },
  prediabetic: { hr: '78',  bp: '130/85', spo2: '97', temp: '36.8', resp: '16', hrv: '55' },
  cardiac:     { hr: '62',  bp: '110/70', spo2: '95', temp: '36.5', resp: '18', hrv: '40' },
};

const WAVE_HEIGHTS = [14, 28, 46, 60, 38, 22, 10];
const WAVE_COLORS  = [
  'bg-sage-main', 'bg-sage-dark', 'bg-lavender-main',
  'bg-lavender-dark', 'bg-lavender-main', 'bg-sage-dark', 'bg-sage-main',
];

const TABS: { id: TabId; label: string }[] = [
  { id: 'manual', label: 'Manual Entry' },
  { id: 'voice',  label: 'Voice Input'  },
  { id: 'csv',    label: 'CSV Upload'   },
  { id: 'pdf',    label: 'PDF Upload'   },
];

// ── Vital card definitions ──────────────────────────────────────────────────
const VITAL_CARDS = [
  {
    id: 'hr' as const,
    label: 'Heart Rate',
    unit: 'bpm',
    placeholder: '--',
    type: 'number',
    step: undefined,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
      </svg>
    ),
    iconBg: 'bg-sage-light/50',
    iconColor: 'text-sage-dark',
    focusRing: 'focus-within:border-sage-dark/30 focus-within:shadow-[0_0_0_2px_rgba(210,222,203,0.5)]',
    inputWidth: 'w-24',
  },
  {
    id: 'bp' as const,
    label: 'Blood Pressure',
    unit: 'mmHg',
    placeholder: '--/--',
    type: 'text',
    step: undefined,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>
    ),
    iconBg: 'bg-lavender-light/50',
    iconColor: 'text-lavender-dark',
    focusRing: 'focus-within:border-lavender-dark/30 focus-within:shadow-[0_0_0_2px_rgba(226,223,236,0.5)]',
    inputWidth: 'w-32',
  },
  {
    id: 'spo2' as const,
    label: 'SpO2',
    unit: '%',
    placeholder: '--',
    type: 'number',
    step: undefined,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
      </svg>
    ),
    iconBg: 'bg-sage-light/50',
    iconColor: 'text-sage-dark',
    focusRing: 'focus-within:border-sage-dark/30 focus-within:shadow-[0_0_0_2px_rgba(210,222,203,0.5)]',
    inputWidth: 'w-24',
  },
  {
    id: 'temp' as const,
    label: 'Temperature',
    unit: '°C',
    placeholder: '--.-',
    type: 'number',
    step: '0.1',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
      </svg>
    ),
    iconBg: 'bg-sand-light/50',
    iconColor: 'text-ink-main',
    focusRing: 'focus-within:border-sand-dark/30',
    inputWidth: 'w-28',
  },
  {
    id: 'resp' as const,
    label: 'Respiratory Rate',
    unit: 'br/m',
    placeholder: '--',
    type: 'number',
    step: undefined,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/>
        <line x1="10" y1="1" x2="10" y2="4"/>
        <line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    iconBg: 'bg-sage-light/50',
    iconColor: 'text-sage-dark',
    focusRing: 'focus-within:border-sage-dark/30 focus-within:shadow-[0_0_0_2px_rgba(210,222,203,0.5)]',
    inputWidth: 'w-24',
  },
  {
    id: 'hrv' as const,
    label: 'ECG / HRV',
    unit: 'ms',
    placeholder: '--',
    type: 'number',
    step: undefined,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    iconBg: 'bg-lavender-light/50',
    iconColor: 'text-lavender-dark',
    focusRing: 'focus-within:border-lavender-dark/30 focus-within:shadow-[0_0_0_2px_rgba(226,223,236,0.5)]',
    inputWidth: 'w-24',
  },
];

// ── Clinical alert thresholds ─────────────────────────────────────────────
interface Threshold {
  condition: string;
  chipText: (v: number) => string;
  thresholdText: string;
  description: string;
  check: (v: number) => boolean;
}

const ALERT_THRESHOLDS: Record<string, Threshold[]> = {
  hr: [
    {
      condition: 'Ventricular Tachycardia',
      chipText: v => `Heart Rate ${v} bpm`,
      thresholdText: 'Critical > 130',
      description: 'Sustained elevated rate with irregular R-R intervals detected. Stroke volume may be trending downward. Immediate clinical evaluation and intervention is advised.',
      check: v => v > 130 && v <= 250,
    },
    {
      condition: 'Severe Bradycardia',
      chipText: v => `Heart Rate ${v} bpm`,
      thresholdText: 'Critical < 40',
      description: 'Dangerously low heart rate detected. Risk of syncope and reduced cardiac output. Immediate clinical assessment is required.',
      check: v => v < 40 && v >= 20,
    },
  ],
  spo2: [
    {
      condition: 'Severe Hypoxemia',
      chipText: v => `SpO₂ ${v}%`,
      thresholdText: 'Critical < 90%',
      description: 'Critically low oxygen saturation detected. Risk of organ damage and respiratory failure. Supplemental oxygen and immediate clinical evaluation are required.',
      check: v => v < 90 && v >= 0,
    },
  ],
  temp: [
    {
      condition: 'Hyperpyrexia',
      chipText: v => `Temperature ${v.toFixed(1)}°C`,
      thresholdText: 'Critical > 39.5°C',
      description: 'Extremely elevated body temperature detected. Risk of neurological damage and multi-organ failure. Immediate cooling measures and clinical intervention are required.',
      check: v => v > 39.5,
    },
    {
      condition: 'Hypothermia',
      chipText: v => `Temperature ${v.toFixed(1)}°C`,
      thresholdText: 'Critical < 35.0°C',
      description: 'Critically low body temperature detected. Risk of cardiac arrhythmia and metabolic acidosis. Immediate warming protocol and clinical assessment are required.',
      check: v => v < 35.0,
    },
  ],
  resp: [
    {
      condition: 'Severe Tachypnea',
      chipText: v => `Resp Rate ${v} br/m`,
      thresholdText: 'Critical > 30 br/m',
      description: 'Dangerously elevated respiratory rate detected. May indicate acute respiratory distress, metabolic acidosis, or sepsis. Immediate clinical evaluation is required.',
      check: v => v > 30,
    },
    {
      condition: 'Respiratory Depression',
      chipText: v => `Resp Rate ${v} br/m`,
      thresholdText: 'Critical < 8 br/m',
      description: 'Critically low respiratory rate detected. Risk of CO₂ retention and respiratory failure. Immediate airway management and clinical intervention are required.',
      check: v => v < 8 && v > 0,
    },
  ],
  hrv: [
    {
      condition: 'Critical HRV Depression',
      chipText: v => `ECG/HRV ${v} ms`,
      thresholdText: 'Critical < 20 ms',
      description: 'Severely reduced heart rate variability indicating significant autonomic dysfunction. Associated with elevated risk of acute cardiac events. Immediate clinical review is advised.',
      check: v => v < 20 && v > 0,
    },
  ],
  bp: [
    {
      condition: 'Hypertensive Crisis',
      chipText: v => `Systolic BP ${v} mmHg`,
      thresholdText: 'Critical ≥ 180 mmHg',
      description: 'Blood pressure at a dangerously elevated level. Risk of stroke, myocardial infarction, and end-organ damage. Emergency medical intervention is required immediately.',
      check: v => v >= 180,
    },
    {
      condition: 'Hypotensive Emergency',
      chipText: v => `Systolic BP ${v} mmHg`,
      thresholdText: 'Critical ≤ 80 mmHg',
      description: 'Critically low blood pressure detected. Risk of circulatory shock and end-organ failure. Immediate clinical assessment and IV fluid resuscitation are required.',
      check: v => v <= 80 && v > 0,
    },
  ],
};

// ── Component ────────────────────────────────────────────────────────────────
export default function VitalInputPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { submitVitals } = useVitals();

  const [activeTab, setActiveTab]   = useState<TabId>('manual');
  const [values, setValues]         = useState<VitalValues>({ hr: '', bp: '', spo2: '', temp: '', resp: '', hrv: '' });
  const [toastMsg, setToastMsg]     = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [voiceActive, setVoiceActive]   = useState(false);
  const [alertData, setAlertData]       = useState<AlertData | null>(null);
  const [showAlert, setShowAlert]       = useState(false);
  const [csvFileName, setCsvFileName]   = useState<string | null>(null);
  const [pdfFileName, setPdfFileName]   = useState<string | null>(null);

  // File input refs
  const csvInputRef  = useRef<HTMLInputElement>(null);
  const pdfInputRef  = useRef<HTMLInputElement>(null);

  // Page-level refs
  const headerRef       = useRef<HTMLDivElement>(null);
  const tabBarRef       = useRef<HTMLDivElement>(null);
  const presetsRef      = useRef<HTMLDivElement>(null);
  const panelWrapRef    = useRef<HTMLDivElement>(null);
  const tabPanelRef     = useRef<HTMLDivElement>(null);
  const cardsGridRef    = useRef<HTMLDivElement>(null);
  const submitBtnRef    = useRef<HTMLButtonElement>(null);
  const sidebarRef      = useRef<HTMLElement>(null);
  const entriesRef      = useRef<HTMLDivElement>(null);
  const toastRef        = useRef<HTMLDivElement>(null);
  const waveRef         = useRef<HTMLDivElement>(null);
  const scanLineRef     = useRef<HTMLDivElement>(null);
  const scanGlowRef     = useRef<HTMLDivElement>(null);

  const toastTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabMountedRef   = useRef(false);
  const tabSetRef       = useRef(false);

  // ── Page-enter GSAP timeline ───────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'vitalize' } });

      tl.fromTo(headerRef.current,
        { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.75 }
      )
      .fromTo(tabBarRef.current,
        { opacity: 0, y: 22, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, '-=0.45'
      )
      .fromTo(
        presetsRef.current ? Array.from(presetsRef.current.children) : [],
        { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.07 }, '-=0.3'
      )
      .fromTo(panelWrapRef.current,
        { opacity: 0, y: 20, scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: 0.65 }, '-=0.25'
      )
      .fromTo(
        cardsGridRef.current ? Array.from(cardsGridRef.current.children) : [],
        { opacity: 0, y: 36, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.065 }, '-=0.45'
      )
      .fromTo(sidebarRef.current,
        { opacity: 0, x: 56 }, { opacity: 1, x: 0, duration: 0.75 }, '-=0.65'
      )
      .fromTo(
        entriesRef.current ? Array.from(entriesRef.current.children) : [],
        { opacity: 0, x: 28 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.09 }, '-=0.5'
      );
    });

    return () => ctx.revert();
  }, []);

  // ── Switch to voice tab if mode=note ──────────────────────────────────────
  useEffect(() => {
    if (searchParams.get('mode') === 'note') {
      setActiveTab('voice');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tab switch — set invisible before paint ────────────────────────────────
  useLayoutEffect(() => {
    if (!tabSetRef.current) { tabSetRef.current = true; return; }
    const panel = tabPanelRef.current;
    if (!panel) return;
    gsap.set(panel, { opacity: 0, y: 14 });
    if (activeTab === 'manual' && cardsGridRef.current) {
      gsap.set(Array.from(cardsGridRef.current.children), { opacity: 0, y: 22, scale: 0.97 });
    }
  }, [activeTab]);

  // ── Tab switch — animate in after paint ────────────────────────────────────
  useEffect(() => {
    if (!tabMountedRef.current) { tabMountedRef.current = true; return; }
    const panel = tabPanelRef.current;
    if (!panel) return;
    gsap.to(panel, { opacity: 1, y: 0, duration: 0.42, ease: 'vitalize-soft' });
    if (activeTab === 'manual' && cardsGridRef.current) {
      gsap.to(Array.from(cardsGridRef.current.children), {
        opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.055, delay: 0.06, ease: 'vitalize',
      });
    }
  }, [activeTab]);

  // ── Toast animation ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = toastRef.current;
    if (!el) return;
    if (toastVisible) {
      gsap.killTweensOf(el);
      gsap.fromTo(el, { x: '120%', opacity: 0 }, { x: '0%', opacity: 1, duration: 0.52, ease: 'vitalize-soft' });
    } else {
      gsap.killTweensOf(el);
      gsap.to(el, { x: '120%', opacity: 0, duration: 0.38, ease: 'vitalize-sharp' });
    }
  }, [toastVisible]);

  // ── Voice waveform bars ────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'voice' || !waveRef.current) return;
    const bars = Array.from(waveRef.current.querySelectorAll<HTMLElement>('.wave-bar'));
    const tweens = bars.map((bar, i) =>
      gsap.to(bar, {
        scaleY: () => 0.15 + Math.random() * 0.85,
        duration: 0.28 + (i % 3) * 0.14,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.1,
      })
    );
    return () => tweens.forEach(t => t.kill());
  }, [activeTab]);

  // ── PDF scan line ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'pdf') return;
    const line = scanLineRef.current;
    const glow = scanGlowRef.current;
    if (!line) return;
    const els: Element[] = [line, glow].filter(Boolean) as Element[];
    const tl = gsap.timeline({ repeat: -1 });
    tl.fromTo(els, { top: '-5%', opacity: 0 }, { top: '108%', opacity: 1, duration: 2.4, ease: 'none' })
      .to(els, { opacity: 0, duration: 0.12 }, '-=0.12');
    return () => { tl.kill(); };
  }, [activeTab]);

  // ── Card focus micro-interaction ───────────────────────────────────────────
  useEffect(() => {
    const grid = cardsGridRef.current;
    if (!grid) return;
    const onFocusIn = (e: FocusEvent) => {
      const card = (e.target as Element).closest<HTMLElement>('.vital-card');
      if (card) gsap.to(card, { scale: 1.015, duration: 0.28, ease: 'vitalize-soft' });
    };
    const onFocusOut = (e: FocusEvent) => {
      const card = (e.target as Element).closest<HTMLElement>('.vital-card');
      if (card) gsap.to(card, { scale: 1, duration: 0.28, ease: 'vitalize-soft' });
    };
    grid.addEventListener('focusin', onFocusIn);
    grid.addEventListener('focusout', onFocusOut);
    return () => {
      grid.removeEventListener('focusin', onFocusIn);
      grid.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const switchTab = useCallback((id: TabId) => {
    if (id === activeTab) return;
    const panel = tabPanelRef.current;
    if (panel) {
      gsap.to(panel, {
        opacity: 0, y: -10, duration: 0.18, ease: 'vitalize-sharp',
        onComplete: () => setActiveTab(id),
      });
    } else {
      setActiveTab(id);
    }
  }, [activeTab]);

  const animateToPreset = useCallback((preset: VitalValues) => {
    const proxy = {
      hr:   parseFloat(values.hr)   || 0,
      spo2: parseFloat(values.spo2) || 0,
      temp: parseFloat(values.temp) || 36,
      resp: parseFloat(values.resp) || 0,
      hrv:  parseFloat(values.hrv)  || 0,
    };
    gsap.to(proxy, {
      hr:   parseFloat(preset.hr),
      spo2: parseFloat(preset.spo2),
      temp: parseFloat(preset.temp),
      resp: parseFloat(preset.resp),
      hrv:  parseFloat(preset.hrv),
      duration: 0.8,
      ease: 'vitalize-sharp',
      onUpdate() {
        setValues(v => ({
          ...v,
          hr:   String(Math.round(proxy.hr)),
          spo2: String(Math.round(proxy.spo2)),
          temp: proxy.temp.toFixed(1),
          resp: String(Math.round(proxy.resp)),
          hrv:  String(Math.round(proxy.hrv)),
          bp:   preset.bp,
        }));
      },
    });
  }, [values]);

  const loadPreset = useCallback((profile: ProfileKey, btn?: EventTarget & HTMLButtonElement) => {
    dismissToast();
    if (btn) {
      gsap.fromTo(btn, { scale: 1 }, { scale: 0.93, duration: 0.1, yoyo: true, repeat: 1, ease: 'vitalize-sharp' });
    }
    const preset = PRESETS[profile];
    if (activeTab !== 'manual') {
      switchTab('manual');
      setTimeout(() => animateToPreset(preset), 360);
    } else {
      animateToPreset(preset);
    }
  }, [activeTab, switchTab, animateToPreset]);

  const checkCriticalThreshold = useCallback((field: keyof VitalValues, raw: string) => {
    const thresholds = ALERT_THRESHOLDS[field];
    if (!thresholds) return;

    // For BP parse the systolic part
    let numVal: number;
    if (field === 'bp') {
      numVal = parseFloat(raw.split('/')[0]);
    } else {
      numVal = parseFloat(raw);
    }
    if (isNaN(numVal)) return;

    for (const t of thresholds) {
      if (t.check(numVal)) {
        setAlertData({ condition: t.condition, chipText: t.chipText(numVal), thresholdText: t.thresholdText, description: t.description });
        setShowAlert(true);
        return;
      }
    }
  }, []);

  const validateInput = useCallback((field: 'hr' | 'spo2', raw: string) => {
    const n = parseFloat(raw);
    if (isNaN(n)) { dismissToast(); return; }
    if (field === 'hr' && (n > 250 || n < 20)) {
      showToast(`A heart rate of ${n} bpm is highly irregular or physiologically impossible. Please verify sensor placement or entry.`);
    } else if (field === 'spo2' && n > 100) {
      showToast('SpO2 values cannot exceed 100%. Please check the entered value.');
    } else {
      dismissToast();
    }
  }, []);

  function showToast(message: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg(message);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 6000);
  }

  function dismissToast() {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastVisible(false);
  }

  const onSubmitHover = (enter: boolean) => {
    if (!submitBtnRef.current) return;
    gsap.to(submitBtnRef.current, {
      scale: enter ? 1.018 : 1,
      boxShadow: enter
        ? '0 8px 28px rgba(44,41,38,0.28)'
        : '0 4px 14px rgba(44,41,38,0.2)',
      duration: 0.26,
      ease: 'vitalize-soft',
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="w-screen h-screen overflow-hidden flex flex-row gap-6 p-4 bg-ivory text-ink-main font-sans antialiased"
    >
      {/* ── Warning Toast ─────────────────────────────────────────────────── */}
      <div
        ref={toastRef}
        className="fixed top-8 right-8 z-50 bg-paper border border-amber-main shadow-float rounded-2xl p-5 flex gap-4 w-96"
        style={{ transform: 'translateX(120%)', opacity: 0 }}
      >
        <div className="w-10 h-10 rounded-full bg-amber-light flex items-center justify-center text-amber-dark shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <h4 className="font-medium text-sm text-ink-main">Physiologically Improbable Value</h4>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">{toastMsg}</p>
        </div>
        <button
          onClick={dismissToast}
          className="absolute top-4 right-4 text-ink-soft hover:text-ink-main transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* ── Main Column ───────────────────────────────────────────────────── */}
      <main className="flex-1 h-full flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-[800px] mt-8 flex flex-col gap-8 pb-12">

          {/* Header */}
          <div ref={headerRef} className="flex flex-col items-center gap-2" style={{ opacity: 0 }}>
            <div className="flex items-center gap-2 text-ink-muted mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              <span className="font-serif text-lg font-medium tracking-tight text-ink-main">VitalSense</span>
            </div>
            <h1 className="font-serif text-4xl text-ink-main tracking-tight">Record Vitals</h1>
            <p className="text-sm text-ink-muted">Enter patient metrics using your preferred method.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-1 flex items-center gap-1 text-xs text-ink-soft hover:text-ink-muted transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to dashboard
            </button>
          </div>

          {/* Tab Bar */}
          <div
            ref={tabBarRef}
            className="bg-cream p-1.5 rounded-xl border border-black/5 shadow-inner-soft flex w-full max-w-2xl mx-auto"
            style={{ opacity: 0 }}
          >
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 relative z-10 ${
                  activeTab === tab.id
                    ? 'bg-paper shadow-sm text-ink-main'
                    : 'text-ink-muted hover:text-ink-main hover:bg-black/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Demo Profiles */}
          <div ref={presetsRef} className="flex justify-center items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft py-2 mr-2" style={{ opacity: 0 }}>
              Demo Profiles:
            </span>
            {(
              [
                { key: 'healthy'     as ProfileKey, label: 'Healthy 25M',       dot: 'bg-sage-dark'  },
                { key: 'prediabetic' as ProfileKey, label: 'Pre-diabetic 45F',  dot: 'bg-amber-dark' },
                { key: 'cardiac'     as ProfileKey, label: 'Post-cardiac 67M',  dot: 'bg-rose-dark'  },
              ] as const
            ).map(p => (
              <button
                key={p.key}
                onClick={e => loadPreset(p.key, e.currentTarget)}
                className="px-4 py-2 bg-paper border border-black/5 rounded-full text-xs font-medium text-ink-muted hover:text-ink-main hover:border-black/10 hover:shadow-sm transition-all flex items-center gap-2"
                style={{ opacity: 0 }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                {p.label}
              </button>
            ))}
          </div>

          {/* Panel Wrapper */}
          <div
            ref={panelWrapRef}
            className="w-full bg-cream rounded-2xl shadow-soft border border-black/5 p-8 relative min-h-[460px]"
            style={{ opacity: 0 }}
          >
            <div ref={tabPanelRef} className="w-full h-full">

              {/* ══ MANUAL TAB ══════════════════════════════════════════════ */}
              {activeTab === 'manual' && (
                <div className="flex flex-col w-full h-full justify-between">
                  <div ref={cardsGridRef} className="grid grid-cols-2 gap-5 mb-8">
                    {VITAL_CARDS.map(card => (
                      <div
                        key={card.id}
                        className={`vital-card bg-paper rounded-xl p-5 shadow-card border border-black/5 ${card.focusRing} transition-all`}
                      >
                        <div className="flex items-start mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center ${card.iconColor}`}>
                              {card.icon}
                            </div>
                            <label htmlFor={`input-${card.id}`} className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                              {card.label}
                            </label>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <input
                            type={card.type}
                            id={`input-${card.id}`}
                            value={values[card.id]}
                            step={card.step}
                            onChange={e => {
                              setValues(v => ({ ...v, [card.id]: e.target.value }));
                              if (card.id === 'hr' || card.id === 'spo2') {
                                validateInput(card.id, e.target.value);
                              }
                              checkCriticalThreshold(card.id, e.target.value);
                            }}
                            className={`text-4xl font-medium text-ink-main bg-transparent outline-none ${card.inputWidth} placeholder:text-ink-soft/30 vital-input`}
                            placeholder={card.placeholder}
                          />
                          <span className="text-sm font-mono text-ink-muted">{card.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    ref={submitBtnRef}
                    onMouseEnter={() => onSubmitHover(true)}
                    onMouseLeave={() => onSubmitHover(false)}
                    onClick={() => {
                      if (!values.hr || !values.bp || !values.spo2) {
                        showToast('Please fill in at least Heart Rate, Blood Pressure, and SpO2 before submitting.');
                        return;
                      }
                      submitVitals(values as unknown as Record<string, string>);
                      if (submitBtnRef.current) {
                        gsap.to(submitBtnRef.current, { backgroundColor: '#63755A', duration: 0.2 });
                        submitBtnRef.current.innerHTML = '<span>Saved ✓</span>';
                        setTimeout(() => navigate('/predictions'), 1500);
                      }
                    }}
                    className="w-full bg-ink-main text-paper py-4 rounded-xl font-medium text-sm shadow-[0_4px_14px_rgba(44,41,38,0.2)] flex items-center justify-center gap-2 mt-auto"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Submit Vitals Record
                  </button>
                </div>
              )}

              {/* ══ VOICE TAB ═══════════════════════════════════════════════ */}
              {activeTab === 'voice' && (
                <div className="flex flex-col w-full items-center justify-between min-h-[380px]">
                  <div className="flex-1 flex flex-col items-center justify-center gap-12 w-full pt-4">

                    {/* Waveform bars */}
                    <div ref={waveRef} className="flex items-end justify-center gap-1.5 h-16 w-full">
                      {WAVE_HEIGHTS.map((h, i) => (
                        <div
                          key={i}
                          className={`wave-bar w-1.5 rounded-full ${WAVE_COLORS[i]}`}
                          style={{ height: h, transformOrigin: 'bottom' }}
                        />
                      ))}
                    </div>

                    {/* Mic button */}
                    <button
                      aria-label={voiceActive ? 'Stop recording' : 'Start recording'}
                      onClick={() => setVoiceActive(v => !v)}
                      className="relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-dark/40 rounded-full"
                    >
                      <div
                        className={`absolute inset-0 bg-rose-light rounded-full transition-opacity duration-300 ${
                          voiceActive ? 'animate-ping opacity-60' : 'opacity-0'
                        }`}
                      />
                      <div
                        className={`relative w-24 h-24 border rounded-full shadow-float flex items-center justify-center text-rose-dark transition-all ${
                          voiceActive
                            ? 'bg-rose-light/40 border-rose-dark/30 scale-110'
                            : 'bg-paper border-rose-dark/20 group-hover:bg-rose-light/20'
                        }`}
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                          <line x1="12" x2="12" y1="19" y2="22"/>
                        </svg>
                      </div>
                    </button>

                    {/* Transcript box */}
                    <div className="w-full max-w-md bg-paper border border-black/5 shadow-inner-soft rounded-xl p-6 text-center">
                      <p className="font-mono text-sm text-ink-muted leading-relaxed">
                        <span className="text-ink-main">"Patient resting heart rate is 72,</span> blood pressure 120 over 80..."
                      </p>
                    </div>
                  </div>

                  <button className="w-full bg-ink-main text-paper py-4 rounded-xl font-medium text-sm shadow-[0_4px_14px_rgba(44,41,38,0.2)] hover:bg-ink-main/90 transition-all flex items-center justify-center gap-2 mt-8">
                    Process Recording
                  </button>
                </div>
              )}

              {/* ══ CSV TAB ══════════════════════════════════════════════════ */}
              {activeTab === 'csv' && (
                <div className="flex flex-col w-full min-h-[380px]">
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={e => { if (e.target.files?.[0]) setCsvFileName(e.target.files[0].name); }}
                  />
                  <div className="flex-1 flex items-center justify-center w-full">
                    <div
                      onClick={() => csvInputRef.current?.click()}
                      className="w-full min-h-[340px] border-2 border-dashed border-ink-soft/30 rounded-2xl bg-paper/50 flex flex-col items-center justify-center gap-4 hover:bg-paper hover:border-ink-soft/60 transition-all cursor-pointer group"
                    >
                      <div className="w-16 h-16 rounded-full bg-ivory flex items-center justify-center text-ink-muted group-hover:scale-110 transition-transform shadow-sm">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="12" y1="18" x2="12" y2="12"/>
                          <line x1="9" y1="15" x2="15" y2="15"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium text-ink-main text-lg mb-1">Upload CSV Data</h3>
                        {csvFileName
                          ? <p className="text-sm text-sage-dark font-medium">{csvFileName}</p>
                          : <p className="text-sm text-ink-muted">Drag &amp; drop your file here, or click to browse</p>
                        }
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft mt-2 bg-ivory px-2 py-1 rounded">
                        Supported format: .csv
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ PDF TAB ══════════════════════════════════════════════════ */}
              {activeTab === 'pdf' && (
                <div className="flex flex-col w-full min-h-[380px]">
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={e => { if (e.target.files?.[0]) setPdfFileName(e.target.files[0].name); }}
                  />
                  <div className="flex-1 flex items-center justify-center w-full">
                    <div
                      onClick={() => pdfInputRef.current?.click()}
                      className="w-full min-h-[340px] border-2 border-dashed border-lavender-dark/30 rounded-2xl bg-paper/50 flex flex-col items-center justify-center gap-4 relative overflow-hidden cursor-pointer"
                    >

                      {/* Scanning glow beam */}
                      <div
                        ref={scanGlowRef}
                        className="absolute left-0 right-0 h-28 bg-gradient-to-b from-transparent via-lavender-light/50 to-lavender-main/20 pointer-events-none"
                        style={{ top: '-5%' }}
                      />
                      {/* Scanning hair line */}
                      <div
                        ref={scanLineRef}
                        className="absolute left-0 right-0 h-px bg-lavender-dark/50 pointer-events-none"
                        style={{ top: '-5%', boxShadow: '0 0 8px rgba(106,96,138,0.6)' }}
                      />

                      <div className="w-16 h-16 rounded-xl bg-lavender-light/50 flex items-center justify-center text-lavender-dark shadow-sm relative z-10">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10 9 9 9 8 9"/>
                        </svg>
                      </div>
                      <div className="text-center relative z-10">
                        <h3 className="font-medium text-ink-main text-lg mb-1">Scan PDF Report</h3>
                        {pdfFileName
                          ? <p className="text-sm text-lavender-dark font-medium">{pdfFileName}</p>
                          : <p className="text-sm text-ink-muted">VitalSense OCR will extract metrics automatically</p>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        ref={sidebarRef}
        className="w-[360px] h-full flex flex-col bg-paper rounded-2xl shadow-soft border border-black/5 overflow-hidden shrink-0"
        style={{ opacity: 0 }}
      >
        <div className="p-6 border-b border-black/5 bg-cream/30">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">Recent Entries</h2>
        </div>

        <div ref={entriesRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">

          <div className="p-4 rounded-xl border border-black/5 border-l-2 border-l-sage-dark/40 bg-ivory hover:bg-cream hover:border-black/10 transition-all cursor-pointer" style={{ opacity: 0 }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-[10px] text-ink-muted">TODAY, 09:45 AM</span>
              <span className="w-2 h-2 rounded-full bg-sage-main" />
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-[11px] font-mono uppercase text-ink-muted mb-0.5">HR</div>
                <div className="font-medium text-ink-main">68 <span className="text-[10px] text-ink-muted font-normal">bpm</span></div>
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-ink-muted mb-0.5">BP</div>
                <div className="font-medium text-ink-main">118/75</div>
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-ink-muted mb-0.5">SpO2</div>
                <div className="font-medium text-ink-main">99%</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-black/5 border-l-2 border-l-lavender-dark/40 bg-ivory hover:bg-cream hover:border-black/10 transition-all cursor-pointer" style={{ opacity: 0 }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-[10px] text-ink-muted">YESTERDAY, 14:20 PM</span>
              <span className="w-2 h-2 rounded-full bg-lavender-main" />
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-[11px] font-mono uppercase text-ink-muted mb-0.5">HR</div>
                <div className="font-medium text-ink-main">82 <span className="text-[10px] text-ink-muted font-normal">bpm</span></div>
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-ink-muted mb-0.5">BP</div>
                <div className="font-medium text-lavender-dark">135/88</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-black/5 border-l-2 border-l-sage-dark/40 bg-ivory hover:bg-cream hover:border-black/10 transition-all cursor-pointer" style={{ opacity: 0.7 }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-[10px] text-ink-muted">OCT 22, 08:15 AM</span>
              <span className="w-2 h-2 rounded-full bg-sage-main" />
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-[11px] font-mono uppercase text-ink-muted mb-0.5">HR</div>
                <div className="font-medium text-ink-main">70 <span className="text-[10px] text-ink-muted font-normal">bpm</span></div>
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-ink-muted mb-0.5">BP</div>
                <div className="font-medium text-ink-main">120/80</div>
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-ink-muted mb-0.5">SpO2</div>
                <div className="font-medium text-ink-main">98%</div>
              </div>
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-black/5 bg-cream/30">
          <button className="w-full py-2 text-xs font-medium text-ink-muted hover:text-ink-main flex items-center justify-center gap-1 transition">
            View Full Patient Record
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </aside>

    </motion.div>

    {/* ── Critical Alert Modal ──────────────────────────────────────────── */}
    {showAlert && alertData && (
      <CriticalAlertModal
        data={alertData}
        onDismiss={() => setShowAlert(false)}
      />
    )}
    </>
  );
}
