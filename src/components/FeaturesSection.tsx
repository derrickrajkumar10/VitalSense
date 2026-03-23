import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { features } from '../data/mockData';
import { FeatureIcon } from './FeatureIcons';

export default function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="py-32 px-8 relative" ref={ref}>
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-serif text-4xl text-ink-main tracking-tight mb-4">A complete clinical operating system.</h2>
          <p className="text-ink-muted">Everything you need to monitor, analyze, and act on patient data, housed within an interface designed for focus and calm.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.id}
              className="bg-paper rounded-2xl p-8 shadow-card border border-black/5 group cursor-default"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, boxShadow: '0 32px 80px rgba(44,41,38,0.08), 0 8px 24px rgba(44,41,38,0.04)' }}
            >
              <motion.div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.colorClass}`}
                whileHover={{ scale: 1.1, rotate: 3 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <FeatureIcon icon={feature.icon} />
              </motion.div>
              <h3 className="text-lg font-medium text-ink-main mb-2">{feature.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
