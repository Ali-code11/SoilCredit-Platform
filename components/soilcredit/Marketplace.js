'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, TrendingUp, ShieldCheck, MapPin, ArrowUpRight, Flame, Sparkles, CheckCircle2, Store } from 'lucide-react';

const STATUS_MAP = {
  verified: { icon: CheckCircle2, label: 'Verified', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30' },
  trending: { icon: TrendingUp, label: 'Trending', color: 'text-teal-300 bg-teal-500/15 border-teal-400/30' },
  hot: { icon: Flame, label: 'Hot', color: 'text-amber-300 bg-amber-500/15 border-amber-400/30' },
  new: { icon: Sparkles, label: 'New', color: 'text-cyan-300 bg-cyan-500/15 border-cyan-400/30' },
};

const FILTERS = ['All', 'Primary Forest', 'Grassland', 'Peatland', 'Mangrove', 'Agroforestry', 'Cloud Forest'];

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/marketplace').then((r) => r.json()).then((d) => setListings(d.listings || [])).catch(() => {});
  }, []);

  const filtered = listings.filter((l) => (filter === 'All' || l.category === filter) && (search === '' || l.title.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase())));

  return (
    <section id="marketplace" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10"><div className="absolute top-0 left-1/2 -translate-x-1/2 h-[420px] w-[900px] rounded-full bg-emerald-500/10 blur-[120px]" /></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 mb-5"><Store className="h-3.5 w-3.5 text-emerald-300" /><span className="text-[11.5px] uppercase tracking-widest text-emerald-200/80 font-semibold">Live Marketplace</span></div>
            <h2 className="font-display font-bold text-[38px] md:text-[54px] leading-[1.02] tracking-tight"><span className="text-gradient">Buy verified credits from </span><span className="text-gradient-emerald">real ecosystems.</span></h2>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-white/60"><TrendingUp className="h-4 w-4 text-emerald-400" /> Average price up 18.2% QoQ</div>
        </motion.div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ecosystem or location…"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-emerald-400/40 focus:outline-none text-[13.5px] placeholder:text-white/30 transition" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-white/40 mr-1" />
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3.5 py-2 rounded-lg text-[12.5px] font-medium border transition ${filter === f ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200' : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white/90 hover:border-emerald-400/30'}`}>{f}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((l, i) => {
              const S = STATUS_MAP[l.status] || STATUS_MAP.verified; const SIcon = S.icon;
              return (
                <motion.div key={l.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, delay: (i % 6) * 0.04 }}
                  className="feature-card group relative rounded-2xl glass overflow-hidden hover:bg-white/[0.04] transition">
                  {/* Header image / gradient */}
                  <div className="relative h-40 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/40 via-emerald-700/30 to-[#04140D]" />
                    <div className="absolute inset-0 grid-bg opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">{l.flag}</div>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold border ${S.color}`}><SIcon className="h-3 w-3" /> {S.label}</span>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold border bg-black/40 border-white/10 text-white/80"><ShieldCheck className="h-3 w-3" /> {l.tag}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="rounded-full bg-black/50 backdrop-blur px-2.5 py-1 border border-white/10">
                        <div className="flex items-center gap-1"><span className="text-[9px] uppercase tracking-widest text-white/50">ESG</span><span className="font-display font-bold text-[13.5px] text-emerald-300 tabular-nums">{l.esg}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10.5px] uppercase tracking-widest text-emerald-400/80 font-semibold">{l.id}</span>
                      <span className="text-[10.5px] text-white/40">{l.category}</span>
                    </div>
                    <h3 className="font-display font-semibold text-[17px] tracking-tight mb-1 text-white leading-snug">{l.title}</h3>
                    <div className="flex items-center gap-1.5 text-[12px] text-white/50 mb-4"><MapPin className="h-3 w-3" /> {l.location} · {l.area.toLocaleString()} ha</div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div><div className="text-[10.5px] text-white/40 uppercase tracking-widest mb-0.5">Credits</div><div className="font-display font-bold text-lg text-gradient tabular-nums">{l.credits.toLocaleString()}</div></div>
                      <div><div className="text-[10.5px] text-white/40 uppercase tracking-widest mb-0.5">Price / credit</div><div className="font-display font-bold text-lg text-gradient-emerald tabular-nums">${l.price.toFixed(2)}</div></div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-[10px] font-bold text-white">{l.owner.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                        <span className="text-[11.5px] text-white/60">{l.owner}</span>
                      </div>
                      <button className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-300 hover:text-emerald-200 group/btn">Buy <ArrowUpRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition" /></button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
