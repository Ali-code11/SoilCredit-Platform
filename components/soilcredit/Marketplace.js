'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ShieldCheck, ArrowUpRight, Coins, Leaf } from 'lucide-react';
import { useLang, useAuth } from '@/lib/providers';

export default function Marketplace({ onOpenAuth }) {
  const { t } = useLang();
  const { user, apiFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [buying, setBuying] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => fetch('/api/marketplace').then(r => r.json()).then(d => setItems(d.listings || []));
  useEffect(() => { load(); }, []);

  const filtered = items.filter(l => !q || (l.name || '').toLowerCase().includes(q.toLowerCase()) || (l.location || '').toLowerCase().includes(q.toLowerCase()));

  const buy = async (land) => {
    if (!user) { onOpenAuth?.('login'); return; }
    if (user.role !== 'company') { setMsg('Only companies can purchase credits'); setTimeout(() => setMsg(''), 3000); return; }
    const qty = Math.min(land.creditsAvailable || 1, 10);
    setBuying(land.id);
    const d = await apiFetch('/api/purchase', { method: 'POST', body: JSON.stringify({ landId: land.id, quantity: qty }) });
    if (d.ok) { setMsg(`✓ Purchased ${qty} credits from ${land.name}`); load(); }
    else setMsg(d.error || 'Purchase failed');
    setBuying(null); setTimeout(() => setMsg(''), 3500);
  };

  return (
    <section id="marketplace" className="relative py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-10">
          <span className="chip mb-4">{t('market.tag')}</span>
          <h2 className="font-display font-bold text-[34px] md:text-[52px] leading-[1.05] tracking-tight"><span className="text-gradient-bg">{t('market.title')}</span></h2>
          <p className="mt-5 text-slate-600 text-[16px] leading-relaxed">{t('market.subtitle')}</p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-3 mb-6 max-w-2xl mx-auto">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('market.search')} className="field pl-10" />
          </div>
        </div>

        {msg && <div className="max-w-2xl mx-auto mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px]">{msg}</div>}

        {filtered.length === 0 ? (
          <div className="card-soft py-16 text-center max-w-xl mx-auto">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-4"><Leaf className="h-6 w-6 text-blue-500" /></div>
            <div className="text-slate-600 text-[14.5px]">{t('market.empty')}</div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((l, i) => (
                <motion.div key={l.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, delay: (i % 6) * 0.04 }}
                  className="card-soft overflow-hidden">
                  <div className="relative h-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-emerald-400 to-emerald-500" />
                    <div className="absolute inset-0 grid-bg-light opacity-30" />
                    <div className="absolute top-3 left-3 chip !bg-white/95 !border-white"><ShieldCheck className="h-3 w-3" /> Verified</div>
                    <div className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 border border-white text-[11px] font-semibold text-blue-600">{t('market.esg')} 94+</div>
                  </div>
                  <div className="p-5">
                    <div className="font-display font-semibold text-[17px] text-slate-900 leading-snug mb-1">{l.name}</div>
                    <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500 mb-3"><MapPin className="h-3 w-3" /> {l.location || '—'} · {Number(l.area || 0).toLocaleString()} {t('market.ha')}</div>
                    <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-slate-100">
                      <div><div className="text-[10.5px] text-slate-400 uppercase tracking-widest">{t('market.credits')}</div><div className="font-display font-bold text-lg text-slate-900 tabular-nums">{Math.round(l.creditsAvailable || 0).toLocaleString()}</div></div>
                      <div><div className="text-[10.5px] text-slate-400 uppercase tracking-widest">{t('market.per')}</div><div className="font-display font-bold text-lg text-gradient-green tabular-nums">${(l.priceCredit || 42.8).toFixed(2)}</div></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{(l.ownerName || '?').split(' ').map(w => w[0]).slice(0,2).join('')}</div>
                        <span className="text-[12px] text-slate-500 truncate">{l.ownerName}</span>
                      </div>
                      <button onClick={() => buy(l)} disabled={buying === l.id || (l.creditsAvailable || 0) <= 0} className="btn-primary inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-[12px] font-semibold disabled:opacity-60">
                        {buying === l.id ? '…' : t('market.buy')} <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
