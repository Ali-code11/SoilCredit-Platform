'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Globe2 } from 'lucide-react';

const MARKERS = [
  { id: 'AMZ', name: 'Amazon Basin', country: 'Brazil', x: 32, y: 62, plots: 1284, tCO2: 42800 },
  { id: 'CNG', name: 'Congo Basin', country: 'DRC', x: 54, y: 58, plots: 640, tCO2: 21300 },
  { id: 'BRN', name: 'Borneo', country: 'Indonesia', x: 76, y: 60, plots: 512, tCO2: 18900 },
  { id: 'SND', name: 'Sundarbans', country: 'Bangladesh', x: 70, y: 46, plots: 210, tCO2: 8600 },
  { id: 'KEN', name: 'Kenyan Highlands', country: 'Kenya', x: 57, y: 60, plots: 380, tCO2: 12100 },
  { id: 'FIN', name: 'Karelia Peatlands', country: 'Finland', x: 55, y: 20, plots: 180, tCO2: 15200 },
  { id: 'CAN', name: 'Boreal Forest', country: 'Canada', x: 22, y: 25, plots: 420, tCO2: 19400 },
  { id: 'ARG', name: 'Patagonian Steppe', country: 'Argentina', x: 32, y: 82, plots: 160, tCO2: 5100 },
  { id: 'AUS', name: 'Great Southern', country: 'Australia', x: 84, y: 78, plots: 240, tCO2: 6800 },
  { id: 'PER', name: 'Andean Cloud Forest', country: 'Peru', x: 29, y: 65, plots: 190, tCO2: 7200 },
];

export default function MapSection() {
  const [hover, setHover] = useState(null);
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10"><div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-emerald-500/10 blur-[120px]" /></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }} className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 mb-5"><Globe2 className="h-3.5 w-3.5 text-emerald-300" /><span className="text-[11.5px] uppercase tracking-widest text-emerald-200/80 font-semibold">Global Reach</span></div>
          <h2 className="font-display font-bold text-[38px] md:text-[54px] leading-[1.02] tracking-tight"><span className="text-gradient">Protecting </span><span className="text-gradient-emerald">4,236 plots in 42 countries.</span></h2>
          <p className="mt-6 text-[16.5px] text-white/60 leading-relaxed max-w-2xl">Hover any node to see live plot statistics. Every marker is a real, verified partnership pushing measurable carbon to the atmosphere account.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}
          className="relative rounded-3xl glass-strong overflow-hidden aspect-[16/9] shadow-[0_40px_100px_-20px_rgba(16,185,129,0.25)]">
          <div className="absolute inset-0 grid-bg opacity-40" />
          {/* Stylised world silhouette using SVG blobs */}
          <svg viewBox="0 0 100 55" preserveAspectRatio="none" className="absolute inset-0 w-full h-full text-emerald-400/25">
            {/* North America */}
            <path d="M6 12 Q10 6 18 8 L28 10 Q30 14 26 20 L20 24 Q14 26 10 22 Q6 18 6 12 Z" fill="currentColor" stroke="rgba(52,211,153,0.4)" strokeWidth="0.15" />
            {/* South America */}
            <path d="M22 32 Q26 30 30 34 Q34 42 32 50 Q28 54 24 50 Q20 42 22 32 Z" fill="currentColor" stroke="rgba(52,211,153,0.4)" strokeWidth="0.15" />
            {/* Europe */}
            <path d="M46 10 Q50 6 56 10 Q60 14 56 18 Q50 20 46 16 Z" fill="currentColor" stroke="rgba(52,211,153,0.4)" strokeWidth="0.15" />
            {/* Africa */}
            <path d="M48 22 Q54 20 58 26 Q60 36 56 44 Q52 50 48 44 Q46 34 48 22 Z" fill="currentColor" stroke="rgba(52,211,153,0.4)" strokeWidth="0.15" />
            {/* Asia */}
            <path d="M58 8 Q70 6 82 12 Q84 22 78 28 Q70 32 62 26 Q58 18 58 8 Z" fill="currentColor" stroke="rgba(52,211,153,0.4)" strokeWidth="0.15" />
            {/* Southeast Asia */}
            <path d="M72 32 Q78 32 80 36 Q78 40 74 38 Q70 36 72 32 Z" fill="currentColor" stroke="rgba(52,211,153,0.4)" strokeWidth="0.15" />
            {/* Australia */}
            <path d="M78 42 Q86 40 90 46 Q86 50 80 48 Q76 46 78 42 Z" fill="currentColor" stroke="rgba(52,211,153,0.4)" strokeWidth="0.15" />
          </svg>

          {/* Markers */}
          {MARKERS.map((m, i) => (
            <motion.button key={m.id} initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 260 }}
              onMouseEnter={() => setHover(m)} onMouseLeave={() => setHover(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
              <span className="absolute inset-0 rounded-full bg-emerald-400/60 animate-pulse-ring" />
              <span className="relative block h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)] border border-white/40" />
            </motion.button>
          ))}

          {/* Hover popup */}
          <AnimatePresence>
            {hover && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute pointer-events-none glass-strong rounded-xl px-4 py-3 shadow-2xl min-w-[200px]"
                style={{ left: `${hover.x}%`, top: `${hover.y}%`, transform: 'translate(-50%, calc(-100% - 20px))' }}>
                <div className="flex items-center gap-2 mb-1"><MapPin className="h-3.5 w-3.5 text-emerald-300" /><span className="font-semibold text-[13px]">{hover.name}</span></div>
                <div className="text-[11px] text-white/50 mb-2">{hover.country}</div>
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
                  <div><div className="text-[10px] uppercase text-white/40 tracking-widest">Plots</div><div className="font-display font-bold text-emerald-300 tabular-nums">{hover.plots}</div></div>
                  <div><div className="text-[10px] uppercase text-white/40 tracking-widest">tCO₂</div><div className="font-display font-bold text-emerald-300 tabular-nums">{hover.tCO2.toLocaleString()}</div></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" /><span className="text-white/60">Active plot</span></div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400/40" /><span className="text-white/40">Region cluster</span></div>
          </div>
          <div className="absolute top-4 right-4 rounded-lg glass px-3 py-1.5"><div className="text-[10px] uppercase tracking-widest text-white/40">Live monitoring</div><div className="font-display font-bold text-sm text-emerald-300">4,236 plots · 42 countries</div></div>
        </motion.div>
      </div>
    </section>
  );
}
