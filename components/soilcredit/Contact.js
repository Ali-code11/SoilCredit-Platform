'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, MessageSquare, Twitter, Linkedin, Github } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [errs, setErrs] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.name.trim()) errors.name = 'Required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.email = 'Valid email required';
    if (form.message.trim().length < 10) errors.message = 'Please share a bit more';
    setErrs(errors);
    if (Object.keys(errors).length) return;
    setState('sending');
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await r.json();
      if (d.ok) { setState('sent'); setForm({ name: '', email: '', company: '', message: '' }); } else setState('error');
    } catch { setState('error'); }
  };

  return (
    <section id="contact" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10"><div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[900px] rounded-full bg-emerald-500/10 blur-[120px]" /></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7 }} className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 mb-5"><MessageSquare className="h-3.5 w-3.5 text-emerald-300" /><span className="text-[11.5px] uppercase tracking-widest text-emerald-200/80 font-semibold">Let’s talk</span></div>
          <h2 className="font-display font-bold text-[38px] md:text-[54px] leading-[1.02] tracking-tight"><span className="text-gradient">Landowner, investor or press — </span><span className="text-gradient-emerald">we’d love to hear from you.</span></h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Contact form */}
          <motion.form onSubmit={submit} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="lg:col-span-3 rounded-3xl glass-strong p-7 md:p-9 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Your name" err={errs.name}>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ada Lovelace" className="input" />
              </Field>
              <Field label="Email" err={errs.email}>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ada@planet.earth" className="input" />
              </Field>
            </div>
            <Field label="Company / organisation (optional)">
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Sitio Verde Cooperative" className="input" />
            </Field>
            <Field label="How can we help?" err={errs.message}>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Tell us about your land, your fund, or your question…" className="input resize-none" />
            </Field>
            <div className="flex items-center gap-4">
              <button type="submit" disabled={state === 'sending'} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-[#04140D] px-6 py-3.5 text-[14.5px] font-semibold btn-glow disabled:opacity-70">
                {state === 'sending' ? (<><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>) : state === 'sent' ? (<><CheckCircle2 className="h-4 w-4" /> Message received</>) : (<>Send message <Send className="h-4 w-4" /></>)}
              </button>
              {state === 'sent' && <span className="text-[12.5px] text-emerald-300">We’ll get back within 24h.</span>}
              {state === 'error' && <span className="text-[12.5px] text-rose-400">Something went wrong. Please retry.</span>}
            </div>
            <style jsx>{`
              .input {
                width: 100%;
                padding: 0.85rem 1rem;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 0.75rem;
                color: white;
                font-size: 14px;
                transition: border-color 0.2s, background 0.2s;
              }
              .input::placeholder { color: rgba(255,255,255,0.3); }
              .input:focus { outline: none; border-color: rgba(52,211,153,0.5); background: rgba(52,211,153,0.04); }
            `}</style>
          </motion.form>

          {/* Contact info + map */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl glass p-6 space-y-4">
              <InfoRow icon={Mail} label="Email" value="hello@soilcredit.earth" />
              <InfoRow icon={Phone} label="Phone" value="+1 (415) 555-0198" />
              <InfoRow icon={MapPin} label="Head office" value="445 Bryant St, San Francisco, CA 94107" />
            </div>

            {/* Map placeholder */}
            <div className="rounded-3xl glass overflow-hidden relative aspect-[4/3]">
              <div className="absolute inset-0 grid-bg opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-400/40 blur-2xl animate-pulse" />
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-2xl"><MapPin className="h-6 w-6 text-white" strokeWidth={2.2} /></div>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 rounded-xl glass-strong px-3 py-2">
                <div className="text-[10px] uppercase tracking-widest text-white/40">Coordinates</div>
                <div className="font-mono text-[12px] text-emerald-300">37.7828° N, 122.3961° W</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SocialIcon icon={Twitter} />
              <SocialIcon icon={Linkedin} />
              <SocialIcon icon={Github} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, err, children }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12.5px] font-medium text-white/70">{label}</span>
        {err && <span className="text-[11px] text-rose-400">{err}</span>}
      </div>
      {children}
    </label>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center shrink-0"><Icon className="h-4 w-4 text-emerald-300" /></div>
      <div><div className="text-[11px] uppercase tracking-widest text-white/40 font-semibold">{label}</div><div className="text-[14px] text-white/90 mt-0.5">{value}</div></div>
    </div>
  );
}

function SocialIcon({ icon: Icon }) {
  return (
    <a href="#" className="h-11 w-11 rounded-2xl glass flex items-center justify-center hover:border-emerald-400/40 hover:bg-emerald-500/10 transition group">
      <Icon className="h-4 w-4 text-white/60 group-hover:text-emerald-300 transition" />
    </a>
  );
}
