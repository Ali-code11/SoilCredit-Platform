'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ArrowRight, Leaf, Coins, TrendingUp, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLang } from '@/lib/providers';

function Chip({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([v, label]) => (
        <button key={v} type="button" onClick={() => onChange(v)}
          className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium border transition ${value === v ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

export default function Calculator() {
  const { t } = useLang();
  const [form, setForm] = useState({ area: 100, soil: 'loamy', region: 'caspian', forestType: 'primary', vegetation: 'dense' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const compute = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/calculator', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await r.json(); setResult(d);
    } catch {} setLoading(false);
  };

  const soilOpts = Object.entries(t('calc.soils') || {});
  const regionOpts = Object.entries(t('calc.regions') || {});
  const forestOpts = Object.entries(t('calc.forests') || {});
  const vegOpts = Object.entries(t('calc.vegs') || {});

  return (
    <section id="calculator" className="relative py-24 md:py-32 bg-gradient-to-b from-slate-50/60 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-12">
          <span className="chip mb-4">{t('calc.tag')}</span>
          <h2 className="font-display font-bold text-[34px] md:text-[52px] leading-[1.05] tracking-tight"><span className="text-gradient-bg">{t('calc.title')}</span></h2>
          <p className="mt-5 text-slate-600 text-[16px] leading-relaxed">{t('calc.subtitle')}</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 card-soft p-6 md:p-7">
            <div className="flex items-center gap-2 mb-6"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center"><Sparkles className="h-4 w-4 text-white" /></div><span className="font-display font-semibold text-lg text-slate-900">Parameters</span></div>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2"><label className="text-[13px] font-medium text-slate-600">{t('calc.area')}</label><span className="text-[15px] font-semibold text-blue-600 tabular-nums">{form.area.toLocaleString()} ha</span></div>
                <input type="range" min="5" max="10000" step="5" value={form.area} onChange={(e) => set('area', Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #2563eb 0%, #10b981 ${(form.area/10000)*100}%, #e2e8f0 ${(form.area/10000)*100}%)` }} />
              </div>
              <div><label className="text-[13px] font-medium text-slate-600 mb-2 block">{t('calc.soil')}</label><Chip options={soilOpts} value={form.soil} onChange={(v) => set('soil', v)} /></div>
              <div><label className="text-[13px] font-medium text-slate-600 mb-2 block">{t('calc.region')}</label><Chip options={regionOpts} value={form.region} onChange={(v) => set('region', v)} /></div>
              <div><label className="text-[13px] font-medium text-slate-600 mb-2 block">{t('calc.forest')}</label><Chip options={forestOpts} value={form.forestType} onChange={(v) => set('forestType', v)} /></div>
              <div><label className="text-[13px] font-medium text-slate-600 mb-2 block">{t('calc.vegetation')}</label><Chip options={vegOpts} value={form.vegetation} onChange={(v) => set('vegetation', v)} /></div>
            </div>
            <button onClick={compute} disabled={loading} className="mt-6 w-full btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[14.5px] font-semibold disabled:opacity-70">
              {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> {t('calc.computing')}</>) : (<>{t('calc.compute')} <ArrowRight className="h-4 w-4" strokeWidth={2.5} /></>)}
            </button>
          </div>

          <div className="lg:col-span-3 card-soft p-6 md:p-7 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-blue-100/60 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2"><span className="font-display font-semibold text-lg text-slate-900">Estimated Impact</span><span className="text-[10.5px] uppercase tracking-widest text-emerald-600 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">Live</span></div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 mb-5">
                <ResultCard icon={Leaf} label={t('calc.carbonYr')} value={result ? `${result.estimatedCarbonPerYear.toLocaleString()} tCO₂` : '—'} sub={result ? `${result.tenYearCarbon.toLocaleString()} t / 10y` : t('calc.empty')} />
                <ResultCard icon={Coins} label={t('calc.creditsYr')} value={result ? Math.round(result.creditsPerYear).toLocaleString() : '—'} sub={result ? `@ $${result.creditPrice}` : 'Verra-aligned'} />
                <ResultCard icon={TrendingUp} label={t('calc.incomeYr')} value={result ? `$${Math.round(result.annualIncomeUSD).toLocaleString()}` : '—'} sub={result ? `$${Math.round(result.tenYearIncomeUSD).toLocaleString()} / 10y` : 'Paid quarterly'} highlight />
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium text-slate-600">{t('calc.projection')}</span>
                  <span className="text-[11px] text-slate-400">USD</span>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result?.projection || Array.from({length:10}, (_,i)=>({ year: 2025+i, income: 0 }))} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs><linearGradient id="gA" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2563eb" stopOpacity={0.5} /><stop offset="1" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                      <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12, boxShadow: '0 8px 24px -8px rgba(15,23,42,0.15)' }} formatter={(v) => [`$${Math.round(v).toLocaleString()}`, 'Income']} />
                      <Area type="monotone" dataKey="income" stroke="#2563eb" strokeWidth={2.5} fill="url(#gA)" isAnimationActive animationDuration={1200} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ icon: Icon, label, value, sub, highlight }) {
  return (
    <div className={`rounded-2xl p-4 border ${highlight ? 'bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-200' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${highlight ? 'bg-gradient-to-br from-blue-500 to-emerald-500 text-white' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}><Icon className="h-3.5 w-3.5" /></div>
        <span className="text-[11.5px] font-medium text-slate-600">{label}</span>
      </div>
      <div className="font-display font-bold text-[22px] tabular-nums leading-tight text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-500 mt-1">{sub}</div>
    </div>
  );
}
