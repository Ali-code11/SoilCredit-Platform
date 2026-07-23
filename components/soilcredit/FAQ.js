'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus } from 'lucide-react';

const FAQS = [
  { q: 'What exactly is a soil carbon credit?', a: 'One SoilCredit represents 1 tonne of CO₂-equivalent removed from the atmosphere and sequestered in soil, biomass or dead organic matter. Every credit is tied to a specific plot, a specific measurement period, and cryptographic proof of the underlying satellite + AI measurement.' },
  { q: 'How accurate is the AI measurement?', a: 'Our multimodal foundation model has been benchmarked at 96% agreement with in-situ soil sampling across 42 countries. We combine Sentinel-2 optical, Sentinel-1 SAR, Landsat thermal and Planet daily imagery, calibrated per biome. Every plot is ground-truthed at onboarding.' },
  { q: 'Which standards do you align with?', a: 'Verra VM0042, Gold Standard AR-ACM003, Plan Vivo, CCB and ISO 14064-2. Our on-chain proof is designed to be attached to any registry’s serialisation, so buyers get double assurance.' },
  { q: 'How do landowners get paid?', a: 'Quarterly, in USD, USDC or your local currency. Payments settle from the buyer directly to your wallet via smart contract. SoilCredit takes a transparent 8% platform fee — no hidden auction spreads.' },
  { q: 'What is the minimum land size?', a: 'We support plots from 5 hectares up to 100,000+ hectares. Cooperative aggregation makes SoilCredit viable for smallholders in Africa and Southeast Asia.' },
  { q: 'Is my data private?', a: 'Yes. Boundary shapefiles and ownership deeds are encrypted at rest. Only aggregated, anonymised statistics are shared with buyers unless you choose to publish full traceability.' },
  { q: 'Do you handle deforestation risk?', a: 'Continuously. Our real-time monitoring pushes alerts within 15 minutes of any detected clearing event, and reversal buffers are applied at portfolio level according to Verra guidance.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 mb-5"><HelpCircle className="h-3.5 w-3.5 text-emerald-300" /><span className="text-[11.5px] uppercase tracking-widest text-emerald-200/80 font-semibold">Questions</span></div>
          <h2 className="font-display font-bold text-[38px] md:text-[52px] leading-[1.02] tracking-tight"><span className="text-gradient">Everything you’ve wondered </span><span className="text-gradient-emerald">about carbon.</span></h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border transition ${open === i ? 'glass-strong border-emerald-400/30' : 'glass border-white/10 hover:border-emerald-400/20'}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left">
                <span className="font-display font-semibold text-[16.5px] tracking-tight text-white">{f.q}</span>
                <motion.div animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.25 }} className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${open === i ? 'bg-emerald-500/20 border border-emerald-400/40' : 'bg-white/[0.04] border border-white/10'}`}><Plus className="h-4 w-4 text-emerald-300" /></motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="px-6 pb-5 text-[14.5px] text-white/60 leading-relaxed">{f.a}</div>
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
