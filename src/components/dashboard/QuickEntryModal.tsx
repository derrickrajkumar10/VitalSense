import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from '../../lib/gsap';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickEntryModal({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const backdropRef  = useRef<HTMLDivElement>(null);
  const modalRef     = useRef<HTMLDivElement>(null);
  const card1Ref     = useRef<HTMLButtonElement>(null);
  const card2Ref     = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  // Open animation
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!visible) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'vitalize' } });
      tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        .fromTo(modalRef.current,
          { opacity: 0, scale: 0.88, y: 16 },
          { opacity: 1, scale: 1, y: 0, duration: 0.45 }, '-=0.15'
        )
        .fromTo([card1Ref.current, card2Ref.current],
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08 }, '-=0.25'
        );
    });
    return () => ctx.revert();
  }, [visible]);

  // Close animation
  const handleClose = useCallback(() => {
    const tl = gsap.timeline({
      onComplete: () => { setVisible(false); onClose(); },
    });
    tl.to([card1Ref.current, card2Ref.current],
      { opacity: 0, y: 10, scale: 0.97, duration: 0.2, stagger: 0.05, ease: 'vitalize-sharp' }
    )
    .to(modalRef.current,
      { opacity: 0, scale: 0.92, y: 8, duration: 0.22, ease: 'vitalize-sharp' }, '-=0.1'
    )
    .to(backdropRef.current,
      { opacity: 0, duration: 0.2 }, '-=0.15'
    );
  }, [onClose]);

  // ESC key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  const handleVitals = () => {
    handleClose();
    setTimeout(() => navigate('/vitals'), 300);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-ink-main/30 backdrop-blur-[3px]"
        style={{ opacity: 0 }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-paper rounded-3xl shadow-float border border-black/8 w-[480px] p-7"
        style={{ opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl text-ink-main tracking-tight">New Entry</h2>
            <p className="text-xs text-ink-muted mt-1">Choose how to log data for this patient</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-ivory flex items-center justify-center text-ink-muted hover:text-ink-main hover:bg-sand-light transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Record Vitals */}
          <button
            ref={card1Ref}
            onClick={handleVitals}
            className="group relative text-left bg-sage-light/40 hover:bg-sage-light border border-sage-dark/15 hover:border-sage-dark/30 rounded-2xl p-5 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(99,117,90,0.15)] outline-none"
            style={{ opacity: 0 }}
          >
            <div className="w-10 h-10 rounded-xl bg-sage-main/60 flex items-center justify-center text-sage-dark mb-4 group-hover:scale-110 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div className="font-semibold text-ink-main text-sm mb-1.5">Record Vitals</div>
            <div className="text-[11px] text-ink-muted leading-relaxed">
              Log heart rate, blood pressure, SpO2 and other vital signs
            </div>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-sage-dark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </button>

          {/* Clinical Note */}
          <button
            ref={card2Ref}
            onClick={handleClose}
            className="group relative text-left bg-lavender-light/40 hover:bg-lavender-light border border-lavender-dark/15 hover:border-lavender-dark/30 rounded-2xl p-5 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(106,96,138,0.15)] outline-none"
            style={{ opacity: 0 }}
          >
            <div className="w-10 h-10 rounded-xl bg-lavender-main/60 flex items-center justify-center text-lavender-dark mb-4 group-hover:scale-110 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div className="font-semibold text-ink-main text-sm mb-1.5">Clinical Note</div>
            <div className="text-[11px] text-ink-muted leading-relaxed">
              Add an observation, diagnosis note or clinical finding
            </div>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-lavender-dark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </button>
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-center gap-1.5">
          <kbd className="font-mono text-[10px] text-ink-soft bg-ivory border border-black/8 rounded px-1.5 py-0.5">esc</kbd>
          <span className="text-[10px] text-ink-soft">to dismiss</span>
        </div>
      </div>
    </div>
  );
}
