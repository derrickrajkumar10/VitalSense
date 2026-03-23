import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { trustLogos } from '../data/mockData';

export default function TrustBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-16 border-y border-black/5 bg-cream/50">
      <div className="max-w-[1200px] mx-auto px-8 flex flex-col items-center" ref={ref}>
        <motion.p
          className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Trusted by leading clinical teams
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-60 grayscale"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 0.6, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {trustLogos.map((logo, i) => (
            <motion.span
              key={logo}
              className={`font-serif text-xl font-medium ${i === 4 ? 'hidden md:block' : ''}`}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
              whileHover={{ opacity: 1, filter: 'grayscale(0)' }}
            >
              {logo}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
