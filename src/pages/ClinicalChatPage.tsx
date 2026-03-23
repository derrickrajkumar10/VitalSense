import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from '../lib/gsap';
import { pageVariants } from '../lib/animations';

const VITALS_GRID = [
  { label: 'Heart Rate',      value: '72',     unit: 'bpm',   color: 'text-ink-main'      },
  { label: 'Blood Pressure',  value: '135/85', unit: 'mmHg',  color: 'text-lavender-dark' },
  { label: 'SpO2',            value: '99',     unit: '%',     color: 'text-ink-main'      },
  { label: 'Temperature',     value: '36.8',   unit: '°C',    color: 'text-ink-main'      },
  { label: 'Resp Rate',       value: '14',     unit: 'br/m',  color: 'text-ink-main'      },
  { label: 'ECG / HRV',       value: '42',     unit: 'ms',    color: 'text-rose-dark'     },
];

type Message = { role: 'user' | 'assistant'; content: string };

export default function ClinicalChatPage() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "I've completed the preliminary analysis of Eleanor's recent telemetry data. The algorithm has detected a high-confidence pattern indicative of early-stage Paroxysmal Atrial Fibrillation. This correlates directly with her recent complaints of occasional nocturnal palpitations." },
    { role: 'user',      content: "Are there any immediate ischemic signs or concerning drops in stroke volume during these episodes?" },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    } else {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const chatScrollRef  = useRef<HTMLDivElement>(null);
  const gaugeRef       = useRef<SVGPathElement>(null);
  const ecgPathRef     = useRef<SVGPathElement>(null);
  const leftPanelRef   = useRef<HTMLElement>(null);
  const rightPanelRef  = useRef<HTMLElement>(null);
  const bubble1Ref     = useRef<HTMLDivElement>(null);
  const bubble2Ref     = useRef<HTMLDivElement>(null);
  const bubble3Ref     = useRef<HTMLDivElement>(null);
  const reportRef      = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY ?? '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: 'You are VitalSense AI, a clinical decision support assistant. Patient: Eleanor Vance, 45F, MRN 849-291-B. Vitals: HR 72bpm, BP 135/85mmHg, SpO2 99%, Temp 36.8°C, Resp 14br/m, HRV 42ms. Primary concern: mild irregular cardiac rhythm, possible paroxysmal atrial fibrillation. Respond as a clinical AI — concise, medically accurate, under 80 words.',
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text ?? 'Unable to process request.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm unable to process that request right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── GSAP entrance + gauge + ECG ───────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'vitalize' } });

      // Panel slide-in
      tl.fromTo(leftPanelRef.current,
        { x: -32, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.65 }
      ).fromTo(rightPanelRef.current,
        { x: 28, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.65 },
        '-=0.45'
      );

      // Chat bubbles stagger
      tl.fromTo(
        [bubble1Ref.current, bubble2Ref.current, bubble3Ref.current],
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.18, duration: 0.5, ease: 'vitalize-soft' },
        '-=0.25'
      );

      // Report sections stagger
      if (reportRef.current) {
        const sections = reportRef.current.querySelectorAll('.report-section');
        tl.fromTo(sections,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.13, duration: 0.52, ease: 'vitalize-soft' },
          '-=0.2'
        );
      }

      // Gauge arc draw
      if (gaugeRef.current) {
        gsap.set(gaugeRef.current, { strokeDasharray: 283, strokeDashoffset: 283 });
        gsap.to(gaugeRef.current, {
          strokeDashoffset: 62.26,
          duration: 1.85,
          delay: 0.9,
          ease: 'vitalize-soft',
        });
      }

      // Score counter 0 → 78
      const proxy = { val: 0 };
      gsap.to(proxy, {
        val: 78,
        duration: 1.65,
        delay: 0.9,
        ease: 'vitalize-soft',
        onUpdate() { setScore(Math.round(proxy.val)); },
      });

      // ECG path draw
      if (ecgPathRef.current) {
        const len = ecgPathRef.current.getTotalLength();
        gsap.set(ecgPathRef.current, {
          strokeDasharray: `${len} ${len}`,
          strokeDashoffset: len,
        });
        gsap.to(ecgPathRef.current, {
          strokeDashoffset: 0,
          duration: 2.5,
          delay: 1.05,
          ease: 'none',
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="w-screen h-screen overflow-hidden flex flex-col bg-ivory font-sans antialiased"
    >
      {/* ══ HEADER ════════════════════════════════════════════════════════════ */}
      <header className="h-16 bg-cream/90 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-main">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <span className="font-serif text-xl font-medium tracking-tight">VitalSense</span>
          </div>

          <div className="h-4 w-px bg-black/10"/>

          <nav className="flex items-center gap-1">
            {[
              { label: 'Overview',          path: '/dashboard' },
              { label: 'Copilot Assistant', path: '/chat',      active: true },
              { label: 'Patient Records',   path: '/vitals' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => !item.active && navigate(item.path)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-main/30 ${
                  item.active
                    ? 'bg-sand-light/50 text-ink-main shadow-inner-soft'
                    : 'text-ink-muted hover:text-ink-main'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-paper border border-black/5 flex items-center justify-center text-ink-main shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
      </header>

      {/* ══ MAIN ══════════════════════════════════════════════════════════════ */}
      <main
        className="flex-1 flex overflow-hidden p-6 gap-6 relative"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTY2LCAxNTksIDE0OSwgMC4wNSkiLz48L3N2Zz4=')",
        }}
      >
        {/* ── LEFT: CHAT PANEL ─────────────────────────────────────────────── */}
        <section
          ref={leftPanelRef}
          className="flex flex-col w-[42%] bg-cream rounded-3xl shadow-soft border border-black/5 overflow-hidden flex-shrink-0 relative"
          style={{ opacity: 0 }}
        >
          {/* Patient header */}
          <div className="p-4 border-b border-black/5 bg-cream/90 backdrop-blur-sm z-10 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sand-light flex items-center justify-center text-ink-main font-serif text-sm font-medium">
                  EV
                </div>
                <div>
                  <h2 className="font-medium text-sm leading-none text-ink-main">Eleanor Vance</h2>
                  <p className="font-mono text-[9px] text-ink-muted mt-1 uppercase tracking-wider">MRN: 849-291-B</p>
                </div>
              </div>
              <button aria-label="Edit patient info" className="text-ink-soft hover:text-ink-main transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-main/30 rounded">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>
            </div>

            {/* Vitals chips */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-light/60 border border-sage-dark/10 text-sage-dark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <span className="font-medium text-xs">72 <span className="font-mono text-[9px] opacity-70">BPM</span></span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lavender-light/60 border border-lavender-dark/10 text-lavender-dark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
                <span className="font-medium text-xs">135/85 <span className="font-mono text-[9px] opacity-70">MMHG</span></span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sand-light border border-sand-dark/10 text-sand-dark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
                </svg>
                <span className="font-medium text-xs">99 <span className="font-mono text-[9px] opacity-70">%</span></span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-light/60 border border-rose-dark/10 text-rose-dark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                </svg>
                <span className="font-medium text-xs">36.8 <span className="font-mono text-[9px] opacity-70">°C</span></span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
          >
            {messages.map((msg, i) =>
              msg.role === 'assistant' ? (
                <div
                  key={i}
                  ref={i === 0 ? bubble1Ref : undefined}
                  className="flex items-start gap-4"
                  style={{ opacity: i === 0 ? 0 : 1 }}
                >
                  <div className="w-8 h-8 rounded-full bg-paper border border-black/5 flex items-center justify-center text-ink-main shrink-0 shadow-sm mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1 max-w-[85%]">
                    <span className="text-[11px] font-medium text-ink-muted ml-1">VitalSense AI</span>
                    <div className="bg-paper border border-black/5 p-4 rounded-2xl rounded-tl-sm" style={{ boxShadow: '0 2px 8px rgba(44,41,38,0.02), 0 1px 2px rgba(44,41,38,0.02)' }}>
                      <p className="text-[14px] leading-relaxed text-ink-main break-words">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={i}
                  ref={i === 1 ? bubble2Ref : undefined}
                  className="flex items-start justify-end gap-4"
                  style={{ opacity: i === 1 ? 0 : 1 }}
                >
                  <div className="flex flex-col gap-1 max-w-[85%] items-end">
                    <span className="text-[11px] font-medium text-ink-muted mr-1">Dr. Thorne</span>
                    <div className="bg-sand-light/50 border border-sand-dark/10 p-4 rounded-2xl rounded-tr-sm" style={{ boxShadow: '0 2px 8px rgba(44,41,38,0.02), 0 1px 2px rgba(44,41,38,0.02)' }}>
                      <p className="text-[14px] leading-relaxed text-ink-main break-words">{msg.content}</p>
                    </div>
                  </div>
                </div>
              )
            )}

            {isLoading && (
              <div ref={bubble3Ref} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-paper border border-black/5 flex items-center justify-center text-ink-main shrink-0 shadow-sm mt-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <span className="text-[11px] font-medium text-ink-muted ml-1">VitalSense AI</span>
                  <div className="bg-paper border border-black/5 p-4 rounded-2xl rounded-tl-sm" style={{ boxShadow: '0 2px 8px rgba(44,41,38,0.02), 0 1px 2px rgba(44,41,38,0.02)' }}>
                    <p className="text-[14px] leading-relaxed text-ink-main min-h-[1.5em]">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-ink-soft animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-ink-soft animate-pulse [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-ink-soft animate-pulse [animation-delay:0.4s]" />
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="h-4" />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-black/5 bg-cream shrink-0">
            <div className="relative flex items-center bg-paper border border-black/10 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-sand-dark/20 focus-within:border-sand-dark/30 transition-all p-1.5">
              <button aria-label="Voice input" className="w-10 h-10 rounded-full flex items-center justify-center text-ink-muted hover:text-ink-main hover:bg-cream transition shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-main/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
              </button>
              <input
                type="text"
                placeholder="Ask about this patient's vitals or findings..."
                className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-ink-main placeholder:text-ink-soft"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) sendMessage(); }}
              />
              <button aria-label="Send message" onClick={sendMessage} className="w-10 h-10 rounded-full bg-ink-main text-paper flex items-center justify-center hover:bg-ink-main/90 transition shadow-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-main/40">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-ink-muted font-mono uppercase tracking-wider">
                AI-Generated Medical Insights • Review before clinical action
              </span>
            </div>
          </div>
        </section>

        {/* ── RIGHT: REPORT PANEL ──────────────────────────────────────────── */}
        <section
          ref={rightPanelRef}
          className="flex-1 flex flex-col min-w-0"
          style={{ opacity: 0 }}
        >
          {/* Toolbar */}
          <div className="flex justify-end items-center gap-3 mb-4 shrink-0">
            <button onClick={handleShare} className="px-4 py-2 bg-paper border border-black/10 rounded-lg text-sm font-medium text-ink-main shadow-sm hover:bg-cream transition flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-main/30">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              {shareCopied ? 'Link Copied!' : 'Share Report'}
            </button>
            <button onClick={() => navigate('/reports')} className="px-5 py-2 bg-ink-main text-paper rounded-lg text-sm font-medium shadow-[0_4px_14px_rgba(44,41,38,0.2)] hover:bg-ink-main/90 transition flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-main/40">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </button>
          </div>

          {/* Report document */}
          <div className="flex-1 overflow-y-auto pb-8 flex justify-center">
            <div
              ref={reportRef}
              className="bg-paper w-full max-w-[800px] rounded-xl shadow-card border border-black/5 p-12 flex flex-col gap-10"
            >

              {/* ── Report header ── */}
              <div className="report-section flex justify-between items-start border-b border-black/10 pb-8" style={{ opacity: 0 }}>
                <div className="flex items-center gap-2">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-main">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                  <span className="font-serif text-2xl font-medium tracking-tight">VitalSense</span>
                </div>
                <div className="text-right">
                  <h1 className="font-serif text-3xl text-ink-main mb-1">Eleanor Vance</h1>
                  <div className="font-mono text-[11px] text-ink-muted uppercase tracking-widest flex flex-col gap-1">
                    <span>MRN: 849-291-B</span>
                    <span>Date: Oct 25, 2023</span>
                    <span>Time: 08:42 AM PST</span>
                  </div>
                </div>
              </div>

              {/* ── AI Synthesis ── */}
              <div className="report-section bg-ivory/50 rounded-lg p-6 border-l-2 border-ink-soft" style={{ opacity: 0 }}>
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-3">AI Clinical Synthesis</h3>
                <p className="font-serif text-[17px] leading-relaxed text-ink-main italic">
                  "Patient exhibits signs of mild irregular rhythm predominantly during nocturnal hours.
                  Elevated resting heart rate and decreased HRV correlate with sympathetic dominance.
                  Pattern analysis indicates high probability of early-stage Paroxysmal Atrial Fibrillation.
                  No immediate signs of ischemia detected. Clinical correlation and formal 12-lead ECG advised."
                </p>
              </div>

              {/* ── Gauge + Vitals ── */}
              <div className="report-section grid grid-cols-[300px_1fr] gap-10" style={{ opacity: 0 }}>
                {/* Gauge */}
                <div className="flex flex-col border border-black/5 rounded-xl p-6 shadow-sm">
                  <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-6 text-center">
                    Composite Risk Score
                  </h3>
                  <div className="relative w-full aspect-[2/1] flex items-end justify-center overflow-hidden">
                    <svg viewBox="0 0 200 110" className="w-full h-full absolute inset-0">
                      <defs>
                        <linearGradient id="chat-gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%"   stopColor="#849C76"/>
                          <stop offset="50%"  stopColor="#D9A05B"/>
                          <stop offset="100%" stopColor="#A85757"/>
                        </linearGradient>
                      </defs>
                      {/* Track */}
                      <path
                        d="M 10 100 A 90 90 0 0 1 190 100"
                        fill="none"
                        stroke="rgba(0,0,0,0.04)"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                      {/* Animated fill */}
                      <path
                        ref={gaugeRef}
                        d="M 10 100 A 90 90 0 0 1 190 100"
                        fill="none"
                        stroke="url(#chat-gauge-grad)"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="relative z-10 flex flex-col items-center pb-1">
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif text-5xl text-rose-dark tracking-tighter leading-none">
                          {score}
                        </span>
                        <span className="text-sm font-medium text-ink-muted">/100</span>
                      </div>
                      <span className="font-mono text-[10px] text-rose-dark uppercase mt-1 bg-rose-light/50 px-2 py-0.5 rounded font-bold">
                        Elevated Risk
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vitals grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  {VITALS_GRID.map(v => (
                    <div key={v.label} className="border-b border-black/5 pb-2">
                      <div className="text-[10px] font-mono uppercase text-ink-muted tracking-wider mb-1">
                        {v.label}
                      </div>
                      <div className={`font-serif text-2xl ${v.color}`}>
                        {v.value}{' '}
                        <span className="font-sans text-xs text-ink-muted font-normal">{v.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── ECG Telemetry ── */}
              <div className="report-section" style={{ opacity: 0 }}>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                    Telemetry Snapshot (Lead II)
                  </h3>
                  <span className="text-[10px] font-mono text-ink-soft bg-ivory px-2 py-1 rounded">
                    25 mm/s • 10 mm/mV
                  </span>
                </div>

                <div className="w-full h-40 bg-[#FFFDFB] border border-rose-dark/20 rounded-lg relative overflow-hidden">
                  {/* ECG grid */}
                  <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                    <defs>
                      <pattern id="ecg-sm" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(166,159,149,0.15)" strokeWidth="0.5"/>
                      </pattern>
                      <pattern id="ecg-lg" width="50" height="50" patternUnits="userSpaceOnUse">
                        <rect width="50" height="50" fill="url(#ecg-sm)"/>
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(166,159,149,0.3)" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#ecg-lg)"/>
                  </svg>

                  {/* ECG waveform */}
                  <svg
                    viewBox="0 0 1000 160"
                    preserveAspectRatio="none"
                    className="w-full h-full absolute inset-0"
                  >
                    <path
                      ref={ecgPathRef}
                      fill="none"
                      stroke="#8A4B4B"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M 0 80 L 20 80 C 30 70, 40 70, 50 80 L 60 80 L 65 90 L 75 20 L 80 100 L 85 80
                         L 110 80 C 130 65, 150 65, 170 80 L 250 80
                         L 260 80 C 270 70, 280 70, 290 80 L 300 80 L 305 90 L 315 20 L 320 100 L 325 80
                         L 350 80 C 370 65, 390 65, 410 80 L 460 80
                         L 470 80 C 475 75, 485 75, 490 80 L 500 80 L 505 90 L 515 20 L 520 100 L 525 80
                         L 550 80 C 570 65, 590 65, 610 80 L 740 80
                         L 750 80 C 760 70, 770 70, 780 80 L 790 80 L 795 90 L 805 20 L 810 100 L 815 80
                         L 840 80 C 860 65, 880 65, 900 80 L 1000 80"
                    />
                    <line x1="520" y1="140" x2="805" y2="140" stroke="#8A4B4B" strokeWidth="1" strokeDasharray="4 4"/>
                    <text
                      x="662" y="155"
                      fontFamily="JetBrains Mono"
                      fontSize="10"
                      fill="#8A4B4B"
                      textAnchor="middle"
                    >
                      Irregular R-R Interval Detected
                    </text>
                  </svg>
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="report-section mt-4 pt-6 border-t border-black/10 flex justify-between items-center" style={{ opacity: 0 }}>
                <span className="font-mono text-[10px] text-ink-muted opacity-60">VitalSense Diagnostic Report v2.4</span>
                <span className="font-mono text-[10px] text-ink-muted opacity-60">Page 1 of 1</span>
              </div>

            </div>
          </div>
        </section>
      </main>
    </motion.div>
  );
}
