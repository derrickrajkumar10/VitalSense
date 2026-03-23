import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from '../../lib/gsap';
import type { Vital } from '../../data/dashboardData';

interface VitalCardProps {
  vital: Vital;
  index: number;
}

const statusConfig = {
  normal: {
    badge: 'bg-sage-light text-sage-dark border border-sage-main',
    label: 'Normal',
    glow: '',
  },
  elevated: {
    badge: 'bg-lavender-light text-lavender-dark border border-lavender-main',
    label: 'Elevated',
    glow: 'shadow-[0_0_12px_rgba(106,96,138,0.25)]',
  },
  critical: {
    badge: 'bg-rose-light text-rose-dark border border-rose-main',
    label: 'Critical',
    glow: 'shadow-[0_0_12px_rgba(138,75,75,0.3)]',
  },
};

export default function VitalCard({ vital, index }: VitalCardProps) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef<number>(vital.value);
  const config = statusConfig[vital.status];

  useEffect(() => {
    if (!valueRef.current) return;
    const delay = 0.6 + index * 0.15;

    if (vital.id === 'bp') {
      // Animate BP differently — just fade in with a spring
      gsap.fromTo(
        valueRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.7, delay, ease: 'vitalize-soft' }
      );
    } else {
      // Counter animation — from previous value to new value (no flash)
      const fromVal = prevValueRef.current;
      const obj = { val: fromVal };
      gsap.to(obj, {
        val: vital.value,
        duration: 1.4,
        delay,
        ease: 'power2.out',
        onUpdate: () => {
          if (valueRef.current) {
            valueRef.current.textContent = Math.round(obj.val).toString();
          }
        },
        onComplete: () => {
          prevValueRef.current = Math.round(obj.val);
        },
      });
    }
  }, [vital, index]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(44,41,38,0.1)' }}
      className={`relative bg-cream rounded-xl p-3 border border-sand-light/60 cursor-default transition-shadow duration-300 ${config.glow}`}
    >
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-[10px] font-medium text-ink-muted tracking-wide uppercase">
          {vital.label}
        </span>
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${config.badge}`}>
          {config.label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-ink-main font-mono" ref={valueRef}>
          {vital.id === 'bp' ? vital.displayValue : String(vital.value)}
        </span>
        <span className="text-[10px] text-ink-soft font-medium">{vital.unit}</span>
      </div>

      {/* Subtle animated bottom bar for elevated */}
      {vital.status === 'elevated' && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-lavender-dark/40 rounded-b-xl"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8 + index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'left' }}
        />
      )}
    </motion.div>
  );
}
