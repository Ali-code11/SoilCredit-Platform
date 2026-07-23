'use client';
import { motion } from 'framer-motion';
import { MapPin, Satellite, Brain, Leaf, ShieldCheck, Store, TrendingUp } from 'lucide-react';
import { useLang } from '@/lib/providers';

const ICONS = [MapPin, Satellite, Brain, Leaf, ShieldCheck, Store, TrendingUp];

export default function HowItWorks() {
  const { t } = useLang();
  const steps = (t('how.steps') || []).map((s, i) => ({ title: s[0], desc: s[1], Icon: ICONS[i] || Leaf }));

  return (
    <section id="how" className="relative py-24 md:py-32 bg-gradient-to-b from-slate-50/60 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="chip mb-4">{t('how.tag')}</span>
          <h2 className="font-display font-bold text-[34px] md:text-[52px] leading-[1.05] tracking-tight"><span className="text-gradient-bg">{t('how.title')}</span></h2>
          <p className="mt-5 text-slate-600 text-[16px] leading-relaxed">{t('how.subtitle')}</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-px -translate-x-1/2 hidden sm:block bg-gradient-to-b from-blue-200 via-emerald-200 to-transparent" />
          <div className="space-y-6 md:space-y-10">
            {steps.map((s, i) => {
              const Icon = s.Icon; const left = i % 2 === 0;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, delay: i * 0.04 }}
                  className={`relative grid md:grid-cols-2 items-center gap-4 ${left ? '' : 'md:[&>div:first-child]:order-2'}`}>
                  <div className={`${left ? 'md:pr-12 md:text-right' : 'md:pl-12'} pl-16 sm:pl-20 md:pl-0`}>
                    <div className="card-soft p-5 md:p-6">
                      <div className={`text-[10.5px] uppercase tracking-[0.2em] font-semibold text-blue-500 mb-2 ${left ? 'md:text-right' : ''}`}>Step {String(i+1).padStart(2, '0')}</div>
                      <h3 className="font-display font-bold text-[19px] md:text-[22px] tracking-tight mb-1.5 text-slate-900">{s.title}</h3>
                      <p className="text-[14px] text-slate-600 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-[0_10px_28px_-8px_rgba(37,99,235,0.55)] border-4 border-white"><Icon className="h-5 w-5 text-white" strokeWidth={2.2} /></div>
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
