import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STEPS = [
  {
    number: '01',
    title: 'Connect & Ingest',
    description:
      'Link remote telemetry devices or upload historical records. VitalSense unifies disparate data streams instantly into a single, coherent timeline.',
    accentColor: '#63755A',
    accentBg: 'rgba(99,117,90,0.08)',
    icon: (
      <svg
        width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'AI Synthesis',
    description:
      'Our engine normalizes data, applies longitudinal trend analysis, and produces explainable composite risk scores — in real time.',
    accentColor: '#6A608A',
    accentBg: 'rgba(106,96,138,0.08)',
    icon: (
      <svg
        width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.1-5.5A2.5 2.5 0 0 1 4 11V7a2.5 2.5 0 0 1 5.5-5z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.1-5.5A2.5 2.5 0 0 0 20 11V7a2.5 2.5 0 0 0-5.5-5z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Review & Act',
    description:
      'Interact with a focused dashboard to review flagged anomalies, consult the AI chat assistant, and generate comprehensive clinical reports.',
    accentColor: '#8B1A1A',
    accentBg: 'rgba(139,26,26,0.07)',
    icon: (
      <svg
        width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
] as const;

export default function WorkflowSection() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-32 px-8 relative overflow-hidden"
      style={{ background: 'rgba(250,247,242,0.55)', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
    >
      {/* ── Section header ─────────────────────────────────── */}
      <motion.div
        className="text-center max-w-2xl mx-auto mb-24"
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.85, ease: EASE }}
      >
        <p
          className="mb-4"
          style={{
            fontFamily:    'var(--vs-font-body)',
            fontSize:      '9.5px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color:         '#9b9b8b',
          }}
        >
          The Workflow
        </p>
        <h2
          className="font-serif tracking-tight text-ink-main mb-5"
          style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', lineHeight: 1.13 }}
        >
          From data to diagnosis in seconds.
        </h2>
        <p
          className="text-ink-muted mx-auto"
          style={{
            fontFamily: 'var(--vs-font-body)',
            fontSize:   15.5,
            lineHeight: 1.72,
            maxWidth:   480,
          }}
        >
          A streamlined three-step workflow designed to respect your time
          and amplify your clinical intuition.
        </p>
      </motion.div>

      {/* ── Steps ──────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto relative">

        {/* Connecting gradient line (desktop only) */}
        <div
          aria-hidden="true"
          className="hidden md:block absolute pointer-events-none"
          style={{
            top:        52,
            left:       '16%',
            right:      '16%',
            height:     1,
            background: 'linear-gradient(to right, transparent, rgba(166,159,149,0.28) 20%, rgba(166,159,149,0.28) 80%, transparent)',
          }}
        />

        <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              className="flex-1 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 48 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.78, delay: 0.12 + i * 0.16, ease: EASE }}
            >
              {/* Circle */}
              <motion.div
                className="relative z-10 mb-9"
                whileHover={{ scale: 1.07 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <div
                  className="w-[108px] h-[108px] rounded-full bg-paper border border-black/5 flex flex-col items-center justify-center gap-1.5"
                  style={{
                    boxShadow: '0 8px 36px rgba(44,41,38,0.07), 0 2px 8px rgba(44,41,38,0.04)',
                  }}
                >
                  {/* Step number */}
                  <span
                    style={{
                      fontFamily:    'var(--vs-font-display)',
                      fontSize:      11,
                      letterSpacing: '0.10em',
                      color:         step.accentColor,
                      textTransform: 'uppercase',
                      lineHeight:    1,
                    }}
                  >
                    {step.number}
                  </span>
                  {/* Icon */}
                  <div style={{ color: step.accentColor }}>{step.icon}</div>
                </div>

                {/* Subtle glow ring on hover */}
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileHover={{ opacity: 1, scale: 1.12 }}
                  transition={{ duration: 0.35 }}
                  style={{ background: step.accentBg, filter: 'blur(12px)', zIndex: -1 }}
                />
              </motion.div>

              {/* Title */}
              <h3
                className="text-ink-main mb-3"
                style={{
                  fontFamily:    'var(--vs-font-display)',
                  fontSize:      'clamp(17px, 1.55vw, 21px)',
                  fontWeight:    500,
                  letterSpacing: '-0.01em',
                  lineHeight:    1.2,
                }}
              >
                {step.title}
              </h3>

              {/* Description */}
              <p
                className="text-ink-muted"
                style={{
                  fontFamily: 'var(--vs-font-body)',
                  fontSize:   14.5,
                  lineHeight: 1.78,
                  maxWidth:   300,
                }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
