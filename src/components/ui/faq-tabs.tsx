import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type FAQItem = { question: string; answer: string };
type FAQData = Record<string, FAQItem[]>;
type Categories = Record<string, string>;

export const FAQ = ({
  title = 'FAQs',
  subtitle = 'Frequently Asked Questions',
  categories,
  faqData,
  className,
}: {
  title?: string;
  subtitle?: string;
  categories: Categories;
  faqData: FAQData;
  className?: string;
}) => {
  const categoryKeys = Object.keys(categories);
  const [selectedCategory, setSelectedCategory] = useState(categoryKeys[0]);

  return (
    <section className={cn('relative overflow-hidden px-8 py-32', className)}>
      <FAQHeader title={title} subtitle={subtitle} />
      <FAQTabs categories={categories} selected={selectedCategory} setSelected={setSelectedCategory} />
      <FAQList faqData={faqData} selected={selectedCategory} />
    </section>
  );
};

const FAQHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="relative z-10 flex flex-col items-center justify-center mb-12">
    <span className="mb-4 font-mono text-[10px] tracking-[0.18em] uppercase text-sage-dark">
      {subtitle}
    </span>
    <h2 className="font-serif text-4xl tracking-tight text-ink-main text-center">{title}</h2>
    <span className="absolute -top-[300px] left-1/2 z-0 h-[480px] w-[560px] -translate-x-1/2 rounded-full bg-gradient-to-r from-sage-light/20 to-lavender-light/15 blur-3xl pointer-events-none" />
  </div>
);

const FAQTabs = ({
  categories,
  selected,
  setSelected,
}: {
  categories: Categories;
  selected: string;
  setSelected: (k: string) => void;
}) => (
  <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mb-12">
    {Object.entries(categories).map(([key, label]) => (
      <button
        key={key}
        onClick={() => setSelected(key)}
        className={cn(
          'relative overflow-hidden whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-main/30',
          selected === key
            ? 'border-sage-main text-paper'
            : 'border-black/10 bg-paper text-ink-muted hover:text-ink-main hover:border-black/20'
        )}
      >
        <span className="relative z-10">{label}</span>
        <AnimatePresence>
          {selected === key && (
            <motion.span
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-0 bg-sage-main"
            />
          )}
        </AnimatePresence>
      </button>
    ))}
  </div>
);

const FAQList = ({ faqData, selected }: { faqData: FAQData; selected: string }) => (
  <div className="mx-auto max-w-3xl">
    <AnimatePresence mode="wait">
      {Object.entries(faqData).map(([category, questions]) => {
        if (selected !== category) return null;
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3"
          >
            {questions.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

const FAQItem = ({ question, answer }: FAQItem) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      animate={isOpen ? 'open' : 'closed'}
      className={cn(
        'rounded-2xl border transition-colors cursor-pointer',
        isOpen ? 'bg-cream/60 border-black/8' : 'bg-paper border-black/5'
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left focus-visible:outline-none"
      >
        <span className={cn('font-medium transition-colors', isOpen ? 'text-ink-main' : 'text-ink-main/80')}>
          {question}
        </span>
        <motion.span
          variants={{ open: { rotate: '45deg' }, closed: { rotate: '0deg' } }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
        >
          <Plus className={cn('h-4 w-4 transition-colors', isOpen ? 'text-sage-dark' : 'text-ink-muted')} />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : '0px', marginBottom: isOpen ? '20px' : '0px' }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden px-5"
      >
        <p className="text-sm text-ink-muted leading-relaxed">{answer}</p>
      </motion.div>
    </motion.div>
  );
};
