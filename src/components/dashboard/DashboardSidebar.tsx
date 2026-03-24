import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from '../../lib/gsap';
import VitalCard from './VitalCard';
import CriticalAlertModal, { type AlertData } from '../CriticalAlertModal';
import {
  patient,
  vitals,
  appointments,
  bloodTests,
} from '../../data/dashboardData';
import { usePredictionStore } from '../../store/predictionStore';

const appointmentStatusConfig = {
  past: 'opacity-40',
  current: 'border-l-2 border-lavender-dark bg-lavender-light/50 pl-3',
  upcoming: 'opacity-80',
};

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const { result: predResult, lastVitals } = usePredictionStore();

  const trendMap = Object.fromEntries(
    (predResult?.trend ?? []).map((t) => [t.vital, t.direction])
  ) as Record<string, 'rising' | 'falling' | 'stable'>;

  const sidebarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const patientRef = useRef<HTMLDivElement>(null);
  const vitalsHeaderRef = useRef<HTMLDivElement>(null);
  const apptRef = useRef<HTMLDivElement>(null);
  const bloodRef = useRef<HTMLDivElement>(null);
  const emergencyRef = useRef<HTMLDivElement>(null);
  const liveDotRef = useRef<HTMLDivElement>(null);
  const lastVitalsRef = useRef(lastVitals);
  const [liveHr, setLiveHr] = useState(() => Math.round(lastVitals?.hr ?? 72));
  const [showEmergency, setShowEmergency] = useState(false);

  // Keep ref current so interval can read latest value without re-registering
  useEffect(() => { lastVitalsRef.current = lastVitals; }, [lastVitals]);

  useEffect(() => {
    // Stagger entrance animations
    const tl = gsap.timeline({ defaults: { ease: 'vitalize' } });

    tl.fromTo(
      sidebarRef.current,
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7 }
    )
      .fromTo(logoRef.current, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, '-=0.4')
      .fromTo(patientRef.current, { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55 }, '-=0.3')
      .fromTo(vitalsHeaderRef.current, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, '-=0.2')
      .fromTo(apptRef.current, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, '-=0.1')
      .fromTo(bloodRef.current, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, '-=0.1')
      .fromTo(emergencyRef.current, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, '-=0.05');

    // Live indicator dot pulse
    if (liveDotRef.current) {
      gsap.to(liveDotRef.current, {
        scale: 1.6,
        opacity: 0.4,
        duration: 0.7,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }

    // Emergency button subtle pulse
    const emergencyBtn = emergencyRef.current?.querySelector('.emergency-icon');
    if (emergencyBtn) {
      gsap.to(emergencyBtn, {
        scale: 1.15,
        duration: 0.9,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }

    // HR simulation: fluctuate ±2bpm around real value every 3s
    const hrInterval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 4;
      setLiveHr((prev) => {
        const base = lastVitalsRef.current?.hr ?? 72;
        return Math.round(Math.max(base - 4, Math.min(base + 4, prev + delta)));
      });
    }, 3000);

    return () => {
      tl.kill();
      clearInterval(hrInterval);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      className="flex flex-col gap-3 h-full overflow-y-auto overflow-x-hidden"
      style={{ width: 340, minWidth: 340 }}
    >
      {/* Logo */}
      <div ref={logoRef} className="flex items-center gap-2 px-1 pt-1">
        <div className="w-7 h-7 rounded-lg bg-lavender-dark flex items-center justify-center">
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none">
            <path
              d="M10 4C10 4 5 7 5 11.5C5 14 7.2 16 10 16C12.8 16 15 14 15 11.5C15 7 10 4 10 4Z"
              fill="white"
              fillOpacity="0.9"
            />
            <path d="M6 11H8.5L9.5 8.5L11 13L12 11H14" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-base font-bold text-ink-main tracking-tight">VitalSense</span>
        <span className="ml-auto text-[9px] font-medium text-ink-soft bg-sage-light px-2 py-0.5 rounded-full border border-sage-main">
          CLINICAL
        </span>
      </div>

      {/* Patient Card */}
      <div
        ref={patientRef}
        className="bg-paper rounded-2xl p-4 border border-sand-light/60 shadow-card"
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-lavender-main to-lavender-dark flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            EV
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-ink-main text-sm leading-tight">{patient.name}</div>
            <div className="text-[10px] text-ink-soft mt-0.5">MRN: {patient.mrn}</div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] bg-sand-light text-ink-muted px-2 py-0.5 rounded-full">Age {patient.age}</span>
              <span className="text-[10px] bg-sand-light text-ink-muted px-2 py-0.5 rounded-full">{patient.weight}</span>
              <span className="text-[10px] bg-sand-light text-ink-muted px-2 py-0.5 rounded-full">{patient.height}</span>
              <span className="text-[10px] bg-rose-light text-rose-dark px-2 py-0.5 rounded-full font-semibold border border-rose-main">
                {patient.blood}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Reports */}
      <motion.button
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/reports')}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-cream/80 border border-sand-light/70 text-ink-muted hover:text-ink-main hover:bg-sand-light/30 hover:border-sand-main/60 transition-all duration-200 group"
      >
        <span className="flex items-center gap-2.5 text-xs font-medium">
          <span className="w-6 h-6 rounded-lg bg-sand-light/60 border border-sand-main/30 flex items-center justify-center group-hover:bg-sand-light transition-colors">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </span>
          Clinical Reports
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </motion.button>

      {/* View Patient History */}
      <motion.button
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/history')}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-cream/80 border border-sand-light/70 text-ink-muted hover:text-ink-main hover:bg-sand-light/30 hover:border-sand-main/60 transition-all duration-200 group"
      >
        <span className="flex items-center gap-2.5 text-xs font-medium">
          <span className="w-6 h-6 rounded-lg bg-sand-light/60 border border-sand-main/30 flex items-center justify-center group-hover:bg-sand-light transition-colors">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </span>
          View Patient History
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </motion.button>

      {/* Current Vitals */}
      <div className="bg-paper rounded-2xl p-4 border border-sand-light/60 shadow-card">
        <div ref={vitalsHeaderRef} className="flex items-center gap-2 mb-3">
          <div
            ref={liveDotRef}
            className="w-2 h-2 rounded-full bg-sage-dark flex-shrink-0"
            style={{ transformOrigin: 'center' }}
          />
          <span className="text-[11px] font-bold text-ink-main uppercase tracking-widest">
            Current Vitals
          </span>
          <span className="ml-auto text-[9px] text-ink-soft font-medium">LIVE</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {vitals.map((vital, i) => {
            let liveVital = vital;
            if (vital.id === 'hr') {
              liveVital = { ...vital, value: liveHr, displayValue: String(liveHr), status: liveHr > 100 ? 'elevated' : liveHr < 60 ? 'elevated' : 'normal' };
            } else if (vital.id === 'bp' && lastVitals) {
              const sys = Math.round(lastVitals.bp_systolic), dia = Math.round(lastVitals.bp_diastolic);
              liveVital = { ...vital, value: sys, displayValue: `${sys}/${dia}`, status: sys >= 140 ? 'elevated' : 'normal' };
            } else if (vital.id === 'spo2' && lastVitals) {
              const v = Math.round(lastVitals.spo2);
              liveVital = { ...vital, value: v, displayValue: String(v), status: v < 95 ? 'critical' : 'normal' };
            } else if (vital.id === 'rr' && lastVitals) {
              const v = Math.round(lastVitals.rr);
              liveVital = { ...vital, value: v, displayValue: String(v), status: v > 20 || v < 12 ? 'elevated' : 'normal' };
            }
            return <VitalCard key={vital.id} vital={liveVital} index={i} trendDirection={trendMap[vital.id]} />;
          })}
        </div>
      </div>

      {/* Appointments */}
      <div ref={apptRef} className="bg-paper rounded-2xl p-4 border border-sand-light/60 shadow-card">
        <div className="text-[11px] font-bold text-ink-main uppercase tracking-widest mb-3">
          Today's Appointments
        </div>
        <div className="flex flex-col gap-1.5">
          {appointments.map((appt, i) => (
            <motion.div
              key={i}
              whileHover={appt.status !== 'past' ? { x: 2 } : {}}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 cursor-default ${appointmentStatusConfig[appt.status]} ${appt.status !== 'current' ? 'hover:bg-ivory' : ''}`}
            >
              <span className="text-[11px] font-mono font-bold text-ink-muted w-10 flex-shrink-0">
                {appt.time}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-ink-main truncate">{appt.doctor}</div>
                <div className="text-[10px] text-ink-soft truncate">{appt.specialty}</div>
              </div>
              {appt.status === 'current' && (
                <span className="text-[9px] bg-lavender-main text-lavender-dark px-1.5 py-0.5 rounded-full font-bold border border-lavender-dark/20 flex-shrink-0">
                  NOW
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Blood Tests */}
      <div ref={bloodRef} className="bg-paper rounded-2xl p-4 border border-sand-light/60 shadow-card">
        <div className="text-[11px] font-bold text-ink-main uppercase tracking-widest mb-3">
          Latest Blood Tests
        </div>
        <div className="grid grid-cols-2 gap-2">
          {bloodTests.map((test, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02, backgroundColor: '#FAF7F2' }}
              className="bg-ivory rounded-xl p-2.5 border border-sand-light/50 cursor-default transition-colors duration-200"
            >
              <div className="text-[11px] font-bold text-ink-main">{test.label}</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-bold text-ink-main font-mono">{test.value}</span>
                <span className="text-[9px] text-ink-soft">{test.unit}</span>
              </div>
              <div className="text-[9px] text-sage-dark font-medium mt-0.5">Normal</div>
            </motion.div>
          ))}
        </div>
      </div>


      {/* Emergency Button */}
      <div ref={emergencyRef} className="pb-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowEmergency(true)}
          className="w-full bg-rose-dark text-white rounded-2xl py-3.5 flex items-center justify-center gap-3 font-bold text-sm shadow-[0_4px_20px_rgba(138,75,75,0.4)] hover:shadow-[0_6px_28px_rgba(138,75,75,0.5)] transition-shadow duration-300"
        >
          <span className="emergency-icon text-xl leading-none" style={{ transformOrigin: 'center' }}>
            ⚠
          </span>
          <span className="tracking-wide">Emergency Alert</span>
        </motion.button>
      </div>

      {showEmergency && (
        <CriticalAlertModal
          data={{
            condition: 'Emergency Alert Triggered',
            chipText: 'Manual Alert — Clinician Activated',
            thresholdText: 'Immediate Review Required',
            description: 'A manual emergency alert has been triggered by the attending clinician. Immediate review of all patient vitals and on-call physician notification is required.',
          } as AlertData}
          onDismiss={() => setShowEmergency(false)}
        />
      )}
    </div>
  );
}
