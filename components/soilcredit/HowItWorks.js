'use client';
import { motion } from 'framer-motion';
import { MapPin, Satellite, Brain, Leaf, ShieldCheck, Store, TrendingUp, Layers } from 'lucide-react';

const STEPS = [
  { icon: MapPin, title: 'Land Registration', desc: 'Onboard your parcel in minutes — draw boundaries, upload deeds, choose forest type.', tag: 'Step 01' },
  { icon: Satellite, title: 'Satellite Data Collection', desc: 'Sentinel-2 & Landsat imagery streams into your plot every 5 days. Hyperspectral, LiDAR ready.', tag: 'Step 02' },
  { icon: Brain, title: 'AI Analysis', desc: 'Our multimodal model computes NDVI, biomass, moisture and soil organic carbon with 96% accuracy.', tag: 'Step 03' },
  { icon: Leaf, title: 'Carbon Estimation', desc: 'Get verified tCO₂e estimates aligned with Verra VM0042, Gold Standard and ISO 14064-2.', tag: 'Step 04' },
  { icon: ShieldCheck, title: 'Blockchain Verification', desc: 'Each credit is minted as an immutable NFT with cryptographic proof of measurement.', tag: 'Step 05' },
  { icon: Store, title: 'ESG Marketplace', desc: 'List credits directly to institutional buyers, ESG funds and net-zero corporates.', tag: 'Step 06' },
  { icon: TrendingUp, title: 'Revenue Generation', desc: 'Automated settlements. Get paid quarterly. Track earnings in your climate dashboard.', tag: 'Step 07' },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 radial-glow opacity-60" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }} className="max-w-3xl mb-20">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 mb-5">
            <Layers className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[11.5px] uppercase tracking-widest text-emerald-200/80 font-semibold">The Workflow</span>
          </div>
          <h2 className="font-display font-bold text-[38px] md:text-[54px] lg:text-[62px] leading-[1.02] tracking-tight text-gradient">From soil to settlement,<br /><span className="text-gradient-emerald">in seven verified steps.</span></h2>
          <p className="mt-6 text-[17px] text-white/60 leading-relaxed max-w-2xl">A vertically integrated pipeline — from raw satellite pixels to on-chain credits ready for institutional buyers. Every step is auditable, automatic and aligned with global carbon standards.</p>
        </motion.div>
        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-px -translate-x-1/2 hidden sm:block">
            <div className="h-full w-px bg-gradient-to-b from-emerald-400/0 via-emerald-400/40 to-emerald-400/0" />
            <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 2.4, ease: 'easeOut' }}
              style={{ transformOrigin: 'top' }}
              className="absolute inset-0 w-px bg-gradient-to-b from-emerald-400 via-emerald-300 to-emerald-400/0 shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
          </div>
          <div className="space-y-8 md:space-y-14">
            {STEPS.map((s, i) => {
              const Icon = s.icon; const left = i % 2 === 0;
              return (
                <motion.div key={s.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: i * 0.05 }}
                  className={`relative grid md:grid-cols-2 items-center gap-6 ${left ? '' : 'md:[&>div:first-child]:order-2'}`}>
                  <div className={`${left ? 'md:pr-14 md:text-right' : 'md:pl-14'} pl-16 sm:pl-20 md:pl-0`}>
                    <div className="feature-card rounded-2xl glass p-6 sm:p-7 hover:bg-white/[0.04] transition">
                      <div className={`flex items-center gap-3 mb-3 ${left ? 'md:justify-end' : ''}`}><span className="text-[10.5px] uppercase tracking-[0.2em] font-semibold text-emerald-400/80">{s.tag}</span></div>
                      <h3 className="font-display font-bold text-2xl md:text-[26px] tracking-tight mb-2 text-gradient">{s.title}</h3>
                      <p className="text-[15px] text-white/60 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-2xl bg-emerald-400/30 blur-xl" />
                      <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(52,211,153,0.7)] border border-emerald-300/40"><Icon className="h-5 w-5 text-white" strokeWidth={2.2} /></div>
                    </div>
                  </div>
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
