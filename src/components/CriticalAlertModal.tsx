import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';

export interface AlertData {
  condition: string;
  chipText: string;      // e.g. "Heart Rate 142 bpm"
  thresholdText: string; // e.g. "Critical > 130"
  description: string;
}

interface Props {
  data: AlertData;
  onDismiss: () => void;
}

export default function CriticalAlertModal({ data, onDismiss }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef    = useRef<HTMLDivElement>(null);

  // ── Entrance ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.38, ease: 'vitalize-soft' }
      );
      gsap.fromTo(modalRef.current,
        { scale: 0.96, y: 14, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.52,
          ease: 'back.out(1.15)', delay: 0.06 }
      );
    });
    return () => ctx.revert();
  }, []);

  // ── Exit animation then unmount ───────────────────────────────────────────
  const handleDismiss = () => {
    gsap.to(modalRef.current,   { scale: 0.96, y: 8, opacity: 0, duration: 0.24, ease: 'vitalize-sharp' });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.3,  ease: 'vitalize-sharp', onComplete: onDismiss });
  };

  const now = new Date();
  const timestamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-[#1C1A18]/50 z-40 backdrop-blur-[3px]"
        style={{ opacity: 0 }}
        onClick={handleDismiss}
      />

      {/* ── Modal ── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div
          ref={modalRef}
          className="bg-cream w-full max-w-[520px] p-12 rounded-[28px] border border-rose-dark/20 modal-border-pulse relative overflow-hidden pointer-events-auto"
          style={{ opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Rose ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-main/20 rounded-full blur-[40px] pointer-events-none -translate-y-1/2" />

          <div className="relative z-10 flex flex-col items-center text-center">

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-paper border border-rose-dark/15 flex items-center justify-center text-rose-dark mb-8 shadow-sm rotate-3 transform">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-rotate-3">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>

            {/* Title */}
            <h2 className="font-serif text-[32px] text-ink-main tracking-tight leading-tight mb-2">
              Critical Threshold Exceeded
            </h2>
            <h3 className="text-[20px] font-medium text-rose-dark mb-6 tracking-tight">
              {data.condition}
            </h3>

            {/* Value chip */}
            <div className="inline-flex items-center gap-3 bg-rose-light border border-rose-dark/15 text-rose-dark px-4 py-2 rounded-full mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              <span className="font-mono text-[12px] font-bold uppercase tracking-wider">
                {data.chipText}
              </span>
              <span className="w-1 h-1 rounded-full bg-rose-dark/40 shrink-0" />
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">
                {data.thresholdText}
              </span>
            </div>

            {/* Timestamp */}
            <div className="font-mono text-[11px] text-ink-muted uppercase tracking-widest mb-6">
              Detected: {timestamp}
            </div>

            {/* Description */}
            <p className="text-[15px] text-ink-main leading-relaxed mb-10 px-2">
              {data.description}
            </p>

            {/* Actions */}
            <div className="w-full flex flex-col gap-3">
              <button
                className="w-full py-4 rounded-xl bg-rose-dark text-paper font-medium text-[15px] shadow-[0_4px_14px_rgba(138,75,75,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-[#7A4242] transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Call Emergency
              </button>
              <button
                onClick={handleDismiss}
                className="w-full py-4 rounded-xl bg-transparent border border-black/10 text-ink-main font-medium text-[15px] hover:bg-black/5 hover:border-black/20 transition-all active:scale-[0.98]"
              >
                Dismiss
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
