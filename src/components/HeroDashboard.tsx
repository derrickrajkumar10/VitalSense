import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

export default function HeroDashboard() {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [6, -2]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-500, 500], [-10, 2]), { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className="w-full max-w-[1100px] mx-auto"
      style={{ perspective: 2000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full aspect-[16/10] bg-cream rounded-2xl shadow-float border border-black/5 flex overflow-visible"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Sidebar */}
        <div className="w-64 bg-paper/50 border-r border-black/5 p-6 flex-col gap-6 hidden md:flex shrink-0 rounded-l-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-sand-light flex items-center justify-center text-ink-main font-serif font-medium text-sm">EV</div>
            <div>
              <div className="text-sm font-medium">Eleanor Vance</div>
              <div className="font-mono text-[10px] text-ink-muted">MRN: 849-291-B</div>
            </div>
          </div>
          <div className="h-8 bg-paper rounded-lg shadow-sm border border-black/5" />
          <div className="h-8 bg-black/5 rounded-lg opacity-50" />
          <div className="h-8 bg-black/5 rounded-lg opacity-50" />
          <div className="mt-auto h-32 bg-ivory rounded-xl border border-black/5 p-4">
            <div className="w-full h-2 bg-black/5 rounded-full mb-2" />
            <div className="w-2/3 h-2 bg-black/5 rounded-full" />
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 p-8 bg-cream/30 flex flex-col gap-6 rounded-r-2xl overflow-hidden">
          {/* Vital cards */}
          <div className="flex gap-6 h-32">
            {[
              { label: 'Heart Rate', value: '72', unit: 'bpm', accent: 'text-ink-main', hasECG: true },
              { label: 'Blood Pressure', value: '135/85', unit: '', accent: 'text-lavender-dark', hasECG: false },
              { label: 'SpO₂', value: '99', unit: '%', accent: 'text-ink-main', hasECG: false },
            ].map((vital, i) => (
              <motion.div
                key={vital.label}
                className="flex-1 bg-paper rounded-xl shadow-card border border-black/5 p-5 flex flex-col justify-between relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="font-mono text-[10px] uppercase text-ink-muted">{vital.label}</div>
                <div className={`text-3xl font-serif ${vital.accent}`}>
                  {vital.value}
                  {vital.unit && <span className="text-xs font-sans text-ink-muted ml-1">{vital.unit}</span>}
                </div>
                {vital.hasECG && (
                  <svg className="absolute bottom-0 left-0 right-0 w-full h-12 opacity-30" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0 15 Q 10 5, 20 15 T 40 15 T 60 15 T 80 15 T 100 15" fill="none" stroke="#63755A" strokeWidth="2" />
                  </svg>
                )}
              </motion.div>
            ))}
          </div>

          {/* Chart area */}
          <motion.div
            className="flex-1 bg-paper rounded-xl shadow-card border border-black/5 p-6 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="h-4 w-32 bg-black/10 rounded" />
              <div className="h-6 w-24 bg-ivory border border-black/5 rounded-md" />
            </div>
            <div className="flex-1 border-b border-l border-black/5 relative">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <motion.path
                  d="M0 80 C 20 70, 40 90, 60 50 S 80 30, 100 40"
                  fill="none"
                  stroke="#DBCBB9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.2, duration: 1.5, ease: 'easeInOut' }}
                />
                <motion.path
                  d="M0 60 C 30 50, 50 60, 70 30 S 90 20, 100 25"
                  fill="none"
                  stroke="#6A608A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.4, duration: 1.5, ease: 'easeInOut' }}
                />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Floating AI alert */}
        <motion.div
          className="absolute -right-8 top-1/4 bg-paper p-5 rounded-2xl shadow-float border border-black/5 w-64 hidden lg:block"
          style={{ translateZ: 40 }}
          initial={{ opacity: 0, x: 40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-3 mb-3 border-b border-black/5 pb-3">
              <div className="w-8 h-8 rounded-full bg-rose-light/50 flex items-center justify-center text-rose-dark">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
              </div>
              <div>
                <div className="text-xs font-medium">Arrhythmia Risk</div>
                <div className="font-mono text-[9px] text-ink-muted">AI DETECTION</div>
              </div>
            </div>
            <div className="text-3xl font-serif text-rose-dark mb-1">78%</div>
            <div className="h-1.5 w-full bg-ivory rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-rose-dark"
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ delay: 2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Syncing badge */}
        <motion.div
          className="absolute left-48 bottom-12 bg-paper px-4 py-3 rounded-xl shadow-float border border-black/5 items-center gap-3 hidden lg:flex"
          style={{ translateZ: 50 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-sage-main"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-main">Syncing Live Vitals</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
