'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useLang } from '@/lib/providers';

export default function FAQ() {
  const { t } = useLang();
  const items = t('faq.items') || [];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative py-24 md:py-32 bg-gradient-to-b from-white to-slate-50/60">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <span className="chip mb-4">{t('faq.tag')}</span>
          <h2 className="font-display font-bold text-[32px] md:text-[48px] leading-[1.05] tracking-tight"><span className="text-gradient-bg">{t('faq.title')}</span></h2>
        </motion.div>
        <div className="space-y-3">
          {items.map(([q, a], i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className={`rounded-2xl border transition ${open === i ? 'bg-white border-blue-200 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left">
                <span className="font-display font-semibold text-[15.5px] text-slate-900">{q}</span>
                <motion.div animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.25 }} className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${open === i ? 'bg-gradient-to-br from-blue-500 to-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}><Plus className="h-4 w-4" /></motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden">
                    <div className="px-5 pb-4 text-[14px] text-slate-600 leading-relaxed">{a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
