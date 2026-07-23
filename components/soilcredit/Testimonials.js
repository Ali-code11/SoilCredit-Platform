'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const QUOTES = [
  { name: 'Amara Okafor', role: 'Director, Africa Regeneration Fund', quote: 'SoilCredit reduced our verification cycle from 14 months to 12 weeks. The audit-grade data quality is unlike anything I have seen in the voluntary market.', rating: 5, hue: 'from-emerald-400 to-teal-600' },
  { name: 'Lars Bergström', role: 'Estate owner, North Karelia', quote: 'I inherited 1,780 hectares of peatland from my grandfather. In one afternoon I onboarded it and now earn over $60K/year without touching a single tree.', rating: 5, hue: 'from-teal-400 to-emerald-600' },
  { name: 'Dr. Priya Raman', role: 'Head of Climate Science, Oxford Environmental', quote: 'The multimodal AI pipeline consistently outperforms our lab-based SOC estimates. This is a genuine breakthrough for MRV.', rating: 5, hue: 'from-lime-400 to-emerald-600' },
  { name: 'Rafael Chen', role: 'ESG Portfolio Manager, Blackrock Alternatives', quote: 'Institutional-grade provenance, low friction settlement, and 99.4% audit pass rate. We shifted $80M into SoilCredit sourced credits last quarter.', rating: 5, hue: 'from-emerald-500 to-cyan-500' },
  { name: 'Josephine Muturi', role: 'Chair, Kikuyu Farmers Union', quote: 'For the first time, our 3,400 farmers are paid directly for regeneration. The mobile app translates satellite alerts into Swahili in real time.', rating: 5, hue: 'from-emerald-400 to-green-600' },
];

export default function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % QUOTES.length), 6000); return () => clearInterval(t); }, []);
  const prev = () => setI((v) => (v - 1 + QUOTES.length) % QUOTES.length);
  const next = () => setI((v) => (v + 1) % QUOTES.length);
  const q = QUOTES[i];

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10"><div className="absolute inset-0 radial-glow opacity-40" /></div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }} className="max-w-3xl mb-12 mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 mb-5"><Quote className="h-3.5 w-3.5 text-emerald-300" /><span className="text-[11.5px] uppercase tracking-widest text-emerald-200/80 font-semibold">Loved by the climate community</span></div>
          <h2 className="font-display font-bold text-[38px] md:text-[52px] leading-[1.02] tracking-tight"><span className="text-gradient">The words of the people </span><span className="text-gradient-emerald">rebuilding our biosphere.</span></h2>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.98 }} transition={{ duration: 0.5 }}
              className="rounded-3xl glass-strong p-8 md:p-14 relative overflow-hidden">
              <Quote className="absolute top-6 right-8 h-24 w-24 text-emerald-400/10" />
              <div className="flex gap-1 mb-6">{Array.from({ length: q.rating }).map((_, k) => <Star key={k} className="h-4 w-4 fill-emerald-400 text-emerald-400" />)}</div>
              <p className="font-display text-2xl md:text-3xl lg:text-[34px] leading-[1.35] tracking-tight text-white/90 max-w-4xl">“{q.quote}”</p>
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4">
                <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${q.hue} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>{q.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                <div><div className="font-display font-semibold text-[16px]">{q.name}</div><div className="text-[12.5px] text-white/50">{q.role}</div></div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1.5">{QUOTES.map((_, k) => (<button key={k} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-8 bg-emerald-400' : 'w-1.5 bg-white/20 hover:bg-white/40'}`} />))}</div>
            <div className="flex items-center gap-2">
              <button onClick={prev} className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={next} className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
