import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { faqs } from '../data/mockData';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-32 px-8" ref={ref}>
      <div className="max-w-[800px] mx-auto">
        <motion.h2
          className="font-serif text-3xl text-ink-main tracking-tight mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Frequently Asked Questions
        </motion.h2>

        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="bg-paper border border-black/5 rounded-2xl px-6 cursor-pointer overflow-hidden"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              whileHover={{ borderColor: 'rgba(0,0,0,0.08)' }}
            >
              <div className="flex justify-between items-center py-6">
                <h4 className="font-medium text-ink-main pr-8">{faq.question}</h4>
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-ink-muted shrink-0"
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </motion.svg>
              </div>

              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="pb-6 text-sm text-ink-muted leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
