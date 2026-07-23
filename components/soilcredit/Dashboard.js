'use client';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, Bell, Activity, Leaf, ArrowUpRight, Layers, Radar as RadarIcon } from 'lucide-react';

const SPARK = Array.from({ length: 20 }, (_, i) => ({ x: i, y: 40 + Math.sin(i / 2) * 15 + i * 2 + Math.random() * 8 }));
const BAR = [
  { m: 'Jan', v: 320 }, { m: 'Feb', v: 410 }, { m: 'Mar', v: 380 }, { m: 'Apr', v: 520 },
  { m: 'May', v: 610 }, { m: 'Jun', v: 580 }, { m: 'Jul', v: 720 }, { m: 'Aug', v: 780 },
];
const PIE = [
  { n: 'Rainforest', v: 42, c: '#34d399' },
  { n: 'Grassland', v: 22, c: '#10b981' },
  { n: 'Peatland', v: 18, c: '#059669' },
  { n: 'Mangrove', v: 12, c: '#6ee7b7' },
  { n: 'Other', v: 6, c: '#a7f3d0' },
];
const ACTIVITY = [
  { time: '2m ago', text: 'Credits #4821-4834 minted on-chain', type: 'mint' },
  { time: '18m ago', text: 'Verra audit passed for Plot #SC-2831', type: 'audit' },
  { time: '1h ago', text: 'Payment of $12,840 settled to your wallet', type: 'payment' },
  { time: '3h ago', text: 'Satellite pass over Amazonian Corridor — NDVI +0.04', type: 'sat' },
  { time: '8h ago', text: 'New buyer inquiry from Blackrock ESG Fund', type: 'buyer' },
];

export default function Dashboard() {
  return (
    <section id="dashboard" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10"><div className="absolute inset-0 grid-bg opacity-30" /></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }} className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 mb-5"><Activity className="h-3.5 w-3.5 text-emerald-300" /><span className="text-[11.5px] uppercase tracking-widest text-emerald-200/80 font-semibold">Dashboard Preview</span></div>
          <h2 className="font-display font-bold text-[38px] md:text-[54px] lg:text-[60px] leading-[1.02] tracking-tight"><span className="text-gradient">The command centre for </span><span className="text-gradient-emerald">your climate portfolio.</span></h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }} className="relative rounded-3xl glass-strong p-4 sm:p-6 shadow-[0_40px_100px_-20px_rgba(16,185,129,0.35)]">
          {/* Top bar */}
          <div className="flex items-center justify-between px-2 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center"><Leaf className="h-4 w-4 text-white" strokeWidth={2.5} /></div>
              <div><div className="font-display font-semibold text-[14px] leading-tight">Portfolio Overview</div><div className="text-[11px] text-white/40">Q3 2025 · real-time</div></div>
            </div>
            <div className="flex items-center gap-2"><span className="hidden sm:inline text-[11px] text-white/40">Sitio Verde · admin@sitioverde.co</span><div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-[11px] font-bold">SV</div></div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-12 gap-4 pt-5">
            {/* KPI cards */}
            {[
              { icon: Wallet, label: 'Credit balance', v: '18,240', sub: '+312 this week', accent: 'from-emerald-400 to-teal-500' },
              { icon: TrendingUp, label: 'Revenue YTD', v: '$780,412', sub: '+18.2% QoQ', accent: 'from-teal-400 to-emerald-500' },
              { icon: Leaf, label: 'tCO₂ sequestered', v: '92,410', sub: 'across 6 plots', accent: 'from-lime-400 to-emerald-500' },
              { icon: Layers, label: 'Active plots', v: '6 / 8', sub: '2 pending audit', accent: 'from-emerald-500 to-cyan-500' },
            ].map((k, i) => {
              const Icon = k.icon;
              return (
                <div key={k.label} className="col-span-6 md:col-span-3 rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${k.accent} flex items-center justify-center`}><Icon className="h-4 w-4 text-white" strokeWidth={2.2} /></div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-white/50 font-medium">{k.label}</div>
                  <div className="font-display font-bold text-[22px] text-gradient-emerald tabular-nums leading-tight mt-0.5">{k.v}</div>
                  <div className="text-[10.5px] text-emerald-400/80 mt-0.5">{k.sub}</div>
                </div>
              );
            })}

            {/* Revenue chart */}
            <div className="col-span-12 lg:col-span-8 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <div><div className="font-display font-semibold text-[15px]">Credit revenue trend</div><div className="text-[11px] text-white/40">Rolling 8 months · USD</div></div>
                <span className="text-[10.5px] uppercase tracking-widest text-emerald-400/80 font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">+42%</span>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BAR} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs><linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#34d399" /><stop offset="1" stopColor="#059669" /></linearGradient></defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="m" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip cursor={{ fill: 'rgba(52,211,153,0.08)' }} contentStyle={{ background: '#062018', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, fontSize: 12 }} labelStyle={{ color: '#a7f3d0' }} formatter={(v)=>[`$${v}k`, 'Revenue']} />
                    <Bar dataKey="v" fill="url(#barGrad)" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Portfolio pie */}
            <div className="col-span-12 lg:col-span-4 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
              <div className="font-display font-semibold text-[15px] mb-1">Portfolio mix</div>
              <div className="text-[11px] text-white/40 mb-3">By ecosystem type</div>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE} dataKey="v" nameKey="n" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} stroke="none">
                      {PIE.map((e,i) => <Cell key={i} fill={e.c} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#062018', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, fontSize: 12 }} labelStyle={{ color: '#a7f3d0' }} formatter={(v)=>[`${v}%`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {PIE.map((p) => (<div key={p.n} className="flex items-center gap-1.5 text-[11px]"><span className="h-2 w-2 rounded-full" style={{ background: p.c }} /><span className="text-white/60">{p.n}</span><span className="text-white/40 tabular-nums ml-auto">{p.v}%</span></div>))}
              </div>
            </div>

            {/* Sparkline */}
            <div className="col-span-12 lg:col-span-7 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <div><div className="font-display font-semibold text-[15px]">Soil carbon curve (tCO₂/ha)</div><div className="text-[11px] text-white/40">Sitio Verde · Plot #SC-2831</div></div>
                <RadarIcon className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SPARK} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs><linearGradient id="gS" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#34d399" stopOpacity={0.55} /><stop offset="1" stopColor="#34d399" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="x" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: '#062018', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, fontSize: 12 }} labelStyle={{ color: '#a7f3d0' }} formatter={(v)=>[`${v.toFixed(1)} tCO₂`, 'Soil carbon']} />
                    <Area type="monotone" dataKey="y" stroke="#34d399" strokeWidth={2} fill="url(#gS)" isAnimationActive animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity */}
            <div className="col-span-12 lg:col-span-5 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
              <div className="flex items-center justify-between mb-3"><div className="font-display font-semibold text-[15px] flex items-center gap-2"><Bell className="h-4 w-4 text-emerald-400" /> Recent activity</div><span className="text-[11px] text-emerald-400">Live</span></div>
              <div className="space-y-3">
                {ACTIVITY.map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                    <div className="flex-1"><div className="text-[12.5px] text-white/80 leading-snug">{a.text}</div><div className="text-[10.5px] text-white/40 mt-0.5">{a.time}</div></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
