import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';

const clinicalPartners = [
  'Mount Sinai',
  'Cleveland Clinic',
  'Mayo Clinic',
  'Johns Hopkins',
  'Mass General',
  'NYP Hospital',
  'UCLA Health',
  'Stanford Medicine',
];

export default function TrustBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-16 border-y border-black/5 bg-cream/50">
      <div className="max-w-[1200px] mx-auto px-8 flex flex-col items-center" ref={ref}>
        <motion.p
          className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-5 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          Trusted by leading clinical teams
        </motion.p>

        <div className="mx-auto mb-5 h-px w-64 bg-black/[0.06] [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />

        <motion.div
          className="w-full"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <InfiniteSlider
            gap={64}
            speed={40}
            speedOnHover={15}
            className="[mask-image:linear-gradient(to_right,transparent,black,transparent)]"
          >
            {clinicalPartners.map((name) => (
              <span
                key={name}
                className="font-serif text-xl font-medium text-ink-main whitespace-nowrap select-none"
              >
                {name}
              </span>
            ))}
          </InfiniteSlider>
        </motion.div>

        <div className="mt-5 h-px w-full max-w-sm bg-black/[0.06] [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
      </div>
    </section>
  );
}
