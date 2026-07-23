'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Menu, X, ArrowUpRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'How It Works', href: '#how' },
  { label: 'Calculator', href: '#calculator' },
  { label: 'Marketplace', href: '#marketplace' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('Home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const opts = { rootMargin: '-40% 0px -55% 0px' };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          const link = NAV_LINKS.find((l) => l.href === '#' + id);
          if (link) setActive(link.label);
        }
      });
    }, opts);
    NAV_LINKS.forEach((l) => { const el = document.querySelector(l.href); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between rounded-2xl transition-all duration-500 ${
              scrolled ? 'bg-[#04140D]/70 backdrop-blur-xl border border-emerald-500/15 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.25)] px-4 py-2.5' : 'bg-transparent border border-transparent px-2 py-2'
            }`}>
            <a href="#home" className="flex items-center gap-2.5 group">
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden">
                <Leaf className="h-5 w-5 text-white relative z-10" strokeWidth={2.5} />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-[17px] tracking-tight">SoilCredit</span>
                <span className="text-[9px] uppercase tracking-[0.18em] text-emerald-400/80 font-medium">Climate · AI · Earth</span>
              </div>
            </a>

            <nav className="hidden lg:flex items-center gap-1 relative">
              {NAV_LINKS.map((l) => (
                <button key={l.label}
                  onClick={() => { setActive(l.label); const el = document.querySelector(l.href); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                  className="relative px-3.5 py-2 text-[13.5px] font-medium text-white/70 hover:text-white transition-colors">
                  {active === l.label && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg bg-emerald-500/10 border border-emerald-400/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button className="hidden sm:inline-flex text-[13.5px] font-medium text-white/70 hover:text-white px-3.5 py-2 transition">Sign in</button>
              <button className="relative inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-[#04140D] px-4 py-2.5 text-[13.5px] font-semibold btn-glow transition-all hover:from-emerald-300 hover:to-emerald-500">
                Sign up<ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <button onClick={() => setOpen(true)} className="lg:hidden ml-1 p-2 rounded-lg border border-white/10 bg-white/5"><Menu className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-[#04140D]/85 backdrop-blur-xl" onClick={() => setOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 260 }}
              className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-gradient-to-b from-[#062018] to-[#04140D] border-l border-emerald-500/20 p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center"><Leaf className="h-4 w-4" strokeWidth={2.5} /></div>
                  <span className="font-display font-bold text-lg">SoilCredit</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg border border-white/10"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((l, i) => (
                  <motion.button key={l.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                    onClick={() => { setActive(l.label); setOpen(false); const el = document.querySelector(l.href); if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300); }}
                    className="text-left px-4 py-3 rounded-xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-400/20 text-white/80 hover:text-white transition">{l.label}</motion.button>
                ))}
                <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
                  <button className="w-full px-4 py-3 rounded-xl border border-white/10 text-white/80">Sign in</button>
                  <button className="w-full px-4 py-3 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-[#04140D] font-semibold btn-glow">Sign up</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
