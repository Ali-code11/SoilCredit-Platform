'use client';
import { motion } from 'framer-motion';
import { Brain, Satellite, ShieldCheck, Store, LineChart, Activity, BarChart3, Zap, ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/providers';

const ICONS = [Brain, Satellite, ShieldCheck, Store, LineChart, Activity, BarChart3, Zap];

export default function Features() {
  const { t } = useLang();
  const items = (t('features.items') || []).map((f, i) => ({ title: f[0], desc: f[1], Icon: ICONS[i] || Brain }));
  return (
    <section id="features" className="relative py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-14">
          <span className="chip mb-4">{t('features.tag')}</span>
          <h2 className="font-display font-bold text-[34px] md:text-[52px] leading-[1.05] tracking-tight"><span className="text-gradient-bg">{t('features.title')}</span></h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {items.map((f, i) => {
            const Icon = f.Icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
                className="card-soft group p-5 cursor-pointer">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mb-4 shadow-md shadow-blue-500/15"><Icon className="h-4.5 w-4.5 text-white" strokeWidth={2.2} /></div>
                <div className="font-display font-semibold text-[16px] text-slate-900 mb-1.5">{f.title}</div>
                <div className="text-[13px] text-slate-600 leading-relaxed">{f.desc}</div>
                <div className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition">Learn more <ArrowRight className="h-3.5 w-3.5" /></div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
