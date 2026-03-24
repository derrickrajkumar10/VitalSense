import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Star, Zap } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useMediaQuery } from '../hooks/use-media-query';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Plan {
  name: string;
  monthly: number;
  annual: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    monthly: 49,
    annual: 39,
    period: 'per month',
    description: 'For individual clinicians and small practices exploring AI-assisted monitoring.',
    features: [
      'Up to 25 active patients',
      'Real-time vitals dashboard',
      'Basic AI risk scoring',
      '30-day history view',
      'PDF report export',
      'Email support',
    ],
    cta: 'Start Free Trial',
    href: '/login',
    featured: false,
  },
  {
    name: 'Professional',
    monthly: 149,
    annual: 119,
    period: 'per month',
    description: 'For growing clinical teams that need full AI predictions and longitudinal analytics.',
    features: [
      'Unlimited patients',
      'Full SHAP attribution panel',
      'Predictive condition scoring',
      '12-month history view',
      'AI clinical chat assistant',
      'Priority 24h support',
      'Team collaboration (5 seats)',
    ],
    cta: 'Get Started',
    href: '/login',
    featured: true,
  },
  {
    name: 'Enterprise',
    monthly: 399,
    annual: 319,
    period: 'per month',
    description: 'For hospitals and large health systems requiring compliance, SSO, and custom SLAs.',
    features: [
      'Everything in Professional',
      'HIPAA BAA included',
      'SSO / SAML 2.0',
      'Federated AI fine-tuning',
      'Dedicated account manager',
      '1-hour SLA response',
      'Custom data residency',
      'Advanced RBAC',
    ],
    cta: 'Contact Sales',
    href: '/login',
    featured: false,
  },
];

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const switchRef = useRef<HTMLButtonElement>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const handleToggle = (checked: boolean) => {
    setIsAnnual(checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      confetti({
        particleCount: 60,
        spread: 55,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#63755A', '#6A608A', '#C4A882', '#8B1A1A'],
        ticks: 180,
        gravity: 1.1,
        decay: 0.93,
        startVelocity: 28,
        shapes: ['circle'],
      });
    }
  };

  return (
    <section id="pricing" className="py-32 px-8 bg-cream/50 border-y border-black/5" ref={ref}>
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-sage-dark mb-4">Pricing</p>
          <h2 className="font-serif text-4xl text-ink-main tracking-tight mb-4">Simple, transparent pricing.</h2>
          <p className="text-ink-muted max-w-md mx-auto text-sm leading-relaxed">
            Every plan includes the full platform. No feature gating, no surprise overages.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        >
          <span className={cn('text-sm font-medium transition-colors', !isAnnual ? 'text-ink-main' : 'text-ink-muted')}>
            Monthly
          </span>
          <Label>
            <Switch
              ref={switchRef}
              checked={isAnnual}
              onCheckedChange={handleToggle}
            />
          </Label>
          <span className={cn('text-sm font-medium transition-colors flex items-center gap-1.5', isAnnual ? 'text-ink-main' : 'text-ink-muted')}>
            Annual
            <AnimatePresence>
              {isAnnual && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.7, x: -6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.7, x: -6 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-sage-dark bg-sage-light px-2 py-0.5 rounded-full"
                >
                  <Zap className="h-2.5 w-2.5" />
                  Save 20%
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-[1000px] mx-auto items-center">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={cn(
                'relative rounded-2xl p-8 flex flex-col h-full bg-paper',
                plan.featured
                  ? 'border-2 border-sand-dark shadow-float z-10'
                  : 'border border-black/5 shadow-sm',
                !plan.featured && 'mt-0 md:mt-5'
              )}
              initial={{ opacity: 0, y: 48 }}
              animate={
                inView
                  ? {
                      opacity: 1,
                      y: plan.featured ? (isDesktop ? -16 : 0) : 0,
                      scale: plan.featured ? 1 : isDesktop ? 0.97 : 1,
                    }
                  : {}
              }
              transition={{ duration: 0.75, delay: 0.12 + i * 0.1, ease: EASE }}
              whileHover={{ y: plan.featured ? -20 : -6 }}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 bg-sand-dark text-paper py-0.5 px-2.5 rounded-bl-xl rounded-tr-2xl flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Recommended</span>
                </div>
              )}

              <p className="text-xs font-semibold tracking-widest uppercase text-ink-muted mb-5">{plan.name}</p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-serif text-5xl text-ink-main">
                  $<NumberFlow
                    value={isAnnual ? plan.annual : plan.monthly}
                    transformTiming={{ duration: 450, easing: 'ease-out' }}
                    willChange
                    className="tabular-nums"
                  />
                </span>
                <span className="text-xs text-ink-muted">/{plan.period.replace('per ', '')}</span>
              </div>
              <p className="text-[10px] text-ink-muted mb-5">
                {isAnnual ? 'billed annually' : 'billed monthly'}
              </p>

              <p className="text-sm text-ink-muted leading-relaxed mb-7">{plan.description}</p>

              <hr className="border-black/5 mb-6" />

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink-main">
                    <Check className="h-4 w-4 text-sage-dark shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-auto">
                <Link
                  to={plan.href}
                  className={cn(
                    'block w-full py-3 rounded-xl text-sm font-medium text-center transition-colors',
                    plan.featured
                      ? 'bg-ink-main text-paper hover:bg-ink-main/90 shadow-sm'
                      : 'border border-black/10 text-ink-main hover:bg-ivory'
                  )}
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
