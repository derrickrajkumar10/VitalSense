import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { tabs } from '../../data/dashboardData';
import LiveECG from './LiveECG';

// Lazy-load the heavy Three.js canvas so it doesn't block initial render
const Body3DScene = lazy(() => import('./Body3DScene'));

interface BodyMapProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeHotspot: string;
  onHotspotChange: (id: string) => void;
  overlaySuppressed?: boolean;
}

export default function BodyMap({
  activeTab,
  onTabChange,
  activeHotspot,
  onHotspotChange,
  overlaySuppressed = false,
}: BodyMapProps) {
  return (
    <div className="flex flex-col h-full">
      {/* ── Tab navigation ── */}
      <div className="flex items-center gap-1 mb-4 bg-cream rounded-xl p-1 border border-sand-light/50 shrink-0">
        {tabs.map((tab) => (
          <motion.button
            key={tab}
            onClick={() => onTabChange(tab)}
            className="relative flex-1 text-[11px] font-semibold py-2 px-1 rounded-lg text-center transition-colors duration-200 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-main/30"
            style={{ color: activeTab === tab ? '#2C2926' : '#A69F95' }}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 bg-paper rounded-lg shadow-card border border-sand-light/60"
                style={{ zIndex: -1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {tab}
          </motion.button>
        ))}
      </div>

      {/* ── 3D body area ── */}
      <div className="flex-1 relative overflow-hidden rounded-2xl" style={{ minHeight: 0 }}>
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(106,96,138,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(106,96,138,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />

        {/* 3D Scene — fills remaining space */}
        <div className="absolute inset-0 bottom-20">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-lavender-dark/30 border-t-lavender-dark animate-spin" />
            </div>
          }>
            <Body3DScene
              activeHotspot={activeHotspot}
              onHotspotChange={onHotspotChange}
              overlaySuppressed={overlaySuppressed}
            />
          </Suspense>
        </div>

        {/* ECG strip — bottom */}
        <div className="absolute bottom-12 left-4 right-4 opacity-60 pointer-events-none">
          <div className="text-[9px] text-lavender-dark font-mono mb-1 tracking-wider">LEAD II — CONTINUOUS</div>
          <LiveECG color="#6A608A" height={44} />
        </div>

        {/* Drag-to-rotate hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A69F95" strokeWidth="2" strokeLinecap="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>
          <span className="text-[9px] font-mono text-ink-soft uppercase tracking-widest">Drag to rotate</span>
        </div>

        {/* Hotspot legend */}
        <div className="absolute top-2 left-3 flex flex-col gap-1.5 pointer-events-none">
          {[
            { color: '#63755A', label: 'Normal' },
            { color: '#6A608A', label: 'Active' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
              <span className="text-[8px] font-mono text-ink-soft uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        {/* Diagnosis badge */}
        <div className="absolute top-2 right-3">
          <span className="text-[9px] font-bold text-lavender-dark bg-lavender-light border border-lavender-main px-2 py-0.5 rounded-full uppercase tracking-widest">
            Diagnosis
          </span>
        </div>
      </div>
    </div>
  );
}
