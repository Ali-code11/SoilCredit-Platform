'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Play, ChevronDown, Sparkles, Radar, Globe, Coins, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';

function CounterStat({ end, suffix = '', label, sub, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => {
      const start = performance.now(); const duration = 2000;
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
      <div className="font-display font-bold text-2xl md:text-3xl text-gradient-emerald tabular-nums">{n.toLocaleString()}{suffix}</div>
      <div className="text-[13px] text-white/70 font-medium mt-1">{label}</div>
      {sub && <div className="text-[11px] text-emerald-400/70 mt-0.5">{sub}</div>}
    </div>
  );
}

function Particles() {
  const [pts, setPts] = useState([]);
  useEffect(() => {
    setPts(Array.from({ length: 28 }, () => ({ x: Math.random()*100, y: Math.random()*100, d: 4+Math.random()*8, s: 4+Math.random()*6 })));
  }, []);
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {pts.map((p, i) => (
        <motion.span key={i} className="absolute rounded-full bg-emerald-400/50"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.d, height: p.d }}
          animate={{ y: [0, -60, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: p.s, repeat: Infinity, delay: (i % 6) * 0.4, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

function FloatingDashboard() {
  const mx = useMotionValue(0); const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 150, damping: 20 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 150, damping: 20 });
  return (
    <div className="relative h-full w-full" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set(((e.clientX-r.left)/r.width)*2-1); my.set(((e.clientY-r.top)/r.height)*2-1); }} onMouseLeave={() => { mx.set(0); my.set(0); }}>
      <motion.div style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
        initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }}
        className="absolute inset-x-0 top-8 mx-auto w-[380px] h-[400px] rounded-3xl glass-strong overflow-hidden shadow-[0_40px_100px_-20px_rgba(16,185,129,0.35)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[11px] uppercase tracking-widest text-white/60 font-semibold">Land · #SC-2831</span></div>
          <Radar className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="relative h-[220px] flex items-center justify-center overflow-hidden">
          <div className="absolute h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-600/20 blur-3xl" />
          <div className="relative h-48 w-48">
            <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-spin-slow" />
            <div className="absolute inset-3 rounded-full border border-emerald-400/20" style={{ animation: 'spin-slow 15s linear infinite reverse' }} />
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-emerald-500/40 via-emerald-700/30 to-[#04140D] border border-emerald-400/40 flex items-center justify-center overflow-hidden">
              <Globe className="h-16 w-16 text-emerald-300/90" strokeWidth={1.2} />
              <div className="absolute inset-0 grid-bg opacity-40" />
            </div>
            {[0,120,240].map((deg,i) => (
              <motion.div key={i} className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 12+i*3, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: 'center' }}>
                <div className="absolute h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" style={{ top: '50%', left: '50%', transform: `rotate(${deg}deg) translateX(96px) translateY(-50%)` }} />
              </motion.div>
            ))}
            <div className="absolute -inset-1 rounded-full animate-pulse-ring border border-emerald-400/40" />
          </div>
        </div>
        <div className="px-5 pt-3 pb-4 space-y-2.5">
          {[{ k: 'Soil carbon', v: '128.4 tCO₂', pct: 78 }, { k: 'NDVI index', v: '0.812', pct: 92 }, { k: 'Verified credits', v: '1,240', pct: 65 }].map((r, i) => (
            <motion.div key={r.k} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i*0.15 }} className="flex items-center gap-3">
              <span className="text-[11px] text-white/50 font-medium w-24">{r.k}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ delay: 1.2+i*0.15, duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" />
              </div>
              <span className="text-[11.5px] font-semibold text-emerald-300 tabular-nums w-16 text-right">{r.v}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 40, x: -30 }} animate={{ opacity: 1, y: 0, x: 0 }} transition={{ delay: 0.9 }} className="absolute -left-6 top-4 animate-float">
        <div className="glass rounded-2xl px-4 py-3.5 shadow-2xl min-w-[190px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center"><Coins className="h-3.5 w-3.5 text-emerald-300" /></div>
            <span className="text-[11px] text-white/60 font-medium">Credit price</span>
          </div>
          <div className="font-display font-bold text-2xl text-gradient-emerald tabular-nums">$42.80</div>
          <div className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +18.2% this quarter</div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: -40, x: 30 }} animate={{ opacity: 1, y: 0, x: 0 }} transition={{ delay: 1.1 }} className="absolute -right-2 bottom-16 animate-float-slow">
        <div className="glass rounded-2xl px-4 py-3.5 shadow-2xl min-w-[210px]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center"><ShieldCheck className="h-4 w-4 text-emerald-300" /></div>
            <div><div className="text-[11px] text-white/60 font-medium">Verified on-chain</div><div className="font-semibold text-[13.5px]">Block #4,821,204</div></div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-emerald-400 font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Audited by Verra · Gold</div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 800], [0, 220]);
  const yContent = useTransform(scrollY, [0, 600], [0, -60]);
  const opacityContent = useTransform(scrollY, [0, 500], [1, 0.4]);
  return (
    <section id="home" className="relative min-h-[100svh] pt-32 pb-24 overflow-hidden">
      <motion.div style={{ y: yBg }} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 radial-glow" />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 radial-glow-bottom" />
      </motion.div>
      <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-[100px] animate-float-slow -z-10" />
      <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-teal-500/15 blur-[100px] animate-float -z-10" />
      <Particles />
      <motion.div style={{ y: yContent, opacity: opacityContent }} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 rounded-full glass-strong px-3.5 py-1.5 mb-6">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" /></span>
              <span className="text-[12px] font-medium text-emerald-100/90 tracking-wide">Live · 4,821 hectares monitored today</span>
              <Sparkles className="h-3 w-3 text-emerald-300" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
              className="font-display font-bold text-[42px] sm:text-[56px] lg:text-[76px] leading-[0.95] tracking-tight">
              <span className="text-gradient">Turn your land</span><br />
              <span className="text-gradient">into </span>
              <span className="text-gradient-emerald relative">climate impact
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1, duration: 1.4 }}
                    d="M2 8 C 60 2, 120 12, 180 6 S 280 3, 298 7" stroke="url(#g1)" strokeWidth="2.5" strokeLinecap="round" />
                  <defs><linearGradient id="g1" x1="0" x2="300"><stop offset="0" stopColor="#34d399" stopOpacity="0" /><stop offset="0.5" stopColor="#34d399" /><stop offset="1" stopColor="#34d399" stopOpacity="0" /></linearGradient></defs>
                </svg>
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 text-[17px] md:text-[19px] text-white/70 max-w-xl leading-relaxed">
              SoilCredit fuses AI, satellite imagery and blockchain to measure, verify and monetize the carbon your soil already stores — connecting landowners directly with ESG investors worldwide.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-9 flex flex-wrap gap-3.5">
              <a href="#calculator" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-[#04140D] px-6 py-3.5 text-[15px] font-semibold btn-glow transition-all">Register your land<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} /></a>
              <a href="#how" className="group inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/40 hover:bg-emerald-500/10 px-6 py-3.5 text-[15px] font-medium text-white transition-all backdrop-blur">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 border border-emerald-400/40"><Play className="h-3 w-3 text-emerald-300 fill-emerald-300 ml-0.5" /></span>Watch how it works
              </a>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10">
              <CounterStat end={1284000} suffix="+" label="Trees protected" sub="across 6 continents" delay={200} />
              <CounterStat end={92} suffix="K tCO₂" label="Carbon captured" sub="verified on-chain" delay={300} />
              <CounterStat end={7420} suffix="" label="Registered lands" sub="and growing" delay={400} />
              <CounterStat end={430} suffix="+" label="ESG investors" sub="active this month" delay={500} />
            </motion.div>
          </div>
          <div className="lg:col-span-5 relative h-[560px] hidden lg:block"><FloatingDashboard /></div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-medium">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}><ChevronDown className="h-4 w-4 text-emerald-400/80" /></motion.div>
      </motion.div>
    </section>
  );
}
