import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { steps } from '../data/mockData';

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="py-32 bg-cream/50 border-y border-black/5 px-8" ref={ref}>
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-serif text-4xl text-ink-main tracking-tight mb-4">From data to diagnosis in seconds.</h2>
          <p className="text-ink-muted">A streamlined workflow designed to respect your time.</p>
        </motion.div>

        <div className="relative flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Dashed line */}
          <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[1px] -z-10 border-t border-dashed border-ink-soft/40" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="flex-1 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="w-14 h-14 bg-paper rounded-full shadow-sm border border-black/5 flex items-center justify-center mb-6 z-10 font-mono text-lg text-ink-main"
                whileHover={{ scale: 1.1, boxShadow: '0 8px 24px rgba(44,41,38,0.08)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {step.number}
              </motion.div>
              <h3 className="text-lg font-medium text-ink-main mb-3">{step.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed max-w-[280px]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
