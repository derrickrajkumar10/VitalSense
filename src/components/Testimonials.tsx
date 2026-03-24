import { motion, useInView } from 'framer-motion';
import { useMemo, useRef } from 'react';
import { testimonials } from '../data/mockData';
import { TestimonialsColumn } from '@/components/ui/testimonials-columns-1';

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const firstColumn  = useMemo(() => testimonials.slice(0, 3), []);
  const secondColumn = useMemo(() => testimonials.slice(3, 6), []);
  const thirdColumn  = useMemo(() => testimonials.slice(6, 9), []);

  return (
    <section id="testimonials" className="relative my-20 px-8 py-32" ref={ref}>
      <div className="mx-auto max-w-[1200px]">

        {/* Header */}
        <motion.div
          className="mx-auto mb-16 flex max-w-[560px] flex-col items-center text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
        >
          <div className="rounded-full border border-black/10 bg-paper px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-ink-muted">
            Testimonials
          </div>
          <h2 className="mt-5 font-serif text-3xl tracking-tight text-ink-main md:text-4xl">
            What clinical teams say
          </h2>
          <p className="mt-5 text-base leading-7 text-ink-muted">
            Real feedback from practitioners using VitalSense for live telemetry,
            AI-assisted review, and faster decision workflows.
          </p>
        </motion.div>

        {/* Columns */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
          className="flex max-h-[760px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]"
        >
          <TestimonialsColumn testimonials={firstColumn}  duration={16} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={20} />
          <TestimonialsColumn testimonials={thirdColumn}  className="hidden lg:block" duration={18} />
        </motion.div>

      </div>
    </section>
  );
}
