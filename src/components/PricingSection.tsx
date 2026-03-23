import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { pricingPlans } from '../data/mockData';

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage-dark shrink-0 mt-0.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const plans = pricingPlans[billing];

  return (
    <section id="pricing" className="py-32 bg-cream/50 border-y border-black/5 px-8" ref={ref}>
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-serif text-4xl text-ink-main tracking-tight mb-6">Simple, transparent pricing.</h2>

          <div className="inline-flex items-center p-1 bg-paper border border-black/5 rounded-full shadow-sm">
            {(['monthly', 'annual'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billing === b ? 'text-ink-main' : 'text-ink-muted hover:text-ink-main'
                }`}
              >
                {billing === b && (
                  <motion.div
                    layoutId="billing-pill"
                    className="absolute inset-0 bg-sand-light/50 rounded-full shadow-inner-soft"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 capitalize">{b}</span>
                {b === 'annual' && (
                  <span className="relative z-10 text-[10px] text-sage-dark bg-sage-light px-1.5 py-0.5 rounded ml-1">Save 20%</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-[1000px] mx-auto items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              className={`bg-paper rounded-2xl p-8 flex flex-col h-full relative ${
                plan.featured
                  ? 'border-2 border-sand-dark shadow-float z-10 scale-100 md:scale-105'
                  : 'border border-black/5 shadow-sm'
              }`}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: plan.featured ? -2 : -4 }}
            >
              {plan.featured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-sand-dark text-paper text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Recommended
                </div>
              )}

              <h3 className="text-lg font-medium text-ink-main mb-2">{plan.name}</h3>
              <p className="text-sm text-ink-muted mb-6">{plan.description}</p>

              <div className="mb-8 flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={plan.price}
                    className="font-serif text-5xl text-ink-main"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {plan.price}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm text-ink-muted">{plan.period}</span>
              </div>

              <ul className="flex flex-col gap-4 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-ink-main">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-auto">
                <Link
                  to="/login"
                  className={`block w-full py-3 rounded-xl text-sm font-medium transition text-center ${
                    plan.ctaStyle === 'filled'
                      ? 'bg-ink-main text-paper hover:bg-ink-main/90 shadow-sm'
                      : 'bg-transparent border border-black/10 text-ink-main hover:bg-black/5'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
