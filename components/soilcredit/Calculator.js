'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator as CalcIcon, Leaf, Coins, TrendingUp, Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SOIL = [
  { v: 'sandy', label: 'Sandy' }, { v: 'loamy', label: 'Loamy' }, { v: 'clay', label: 'Clay' },
  { v: 'peat', label: 'Peat' }, { v: 'silty', label: 'Silty' },
];
const REGIONS = [
  { v: 'tropical', label: 'Tropical' }, { v: 'temperate', label: 'Temperate' },
  { v: 'boreal', label: 'Boreal' }, { v: 'arid', label: 'Arid' }, { v: 'mediterranean', label: 'Mediterranean' },
];
const FOREST = [
  { v: 'primary', label: 'Primary Forest' }, { v: 'secondary', label: 'Secondary Forest' },
  { v: 'plantation', label: 'Plantation' }, { v: 'agroforestry', label: 'Agroforestry' },
  { v: 'grassland', label: 'Grassland' }, { v: 'wetland', label: 'Wetland' },
];
const VEG = [
  { v: 'sparse', label: 'Sparse' }, { v: 'moderate', label: 'Moderate' },
  { v: 'dense', label: 'Dense' }, { v: 'veryDense', label: 'Very Dense' },
];

function Chip({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium border transition ${
            value === o.v ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200' : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-emerald-400/30 hover:text-white/90'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Calculator() {
  const [form, setForm] = useState({ area: 100, soil: 'loamy', region: 'tropical', forestType: 'primary', vegetation: 'dense' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const compute = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calculator', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      setResult(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <section id="calculator" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10"><div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" /><div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px]" /></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }} className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 mb-5"><CalcIcon className="h-3.5 w-3.5 text-emerald-300" /><span className="text-[11.5px] uppercase tracking-widest text-emerald-200/80 font-semibold">Live Carbon Calculator</span></div>
          <h2 className="font-display font-bold text-[38px] md:text-[54px] lg:text-[60px] leading-[1.02] tracking-tight"><span className="text-gradient">Estimate your land’s </span><span className="text-gradient-emerald">carbon revenue.</span></h2>
          <p className="mt-6 text-[16.5px] text-white/60 leading-relaxed max-w-2xl">IPCC Tier-1 approximation, cross-checked against Verra VM0042. Live-computed on our servers, saved to your account.</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-5 lg:gap-6">
          {/* Inputs */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="lg:col-span-2 rounded-3xl glass-strong p-7">
            <div className="flex items-center gap-2 mb-6"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center"><Sparkles className="h-4 w-4 text-white" /></div><span className="font-display font-semibold text-lg">Land Parameters</span></div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2"><label className="text-[13px] font-medium text-white/70">Land area</label><span className="text-[15px] font-semibold text-emerald-300 tabular-nums">{form.area.toLocaleString()} ha</span></div>
                <input type="range" min="5" max="10000" step="5" value={form.area} onChange={(e) => set('area', Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer accent-emerald-400"
                  style={{ background: `linear-gradient(to right, #34d399 0%, #10b981 ${(form.area/10000)*100}%, rgba(255,255,255,0.08) ${(form.area/10000)*100}%)` }} />
                <div className="flex justify-between text-[10.5px] text-white/40 mt-1.5"><span>5 ha</span><span>10,000 ha</span></div>
              </div>
              <div><label className="text-[13px] font-medium text-white/70 mb-2 block">Soil type</label><Chip options={SOIL} value={form.soil} onChange={(v) => set('soil', v)} /></div>
              <div><label className="text-[13px] font-medium text-white/70 mb-2 block">Region</label><Chip options={REGIONS} value={form.region} onChange={(v) => set('region', v)} /></div>
              <div><label className="text-[13px] font-medium text-white/70 mb-2 block">Forest / vegetation type</label><Chip options={FOREST} value={form.forestType} onChange={(v) => set('forestType', v)} /></div>
              <div><label className="text-[13px] font-medium text-white/70 mb-2 block">Vegetation density</label><Chip options={VEG} value={form.vegetation} onChange={(v) => set('vegetation', v)} /></div>
            </div>

            <button onClick={compute} disabled={loading} className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-[#04140D] px-5 py-3.5 text-[14.5px] font-semibold btn-glow disabled:opacity-70">
              {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Computing on satellite feed…</>) : (<>Calculate my carbon <ArrowRight className="h-4 w-4" strokeWidth={2.5} /></>)}
            </button>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="lg:col-span-3 rounded-3xl glass p-7 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2"><span className="font-display font-semibold text-lg">Estimated Impact</span><span className="text-[10.5px] uppercase tracking-widest text-emerald-400/80 font-semibold ml-2 px-2 py-0.5 rounded-full border border-emerald-400/30">Live</span></div>
                {result && <div className="flex items-center gap-1.5 text-[11.5px] text-emerald-400 font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Saved #{String(result.id).slice(0,8)}</div>}
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                <ResultCard icon={Leaf} label="Carbon / yr" value={result ? `${result.estimatedCarbonPerYear.toLocaleString()} tCO₂` : '—'} sub={result ? `${result.tenYearCarbon.toLocaleString()} t over 10y` : 'Adjust inputs to see'} />
                <ResultCard icon={Coins} label="Credits / yr" value={result ? result.creditsPerYear.toLocaleString(undefined, {maximumFractionDigits: 0}) : '—'} sub={result ? `@ $${result.creditPrice}/credit` : 'Verra-aligned'} />
                <ResultCard icon={TrendingUp} label="Income / yr" value={result ? `$${Math.round(result.annualIncomeUSD).toLocaleString()}` : '—'} sub={result ? `$${Math.round(result.tenYearIncomeUSD).toLocaleString()} over 10y` : 'Paid quarterly'} highlight />
              </div>

              <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] font-medium text-white/60">10-year cumulative income projection</span>
                  <span className="text-[11px] text-emerald-400/70">USD</span>
                </div>
                <div className="h-[220px]">
                  <AnimatePresence mode="wait">
                    <motion.div key={result ? 'has' : 'empty'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result?.projection || Array.from({length:10}, (_,i)=>({ year: 2025+i, income: 0 }))} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gArea" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0" stopColor="#34d399" stopOpacity={0.6} />
                              <stop offset="1" stopColor="#34d399" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                          <Tooltip contentStyle={{ background: '#062018', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 12, fontSize: 12 }} labelStyle={{ color: '#a7f3d0' }} formatter={(v) => [`$${Math.round(v).toLocaleString()}`, 'Cumulative income']} />
                          <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2.5} fill="url(#gArea)" isAnimationActive animationDuration={1200} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <p className="mt-4 text-[11.5px] text-white/40 leading-relaxed">Model assumes baseline 4.5 tCO₂/ha/year modulated by soil, region, forest and vegetation coefficients. Final on-ground yields typically vary ±20% and are calibrated per plot with satellite ground-truthing.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ icon: Icon, label, value, sub, highlight }) {
  return (
    <div className={`rounded-2xl p-4 border ${highlight ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-400/40' : 'bg-white/[0.03] border-white/10'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${highlight ? 'bg-emerald-400/30 border border-emerald-300/40' : 'bg-emerald-500/15 border border-emerald-400/25'}`}><Icon className="h-3.5 w-3.5 text-emerald-200" /></div>
        <span className="text-[11.5px] font-medium text-white/60">{label}</span>
      </div>
      <div className="font-display font-bold text-[22px] text-gradient-emerald tabular-nums leading-tight">{value}</div>
      <div className="text-[11px] text-white/40 mt-1">{sub}</div>
    </div>
  );
}
