import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

export default function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-sand-light/40"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
      />
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-lavender-light/30 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-80 h-80 bg-sage-light/40 rounded-full blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      <div className="max-w-[800px] mx-auto px-8 text-center relative z-10">
        <motion.h2
          className="font-serif text-4xl text-ink-main tracking-tight mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Ready to elevate your practice?
        </motion.h2>
        <motion.p
          className="text-ink-muted mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Join the thousands of clinicians using VitalSense to provide proactive, data-driven care without the cognitive overload.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/login"
              className="block w-full sm:w-auto px-8 py-3.5 bg-ink-main text-paper rounded-xl text-[15px] font-medium hover:bg-ink-main/90 transition shadow-[0_4px_14px_rgba(44,41,38,0.15)]"
            >
              Start 14-Day Free Trial
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/login"
              className="block w-full sm:w-auto px-8 py-3.5 bg-paper border border-black/10 text-ink-main rounded-xl text-[15px] font-medium hover:bg-cream transition shadow-sm"
            >
              Contact Sales
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
