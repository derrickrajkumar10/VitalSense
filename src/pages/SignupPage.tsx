import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from '../lib/gsap';
import { pageVariants } from '../lib/animations';

type PasswordStrength = 'weak' | 'good' | 'strong' | null;
type SubmitState = 'idle' | 'loading' | 'success';

const strengthConfig = {
  weak:   { width: '33%', color: 'bg-rose-dark',  textColor: 'text-rose-dark',  label: 'Weak' },
  good:   { width: '66%', color: 'bg-amber-dark',  textColor: 'text-amber-dark', label: 'Good' },
  strong: { width: '100%',color: 'bg-sage-dark',   textColor: 'text-sage-dark',  label: 'Strong' },
};

function evaluateStrength(val: string): PasswordStrength {
  if (!val) return null;
  let score = 0;
  if (val.length > 5) score++;
  if (val.length > 9) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  if (score <= 2) return 'weak';
  if (score <= 4) return 'good';
  return 'strong';
}

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <AnimatePresence mode="wait" initial={false}>
    {visible ? (
      <motion.svg key="off" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </motion.svg>
    ) : (
      <motion.svg key="on" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </motion.svg>
    )}
  </AnimatePresence>
);

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [confirmError, setConfirmError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const blobRef1 = useRef<HTMLDivElement>(null);
  const blobRef2 = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const strength = evaluateStrength(password);
  const strengthCfg = strength ? strengthConfig[strength] : null;

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(blobRef1.current, { scale: 1.1, opacity: 0.7, duration: 4, ease: 'sine.inOut' })
      .to(blobRef1.current, { scale: 0.95, opacity: 0.4, duration: 4, ease: 'sine.inOut' });
    const tl2 = gsap.timeline({ repeat: -1, yoyo: true, delay: 1 });
    tl2.to(blobRef2.current, { scale: 1.08, opacity: 0.6, duration: 5, ease: 'sine.inOut' })
       .to(blobRef2.current, { scale: 0.92, opacity: 0.3, duration: 5, ease: 'sine.inOut' });
    return () => { tl.kill(); tl2.kill(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setConfirmError(true);
      setTimeout(() => setConfirmError(false), 2000);
      return;
    }
    setSubmitState('loading');
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitState('success');
    await new Promise((r) => setTimeout(r, 1200));
    gsap.to(cardRef.current, {
      opacity: 0, scale: 0.96, y: -30, duration: 0.6, ease: 'vitalize',
      onComplete: () => navigate('/login'),
    });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="w-screen h-screen overflow-hidden flex items-center justify-center bg-ivory relative"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div ref={blobRef1} className="absolute w-[800px] h-[800px] bg-sand-main/10 rounded-full blur-[120px] mix-blend-multiply top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div ref={blobRef2} className="absolute w-[600px] h-[600px] bg-sage-light/20 rounded-full blur-[100px] mix-blend-multiply top-1/4 left-1/4" />
        <svg className="absolute w-full h-full opacity-40 text-sand-main" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
          <motion.path
            d="M-100,450 L350,450 C400,450 420,440 430,450 L450,450 L470,530 L510,180 L560,680 L600,380 L620,450 L640,450 C660,450 680,440 730,450 L1540,450"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 2.5, ease: 'easeInOut', delay: 0.3 }}
          />
          <path d="M0,350 L1440,350 M0,550 L1440,550" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" className="opacity-30" />
        </svg>
      </div>

      {/* Scrollable card */}
      <motion.div
        ref={cardRef}
        className="relative z-10 w-full max-w-[480px] mx-4 bg-paper rounded-[28px] p-10 sm:p-12 shadow-float border border-black/5 max-h-[95vh] overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: 'none' }}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 mb-6 text-ink-main group">
            <motion.svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 400 }}>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </motion.svg>
            <span className="font-serif text-2xl font-medium tracking-tight group-hover:opacity-80 transition-opacity">VitalSense</span>
          </Link>
          <h1 className="font-serif text-[32px] text-ink-main tracking-tight leading-tight mb-2">Create your account</h1>
          <p className="text-sm text-ink-muted">Join the clinical intelligence platform designed for focus.</p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <input
            type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name" required
            className="w-full px-4 py-3.5 bg-ivory/50 border border-black/10 rounded-xl text-[15px] outline-none focus:bg-paper focus:border-sage-dark focus:ring-1 focus:ring-sage-dark transition-all placeholder:text-ink-soft text-ink-main font-medium shadow-inner-soft"
          />

          {/* Email */}
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address" required
            className="w-full px-4 py-3.5 bg-ivory/50 border border-black/10 rounded-xl text-[15px] outline-none focus:bg-paper focus:border-sage-dark focus:ring-1 focus:ring-sage-dark transition-all placeholder:text-ink-soft text-ink-main font-medium shadow-inner-soft"
          />

          {/* Specialty */}
          <div className="relative">
            <select
              value={specialty} onChange={(e) => setSpecialty(e.target.value)} required
              className={`w-full px-4 py-3.5 bg-ivory/50 border border-black/10 rounded-xl text-[15px] outline-none focus:bg-paper focus:border-sage-dark focus:ring-1 focus:ring-sage-dark transition-all font-medium shadow-inner-soft cursor-pointer appearance-none ${!specialty ? 'text-ink-soft' : 'text-ink-main'}`}
            >
              <option value="" disabled>Clinical Specialty</option>
              <option value="cardiology">Cardiology</option>
              <option value="internal_medicine">Internal Medicine</option>
              <option value="neurology">Neurology</option>
              <option value="oncology">Oncology</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="primary_care">Primary Care</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Password + strength */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Create Password" required
                className="w-full pl-4 pr-12 py-3.5 bg-ivory/50 border border-black/10 rounded-xl text-[15px] outline-none focus:bg-paper focus:border-sage-dark focus:ring-1 focus:ring-sage-dark transition-all placeholder:text-ink-soft text-ink-main font-medium font-mono tracking-wider shadow-inner-soft"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-ink-soft hover:text-ink-main transition-colors outline-none rounded-md">
                <EyeIcon visible={showPassword} />
              </button>
            </div>

            {/* Strength bar */}
            <div className="mt-2.5 mb-1 flex items-center gap-3 px-1">
              <div className="h-1 flex-1 bg-black/5 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${strengthCfg?.color ?? 'bg-rose-dark'}`}
                  initial={{ width: 0 }}
                  animate={{ width: strengthCfg?.width ?? '0%' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <AnimatePresence mode="wait">
                {strength && (
                  <motion.span
                    key={strength}
                    className={`text-[10px] font-mono uppercase tracking-widest w-12 text-right ${strengthCfg?.textColor}`}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}
                  >
                    {strengthCfg?.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Confirm password */}
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password" required
              className={`w-full pl-4 pr-12 py-3.5 bg-ivory/50 border rounded-xl text-[15px] outline-none focus:bg-paper transition-all placeholder:text-ink-soft font-medium font-mono tracking-wider shadow-inner-soft ${
                confirmError
                  ? 'border-rose-dark/50 text-rose-dark focus:border-rose-dark focus:ring-1 focus:ring-rose-dark'
                  : 'border-black/10 text-ink-main focus:border-sage-dark focus:ring-1 focus:ring-sage-dark'
              }`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-ink-soft hover:text-ink-main transition-colors outline-none rounded-md">
              <EyeIcon visible={showConfirm} />
            </button>
          </div>

          {/* Terms */}
          <div className="flex items-start mt-2 pl-1 mb-1">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className="relative flex items-center justify-center w-5 h-5 rounded-[6px] border border-black/20 bg-ivory/50 group-hover:border-sage-dark transition-colors overflow-hidden shrink-0 mt-0.5"
                onClick={() => setAgreed(!agreed)}
              >
                <AnimatePresence>
                  {agreed && (
                    <motion.div
                      className="absolute inset-0 bg-sage-dark flex items-center justify-center"
                      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-[13px] font-medium text-ink-muted group-hover:text-ink-main transition-colors leading-relaxed select-none pt-[1px]">
                I agree to the{' '}
                <a href="#" onClick={(e) => e.stopPropagation()} className="text-ink-main hover:text-sage-dark transition-colors underline decoration-black/20 underline-offset-2">Terms of Service</a>
                {' '}and{' '}
                <a href="#" onClick={(e) => e.stopPropagation()} className="text-ink-main hover:text-sage-dark transition-colors underline decoration-black/20 underline-offset-2">Privacy Policy</a>.
              </span>
            </label>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={submitState === 'loading' || submitState === 'success'}
            className="w-full mt-2 py-[15px] bg-ink-main text-paper rounded-xl font-medium text-[15px] shadow-[0_4px_14px_rgba(44,41,38,0.15)] hover:bg-ink-main/90 transition-all flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink-main disabled:opacity-80"
            whileHover={{ scale: 1.01, boxShadow: '0 6px 20px rgba(44,41,38,0.22)' }}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait">
              {submitState === 'loading' && (
                <motion.div key="loading" className="flex items-center gap-2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full"
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                  <span>Creating Account...</span>
                </motion.div>
              )}
              {submitState === 'success' && (
                <motion.div key="success" className="flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                  <span>Account Created</span>
                </motion.div>
              )}
              {submitState === 'idle' && (
                <motion.div key="idle" className="flex items-center gap-2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <span>Create Account</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-black/5 text-center text-[13px] text-ink-muted font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-sage-dark hover:text-sage-dark/80 transition-colors ml-1">
            Sign In
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
