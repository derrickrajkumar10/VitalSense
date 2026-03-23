import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroDashboard from './HeroDashboard';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export default function HeroSection() {
  return (
    <section className="pt-48 pb-32 px-8 relative overflow-visible flex flex-col items-center">
      {/* Ambient blobs */}
      <motion.div
        className="absolute top-20 left-[10%] w-96 h-96 bg-sand-light/40 rounded-full blur-3xl -z-10 mix-blend-multiply"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-40 right-[10%] w-[500px] h-[500px] bg-lavender-light/30 rounded-full blur-3xl -z-10 mix-blend-multiply"
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Hero text */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-[800px] mx-auto text-center mb-20"
      >
        <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper border border-black/5 shadow-sm mb-6">
          <motion.span
            className="w-2 h-2 rounded-full bg-sage-main"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">VitalSense OS 2.0 Now Available</span>
        </motion.div>

        <motion.h1 variants={item} className="font-serif text-6xl md:text-7xl text-ink-main tracking-tight leading-[1.1] mb-6">
          Clinical intelligence,<br />beautifully refined.
        </motion.h1>

        <motion.p variants={item} className="text-lg text-ink-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Empower your practice with continuous telemetry, predictive AI, and seamless patient records in one serene, focused platform.
        </motion.p>

        <motion.div variants={item} className="flex items-center justify-center gap-4">
          <motion.div
            whileHover={{ scale: 1.03, y: -2, boxShadow: '0 8px 24px rgba(44,41,38,0.2)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Link
              to="/login"
              className="px-8 py-3.5 bg-ink-main text-paper rounded-xl text-[15px] font-medium transition shadow-[0_4px_14px_rgba(44,41,38,0.15)] flex items-center gap-2"
            >
              Get Started Free
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03, y: -2, backgroundColor: 'rgba(255,255,255,0.9)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Link
              to="/dashboard"
              className="px-8 py-3.5 bg-transparent border border-black/10 text-ink-main rounded-xl text-[15px] font-medium flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              View Demo
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      <HeroDashboard />
    </section>
  );
}
