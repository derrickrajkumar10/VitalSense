import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from '../lib/gsap';
import { pageVariants } from '../lib/animations';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [email, setEmail] = useState('dr.vance@vitalsense.io');
  const [password, setPassword] = useState('••••••••');
  const cardRef = useRef<HTMLDivElement>(null);
  const blobRef1 = useRef<HTMLDivElement>(null);
  const blobRef2 = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Ambient blob animation
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
    setLoading(true);
    setStatus('idle');

    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);

    // Demo: navigate to dashboard on submit
    setStatus('success');
    gsap.to(cardRef.current, {
      opacity: 0,
      scale: 0.96,
      y: -30,
      duration: 0.6,
      ease: 'vitalize',
      onComplete: () => { navigate('/dashboard'); },
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
        <div
          ref={blobRef1}
          className="absolute w-[800px] h-[800px] bg-sand-main/10 rounded-full blur-[120px] mix-blend-multiply top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        <div
          ref={blobRef2}
          className="absolute w-[600px] h-[600px] bg-sage-light/20 rounded-full blur-[100px] mix-blend-multiply top-1/4 left-1/4"
        />

        {/* ECG line */}
        <svg
          className="absolute w-full h-full opacity-40 text-sand-main"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          fill="none"
        >
          <motion.path
            d="M-100,450 L350,450 C400,450 420,440 430,450 L450,450 L470,530 L510,180 L560,680 L600,380 L620,450 L640,450 C660,450 680,440 730,450 L1540,450"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-60"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 2.5, ease: 'easeInOut', delay: 0.3 }}
          />
          <path
            d="M0,350 L1440,350 M0,550 L1440,550"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="opacity-30"
          />
        </svg>
      </div>

      {/* Card */}
      <motion.div
        ref={cardRef}
        className="relative z-10 w-full max-w-[460px] mx-4 bg-paper rounded-[28px] p-10 sm:p-12 shadow-float border border-black/5"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <header className="flex flex-col items-center mb-10">
          <Link to="/" className="flex items-center gap-2.5 mb-8 text-ink-main group">
            <motion.svg
              width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </motion.svg>
            <span className="font-serif text-2xl font-medium tracking-tight group-hover:opacity-80 transition-opacity">
              VitalSense
            </span>
          </Link>
          <h1 className="font-serif text-[32px] text-ink-main tracking-tight leading-tight mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-ink-muted">Sign in to access your clinical dashboard.</p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <motion.div
            className="relative"
            animate={status === 'error' ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className={`w-full px-4 py-3.5 bg-ivory/50 border rounded-xl text-[15px] outline-none
                focus:bg-paper focus:border-sage-dark focus:ring-1 focus:ring-sage-dark
                transition-all placeholder:text-ink-soft font-medium shadow-inner-soft
                ${status === 'error' ? 'border-rose-dark/50 text-rose-dark' : 'border-black/10 text-ink-main'}`}
              style={{ WebkitBoxShadow: '0 0 0 30px rgba(245,241,234,0.5) inset', WebkitTextFillColor: status === 'error' ? undefined : '#2C2926' }}
            />
          </motion.div>

          {/* Password */}
          <motion.div
            className="relative"
            animate={status === 'error' ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.4, delay: 0.04 }}
          >
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className={`w-full pl-4 pr-12 py-3.5 bg-ivory/50 border rounded-xl text-[15px] outline-none
                focus:bg-paper focus:border-sage-dark focus:ring-1 focus:ring-sage-dark
                transition-all placeholder:text-ink-soft font-mono tracking-wider shadow-inner-soft
                ${status === 'error' ? 'border-rose-dark/50 text-rose-dark' : 'border-black/10 text-ink-main'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-ink-soft hover:text-ink-main transition-colors rounded-md outline-none"
            >
              <AnimatePresence mode="wait" initial={false}>
                {showPassword ? (
                  <motion.svg key="off" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </motion.svg>
                ) : (
                  <motion.svg key="on" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </button>
          </motion.div>

          {/* Remember me */}
          <div className="flex items-center mt-1 pl-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className="relative flex items-center justify-center w-5 h-5 rounded-[6px] border border-black/20 bg-ivory/50 group-hover:border-sage-dark transition-colors overflow-hidden"
                onClick={() => setRemember(!remember)}
              >
                <AnimatePresence>
                  {remember && (
                    <motion.div
                      className="absolute inset-0 bg-sage-dark flex items-center justify-center"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-[14px] font-medium text-ink-muted group-hover:text-ink-main transition-colors select-none">
                Remember me
              </span>
            </label>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-[15px] bg-ink-main text-paper rounded-xl font-medium text-[15px] shadow-[0_4px_14px_rgba(44,41,38,0.15)] hover:bg-ink-main/90 transition-all flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink-main disabled:opacity-80"
            whileHover={{ scale: 1.01, boxShadow: '0 6px 20px rgba(44,41,38,0.22)' }}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" className="flex items-center gap-2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div
                    className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  <span>Authenticating...</span>
                </motion.div>
              ) : (
                <motion.div key="idle" className="flex items-center gap-2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <span>Sign In</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="text-center mt-2">
            <a href="#" className="text-[13px] font-medium text-ink-muted hover:text-ink-main transition-colors">
              Forgot password?
            </a>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-black/5" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft font-medium">OR</span>
          <div className="flex-1 h-px bg-black/5" />
        </div>

        {/* SSO */}
        <motion.button
          type="button"
          className="w-full py-3.5 bg-transparent border border-black/10 text-ink-main rounded-xl text-[14px] font-medium hover:bg-black/5 hover:border-black/20 transition-all flex items-center justify-center gap-3 outline-none"
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.99 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <path d="M14 8h1" /><path d="M14 12h1" /><path d="M14 16h1" />
          </svg>
          Sign In with SSO
        </motion.button>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-black/5 text-center text-[13px] text-ink-muted font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-sage-dark hover:text-sage-dark/80 transition-colors ml-1">
            Sign Up
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
