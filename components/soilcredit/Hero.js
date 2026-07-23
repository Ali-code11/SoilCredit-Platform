'use client';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Calculator } from 'lucide-react';
import { useLang } from '@/lib/providers';

export default function Hero({ onOpenAuth }) {
  const { t, lang } = useLang();
  return (
    <section id="home" className="relative pt-28 md:pt-36 pb-20 md:pb-28 overflow-hidden hero-bg">
      <div className="absolute inset-0 grid-bg-light" />
      <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-blue-400/15 blur-[100px] animate-float-slow" />
      <div className="absolute bottom-1/4 -right-24 h-80 w-80 rounded-full bg-emerald-400/15 blur-[100px] animate-float" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="chip"><span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-700 px-1 rounded">{lang.toUpperCase()}</span> {t('hero.pill')}</span>
          <span className="chip chip-green"><Sparkles className="h-3 w-3" /> {t('hero.new')}</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
          className="font-display font-bold text-[44px] sm:text-[64px] lg:text-[86px] leading-[0.98] tracking-tight">
          <span className="text-gradient-blue">{t('hero.title1')}</span>
          <br />
          <span className="text-gradient-green">{t('hero.title2')}</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-8 text-[16px] md:text-[18px] text-slate-600 max-w-3xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => onOpenAuth?.('signup')} className="btn-primary group inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold">
            {t('hero.cta1')} <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" strokeWidth={2.5} />
          </button>
          <a href="#marketplace" className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50 px-6 py-3.5 text-[15px] font-semibold text-slate-800 transition">
            {t('hero.cta2')}
          </a>
          <a href="#calculator" className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 px-6 py-3.5 text-[15px] font-semibold text-slate-800 transition">
            <Calculator className="h-4 w-4 text-emerald-500" /> {t('hero.cta3')}
          </a>
        </motion.div>

        {/* Small trust bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 dot-live" /> Verra VM0042</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Gold Standard</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> ISO 14064-2</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> COP29 aligned</span>
        </motion.div>
      </div>
    </section>
  );
}
