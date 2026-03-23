import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { testimonials } from '../data/mockData';

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="testimonials" className="py-32 px-8" ref={ref}>
      <div className="max-w-[1200px] mx-auto">
        <motion.h2
          className="font-serif text-3xl text-ink-main tracking-tight mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Endorsed by leading practitioners
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              className={`bg-paper border-t-4 ${t.borderColor} p-8 rounded-2xl shadow-card`}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: '0 32px 80px rgba(44,41,38,0.08)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-sand-main mb-6 opacity-60">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1.5.5 1.5 1.714C5.5 16 3 17 3 21zm14 0c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1.5.5 1.5 1.714C19.5 16 17 17 17 21z" />
              </svg>
              <p className="font-serif text-[17px] text-ink-main leading-relaxed mb-8 italic">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sand-light flex items-center justify-center text-ink-main font-serif text-sm">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-ink-main">{t.name}</div>
                  <div className="text-xs text-ink-muted">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
