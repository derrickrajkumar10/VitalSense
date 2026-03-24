import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { features } from '../data/mockData';
import { FeatureIcon } from './FeatureIcons';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inViewRef = useRef(null);
  const inView = useInView(inViewRef, { once: true, margin: '-80px' });

  // Parallax: section scrolls slightly slower than viewport for depth
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '6%']);
  const headerY = useTransform(scrollYProgress, [0, 1], ['0px', '-28px']);

  return (
    <section id="features" className="py-32 px-8 relative overflow-hidden" ref={sectionRef}>

      {/* Parallax ambient orbs */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY }}
      >
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-sage-light/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-lavender-light/10 blur-3xl" />
      </motion.div>

      <div className="max-w-[1200px] mx-auto relative z-10">

        {/* Header with parallax lift */}
        <motion.div
          ref={inViewRef}
          className="text-center max-w-2xl mx-auto mb-20"
          style={{ y: headerY }}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-sage-dark mb-4">Features</p>
          <h2 className="font-serif text-4xl text-ink-main tracking-tight mb-4">
            A complete clinical operating system.
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed">
            Everything you need to monitor, analyze, and act on patient data, housed within an interface designed for focus and calm.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.id} feature={feature} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
  inView,
}: {
  feature: { id: string; colorClass: string; icon: string; title: string; description: string };
  index: number;
  inView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      className="bg-paper rounded-2xl p-8 shadow-card border border-black/5 group cursor-default relative overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.08 + index * 0.07, ease: EASE }}
      whileHover={{
        y: -8,
        boxShadow: '0 32px 80px rgba(44,41,38,0.09), 0 8px 24px rgba(44,41,38,0.05)',
      }}
    >
      {/* Hover shine sweep */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
        }}
      />

      <motion.div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.colorClass}`}
        whileHover={{ scale: 1.12, rotate: 4 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      >
        <FeatureIcon icon={feature.icon} />
      </motion.div>

      <h3 className="text-base font-medium text-ink-main mb-2">{feature.title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed">{feature.description}</p>

      {/* Bottom accent line on hover */}
      <motion.div
        className="absolute bottom-0 left-8 right-8 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(99,117,90,0.3), transparent)' }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
      />
    </motion.div>
  );
}
