import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MotionLink = motion.create(Link);
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
<motion.h1 variants={item} className="font-serif text-6xl md:text-7xl text-ink-main tracking-tight leading-[1.1] mb-6">
          Clinical intelligence,<br />beautifully refined.
        </motion.h1>

        <motion.p variants={item} className="text-lg text-ink-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Empower your practice with continuous telemetry, predictive AI, and seamless patient records in one serene, focused platform.
        </motion.p>

        <motion.div variants={item} className="flex items-center justify-center gap-4">
          <MotionLink
            to="/login"
            className="px-8 py-3.5 bg-ink-main text-paper rounded-xl text-[15px] font-medium shadow-[0_4px_14px_rgba(44,41,38,0.15)] flex items-center gap-2"
            whileHover={{ scale: 1.03, y: -2, boxShadow: '0 8px 24px rgba(44,41,38,0.2)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            Get Started Free
          </MotionLink>
          <MotionLink
            to="/dashboard"
            className="px-8 py-3.5 bg-paper border border-black/10 text-ink-main rounded-xl text-[15px] font-medium flex items-center gap-2"
            whileHover={{ scale: 1.03, y: -2, boxShadow: '0 8px 24px rgba(44,41,38,0.08)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            View Demo
          </MotionLink>
        </motion.div>
      </motion.div>

      <HeroDashboard />
    </section>
  );
}
