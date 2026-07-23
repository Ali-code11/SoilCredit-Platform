'use client';
import { motion } from 'framer-motion';
import { Building2, Landmark, GraduationCap, Wallet, Globe, Award, Sprout, ShieldCheck } from 'lucide-react';

const LOGOS = [
  { icon: Building2, label: 'World Bank' },
  { icon: Landmark, label: 'UN Climate' },
  { icon: GraduationCap, label: 'Stanford' },
  { icon: Wallet, label: 'Lowercarbon' },
  { icon: Globe, label: 'GEF' },
  { icon: Award, label: 'Verra' },
  { icon: Sprout, label: 'Gold Standard' },
  { icon: ShieldCheck, label: 'CCB Alliance' },
  { icon: Building2, label: 'BlackRock ESG' },
  { icon: GraduationCap, label: 'Oxford Env.' },
  { icon: Landmark, label: 'EU Climate' },
  { icon: Wallet, label: 'Sequoia Impact' },
];

export default function Partners() {
  const doubled = [...LOGOS, ...LOGOS];
  return (
    <section className="relative py-24 overflow-hidden border-y border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-10">
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-semibold">Trusted by governments, NGOs, universities and $12B+ in ESG capital</div>
        </motion.div>
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#04140D] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#04140D] to-transparent z-10" />
        <motion.div className="flex gap-4 py-2" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 40, ease: 'linear', repeat: Infinity }}>
          {doubled.map((L, i) => {
            const Icon = L.icon;
            return (
              <div key={i} className="shrink-0 flex items-center gap-2.5 rounded-2xl glass px-6 py-4 min-w-[220px] hover:border-emerald-400/30 transition">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center"><Icon className="h-4 w-4 text-emerald-300" /></div>
                <span className="font-display font-semibold text-[15px] text-white/70">{L.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
