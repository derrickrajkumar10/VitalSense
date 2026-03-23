import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { pageVariants } from '../lib/animations';
import { gsap } from '../lib/gsap';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import BodyMap from '../components/dashboard/BodyMap';
import RightPanel from '../components/dashboard/RightPanel';
import QuickEntryModal from '../components/dashboard/QuickEntryModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab,      setActiveTab]      = useState('Diagnosis');
  const [activeHotspot,  setActiveHotspot]  = useState('heart');
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);

  const dockWrapRef  = useRef<HTMLDivElement>(null);
  const dockRef      = useRef<HTMLDivElement>(null);
  const itemRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const filamentRef  = useRef<SVGPathElement>(null);
  const travelDotRef = useRef<SVGCircleElement>(null);
  const btnRef       = useRef<HTMLButtonElement>(null);

  // ── Entrance + idle + filament ────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Dock entrance
      gsap.fromTo(dockWrapRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0,  scale: 1, duration: 0.75, delay: 0.85, ease: 'vitalize' }
      );

      // Nodes stagger
      gsap.fromTo(itemRefs.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.1, delay: 1.1, ease: 'vitalize' }
      );

      // Idle float
      gsap.to(dockWrapRef.current, {
        y: -3, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6,
      });

      // Filament draw
      const path = filamentRef.current;
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: `0 ${len}` });
        gsap.to(path, { strokeDasharray: `${len} 0`, duration: 1.0, delay: 1.25, ease: 'vitalize-soft' });

        // Traveling dot
        const dot = travelDotRef.current;
        if (dot) {
          gsap.set(dot, { opacity: 0 });
          gsap.to(dot, { opacity: 1, duration: 0.3, delay: 2.35 });
          const proxy = { t: 0 };
          gsap.to(proxy, {
            t: 1, duration: 3.2, ease: 'none', repeat: -1, delay: 2.35,
            onUpdate() {
              const pt = path.getPointAtLength(proxy.t * len);
              gsap.set(dot, { attr: { cx: pt.x, cy: pt.y } });
            },
          });
        }
      }
    });
    return () => ctx.revert();
  }, []);

  // ── Y-lift hover (no scale — looks cleaner on stacked items) ─────────────────
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const onMove = (e: MouseEvent) => {
      const dr = dock.getBoundingClientRect();
      const mx = e.clientX - dr.left;

      itemRefs.current.forEach(item => {
        if (!item) return;
        const ir   = item.getBoundingClientRect();
        const cx   = ir.left + ir.width / 2 - dr.left;
        const dist = Math.abs(mx - cx);
        // Gaussian lift: max 8px at cursor, fades over 80px
        const lift = 8 * Math.exp(-(dist * dist) / (2 * 65 * 65));
        gsap.to(item, { y: -lift, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });

        // Sharpen label on hover-proximity
        const lbl = item.querySelector('.node-label') as HTMLElement;
        if (lbl) gsap.to(lbl, { opacity: dist < 70 ? 1 : 0.7, duration: 0.2, overwrite: 'auto' });
      });
    };

    const onLeave = () => {
      itemRefs.current.forEach(item => {
        if (!item) return;
        gsap.to(item, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' });
        const lbl = item.querySelector('.node-label') as HTMLElement;
        if (lbl) gsap.to(lbl, { opacity: 0.7, duration: 0.3, overwrite: 'auto' });
      });
    };

    dock.addEventListener('mousemove', onMove);
    dock.addEventListener('mouseleave', onLeave);
    return () => {
      dock.removeEventListener('mousemove', onMove);
      dock.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // ── ⌘K shortcut ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickEntryOpen(v => !v);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const handleOpen = () => {
    if (!btnRef.current) { setQuickEntryOpen(true); return; }
    gsap.to(btnRef.current, {
      scale: 0.94, duration: 0.1, ease: 'vitalize-sharp',
      onComplete: () => {
        gsap.to(btnRef.current, { scale: 1, duration: 0.35, ease: 'vitalize' });
        setQuickEntryOpen(true);
      },
    });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="w-screen h-screen overflow-hidden flex flex-row gap-4 p-4 bg-ivory"
      style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}
    >
      <DashboardSidebar />

      <div className="flex-1 bg-paper rounded-2xl border border-sand-light/60 shadow-card p-5 overflow-hidden flex flex-col">
        <BodyMap
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeHotspot={activeHotspot}
          onHotspotChange={setActiveHotspot}
        />
      </div>

      <RightPanel activeHotspot={activeHotspot} />

      {/* ══ NEURAL COMMAND DOCK ════════════════════════════════════════════ */}
      <div
        ref={dockWrapRef}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center"
        style={{ opacity: 0 }}
      >
        {/* SVG filament — arcs above the dock (4 nodes) */}
        <svg
          viewBox="0 0 440 28"
          className="w-[440px] h-7 pointer-events-none"
          overflow="visible"
        >
          <defs>
            <linearGradient id="fil-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#63755A" stopOpacity="0.35"/>
              <stop offset="33%"  stopColor="#A69F95" stopOpacity="0.3"/>
              <stop offset="66%"  stopColor="#A69F95" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#6A608A" stopOpacity="0.35"/>
            </linearGradient>
            <filter id="dot-blur" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="1.8" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <circle cx="52"  cy="26" r="2" fill="#63755A" opacity="0.35"/>
          <circle cx="165" cy="26" r="2" fill="#A69F95" opacity="0.3"/>
          <circle cx="278" cy="26" r="2" fill="#A69F95" opacity="0.3"/>
          <circle cx="391" cy="26" r="2" fill="#6A608A" opacity="0.35"/>
          <path
            ref={filamentRef}
            d="M 52 26 C 66 5, 151 5, 165 26 C 179 5, 264 5, 278 26 C 292 5, 377 5, 391 26"
            fill="none"
            stroke="url(#fil-grad)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle
            ref={travelDotRef}
            cx="52" cy="26" r="2.5"
            fill="#A69F95"
            opacity="0"
            filter="url(#dot-blur)"
          />
        </svg>

        {/* Dock — paper card, matches the design system */}
        <div
          ref={dockRef}
          className="relative flex items-stretch bg-paper rounded-2xl border border-sand-light/70"
          style={{
            boxShadow: '0 8px 32px rgba(44,41,38,0.09), 0 2px 8px rgba(44,41,38,0.05), 0 0 0 1px rgba(235,229,216,0.5)',
          }}
        >
          {/* ── NODE 0: AI Insights ── */}
          <div
            ref={el => { itemRefs.current[0] = el; }}
            className="flex flex-col items-center gap-1.5 px-7 py-3.5 cursor-pointer rounded-l-2xl hover:bg-ivory transition-colors duration-200"
            style={{ opacity: 0 }}
            onClick={() => navigate('/insights')}
          >
            <div className="node-chip w-8 h-8 rounded-[10px] bg-sage-light border border-sage-main/60 flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-sage-dark">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <span className="node-label font-medium text-[10.5px] tracking-wide text-ink-muted whitespace-nowrap">
              AI Insights
            </span>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch my-3 shrink-0 bg-sand-light/80" />

          {/* ── NODE 1: New Entry ── */}
          <div
            ref={el => { itemRefs.current[1] = el; }}
            className="flex flex-col items-center gap-1.5 px-7 py-3.5 cursor-pointer hover:bg-ivory transition-colors duration-200"
            style={{ opacity: 0 }}
          >
            <div className="node-chip flex items-center">
              <div className="w-7 h-7 rounded-[8px] bg-sage-light border border-sage-main/50 flex items-center justify-center z-10">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-sage-dark">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div className="w-7 h-7 rounded-[8px] bg-lavender-light border border-lavender-main/50 flex items-center justify-center -ml-2">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-lavender-dark">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
            </div>
            <button
              ref={btnRef}
              onClick={handleOpen}
              className="node-label flex items-center gap-1.5 outline-none"
            >
              <span className="font-semibold text-[10.5px] tracking-[-0.01em] text-ink-main whitespace-nowrap">
                New Entry
              </span>
              <kbd className="font-mono text-[8.5px] text-ink-soft bg-sand-light/60 border border-sand-main/40 rounded-[3px] px-1.5 py-[3px] leading-none select-none">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch my-3 shrink-0 bg-sand-light/80" />

          {/* ── NODE 2: Predictions ── */}
          <div
            ref={el => { itemRefs.current[2] = el; }}
            className="flex flex-col items-center gap-1.5 px-7 py-3.5 cursor-pointer hover:bg-ivory transition-colors duration-200"
            style={{ opacity: 0 }}
            onClick={() => navigate('/predictions')}
          >
            <div className="node-chip w-8 h-8 rounded-[10px] bg-lavender-light border border-lavender-main/60 flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-lavender-dark">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
              </svg>
            </div>
            <span className="node-label font-medium text-[10.5px] tracking-wide text-ink-muted whitespace-nowrap">
              Predictions
            </span>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch my-3 shrink-0 bg-sand-light/80" />

          {/* ── NODE 3: Clinical Chat ── */}
          <div
            ref={el => { itemRefs.current[3] = el; }}
            className="flex flex-col items-center gap-1.5 px-7 py-3.5 cursor-pointer rounded-r-2xl hover:bg-ivory transition-colors duration-200"
            style={{ opacity: 0 }}
            onClick={() => navigate('/chat')}
          >
            <div className="node-chip w-8 h-8 rounded-[10px] bg-sand-light border border-sand-main/60 flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-sand-dark">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span className="node-label font-medium text-[10.5px] tracking-wide text-ink-muted whitespace-nowrap">
              Copilot
            </span>
          </div>
        </div>

        {/* Soft ambient shadow beneath */}
        <div
          className="mt-1 w-[280px] h-2 rounded-full blur-lg pointer-events-none opacity-40"
          style={{ background: 'linear-gradient(90deg, #D2DECB 0%, #EBE5D8 50%, #E2DFEC 100%)' }}
        />
      </div>

      <QuickEntryModal isOpen={quickEntryOpen} onClose={() => setQuickEntryOpen(false)} />
    </motion.div>
  );
}
