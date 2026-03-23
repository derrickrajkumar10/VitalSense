import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from '../../lib/gsap';
import { scans } from '../../data/dashboardData';
import LiveECG from './LiveECG';

interface RightPanelProps {
  activeHotspot: string;
}

const SEVERITY = 5;
const FILLED = 2;
const HALF = 3; // index of half dot (1-indexed)

// ECG thumbnail SVG waveform (mini)
function ECGThumbnail({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 36" className="w-full h-full" preserveAspectRatio="none">
      <rect width="80" height="36" fill={color} fillOpacity="0.08" rx="6" />
      <path
        d="M4,18 L14,18 L16,14 L18,18 L20,18 L21,10 L22,26 L23,18 L26,18 L28,12 L32,18 L44,18 L54,18 L56,14 L58,18 L60,18 L61,10 L62,26 L63,18 L66,18 L68,12 L72,18 L80,18"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

// ECHO thumbnail (simplified concentric arcs)
function ECHOThumbnail({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 80 36" className="w-full h-full" preserveAspectRatio="none">
      <rect width="80" height="36" fill={color} fillOpacity="0.08" rx="6" />
      {[8, 14, 20, 26].map((r, i) => (
        <path
          key={i}
          d={`M ${40 - r},18 Q 40,${18 - r * 0.8} ${40 + r},18`}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity={0.6 - i * 0.1}
        />
      ))}
      <circle cx="40" cy="18" r="3" fill={color} fillOpacity="0.4" />
      <circle cx="40" cy="18" r="1.5" fill={color} fillOpacity="0.8" />
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function RightPanel(_: RightPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const severityDotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Slide in from right
    gsap.fromTo(
      panelRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.75, delay: 0.3, ease: 'vitalize' }
    );

    // Animate severity dots in one by one
    severityDotsRef.current.forEach((dot, i) => {
      if (!dot) return;
      gsap.fromTo(
        dot,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          delay: 1.0 + i * 0.12,
          ease: 'back.out(2)',
        }
      );
    });
  }, []);

  return (
    <div
      ref={panelRef}
      className="flex flex-col gap-3 h-full overflow-y-auto overflow-x-hidden"
      style={{ width: 360, minWidth: 360 }}
    >
      {/* Focus area header */}
      <div className="bg-paper rounded-2xl p-4 border border-sand-light/60 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-bold bg-lavender-main text-lavender-dark border border-lavender-dark/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
            Focus Area
          </span>
          <span className="text-[9px] text-ink-soft ml-auto font-medium">Active</span>
          <div className="w-1.5 h-1.5 rounded-full bg-lavender-dark animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-ink-main leading-tight mb-2">
          Cardiovascular Anomalies
        </h2>
        <p className="text-[11px] text-ink-muted leading-relaxed">
          Patient presents with mild irregular cardiac rhythm detected during routine monitoring.
          ECG analysis reveals intermittent atrial ectopic activity — clinically non-urgent but
          warrants further evaluation and follow-up cardiology assessment.
        </p>
      </div>

      {/* Recent Scans */}
      <div className="bg-paper rounded-2xl p-4 border border-sand-light/60 shadow-card">
        <div className="text-[11px] font-bold text-ink-main uppercase tracking-widest mb-3">
          Recent Scans
        </div>
        <div className="grid grid-cols-2 gap-2">
          {scans.map((scan, i) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(44,41,38,0.1)' }}
              className="rounded-xl overflow-hidden border border-sand-light/50 cursor-pointer"
              style={{ height: 64 }}
            >
              {scan.id === 'ecg' ? (
                <ECGThumbnail color={scan.color} />
              ) : (
                <ECHOThumbnail color={scan.color} />
              )}
              <div
                className="px-2 py-1 flex items-center justify-between"
                style={{ backgroundColor: `${scan.color}10` }}
              >
                <span className="text-[10px] font-bold" style={{ color: scan.color }}>
                  {scan.label}
                </span>
                <span className="text-[9px] text-ink-soft">{scan.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Live ECG strip in right panel */}
      <div className="bg-paper rounded-2xl p-4 border border-lavender-main/60 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-lavender-dark animate-pulse" />
          <span className="text-[10px] font-bold text-lavender-dark uppercase tracking-widest">
            Live ECG Trace
          </span>
          <span className="ml-auto text-[9px] text-ink-soft font-mono">72 bpm</span>
        </div>
        <LiveECG color="#6A608A" height={52} />
      </div>

      {/* Doctor card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-paper rounded-2xl p-4 border border-sand-light/60 shadow-card"
      >
        <div className="text-[11px] font-bold text-ink-main uppercase tracking-widest mb-3">
          Attending Physician
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-light to-lavender-main flex items-center justify-center text-lavender-dark font-bold text-sm flex-shrink-0 border border-lavender-dark/20">
            AT
          </div>
          <div>
            <div className="font-bold text-ink-main text-sm">Dr. Aris Thorne</div>
            <div className="text-[10px] text-ink-muted">Cardiology & Longevity</div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: s <= 4 ? '#6A608A' : '#E2DFEC' }}
                />
              ))}
              <span className="text-[9px] text-ink-soft ml-1">4.9 rating</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Patient Complaint */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-paper rounded-2xl p-4 border border-sand-light/60 shadow-card"
      >
        <div className="text-[11px] font-bold text-ink-main uppercase tracking-widest mb-2">
          Patient Complaint
        </div>
        <blockquote className="border-l-3 border-lavender-dark pl-3 text-[11px] text-ink-muted leading-relaxed italic relative"
          style={{ borderLeftWidth: 3, paddingLeft: 12 }}>
          <span className="text-2xl text-lavender-main font-serif leading-none absolute -top-1 -left-1">"</span>
          <p className="ml-3">
            I've been feeling occasional fluttering in my chest, especially in the evenings.
            It doesn't hurt but it's uncomfortable and makes me anxious. Started about 3 weeks ago.
          </p>
        </blockquote>
      </motion.div>

      {/* Clinical Severity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-paper rounded-2xl p-4 border border-sand-light/60 shadow-card"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-bold text-ink-main uppercase tracking-widest">
            Clinical Severity
          </div>
          <span className="text-[10px] font-bold text-lavender-dark">Mild — 2/5</span>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: SEVERITY }).map((_, i) => {
            const isHalf = i + 1 === HALF;
            const isFilled = i + 1 <= FILLED;
            return (
              <div
                key={i}
                ref={(el) => { severityDotsRef.current[i] = el; }}
                className="relative flex-1 h-2.5 rounded-full overflow-hidden"
                style={{
                  backgroundColor: '#EBE9F0',
                  opacity: 0, // starts hidden, GSAP animates in
                }}
              >
                {isFilled && (
                  <div className="absolute inset-0 rounded-full bg-lavender-dark" />
                )}
                {isHalf && (
                  <div className="absolute inset-0 rounded-full" style={{ width: '50%', backgroundColor: '#6A608A' }} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] text-ink-soft">Minimal</span>
          <span className="text-[9px] text-ink-soft">Critical</span>
        </div>
      </motion.div>

    </div>
  );
}
