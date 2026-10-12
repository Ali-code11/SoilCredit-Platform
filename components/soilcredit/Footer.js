'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Send, CheckCircle2, Linkedin, ArrowRight, Instagram, Facebook } from 'lucide-react';
import { useLang } from '@/lib/providers';

export default function Footer() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const subscribe = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setSubmitting(true);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || t('footer.newsletterError'));
      setMessage(result.message || t('footer.newsletterSuccess'));
      setMessageType('success');
      setEmail('');
    } catch (error) {
      setMessage(error.message || t('footer.newsletterError'));
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <footer id="footer" className="relative bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-emerald-50 border border-slate-200 p-7 md:p-9 mb-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-[0_30px_60px_-30px_rgba(37,99,235,0.18)]">
          <div>
            <div className="font-display font-bold text-2xl text-gradient-bg mb-1">{t('footer.newsletter')}</div>
            <div className="text-slate-600 text-[14px]">{t('footer.newsletterHint')}</div>
          </div>
          <div className="w-full md:w-auto">
            <form onSubmit={subscribe} className="flex w-full gap-2">
              <motion.input whileFocus={{ scale: 1.01 }} type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@earth.co" className="field min-w-0 md:w-72" aria-label={t('footer.newsletterEmail')} />
              <motion.button type="submit" disabled={submitting} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="btn-primary inline-flex shrink-0 items-center gap-1.5 rounded-xl px-5 py-3 text-[13.5px] font-semibold disabled:cursor-wait disabled:opacity-60">
                {submitting ? t('footer.subscribing') : <>{t('footer.subscribe')} <Send className="h-4 w-4" /></>}
              </motion.button>
            </form>
            {message ? <p role={messageType === 'error' ? 'alert' : 'status'} className={`mt-2 text-sm ${messageType === 'error' ? 'text-rose-700' : 'text-emerald-700'}`}>{message}</p> : null}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-10 border-b border-slate-200">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center"><Leaf className="h-4 w-4 text-white" strokeWidth={2.5} /></div><span className="font-display font-bold text-lg text-gradient-blue">SoilCredit</span></div>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-3">{t('footer.tagline')}</p>
            <div className="flex gap-1.5">
  {[
    {
      icon: Instagram,
      url: "https://www.instagram.com/soilcredit/",
      name: "Instagram"
    },
    {
      icon: Linkedin,
      url: "https://www.linkedin.com/company/soilcredit",
      name: "LinkedIn"
    },
    {
      icon: Facebook,
      url: "https://www.facebook.com/profile.php?id=61583439600932&mibex-tid=ZbWKwL",
      name: "Facebook"
    }
  ].map(({ icon: Ic, url, name }) => (
    <a
      key={name}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:border-blue-300 hover:bg-blue-50 transition"
      aria-label={name}
    >
      <Ic className="h-3.5 w-3.5 text-slate-500" />
    </a>
  ))}
</div>
          </div>
          {[{ title: 'Product', links: ['Overview', t('nav.calc'), t('nav.market'), t('nav.dashboard')] }, { title: 'Company', links: ['About', 'Careers', 'Press', 'Contact'] }, { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] }].map((c, i) => (
            <div key={i}>
              <div className="text-[12px] uppercase font-semibold text-slate-500 tracking-widest mb-3">{c.title}</div>
              <ul className="space-y-2">{c.links.map((l, j) => (<li key={j}><motion.a whileHover={{ x: 4 }} href="#" className="text-[13px] text-slate-600 hover:text-blue-600 inline-flex items-center gap-1 group">{l}<ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></motion.a></li>))}</ul>
            </div>
          ))}
        </div>
        <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="text-[12px] text-slate-500">{t('footer.rights')}</div>
          <div className="text-[12px] text-slate-500 inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />soilcreditazerbaijan@gmail.com</div>
        </div>
      </div>
    </footer>
  );
}
