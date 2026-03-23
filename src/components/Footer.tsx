import { motion } from 'framer-motion';
import { footerLinks } from '../data/mockData';

export default function Footer() {
  return (
    <footer className="pt-20 pb-10 px-8 border-t border-black/5 bg-cream">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-main">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span className="font-serif text-xl font-medium tracking-tight text-ink-main">VitalSense</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed max-w-[200px]">
              The clinical intelligence platform designed for focus and clarity.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-ink-main mb-4 font-bold">{category}</h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      className="text-sm text-ink-muted hover:text-ink-main transition-colors"
                      whileHover={{ x: 2 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-black/5 pt-8">
          <p className="font-mono text-[11px] text-ink-muted">© 2025 VitalSense, Inc. All rights reserved.</p>
          <p className="font-mono text-[11px] text-ink-muted">Built for the future of clinical care.</p>
        </div>
      </div>
    </footer>
  );
}
