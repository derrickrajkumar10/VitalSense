import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from '../../lib/gsap';
import { hotspots, tabs } from '../../data/dashboardData';
import LiveECG from './LiveECG';

interface BodyMapProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeHotspot: string;
  onHotspotChange: (id: string) => void;
}

const hotspotColors = {
  normal: { fill: '#D2DECB', border: '#63755A', glow: 'rgba(99,117,90,0.4)' },
  active: { fill: '#E2DFEC', border: '#6A608A', glow: 'rgba(106,96,138,0.5)' },
  warning: { fill: '#E8D5D5', border: '#8A4B4B', glow: 'rgba(138,75,75,0.4)' },
};

// Body silhouette SVG path (simplified human figure)
const BODY_PATH = `
  M 120,18
  C 120,10 112,5 105,5
  C 98,5 90,10 90,18
  C 90,26 94,32 100,35
  L 100,38
  C 96,38 80,40 76,50
  C 72,58 72,68 73,78
  L 78,110
  C 78,112 76,114 74,114
  L 68,114
  C 64,114 62,116 62,120
  L 62,160
  C 62,163 64,165 67,165
  C 70,165 72,163 72,160
  L 72,130
  L 76,130
  L 80,180
  L 78,220
  C 78,223 80,225 83,225
  C 86,225 88,223 88,220
  L 90,185
  L 92,220
  C 92,223 94,225 97,225
  C 100,225 102,223 102,220
  L 100,180
  L 104,130
  L 108,130
  L 108,160
  C 108,163 110,165 113,165
  C 116,165 118,163 118,160
  L 118,120
  C 118,116 116,114 112,114
  L 106,114
  C 104,114 102,112 102,110
  L 107,78
  C 108,68 108,58 104,50
  C 100,40 84,38 80,38
  L 80,35
  C 86,32 90,26 90,18
`;

export default function BodyMap({ activeTab, onTabChange, activeHotspot, onHotspotChange }: BodyMapProps) {
  const bodyPathRef = useRef<SVGPathElement>(null);
  const connectorRef = useRef<SVGLineElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hotspotRefs = useRef<(SVGGElement | null)[]>([]);
  const heartPulseRef = useRef<HTMLDivElement>(null);
  const heartPulse2Ref = useRef<HTMLDivElement>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  // SVG dimensions
  const SVG_W = 210;
  const SVG_H = 240;

  useEffect(() => {
    // Draw body SVG path
    const path = bodyPathRef.current;
    if (path) {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2.2,
        delay: 0.4,
        ease: 'power2.inOut',
      });
    }

    // Stagger hotspot scale-in
    hotspotRefs.current.forEach((ref, i) => {
      if (!ref) return;
      gsap.fromTo(
        ref,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          delay: 1.2 + i * 0.15,
          ease: 'back.out(1.8)',
          transformOrigin: 'center center',
        }
      );
    });

    // Heartbeat pulse animation on active (heart) hotspot — 72bpm = 0.83s
    const heartPulse = heartPulseRef.current;
    const heartPulse2 = heartPulse2Ref.current;

    if (heartPulse && heartPulse2) {
      const beatTl = gsap.timeline({ repeat: -1 });
      beatTl
        .set([heartPulse, heartPulse2], { scale: 1, opacity: 0.7 })
        .to(heartPulse, { scale: 2.8, opacity: 0, duration: 0.6, ease: 'power2.out' }, 0)
        .to(heartPulse2, { scale: 2.2, opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.15)
        .set([heartPulse, heartPulse2], { scale: 1, opacity: 0.7 }, 0.83)
        .to(heartPulse, { scale: 2.8, opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.83)
        .to(heartPulse2, { scale: 2.2, opacity: 0, duration: 0.5, ease: 'power2.out' }, 0.98)
        .to({}, { duration: 0.83 * 0.4 }); // rest gap to complete 0.83s cycle total feel
    }

    // Animate connector line (draw from hotspot to right)
    if (connectorRef.current) {
      gsap.fromTo(
        connectorRef.current,
        { strokeDashoffset: 120 },
        { strokeDashoffset: 0, duration: 0.9, delay: 1.8, ease: 'power2.out' }
      );
      // Pulse the connector opacity
      gsap.to(connectorRef.current, {
        opacity: 0.4,
        duration: 1.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 2.7,
      });
    }

    return () => {
      gsap.killTweensOf([heartPulse, heartPulse2, connectorRef.current, bodyPathRef.current]);
    };
  }, []);

  // Scale in viewport coords for each hotspot
  const getHotspotPosition = (hx: number, hy: number) => ({
    x: (hx / 100) * SVG_W,
    y: (hy / 100) * SVG_H,
  });

  const heartHotspot = hotspots.find((h) => h.id === 'heart')!;
  const heartPos = getHotspotPosition(heartHotspot.x, heartHotspot.y);

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      {/* Tab navigation */}
      <div className="flex items-center gap-1 mb-4 bg-cream rounded-xl p-1 border border-sand-light/50">
        {tabs.map((tab) => (
          <motion.button
            key={tab}
            onClick={() => onTabChange(tab)}
            className="relative flex-1 text-[11px] font-semibold py-2 px-1 rounded-lg text-center transition-colors duration-200 z-10"
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

      {/* Body map area */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            backgroundImage: `
              linear-gradient(rgba(106,96,138,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(106,96,138,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />

        {/* ECG strip — bottom of body map area */}
        <div className="absolute bottom-12 left-4 right-4 opacity-60">
          <div className="text-[9px] text-lavender-dark font-mono mb-1 tracking-wider">LEAD II — CONTINUOUS</div>
          <LiveECG color="#6A608A" height={44} />
        </div>

        {/* SVG body + hotspots */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="relative z-10"
          style={{ height: '78%', maxHeight: 380, width: 'auto' }}
        >
          {/* Body silhouette */}
          <path
            ref={bodyPathRef}
            d={BODY_PATH}
            fill="rgba(235,233,240,0.18)"
            stroke="#6A608A"
            strokeWidth="1.2"
            strokeOpacity="0.35"
            strokeDasharray="0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Connector line from heart hotspot to right edge */}
          <line
            ref={connectorRef}
            x1={heartPos.x + 8}
            y1={heartPos.y}
            x2={SVG_W - 4}
            y2={heartPos.y}
            stroke="#6A608A"
            strokeWidth="1.2"
            strokeDasharray="120"
            strokeDashoffset="0"
            opacity="0.7"
            strokeLinecap="round"
          />
          {/* Small arrow cap */}
          <path
            d={`M ${SVG_W - 10} ${heartPos.y - 4} L ${SVG_W - 4} ${heartPos.y} L ${SVG_W - 10} ${heartPos.y + 4}`}
            fill="none"
            stroke="#6A608A"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />

          {/* Hotspots */}
          {hotspots.map((hotspot, i) => {
            const pos = getHotspotPosition(hotspot.x, hotspot.y);
            const colors = hotspotColors[hotspot.status];
            const isActive = hotspot.id === activeHotspot;
            const isHovered = hoveredHotspot === hotspot.id;
            const size = hotspot.status === 'active' ? 9 : 7;

            return (
              <g
                key={hotspot.id}
                ref={(el) => { hotspotRefs.current[i] = el; }}
                transform={`translate(${pos.x}, ${pos.y})`}
                style={{ cursor: 'pointer', transformOrigin: `${pos.x}px ${pos.y}px` }}
                onClick={() => onHotspotChange(hotspot.id)}
                onMouseEnter={() => setHoveredHotspot(hotspot.id)}
                onMouseLeave={() => setHoveredHotspot(null)}
              >
                {/* Outer glow ring */}
                <circle
                  r={size + 6}
                  fill={colors.glow}
                  opacity={isActive || isHovered ? 0.35 : 0.12}
                  style={{ transition: 'opacity 0.3s, r 0.3s' }}
                />
                {/* Main dot */}
                <circle
                  r={isHovered ? size + 2 : size}
                  fill={colors.fill}
                  stroke={colors.border}
                  strokeWidth="1.5"
                  style={{ transition: 'r 0.25s cubic-bezier(0.22,1,0.36,1)' }}
                />
                {/* Active indicator */}
                {hotspot.status === 'active' && (
                  <circle r={3} fill={colors.border} opacity="0.9" />
                )}

                {/* Tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <foreignObject
                      x={hotspot.id === 'heart' || hotspot.id === 'abdomen' ? -90 : -40}
                      y={-46}
                      width="120"
                      height="40"
                      style={{ overflow: 'visible', pointerEvents: 'none' }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.92 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-ink-main text-paper text-[10px] font-medium rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-float"
                        style={{ display: 'inline-block' }}
                      >
                        <div className="font-bold text-[11px]">{hotspot.label}</div>
                        <div className="text-paper/70">{hotspot.vitalSummary}</div>
                      </motion.div>
                    </foreignObject>
                  )}
                </AnimatePresence>
              </g>
            );
          })}
        </svg>

        {/* Heartbeat pulse rings — absolutely positioned over SVG */}
        {(() => {
          // Position relative to center SVG area
          // Heart is at ~55% x, 33% y of the SVG
          return (
            <div
              className="absolute pointer-events-none"
              style={{
                // Approximate overlay for heart hotspot
                left: '52%',
                top: '24%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                ref={heartPulseRef}
                className="absolute w-5 h-5 rounded-full border-2 border-lavender-dark"
                style={{ top: '-10px', left: '-10px', transformOrigin: 'center', opacity: 0.7 }}
              />
              <div
                ref={heartPulse2Ref}
                className="absolute w-5 h-5 rounded-full border border-lavender-dark/60"
                style={{ top: '-10px', left: '-10px', transformOrigin: 'center', opacity: 0.5 }}
              />
            </div>
          );
        })()}

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          {['+', '−'].map((sign) => (
            <motion.button
              key={sign}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              className="w-7 h-7 bg-paper border border-sand-light/60 rounded-lg text-ink-muted text-sm font-bold shadow-card flex items-center justify-center hover:bg-ivory transition-colors duration-150"
            >
              {sign}
            </motion.button>
          ))}
        </div>

        {/* Diagnosis label */}
        <div className="absolute top-2 right-3">
          <span className="text-[9px] font-bold text-lavender-dark bg-lavender-light border border-lavender-main px-2 py-0.5 rounded-full uppercase tracking-widest">
            Diagnosis
          </span>
        </div>
      </div>
    </div>
  );
}
