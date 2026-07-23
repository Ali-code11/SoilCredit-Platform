'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import {
  Leaf, Satellite, Brain, Coins, ShieldCheck, Store, TrendingUp, ArrowRight, ArrowUpRight,
  Menu, X, Sparkles, Globe, LineChart, Radar, Zap, BarChart3, Activity, MapPin, ChevronDown,
  CheckCircle2, Play, Cpu, Layers, Bell
} from 'lucide-react';

/* ============================== NAVBAR ============================== */
const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'How It Works', href: '#how' },
  { label: 'Calculator', href: '#calculator' },
  { label: 'Marketplace', href: '#marketplace' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Contact', href: '#contact' },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('Home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}
      >
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-500`}>
          <div
            className={`flex items-center justify-between rounded-2xl transition-all duration-500 ${
              scrolled
                ? 'bg-[#04140D]/70 backdrop-blur-xl border border-emerald-500/15 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.25)] px-4 py-2.5'
                : 'bg-transparent border border-transparent px-2 py-2'
            }`}
          >
            {/* Logo */}
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

            {/* Center Links */}
            <nav className="hidden lg:flex items-center gap-1 relative">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.label}
                  onClick={() => { setActive(l.label); const el = document.querySelector(l.href); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                  className="relative px-3.5 py-2 text-[13.5px] font-medium text-white/70 hover:text-white transition-colors"
                >
                  {active === l.label && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-emerald-500/10 border border-emerald-400/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button className="hidden sm:inline-flex text-[13.5px] font-medium text-white/70 hover:text-white px-3.5 py-2 transition">
                Sign in
              </button>
              <button className="relative inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-[#04140D] px-4 py-2.5 text-[13.5px] font-semibold btn-glow transition-all hover:from-emerald-300 hover:to-emerald-500">
                Sign up
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <button onClick={() => setOpen(true)} className="lg:hidden ml-1 p-2 rounded-lg border border-white/10 bg-white/5">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-[#04140D]/85 backdrop-blur-xl" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 260 }}
              className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-gradient-to-b from-[#062018] to-[#04140D] border-l border-emerald-500/20 p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center">
                    <Leaf className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                  <span className="font-display font-bold text-lg">SoilCredit</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg border border-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((l, i) => (
                  <motion.button
                    key={l.label}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                    onClick={() => { setActive(l.label); setOpen(false); const el = document.querySelector(l.href); if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300); }}
                    className="text-left px-4 py-3 rounded-xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-400/20 text-white/80 hover:text-white transition"
                  >
                    {l.label}
                  </motion.button>
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

/* ============================== HERO ============================== */
function CounterStat({ end, suffix = '', label, sub, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => {
      const start = performance.now();
      const duration = 2000;
      const raf = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.floor(end * eased));
        if (p < 1) requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(t);
  }, [inView, end, delay]);

  return (
    <div ref={ref} className="flex flex-col">
      <div className="font-display font-bold text-2xl md:text-3xl text-gradient-emerald tabular-nums">
        {n.toLocaleString()}{suffix}
      </div>
      <div className="text-[13px] text-white/70 font-medium mt-1">{label}</div>
      {sub && <div className="text-[11px] text-emerald-400/70 mt-0.5">{sub}</div>}
    </div>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 800], [0, 220]);
  const yContent = useTransform(scrollY, [0, 600], [0, -60]);
  const opacityContent = useTransform(scrollY, [0, 500], [1, 0.4]);

  return (
    <section id="home" className="relative min-h-[100svh] pt-32 pb-24 overflow-hidden">
      {/* Backgrounds */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 radial-glow" />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 radial-glow-bottom" />
      </motion.div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-[100px] animate-float-slow -z-10" />
      <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-teal-500/15 blur-[100px] animate-float -z-10" />

      {/* Particles */}
      <Particles />

      <motion.div style={{ y: yContent, opacity: opacityContent }} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
              className="inline-flex items-center gap-2 rounded-full glass-strong px-3.5 py-1.5 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[12px] font-medium text-emerald-100/90 tracking-wide">Live · 4,821 hectares monitored today</span>
              <Sparkles className="h-3 w-3 text-emerald-300" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
              className="font-display font-bold text-[42px] sm:text-[56px] lg:text-[76px] leading-[0.95] tracking-tight"
            >
              <span className="text-gradient">Turn your land</span>
              <br />
              <span className="text-gradient">into </span>
              <span className="text-gradient-emerald relative">
                climate impact
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <motion.path
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1, duration: 1.4 }}
                    d="M2 8 C 60 2, 120 12, 180 6 S 280 3, 298 7" stroke="url(#g1)" strokeWidth="2.5" strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="g1" x1="0" x2="300">
                      <stop offset="0" stopColor="#34d399" stopOpacity="0" />
                      <stop offset="0.5" stopColor="#34d399" />
                      <stop offset="1" stopColor="#34d399" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
              className="mt-8 text-[17px] md:text-[19px] text-white/70 max-w-xl leading-relaxed"
            >
              SoilCredit fuses AI, satellite imagery and blockchain to measure, verify and monetize the carbon your soil already stores — connecting landowners directly with ESG investors worldwide.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.7 }}
              className="mt-9 flex flex-wrap gap-3.5"
            >
              <button className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-[#04140D] px-6 py-3.5 text-[15px] font-semibold btn-glow transition-all">
                Register your land
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </button>
              <button className="group inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/40 hover:bg-emerald-500/10 px-6 py-3.5 text-[15px] font-medium text-white transition-all backdrop-blur">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 border border-emerald-400/40">
                  <Play className="h-3 w-3 text-emerald-300 fill-emerald-300 ml-0.5" />
                </span>
                Watch how it works
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.7 }}
              className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10"
            >
              <CounterStat end={1284000} suffix="+" label="Trees protected" sub="across 6 continents" delay={200} />
              <CounterStat end={92} suffix="K tCO₂" label="Carbon captured" sub="verified on-chain" delay={300} />
              <CounterStat end={7420} suffix="" label="Registered lands" sub="and growing" delay={400} />
              <CounterStat end={430} suffix="+" label="ESG investors" sub="active this month" delay={500} />
            </motion.div>
          </div>

          {/* Right — Floating dashboard */}
          <div className="lg:col-span-5 relative h-[560px] hidden lg:block">
            <FloatingDashboard />
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-medium">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ChevronDown className="h-4 w-4 text-emerald-400/80" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function Particles() {
  const [pts, setPts] = useState([]);
  useEffect(() => {
    const arr = Array.from({ length: 28 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      d: 4 + Math.random() * 8,
      s: 4 + Math.random() * 6,
    }));
    setPts(arr);
  }, []);
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {pts.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-emerald-400/50"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.d, height: p.d }}
          animate={{ y: [0, -60, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: p.s, repeat: Infinity, delay: (i % 6) * 0.4, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function FloatingDashboard() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rx = useSpring(useTransform(mouseY, [-1, 1], [8, -8]), { stiffness: 150, damping: 20 });
  const ry = useSpring(useTransform(mouseX, [-1, 1], [-8, 8]), { stiffness: 150, damping: 20 });

  return (
    <div
      className="relative h-full w-full"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mouseX.set(((e.clientX - r.left) / r.width) * 2 - 1);
        mouseY.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
    >
      {/* Main satellite/globe card */}
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        className="absolute inset-x-0 top-8 mx-auto w-[380px] h-[400px] rounded-3xl glass-strong overflow-hidden shadow-[0_40px_100px_-20px_rgba(16,185,129,0.35)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest text-white/60 font-semibold">Land · #SC-2831</span>
          </div>
          <Radar className="h-4 w-4 text-emerald-400" />
        </div>

        {/* Globe visualisation */}
        <div className="relative h-[220px] flex items-center justify-center overflow-hidden">
          <div className="absolute h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-600/20 blur-3xl" />
          <div className="relative h-48 w-48">
            <motion.div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-spin-slow" />
            <motion.div className="absolute inset-3 rounded-full border border-emerald-400/20" style={{ animation: 'spin-slow 15s linear infinite reverse' }} />
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-emerald-500/40 via-emerald-700/30 to-[#04140D] border border-emerald-400/40 flex items-center justify-center overflow-hidden">
              <Globe className="h-16 w-16 text-emerald-300/90" strokeWidth={1.2} />
              <div className="absolute inset-0 grid-bg opacity-40" />
            </div>
            {/* Orbiting dots */}
            {[0, 120, 240].map((deg, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 12 + i * 3, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: 'center' }}
              >
                <div
                  className="absolute h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
                  style={{ top: '50%', left: '50%', transform: `rotate(${deg}deg) translateX(96px) translateY(-50%)` }}
                />
              </motion.div>
            ))}
            <div className="absolute -inset-1 rounded-full animate-pulse-ring border border-emerald-400/40" />
          </div>
        </div>

        {/* Data rows */}
        <div className="px-5 pt-3 pb-4 space-y-2.5">
          {[
            { k: 'Soil carbon', v: '128.4 tCO₂', pct: 78 },
            { k: 'NDVI index', v: '0.812', pct: 92 },
            { k: 'Verified credits', v: '1,240', pct: 65 },
          ].map((r, i) => (
            <motion.div
              key={r.k}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.15, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <span className="text-[11px] text-white/50 font-medium w-24">{r.k}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ delay: 1.2 + i * 0.15, duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                />
              </div>
              <span className="text-[11.5px] font-semibold text-emerald-300 tabular-nums w-16 text-right">{r.v}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating price card */}
      <motion.div
        initial={{ opacity: 0, y: 40, x: -30 }} animate={{ opacity: 1, y: 0, x: 0 }} transition={{ delay: 0.9, duration: 0.8 }}
        className="absolute -left-6 top-4 animate-float"
      >
        <div className="glass rounded-2xl px-4 py-3.5 shadow-2xl min-w-[190px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Coins className="h-3.5 w-3.5 text-emerald-300" />
            </div>
            <span className="text-[11px] text-white/60 font-medium">Credit price</span>
          </div>
          <div className="font-display font-bold text-2xl text-gradient-emerald tabular-nums">$42.80</div>
          <div className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +18.2% this quarter
          </div>
        </div>
      </motion.div>

      {/* Floating verified card */}
      <motion.div
        initial={{ opacity: 0, y: -40, x: 30 }} animate={{ opacity: 1, y: 0, x: 0 }} transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute -right-2 bottom-16 animate-float-slow"
      >
        <div className="glass rounded-2xl px-4 py-3.5 shadow-2xl min-w-[210px]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
            </div>
            <div>
              <div className="text-[11px] text-white/60 font-medium">Verified on-chain</div>
              <div className="font-semibold text-[13.5px]">Block #4,821,204</div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-emerald-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Audited by Verra · Gold
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================== HOW IT WORKS ============================== */
const STEPS = [
  { icon: MapPin, title: 'Land Registration', desc: 'Onboard your parcel in minutes — draw boundaries, upload deeds, choose forest type.', tag: 'Step 01' },
  { icon: Satellite, title: 'Satellite Data Collection', desc: 'Sentinel-2 & Landsat imagery streams into your plot every 5 days. Hyperspectral, LiDAR ready.', tag: 'Step 02' },
  { icon: Brain, title: 'AI Analysis', desc: 'Our multimodal model computes NDVI, biomass, moisture and soil organic carbon with 96% accuracy.', tag: 'Step 03' },
  { icon: Leaf, title: 'Carbon Estimation', desc: 'Get verified tCO₂e estimates aligned with Verra VM0042, Gold Standard and ISO 14064-2.', tag: 'Step 04' },
  { icon: ShieldCheck, title: 'Blockchain Verification', desc: 'Each credit is minted as an immutable NFT with cryptographic proof of measurement.', tag: 'Step 05' },
  { icon: Store, title: 'ESG Marketplace', desc: 'List credits directly to institutional buyers, ESG funds and net-zero corporates.', tag: 'Step 06' },
  { icon: TrendingUp, title: 'Revenue Generation', desc: 'Automated settlements. Get paid quarterly. Track earnings in your climate dashboard.', tag: 'Step 07' },
];

function HowItWorks() {
  return (
    <section id="how" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 radial-glow opacity-60" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
          className="max-w-3xl mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 mb-5">
            <Layers className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[11.5px] uppercase tracking-widest text-emerald-200/80 font-semibold">The Workflow</span>
          </div>
          <h2 className="font-display font-bold text-[38px] md:text-[54px] lg:text-[62px] leading-[1.02] tracking-tight text-gradient">
            From soil to settlement,<br />
            <span className="text-gradient-emerald">in seven verified steps.</span>
          </h2>
          <p className="mt-6 text-[17px] text-white/60 leading-relaxed max-w-2xl">
            A vertically integrated pipeline — from raw satellite pixels to on-chain credits ready for institutional buyers. Every step is auditable, automatic and aligned with global carbon standards.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical connector */}
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-px -translate-x-1/2 hidden sm:block">
            <div className="h-full w-px bg-gradient-to-b from-emerald-400/0 via-emerald-400/40 to-emerald-400/0" />
            <motion.div
              initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 2.4, ease: 'easeOut' }}
              style={{ transformOrigin: 'top' }}
              className="absolute inset-0 w-px bg-gradient-to-b from-emerald-400 via-emerald-300 to-emerald-400/0 shadow-[0_0_20px_rgba(52,211,153,0.5)]"
            />
          </div>

          <div className="space-y-8 md:space-y-14">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.7, delay: i * 0.05 }}
                  className={`relative grid md:grid-cols-2 items-center gap-6 ${left ? '' : 'md:[&>div:first-child]:order-2'}`}
                >
                  {/* Card side */}
                  <div className={`${left ? 'md:pr-14 md:text-right' : 'md:pl-14'} pl-16 sm:pl-20 md:pl-0`}>
                    <div className="feature-card rounded-2xl glass p-6 sm:p-7 hover:bg-white/[0.04] transition">
                      <div className={`flex items-center gap-3 mb-3 ${left ? 'md:justify-end' : ''}`}>
                        <span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-emerald-400/80">{s.tag}</span>
                      </div>
                      <h3 className="font-display font-bold text-2xl md:text-[26px] tracking-tight mb-2 text-gradient">{s.title}</h3>
                      <p className="text-[15px] text-white/60 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>

                  {/* Node */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-2xl bg-emerald-400/30 blur-xl" />
                      <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(52,211,153,0.7)] border border-emerald-300/40">
                        <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
                      </div>
                    </div>
                  </div>

                  {/* Empty side placeholder */}
                  <div className="hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== FEATURES ============================== */
const FEATURES = [
  { icon: Brain, title: 'AI Analysis', desc: 'Multimodal foundation models classify vegetation, estimate biomass and predict sequestration trajectories.', color: 'from-emerald-400 to-teal-500' },
  { icon: Satellite, title: 'Satellite Monitoring', desc: 'Sentinel, Landsat & Planet data ingested every 5 days. 10m resolution. Cloud-masked, atmosphere-corrected.', color: 'from-cyan-400 to-emerald-500' },
  { icon: ShieldCheck, title: 'Blockchain Security', desc: 'Immutable proofs on a low-carbon L2. Each credit is an NFT with cryptographic provenance.', color: 'from-emerald-500 to-lime-500' },
  { icon: Store, title: 'Credit Marketplace', desc: 'Peer-to-peer, gasless. Sell to funds, corporates or aggregators. Instant settlement in USDC.', color: 'from-teal-400 to-emerald-600' },
  { icon: LineChart, title: 'Investment Platform', desc: 'For ESG funds. Portfolio construction, screening, real-time impact reporting and Verra-mapped scoring.', color: 'from-emerald-400 to-green-500' },
  { icon: Activity, title: 'Climate Dashboard', desc: 'One pane of glass. Track your land health, credit balance, revenue and impact narrative.', color: 'from-lime-400 to-emerald-500' },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Time-series decomposition, cohort views and predictive forecasts on your soil carbon curve.', color: 'from-emerald-500 to-teal-600' },
  { icon: Zap, title: 'Real-Time Monitoring', desc: 'Alerts on deforestation, drought stress, illegal activity — pushed to your phone within minutes.', color: 'from-amber-400 to-emerald-500' },
];

function Features() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 mb-5">
              <Cpu className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-[11.5px] uppercase tracking-widest text-emerald-200/80 font-semibold">Platform Capabilities</span>
            </div>
            <h2 className="font-display font-bold text-[38px] md:text-[52px] lg:text-[58px] leading-[1.02] tracking-tight">
              <span className="text-gradient">Everything you need to measure,</span>{' '}
              <span className="text-gradient-emerald">verify and sell carbon.</span>
            </h2>
          </div>
          <p className="text-[15.5px] text-white/60 max-w-sm leading-relaxed">
            A modular stack built for landowners, funds and climate scientists. Enterprise-grade infrastructure, consumer-grade UX.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
                className="feature-card group relative rounded-2xl glass p-6 h-full cursor-pointer overflow-hidden"
              >
                <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />
                <div className={`relative h-11 w-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-[0_8px_24px_-6px_rgba(52,211,153,0.4)]`}>
                  <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
                </div>
                <h3 className="font-display font-semibold text-[17px] tracking-tight mb-2 text-white">{f.title}</h3>
                <p className="text-[13.5px] text-white/55 leading-relaxed">{f.desc}</p>
                <div className="relative mt-5 flex items-center gap-1.5 text-[12px] font-medium text-emerald-400/0 group-hover:text-emerald-400 transition-colors">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================== FOOTER (mini) ============================== */
function MiniFooter() {
  return (
    <footer id="contact" className="relative border-t border-white/5 pt-20 pb-10 overflow-hidden">
      <div className="absolute inset-0 -z-10 radial-glow-bottom" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 mb-5">
              <Bell className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-[11.5px] uppercase tracking-widest text-emerald-200/80 font-semibold">Coming Next</span>
            </div>
            <h3 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-gradient mb-3">
              Calculator · Marketplace · Live Map
            </h3>
            <p className="text-white/60 max-w-md leading-relaxed">This is Phase 1. In Phase 2 we ship the interactive carbon calculator, marketplace, dashboard preview, world map, testimonials and full contact form.</p>
          </div>
          <div className="flex md:justify-end">
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-[#04140D] px-6 py-3.5 text-[15px] font-semibold btn-glow">
              Get early access <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg">SoilCredit</span>
            <span className="text-white/40 text-[13px] ml-2">© 2025 · All rights reserved</span>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-white/50">
            <a href="#" className="hover:text-emerald-300 transition">Privacy</a>
            <a href="#" className="hover:text-emerald-300 transition">Terms</a>
            <a href="#" className="hover:text-emerald-300 transition">Security</a>
            <a href="#" className="hover:text-emerald-300 transition">Careers</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================== PAGE ============================== */
function App() {
  return (
    <main className="relative bg-[#04140D] text-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <MiniFooter />
    </main>
  );
}

export default App;
