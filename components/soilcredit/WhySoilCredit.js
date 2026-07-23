'use client';
import { motion } from 'framer-motion';
import { Satellite, ShieldCheck, Store, Landmark } from 'lucide-react';
import { useLang } from '@/lib/providers';

const ICONS = [Satellite, ShieldCheck, Store, Landmark];

export default function WhySoilCredit() {
  const { t } = useLang();
  const items = t('why.items') || [];
  return (
    <section id="why" className="relative py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-14">
          <span className="chip mb-4">{t('why.tag')}</span>
          <h2 className="font-display font-bold text-[34px] md:text-[52px] leading-[1.05] tracking-tight"><span className="text-gradient-bg">{t('why.title')}</span></h2>
          <p className="mt-5 text-slate-600 text-[16px] leading-relaxed">{t('why.subtitle')}</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {items.map((it, i) => {
            const Icon = ICONS[i] || Satellite;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}
                className="card-soft p-6">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mb-4 shadow-md shadow-blue-500/20">
                  <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
                </div>
                <div className="font-display font-semibold text-[17px] tracking-tight mb-1.5 text-slate-900">{it.t}</div>
                <div className="text-[13.5px] text-slate-600 leading-relaxed">{it.d}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
