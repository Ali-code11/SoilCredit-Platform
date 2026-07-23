'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, ArrowRight, Twitter, Linkedin, Github, Youtube, Send, CheckCircle2 } from 'lucide-react';

const COLS = [
  { title: 'Product', links: ['Overview', 'How it works', 'Carbon Calculator', 'Marketplace', 'Dashboard', 'API'] },
  { title: 'For landowners', links: ['Register land', 'Verification', 'Pricing', 'Payouts', 'Community', 'Help center'] },
  { title: 'For investors', links: ['ESG marketplace', 'Portfolio tools', 'Impact reporting', 'Institutional', 'Compliance', 'Case studies'] },
  { title: 'Company', links: ['About', 'Mission', 'Careers', 'Press', 'Contact', 'Investors'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'Security', 'DPA', 'Sub-processors'] },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [ok, setOk] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    try {
      await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      setOk(true); setEmail('');
      setTimeout(() => setOk(false), 4000);
    } catch {}
  };

  return (
    <footer className="relative border-t border-white/5 pt-24 pb-10 overflow-hidden">
      <div className="absolute inset-0 -z-10 radial-glow-bottom" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter callout */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="rounded-3xl glass-strong p-8 md:p-10 mb-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-gradient mb-2">Stay in the loop.</h3>
            <p className="text-white/60 text-[14.5px] leading-relaxed">Monthly climate briefings, satellite drops and product releases. No spam, ever.</p>
          </div>
          <form onSubmit={subscribe} className="flex w-full md:w-auto items-center gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@planet.earth" required
              className="flex-1 md:w-72 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 focus:border-emerald-400/40 focus:outline-none text-[13.5px] placeholder:text-white/30" />
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-[#04140D] px-5 py-3 text-[13.5px] font-semibold btn-glow">
              {ok ? (<><CheckCircle2 className="h-4 w-4" /> Subscribed</>) : (<>Subscribe <Send className="h-4 w-4" /></>)}
            </button>
          </form>
        </motion.div>

        {/* Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-white/10">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 lg:pr-6">
            <a href="#home" className="inline-flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30"><Leaf className="h-5 w-5 text-white" strokeWidth={2.5} /></div>
              <span className="font-display font-bold text-[17px] tracking-tight">SoilCredit</span>
            </a>
            <p className="text-[13px] text-white/50 leading-relaxed mb-4">Climate infrastructure for the next century. Measured with science, verified on-chain, paid in dollars.</p>
            <div className="flex items-center gap-1.5">
              {[Twitter, Linkedin, Github, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-lg glass flex items-center justify-center hover:border-emerald-400/40 hover:bg-emerald-500/10 transition group"><Icon className="h-3.5 w-3.5 text-white/60 group-hover:text-emerald-300 transition" /></a>
              ))}
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <div className="text-[11.5px] uppercase tracking-widest font-semibold text-white/50 mb-4">{c.title}</div>
              <ul className="space-y-2.5">
                {c.links.map((l) => (<li key={l}><a href="#" className="text-[13px] text-white/70 hover:text-emerald-300 transition inline-flex items-center gap-1 group">{l}<ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></a></li>))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8">
          <div className="text-[12.5px] text-white/40">© 2025 SoilCredit, PBC · Built for the biosphere · Public Benefit Corporation</div>
          <div className="flex items-center gap-5 text-[12.5px] text-white/50">
            <a href="#" className="hover:text-emerald-300 transition">Privacy</a>
            <a href="#" className="hover:text-emerald-300 transition">Terms</a>
            <a href="#" className="hover:text-emerald-300 transition">Security</a>
            <a href="#" className="hover:text-emerald-300 transition">Status</a>
            <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> All systems normal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
