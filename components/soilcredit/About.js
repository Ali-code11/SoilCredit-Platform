'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Target, Eye, Zap, Users, Cpu, Leaf } from 'lucide-react';

const PILLARS = [
  { icon: Target, title: 'Mission', desc: 'Unlock the trillion-dollar carbon economy for the 570 million landowners overlooked by legacy credit systems.', accent: 'from-emerald-400 to-teal-500' },
  { icon: Eye, title: 'Vision', desc: 'A planet where every hectare of protected soil is measured, valued and rewarded in real time.', accent: 'from-teal-400 to-emerald-500' },
  { icon: Zap, title: 'Climate Impact', desc: 'Sequester 1 gigaton of CO₂ by 2035 through verified restoration partnerships across 60 countries.', accent: 'from-lime-400 to-emerald-500' },
  { icon: Cpu, title: 'Technology', desc: 'Multimodal AI + Sentinel-2/Landsat satellite feeds + zk-verified blockchain proofs.', accent: 'from-emerald-500 to-cyan-500' },
  { icon: Users, title: 'ESG Integration', desc: 'Native reporting for GRI, SASB, TCFD and EU CSRD — built for institutional investors.', accent: 'from-emerald-400 to-green-500' },
  { icon: Leaf, title: 'Regeneration', desc: 'Beyond offsetting: we fund regeneration. 92% of credit revenue flows back to communities.', accent: 'from-emerald-300 to-emerald-600' },
];

const TIMELINE = [
  { year: '2021', title: 'The founding thesis', desc: 'Started as a Stanford climate lab spin-out around SOC modeling.' },
  { year: '2022', title: 'First 1,000 hectares', desc: 'Piloted with Brazilian smallholder cooperatives in Pará.' },
  { year: '2023', title: 'Verra & Gold Standard alignment', desc: 'Achieved audit parity with the two dominant global registries.' },
  { year: '2024', title: '$18M Series A', desc: 'Led by Lowercarbon Capital with Sequoia Impact participation.' },
  { year: '2025', title: '42 countries live', desc: 'Now servicing 7,420 registered plots across 6 continents.' },
];

export default function About() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const midY = useTransform(scrollYProgress, [0, 1], [20, -70]);
  const textY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section ref={sectionRef} id="about" className="relative py-32 overflow-hidden bg-white">
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-1/3 -right-40 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px]" />
      </motion.div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div style={{ y: textY }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-120px' }} transition={{ duration: 0.7 }} className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 mb-5">
            <Leaf className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[11.5px] uppercase tracking-widest text-slate-700 font-semibold">About SoilCredit</span>
          </div>
          <h2 className="font-display font-bold text-[38px] md:text-[54px] lg:text-[62px] leading-[1.02] tracking-tight text-slate-900">
            <span className="text-gradient-bg">Climate infrastructure for the </span>
            <span className="text-gradient-green">next century.</span>
          </h2>
          <p className="mt-6 text-[17px] text-slate-600 leading-relaxed max-w-2xl">We are building the operating system for nature-based carbon — measured with science, verified on-chain, and paid out in dollars.</p>
        </motion.div>

        <div className="mb-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div key={p.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6, delay: i * 0.08 }} whileHover={{ y: -6, scale: 1.01 }} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_25px_50px_-28px_rgba(15,23,42,0.12)]">
                <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${p.accent} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />
                <div className={`relative h-12 w-12 rounded-xl bg-gradient-to-br ${p.accent} flex items-center justify-center mb-5 shadow-[0_8px_24px_-6px_rgba(52,211,153,0.4)]`}>
                  <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
                </div>
                <h3 className="font-display font-semibold text-[19px] tracking-tight mb-2 text-slate-900">{p.title}</h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 mb-4">
            <span className="text-[11.5px] uppercase tracking-widest text-slate-700 font-semibold">Our journey</span>
          </div>
          <h3 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-slate-900">From lab to launchpad</h3>
        </motion.div>

        <div ref={sectionRef} className="relative pl-6 md:pl-0">
          <motion.div style={{ y: midY }} className="absolute hidden md:block left-1/2 top-6 h-px w-[88%] -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
          <div className="grid gap-4 md:grid-cols-5 relative">
            {TIMELINE.map((t, i) => (
              <motion.div key={t.year} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="story-step relative">
                <div className="absolute -left-6 md:left-1/2 md:-translate-x-1/2 -top-1 md:top-0">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_16px_rgba(52,211,153,0.9)] border-2 border-white" />
                </div>
                <div className="md:pt-10">
                  <div className="text-[12px] uppercase tracking-[0.2em] font-bold text-emerald-600 mb-1">{t.year}</div>
                  <div className="font-display font-semibold text-[16px] mb-1 text-slate-900">{t.title}</div>
                  <div className="text-[13px] text-slate-600 leading-relaxed">{t.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
