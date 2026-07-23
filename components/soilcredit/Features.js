'use client';
import { motion } from 'framer-motion';
import { Brain, Satellite, ShieldCheck, Store, LineChart, Activity, BarChart3, Zap, Cpu, ArrowRight } from 'lucide-react';

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

export default function Features() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10"><div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-emerald-500/10 blur-[120px]" /></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }} className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 mb-5"><Cpu className="h-3.5 w-3.5 text-emerald-300" /><span className="text-[11.5px] uppercase tracking-widest text-emerald-200/80 font-semibold">Platform Capabilities</span></div>
            <h2 className="font-display font-bold text-[38px] md:text-[52px] lg:text-[58px] leading-[1.02] tracking-tight"><span className="text-gradient">Everything you need to measure,</span> <span className="text-gradient-emerald">verify and sell carbon.</span></h2>
          </div>
          <p className="text-[15.5px] text-white/60 max-w-sm leading-relaxed">A modular stack built for landowners, funds and climate scientists. Enterprise-grade infrastructure, consumer-grade UX.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
                className="feature-card group relative rounded-2xl glass p-6 h-full cursor-pointer overflow-hidden">
                <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />
                <div className={`relative h-11 w-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-[0_8px_24px_-6px_rgba(52,211,153,0.4)]`}><Icon className="h-5 w-5 text-white" strokeWidth={2.2} /></div>
                <h3 className="font-display font-semibold text-[17px] tracking-tight mb-2 text-white">{f.title}</h3>
                <p className="text-[13.5px] text-white/55 leading-relaxed">{f.desc}</p>
                <div className="relative mt-5 flex items-center gap-1.5 text-[12px] font-medium text-emerald-400/0 group-hover:text-emerald-400 transition-colors">Learn more <ArrowRight className="h-3.5 w-3.5" /></div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
